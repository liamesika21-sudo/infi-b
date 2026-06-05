import { createHmac, timingSafeEqual } from "crypto";
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

type AuthFile = {
  allowedEmails: string[];
  adminEmails?: string[];
  users: Record<string, AuthUserRecord>;
};

type RedisConfig = {
  url: string;
  token: string;
};

export type AuthCheckResult =
  | { ok: true; email: string; boundDeviceId: string }
  | { ok: false; reason: "missing" | "invalid" | "ip_mismatch" | "not_allowed" };

export type LoginResult =
  | { ok: true; email: string; deviceId: string; cookieValue: string }
  | {
      ok: false;
      status: number;
      message: string;
      reason?: "not_allowed" | "fixed_device_mismatch";
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
};

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
      adminEmails: Array.isArray(parsed.adminEmails)
        ? parsed.adminEmails.map(normalizeEmail)
        : undefined,
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { allowedEmails: [], users: {} };
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

export async function validateCookieForRequest(request: Request): Promise<AuthCheckResult> {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);

  const authCookie = readAuthCookieValue(cookie);
  if (!authCookie.ok) return authCookie;

  const currentDeviceId = getClientDeviceId(request);
  if (!currentDeviceId || authCookie.boundDeviceId !== currentDeviceId) {
    return { ok: false, reason: "ip_mismatch" };
  }

  const authFile = await readAuthFile();
  if (!authFile.allowedEmails.includes(authCookie.email)) {
    return { ok: false, reason: "not_allowed" };
  }

  const user = shouldUseRedisStore()
    ? await getRedisUser(authCookie.email)
    : authFile.users[authCookie.email];

  if (user?.fixedDeviceId && user.fixedDeviceId !== currentDeviceId) {
    return { ok: false, reason: "ip_mismatch" };
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

  const now = new Date().toISOString();
  let devices = getUserDevices(existingUser);
  const fixedDeviceId = existingUser?.fixedDeviceId ?? existingUser?.boundDeviceId;

  if (fixedDeviceId && fixedDeviceId !== currentDeviceId) {
    devices = upsertDevice(devices, currentDeviceId, now, request, "blocked");
    const blockedUser: AuthUserRecord = {
      email: normalizedEmail,
      boundDeviceId: fixedDeviceId,
      boundIp: existingUser?.boundIp,
      fixedDeviceId,
      fixedAt: existingUser?.fixedAt,
      devices,
      firstLoginAt: existingUser?.firstLoginAt ?? now,
      lastLoginAt: existingUser?.lastLoginAt ?? now,
      loginCount: existingUser?.loginCount ?? 0,
    };
    await persistUser(authFile, blockedUser);

    return {
      ok: false as const,
      status: 403,
      reason: "fixed_device_mismatch",
      message: "המייל הזה כבר קבוע למכשיר אחר. ניסיון התחברות ממכשיר נוסף נחסם ונרשם באדמין.",
    };
  }

  const hasKnownDifferentDevice = devices.some(
    (device) => device.id !== currentDeviceId && device.status !== "blocked"
  );

  if (!fixedDeviceId && hasKnownDifferentDevice) {
    devices = upsertDevice(devices, currentDeviceId, now, request, "blocked");
    const blockedUser: AuthUserRecord = {
      email: normalizedEmail,
      boundDeviceId: existingUser?.boundDeviceId,
      boundIp: existingUser?.boundIp,
      fixedDeviceId: existingUser?.fixedDeviceId,
      fixedAt: existingUser?.fixedAt,
      devices,
      firstLoginAt: existingUser?.firstLoginAt ?? now,
      lastLoginAt: existingUser?.lastLoginAt ?? now,
      loginCount: existingUser?.loginCount ?? 0,
    };
    await persistUser(authFile, blockedUser);

    return {
      ok: false as const,
      status: 403,
      reason: "fixed_device_mismatch",
      message: "זוהה ניסיון התחברות ממכשיר נוסף. המשתמש נחסם לכניסה מהמכשיר הזה ונרשם באדמין.",
    };
  }

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
  };
}

export async function getAuthAdminSnapshot(): Promise<AuthAdminSnapshot> {
  const authFile = await readAuthFile();
  const users: AuthUserRecord[] = [];

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
  };
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const authFile = await readAuthFile();
  return getConfiguredAdminEmails(authFile).includes(normalizeEmail(email));
}
