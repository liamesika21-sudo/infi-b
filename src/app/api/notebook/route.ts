import { NextResponse } from "next/server";
import { validateCookieForRequest } from "@/lib/simple-auth";
import {
  getNotebookEntries,
  addNotebookEntry,
  deleteNotebookEntry,
} from "@/lib/notebook";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const entries = await getNotebookEntries(auth.email);
  return NextResponse.json({ ok: true, entries });
}

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    type?: unknown;
    weekNumber?: unknown;
    title?: unknown;
    content?: unknown;
    source?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json({ ok: false, message: "חסר תוכן" }, { status: 400 });
  }

  const weekNumber = typeof body.weekNumber === "number" ? body.weekNumber : 0;
  if (weekNumber < 0 || weekNumber > 13) {
    return NextResponse.json({ ok: false, message: "מספר שבוע לא תקין" }, { status: 400 });
  }

  const entry = await addNotebookEntry(auth.email, {
    type: body.type === "note" ? "note" : "card",
    weekNumber,
    content: body.content.trim(),
    title: typeof body.title === "string" ? body.title.trim() || undefined : undefined,
    source: typeof body.source === "string" ? body.source.trim() || undefined : undefined,
  });

  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, message: "חסר מזהה" }, { status: 400 });

  await deleteNotebookEntry(auth.email, id);
  return NextResponse.json({ ok: true });
}
