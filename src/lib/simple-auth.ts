import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export const AUTH_COOKIE_NAME = "infi_auth";

const AUTH_FILE_PATH = path.join(process.cwd(), "data", "auth-users.json");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type AuthUserRecord = {
  email: string;
  boundDeviceId?: string;
  boundIp?: string;
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
};

type AuthFile = {
  allowedEmails: string[];
  users: Record<string, AuthUserRecord>;
};

type RedisConfig = {
  url: string;
  token: string;
};

export type AuthCheckResult =
  | { ok: true; email: string; boundDeviceId: string }
  | { ok: false; reason: "missing" | "invalid" | "ip_mismatch" };

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

  return authCookie;
}

export async function loginWithEmail(email: string, request: Request) {
  const normalizedEmail = normalizeEmail(email);
  const authFile = await readAuthFile();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false as const, status: 400, message: "צריך להזין כתובת מייל תקינה." };
  }

  const currentDeviceId = getClientDeviceId(request);
  if (!currentDeviceId) {
    return { ok: false as const, status: 400, message: "לא הצלחתי לזהות את המחשב. רענן את הדף ונסה שוב." };
  }

  const useRedisStore = shouldUseRedisStore();
  const existingUser = useRedisStore
    ? await getRedisUser(normalizedEmail)
    : authFile.users[normalizedEmail];

  if (existingUser?.boundDeviceId && existingUser.boundDeviceId !== currentDeviceId) {
    return {
      ok: false as const,
      status: 403,
      message: "המייל הזה כבר משויך למחשב אחר.",
    };
  }

  const now = new Date().toISOString();
  const user: AuthUserRecord = {
    email: normalizedEmail,
    boundDeviceId: existingUser?.boundDeviceId ?? currentDeviceId,
    boundIp: existingUser?.boundIp,
    firstLoginAt: existingUser?.firstLoginAt ?? now,
    lastLoginAt: now,
    loginCount: (existingUser?.loginCount ?? 0) + 1,
  };

  if (useRedisStore) {
    await setRedisUser(user);
  } else {
    authFile.users[normalizedEmail] = user;
    await writeAuthFile(authFile);
  }

  return {
    ok: true as const,
    email: normalizedEmail,
    deviceId: currentDeviceId,
    cookieValue: createAuthCookieValue(normalizedEmail, currentDeviceId),
  };
}
