import { NextResponse } from "next/server";
import { isAdminEmail, validateCookieForRequest } from "@/lib/simple-auth";
import {
  addWeekNote,
  deleteWeekNote,
  getWeekNotes,
  MAX_NOTE_LENGTH,
  type CommunityNoteTag,
  type CommunityNoteTagType,
} from "@/lib/community-notes";

export const runtime = "nodejs";

function parseWeek(value: string | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 13 ? n : null;
}

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const week = parseWeek(searchParams.get("week"));
  if (week === null) return NextResponse.json({ ok: false, message: "מספר שבוע לא תקין" }, { status: 400 });

  const notes = await getWeekNotes(week, auth.email);
  return NextResponse.json({ ok: true, notes });
}

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  let payload: {
    weekNumber?: unknown;
    body?: unknown;
    anonymous?: unknown;
    authorName?: unknown;
    tag?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const week = typeof payload.weekNumber === "number" ? payload.weekNumber : null;
  if (week === null || week < 1 || week > 13) {
    return NextResponse.json({ ok: false, message: "מספר שבוע לא תקין" }, { status: 400 });
  }

  if (typeof payload.body !== "string" || !payload.body.trim()) {
    return NextResponse.json({ ok: false, message: "חסר תוכן להערה" }, { status: 400 });
  }
  if (payload.body.length > MAX_NOTE_LENGTH) {
    return NextResponse.json({ ok: false, message: "ההערה ארוכה מדי" }, { status: 400 });
  }

  const note = await addWeekNote({
    weekNumber: week,
    body: payload.body,
    authorEmail: auth.email,
    authorName: typeof payload.authorName === "string" ? payload.authorName : undefined,
    anonymous: payload.anonymous === true,
    tag: parseTag(payload.tag),
  });

  return NextResponse.json({ ok: true, note });
}

export async function DELETE(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const week = parseWeek(searchParams.get("week"));
  const id = searchParams.get("id");
  if (week === null || !id) {
    return NextResponse.json({ ok: false, message: "פרמטרים חסרים" }, { status: 400 });
  }

  const admin = await isAdminEmail(auth.email);
  const deleted = await deleteWeekNote(week, id, auth.email, admin);
  if (!deleted) return NextResponse.json({ ok: false, message: "אין הרשאה למחוק" }, { status: 403 });

  return NextResponse.json({ ok: true });
}

const TAG_TYPES: ReadonlySet<string> = new Set<CommunityNoteTagType>([
  "homework",
  "homework-question",
  "recitation",
  "theorem",
  "definition",
  "general",
]);

function parseTag(raw: unknown): CommunityNoteTag | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const t = raw as Record<string, unknown>;
  if (typeof t.type !== "string" || !TAG_TYPES.has(t.type)) return undefined;
  if (typeof t.label !== "string" || !t.label.trim()) return undefined;
  return {
    type: t.type as CommunityNoteTagType,
    label: t.label,
    anchor: typeof t.anchor === "string" ? t.anchor : undefined,
  };
}
