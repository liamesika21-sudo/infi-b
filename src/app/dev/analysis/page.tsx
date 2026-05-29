import { PageHeader } from "@/components/AnalysisCards";
import { EmptyState } from "@/components/Cards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function AnalysisPreviewPage() {
  const analysis = await readAnalysisData();

  const sections = [
    ["lecture-analysis.json", analysis.lectureAnalysis],
    ["recitation-analysis.json", analysis.recitationAnalysis],
    ["homework-analysis.json", analysis.homeworkAnalysis],
    ["summary-analysis.json", analysis.summaryAnalysis],
    ["past-exam-analysis.json", analysis.pastExamAnalysis],
    ["past-exam-aggregate.json", analysis.pastExamAggregate],
    ["formula-bank.json", analysis.formulaBank],
    ["theorem-bank.json", analysis.theoremBank],
    ["proof-pattern-bank.json", analysis.proofPatternBank],
    ["question-bank.json", analysis.questionBank],
    ["exam-priority-map.json", analysis.examPriorityMap],
    ["exam-plan.json", analysis.examPlan],
    ["mentor-knowledge-base.json", analysis.mentorKnowledgeBase],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Internal QA"
        title="תצוגת ניתוח חומרים"
        description="בדיקת איכות פנימית לכל קבצי הניתוח שנוצרו מ-extracted-text-index.json. מיועד לווידוא מקור, ביטחון ואיתור OCR חסר לפני חיבור AI."
      />
      {!analysis.hasAnalysis ? (
        <EmptyState title="עדיין אין קבצי ניתוח" body="הריצי npm run analyze:calculus2 כדי ליצור את שכבת הלמידה." />
      ) : (
        <section className="space-y-4">
          {sections.map(([name, data]) => (
            <details key={name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" open={name === "exam-priority-map.json"}>
              <summary className="cursor-pointer font-semibold text-slate-950">
                {name} · {countItems(data)}
              </summary>
              <pre dir="ltr" className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {JSON.stringify(preview(data), null, 2)}
              </pre>
            </details>
          ))}
        </section>
      )}
    </div>
  );
}

function countItems(data: unknown): string {
  if (Array.isArray(data)) return `${data.length} items`;
  if (!data) return "empty";
  if (typeof data === "object" && "topics" in data && Array.isArray((data as { topics?: unknown }).topics)) {
    return `${(data as { topics: unknown[] }).topics.length} topics`;
  }
  return "object";
}

function preview(data: unknown): unknown {
  if (Array.isArray(data)) return data.slice(0, 5);
  if (data && typeof data === "object" && "questionBankSummary" in data) {
    const value = data as { questionBankSummary?: unknown[] };
    return { ...data, questionBankSummary: value.questionBankSummary?.slice(0, 10) };
  }
  return data;
}
