"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";
import { MathContent } from "@/components/study/MathContent";

const DIFFICULTY_LABEL: Record<QuestionItem["difficulty"], string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "קשה",
  unknown: "לא סווג",
};

export function QuestionBlockClient({ question, index }: { question: QuestionItem; index: number }) {
  const [showHe, setShowHe] = useState(false);

  const hasTranslation = Boolean(question.contentHe);
  const displayText = showHe && question.contentHe ? question.contentHe : question.content;

  return (
    <article className="grid gap-3 p-4 md:grid-cols-[2.5rem_minmax(0,1fr)] md:p-5">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black md:mt-1"
        style={{ background: "var(--bg-inset)", color: "var(--text-secondary)" }}
      >
        {index + 1}
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {question.questionNumber && (
            <span className="badge badge-navy-light">שאלה {question.questionNumber}</span>
          )}
          <span className="badge badge-muted">{DIFFICULTY_LABEL[question.difficulty]}</span>
          {question.examRelevance === "critical" && <span className="badge badge-red">קריטי למבחן</span>}
          {question.examRelevance === "high" && <span className="badge badge-amber">חשוב למבחן</span>}
          {question.topicIds.slice(0, 4).map((topic) => (
            <span key={topic} className="badge badge-muted">
              {topic}
            </span>
          ))}

          {hasTranslation && (
            <button
              type="button"
              onClick={() => setShowHe((v) => !v)}
              className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition hover:bg-(--navy-light)"
              style={{
                borderColor: showHe ? "var(--teal-border)" : "var(--border)",
                color: showHe ? "var(--teal)" : "var(--text-secondary)",
                background: showHe ? "var(--teal-light)" : undefined,
              }}
            >
              <Languages className="h-3 w-3" />
              {showHe ? "מקור" : "תרגום"}
            </button>
          )}
        </div>

        <MathContent text={displayText} className="practice-question-text" />
      </div>
    </article>
  );
}
