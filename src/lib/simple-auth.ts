import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export const AUTH_COOKIE_NAME = "infi_auth";

const AUTH_FILE_PATH = path.join(process.cwd(), "data", "auth-users.json");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type AuthUserRecord = {
  email: string;
  boundIp: string;
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
};

type AuthFile = {
  allowedEmails: string[];
  users: Record<string, AuthUserRecord>;
};

export type AuthCheckResult =
  | { ok: true; email: string; boundIp: string }
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

function getForwardedIp(value: string | null): string | null {
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

export function getClientIp(request: Request): string {
  return (
    getForwardedIp(request.headers.get("x-forwarded-for")) ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function createAuthCookieValue(email: string, ip: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: normalizeEmail(email), ip }),
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
      ip?: unknown;
    };

    if (typeof data.email !== "string" || typeof data.ip !== "string") {
      return { ok: false, reason: "invalid" };
    }

    return { ok: true, email: normalizeEmail(data.email), boundIp: data.ip };
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

  const currentIp = getClientIp(request);
  if (authCookie.boundIp !== currentIp) {
    return { ok: false, reason: "ip_mismatch" };
  }

  return authCookie;
}

export async function loginWithEmail(email: string, request: Request) {
  const normalizedEmail = normalizeEmail(email);
  const authFile = await readAuthFile();
  const allowedEmails = new Set(authFile.allowedEmails.map(normalizeEmail));

  if (!allowedEmails.has(normalizedEmail)) {
    return { ok: false as const, status: 403, message: "המייל לא מופיע ברשימת המורשים." };
  }

  const currentIp = getClientIp(request);
  const existingUser = authFile.users[normalizedEmail];

  if (existingUser && existingUser.boundIp !== currentIp) {
    return {
      ok: false as const,
      status: 403,
      message: "המייל הזה כבר משויך למחשב אחר.",
    };
  }

  const now = new Date().toISOString();
  authFile.users[normalizedEmail] = {
    email: normalizedEmail,
    boundIp: existingUser?.boundIp ?? currentIp,
    firstLoginAt: existingUser?.firstLoginAt ?? now,
    lastLoginAt: now,
    loginCount: (existingUser?.loginCount ?? 0) + 1,
  };

  await writeAuthFile(authFile);

  return {
    ok: true as const,
    email: normalizedEmail,
    ip: currentIp,
    cookieValue: createAuthCookieValue(normalizedEmail, currentIp),
  };
}
