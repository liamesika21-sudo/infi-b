"use client";

import { useState } from "react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";
import { DifficultyBadge, ExamRelevanceBadge, SourceBadge } from "./Badges";
import { MathContent } from "./MathContent";
import { ChevronDown, ChevronUp, Lightbulb, BookOpen } from "lucide-react";

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

/* ─────────────────────────────────────────────────────────────────
   SimulationQuestionBlock — client component with expand/collapse
   ───────────────────────────────────────────────────────────────── */

interface SimQ {
  id: string;
  content: string;
  difficulty: string;
  examRelevance: string;
  topicIds: string[];
  sourceBasis: string;
  hint?: string;
  solutionOutline?: string;
}

export function SimulationQuestionBlock({
  question,
  index,
}: {
  question: SimQ;
  index: number;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  return (
    <article
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--bg-card, #fff)" }}
    >
      {/* ── Header strip ── */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--navy-light)" }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
          style={{ background: "var(--navy)" }}
        >
          {index + 1}
        </span>
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <DifficultyBadge level={question.difficulty} />
          <ExamRelevanceBadge level={question.examRelevance} />
          {question.sourceBasis && <SourceBadge sourceType={question.sourceBasis} />}
        </div>
        {question.topicIds.length > 0 && (
          <div className="mr-auto flex flex-wrap gap-1">
            {question.topicIds.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Question content ── */}
      <div className="px-5 pt-5 pb-4">
        <MathContent text={question.content} className="text-sm" />
      </div>

      {/* ── Hint ── */}
      {question.hint && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setHintOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: hintOpen ? "var(--amber-light)" : "var(--bg-subtle)",
              color: "var(--amber-mid, #b45309)",
              border: `1px solid ${hintOpen ? "var(--amber-border)" : "var(--border)"}`,
            }}
          >
            <Lightbulb className="h-4 w-4 shrink-0" />
            <span>רמז</span>
            {hintOpen ? <ChevronUp className="mr-auto h-3.5 w-3.5" /> : <ChevronDown className="mr-auto h-3.5 w-3.5" />}
          </button>
          {hintOpen && (
            <div
              className="mt-2 rounded-xl px-5 py-4"
              style={{ background: "var(--amber-light)", border: "1px solid var(--amber-border)" }}
            >
              <MathContent text={question.hint} className="text-sm leading-8" />
            </div>
          )}
        </div>
      )}

      {/* ── Solution outline ── */}
      {question.solutionOutline && (
        <div className="px-5 pb-5">
          <button
            onClick={() => setSolutionOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: solutionOpen ? "var(--navy-light)" : "var(--bg-subtle)",
              color: "var(--navy-mid)",
              border: `1px solid ${solutionOpen ? "var(--navy-border)" : "var(--border)"}`,
            }}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>כיוון פתרון</span>
            {solutionOpen ? <ChevronUp className="mr-auto h-3.5 w-3.5" /> : <ChevronDown className="mr-auto h-3.5 w-3.5" />}
          </button>
          {solutionOpen && (
            <div
              className="mt-2 rounded-xl px-5 py-4"
              style={{ background: "var(--navy-light)", border: "1px solid var(--navy-border)" }}
            >
              <MathContent text={question.solutionOutline} className="text-sm leading-8" />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

