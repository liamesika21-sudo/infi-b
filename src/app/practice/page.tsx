import fs from "node:fs/promises";
import path from "node:path";
import { GENERATED_DIR } from "@/lib/calculus2/generated-data";
import { PracticePageClient } from "@/components/PracticePageClient";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";

export const revalidate = 3600; // re-generate at most once per hour

export default async function PracticePage() {
  let questions: QuestionItem[] = [];
  try {
    const raw = await fs.readFile(path.join(GENERATED_DIR, "question-bank.json"), "utf8");
    questions = JSON.parse(raw) as QuestionItem[];
  } catch {};

  const counts = {
    recitation: questions.filter(q => q.sourceType === "recitation").length,
    homework:   questions.filter(q => q.sourceType === "homework").length,
    past_exam:  questions.filter(q => q.sourceType === "past_exam").length,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="pb-5 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
          Practice Center
        </p>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          מרכז תרגול
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {questions.length} שאלות מתרגולים, מטלות ומבחני עבר — מסוננות לפי מקור, קושי וחשיבות.
        </p>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Stat label="תרגולים" value={counts.recitation} color="var(--cyan)" bg="var(--cyan-light)" border="var(--cyan-border)" />
          <Stat label="מטלות"   value={counts.homework}   color="var(--gold)" bg="var(--gold-light)" border="var(--gold-border)" />
          <Stat label="מבחני עבר" value={counts.past_exam} color="var(--purple)" bg="var(--purple-light)" border="var(--purple-border)" />
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין שאלות. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <PracticePageClient questions={questions} />
      )}
    </div>
  );
}

function Stat({ label, value, color, bg, border }: { label: string; value: number; color: string; bg: string; border: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-2"
      style={{ background: bg, borderColor: border }}
    >
      <span className="text-lg font-black" style={{ color }}>{value}</span>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}
