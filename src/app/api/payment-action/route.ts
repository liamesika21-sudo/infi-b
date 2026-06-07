import { NextResponse } from "next/server";
import {
  recordPaymentAction,
  type PaymentActionType,
  type PaymentMethod,
  type RegistrationPlan,
} from "@/lib/simple-auth";

export const runtime = "nodejs";

function parsePlan(value: unknown): RegistrationPlan {
  return value === "pro" ? "pro" : "basic";
}

function parseMethod(value: unknown): PaymentMethod | null {
  return value === "bit" || value === "paybox" || value === "credit" ? value : null;
}

function parseAction(value: unknown): PaymentActionType {
  return value === "payment_link_opened" ? "payment_link_opened" : "manual_instructions_shown";
}

export async function POST(request: Request) {
  let body: {
    email?: unknown;
    phone?: unknown;
    plan?: unknown;
    method?: unknown;
    action?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "בקשה לא תקינה." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const phone = typeof body.phone === "string" ? body.phone : undefined;
  const method = parseMethod(body.method);

  if (!method) {
    return NextResponse.json({ ok: false, message: "אמצעי תשלום לא תקין." }, { status: 400 });
  }

  try {
    const paymentAction = await recordPaymentAction(
      email,
      parsePlan(body.plan),
      method,
      parseAction(body.action),
      request,
      phone
    );

    return NextResponse.json({ ok: true, paymentAction });
  } catch (error) {
    if ((error as Error).message === "invalid_email") {
      return NextResponse.json({ ok: false, message: "צריך להזין כתובת מייל תקינה." }, { status: 400 });
    }

    console.error("Payment action failed", error);
    return NextResponse.json({ ok: false, message: "שגיאה בשמירת פעולת התשלום." }, { status: 500 });
  }
}
