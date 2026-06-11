"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw } from "lucide-react";

const STORAGE_KEY = "infi_pending_payment";

interface PendingPayment {
  email: string;
  plan: "basic" | "pro";
  token: string;
}

export default function PaymentFailurePage() {
  const router = useRouter();
  const [reported, setReported] = useState(false);

  useEffect(() => {
    async function reportFailure() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const pending = JSON.parse(raw) as PendingPayment;
          await fetch("/api/payment/failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pending.email, status: "failed" }),
          });
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch { /* silent */ } finally {
        setReported(true);
      }
    }
    void reportFailure();
  }, []);

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
        <XCircle className="mx-auto mb-4 h-10 w-10" style={{ color: "var(--red-mid)" }} />
        <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
          התשלום לא הושלם
        </p>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          לא חויבת. ניתן לנסות שוב או לפנות אלינו בוואטסאפ.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #0f2240, #1e3a5f)" }}
          >
            <RefreshCw className="h-4 w-4" />
            נסי שוב
          </button>
          <a
            href="https://wa.me/972587878676"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-full items-center justify-center rounded-full border text-sm font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            פנייה לתמיכה
          </a>
        </div>

        {reported && (
          <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
            השגיאה דווחה אוטומטית
          </p>
        )}
      </div>
    </div>
  );
}
