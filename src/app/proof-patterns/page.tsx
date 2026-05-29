import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { ConfidenceBadge, ExamRelevanceBadge } from "@/components/study/Badges";

export default async function ProofPatternsPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proof Patterns"
        title="תבניות הוכחה"
        description="דפוסי הוכחה שזוהו מתרגולים וסיכומים. הצעדים הם היוריסטיים — תמיד ודאי עם המקור."
      />
      {analysis.proofPatternBank.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין תבניות. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {analysis.proofPatternBank.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border bg-white p-5 shadow-sm overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="mb-3 flex items-center gap-2 border-b pb-3"
                style={{ borderColor: "var(--purple-border)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--purple)" }}>
                  תבנית הוכחה
                </span>
                <div className="flex-1" />
                <ConfidenceBadge value={item.confidence} />
                <ExamRelevanceBadge level={item.examImportance} />
              </div>
              <h3 className="text-sm font-bold leading-6" style={{ color: "var(--text-primary)" }}>
                {item.title.slice(0, 100)}
              </h3>
              {item.steps.length > 0 && (
                <ol className="mt-3 space-y-1.5">
                  {item.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "var(--purple)" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
              {item.topicIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.topicIds.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
