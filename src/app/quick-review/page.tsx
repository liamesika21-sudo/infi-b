import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { ExamRelevanceBadge, PriorityBadge } from "@/components/study/Badges";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

export default async function QuickReviewPage() {
  const analysis = await readAnalysisData();
  const plan = analysis.examPlan;
  const criticalTopics = analysis.examPriorityMap?.topics.filter((t) => t.priorityLevel === "critical") ?? [];
  const highTopics = analysis.examPriorityMap?.topics.filter((t) => t.priorityLevel === "high") ?? [];
  const recSummaries = analysis.recitationSummaries;
  const daysLeft = Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quick Review"
        title="חזרה מהירה"
        description={`${daysLeft} ימים למבחן · 01.07.2026 · נוסחאות, משפטים ורשימות חזרה.`}
      />

      {/* Critical checklist */}
      {(criticalTopics.length > 0 || highTopics.length > 0) && (
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            ✓ צ׳קליסט שליטה — נושאים קריטיים
          </h2>
          <div className="space-y-2">
            {[...criticalTopics, ...highTopics].slice(0, 10).map((topic) => (
              <label key={topic.topicId} className="flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3" style={{ background: "var(--bg-subtle)" }}>
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{topic.title}</span>
                    <PriorityBadge level={topic.priorityLevel} />
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{topic.recommendedAction}</p>
                </div>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Key theorems */}
      {analysis.theoremBank.length > 0 && (
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            משפטים לחזרה
          </h2>
          <div className="space-y-2">
            {analysis.theoremBank.filter((t) => t.examImportance === "high" || t.examImportance === "critical").slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: "var(--navy-light)" }}>
                <ExamRelevanceBadge level={t.examImportance} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {t.title.slice(0, 80)}
                  </p>
                  <p className="mt-0.5 text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {t.statement.slice(0, 200)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recitation conclusions */}
      {recSummaries.length > 0 && (
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            מסקנות מרכזיות מהתרגולים
          </h2>
          <div className="space-y-3">
            {recSummaries.flatMap((r) => r.conclusions).slice(0, 12).map((c, i) => (
              <StudyCallout key={i} variant="success">
                {c}
              </StudyCallout>
            ))}
          </div>
        </section>
      )}

      {/* Common mistakes */}
      {recSummaries.length > 0 && (
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            טעויות נפוצות — אל תחזרי עליהן
          </h2>
          <div className="space-y-2">
            {recSummaries.flatMap((r) => r.commonMistakes).slice(0, 10).map((m, i) => (
              <StudyCallout key={i} variant="error">
                {m}
              </StudyCallout>
            ))}
          </div>
        </section>
      )}

      {/* Exam plan */}
      {plan && (
        <>
          <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
            <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              תוכנית חזרה
            </h2>
            {plan.learnFirst.length > 0 && (
              <ReviewList label="למד/י קודם" items={plan.learnFirst.slice(0, 6)} accent="red" />
            )}
            {plan.reviewDaily.length > 0 && (
              <ReviewList label="חזרה יומית" items={plan.reviewDaily.slice(0, 6)} accent="amber" />
            )}
            {plan.cannotSkip.length > 0 && (
              <ReviewList label="אסור לדלג" items={plan.cannotSkip.slice(0, 6)} accent="navy" />
            )}
          </section>
          {plan.blockedByOcrOrMissingData.length > 0 && (
            <StudyCallout variant="warning">
              <strong>חסום בגלל OCR:</strong> {plan.blockedByOcrOrMissingData.slice(0, 3).join(" · ")}
            </StudyCallout>
          )}
        </>
      )}
    </div>
  );
}

function ReviewList({ label, items, accent }: { label: string; items: string[]; accent: "red" | "amber" | "navy" }) {
  const s = {
    red: { bg: "var(--red-light)", text: "var(--red)", border: "var(--red-border)" },
    amber: { bg: "var(--amber-light)", text: "var(--amber)", border: "var(--amber-border)" },
    navy: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
  }[accent];
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: s.text }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="rounded-lg border px-3 py-1 text-xs" style={{ background: s.bg, borderColor: s.border, color: "var(--text-secondary)" }}>
            {item.slice(0, 50)}
          </span>
        ))}
      </div>
    </div>
  );
}
