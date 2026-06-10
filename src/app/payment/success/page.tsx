"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type State = "loading" | "success" | "error";

const STORAGE_KEY = "infi_pending_payment";

interface PendingPayment {
  email: string;
  plan: "basic" | "pro";
  token: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("מאמת תשלום ומפעיל גישה...");
  const [email, setEmail] = useState("");

  useEffect(() => {
    void activate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function activate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState("error");
        setMessage("לא נמצאו פרטי תשלום. אנא חוזרים להתחברות.");
        return;
      }

      const pending = JSON.parse(raw) as PendingPayment;
      setEmail(pending.email);

      const res = await fetch("/api/payment/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pending.token }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string; email?: string };

      if (res.ok && data.ok) {
        localStorage.removeItem(STORAGE_KEY);
        setState("success");
        setMessage("גישה הופעלה בהצלחה! מועברים לאתר...");
        if (data.email) setEmail(data.email);
        setTimeout(() => router.push("/dashboard"), 1800);
      } else {
        setState("error");
        setMessage(data.message ?? "שגיאה בהפעלת הגישה. אנא פנו לתמיכה.");
      }
    } catch {
      setState("error");
      setMessage("שגיאת תקשורת. נסו שוב.");
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-5"
      style={{ background: "var(--bg-page)" }}
      dir="rtl"
    >
      <div
        className="w-full max-w-sm rounded-[30px] bg-white px-8 py-10 text-center"
        style={{ boxShadow: "0px 0px 40px rgba(15,34,64,0.12)" }}
      >
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" style={{ color: "var(--navy-mid)" }} />
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {message}
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10" style={{ color: "var(--green-mid)" }} />
            <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
              ברוכה הבאה!
            </p>
            {email && (
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-secondary)" }} dir="ltr">
                {email}
              </p>
            )}
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-10 w-10" style={{ color: "var(--red-mid)" }} />
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              בעיה בהפעלת הגישה
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {message}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-5 h-10 w-full rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0f2240, #1e3a5f)" }}
            >
              חזרה לדף הכניסה
            </button>
          </>
        )}
      </div>
    </div>
  );
}
