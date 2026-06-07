import { NextResponse } from "next/server";
import {
  getClientDeviceId,
  recordStudentActivity,
  validateCookieForRequest,
  type StudentActivityEventType,
} from "@/lib/simple-auth";

export const runtime = "nodejs";

function parseEvent(value: unknown): StudentActivityEventType {
  if (value === "heartbeat" || value === "session_end") return value;
  return "page_view";
}

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  let body: { event?: unknown; sessionId?: unknown; path?: unknown; durationMs?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  try {
    const session = await recordStudentActivity(auth.email, parseEvent(body.event), sessionId, request, {
      path: typeof body.path === "string" ? body.path : undefined,
      durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
      deviceId: getClientDeviceId(request) || auth.boundDeviceId,
    });

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    if ((error as Error).message === "invalid_activity") {
      return NextResponse.json({ ok: false, message: "אירוע פעילות לא תקין." }, { status: 400 });
    }

    console.error("Activity tracking failed", error);
    return NextResponse.json({ ok: false, message: "שגיאה בשמירת פעילות." }, { status: 500 });
  }
}
