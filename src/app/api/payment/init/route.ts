import { NextResponse } from "next/server";
import { storePendingPayment } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; plan?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const plan = body.plan === "pro" ? "pro" : "basic";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "מייל לא תקין." }, { status: 400 });
  }

  try {
    const token = await storePendingPayment(email, plan);
    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ ok: false, message: "שגיאה בשמירת תשלום." }, { status: 500 });
  }
}
