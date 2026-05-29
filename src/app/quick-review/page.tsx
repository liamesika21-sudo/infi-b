import { EmptyState } from "@/components/Cards";
import { ExamPlanSection, PageHeader } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function QuickReviewPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quick Review"
        title="חזרה מהירה"
        description="רשימות פעולה שנבנו מתוך מפת עדיפות הבחינה, בנק הנוסחאות, המשפטים ותבניות ההוכחה."
      />
      {!analysis.examPlan ? (
        <EmptyState title="אין עדיין תוכנית חזרה" body="הריצי npm run analyze:calculus2 כדי ליצור exam-plan.json." />
      ) : (
        <>
          <ExamPlanSection examPlan={analysis.examPlan} />
          {analysis.examPlan.blockedByOcrOrMissingData.length > 0 ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <h2 className="font-semibold">חסום בגלל OCR או חילוץ חסר</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {analysis.examPlan.blockedByOcrOrMissingData.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
