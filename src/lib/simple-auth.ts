import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export const AUTH_COOKIE_NAME = "infi_auth";

const AUTH_FILE_PATH = path.join(process.cwd(), "data", "auth-users.json");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type AuthDeviceStatus = "active" | "pending" | "fixed" | "blocked";

export type AuthDeviceRecord = {
  id: string;
  status: AuthDeviceStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  loginCount: number;
  ip?: string;
  userAgent?: string;
};

type AuthUserRecord = {
  email: string;
  boundDeviceId?: string;
  boundIp?: string;
  fixedDeviceId?: string;
  fixedAt?: string;
  devices?: AuthDeviceRecord[];
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
};

export type RegistrationPlan = "basic" | "pro";

export type RegistrationRequest = {
  email: string;
  phone: string;
  plan: RegistrationPlan;
  wantsMentor?: boolean;
  basePriceIls?: number;
  mentorPriceIls?: number;
  planPriceIls: number;
  totalPriceIls: number;
  createdAt: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentPageUrl?: string;
  lastPaymentActionAt?: string;
  ip?: string;
  userAgent?: string;
};

export type PaymentMethod = "bit" | "paybox" | "credit";
export type PaymentActionType = "manual_instructions_shown" | "payment_link_opened";
export type PaymentStatus = "pending" | "manual_pending" | "payment_link_opened";

export type PaymentActionRecord = {
  id: string;
  email: string;
  phone?: string;
  plan: RegistrationPlan;
  amountIls: number;
  method: PaymentMethod;
  action: PaymentActionType;
  createdAt: string;
  ip?: string;
  userAgent?: string;
};

export type StudentActivityEventType = "page_view" | "heartbeat" | "session_end";

export type StudentSessionRecord = {
  email: string;
  sessionId: string;
  deviceId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  durationMs: number;
  pageViews: number;
  heartbeatCount: number;
  lastPath?: string;
  status: "active" | "ended";
  ip?: string;
  userAgent?: string;
};

type AuthFile = {
  allowedEmails: string[];
  proEmails?: string[];
  adminEmails?: string[];
  users: Record<string, AuthUserRecord>;
  registrationRequests?: RegistrationRequest[];
  paymentActions?: PaymentActionRecord[];
  activitySessions?: StudentSessionRecord[];
};

type RedisConfig = {
  url: string;
  token: string;
};

export type AuthCheckResult =
  | { ok: true; email: string; boundDeviceId: string }
  | { ok: false; reason: "missing" | "invalid" | "ip_mismatch" | "not_allowed" };

export type LoginResult =
  | { ok: true; email: string; deviceId: string; cookieValue: string; isFirstLogin: boolean }
  | {
      ok: false;
      status: number;
      message: string;
      reason?: "not_allowed";
    };

export type AdminAuthUser = Omit<AuthUserRecord, "devices"> & {
  devices: AuthDeviceRecord[];
  isAllowed: boolean;
  deviceCount: number;
  activeDeviceCount: number;
};

export type AuthAdminSnapshot = {
  allowedEmails: string[];
  adminEmails: string[];
  users: AdminAuthUser[];
  registrationRequests: RegistrationRequest[];
  paymentActions: PaymentActionRecord[];
  activitySessions: StudentSessionRecord[];
};

const PAYMENT_LINKS: Record<RegistrationPlan, string> = {
  basic: "https://payments.payplus.co.il/c0bc3ed9-b833-4c7e-9dc4-685e77964f52",
  pro: "https://payments.payplus.co.il/65dccafb-d217-4755-9a5c-fe38aefe243c",
};

const MAX_PAYMENT_ACTIONS = 1000;
const MAX_ACTIVITY_SESSIONS = 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getCookieSecret(): string {
  return process.env.AUTH_COOKIE_SECRET ?? "infi-test-b-local-auth-secret";
}

function sign(value: string): string {
  return createHmac("sha256", getCookieSecret()).update(value).digest("base64url");
}

function verifySignature(value: string, signature: string): boolean {
  const expected = sign(value);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function shouldUseRedisStore(): boolean {
  return Boolean(getRedisConfig()) || process.env.VERCEL === "1";
}

function getUserKey(email: string): string {
  return `auth:user:${normalizeEmail(email)}`;
}

function getRegistrationRequestsKey(): string {
  return "auth:registration-requests";
}

function getPaymentActionsKey(): string {
  return "auth:payment-actions";
}

function getActivitySessionsKey(): string {
  return "auth:activity-sessions";
}

export function getPaymentLinkForPlan(plan: RegistrationPlan): string {
  return PAYMENT_LINKS[plan === "pro" ? "pro" : "basic"];
}

function getConfiguredAdminEmails(authFile: AuthFile): string[] {
  const envAdmins = (process.env.AUTH_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  if (envAdmins.length > 0) return envAdmins;
  if (Array.isArray(authFile.adminEmails) && authFile.adminEmails.length > 0) {
    return authFile.adminEmails.map(normalizeEmail);
  }

  return ["liamesika21@gmail.com"];
}

function normalizeDeviceId(deviceId: string): string {
  return deviceId.trim();
}

export function getClientDeviceId(request: Request): string {
  const deviceId = normalizeDeviceId(request.headers.get("x-infi-device-id") ?? "");
  return deviceId.length >= 16 && deviceId.length <= 128 ? deviceId : "";
}

export function createAuthCookieValue(email: string, deviceId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: normalizeEmail(email), deviceId: normalizeDeviceId(deviceId) }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export function readAuthCookieValue(cookieValue: string | undefined): AuthCheckResult {
  if (!cookieValue) return { ok: false, reason: "missing" };

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: unknown;
      deviceId?: unknown;
      ip?: unknown;
    };

    if (typeof data.email !== "string") {
      return { ok: false, reason: "invalid" };
    }

    if (typeof data.deviceId === "string") {
      return {
        ok: true,
        email: normalizeEmail(data.email),
        boundDeviceId: normalizeDeviceId(data.deviceId),
      };
    }

    if (typeof data.ip === "string") {
      return { ok: false, reason: "ip_mismatch" };
    }

    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

async function readAuthFile(): Promise<AuthFile> {
  try {
    const raw = await readFile(AUTH_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AuthFile>;

    return {
      allowedEmails: Array.isArray(parsed.allowedEmails)
        ? parsed.allowedEmails.map(normalizeEmail)
        : [],
      proEmails: Array.isArray(parsed.proEmails)
        ? parsed.proEmails.map(normalizeEmail)
        : [],
      adminEmails: Array.isArray(parsed.adminEmails)
        ? parsed.adminEmails.map(normalizeEmail)
        : undefined,
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
      registrationRequests: Array.isArray(parsed.registrationRequests)
        ? parsed.registrationRequests
            .filter((request): request is RegistrationRequest => {
              const candidate = request as Partial<RegistrationRequest>;
              return typeof candidate.email === "string" && typeof candidate.phone === "string";
            })
            .map((request) => {
              const plan: RegistrationPlan =
                request.plan === "basic" || request.plan === "pro"
                  ? request.plan
                  : request.wantsMentor
                    ? "pro"
                    : "basic";
              const planPriceIls = Number(request.planPriceIls) || (plan === "pro" ? 49 : 19);

              return {
                ...request,
                email: normalizeEmail(request.email),
                plan,
                wantsMentor: plan === "pro",
                basePriceIls: Number(request.basePriceIls) || (plan === "pro" ? 19 : planPriceIls),
                mentorPriceIls: Number(request.mentorPriceIls) || (plan === "pro" ? 30 : 0),
                planPriceIls,
                totalPriceIls: Number(request.totalPriceIls) || planPriceIls,
                createdAt: request.createdAt || "",
                paymentStatus:
                  request.paymentStatus === "manual_pending" ||
                  request.paymentStatus === "payment_link_opened"
                    ? request.paymentStatus
                    : "pending",
                paymentMethod:
                  request.paymentMethod === "bit" ||
                  request.paymentMethod === "paybox" ||
                  request.paymentMethod === "credit"
                    ? request.paymentMethod
                    : undefined,
                paymentPageUrl:
                  typeof request.paymentPageUrl === "string"
                    ? request.paymentPageUrl
                    : getPaymentLinkForPlan(plan),
                lastPaymentActionAt:
                  typeof request.lastPaymentActionAt === "string"
                    ? request.lastPaymentActionAt
                    : undefined,
              };
            })
        : [],
      paymentActions: Array.isArray(parsed.paymentActions)
        ? parsed.paymentActions.filter((action): action is PaymentActionRecord => {
            const candidate = action as Partial<PaymentActionRecord>;
            return (
              typeof candidate.id === "string" &&
              typeof candidate.email === "string" &&
              (candidate.plan === "basic" || candidate.plan === "pro") &&
              (candidate.method === "bit" || candidate.method === "paybox" || candidate.method === "credit") &&
              (candidate.action === "manual_instructions_shown" || candidate.action === "payment_link_opened") &&
              typeof candidate.createdAt === "string"
            );
          })
        : [],
      activitySessions: Array.isArray(parsed.activitySessions)
        ? parsed.activitySessions.filter((session): session is StudentSessionRecord => {
            const candidate = session as Partial<StudentSessionRecord>;
            return (
              typeof candidate.email === "string" &&
              typeof candidate.sessionId === "string" &&
              typeof candidate.firstSeenAt === "string" &&
              typeof candidate.lastSeenAt === "string"
            );
          })
        : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { allowedEmails: [], users: {}, registrationRequests: [], paymentActions: [], activitySessions: [] };
  }
}

async function getRedisUser(email: string): Promise<AuthUserRecord | null> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const response = await fetch(`${redis.url}/get/${encodeURIComponent(getUserKey(email))}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });

  if (!response.ok) {
    throw new Error(`Redis GET failed with ${response.status}`);
  }

  const data = (await response.json()) as { result?: string | null };
  if (!data.result) return null;

  return JSON.parse(data.result) as AuthUserRecord;
}

async function setRedisUser(user: AuthUserRecord): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const value = encodeURIComponent(JSON.stringify(user));
  const response = await fetch(
    `${redis.url}/set/${encodeURIComponent(getUserKey(user.email))}/${value}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis SET failed with ${response.status}`);
  }
}

async function getRedisRegistrationRequests(): Promise<RegistrationRequest[]> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const response = await fetch(
    `${redis.url}/get/${encodeURIComponent(getRegistrationRequestsKey())}`,
    {
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis GET failed with ${response.status}`);
  }

  const data = (await response.json()) as { result?: string | null };
  if (!data.result) return [];

  const parsed = JSON.parse(data.result) as unknown;
  return Array.isArray(parsed) ? (parsed as RegistrationRequest[]) : [];
}

async function setRedisRegistrationRequests(registrationRequests: RegistrationRequest[]): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const value = encodeURIComponent(JSON.stringify(registrationRequests));
  const response = await fetch(
    `${redis.url}/set/${encodeURIComponent(getRegistrationRequestsKey())}/${value}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis SET failed with ${response.status}`);
  }
}

async function getRedisPaymentActions(): Promise<PaymentActionRecord[]> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const response = await fetch(`${redis.url}/get/${encodeURIComponent(getPaymentActionsKey())}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });

  if (!response.ok) {
    throw new Error(`Redis GET failed with ${response.status}`);
  }

  const data = (await response.json()) as { result?: string | null };
  if (!data.result) return [];

  const parsed = JSON.parse(data.result) as unknown;
  return Array.isArray(parsed) ? (parsed as PaymentActionRecord[]) : [];
}

async function setRedisPaymentActions(paymentActions: PaymentActionRecord[]): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const value = encodeURIComponent(JSON.stringify(paymentActions));
  const response = await fetch(
    `${redis.url}/set/${encodeURIComponent(getPaymentActionsKey())}/${value}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis SET failed with ${response.status}`);
  }
}

async function getRedisActivitySessions(): Promise<StudentSessionRecord[]> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const response = await fetch(`${redis.url}/get/${encodeURIComponent(getActivitySessionsKey())}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });

  if (!response.ok) {
    throw new Error(`Redis GET failed with ${response.status}`);
  }

  const data = (await response.json()) as { result?: string | null };
  if (!data.result) return [];

  const parsed = JSON.parse(data.result) as unknown;
  return Array.isArray(parsed) ? (parsed as StudentSessionRecord[]) : [];
}

async function setRedisActivitySessions(activitySessions: StudentSessionRecord[]): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const value = encodeURIComponent(JSON.stringify(activitySessions));
  const response = await fetch(
    `${redis.url}/set/${encodeURIComponent(getActivitySessionsKey())}/${value}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis SET failed with ${response.status}`);
  }
}

async function writeAuthFile(authFile: AuthFile): Promise<void> {
  await mkdir(path.dirname(AUTH_FILE_PATH), { recursive: true });
  const tempPath = `${AUTH_FILE_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(authFile, null, 2)}\n`, "utf8");
  await rename(tempPath, AUTH_FILE_PATH);
}

function getRequestIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    undefined
  );
}

function getRequestUserAgent(request: Request): string | undefined {
  return request.headers.get("user-agent")?.trim() || undefined;
}

function getUserDevices(user: AuthUserRecord | null | undefined): AuthDeviceRecord[] {
  const devices = Array.isArray(user?.devices) ? [...user.devices] : [];

  if (user?.boundDeviceId && !devices.some((device) => device.id === user.boundDeviceId)) {
    devices.push({
      id: user.boundDeviceId,
      status: user.fixedDeviceId === user.boundDeviceId ? "fixed" : "active",
      firstSeenAt: user.firstLoginAt,
      lastSeenAt: user.lastLoginAt,
      loginCount: user.loginCount,
      ip: user.boundIp,
    });
  }

  return devices;
}

function upsertDevice(
  devices: AuthDeviceRecord[],
  deviceId: string,
  now: string,
  request: Request,
  status: AuthDeviceStatus
): AuthDeviceRecord[] {
  const existingDevice = devices.find((device) => device.id === deviceId);
  const ip = getRequestIp(request);
  const userAgent = getRequestUserAgent(request);

  if (!existingDevice) {
    return [
      ...devices,
      {
        id: deviceId,
        status,
        firstSeenAt: now,
        lastSeenAt: now,
        loginCount: status === "pending" || status === "blocked" ? 0 : 1,
        ip,
        userAgent,
      },
    ];
  }

  return devices.map((device) =>
    device.id === deviceId
      ? {
          ...device,
          status,
          lastSeenAt: now,
          loginCount:
            status === "pending" || status === "blocked"
              ? device.loginCount
              : device.loginCount + 1,
          ip,
          userAgent,
        }
      : device
  );
}

async function persistUser(authFile: AuthFile, user: AuthUserRecord): Promise<void> {
  if (shouldUseRedisStore()) {
    await setRedisUser(user);
    return;
  }

  authFile.users[user.email] = user;
  await writeAuthFile(authFile);
}

async function getRegistrationRequests(authFile: AuthFile): Promise<RegistrationRequest[]> {
  if (shouldUseRedisStore()) {
    return getRedisRegistrationRequests();
  }

  return authFile.registrationRequests ?? [];
}

async function persistRegistrationRequests(
  authFile: AuthFile,
  registrationRequests: RegistrationRequest[]
): Promise<void> {
  if (shouldUseRedisStore()) {
    await setRedisRegistrationRequests(registrationRequests);
    return;
  }

  authFile.registrationRequests = registrationRequests;
  await writeAuthFile(authFile);
}

async function persistRegistrationRequest(
  authFile: AuthFile,
  registrationRequest: RegistrationRequest
): Promise<void> {
  const registrationRequests = await getRegistrationRequests(authFile);
  const nextRegistrationRequests = [
    registrationRequest,
    ...registrationRequests.filter(
      (request) => normalizeEmail(request.email) !== registrationRequest.email
    ),
  ];

  await persistRegistrationRequests(authFile, nextRegistrationRequests);
}

async function getPaymentActions(authFile: AuthFile): Promise<PaymentActionRecord[]> {
  if (shouldUseRedisStore()) {
    return getRedisPaymentActions();
  }

  return authFile.paymentActions ?? [];
}

async function persistPaymentActions(
  authFile: AuthFile,
  paymentActions: PaymentActionRecord[]
): Promise<void> {
  const cappedActions = paymentActions
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_PAYMENT_ACTIONS);

  if (shouldUseRedisStore()) {
    await setRedisPaymentActions(cappedActions);
    return;
  }

  authFile.paymentActions = cappedActions;
  await writeAuthFile(authFile);
}

async function getActivitySessions(authFile: AuthFile): Promise<StudentSessionRecord[]> {
  if (shouldUseRedisStore()) {
    return getRedisActivitySessions();
  }

  return authFile.activitySessions ?? [];
}

async function persistActivitySessions(
  authFile: AuthFile,
  activitySessions: StudentSessionRecord[]
): Promise<void> {
  const cappedSessions = activitySessions
    .slice()
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .slice(0, MAX_ACTIVITY_SESSIONS);

  if (shouldUseRedisStore()) {
    await setRedisActivitySessions(cappedSessions);
    return;
  }

  authFile.activitySessions = cappedSessions;
  await writeAuthFile(authFile);
}

export async function submitRegistrationRequest(
  email: string,
  phone: string,
  plan: RegistrationPlan,
  request: Request
): Promise<RegistrationRequest> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = phone.trim();
  const selectedPlan: RegistrationPlan = plan === "pro" ? "pro" : "basic";

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("invalid_email");
  }

  if (normalizedPhone.replace(/\D/g, "").length < 7) {
    throw new Error("invalid_phone");
  }

  const registrationRequest: RegistrationRequest = {
    email: normalizedEmail,
    phone: normalizedPhone,
    plan: selectedPlan,
    wantsMentor: selectedPlan === "pro",
    planPriceIls: selectedPlan === "pro" ? 49 : 19,
    totalPriceIls: selectedPlan === "pro" ? 49 : 19,
    createdAt: new Date().toISOString(),
    paymentStatus: "pending",
    paymentPageUrl: getPaymentLinkForPlan(selectedPlan),
    ip: getRequestIp(request),
    userAgent: getRequestUserAgent(request),
  };
  const authFile = await readAuthFile();
  await persistRegistrationRequest(authFile, registrationRequest);

  return registrationRequest;
}

export async function recordPaymentAction(
  email: string,
  plan: RegistrationPlan,
  method: PaymentMethod,
  action: PaymentActionType,
  request: Request,
  phone?: string
): Promise<PaymentActionRecord> {
  const normalizedEmail = normalizeEmail(email);
  const selectedPlan: RegistrationPlan = plan === "pro" ? "pro" : "basic";
  const amountIls = selectedPlan === "pro" ? 49 : 19;
  const now = new Date().toISOString();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("invalid_email");
  }

  const authFile = await readAuthFile();
  const paymentAction: PaymentActionRecord = {
    id: randomUUID(),
    email: normalizedEmail,
    phone: phone?.trim() || undefined,
    plan: selectedPlan,
    amountIls,
    method,
    action,
    createdAt: now,
    ip: getRequestIp(request),
    userAgent: getRequestUserAgent(request),
  };

  const paymentActions = await getPaymentActions(authFile);
  await persistPaymentActions(authFile, [paymentAction, ...paymentActions]);

  const registrationRequests = await getRegistrationRequests(authFile);
  const hasRegistration = registrationRequests.some(
    (registrationRequest) => normalizeEmail(registrationRequest.email) === normalizedEmail
  );
  const paymentStatus: PaymentStatus =
    action === "payment_link_opened" ? "payment_link_opened" : "manual_pending";
  const updatedRegistrationRequests = hasRegistration
    ? registrationRequests.map((registrationRequest) =>
        normalizeEmail(registrationRequest.email) === normalizedEmail
          ? {
              ...registrationRequest,
              plan: selectedPlan,
              wantsMentor: selectedPlan === "pro",
              phone: phone?.trim() || registrationRequest.phone,
              planPriceIls: amountIls,
              totalPriceIls: amountIls,
              paymentStatus,
              paymentMethod: method,
              paymentPageUrl: getPaymentLinkForPlan(selectedPlan),
              lastPaymentActionAt: now,
            }
          : registrationRequest
      )
    : [
        {
          email: normalizedEmail,
          phone: phone?.trim() || "",
          plan: selectedPlan,
          wantsMentor: selectedPlan === "pro",
          planPriceIls: amountIls,
          totalPriceIls: amountIls,
          createdAt: now,
          paymentStatus,
          paymentMethod: method,
          paymentPageUrl: getPaymentLinkForPlan(selectedPlan),
          lastPaymentActionAt: now,
          ip: getRequestIp(request),
          userAgent: getRequestUserAgent(request),
        },
        ...registrationRequests,
      ];

  await persistRegistrationRequests(authFile, updatedRegistrationRequests);

  return paymentAction;
}

export async function recordStudentActivity(
  email: string,
  event: StudentActivityEventType,
  sessionId: string,
  request: Request,
  options: { path?: string; durationMs?: number; deviceId?: string } = {}
): Promise<StudentSessionRecord> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedSessionId = sessionId.trim();

  if (!normalizedEmail || !normalizedEmail.includes("@") || !normalizedSessionId) {
    throw new Error("invalid_activity");
  }

  const authFile = await readAuthFile();
  const sessions = await getActivitySessions(authFile);
  const now = new Date().toISOString();
  const existingSession = sessions.find(
    (session) => session.email === normalizedEmail && session.sessionId === normalizedSessionId
  );
  const firstSeenAt = existingSession?.firstSeenAt ?? now;
  const inferredDuration = Math.max(0, new Date(now).getTime() - new Date(firstSeenAt).getTime());
  const nextSession: StudentSessionRecord = {
    email: normalizedEmail,
    sessionId: normalizedSessionId,
    deviceId: options.deviceId || existingSession?.deviceId,
    firstSeenAt,
    lastSeenAt: now,
    durationMs: Math.max(existingSession?.durationMs ?? 0, options.durationMs ?? inferredDuration),
    pageViews: (existingSession?.pageViews ?? 0) + (event === "page_view" ? 1 : 0),
    heartbeatCount: (existingSession?.heartbeatCount ?? 0) + (event === "heartbeat" ? 1 : 0),
    lastPath: options.path || existingSession?.lastPath,
    status: event === "session_end" ? "ended" : "active",
    ip: getRequestIp(request) ?? existingSession?.ip,
    userAgent: getRequestUserAgent(request) ?? existingSession?.userAgent,
  };

  await persistActivitySessions(authFile, [
    nextSession,
    ...sessions.filter(
      (session) => !(session.email === normalizedEmail && session.sessionId === normalizedSessionId)
    ),
  ]);

  return nextSession;
}

export async function validateCookieForRequest(request: Request): Promise<AuthCheckResult> {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);

  const authCookie = readAuthCookieValue(cookie);
  if (!authCookie.ok) return authCookie;

  const authFile = await readAuthFile();
  if (!authFile.allowedEmails.includes(authCookie.email)) {
    return { ok: false, reason: "not_allowed" };
  }

  return authCookie;
}

export async function loginWithEmail(
  email: string,
  request: Request
): Promise<LoginResult> {
  const normalizedEmail = normalizeEmail(email);
  const authFile = await readAuthFile();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false as const, status: 400, message: "צריך להזין כתובת מייל תקינה." };
  }

  if (!authFile.allowedEmails.includes(normalizedEmail)) {
    return {
      ok: false as const,
      status: 403,
      reason: "not_allowed",
      message: "המייל הזה לא נמצא ברשימת המורשים.",
    };
  }

  const currentDeviceId = getClientDeviceId(request);
  if (!currentDeviceId) {
    return { ok: false as const, status: 400, message: "לא הצלחתי לזהות את המחשב. רענן את הדף ונסה שוב." };
  }

  const useRedisStore = shouldUseRedisStore();
  const existingUser = useRedisStore
    ? await getRedisUser(normalizedEmail)
    : authFile.users[normalizedEmail];
  const isFirstLogin = !existingUser || existingUser.loginCount === 0;

  const now = new Date().toISOString();
  let devices = getUserDevices(existingUser);

  const nextStatus: AuthDeviceStatus = "fixed";
  devices = upsertDevice(devices, currentDeviceId, now, request, nextStatus);

  const user: AuthUserRecord = {
    email: normalizedEmail,
    boundDeviceId: currentDeviceId,
    boundIp: getRequestIp(request) ?? existingUser?.boundIp,
    fixedDeviceId: currentDeviceId,
    fixedAt: existingUser?.fixedAt ?? now,
    devices,
    firstLoginAt: existingUser?.firstLoginAt ?? now,
    lastLoginAt: now,
    loginCount: (existingUser?.loginCount ?? 0) + 1,
  };

  await persistUser(authFile, user);

  return {
    ok: true as const,
    email: normalizedEmail,
    deviceId: currentDeviceId,
    cookieValue: createAuthCookieValue(normalizedEmail, currentDeviceId),
    isFirstLogin,
  };
}

export async function getAuthAdminSnapshot(): Promise<AuthAdminSnapshot> {
  const authFile = await readAuthFile();
  const users: AuthUserRecord[] = [];
  const [registrationRequests, paymentActions, activitySessions] = await Promise.all([
    getRegistrationRequests(authFile),
    getPaymentActions(authFile),
    getActivitySessions(authFile),
  ]);

  if (shouldUseRedisStore()) {
    const redisUsers = await Promise.all(
      authFile.allowedEmails.map(async (email) => getRedisUser(email).catch(() => null))
    );
    users.push(...redisUsers.filter((user): user is AuthUserRecord => Boolean(user)));
  } else {
    users.push(...Object.values(authFile.users));
  }

  const allowedEmails = authFile.allowedEmails.map(normalizeEmail);
  const mergedEmails = new Set([...allowedEmails, ...users.map((user) => normalizeEmail(user.email))]);
  const adminUsers = [...mergedEmails].map((email) => {
    const user = users.find((entry) => normalizeEmail(entry.email) === email);
    const devices = getUserDevices(user);
    return {
      email,
      boundDeviceId: user?.boundDeviceId,
      boundIp: user?.boundIp,
      fixedDeviceId: user?.fixedDeviceId,
      fixedAt: user?.fixedAt,
      devices,
      firstLoginAt: user?.firstLoginAt ?? "",
      lastLoginAt: user?.lastLoginAt ?? "",
      loginCount: user?.loginCount ?? 0,
      isAllowed: allowedEmails.includes(email),
      deviceCount: devices.length,
      activeDeviceCount: devices.filter((device) => device.status === "active" || device.status === "fixed").length,
    };
  });

  return {
    allowedEmails,
    adminEmails: getConfiguredAdminEmails(authFile),
    users: adminUsers.sort((a, b) => b.lastLoginAt.localeCompare(a.lastLoginAt)),
    registrationRequests: registrationRequests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    paymentActions: paymentActions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    activitySessions: activitySessions.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)),
  };
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const authFile = await readAuthFile();
  return getConfiguredAdminEmails(authFile).includes(normalizeEmail(email));
}

export async function isProEmail(email: string): Promise<boolean> {
  const envPro = (process.env.PRO_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
  if (envPro.length > 0) return envPro.includes(normalizeEmail(email));

  const authFile = await readAuthFile();
  return (authFile.proEmails ?? []).includes(normalizeEmail(email));
}
