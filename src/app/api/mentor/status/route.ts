import { NextResponse } from "next/server";
import { validateCookieForRequest, isProEmail } from "@/lib/simple-auth";
import { getMentorUsage, getMentorCreditLimit } from "@/lib/mentor-credits";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  const [isPro, used] = await Promise.all([
    isProEmail(auth.email),
    getMentorUsage(auth.email),
  ]);

  return NextResponse.json({
    ok: true,
    email: auth.email,
    isPro,
    used,
    limit: getMentorCreditLimit(auth.email),
  });
}
