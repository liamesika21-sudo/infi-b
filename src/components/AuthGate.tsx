"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { CheckCircle2, Lock, Mail, Phone, Sparkles, UserPlus } from "lucide-react";

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

export function AuthGate({
  onAuthenticated,
}: {
  onAuthenticated?: (email: string, options?: { showOnboarding?: boolean }) => void;
}) {
  const [authState, setAuthState] = useState<AuthState>({ status: "checking" });
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("basic");
  const [acceptedSingleDeviceNotice, setAcceptedSingleDeviceNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const authMessage = authState.status === "blocked" ? authState.message : undefined;
  const registrationTotal = selectedPlan === "pro" ? 49 : 19;

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
          onAuthenticated?.(data.email);
          return;
        }

        setAuthState({
          status: "blocked",
          message:
            data.reason === "ip_mismatch"
              ? "צריך להתחבר מחדש עם המייל."
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
  }, [onAuthenticated]);

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
      const data = (await response.json()) as {
        ok?: boolean;
        email?: string;
        isFirstLogin?: boolean;
        message?: string;
        reason?: string;
      };

      if (response.ok && data.ok && data.email) {
        setAuthState({ status: "authenticated", email: data.email });
        onAuthenticated?.(data.email, { showOnboarding: data.isFirstLogin === true });
        return;
      }

      setMessage(data.message ?? "לא ניתן להתחבר כרגע.");
      if (data.reason === "not_allowed") {
        setMode("register");
        setRegistrationMessage("המייל לא ברשימת המורשים. אפשר להשאיר פרטים להרשמה.");
      }
    } catch {
      setMessage("שגיאת תקשורת. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestRegistration() {
    setIsRegisterSubmitting(true);
    setRegistrationMessage("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-infi-device-id": getOrCreateDeviceId(),
        },
        body: JSON.stringify({ email, phone, plan: selectedPlan }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      setRegistrationMessage(data.message ?? (response.ok ? "הפרטים נקלטו." : "לא ניתן לשמור כרגע."));
    } catch {
      setRegistrationMessage("שגיאת תקשורת. נסי שוב.");
    } finally {
      setIsRegisterSubmitting(false);
    }
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedSingleDeviceNotice) {
      setMessage("צריך לאשר את תנאי החיבור ממסך אחד לפני הכניסה.");
      return;
    }
    void requestLogin(false);
  }

  function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void requestRegistration();
  }

  if (authState.status === "authenticated") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8"
      style={{
        background: "linear-gradient(135deg, rgba(240,244,249,0.88), rgba(255,255,255,0.72))",
        backdropFilter: "blur(10px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <form
        onSubmit={mode === "login" ? handleLoginSubmit : handleRegistrationSubmit}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border bg-white p-6 shadow-2xl"
        style={{
          borderColor: "var(--navy-border)",
          boxShadow: "0 18px 50px rgba(15, 34, 64, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
          style={{ background: "linear-gradient(90deg, var(--navy), var(--teal), var(--navy-mid))" }}
          aria-hidden="true"
        />

        <div className="mb-5 flex flex-col items-center text-center">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-white shadow-sm"
            style={{ background: "var(--navy)", borderColor: "var(--navy-border)" }}
          >
            {mode === "login" ? (
              <Lock className="h-6 w-6" aria-hidden="true" />
            ) : (
              <UserPlus className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
          <h2 id="auth-title" className="mt-3 text-2xl font-black">
            {mode === "login" ? "כניסה לאתר" : "הרשמה לאתר"}
          </h2>
          <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {mode === "login" ? "התחברות עם מייל מורשה בלבד." : "השאירי פרטים ונציג את הפנייה באדמין."}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border bg-[var(--bg-subtle)] p-1" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setRegistrationMessage("");
            }}
            className="min-h-10 rounded-md text-sm font-black transition"
            style={{
              background: mode === "login" ? "white" : "transparent",
              color: mode === "login" ? "var(--navy)" : "var(--text-secondary)",
            }}
          >
            כניסה
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
            className="min-h-10 rounded-md text-sm font-black transition"
            style={{
              background: mode === "register" ? "white" : "transparent",
              color: mode === "register" ? "var(--navy)" : "var(--text-secondary)",
            }}
          >
            הירשם עכשיו
          </button>
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
            }}
            disabled={authState.status === "checking" || isSubmitting}
            className="min-h-11 w-full bg-transparent text-left outline-none disabled:opacity-60"
            dir="ltr"
            placeholder="name@example.com"
          />
        </div>

        {mode === "register" && (
          <>
            <label className="mb-2 mt-3 block text-sm font-bold" htmlFor="register-phone">
              טלפון
            </label>
            <div
              className="flex items-center gap-2 rounded-lg border bg-white px-3"
              style={{ borderColor: "var(--border)" }}
            >
              <Phone className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
              <input
                id="register-phone"
                type="tel"
                required={mode === "register"}
                autoComplete="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                }}
                disabled={isRegisterSubmitting}
                className="min-h-11 w-full bg-transparent text-left outline-none disabled:opacity-60"
                dir="ltr"
                placeholder="050-0000000"
              />
            </div>

            <fieldset className="mt-4 grid gap-2">
              <legend className="mb-2 text-sm font-bold">מסלול</legend>

              <PlanOption
                checked={selectedPlan === "basic"}
                title="Basic"
                price="19₪"
                description="גישה מלאה למסך אחד."
                onSelect={() => {
                  setSelectedPlan("basic");
                }}
              />
              <PlanOption
                checked={selectedPlan === "pro"}
                title="Pro"
                price="49₪"
                description="כולל מנטור צ'אט שמכיר הרצאות, תרגולים, תמלולים וסיכומים."
                icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                onSelect={() => {
                  setSelectedPlan("pro");
                }}
              />
            </fieldset>

            <div className="mt-3 flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-black" style={{ borderColor: "var(--border)" }}>
              <span>סה&quot;כ לתשלום</span>
              <span className="font-mono text-lg">{registrationTotal}₪</span>
            </div>
          </>
        )}

        {mode === "login" && (message || authState.status === "checking" || authMessage) && (
          <p
            className="mt-3 min-h-6 text-sm font-semibold leading-6"
            style={{ color: message || authMessage ? "var(--red-mid)" : "var(--text-muted)" }}
          >
            {authState.status === "checking" ? "בודק חיבור..." : message || authMessage}
          </p>
        )}

        {mode === "login" && (
          <label
            className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-semibold leading-6"
            style={{
              background: acceptedSingleDeviceNotice ? "var(--navy-light)" : "var(--amber-light)",
              borderColor: acceptedSingleDeviceNotice ? "var(--navy-border)" : "var(--amber-border)",
              color: acceptedSingleDeviceNotice ? "var(--navy-mid)" : "var(--amber)",
            }}
          >
            <input
              type="checkbox"
              checked={acceptedSingleDeviceNotice}
              onChange={(event) => {
                setAcceptedSingleDeviceNotice(event.target.checked);
                if (event.target.checked && message === "צריך לאשר את תנאי החיבור ממסך אחד לפני הכניסה.") {
                  setMessage("");
                }
              }}
              className="mt-1 h-4 w-4"
            />
            <span>
              אני מבין/ה שהגישה מוגבלת למסך אחד. המכשיר שממנו אתחבר אמור להיות המכשיר העיקרי לשימוש ביוזר הזה, וחיבור ממסך נוסף עלול לגרום לחסימת המשתמש.
            </span>
          </label>
        )}

        {mode === "register" && registrationMessage && (
          <p
            className="mt-3 flex min-h-6 items-start gap-2 text-sm font-semibold leading-6"
            style={{ color: registrationMessage.includes("נקלטו") ? "var(--green)" : "var(--red-mid)" }}
          >
            {registrationMessage.includes("נקלטו") && <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />}
            <span>{registrationMessage}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={
            mode === "login"
              ? authState.status === "checking" || isSubmitting || !acceptedSingleDeviceNotice
              : isRegisterSubmitting
          }
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full px-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-55"
          style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-mid))" }}
        >
          {mode === "login"
            ? isSubmitting
              ? "מתחבר..."
              : "כניסה"
            : isRegisterSubmitting
              ? "שומר הרשמה..."
              : "שליחת פרטים"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition hover:bg-[var(--bg-subtle)]"
            style={{ borderColor: "var(--border)", color: "var(--navy)" }}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            לא רשומה? הירשם עכשיו
          </button>
        )}

        <div
          className="mt-4 rounded-lg border px-3 py-2 text-xs font-semibold leading-6"
          style={{
            background: mode === "login" ? "var(--navy-light)" : "var(--amber-light)",
            borderColor: mode === "login" ? "var(--navy-border)" : "var(--amber-border)",
            color: mode === "login" ? "var(--navy-mid)" : "var(--amber)",
          }}
        >
          {mode === "login"
            ? "המערכת לא תחסום בפועל בשלב הכניסה, אבל חשוב להשתמש ביוזר ממסך אחד בלבד בהתאם לתנאי הגישה."
            : "ההרשמה אינה פותחת גישה אוטומטית. לאחר אישור ותשלום המייל יתווסף לרשימת המורשים."}
        </div>
      </form>
    </div>
  );
}

function PlanOption({
  checked,
  title,
  price,
  description,
  icon,
  onSelect,
}: {
  checked: boolean;
  title: string;
  price: string;
  description: string;
  icon?: ReactNode;
  onSelect: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm font-semibold leading-6"
      style={{
        background: checked ? "var(--purple-light)" : "white",
        borderColor: checked ? "var(--purple-border)" : "var(--border)",
        color: checked ? "var(--purple)" : "var(--text-secondary)",
      }}
    >
      <input
        type="radio"
        name="registration-plan"
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 font-black">
            {icon}
            {title}
          </span>
          <span className="font-mono text-base font-black">{price}</span>
        </span>
        <span className="mt-1 block">{description}</span>
      </span>
    </label>
  );
}
