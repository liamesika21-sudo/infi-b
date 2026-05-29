import type { ReactNode } from "react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";
import { DifficultyBadge, ExamRelevanceBadge, SourceBadge } from "./Badges";
import { MathContent } from "./MathContent";

export function QuestionBlock({ item, showNumber }: { item: QuestionItem; showNumber?: string }) {
  return (
    <article
      className="rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {showNumber && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--navy)" }}
              >
                {showNumber}
              </span>
            )}
            <SourceBadge sourceType={item.sourceType} />
            <DifficultyBadge level={item.difficulty} />
            <ExamRelevanceBadge level={item.examRelevance} />
          </div>
        </div>

        <div className="mt-4">
          <MathContent text={item.content.slice(0, 800)} className="text-sm" />
        </div>

        {item.topicIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.topicIds.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function SimulationQuestionBlock({
  question,
  index,
}: {
  question: {
    id: string;
    content: string;
    difficulty: string;
    examRelevance: string;
    topicIds: string[];
    sourceBasis: string;
    hint?: string;
    solutionOutline?: string;
  };
  index: number;
}) {
  return (
    <article
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Number bar */}
      <div
        className="flex items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: "var(--navy)" }}
        >
          {index + 1}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <DifficultyBadge level={question.difficulty} />
          <ExamRelevanceBadge level={question.examRelevance} />
          <SourceBadge sourceType={question.sourceBasis} />
        </div>
      </div>

      <div className="p-5">
        <MathContent text={question.content} className="text-sm" />

        {question.topicIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {question.topicIds.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {question.hint && (
          <details className="mt-4">
            <summary
              className="cursor-pointer select-none text-xs font-semibold"
              style={{ color: "var(--amber)" }}
            >
              💡 הצג רמז
            </summary>
            <div
              className="mt-2 rounded-lg px-3 py-2 text-sm leading-7"
              style={{ background: "var(--amber-light)", color: "var(--text-secondary)" }}
            >
              {question.hint}
            </div>
          </details>
        )}

        {question.solutionOutline && (
          <details className="mt-3">
            <summary
              className="cursor-pointer select-none text-xs font-semibold"
              style={{ color: "var(--navy-mid)" }}
            >
              📐 הצג כיוון פתרון
            </summary>
            <div
              className="mt-2 rounded-lg px-3 py-2 text-sm leading-7"
              style={{ background: "var(--navy-light)", color: "var(--text-secondary)" }}
            >
              {question.solutionOutline}
            </div>
          </details>
        )}
      </div>
    </article>
  );
}
