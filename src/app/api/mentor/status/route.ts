import { NextResponse } from "next/server";
import { validateCookieForRequest, isProEmail } from "@/lib/simple-auth";
import { getMentorUsage, MENTOR_CREDIT_LIMIT } from "@/lib/mentor-credits";

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
    limit: MENTOR_CREDIT_LIMIT,
  });
}
