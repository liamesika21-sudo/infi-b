import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { scanDocsFolder } from "@/lib/calculus2/pipeline";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { WeekCard } from "@/components/study/WeekCard";

export default async function WeeksPage() {
  const [generatedData, inventory, analysis] = await Promise.all([
    readGeneratedData(),
    scanDocsFolder(),
    readAnalysisData(),
  ]);

  const weeks = generatedData.weekMap.length > 0 ? generatedData.weekMap : inventory.weeks;
  const availableCount = weeks.filter((w) => w.materialStatus.lecture === "available").length;
  const missingCount = weeks.filter((w) => w.materialStatus.lecture === "missing").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Week Map"
        title="מפת 13 השבועות"
        description="לחצי על שבוע לצפייה בסיכום הרצאה, תרגול ומטלה. תרגול N מתרגל בדרך כלל הרצאה N-1."
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatsChip label="שבועות זמינים" value={availableCount} color="green" />
        <StatsChip label="שבועות חסרים" value={missingCount} color="red" />
        <StatsChip label="סימולציות" value={analysis.simulationExams.filter(s => s.questions.length >= 4).length} color="amber" />
      </div>

      {/* Legend */}
      <StudyCallout variant="info">
        <strong>ההיסט פדגוגי:</strong> הרצאה N מלמדת חומר חדש. תרגול N לרוב מתרגל הרצאה N-1. כך מצוין בכל שבוע.
      </StudyCallout>

      {weeks.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            לא נמצאו שבועות. הריצי npm run process:calculus2.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {weeks.map((week) => (
            <WeekCard key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatsChip({ label, value, color }: { label: string; value: number; color: "green" | "red" | "amber" }) {
  const styles = {
    green: { bg: "var(--green-light)", text: "var(--green)", border: "var(--green-border)" },
    red: { bg: "var(--red-light)", text: "var(--red)", border: "var(--red-border)" },
    amber: { bg: "var(--amber-light)", text: "var(--amber)", border: "var(--amber-border)" },
  }[color];
  return (
    <div
      className="rounded-xl border p-4 text-center"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <p className="text-2xl font-bold" style={{ color: styles.text }}>{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color: styles.text, opacity: 0.8 }}>{label}</p>
    </div>
  );
}
