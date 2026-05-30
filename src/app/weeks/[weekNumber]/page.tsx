import { notFound } from "next/navigation";
import Link from "next/link";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent, InlineMath } from "@/components/study/MathContent";
import { ExamRelevanceBadge } from "@/components/study/Badges";
import { ArrowRight, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ weekNumber: string }>;
}

export default async function WeekDetailPage({ params }: Props) {
  const { weekNumber: weekParam } = await params;
  const weekNum = parseInt(weekParam, 10);
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 13) notFound();

  const [analysis, generatedData] = await Promise.all([
    readAnalysisData(),
    readGeneratedData(),
  ]);

  const lectureSummary = analysis.lectureSummaries.find((l) => l.lectureNumber === weekNum);
  const recitationSummary = analysis.recitationSummaries.find((r) => r.weekNumber === weekNum);
  const homeworkPriority = analysis.homeworkPriorityMap.find((h) => h.weekNumber === weekNum);
  const recitationQuestions = analysis.questionBank
    .filter((q) => {
      const rec = analysis.recitationAnalysis.find((r) => r.sourceFileId === q.sourceFileId);
      return rec?.weekNumber === weekNum && q.sourceType === "recitation";
    })
    .slice(0, 8);

  const hwQuestions = homeworkPriority?.questions.filter((q) => q.importanceLevel !== "low") ?? [];

  return (
    <div className="space-y-0">

      {/* ── Nav breadcrumb ── */}
      <div className="flex items-center gap-1.5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/weeks" className="hover:underline" style={{ color: "var(--text-secondary)" }}>
          שבועות
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>שבוע {weekNum}</span>
      </div>

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-8 py-7 mb-6"
        style={{
          background: "linear-gradient(135deg, var(--navy) 0%, #1e4070 100%)",
          color: "#fff",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-60 mb-1">
          שבוע {weekNum}
        </p>
        <h1 className="text-3xl font-black tracking-tight leading-tight">
          {lectureSummary?.title ?? `שבוע ${weekNum} — אינפי ב׳`}
        </h1>

        {/* Topic pills */}
        {lectureSummary && lectureSummary.mainTopics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {lectureSummary.mainTopics.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Recitation link label */}
        {recitationSummary?.practicesLecture && (
          <p className="mt-3 text-xs opacity-60">
            תרגול {recitationSummary.recitationNumber} מתרגל הרצאה {recitationSummary.practicesLecture}
          </p>
        )}
      </div>

      {/* ── 3-column layout on desktop ── */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">

        {/* ─ Lecture ─ */}
        <Column title="📖 הרצאה" subtitle={`הרצאה ${weekNum}`} accentColor="var(--navy-mid)">
          {lectureSummary ? (
            <div className="space-y-5">
              {lectureSummary.ocrWarning && (
                <StudyCallout variant="warning">{lectureSummary.ocrWarning}</StudyCallout>
              )}

              {/* Definitions */}
              {lectureSummary.keyDefinitions.length > 0 && (
                <BulletGroup label="הגדרות" color="green" items={lectureSummary.keyDefinitions} />
              )}

              {/* Theorems */}
              {lectureSummary.keyTheorems.length > 0 && (
                <BulletGroup label="משפטים" color="navy" items={lectureSummary.keyTheorems} />
              )}

              {/* Formulas — rendered as actual math */}
              {lectureSummary.keyFormulas.length > 0 && (
                <div>
                  <SectionLabel label="נוסחאות מפתח" />
                  <div className="space-y-2 mt-2">
                    {lectureSummary.keyFormulas.map((f, i) => (
                      <FormulaDisplay key={i} formula={f} />
                    ))}
                  </div>
                </div>
              )}

              {/* Exam tips */}
              {lectureSummary.examNotes.length > 0 && (
                <div className="space-y-2">
                  {lectureSummary.examNotes.map((note, i) => (
                    <StudyCallout key={i} variant="exam">{note}</StudyCallout>
                  ))}
                </div>
              )}

              {lectureSummary.summarySourceFile && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  מקור: {lectureSummary.summarySourceFile}
                </p>
              )}
            </div>
          ) : (
            <EmptyCol text="אין סיכום הרצאה לשבוע זה" />
          )}
        </Column>

        {/* ─ Recitation ─ */}
        <Column
          title="✏️ תרגול"
          subtitle={recitationSummary ? `תרגול ${recitationSummary.recitationNumber}` : ""}
          accentColor="var(--teal)"
        >
          {recitationSummary ? (
            <div className="space-y-5">
              {/* What was practiced */}
              <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                {recitationSummary.whatWasPracticed}
              </p>

              {/* Techniques */}
              {recitationSummary.keyTechniques.length > 0 && (
                <BulletGroup label="טכניקות" color="teal" items={recitationSummary.keyTechniques} />
              )}

              {/* Must practice */}
              {recitationSummary.mustPractice.length > 0 && (
                <BulletGroup label="חובה לתרגל" color="navy" items={recitationSummary.mustPractice} />
              )}

              {/* Common mistakes */}
              {recitationSummary.commonMistakes.length > 0 && (
                <BulletGroup label="טעויות נפוצות" color="red" items={recitationSummary.commonMistakes} />
              )}

              {/* Conclusions */}
              {recitationSummary.conclusions.length > 0 && (
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <SectionLabel label="מסקנות" />
                  {recitationSummary.conclusions.map((c, i) => (
                    <MathContent key={i} text={c} className="text-sm" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyCol text="אין סיכום תרגול לשבוע זה" />
          )}
        </Column>

        {/* ─ Homework ─ */}
        <Column
          title="📋 מטלה"
          subtitle={homeworkPriority ? `מטלה ${homeworkPriority.homeworkNumber}` : ""}
          accentColor="var(--amber-mid)"
        >
          {hwQuestions.length > 0 ? (
            <div className="space-y-3">
              {hwQuestions.slice(0, 8).map((q) => (
                <HomeworkQuestion key={q.questionId} q={q} />
              ))}
            </div>
          ) : homeworkPriority ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              כל שאלות המטלה עדיפות נמוכה — חומר חזרה בסיסי.
            </p>
          ) : (
            <EmptyCol text="אין ניתוח מטלה לשבוע זה" />
          )}
        </Column>
      </div>

      {/* ── Recitation questions ── */}
      {recitationQuestions.length > 0 && (
        <div
          className="rounded-2xl border bg-white p-6 mb-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-5 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            שאלות מהתרגול
          </h2>
          <div className="space-y-5">
            {recitationQuestions.map((q, i) => (
              <div
                key={q.id}
                className="flex gap-4 pb-5 border-b last:border-b-0 last:pb-0"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: "var(--navy)" }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <ExamRelevanceBadge level={q.examRelevance} />
                    {q.topicIds.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <MathContent text={q.content.slice(0, 600)} className="text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between pt-2">
        {weekNum > 1 ? (
          <Link
            href={`/weeks/${weekNum - 1}`}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-white"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <ArrowRight className="h-4 w-4" />
            שבוע {weekNum - 1}
          </Link>
        ) : <div />}
        {weekNum < 13 && (
          <Link
            href={`/weeks/${weekNum + 1}`}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-white"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            שבוע {weekNum + 1}
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function Column({
  title,
  subtitle,
  accentColor,
  children,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Column header */}
      <div
        className="px-5 py-4 border-b"
        style={{
          borderColor: "var(--border)",
          borderRight: `4px solid ${accentColor}`,
          background: "var(--bg-subtle)",
        }}
      >
        <h2 className="text-base font-black" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
      {label}
    </p>
  );
}

type BulletColor = "green" | "navy" | "teal" | "red" | "amber";

function BulletGroup({ label, color, items }: { label: string; color: BulletColor; items: string[] }) {
  const dotColor: Record<BulletColor, string> = {
    green: "var(--green-mid)",
    navy:  "var(--navy-mid)",
    teal:  "var(--teal)",
    red:   "var(--red-mid)",
    amber: "var(--amber-mid)",
  };
  return (
    <div>
      <SectionLabel label={label} />
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: dotColor[color] }}
            />
            <MathContent text={item} className="flex-1 text-sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Renders a formula string. Tries KaTeX if it looks like LaTeX, otherwise plain text. */
function FormulaDisplay({ formula }: { formula: string }) {
  // If it already contains LaTeX commands or $-delimited math, use MathContent
  const hasLatex = /\\[a-z]|[$]/.test(formula);

  if (hasLatex) {
    return (
      <div
        className="rounded-lg border px-4 py-3"
        style={{ borderColor: "var(--navy-border)", background: "var(--navy-light)" }}
      >
        <MathContent text={formula} />
      </div>
    );
  }

  // Plain formula text — still try to render with MathContent (preprocessor will help)
  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{ borderColor: "var(--navy-border)", background: "var(--navy-light)" }}
    >
      <MathContent text={formula} />
    </div>
  );
}

function HomeworkQuestion({
  q,
}: {
  q: {
    questionNumber: number;
    importanceLevel: string;
    difficulty: string;
    examSimilarity: string;
    topicIds: string[];
    whyItMatters: string;
    recommendedAction: string;
  };
}) {
  const isHot = q.importanceLevel === "critical" || q.importanceLevel === "high";

  return (
    <div
      className="flex gap-3 rounded-xl p-3"
      style={{
        background: isHot ? "var(--amber-light)" : "var(--bg-subtle)",
      }}
    >
      {/* Number */}
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
        style={{ background: isHot ? "var(--amber-mid)" : "var(--text-muted)" }}
      >
        {q.questionNumber}
      </span>

      <div className="flex-1 min-w-0">
        {/* Topics */}
        {q.topicIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {q.topicIds.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs"
                style={{ color: isHot ? "var(--amber)" : "var(--text-muted)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Why it matters */}
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          {q.whyItMatters}
        </p>

        {/* Action */}
        <p
          className="mt-1 text-xs font-bold"
          style={{ color: isHot ? "var(--amber-mid)" : "var(--text-muted)" }}
        >
          ➤ {q.recommendedAction}
        </p>
      </div>
    </div>
  );
}

function EmptyCol({ text }: { text: string }) {
  return (
    <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
      {text}
    </p>
  );
}

import type React from "react";
