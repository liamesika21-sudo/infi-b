import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  loginWithEmail,
} from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email : "";
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof loginWithEmail>>;

  try {
    result = await loginWithEmail(email, request);
  } catch (error) {
    console.error("Auth login failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "שגיאה בשמירת פרטי הכניסה. ב-Vercel צריך להגדיר Redis/Upstash env vars לשמירת כניסות.",
      },
      { status: 500 }
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.status }
    );
  }

  const response = NextResponse.json({
    ok: true,
    email: result.email,
  });

  response.cookies.set(AUTH_COOKIE_NAME, result.cookieValue, getAuthCookieOptions());

  return response;
}
