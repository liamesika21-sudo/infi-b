import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { QuestionBlock } from "@/components/study/QuestionBlock";

export default async function PracticePage() {
  const analysis = await readAnalysisData();
  const questions = analysis.questionBank;

  const recitation = questions.filter((q) => q.sourceType === "recitation");
  const homework = questions.filter((q) => q.sourceType === "homework");
  const pastExam = questions.filter((q) => q.sourceType === "past_exam");
  const lecture = questions.filter((q) => q.sourceType === "lecture_example");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice Center"
        title="מרכז תרגול"
        description="שאלות מתרגולים, מטלות ומבחני עבר. מסווגות לפי מקור, קושי וחשיבות למבחן."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "תרגולים", value: recitation.length, color: "cyan" },
          { label: "מטלות", value: homework.length, color: "gold" },
          { label: "מבחני עבר", value: pastExam.length, color: "purple" },
          { label: "דוגמאות הרצאה", value: lecture.length, color: "navy" },
        ].map(({ label, value, color }) => (
          <Chip key={label} label={label} value={value} color={color} />
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין שאלות. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <>
          {recitation.length > 0 && (
            <Section title="שאלות תרגול" count={recitation.length}>
              <div className="grid gap-4 lg:grid-cols-2">
                {recitation.slice(0, 20).map((q) => <QuestionBlock key={q.id} item={q} />)}
              </div>
            </Section>
          )}
          {homework.length > 0 && (
            <Section title="שאלות מטלה" count={homework.length}>
              <div className="grid gap-4 lg:grid-cols-2">
                {homework.slice(0, 20).map((q) => <QuestionBlock key={q.id} item={q} />)}
              </div>
            </Section>
          )}
          {pastExam.length > 0 && (
            <Section title="שאלות מבחן עבר" count={pastExam.length}>
              <div className="grid gap-4 lg:grid-cols-2">
                {pastExam.slice(0, 20).map((q) => <QuestionBlock key={q.id} item={q} />)}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  const c: Record<string, { bg: string; text: string; border: string }> = {
    cyan: { bg: "var(--cyan-light)", text: "var(--cyan)", border: "var(--cyan-border)" },
    gold: { bg: "var(--gold-light)", text: "var(--gold)", border: "var(--gold-border)" },
    purple: { bg: "var(--purple-light)", text: "var(--purple)", border: "var(--purple-border)" },
    navy: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
  };
  const s = c[color] ?? c.navy;
  return (
    <div className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
      <p className="text-2xl font-bold" style={{ color: s.text }}>{value}</p>
      <p className="mt-0.5 text-xs font-medium" style={{ color: s.text, opacity: 0.8 }}>{label}</p>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <span className="badge badge-muted">{count}</span>
      </div>
      {children}
    </section>
  );
}

import type React from "react";
