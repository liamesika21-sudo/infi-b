"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown, BookOpen, Link2, Star } from "lucide-react";
import type { HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";

type HintLevel = 0 | 1 | 2 | 3 | 4;

interface HintStep {
  level: HintLevel;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  content: (q: HomeworkQuestionPriority) => string | null;
}

const HINT_STEPS: HintStep[] = [
  {
    level: 1,
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    label: "נושא",
    color: "var(--teal)",
    bgColor: "var(--teal-light)",
    borderColor: "var(--teal-border)",
    content: (q) =>
      q.topicIds.length > 0
        ? `הנושא של שאלה זו: ${q.topicIds.join(" · ")}`
        : "שאלה עם נושאים מרובים — בדקי לפי הכלים הנדרשים.",
  },
  {
    level: 2,
    icon: <BookOpen className="h-3.5 w-3.5" />,
    label: "תרגול",
    color: "var(--navy-mid)",
    bgColor: "var(--navy-light)",
    borderColor: "var(--navy-border)",
    content: (q) =>
      `שאלה זו מבוססת על תרגול ${q.homeworkNumber} + הרצאה ${q.homeworkNumber - 1 > 0 ? q.homeworkNumber - 1 : q.homeworkNumber}.` +
      ` כדאי לחזור לתרגול ${q.homeworkNumber} לדוגמאות דומות.`,
  },
  {
    level: 3,
    icon: <Link2 className="h-3.5 w-3.5" />,
    label: "מה צריך לדעת",
    color: "var(--purple)",
    bgColor: "var(--purple-light)",
    borderColor: "var(--purple-border)",
    content: (q) =>
      q.requiredKnowledge.length > 0
        ? `לפתרון שאלה זו נדרש: ${q.requiredKnowledge.join(" · ")}`
        : `נדרשת הבנת הנושא: ${q.topicIds.slice(0, 2).join(" + ")}`,
  },
  {
    level: 4,
    icon: <Star className="h-3.5 w-3.5" />,
    label: "המלצה מלאה",
    color: "var(--amber-mid)",
    bgColor: "var(--amber-light)",
    borderColor: "var(--amber-border)",
    content: (q) => q.recommendedAction,
  },
];

export function HomeworkHintSystem({
  question,
}: {
  question: HomeworkQuestionPriority;
}) {
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);

  const nextStep = HINT_STEPS.find((s) => s.level > hintLevel);
  const shownSteps = HINT_STEPS.filter((s) => s.level <= hintLevel);

  function advance() {
    if (hintLevel < 4) setHintLevel((prev) => (prev + 1) as HintLevel);
  }

  function reset() {
    setHintLevel(0);
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Shown hints */}
      {shownSteps.map((step) => {
        const text = step.content(question);
        if (!text) return null;
        return (
          <div
            key={step.level}
            className="rounded-xl border-r-4 px-3.5 py-2.5 text-sm"
            style={{
              borderColor: step.color,
              background: step.bgColor,
              border: `1.5px solid ${step.borderColor}`,
              borderRightColor: step.color,
              borderRightWidth: "4px",
            }}
          >
            <div
              className="flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-wider"
              style={{ color: step.color }}
            >
              {step.icon}
              {step.label}
            </div>
            <p style={{ color: "var(--text-secondary)" }}>{text}</p>
          </div>
        );
      })}

      {/* Advance button or done */}
      {nextStep ? (
        <button
          onClick={advance}
          className="hint-pill"
          style={{
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            border: "1.5px solid var(--border)",
          }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
          {hintLevel === 0 ? "צריכה כיוון?" : `עוד רמז: ${nextStep.label}`}
        </button>
      ) : (
        <button
          onClick={reset}
          className="hint-pill text-xs"
          style={{
            background: "var(--bg-inset)",
            color: "var(--text-muted)",
            border: "1.5px solid var(--border)",
          }}
        >
          הסתר רמזים
        </button>
      )}
    </div>
  );
}
