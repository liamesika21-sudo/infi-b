"use client";

import type { HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import { HomeworkHintSystem } from "@/components/study/HomeworkHintSystem";
import { MathContent } from "@/components/study/MathContent";

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

function HomeworkQuestionCard({ q }: { q: HomeworkQuestionPriority }) {
  const isHot = q.importanceLevel === "critical" || q.importanceLevel === "high";
  const questionText = getQuestionText(q.contentPreview);

  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: isHot ? "var(--amber-light)" : "var(--bg-subtle)",
        border: `1.5px solid ${isHot ? "var(--amber-border)" : "var(--border)"}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ background: isHot ? "var(--amber-mid)" : "var(--text-muted)" }}
        >
          {q.questionNumber}
        </span>

        <div className="flex-1 min-w-0">
          {/* Topic tags */}
          {q.topicIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {q.topicIds.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    background: isHot ? "rgba(180,83,9,0.12)" : "var(--bg-card)",
                    color: isHot ? "var(--amber-mid)" : "var(--text-muted)",
                    border: `1px solid ${isHot ? "var(--amber-border)" : "var(--border)"}`,
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
              borderColor: isHot ? "var(--amber-border)" : "var(--border)",
            }}
          >
            <p
              className="mb-1 text-[11px] font-black uppercase tracking-wider"
              style={{ color: isHot ? "var(--amber-mid)" : "var(--text-muted)" }}
            >
              נוסח השאלה
            </p>
            <MathContent text={questionText} className="text-sm" />
          </div>

          <p className="mt-2 text-xs leading-6" style={{ color: "var(--text-muted)" }}>
            {q.whyItMatters}
          </p>
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
