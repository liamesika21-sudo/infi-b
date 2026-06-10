import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, activatePaymentUser, getAuthCookieOptions, consumePendingPayment } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { token?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ ok: false, message: "טוקן חסר." }, { status: 400 });
  }

  const pending = await consumePendingPayment(token);
  if (!pending) {
    return NextResponse.json(
      { ok: false, message: "קישור תשלום לא תקין או שפג תוקפו. חוזרים להתחברות." },
      { status: 400 }
    );
  }

  const result = await activatePaymentUser(pending.email, pending.plan, request);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, email: result.email, plan: pending.plan });
  response.cookies.set(AUTH_COOKIE_NAME, result.cookieValue, getAuthCookieOptions());
  return response;
}
