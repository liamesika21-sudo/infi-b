import { NextResponse } from "next/server";
import { validateCookieForRequest } from "@/lib/simple-auth";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  return NextResponse.json({ ok: true, email: auth.email });
}
