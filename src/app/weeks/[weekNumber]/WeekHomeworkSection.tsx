"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import {
  loadProgress, saveProgress, hwQuestionKey,
  type DifficultyRating, type QuestionProgress,
} from "@/lib/progress-store";

export function WeekHomeworkSection({
  questions,
}: {
  questions: HomeworkQuestionPriority[];
}) {
  const visibleQuestions = questions.slice(0, 8);
  const homeworkNumber = visibleQuestions[0]?.homeworkNumber;
  const hotCount = visibleQuestions.filter((q) => q.importanceLevel === "critical" || q.importanceLevel === "high").length;

  if (visibleQuestions.length === 0) {
    return (
      <div className="rounded-2xl border p-5 text-sm font-bold" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}>
        לא נמצאו שאלות מטלה לשבוע הזה.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--bg-card)", boxShadow: "0 18px 45px rgba(15, 34, 64, 0.08)" }}
    >
      <div className="border-b px-4 py-4 sm:px-5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--navy-light), var(--bg-card))" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              טבלת מטלה
            </p>
            <h3 className="mt-1 text-base font-black" style={{ color: "var(--text-primary)" }}>
              מטלה {homeworkNumber} — שאלות לתרגול ומעקב
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SummaryBadge label={`${visibleQuestions.length} שאלות`} />
            <SummaryBadge label={`${hotCount} בעדיפות גבוהה`} tone="hot" />
          </div>
        </div>
      </div>

<div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {visibleQuestions.map((q) => (
          <HomeworkQuestionRow key={q.questionId} q={q} />
        ))}
      </div>
    </div>
  );
}

const DIFFICULTY_LABELS: { value: DifficultyRating; label: string; color: string; bg: string; border: string }[] = [
  { value: "easy",   label: "קל",    color: "var(--green)",     bg: "var(--green-light)",  border: "var(--green-border)"  },
  { value: "medium", label: "בינוני", color: "var(--amber-mid)", bg: "var(--amber-light)", border: "var(--amber-border)" },
  { value: "hard",   label: "קשה",   color: "var(--red-mid)",   bg: "var(--red-light)",    border: "var(--red-border)"    },
];

function HomeworkQuestionRow({ q }: { q: HomeworkQuestionPriority }) {
  const key = hwQuestionKey(q.homeworkNumber, q.questionId);
  const [progress, setProgress] = useState<QuestionProgress | undefined>(() => loadProgress().questions[key]);
  const isDone = progress?.done ?? false;
  const isHot = q.importanceLevel === "critical" || q.importanceLevel === "high";

  useEffect(() => {
    const refresh = () => setProgress(loadProgress().questions[key]);
    window.addEventListener("progress-updated", refresh);
    return () => window.removeEventListener("progress-updated", refresh);
  }, [key]);

  function toggleDone() {
    const data = loadProgress();
    const current = data.questions[key];
    if (current?.done) {
      delete data.questions[key];
      saveProgress(data);
      setProgress(undefined);
    } else {
      data.questions[key] = { done: true };
      saveProgress(data);
      setProgress({ done: true });
    }
    window.dispatchEvent(new Event("progress-updated"));
  }

  function setDifficulty(d: DifficultyRating) {
    const data = loadProgress();
    const current = data.questions[key] ?? { done: true };
    data.questions[key] = current.difficulty === d
      ? { done: current.done }
      : { done: true, difficulty: d };
    saveProgress(data);
    setProgress(data.questions[key]);
    window.dispatchEvent(new Event("progress-updated"));
  }

  return (
    <article
      className="flex items-center gap-2 px-4 py-2.5"
      style={{
        background: isDone
          ? "rgba(236,253,245,0.6)"
          : "var(--bg-card)",
      }}
    >
      {/* Done toggle */}
      <button
        type="button"
        onClick={toggleDone}
        title={isDone ? "סמן כלא בוצע" : "סמן כבוצע"}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition"
        style={{
          background: isDone ? "var(--green-mid)" : isHot ? "var(--amber-light)" : "var(--bg-subtle)",
          color: isDone ? "#fff" : isHot ? "var(--amber-mid)" : "var(--text-muted)",
          border: `1.5px solid ${isDone ? "var(--green-mid)" : isHot ? "var(--amber-border)" : "var(--border)"}`,
        }}
      >
        {isDone ? <Check className="h-3.5 w-3.5" /> : q.questionNumber}
      </button>

      {/* Label */}
      <span className="shrink-0 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
        ש׳ {q.questionNumber}
      </span>

      {/* Difficulty buttons */}
      <div className="flex items-center gap-1 mr-auto">
        {DIFFICULTY_LABELS.map(({ value, label, color, bg, border }) => {
          const active = progress?.difficulty === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              className="rounded-full px-2 py-0.5 text-[10px] font-black transition"
              style={{
                background: active ? bg : "transparent",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? border : "var(--border)"}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function SummaryBadge({ label, tone = "default" }: { label: string; tone?: "default" | "hot" }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-black"
      style={{
        background: tone === "hot" ? "var(--amber-light)" : "var(--bg-card)",
        color: tone === "hot" ? "var(--amber-mid)" : "var(--navy-mid)",
        border: `1px solid ${tone === "hot" ? "var(--amber-border)" : "var(--navy-border)"}`,
      }}
    >
      {label}
    </span>
  );
}

