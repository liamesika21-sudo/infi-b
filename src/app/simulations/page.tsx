import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { SimulationCard } from "@/components/study/SimulationCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { FlaskConical } from "lucide-react";

export default async function SimulationsPage() {
  const analysis = await readAnalysisData();
  const simulations = analysis.simulationExams;

  const readyCount = simulations.filter((s) => !s.needsReview && s.questions.length >= 4).length;
  const pendingCount = simulations.length - readyCount;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Simulation Exams"
        title="סימולציות מבחן"
        description="מבחני תרגול של 4 שאלות — מבוססים על שאלות מתרגולים, מטלות ומבחני עבר. כל סימולציה בנויה לתרגל נושא ספציפי."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="סימולציות מוכנות" value={readyCount} accent="green" />
        <StatCard label="ממתינות לבדיקה" value={pendingCount} accent="amber" />
        <StatCard label="שאלות בסה״כ" value={simulations.reduce((acc, s) => acc + s.questions.length, 0)} accent="navy" />
        <StatCard label="זמן ממוצע" value={`${Math.round(simulations.reduce((a, s) => a + s.estimatedDurationMinutes, 0) / Math.max(simulations.length, 1))} דק׳`} accent="muted" />
      </div>

      {/* Info */}
      <StudyCallout variant="info">
        <strong>איך להשתמש בסימולציות:</strong> פתחי סימולציה, נסי לפתור בעצמך, ואז ראי רמזים וכיווני פתרון.
        המטרה היא תרגול תחת לחץ זמן — בני/בנה הרגל לסיים תוך 90 דקות.
      </StudyCallout>

      {simulations.length === 0 ? (
        <EmptySimulations />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {simulations.map((sim) => (
            <SimulationCard key={sim.id} sim={sim} />
          ))}
        </div>
      )}

      {/* OCR warning */}
      {pendingCount > 0 && (
        <StudyCallout variant="warning">
          {pendingCount} סימולציה/ות מסומנות כ&quot;ממתינות לבדיקה&quot; — כלומר לא הצלחנו לחלץ מספיק שאלות מהמקורות.
          הריצי <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 text-xs font-mono">npm run generate:simulations</code> אחרי הוספת חומרים נוספים.
        </StudyCallout>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "green" | "amber" | "navy" | "muted";
}) {
  const styles = {
    green: { bg: "var(--green-light)", color: "var(--green)", border: "var(--green-border)" },
    amber: { bg: "var(--amber-light)", color: "var(--amber)", border: "var(--amber-border)" },
    navy: { bg: "var(--navy-light)", color: "var(--navy-mid)", border: "var(--navy-border)" },
    muted: { bg: "var(--bg-subtle)", color: "var(--text-secondary)", border: "var(--border)" },
  }[accent];

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: styles.color, opacity: 0.8 }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold" style={{ color: styles.color }}>
        {value}
      </p>
    </div>
  );
}

function EmptySimulations() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <FlaskConical className="h-12 w-12 opacity-20" style={{ color: "var(--text-muted)" }} />
      <h2 className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        אין עדיין סימולציות
      </h2>
      <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--text-secondary)" }}>
        הריצי{" "}
        <code dir="ltr" className="rounded bg-slate-100 px-1 font-mono text-xs">
          npm run generate:simulations
        </code>{" "}
        כדי לבנות סימולציות מהשאלות שחולצו.
      </p>
    </div>
  );
}
