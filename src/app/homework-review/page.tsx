import { EmptyState } from "@/components/Cards";
import { PageHeader, QuestionCard } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function HomeworkReviewPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework Review"
        title="חזרת מטלות"
        description="ניתוח מטלות לפי נושאים, שאלות שחולצו, טכניקות נדרשות וסימון ראשוני של מה שצריך לחזור עליו לפני מועד א׳."
      />
      {analysis.homeworkAnalysis.length === 0 ? (
        <EmptyState title="אין עדיין ניתוח מטלות" body="הריצי npm run analyze:calculus2 אחרי עיבוד החומרים." />
      ) : (
        <section className="space-y-4">
          {analysis.homeworkAnalysis.map((homework) => (
            <article key={homework.sourceFileId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">מטלה {homework.homeworkNumber}</h2>
                  <p className="mt-1 text-sm text-slate-500">{homework.filename}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {homework.mustReviewBeforeExam ? "חובה לחזרה" : "חזרה רגילה"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {homework.topics.slice(0, 8).map((topic) => (
                  <span key={topic} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Info label="שאלות" value={homework.questions.length} />
                <Info label="קושי" value={homework.difficultyEstimate} />
                <Info label="טכניקות" value={homework.requiredTechniques.length || "לא זוהו"} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {homework.questions.slice(0, 4).map((question) => (
                  <QuestionCard key={question.id} item={question} />
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
