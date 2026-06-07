import { NextResponse } from "next/server";
import { submitRegistrationRequest } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; phone?: unknown; plan?: unknown; wantsMentor?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const plan =
    body.plan === "basic" || body.plan === "pro"
      ? body.plan
      : body.wantsMentor === true
        ? "pro"
        : "basic";

  try {
    const registrationRequest = await submitRegistrationRequest(email, phone, plan, request);

    return NextResponse.json({
      ok: true,
      email: registrationRequest.email,
      phone: registrationRequest.phone,
      plan: registrationRequest.plan,
      totalPriceIls: registrationRequest.totalPriceIls,
      paymentPageUrl: registrationRequest.paymentPageUrl,
      message: "הפרטים נקלטו. אפשר לבחור עכשיו אמצעי תשלום.",
    });
  } catch (error) {
    if ((error as Error).message === "invalid_email") {
      return NextResponse.json({ ok: false, message: "צריך להזין כתובת מייל תקינה." }, { status: 400 });
    }

    if ((error as Error).message === "invalid_phone") {
      return NextResponse.json({ ok: false, message: "צריך להזין מספר טלפון תקין." }, { status: 400 });
    }

    console.error("Registration request failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "שגיאה בשמירת פרטי ההרשמה. ב-Vercel צריך להגדיר Redis/Upstash env vars לשמירת פניות.",
      },
      { status: 500 }
    );
  }
}
