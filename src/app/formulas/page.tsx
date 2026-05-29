import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { FormulaBlock } from "@/components/study/FormulaBlock";

export default async function FormulasPage() {
  const analysis = await readAnalysisData();

  const goodFormulas = analysis.formulaBank.filter((f) => {
    const text = (f.latex ?? f.plainText ?? "").trim();
    if (text.length < 5 || f.confidence < 0.45) return false;
    const hebrewOrMath = /[א-ת]|[∑∫∞π√±≤≥≠→←↔∈∉⊂⊃∩∪∀∃]|\\[a-z]/.test(text);
    return hebrewOrMath || text.length >= 15;
  });

  const high = goodFormulas.filter((f) => ["critical","high"].includes(f.examImportance));
  const med = goodFormulas.filter((f) => f.examImportance === "medium");
  const ocrFiltered = analysis.formulaBank.length - goodFormulas.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formula Center"
        title="מרכז נוסחאות"
        description="נוסחאות שחולצו מסיכומים, תרגולים ומבחני עבר. נוסחאות OCR מסוננות."
      />

      {ocrFiltered > 0 && (
        <StudyCallout variant="warning">
          {ocrFiltered} ביטויים נסוננו — חולצו מכתב יד ואינם קריאים. המוצג כאן הוא מחומרים דיגיטליים.
        </StudyCallout>
      )}

      {goodFormulas.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין נוסחאות שחולצו. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <>
          {high.length > 0 && (
            <section>
              <SLabel label="עדיפות גבוהה למבחן" count={high.length} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {high.map((item) => <FormulaBlock key={item.id} item={item} />)}
              </div>
            </section>
          )}
          {med.length > 0 && (
            <section>
              <SLabel label="עדיפות בינונית" count={med.length} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {med.slice(0, 30).map((item) => <FormulaBlock key={item.id} item={item} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{label}</h2>
      <span className="badge badge-muted">{count}</span>
    </div>
  );
}
