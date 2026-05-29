import { notFound } from "next/navigation";
import Link from "next/link";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { SimulationQuestionBlock } from "@/components/study/QuestionBlock";
import { DifficultyBadge } from "@/components/study/Badges";
import { ArrowRight, Clock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SimulationDetailPage({ params }: Props) {
  const { id } = await params;
  const analysis = await readAnalysisData();
  const sim = analysis.simulationExams.find((s) => s.id === id);

  if (!sim) notFound();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/simulations"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowRight className="h-4 w-4" />
        חזרה לסימולציות
      </Link>

      <PageHeader
        eyebrow="Simulation"
        title={sim.title}
        description={`${sim.questions.length} שאלות · ${sim.estimatedDurationMinutes} דקות · ${sim.targetTopics.join(", ")}`}
      />

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3">
        <DifficultyBadge level={sim.difficulty} />
        <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
          <Clock className="h-4 w-4" />
          {sim.estimatedDurationMinutes} דקות
        </span>
        {sim.needsReview && (
          <span className="badge badge-amber">⚠ ממתין לבדיקה</span>
        )}
      </div>

      {sim.needsReview && (
        <StudyCallout variant="warning">
          הסימולציה הזו לא הצליחה לחלץ 4 שאלות שלמות מהמקורות. ייתכן שחסר חומר מקור — הריצי את סריקת החומרים מחדש.
        </StudyCallout>
      )}

      {sim.questions.length === 0 ? (
        <StudyCallout variant="error">
          אין שאלות בסימולציה הזו עדיין. הריצי{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1 font-mono text-xs">npm run generate:simulations</code>{" "}
          אחרי הוספת חומרי מקור.
        </StudyCallout>
      ) : (
        <>
          <StudyCallout variant="tip">
            <strong>טיפ:</strong> קבעי טיימר ל-{sim.estimatedDurationMinutes} דקות. נסי לפתור לבד לפני שאת מציצה ברמזים.
          </StudyCallout>

          <div className="space-y-5">
            {sim.questions.map((q, i) => (
              <SimulationQuestionBlock key={q.id} question={q} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
