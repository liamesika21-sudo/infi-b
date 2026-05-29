import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { ExamRelevanceBadge } from "@/components/study/Badges";
import { StudyCallout } from "@/components/study/StudyCallout";

export default async function ProgressPage() {
  const analysis = await readAnalysisData();
  const topics = analysis.examPriorityMap?.topics ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress & Mastery"
        title="מעקב שליטה"
        description="תשתית מעקב על בסיס עדיפות מבחן. מעקב אישי יתווסף בשלב הבא."
      />

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="נוסחאות" value={analysis.formulaBank.filter(f => f.confidence >= 0.45).length} />
        <StatBox label="משפטים" value={analysis.theoremBank.length} />
        <StatBox label="שאלות" value={analysis.questionBank.length} />
      </div>

      <StudyCallout variant="info">
        מעקב אישי — &quot;שלטתי&quot;, &quot;צריך עוד עבודה&quot;, &quot;שליטה טובה&quot; — יתווסף בשלב הבא.
        כרגע המסך מציג עדיפות נושאים על בסיס ניתוח החומרים.
      </StudyCallout>

      {topics.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            הריצי npm run analyze:calculus2 כדי לקבל מפת עדיפות.
          </p>
        </div>
      ) : (
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            נושאים לפי עדיפות מבחן
          </h2>
          <div className="space-y-2">
            {topics.slice(0, 15).map((topic) => (
              <div
                key={topic.topicId}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{
                  background: topic.priorityLevel === "critical" ? "var(--red-light)" :
                    topic.priorityLevel === "high" ? "var(--navy-light)" : "var(--bg-subtle)",
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{topic.title}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {topic.recommendedAction.slice(0, 80)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ExamRelevanceBadge level={topic.priorityLevel} />
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {topic.priorityScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ background: "var(--navy-light)", borderColor: "var(--navy-border)" }}>
      <p className="text-2xl font-bold" style={{ color: "var(--navy-mid)" }}>{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color: "var(--navy-mid)", opacity: 0.8 }}>{label}</p>
    </div>
  );
}
