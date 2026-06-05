import { NextResponse } from "next/server";
import { validateCookieForRequest, isAdminEmail } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  const isAdmin = await isAdminEmail(auth.email);
  return NextResponse.json({ ok: true, email: auth.email, isAdmin });
}
