import { NextResponse } from "next/server";
import { markRegistrationStatus } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; status?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const status = body.status === "abandoned" ? "abandoned" : "failed";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await markRegistrationStatus(email, status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
