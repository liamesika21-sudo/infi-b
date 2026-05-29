import { EmptyState } from "@/components/Cards";
import { PageHeader, QuestionCard } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function PastExamsPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Past Exam Strategy"
        title="מבחני עבר"
        description="ניתוח קבצי מבחן וחומרי בחינה מתוך הטקסט שחולץ: שאלות, נושאים, תדירויות ודפוסים חוזרים."
      />
      {!analysis.pastExamAggregate ? (
        <EmptyState title="אין עדיין ניתוח מבחנים" body="הריצי npm run analyze:calculus2 כדי ליצור past-exam-analysis.json." />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">נושאים בתדירות גבוהה</h2>
              <div className="mt-4 space-y-2">
                {analysis.pastExamAggregate.topicFrequency.slice(0, 10).map((topic) => (
                  <div key={topic.topicId} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="font-semibold text-slate-800">{topic.title}</span>
                    <span className="font-mono text-sm text-slate-600">{topic.count}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">מה נראה חשוב למועד א׳</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.pastExamAggregate.likelyMoedATopics.map((topic) => (
                  <span key={topic} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {topic}
                  </span>
                ))}
              </div>
              {analysis.pastExamAggregate.dangerZones.length > 0 ? (
                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-amber-950">
                  <p className="text-sm font-semibold">אזורי סיכון לפי הופעה חוזרת</p>
                  <p className="mt-2 text-sm leading-7">{analysis.pastExamAggregate.dangerZones.join(" · ")}</p>
                </div>
              ) : null}
            </article>
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            {analysis.pastExamAnalysis.flatMap((exam) => exam.questions.slice(0, 2)).map((question) => (
              <QuestionCard key={question.id} item={question} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
