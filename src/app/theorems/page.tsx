import { EmptyState } from "@/components/Cards";
import { PageHeader, TheoremCard } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function TheoremsPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Theorem Center"
        title="מרכז משפטים"
        description="משפטים, טענות, למות ומסקנות שזוהו מתוך הטקסט המחולץ. כל פריט נשאר קשור למקור כדי לאפשר בדיקת איכות."
      />
      {analysis.theoremBank.length === 0 ? (
        <EmptyState title="אין עדיין משפטים שחולצו" body="הריצי npm run analyze:calculus2 אחרי עיבוד החומרים." />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {analysis.theoremBank.map((item) => (
            <TheoremCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
