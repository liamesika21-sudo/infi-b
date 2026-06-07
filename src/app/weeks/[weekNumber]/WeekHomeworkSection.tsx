"use client";

import { useEffect, useState } from "react";
import type { HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import { HomeworkHintSystem } from "@/components/study/HomeworkHintSystem";
import { MathContent } from "@/components/study/MathContent";
import {
  loadProgress, saveProgress, hwQuestionKey,
  type DifficultyRating, type QuestionProgress,
} from "@/lib/progress-store";

export function WeekHomeworkSection({
  questions,
}: {
  questions: HomeworkQuestionPriority[];
}) {
  return (
    <div className="space-y-3">
      {questions.slice(0, 8).map((q) => (
        <HomeworkQuestionCard key={q.questionId} q={q} />
      ))}
    </div>
  );
}

const DIFFICULTY_LABELS: { value: DifficultyRating; label: string; color: string; bg: string; border: string }[] = [
  { value: "easy",   label: "קל",    color: "var(--green)",    bg: "var(--green-light)",  border: "var(--green-border)"  },
  { value: "medium", label: "בינוני", color: "var(--amber-mid)", bg: "var(--amber-light)", border: "var(--amber-border)" },
  { value: "hard",   label: "קשה",   color: "var(--red-mid)",  bg: "var(--red-light)",    border: "var(--red-border)"    },
];

function HomeworkQuestionCard({ q }: { q: HomeworkQuestionPriority }) {
  const isHot = q.importanceLevel === "critical" || q.importanceLevel === "high";
  const questionText = getQuestionText(q.contentPreview);
  const key = hwQuestionKey(q.homeworkNumber, q.questionId);

  const [progress, setProgress] = useState<QuestionProgress | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = loadProgress();
    setProgress(data.questions[key]);
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
    if (current.difficulty === d) {
      data.questions[key] = { done: current.done };
    } else {
      data.questions[key] = { done: true, difficulty: d };
    }
    saveProgress(data);
    setProgress(data.questions[key]);
    window.dispatchEvent(new Event("progress-updated"));
  }

  const isDone = progress?.done ?? false;

  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: isDone ? "var(--green-light)" : isHot ? "var(--amber-light)" : "var(--bg-subtle)",
        border: `1.5px solid ${isDone ? "var(--green-border)" : isHot ? "var(--amber-border)" : "var(--border)"}`,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Question number + done toggle */}
        <button
          onClick={mounted ? toggleDone : undefined}
          title={isDone ? "סמן כלא נעשה" : "סמן כנעשה"}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white transition-all"
          style={{
            background: isDone ? "var(--green-mid)" : isHot ? "var(--amber-mid)" : "var(--text-muted)",
            cursor: mounted ? "pointer" : "default",
          }}
        >
          {isDone ? "✓" : q.questionNumber}
        </button>

        <div className="flex-1 min-w-0">
          {/* Topic tags */}
          {q.topicIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {q.topicIds.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    background: isDone ? "rgba(34,197,94,0.12)" : isHot ? "rgba(180,83,9,0.12)" : "var(--bg-card)",
                    color: isDone ? "var(--green)" : isHot ? "var(--amber-mid)" : "var(--text-muted)",
                    border: `1px solid ${isDone ? "var(--green-border)" : isHot ? "var(--amber-border)" : "var(--border)"}`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div
            className="rounded-lg border px-3 py-2"
            style={{
              background: "var(--bg-card)",
              borderColor: isDone ? "var(--green-border)" : isHot ? "var(--amber-border)" : "var(--border)",
            }}
          >
            <p
              className="mb-1 text-[11px] font-black uppercase tracking-wider"
              style={{ color: isDone ? "var(--green)" : isHot ? "var(--amber-mid)" : "var(--text-muted)" }}
            >
              נוסח השאלה
            </p>
            <MathContent text={questionText} className="text-sm" />
          </div>

          <p className="mt-2 text-xs leading-6" style={{ color: "var(--text-muted)" }}>
            {q.whyItMatters}
          </p>

          {/* Difficulty rating — only when done */}
          {mounted && isDone && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] font-black" style={{ color: "var(--text-muted)" }}>רמת קושי:</span>
              {DIFFICULTY_LABELS.map(({ value, label, color, bg, border }) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className="rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
                  style={{
                    background: progress?.difficulty === value ? bg : "transparent",
                    color: progress?.difficulty === value ? color : "var(--text-muted)",
                    border: `1px solid ${progress?.difficulty === value ? border : "var(--border)"}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progressive hints */}
      <HomeworkHintSystem question={q} />
    </div>
  );
}

function getQuestionText(contentPreview: string) {
  const withoutSolution = contentPreview
    .split(/\bSolution\s*:|\bSolution\b|פתרון\s*:/i)[0]
    .trim();

  return withoutSolution || contentPreview.trim() || "לא נמצא נוסח שאלה בקובץ המטלה.";
}
