"use client";

import { FormEvent, useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";

type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; email: string }
  | { status: "blocked"; message?: string };

const DEVICE_ID_STORAGE_KEY = "infi_device_id";
let fallbackDeviceId = "";

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateDeviceId(): string {
  try {
    const existingDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existingDeviceId) return existingDeviceId;

    const deviceId = createDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  } catch {
    fallbackDeviceId ||= createDeviceId();
    return fallbackDeviceId;
  }
}

export function AuthGate() {
  const [authState, setAuthState] = useState<AuthState>({ status: "checking" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [requiresDeviceConfirmation, setRequiresDeviceConfirmation] = useState(false);
  const authMessage = authState.status === "blocked" ? authState.message : undefined;

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/status", {
          headers: { "x-infi-device-id": getOrCreateDeviceId() },
        });
        const data = (await response.json()) as { ok?: boolean; email?: string; reason?: string };

        if (!isMounted) return;

        if (response.ok && data.ok && data.email) {
          setAuthState({ status: "authenticated", email: data.email });
          return;
        }

        setAuthState({
          status: "blocked",
          message:
            data.reason === "ip_mismatch"
              ? "אפשר להתחבר רק דרך המחשב הזה."
              : data.reason === "not_allowed"
                ? "המייל הזה לא נמצא ברשימת המורשים."
              : undefined,
        });
      } catch {
        if (isMounted) {
          setAuthState({ status: "blocked", message: "לא הצלחתי לבדוק את החיבור כרגע." });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function requestLogin(confirmDevice: boolean) {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-infi-device-id": getOrCreateDeviceId(),
        },
        body: JSON.stringify({ email, confirmDevice }),
      });
      const data = (await response.json()) as { ok?: boolean; email?: string; message?: string; reason?: string };

      if (response.ok && data.ok && data.email) {
        setAuthState({ status: "authenticated", email: data.email });
        return;
      }

      if (response.status === 409 && data.reason === "requires_device_confirmation") {
        setRequiresDeviceConfirmation(true);
        setMessage(data.message ?? "האם זה המחשב שתרצה להשאיר קבוע ליוזר שלך?");
        return;
      }

      setRequiresDeviceConfirmation(false);
      setMessage(data.message ?? "לא ניתן להתחבר כרגע.");
    } catch {
      setMessage("שגיאת תקשורת. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void requestLogin(false);
  }

  if (authState.status === "authenticated") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8"
      style={{ background: "rgba(15, 14, 12, 0.58)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border bg-white p-5 shadow-2xl"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--navy)" }}
          >
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="auth-title" className="text-lg font-black">
              כניסה לאתר
            </h2>
            <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              הכניסה זמינה רק דרך המחשב הזה.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-bold" htmlFor="auth-email">
          מייל
        </label>
        <div
          className="flex items-center gap-2 rounded-lg border bg-white px-3"
          style={{ borderColor: "var(--border)" }}
        >
          <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setRequiresDeviceConfirmation(false);
            }}
            disabled={authState.status === "checking" || isSubmitting}
            className="min-h-11 w-full bg-transparent text-left outline-none disabled:opacity-60"
            dir="ltr"
            placeholder="name@example.com"
          />
        </div>

        {(message || authState.status === "checking" || authMessage) && (
          <p
            className="mt-3 min-h-6 text-sm font-semibold leading-6"
            style={{ color: message || authMessage ? "var(--red-mid)" : "var(--text-muted)" }}
          >
            {authState.status === "checking" ? "בודק חיבור..." : message || authMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={authState.status === "checking" || isSubmitting}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "var(--navy)" }}
        >
          {isSubmitting ? "מתחבר..." : "כניסה"}
        </button>

        {requiresDeviceConfirmation && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void requestLogin(true)}
            className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "var(--red-border)", color: "var(--red-mid)", background: "var(--red-light)" }}
          >
            כן, זה המחשב הקבוע שלי
          </button>
        )}
      </form>
    </div>
  );
}
