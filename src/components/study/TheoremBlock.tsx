import type { TheoremItem } from "@/lib/calculus2/analysis-types";
import { ConfidenceBadge, ExamRelevanceBadge } from "./Badges";
import { MathContent } from "./MathContent";

export function TheoremBlock({ item }: { item: TheoremItem }) {
  return (
    <article
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 border-b px-5 py-3"
        style={{
          borderColor: "var(--navy-border)",
          background: "var(--navy-light)",
        }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--navy-mid)" }}>
          משפט
        </span>
        <div className="flex-1" />
        <ConfidenceBadge value={item.confidence} />
        <ExamRelevanceBadge level={item.examImportance} />
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-bold leading-6" style={{ color: "var(--text-primary)" }}>
          {item.title.length > 80 ? item.title.slice(0, 80) + "…" : item.title}
        </h3>

        {/* Statement */}
        <div className="mt-3">
          <MathContent
            text={item.statement.slice(0, 600)}
            className="text-sm"
          />
        </div>

        {/* Topics */}
        {item.topicIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.topicIds.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Source */}
        {item.sourceSnippets[0] && (
          <div
            className="mt-4 rounded-lg px-3 py-2 text-xs leading-6"
            style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
          >
            <span className="font-semibold">{item.sourceSnippets[0].filename}</span>
            <p className="mt-0.5 line-clamp-2">{item.sourceSnippets[0].text.slice(0, 200)}</p>
          </div>
        )}
      </div>
    </article>
  );
}
