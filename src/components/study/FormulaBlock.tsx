import type { FormulaItem } from "@/lib/calculus2/analysis-types";
import { convertAtomsOnly } from "@/lib/math-text";
import { ConfidenceBadge, ExamRelevanceBadge } from "./Badges";
import { DisplayMath, MathContent } from "./MathContent";

// OCR garbage detector: reject items where confidence is low AND the text looks
// like garbled OCR (mostly short disconnected ASCII tokens).
export function isUsableFormula(item: FormulaItem): boolean {
  const text = (item.latex ?? item.plainText ?? "").trim();
  if (text.length < 5 || item.confidence < 0.45) return false;
  if (text.length > 180) return false;
  // Must contain Hebrew, a recognised math symbol, or a LaTeX backslash
  const hasMath = /[א-ת]|[∑∫∞π√±≤≥≠→←↔∈∉⊂⊃∩∪∀∃∂∇≈∼∧∨]|\\[a-zA-Z]/.test(text);
  const hasSubSup = /[₀₁₂₃₄₅₆₇₈₉ₙₖ⁰¹²³⁴ⁿ]/.test(text);
  const hasEquationShape = /[=<>]|lim|sin|cos|tan|ln|log|sqrt|sum|int|frac|alpha|beta|gamma|delta/i.test(text);
  const mostlyAsciiNoise = !/[א-ת]/.test(text) && /^[A-Za-z0-9\s.,;:'"!?-]+$/.test(text) && !hasEquationShape;
  const proseMarker = /\b(points?|define|prove|solution|suppose|following|question|lecturer|duration|instructions|answer|credits|write|theorem|claim|we say that|let\s*\(|it follows|therefore|show that)\b/i.test(text);
  const latinWords = text.match(/[A-Za-z]{3,}/g) ?? [];
  const operators = text.match(/[=<>≤≥≠→∞∑∫]|\\[a-zA-Z]+/g) ?? [];

  if (proseMarker && latinWords.length > 3) return false;
  if (!/[א-ת]/.test(text) && latinWords.length > 10 && operators.length < 2) return false;

  return (hasMath || hasSubSup || hasEquationShape) && !mostlyAsciiNoise;
}

export function getFormulaExplanation(item: FormulaItem): string {
  if (item.whenToUse?.[0]) return item.whenToUse[0];
  if (item.conditions?.[0]) return `יש לבדוק תנאי שימוש: ${item.conditions[0]}`;

  const topicText = item.topicIds.length > 0 ? `בנושא ${item.topicIds.slice(0, 2).join(" / ")}` : "בנושא שעדיין דורש סיווג";
  const sourceText = item.sourceSnippets[0]?.filename ? `המקור: ${item.sourceSnippets[0].filename}.` : "";

  if (["critical", "high"].includes(item.examImportance)) {
    return `נוסחה בעלת עדיפות גבוהה ${topicText}; כדאי לדעת לזהות מתי להשתמש בה ולתרגל אותה ממקורות קרובים למבחן. ${sourceText}`.trim();
  }

  if (item.confidence < 0.6) {
    return `הביטוי זוהה אוטומטית ${topicText}, אך רמת הביטחון בינונית ולכן צריך לאמת מול המקור לפני שינון. ${sourceText}`.trim();
  }

  return `נוסחה שמחזקת את העבודה הטכנית ${topicText}; לשמור כחלק מחזרה שוטפת ולחבר לתרגילים שבהם היא מופיעה. ${sourceText}`.trim();
}

export function FormulaBlock({ item }: { item: FormulaItem }) {
  if (!isUsableFormula(item)) return null;

  const formulaText = (item.latex ?? item.plainText ?? "").trim();
  const hasLatex = !!item.latex?.trim().length && isLikelyKatex(formulaText);

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

        <FormulaMath item={item} hasLatex={hasLatex} />

        <p className="mt-3 border-r-4 pr-3 text-sm leading-7" style={{ borderColor: "var(--teal)", color: "var(--text-secondary)" }}>
          {getFormulaExplanation(item)}
        </p>

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

function FormulaMath({ item, hasLatex }: { item: FormulaItem; hasLatex: boolean }) {
  const text = (item.latex ?? item.plainText ?? "").trim();
  const normalizedPlainLatex = toKatexFromPlainMath(text);

  if (hasLatex) {
    return (
      <div className="overflow-x-auto rounded-lg p-3" style={{ background: "var(--navy)", color: "#e2e8f0" }}>
        <DisplayMath latex={text} />
      </div>
    );
  }

  if (normalizedPlainLatex) {
    return (
      <div className="overflow-x-auto rounded-lg p-3" style={{ background: "var(--navy)", color: "#e2e8f0" }}>
        <DisplayMath latex={normalizedPlainLatex} />
      </div>
    );
  }

  if (isLikelyKatex(text)) {
    return (
      <div className="overflow-x-auto rounded-lg p-3" style={{ background: "var(--navy)", color: "#e2e8f0" }}>
        <MathContent text={text.includes("$") || text.includes("\\(") || text.includes("\\[") ? text : `\\[${text}\\]`} />
      </div>
    );
  }

  return (
    <div
      dir="auto"
      className="rounded-lg p-3 text-sm leading-7"
      style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", unicodeBidi: "plaintext" }}
    >
      <MathContent text={text} />
    </div>
  );
}

function isLikelyKatex(text: string): boolean {
  if (!text.trim() || /[א-ת]/.test(text)) return false;
  if (/[√′⇡]/.test(text)) return false;
  return /(\\[a-zA-Z]+|\\\(|\\\[|\$\$?)/.test(text);
}

function toKatexFromPlainMath(text: string): string | null {
  if (!text.trim() || /[א-ת]/.test(text)) return null;
  if (/\b(points?|define|prove|solution|suppose|following|question|lecturer|duration|instructions|answer|credits|write|theorem|claim)\b/i.test(text)) {
    return null;
  }
  if (!/[=<>≤≥≠→∞∑∫π√∈ℝ₀₁₂₃₄₅₆₇₈₉ₙₖ⁰¹²³⁴ⁿ]/.test(text)) return null;

  const normalized = convertAtomsOnly(text)
    .replace(/lim\s*\(\s*n\s*→\s*∞\s*\)/gi, "\\lim_{n\\to\\infty}")
    .replace(/lim\s*n\s*→\s*∞/gi, "\\lim_{n\\to\\infty}")
    .replace(/Σ\s*\(\s*n\s*=\s*0\s*→\s*∞\s*\)/g, "\\sum_{n=0}^{\\infty}")
    .replace(/Σ\s*\(\s*n\s*=\s*1\s*→\s*∞\s*\)/g, "\\sum_{n=1}^{\\infty}")
    .replace(/∞/g, "\\infty")
    .replace(/Σ/g, "\\sum")
    .replace(/∫/g, "\\int")
    .replace(/π|⇡/g, "\\pi")
    .replace(/√\s*\(?\s*([A-Za-z0-9_{}^.'+-]+)\s*\)?/g, "\\sqrt{$1}")
    .replace(/≤/g, "\\le")
    .replace(/≥/g, "\\ge")
    .replace(/≠/g, "\\ne")
    .replace(/≈/g, "\\approx")
    .replace(/→/g, "\\to")
    .replace(/∈/g, "\\in")
    .replace(/ℝ/g, "\\mathbb{R}")
    .replace(/·/g, "\\cdot")
    .replace(/−/g, "-")
    .replace(/₀/g, "_0")
    .replace(/₁/g, "_1")
    .replace(/₂/g, "_2")
    .replace(/₃/g, "_3")
    .replace(/₄/g, "_4")
    .replace(/₅/g, "_5")
    .replace(/₆/g, "_6")
    .replace(/₇/g, "_7")
    .replace(/₈/g, "_8")
    .replace(/₉/g, "_9")
    .replace(/ₙ/g, "_n")
    .replace(/ₖ/g, "_k")
    .replace(/⁰/g, "^0")
    .replace(/¹/g, "^1")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/ⁿ/g, "^n")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}
