import { NextResponse } from "next/server";
import { validateCookieForRequest } from "@/lib/simple-auth";
import {
  getPersonalProgress,
  isPersonalProgressStatus,
  updatePersonalProgress,
} from "@/lib/personal-progress";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  const records = await getPersonalProgress(auth.email);
  return NextResponse.json({ ok: true, email: auth.email, records });
}

export async function PATCH(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  let body: {
    topicId?: unknown;
    status?: unknown;
    notes?: unknown;
    targetDate?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  if (typeof body.topicId !== "string" || !body.topicId.trim()) {
    return NextResponse.json({ ok: false, message: "חסר מזהה נושא." }, { status: 400 });
  }

  if (body.status !== undefined && !isPersonalProgressStatus(body.status)) {
    return NextResponse.json({ ok: false, message: "סטטוס לא תקין." }, { status: 400 });
  }

  try {
    const record = await updatePersonalProgress(auth.email, {
      topicId: body.topicId,
      status: body.status,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      targetDate: typeof body.targetDate === "string" ? body.targetDate : undefined,
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    console.error("Progress update failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "שגיאה בשמירת המעקב. ב-Vercel צריך להגדיר Redis/Upstash env vars לשמירת התקדמות.",
      },
      { status: 500 }
    );
  }
}
