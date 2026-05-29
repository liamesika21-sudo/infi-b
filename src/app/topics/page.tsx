import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { PageHeader } from "@/components/study/StudyCard";
import { ExamRelevanceBadge, ConfidenceBadge } from "@/components/study/Badges";

export default async function TopicsPage() {
  const [generatedData, analysis] = await Promise.all([readGeneratedData(), readAnalysisData()]);
  const priorityByTopic = new Map(analysis.examPriorityMap?.topics.map((topic) => [topic.topicId, topic]) ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Topic Map"
        title="מפת נושאים"
        description="נושאים שזוהו מהחומרים. הזיהוי היוריסטי — תמיד ודאי עם החומרים."
      />

      {!generatedData.hasGeneratedData ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            הריצי npm run process:calculus2 כדי להתחיל.
          </p>
        </div>
      ) : generatedData.topicMap.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            לא זוהו נושאים. ייתכן שה-PDFים דורשים OCR.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generatedData.topicMap.map((topic) => {
            const priority = priorityByTopic.get(topic.topicId);
            return (
              <article
                key={topic.topicId}
                className="rounded-xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor: priority?.priorityLevel === "critical" ? "var(--red-border)" :
                    priority?.priorityLevel === "high" ? "var(--navy-border)" : "var(--border)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{topic.title}</h2>
                  <ConfidenceBadge value={topic.confidence} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <InfoChip label="שבועות" value={topic.detectedInWeeks.length > 0 ? topic.detectedInWeeks.join(", ") : "—"} />
                  <InfoChip label="קבצים" value={String(topic.detectedInFiles.length)} />
                </div>
                {priority && (
                  <div className="mt-3 flex items-center gap-2">
                    <ExamRelevanceBadge level={priority.priorityLevel} />
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {priority.recommendedAction.slice(0, 60)}
                    </p>
                  </div>
                )}
                {topic.aliases.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {topic.aliases.slice(0, 4).map((alias) => (
                      <span key={alias} className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: "var(--bg-subtle)" }}>
      <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-0.5 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}
