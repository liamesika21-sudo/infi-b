import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { DifficultyBadge, ExamRelevanceBadge, PriorityBadge } from "@/components/study/Badges";
import { MathContent } from "@/components/study/MathContent";

export default async function HomeworkReviewPage() {
  const analysis = await readAnalysisData();
  const priorityMap = analysis.homeworkPriorityMap;

  const criticalCount = priorityMap.reduce((acc, hw) => acc + hw.criticalQuestions, 0);
  const highCount = priorityMap.reduce((acc, hw) => acc + hw.highPriorityQuestions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework Review"
        title="חזרת מטלות"
        description="מטלות לפי עדיפות מבחן. שאלות קריטיות וגבוהות מצוינות — אלה מה שחייבים לסגור לפני המבחן."
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="שאלות קריטיות" value={criticalCount} color="red" />
        <StatBox label="עדיפות גבוהה" value={highCount} color="navy" />
        <StatBox label="מטלות בסה״כ" value={priorityMap.length} color="muted" />
      </div>

      {criticalCount > 0 && (
        <StudyCallout variant="exam">
          יש {criticalCount} שאלות קריטיות שחייבים לפתור לפני המבחן — אלה שאלות הוכחה, טורים ואינטגרלים מורכבים שחוזרים בבחינות.
        </StudyCallout>
      )}

      {priorityMap.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין ניתוח מטלות. הריצי npm run analyze:calculus2 ואז npm run generate:simulations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {priorityMap.map((hw) => (
            <article
              key={hw.sourceFileId}
              className="rounded-xl border bg-white shadow-sm overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Header */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
                style={{
                  borderColor: "var(--border)",
                  background: hw.mustReviewBeforeExam ? "var(--red-light)" : "var(--bg-subtle)",
                }}
              >
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    מטלה {hw.homeworkNumber} — שבוע {hw.weekNumber}
                  </h2>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    {hw.filename}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge level={hw.overallPriority} />
                  {hw.mustReviewBeforeExam && (
                    <span className="badge badge-red">⚠ חובה לחזרה</span>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
                {hw.questions
                  .filter((q) => q.importanceLevel !== "low")
                  .map((q) => (
                    <div
                      key={q.questionId}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor: q.importanceLevel === "critical" ? "var(--red-border)" : q.importanceLevel === "high" ? "var(--navy-border)" : "var(--border)",
                        background: q.importanceLevel === "critical" ? "var(--red-light)" : q.importanceLevel === "high" ? "var(--navy-light)" : "white",
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          שאלה {q.questionNumber}
                        </span>
                        <PriorityBadge level={q.importanceLevel} />
                        <DifficultyBadge level={q.difficulty} />
                        <ExamRelevanceBadge level={q.examSimilarity} />
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                        {q.whyItMatters}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                        ➤ {q.recommendedAction}
                      </p>
                      {q.contentPreview && (
                        <div
                          className="mt-3 rounded-lg px-3 py-2 text-xs leading-6"
                          style={{ background: "rgba(255,255,255,0.6)", color: "var(--text-secondary)" }}
                        >
                          {q.contentPreview}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: "red" | "navy" | "muted" }) {
  const s = {
    red: { bg: "var(--red-light)", text: "var(--red)", border: "var(--red-border)" },
    navy: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
    muted: { bg: "var(--bg-subtle)", text: "var(--text-secondary)", border: "var(--border)" },
  }[color];
  return (
    <div className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
      <p className="text-2xl font-bold" style={{ color: s.text }}>{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color: s.text, opacity: 0.8 }}>{label}</p>
    </div>
  );
}
