"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

type TourStep = {
  target: string;
  eyebrow: string;
  title: string;
  body: string;
};

type TargetRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_VERSION = "v1";

const TOUR_STEPS: TourStep[] = [
  {
    target: "app-header",
    eyebrow: "ניווט ראשי",
    title: "מכאן עוברים בין כל אזורי הלמידה",
    body: "השורה העליונה נשארת איתך בכל עמוד: שבועות, נוסחאות, תרגול, סימולציות, מנטור ועוד.",
  },
  {
    target: "nav-weeks",
    eyebrow: "שבועות",
    title: "לימוד לפי סדר הקורס",
    body: "בעמוד שבועות תמצאי את החומר לפי שבוע, סיכומים, תרגולים וקישורים לנושאים המרכזיים.",
  },
  {
    target: "nav-formulas",
    eyebrow: "נוסחאות",
    title: "בנק נוסחאות מרוכז",
    body: "כאן מחפשים נוסחאות ומשפטים במהירות כשאת פותרת תרגילים או עושה חזרה לפני מבחן.",
  },
  {
    target: "nav-practice",
    eyebrow: "תרגול",
    title: "אזור עבודה לשאלות",
    body: "בעמוד תרגול עוברים לשאלות ממוקדות לפי נושאים ורמות חשיבות, כדי להבין איפה להשקיע זמן.",
  },
  {
    target: "nav-simulations",
    eyebrow: "סימולציות",
    title: "בדיקת מוכנות למבחן",
    body: "הסימולציות מיועדות להרצה מלאה יותר, עם תחושת זמן ומבנה קרוב יותר למבחן.",
  },
  {
    target: "nav-mentor",
    eyebrow: "מנטור",
    title: "עזרה נקודתית כשנתקעים",
    body: "המנטור מיועד לשאלות הבנה, כיווני פתרון וחיבור בין נושאים. אם יש מגבלת קרדיטים, כדאי להשתמש בו לשאלות שקשה לפתור לבד.",
  },
  {
    target: "exam-countdown",
    eyebrow: "ספירה לאחור",
    title: "כמה זמן נשאר",
    body: "המספר בצד מציג כמה ימים נשארו עד המבחן, כדי לעזור לתעדף חזרה, תרגול וסימולציות.",
  },
];

function getStorageKey(email: string): string {
  return `infi_onboarding_seen_${TOUR_VERSION}_${email.trim().toLowerCase()}`;
}

function getTargetRect(target: string): TargetRect | null {
  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    right: window.innerWidth - rect.right,
    bottom: window.innerHeight - rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

export function OnboardingTour({ email, enabled }: { email: string | null; enabled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const currentStep = TOUR_STEPS[stepIndex];
  const storageKey = useMemo(() => (email ? getStorageKey(email) : ""), [email]);

  useEffect(() => {
    if (!enabled || !email || !storageKey) return;

    try {
      if (localStorage.getItem(storageKey) === "true") return;
    } catch {
      return;
    }

    const openTimer = window.setTimeout(() => {
      setIsOpen(true);
    }, 450);

    return () => {
      window.clearTimeout(openTimer);
    };
  }, [email, enabled, storageKey]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    function updateTargetRect() {
      setTargetRect(getTargetRect(currentStep.target));
    }

    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [currentStep, isOpen]);

  function closeTour() {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // If storage is blocked, closing still hides the tour for this session.
      }
    }

    setIsOpen(false);
  }

  function goNext() {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      closeTour();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  if (!isOpen || !currentStep) return null;

  const cardPosition = getCardPosition(targetRect);
  const targetArrow = getTargetArrow(targetRect);
  const highlightStyle = targetRect
    ? {
        top: targetRect.top - 6,
        left: targetRect.left - 6,
        width: targetRect.width + 12,
        height: targetRect.height + 12,
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-[90]" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="absolute inset-0 bg-black/45" />

      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-lg border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={highlightStyle}
          aria-hidden="true"
        />
      )}

      {targetArrow && (
        <div
          className="pointer-events-none fixed flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--navy)] shadow-xl"
          style={targetArrow.style}
          aria-hidden="true"
        >
          {targetArrow.direction === "left" ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </div>
      )}

      <div
        className="fixed w-[min(92vw,380px)] rounded-lg border bg-white p-4 shadow-2xl"
        style={{
          ...cardPosition,
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black" style={{ color: "var(--teal)" }}>
              {currentStep.eyebrow}
            </p>
            <h2 id="tour-title" className="mt-1 text-lg font-black leading-7">
              {currentStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTour}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition hover:bg-[var(--bg-subtle)]"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            aria-label="סגירת הסבר"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold leading-7" style={{ color: "var(--text-secondary)" }}>
          {currentStep.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-black" style={{ color: "var(--text-muted)" }} dir="ltr">
            {stepIndex + 1}/{TOUR_STEPS.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTour}
              className="min-h-10 rounded-lg border px-3 text-sm font-black transition hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              דלגי
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-black text-white transition"
              style={{ background: "var(--navy)" }}
            >
              {stepIndex >= TOUR_STEPS.length - 1 ? (
                <>
                  סיום
                  <Check className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  המשך
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCardPosition(targetRect: TargetRect | null): CSSProperties {
  if (!targetRect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const cardWidth = Math.min(window.innerWidth * 0.92, 380);
  const preferredTop = targetRect.top + targetRect.height + 18;
  const top =
    preferredTop + 280 < window.innerHeight
      ? preferredTop
      : Math.max(16, targetRect.top - 296);
  const left = Math.min(
    Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
    window.innerWidth - cardWidth - 16
  );

  return {
    top,
    left,
  };
}

function getTargetArrow(
  targetRect: TargetRect | null
): { direction: "left" | "right"; style: CSSProperties } | null {
  if (!targetRect) return null;

  const hasSpaceOnRight = targetRect.left + targetRect.width + 56 < window.innerWidth;
  const top = Math.min(
    Math.max(16, targetRect.top + targetRect.height / 2 - 20),
    window.innerHeight - 56
  );

  if (hasSpaceOnRight) {
    return {
      direction: "left",
      style: {
        top,
        left: targetRect.left + targetRect.width + 12,
      },
    };
  }

  return {
    direction: "right",
    style: {
      top,
      left: Math.max(16, targetRect.left - 52),
    },
  };
}
