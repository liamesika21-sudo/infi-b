import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { TheoremBlock } from "@/components/study/TheoremBlock";

export default async function TheoremsPage() {
  const analysis = await readAnalysisData();
  const high = analysis.theoremBank.filter((t) => ["critical","high"].includes(t.examImportance));
  const med = analysis.theoremBank.filter((t) => t.examImportance === "medium");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Theorem Center"
        title="מרכז משפטים"
        description="משפטים, טענות ולמות שחולצו מסיכומים ותרגולים. כולם קשורים למקור."
      />
      {analysis.theoremBank.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין משפטים שחולצו. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <>
          {high.length > 0 && (
            <section>
              <SLabel label="עדיפות גבוהה" count={high.length} />
              <div className="grid gap-4 lg:grid-cols-2">
                {high.map((item) => <TheoremBlock key={item.id} item={item} />)}
              </div>
            </section>
          )}
          {med.length > 0 && (
            <section>
              <SLabel label="עדיפות בינונית" count={med.length} />
              <div className="grid gap-4 lg:grid-cols-2">
                {med.map((item) => <TheoremBlock key={item.id} item={item} />)}
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
