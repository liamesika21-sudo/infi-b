import type { FormulaItem } from "@/lib/calculus2/analysis-types";
import { ConfidenceBadge, ExamRelevanceBadge } from "./Badges";

// OCR garbage detector: reject items where confidence is low AND the text looks
// like garbled OCR (mostly short disconnected ASCII tokens).
function isUsable(item: FormulaItem): boolean {
  const text = (item.latex ?? item.plainText ?? "").trim();
  if (text.length < 5 || item.confidence < 0.45) return false;
  // Must contain Hebrew, a recognised math symbol, or a LaTeX backslash
  const hasMath = /[א-ת]|[∑∫∞π√±≤≥≠→←↔∈∉⊂⊃∩∪∀∃]|\\[a-z]/.test(text);
  const hasSubSup = /[₀₁₂₃₄₅₆₇₈₉ₙₖ⁰¹²³⁴ⁿ]/.test(text);
  return hasMath || hasSubSup || text.length >= 20;
}

export function FormulaBlock({ item }: { item: FormulaItem }) {
  if (!isUsable(item)) return null;

  const hasLatex = !!(item.latex?.trim().length);

  return (
    <article className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: "var(--teal-border)" }}>
      {/* Gradient header */}
      <div className="card-header-teal flex items-center gap-2 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-widest opacity-80">נוסחה</span>
        <div className="flex-1" />
        <ConfidenceBadge value={item.confidence} />
        <ExamRelevanceBadge level={item.examImportance} />
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {item.title.length > 65 ? item.title.slice(0, 65) + "…" : item.title}
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
