import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { PersonalProgressClient } from "@/components/PersonalProgressClient";

export default async function ProgressPage() {
  const analysis = await readAnalysisData();
  const topics = analysis.examPriorityMap?.topics ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress & Mastery"
        title="מעקב אישי"
        description="סטטוס אישי לכל נושא: מה התחלת, איפה צריך חזרה, ומה כבר בשליטה."
      />

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="נוסחאות" value={analysis.formulaBank.filter(f => f.confidence >= 0.45).length} />
        <StatBox label="משפטים" value={analysis.theoremBank.length} />
        <StatBox label="שאלות" value={analysis.questionBank.length} />
      </div>

      <PersonalProgressClient topics={topics} />
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
