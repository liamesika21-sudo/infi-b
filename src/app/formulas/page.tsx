import { EmptyState } from "@/components/Cards";
import { FormulaCard, PageHeader } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function FormulasPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formula Center"
        title="מרכז נוסחאות"
        description="ביטויים ונוסחאות שחולצו בפועל מהרצאות, סיכומים וחומרי מבחן. ביטויים לא ודאיים נשמרים כטקסט רגיל עם ביטחון נמוך יותר."
      />
      {analysis.formulaBank.length === 0 ? (
        <EmptyState title="אין עדיין נוסחאות שחולצו" body="הריצי npm run analyze:calculus2 אחרי עיבוד החומרים." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analysis.formulaBank.slice(0, 60).map((item) => (
            <FormulaCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
