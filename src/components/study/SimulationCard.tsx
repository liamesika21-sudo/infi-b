import Link from "next/link";
import { Clock, FlaskConical } from "lucide-react";
import { DifficultyBadge } from "./Badges";

export interface SimulationExam {
  id: string;
  title: string;
  estimatedDurationMinutes: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  targetTopics: string[];
  needsReview?: boolean;
  questions: Array<{
    id: string;
    sourceBasis: string;
    basedOnSourceIds: string[];
    topicIds: string[];
    content: string;
    requiredKnowledge: string[];
    difficulty: string;
    examRelevance: string;
    hint?: string;
    solutionOutline?: string;
  }>;
}

export function SimulationCard({ sim }: { sim: SimulationExam }) {
  return (
    <article
      className="rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="border-b px-5 py-4"
        style={{
          borderColor: "var(--border)",
          background: sim.needsReview ? "var(--amber-light)" : "var(--navy-light)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical
              className="h-4 w-4 shrink-0"
              style={{ color: sim.needsReview ? "var(--amber)" : "var(--navy-mid)" }}
            />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {sim.title}
            </h2>
          </div>
          <DifficultyBadge level={sim.difficulty} />
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {sim.estimatedDurationMinutes} דקות
          </span>
          <span>·</span>
          <span>{sim.questions.length} שאלות</span>
          {sim.needsReview && (
            <>
              <span>·</span>
              <span className="font-semibold" style={{ color: "var(--amber)" }}>
                ממתין לבדיקה
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Topics */}
        <div className="flex flex-wrap gap-1.5">
          {sim.targetTopics.map((t) => (
            <span
              key={t}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Question preview */}
        <div className="mt-4 space-y-1.5">
          {sim.questions.slice(0, 4).map((q, i) => (
            <div
              key={q.id}
              className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
              style={{ background: "var(--bg-subtle)" }}
            >
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white font-bold"
                style={{ background: "var(--navy)", fontSize: "0.6rem" }}
              >
                {i + 1}
              </span>
              <span className="line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                {q.content.replace(/[^ -~֐-׿\s]/g, "").slice(0, 120)}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/simulations/${sim.id}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--navy)" }}
        >
          <FlaskConical className="h-4 w-4" />
          התחלי סימולציה
        </Link>
      </div>
    </article>
  );
}
