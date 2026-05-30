import { HomeworkReviewClient } from "@/components/HomeworkReviewClient";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function HomeworkReviewPage() {
  const analysis = await readAnalysisData();

  if (analysis.homeworkPriorityMap.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed bg-white p-10 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          אין עדיין ניתוח מטלות. הריצי npm run analyze:calculus2 ואז npm run generate:simulations.
        </p>
      </div>
    );
  }

  return <HomeworkReviewClient priorityMap={analysis.homeworkPriorityMap} />;
}
