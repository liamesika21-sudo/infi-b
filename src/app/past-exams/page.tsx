import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { QuestionBlock } from "@/components/study/QuestionBlock";

export default async function PastExamsPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Past Exams"
        title="מבחני עבר"
        description="ניתוח מבחני עבר 2022–2025: נושאים חוזרים, תדירות ודפוסים. מבחני עבר: מועד א׳ ומועד ב׳."
      />

      {!analysis.pastExamAggregate ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין ניתוח מבחנים. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Topic frequency */}
            <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                נושאים בתדירות גבוהה
              </h2>
              <div className="space-y-2">
                {analysis.pastExamAggregate.topicFrequency.slice(0, 10).map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{topic.title}</span>
                    <span
                      className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white"
                      style={{ background: "var(--navy)" }}
                    >
                      {topic.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Likely Moed A */}
            <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                צפוי במועד א׳
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.pastExamAggregate.likelyMoedATopics.slice(0, 12).map((topic) => (
                  <span key={topic} className="badge badge-navy-light">{topic}</span>
                ))}
              </div>

              {analysis.pastExamAggregate.dangerZones.length > 0 && (
                <StudyCallout variant="warning" className="mt-4">
                  <strong>אזורי סיכון:</strong> {analysis.pastExamAggregate.dangerZones.join(" · ")}
                </StudyCallout>
              )}
            </section>
          </div>

          {/* Questions from past exams */}
          {analysis.questionBank.filter(q => q.sourceType === "past_exam").length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                שאלות מבחנים
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {analysis.questionBank
                  .filter(q => q.sourceType === "past_exam")
                  .slice(0, 16)
                  .map((q) => <QuestionBlock key={q.id} item={q} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
