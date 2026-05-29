import { EmptyState } from "@/components/Cards";
import { PageHeader } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function ProgressPage() {
  const analysis = await readAnalysisData();
  const topics = analysis.examPriorityMap?.topics ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress & Mastery"
        title="מעקב שליטה"
        description="בשלב הזה אין עדיין נתוני משתמש אישיים, לכן המסך מציג את תשתית המעקב ואת עדיפות הנושאים שנוצרה מהחומרים."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="נוסחאות למעקב" value={analysis.formulaBank.length} />
        <Stat label="משפטים למעקב" value={analysis.theoremBank.length} />
        <Stat label="שאלות למעקב" value={analysis.questionBank.length} />
      </section>
      {topics.length === 0 ? (
        <EmptyState title="אין עדיין מפת עדיפות" body="הריצי npm run analyze:calculus2 כדי ליצור exam-priority-map.json." />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">נושאים לפי עדיפות למבחן</h2>
          <div className="mt-4 space-y-3">
            {topics.slice(0, 12).map((topic) => (
              <div key={topic.topicId} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-950">{topic.title}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {topic.priorityLevel} · {topic.priorityScore}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{topic.recommendedAction}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-500">סטטוס אישי יתווסף בשכבת המעקב.</p>
    </div>
  );
}
