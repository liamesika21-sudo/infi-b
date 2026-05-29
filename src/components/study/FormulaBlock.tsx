import type { FormulaItem } from "@/lib/calculus2/analysis-types";
import { ConfidenceBadge, ExamRelevanceBadge } from "./Badges";

export function FormulaBlock({ item }: { item: FormulaItem }) {
  const hasLatex = item.latex && item.latex.length > 2;
  const hasGoodText =
    item.plainText &&
    item.plainText.length > 5 &&
    !/^[a-z0-9\s\.\,\-]{1,15}$/i.test(item.plainText.trim()) &&
    !item.plainText.match(/^\d+\s+[a-zA-Z]{1,5}\s+\d/);

  if (!hasLatex && !hasGoodText) return null;

  return (
    <article
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: "var(--cyan-border)", background: "var(--cyan-light)" }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cyan)" }}>
          נוסחה
        </span>
        <div className="flex-1" />
        <ConfidenceBadge value={item.confidence} />
        <ExamRelevanceBadge level={item.examImportance} />
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {item.title.length > 60 ? item.title.slice(0, 60) + "…" : item.title}
        </p>

        {hasLatex ? (
          <div
            dir="ltr"
            className="overflow-x-auto rounded-lg p-3 font-mono text-sm leading-7"
            style={{ background: "var(--navy)", color: "#e2e8f0" }}
          >
            {item.latex}
          </div>
        ) : (
          <div
            dir="auto"
            className="rounded-lg p-3 text-sm leading-7"
            style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
          >
            {item.plainText}
          </div>
        )}

        {item.topicIds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
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
