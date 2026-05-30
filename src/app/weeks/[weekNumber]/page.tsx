import { notFound } from "next/navigation";
import Link from "next/link";
import type React from "react";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";
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
  const expectedPracticedLecture = weekNum > 1 ? weekNum - 1 : null;
  const lectureExtract = lectureSummary?.sourceFileId
    ? generatedData.extractedTextIndex.find((record) => record.sourceFileId === lectureSummary.sourceFileId)
    : undefined;
  const summaryExtract = lectureSummary?.summarySourceFile
    ? generatedData.extractedTextIndex.find((record) => record.filename === lectureSummary.summarySourceFile)
    : undefined;
  const lectureQuotes = buildLectureQuoteBlocks({
    lectureText: lectureExtract?.extractedText,
    lectureFilename: lectureSummary?.filename ?? null,
    summaryText: summaryExtract?.extractedText,
    summaryFilename: lectureSummary?.summarySourceFile ?? null,
  });
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
        <p className="mt-3 text-xs opacity-70">
          הרצאה {weekNum}: חומר חדש ·{" "}
          תרגול {weekNum}:{" "}
          {expectedPracticedLecture ? `מתרגל הרצאה ${expectedPracticedLecture}` : "פתיחת קורס / יישור קו"} ·{" "}
          מטלה {weekNum}: מיושרת לשבוע
        </p>
      </div>

      <WeekInferenceDiagram
        weekNumber={weekNum}
        lectureSummary={lectureSummary}
        recitationSummary={recitationSummary}
        homeworkPriority={homeworkPriority}
      />

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
          subtitle={
            recitationSummary
              ? `תרגול ${recitationSummary.recitationNumber} · מתרגל הרצאה ${expectedPracticedLecture ?? "פתיחה"}`
              : ""
          }
          accentColor="var(--teal)"
        >
          {recitationSummary ? (
            <div className="space-y-5">
              {expectedPracticedLecture !== recitationSummary.practicesLecture && expectedPracticedLecture !== null && (
                <StudyCallout variant="info">
                  לפי מבנה הקורס, תרגול {weekNum} אמור לתרגל את הרצאה {expectedPracticedLecture}. הניתוח הקיים סומן כהרצאה {recitationSummary.practicesLecture ?? "לא ידועה"}, ולכן מוצג כאן הכלל הפדגוגי המלא.
                </StudyCallout>
              )}

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

      <LectureSourceQuotes quotes={lectureQuotes} />

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
    <div className="mb-2 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: "var(--teal)" }} />
      <p className="text-[13px] font-black tracking-wide" style={{ color: "var(--text-primary)" }}>
        {label}
      </p>
    </div>
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

type WeekInferenceProps = {
  weekNumber: number;
  lectureSummary:
    | {
        mainTopics: string[];
        keyDefinitions: string[];
        keyTheorems: string[];
        keyFormulas: string[];
        examNotes: string[];
      }
    | undefined;
  recitationSummary:
    | {
        keyTechniques: string[];
        conclusions: string[];
        mustPractice: string[];
      }
    | undefined;
  homeworkPriority:
    | {
        questions: Array<{
          topicIds: string[];
          whyItMatters: string;
          importanceLevel: string;
        }>;
      }
    | undefined;
};

function WeekInferenceDiagram({
  weekNumber,
  lectureSummary,
  recitationSummary,
  homeworkPriority,
}: WeekInferenceProps) {
  const nodes = buildInferenceNodes(lectureSummary, recitationSummary, homeworkPriority);

  if (nodes.length === 0) return null;

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: "var(--border)", background: "linear-gradient(90deg, var(--navy-light), #fff)" }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
          תרשים שבוע {weekNumber}
        </p>
        <h2 className="mt-1 text-lg font-black" style={{ color: "var(--text-primary)" }}>
          מה ההגדרות והמשפטים מאפשרים להסיק
        </h2>
      </div>

      <div className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {nodes.map((node, index) => (
            <div key={`${node.title}-${index}`} className="relative">
              <InferenceNode node={node} />
              {index < nodes.length - 1 && (
                <div className="hidden md:block absolute left-[-18px] top-1/2 -translate-y-1/2 text-xl font-black" style={{ color: "var(--teal)" }}>
                  ←
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type InferenceNodeData = {
  title: string;
  label: string;
  detail: string;
  tone: "navy" | "green" | "teal" | "amber";
};

function InferenceNode({ node }: { node: InferenceNodeData }) {
  const toneMap = {
    navy: { bg: "var(--navy-light)", border: "var(--navy-border)", color: "var(--navy)" },
    green: { bg: "var(--green-light)", border: "var(--green-border)", color: "var(--green)" },
    teal: { bg: "rgba(11, 114, 133, 0.08)", border: "var(--teal-border)", color: "var(--teal)" },
    amber: { bg: "var(--amber-light)", border: "var(--amber-border)", color: "var(--amber-mid)" },
  }[node.tone];

  return (
    <article
      className="h-full rounded-xl border p-4"
      style={{ background: toneMap.bg, borderColor: toneMap.border }}
    >
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: toneMap.color }}>
        {node.title}
      </p>
      <div className="mt-2 min-h-12">
        <MathContent text={node.label} className="text-sm font-bold" />
      </div>
      <p className="mt-3 text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
        {node.detail}
      </p>
    </article>
  );
}

function buildInferenceNodes(
  lectureSummary: WeekInferenceProps["lectureSummary"],
  recitationSummary: WeekInferenceProps["recitationSummary"],
  homeworkPriority: WeekInferenceProps["homeworkPriority"],
): InferenceNodeData[] {
  if (!lectureSummary && !recitationSummary && !homeworkPriority) return [];

  const definition = firstMeaningful(lectureSummary?.keyDefinitions);
  const theorem = firstMeaningful(lectureSummary?.keyTheorems);
  const formula = firstMeaningful(lectureSummary?.keyFormulas);
  const technique = firstMeaningful(recitationSummary?.keyTechniques);
  const conclusion =
    firstMeaningful(recitationSummary?.conclusions) ??
    firstMeaningful(lectureSummary?.examNotes) ??
    homeworkPriority?.questions.find((question) => question.importanceLevel !== "low")?.whyItMatters;

  return [
    definition && {
      title: "הגדרה",
      label: definition,
      detail: "מגדירה את האובייקט שעליו מותר לעבוד בהמשך השבוע.",
      tone: "green" as const,
    },
    theorem && {
      title: "משפט",
      label: theorem,
      detail: "נותן תנאים שמאפשרים להסיק תוצאה בלי לפתור מאפס.",
      tone: "navy" as const,
    },
    (formula ?? technique) && {
      title: formula ? "נוסחה" : "טכניקה",
      label: formula ?? technique ?? "",
      detail: formula ? "הופכת את המשפט לכלי חישוב/זיהוי בתרגילים." : "זה הצעד הפרקטי שמתרגלים על בסיס הרצאה קודמת.",
      tone: "teal" as const,
    },
    conclusion && {
      title: "מה מסיקים",
      label: conclusion,
      detail: "זו המסקנה שצריך לקחת לתרגול, מטלות ומבחני עבר.",
      tone: "amber" as const,
    },
  ].filter(Boolean) as InferenceNodeData[];
}

function firstMeaningful(items: string[] | undefined): string | undefined {
  return items?.find((item) => item.trim().length > 0);
}

type QuoteBlock = {
  kind: string;
  source: string;
  text: string;
};

function LectureSourceQuotes({ quotes }: { quotes: QuoteBlock[] }) {
  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
          ציטוט מקור
        </p>
        <h2 className="mt-1 text-lg font-black" style={{ color: "var(--text-primary)" }}>
          הגדרות ומשפטים לפי סדר הופעה בהרצאה
        </h2>
        <p className="mt-1 text-xs leading-6" style={{ color: "var(--text-muted)" }}>
          מוצג רק טקסט שחולץ בפועל מהקבצים. אם OCR של ההרצאה לא קריא, המערכת מציגה מקור סיכום מקושר ולא ממציאה ניסוח.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="p-5">
          <StudyCallout variant="warning">
            לא נמצאו ציטוטי הגדרה/משפט קריאים לשבוע זה מתוך הטקסט המחולץ. צריך OCR איכותי יותר או קובץ מקור טקסטואלי.
          </StudyCallout>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {quotes.map((quote, index) => (
            <article key={`${quote.kind}-${index}`} className="p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: "var(--navy-light)", color: "var(--navy)" }}>
                  {index + 1}. {quote.kind}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  מקור: {quote.source}
                </span>
              </div>
              <div
                className="rounded-xl border-r-4 p-4"
                style={{ borderColor: "var(--teal)", background: "var(--bg-subtle)" }}
              >
                <MathContent text={quote.text} className="text-sm" />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function buildLectureQuoteBlocks({
  lectureText,
  lectureFilename,
  summaryText,
  summaryFilename,
}: {
  lectureText?: string;
  lectureFilename: string | null;
  summaryText?: string;
  summaryFilename: string | null;
}): QuoteBlock[] {
  const lectureQuotes = extractMarkedQuotes(lectureText, lectureFilename ?? "הרצאה");
  if (lectureQuotes.length > 0) return lectureQuotes.slice(0, 12);

  const summaryQuotes = extractMarkedQuotes(summaryText, summaryFilename ?? "סיכום מקושר");
  return summaryQuotes.slice(0, 12);
}

function extractMarkedQuotes(rawText: string | undefined, source: string): QuoteBlock[] {
  if (!rawText) return [];

  const cleaned = rawText
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!/[א-ת]/.test(cleaned)) return [];

  const markerPattern = /(הגדרה|משפט|טענה|למה|מסקנה)\s*(?:[-–—:]|\n)?/g;
  const matches = [...cleaned.matchAll(markerPattern)];
  const quotes: QuoteBlock[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index ?? 0;
    const next = matches[index + 1]?.index ?? Math.min(cleaned.length, start + 1200);
    const block = cleaned.slice(start, Math.min(next, start + 1200)).trim();
    if (block.length < 40) continue;

    quotes.push({
      kind: match[1],
      source,
      text: block,
    });
  }

  return quotes;
}
