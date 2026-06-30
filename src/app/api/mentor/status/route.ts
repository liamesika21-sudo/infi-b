import { NextResponse } from "next/server";
import { validateCookieForRequest, isProEmail } from "@/lib/simple-auth";
import { getMentorUsage, getMentorCreditLimit } from "@/lib/mentor-credits";
import { getPersonalMentorKey } from "@/lib/mentor-keys";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  const [isProUser, used, personalKey] = await Promise.all([
    isProEmail(auth.email),
    getMentorUsage(auth.email),
    getPersonalMentorKey(auth.email),
  ]);

  // Mentor access = pro subscriber OR a user with their own personal API key.
  const hasMentorAccess = isProUser || Boolean(personalKey);

  return NextResponse.json({
    ok: true,
    email: auth.email,
    isPro: hasMentorAccess,
    used,
    // personal-key users bill their own key → unlimited from the system's view
    limit: personalKey ? null : getMentorCreditLimit(auth.email),
  });
}
