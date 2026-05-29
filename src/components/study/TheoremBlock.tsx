import type { TheoremItem } from "@/lib/calculus2/analysis-types";
import { ConfidenceBadge, ExamRelevanceBadge } from "./Badges";
import { MathContent } from "./MathContent";

export function TheoremBlock({ item }: { item: TheoremItem }) {
  return (
    <article className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--navy-border)" }}>
      {/* Gradient header */}
      <div className="card-header-navy flex items-center gap-2.5 px-5 py-3">
        <span className="text-xs font-bold uppercase tracking-widest opacity-80">משפט</span>
        <div className="flex-1" />
        <ConfidenceBadge value={item.confidence} />
        <ExamRelevanceBadge level={item.examImportance} />
      </div>

      <div className="p-5">
        <h3 className="text-sm font-bold leading-6" style={{ color: "var(--text-primary)" }}>
          {item.title.length > 90 ? item.title.slice(0, 90) + "…" : item.title}
        </h3>

        <div className="mt-3">
          <MathContent text={item.statement.slice(0, 700)} className="text-sm" />
        </div>

        {item.topicIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.topicIds.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {item.sourceSnippets[0] && (
          <div className="mt-4 source-snippet">
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {item.sourceSnippets[0].filename}
            </span>
            <p className="mt-0.5 line-clamp-2">{item.sourceSnippets[0].text.slice(0, 220)}</p>
          </div>
        )}
      </div>
    </article>
  );
}
