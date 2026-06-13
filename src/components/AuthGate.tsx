"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard, Lock, Mail, Phone, ShieldCheck, Sparkles, UserPlus, WalletCards } from "lucide-react";
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
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const cached = localStorage.getItem("infi_auth_cache");
      if (cached) {
        const { email: e } = JSON.parse(cached) as { email?: string };
        if (typeof e === "string" && e) return e;
      }
    } catch {}
    return "";
  });
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("basic");
  const [acceptedSingleDeviceNotice, setAcceptedSingleDeviceNotice] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !!localStorage.getItem("infi_auth_cache"); } catch { return false; }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState<RegistrationComplete | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod | null>(null);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const authMessage = authState.status === "blocked" ? authState.message : undefined;
  const registrationTotal = selectedPlan === "pro" ? 49 : 19;

  useEffect(() => {
    let isMounted = true;

    // Optimistic auth: if localStorage has a cached email, show as authenticated immediately
    // while server validates in background. Eliminates the modal flash for returning users.
    try {
      const cached = localStorage.getItem("infi_auth_cache");
      if (cached) {
        const { email: cachedEmail } = JSON.parse(cached) as { email?: string };
        if (typeof cachedEmail === "string" && cachedEmail) {
          setAuthState({ status: "authenticated", email: cachedEmail });
          onAuthenticated?.(cachedEmail);
        }
      }
    } catch { /* localStorage may be unavailable */ }

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/status", {
          headers: { "x-infi-device-id": getOrCreateDeviceId() },
        });
        const data = (await response.json()) as { ok?: boolean; email?: string; reason?: string };

        if (!isMounted) return;

        if (response.ok && data.ok && data.email) {
          try { localStorage.setItem("infi_auth_cache", JSON.stringify({ email: data.email })); } catch {}
          setAuthState({ status: "authenticated", email: data.email });
          onAuthenticated?.(data.email);
          return;
        }

        // Server denied — clear cache
        try { localStorage.removeItem("infi_auth_cache"); } catch {}

        // detect abandoned payment: not authenticated but pending payment in localStorage
        try {
          const raw = localStorage.getItem("infi_pending_payment");
          if (raw) {
            const pending = JSON.parse(raw) as { email?: string; plan?: string };
            if (pending?.email) {
              void fetch("/api/payment/failed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pending.email, status: "abandoned" }),
                keepalive: true,
              }).catch(() => {});
            }
            localStorage.removeItem("infi_pending_payment");
          }
        } catch { /* silent */ }

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
        // Network error: if we already set optimistic auth, keep it; otherwise block
        if (isMounted) {
          setAuthState((prev) =>
            prev.status === "authenticated"
              ? prev
              : { status: "blocked", message: "לא הצלחתי לבדוק את החיבור כרגע." }
          );
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
        try { localStorage.setItem("infi_auth_cache", JSON.stringify({ email: data.email })); } catch {}
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
        headers: { "Content-Type": "application/json", "x-infi-device-id": getOrCreateDeviceId() },
        body: JSON.stringify({ email, phone, plan: selectedPlan }),
      });
      const data = (await response.json()) as {
        ok?: boolean; email?: string; phone?: string; plan?: "basic" | "pro";
        totalPriceIls?: number; paymentPageUrl?: string; message?: string;
      };

      if (response.ok && data.ok && data.email && data.plan && data.paymentPageUrl) {
        // Go straight to PayPlus — no intermediate screen
        await initCreditPayment(data.paymentPageUrl, data.email, data.plan);
      } else {
        setRegistrationMessage(data.message ?? "לא ניתן לשמור כרגע.");
        setIsRegisterSubmitting(false);
      }
    } catch {
      setRegistrationMessage("שגיאת תקשורת. נסי שוב.");
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

  async function initCreditPayment(paymentUrl: string, emailAddr: string, planName: string) {
    setIsRedirectingToPayment(true);
    try {
      const res = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddr, plan: planName }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string };
      if (res.ok && data.token) {
        localStorage.setItem("infi_pending_payment", JSON.stringify({ email: emailAddr, plan: planName, token: data.token }));
      }
    } catch { /* proceed anyway */ }
    window.location.href = paymentUrl;
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

  function switchToLogin() { setMode("login"); setRegistrationMessage(""); setRegistrationComplete(null); setActivePaymentMethod(null); }
  function switchToRegister() { setMode("register"); setMessage(""); setRegistrationComplete(null); setActivePaymentMethod(null); }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(8,20,45,0.82)", backdropFilter: "blur(14px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        className="w-full max-w-90 overflow-hidden rounded-[28px]"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)" }}
      >
        {/* ── Card header ── */}
        <div
          className="relative px-8 pb-6 pt-8 text-center"
          style={{ background: "linear-gradient(135deg, #0f2240 0%, #0d5c6e 100%)" }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #3be0f0, transparent)" }} />
          <div className="pointer-events-none absolute -bottom-6 -left-8 h-24 w-24 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />

          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {mode === "login"
              ? <Lock className="h-5 w-5 text-white" />
              : <UserPlus className="h-5 w-5 text-white" />}
          </div>

          <h2 id="auth-title" className="text-xl font-black text-white">
            {mode === "login" ? "כניסה למערכת" : "הרשמה לאינפי ב׳"}
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            {mode === "login" ? "התחברי עם המייל שלך" : "גישה לכל חומרי הקורס"}
          </p>
        </div>

        {/* ── Card body ── */}
        <form
          onSubmit={mode === "login" ? handleLoginSubmit : handleRegistrationSubmit}
          className="bg-white px-7 pb-7 pt-6"
        >
          {isRedirectingToPayment ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--navy-light)" }}>
                <CreditCard className="h-6 w-6 animate-pulse" style={{ color: "#0f2240" }} />
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>מעביר לדף התשלום...</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>תועבר חזרה אוטומטית לאחר התשלום</p>
            </div>
          ) : (
            <>
              {/* Email */}
              <div className="relative mb-1 flex items-center">
                <Mail className="absolute right-2.5 h-4 w-4" style={{ color: "#0d5c6e" }} aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authState.status === "checking" || isSubmitting}
                  className="auth-underline-input w-full py-2.5 pr-9 pl-2 text-sm disabled:opacity-50"
                  dir="ltr"
                  placeholder="name@example.com"
                />
              </div>

              {mode === "register" && (
                <>
                  {/* Phone */}
                  <div className="relative mb-1 mt-4 flex items-center">
                    <Phone className="absolute right-2.5 h-4 w-4" style={{ color: "#0d5c6e" }} aria-hidden="true" />
                    <input
                      id="register-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isRegisterSubmitting}
                      className="auth-underline-input w-full py-2.5 pr-9 pl-2 text-sm disabled:opacity-50"
                      dir="ltr"
                      placeholder="050-0000000"
                    />
                  </div>

                  {/* Single-device notice */}
                  <div className="mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium leading-5" style={{ borderColor: "var(--amber-border)", background: "var(--amber-light)", color: "var(--amber)" }}>
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>הגישה מוגבלת למכשיר אחד בלבד. הרשם מהמכשיר שממנו תעבד — חיבור ממכשיר נוסף עלול לגרום לחסימה.</span>
                  </div>

                  {/* Plan */}
                  <fieldset className="mt-4 space-y-2">
                    <legend className="mb-2.5 text-xs font-black" style={{ color: "var(--text-secondary)" }}>בחרי מסלול</legend>
                    <PlanOption checked={selectedPlan === "basic"} title="Basic" price="19₪" description="גישה מלאה לכל החומר." onSelect={() => setSelectedPlan("basic")} />
                    <PlanOption checked={selectedPlan === "pro"} title="Pro" price="49₪" description="כולל מנטור AI מבוסס חומר הקורס." icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />} onSelect={() => setSelectedPlan("pro")} />
                  </fieldset>

                  <div className="mt-3 flex items-center justify-between rounded-lg px-1 text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    <span>סה״כ לתשלום</span>
                    <span className="font-mono text-base" style={{ color: "#0f2240" }}>{registrationTotal}₪</span>
                  </div>
                </>
              )}
            </>
          )}

          {/* Messages */}
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

          {/* Single-device notice */}
          {mode === "login" && (
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs font-medium leading-5" style={{ color: acceptedSingleDeviceNotice ? "#0f2240" : "rgb(140,140,140)" }}>
              <input
                type="checkbox"
                checked={acceptedSingleDeviceNotice}
                onChange={(e) => {
                  setAcceptedSingleDeviceNotice(e.target.checked);
                  if (e.target.checked && message === "צריך לאשר את תנאי החיבור ממסך אחד לפני הכניסה.") setMessage("");
                }}
                className="mt-0.5 h-3.5 w-3.5 accent-[#0f2240]"
              />
              <span>אני מבין/ה שהגישה מוגבלת למסך אחד בלבד.</span>
            </label>
          )}

          {/* Secure badge */}
          {mode === "register" && !registrationComplete && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold" style={{ color: "rgb(150,150,150)" }}>
              <ShieldCheck className="h-3 w-3 shrink-0" style={{ color: "#16a34a" }} />
              <span>תשלום מאובטח · PayPlus · SSL</span>
            </div>
          )}

          {/* Submit */}
          {!registrationComplete && (
            <button
              type="submit"
              disabled={mode === "login" ? authState.status === "checking" || isSubmitting || !acceptedSingleDeviceNotice : isRegisterSubmitting}
              className="auth-shimmer-btn relative mt-4 h-11 w-full overflow-hidden rounded-full text-sm font-bold tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0f2240 0%, #0d5c6e 100%)" }}
            >
              {mode === "login"
                ? isSubmitting ? "מתחבר..." : "כניסה"
                : isRegisterSubmitting ? "שומר..." : "המשך לתשלום"}
            </button>
          )}

          {/* Mode switch link */}
          {!registrationComplete && (
            <p className="mt-5 text-center text-xs" style={{ color: "rgb(150,150,150)" }}>
              {mode === "register" ? (
                <>
                  כבר יש לך חשבון?{" "}
                  <button type="button" onClick={switchToLogin} className="font-bold underline-offset-2 hover:underline" style={{ color: "#0f2240" }}>
                    כניסה
                  </button>
                </>
              ) : (
                <>
                  אין לך חשבון עדיין?{" "}
                  <button type="button" onClick={switchToRegister} className="font-bold underline-offset-2 hover:underline" style={{ color: "#0f2240" }}>
                    הרשמה
                  </button>
                </>
              )}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function PaymentCompletion({
  registration,
  activePaymentMethod,
  onShowManualInstructions,
  onCreditCardPay,
}: {
  registration: RegistrationComplete;
  activePaymentMethod: PaymentMethod | null;
  onShowManualInstructions: (method: PaymentMethod) => void;
  onCreditCardPay: () => void;
}) {
  const manualMethodLabel = activePaymentMethod === "paybox" ? "PayBox" : "Bit";

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border px-3 py-2.5 text-xs font-semibold leading-5"
        style={{ background: "var(--green-light)", borderColor: "var(--green-border)", color: "var(--green)" }}
      >
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>הפרטים נקלטו! בחרו אמצעי תשלום להשלמת הרכישה.</span>
        </div>
      </div>

      {/* Credit card — primary */}
      <button
        type="button"
        onClick={onCreditCardPay}
        className="auth-shimmer-btn relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-right text-sm font-bold text-white transition"
        style={{ background: "linear-gradient(135deg, #0f2240, #1e3a5f)" }}
      >
        <CreditCard className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-black">תשלום באשראי</span>
          <span className="block text-xs font-semibold opacity-80">
            {registration.totalPriceIls}₪ · PayPlus · מאובטח
          </span>
        </span>
        <ShieldCheck className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span>או העברה ידנית</span>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PaymentChoiceButton
          icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
          title="Bit"
          onClick={() => onShowManualInstructions("bit")}
        />
        <PaymentChoiceButton
          icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
          title="PayBox"
          onClick={() => onShowManualInstructions("paybox")}
        />
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
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(TRANSFER_PHONE).catch(() => {})}
            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border bg-white px-3 text-xs font-black transition hover:bg-[var(--bg-subtle)]"
            style={{ borderColor: "var(--amber-border)", color: "var(--amber)" }}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            העתקת מספר
          </button>
        </div>
      )}
    </div>
  );
}

function PaymentChoiceButton({ icon, title, onClick }: { icon: ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-bold transition hover:bg-(--bg-subtle)"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
    >
      <span className="shrink-0" style={{ color: "var(--navy-mid)" }}>{icon}</span>
      {title}
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
