"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard, ExternalLink, Lock, Mail, Phone, Sparkles, UserPlus, WalletCards } from "lucide-react";
import { getOrCreateDeviceId } from "@/lib/client-device";

type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; email: string }
  | { status: "blocked"; message?: string };

const TRANSFER_PHONE = "0587878676";

type RegistrationComplete = {
  email: string;
  phone: string;
  plan: "basic" | "pro";
  totalPriceIls: number;
  paymentPageUrl: string;
};

type PaymentMethod = "bit" | "paybox" | "credit";

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
  const [registrationComplete, setRegistrationComplete] = useState<RegistrationComplete | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod | null>(null);
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
    setRegistrationComplete(null);
    setActivePaymentMethod(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-infi-device-id": getOrCreateDeviceId(),
        },
        body: JSON.stringify({ email, phone, plan: selectedPlan }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        email?: string;
        phone?: string;
        plan?: "basic" | "pro";
        totalPriceIls?: number;
        paymentPageUrl?: string;
        message?: string;
      };

      setRegistrationMessage(data.message ?? (response.ok ? "הפרטים נקלטו." : "לא ניתן לשמור כרגע."));
      if (response.ok && data.ok && data.email && data.plan && data.paymentPageUrl) {
        setRegistrationComplete({
          email: data.email,
          phone: data.phone ?? phone,
          plan: data.plan,
          totalPriceIls: data.totalPriceIls ?? registrationTotal,
          paymentPageUrl: data.paymentPageUrl,
        });
      }
    } catch {
      setRegistrationMessage("שגיאת תקשורת. נסי שוב.");
    } finally {
      setIsRegisterSubmitting(false);
    }
  }

  function recordPaymentAction(method: PaymentMethod, action: "manual_instructions_shown" | "payment_link_opened") {
    if (!registrationComplete) return;

    const payload = JSON.stringify({
      email: registrationComplete.email,
      phone: registrationComplete.phone,
      plan: registrationComplete.plan,
      method,
      action,
    });

    try {
      if ("sendBeacon" in navigator) {
        navigator.sendBeacon("/api/payment-action", new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch {}

    void fetch("/api/payment-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
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
      style={{ background: "rgba(245,240,255,0.72)", backdropFilter: "blur(12px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <form
        onSubmit={mode === "login" ? handleLoginSubmit : handleRegistrationSubmit}
        className="w-full max-w-[320px] overflow-y-auto rounded-[30px] bg-white px-8 py-8"
        style={{ boxShadow: "0px 0px 40px rgba(128,0,255,0.12)" }}
      >
        {/* Heading */}
        <p
          id="auth-title"
          className="mb-7 text-center text-[2rem] font-bold leading-none"
          style={{ color: "#2e2e2e" }}
        >
          {mode === "login" ? "כניסה" : "הרשמה"}
        </p>

        {/* Mode toggle */}
        <div className="mb-6 flex justify-center gap-5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setMode("login"); setRegistrationMessage(""); setRegistrationComplete(null); setActivePaymentMethod(null); }}
            className="relative pb-1 transition"
            style={{ color: mode === "login" ? "#8000ff" : "rgb(150,150,150)" }}
          >
            כניסה
            {mode === "login" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full" style={{ background: "#8000ff" }} />}
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setMessage(""); setRegistrationComplete(null); setActivePaymentMethod(null); }}
            className="relative pb-1 transition"
            style={{ color: mode === "register" ? "#8000ff" : "rgb(150,150,150)" }}
          >
            הרשמה
            {mode === "register" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full" style={{ background: "#8000ff" }} />}
          </button>
        </div>

        {mode === "register" && registrationComplete ? (
          <PaymentCompletion
            registration={registrationComplete}
            activePaymentMethod={activePaymentMethod}
            onShowManualInstructions={(method) => { setActivePaymentMethod(method); recordPaymentAction(method, "manual_instructions_shown"); }}
            onOpenPaymentLink={(method) => { recordPaymentAction(method, "payment_link_opened"); }}
          />
        ) : (
          <>
            {/* Email */}
            <div className="relative mb-1 flex items-center">
              <Mail className="absolute right-2 h-4 w-4" style={{ color: "#8000ff" }} aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authState.status === "checking" || isSubmitting}
                className="auth-underline-input w-full py-2 pr-8 pl-2 text-sm disabled:opacity-50"
                dir="ltr"
                placeholder="name@example.com"
              />
            </div>

            {mode === "register" && (
              <>
                {/* Phone */}
                <div className="relative mb-1 mt-3 flex items-center">
                  <Phone className="absolute right-2 h-4 w-4" style={{ color: "#8000ff" }} aria-hidden="true" />
                  <input
                    id="register-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isRegisterSubmitting}
                    className="auth-underline-input w-full py-2 pr-8 pl-2 text-sm disabled:opacity-50"
                    dir="ltr"
                    placeholder="050-0000000"
                  />
                </div>

                {/* Plan */}
                <fieldset className="mt-5 space-y-2">
                  <legend className="mb-2 text-xs font-bold" style={{ color: "#2e2e2e" }}>מסלול</legend>
                  <PlanOption checked={selectedPlan === "basic"} title="Basic" price="19₪" description="גישה מלאה למסך אחד." onSelect={() => setSelectedPlan("basic")} />
                  <PlanOption checked={selectedPlan === "pro"} title="Pro" price="49₪" description="כולל מנטור AI מבוסס חומר הקורס." icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />} onSelect={() => setSelectedPlan("pro")} />
                </fieldset>

                <div className="mt-3 flex items-center justify-between text-sm font-black" style={{ color: "#2e2e2e" }}>
                  <span>סה״כ</span>
                  <span className="font-mono text-base" style={{ color: "#8000ff" }}>{registrationTotal}₪</span>
                </div>
              </>
            )}
          </>
        )}

        {/* Error / status */}
        {mode === "login" && (message || authState.status === "checking" || authMessage) && (
          <p className="mt-3 min-h-5 text-xs font-semibold" style={{ color: message || authMessage ? "#dc2626" : "rgb(150,150,150)" }}>
            {authState.status === "checking" ? "בודק חיבור..." : message || authMessage}
          </p>
        )}
        {mode === "register" && registrationMessage && !registrationComplete && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold" style={{ color: registrationMessage.includes("נקלטו") ? "#16a34a" : "#dc2626" }}>
            {registrationMessage.includes("נקלטו") && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            {registrationMessage}
          </p>
        )}

        {/* Single-device checkbox */}
        {mode === "login" && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs font-medium leading-5" style={{ color: acceptedSingleDeviceNotice ? "#8000ff" : "rgb(120,120,120)" }}>
            <input
              type="checkbox"
              checked={acceptedSingleDeviceNotice}
              onChange={(e) => {
                setAcceptedSingleDeviceNotice(e.target.checked);
                if (e.target.checked && message === "צריך לאשר את תנאי החיבור ממסך אחד לפני הכניסה.") setMessage("");
              }}
              className="mt-0.5 h-3.5 w-3.5 accent-[#8000ff]"
            />
            <span>אני מבין/ה שהגישה מוגבלת למסך אחד בלבד.</span>
          </label>
        )}

        {/* Submit */}
        {!registrationComplete && (
          <button
            type="submit"
            disabled={mode === "login" ? authState.status === "checking" || isSubmitting || !acceptedSingleDeviceNotice : isRegisterSubmitting}
            className="auth-shimmer-btn relative mt-6 h-10 w-full overflow-hidden rounded-full text-sm font-semibold tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "#8000ff", border: "2px solid #8000ff" }}
          >
            {mode === "login"
              ? isSubmitting ? "מתחבר..." : "כניסה"
              : isRegisterSubmitting ? "שומר..." : "שליחת פרטים"}
          </button>
        )}

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] leading-5" style={{ color: "rgb(150,150,150)" }}>
          {mode === "login"
            ? "כניסה עם מייל מורשה בלבד."
            : "לאחר אישור ותשלום המייל יתווסף."}
        </p>
      </form>
    </div>
  );
}

function PaymentCompletion({
  registration,
  activePaymentMethod,
  onShowManualInstructions,
  onOpenPaymentLink,
}: {
  registration: RegistrationComplete;
  activePaymentMethod: PaymentMethod | null;
  onShowManualInstructions: (method: PaymentMethod) => void;
  onOpenPaymentLink: (method: PaymentMethod) => void;
}) {
  const manualMethodLabel = activePaymentMethod === "paybox" ? "PayBox" : "Bit";

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border px-4 py-3 text-sm font-semibold leading-6"
        style={{ background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }}
      >
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            הפרטים נקלטו עבור <span dir="ltr">{registration.email}</span>. בחרו אמצעי תשלום להשלמת הרכישה.
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <PaymentChoiceButton
          icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
          title="Bit"
          description="הצגת מספר להעברה ידנית."
          onClick={() => {
            onShowManualInstructions("bit");
          }}
        />
        <PaymentChoiceButton
          icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
          title="PayBox"
          description="הצגת מספר להעברה ידנית."
          onClick={() => {
            onShowManualInstructions("paybox");
          }}
        />
        <a
          href={registration.paymentPageUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            onOpenPaymentLink("credit");
          }}
          className="flex min-h-14 items-center gap-3 rounded-lg border bg-white px-3 py-2 text-sm font-bold transition hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <CreditCard className="h-4 w-4 shrink-0" style={{ color: "var(--navy-mid)" }} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block">אשראי ידני</span>
            <span className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              מעבר לדף תשלום מאובטח ב-{registration.totalPriceIls}₪.
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </div>

      {activePaymentMethod && (
        <div
          className="rounded-lg border px-4 py-3 text-sm font-semibold leading-7"
          style={{ background: "var(--amber-light)", borderColor: "var(--amber-border)", color: "var(--amber)" }}
        >
          <p className="font-black">העברה ב-{manualMethodLabel}</p>
          <p>
            יש להעביר {registration.totalPriceIls}₪ למספר{" "}
            <span className="font-mono text-base font-black" dir="ltr">
              {TRANSFER_PHONE}
            </span>
            . עד שעה תישלח חשבונית ויוזר למייל/טלפון שהשארתם.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(TRANSFER_PHONE).catch(() => {});
              }}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border bg-white px-3 text-xs font-black transition hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--amber-border)", color: "var(--amber)" }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              העתקת מספר
            </button>
            <a
              href={registration.paymentPageUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                onOpenPaymentLink("credit");
              }}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border bg-white px-3 text-xs font-black transition hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--amber-border)", color: "var(--amber)" }}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              או תשלום בדף המאובטח
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentChoiceButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 items-center gap-3 rounded-lg border bg-white px-3 py-2 text-right text-sm font-bold transition hover:bg-[var(--bg-subtle)]"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
    >
      <span className="shrink-0" style={{ color: "var(--navy-mid)" }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block">{title}</span>
        <span className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          {description}
        </span>
      </span>
    </button>
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
