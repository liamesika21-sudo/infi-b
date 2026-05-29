import { EmptyState } from "@/components/Cards";
import { PageHeader, ProofPatternCard } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function ProofPatternsPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proof Pattern Center"
        title="תבניות הוכחה"
        description="תבניות שזוהו לפי מופעי הוכחה, נוכיח, נראה כי ומבני פתרון חוזרים. השלבים הם היוריסטיים ונשארים מחוברים למקור."
      />
      {analysis.proofPatternBank.length === 0 ? (
        <EmptyState title="אין עדיין תבניות הוכחה שחולצו" body="הריצי npm run analyze:calculus2 אחרי עיבוד החומרים." />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {analysis.proofPatternBank.map((item) => (
            <ProofPatternCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
