import { notFound } from "next/navigation";
import Link from "next/link";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";
import {
  ExamRelevanceBadge,
  DifficultyBadge,
  ConfidenceBadge,
} from "@/components/study/Badges";
import { ArrowRight, BookOpen, CheckCircle, ClipboardList, FileText } from "lucide-react";

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

  const week = generatedData.weekMap.find((w) => w.weekNumber === weekNum);
  const lectureSummary = analysis.lectureSummaries.find((l) => l.lectureNumber === weekNum);
  const recitationSummary = analysis.recitationSummaries.find((r) => r.weekNumber === weekNum);
  const homeworkPriority = analysis.homeworkPriorityMap.find((h) => h.weekNumber === weekNum);
  const weekQuestions = analysis.questionBank.filter((q) => {
    const rec = analysis.recitationAnalysis.find((r) => r.sourceFileId === q.sourceFileId);
    const hw = analysis.homeworkAnalysis.find((h) => h.sourceFileId === q.sourceFileId);
    return rec?.weekNumber === weekNum || hw?.weekNumber === weekNum;
  });
  const recitationQuestions = weekQuestions.filter((q) => q.sourceType === "recitation").slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/weeks"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowRight className="h-4 w-4" />
        כל השבועות
      </Link>

      <PageHeader
        eyebrow={`שבוע ${weekNum}`}
        title={lectureSummary?.title ?? `שבוע ${weekNum} — אינפי ב׳`}
        description={
          lectureSummary
            ? `הרצאה ${weekNum} · ${lectureSummary.mainTopics.join(" · ")}`
            : `שבוע ${weekNum} של הקורס`
        }
      />

      {/* Material status */}
      {week && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MaterialStatusCard label="הרצאה" status={week.materialStatus.lecture} />
          <MaterialStatusCard label="תרגול" status={week.materialStatus.recitation === "multiple" ? "multiple" : week.materialStatus.recitation} />
          <MaterialStatusCard label="מטלה" status={week.materialStatus.homework} />
          <MaterialStatusCard label="סיכום" status={week.materialStatus.summary} />
        </div>
      )}

      {/* Lecture summary */}
      {lectureSummary && (
        <section
          className="rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" style={{ color: "var(--navy-mid)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              הרצאה {lectureSummary.lectureNumber}
            </h2>
            <ConfidenceBadge value={lectureSummary.confidence} />
          </div>

          {lectureSummary.ocrWarning && (
            <StudyCallout variant="warning" className="mb-4">
              {lectureSummary.ocrWarning}
            </StudyCallout>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Main topics */}
            {lectureSummary.mainTopics.length > 0 && (
              <TopicSection title="נושאים מרכזיים" items={lectureSummary.mainTopics} accent="navy" />
            )}
            {/* Definitions */}
            {lectureSummary.keyDefinitions.length > 0 && (
              <TopicSection title="הגדרות מפתח" items={lectureSummary.keyDefinitions} accent="green" />
            )}
            {/* Theorems */}
            {lectureSummary.keyTheorems.length > 0 && (
              <TopicSection title="משפטים מפתח" items={lectureSummary.keyTheorems} accent="blue" />
            )}
          </div>

          {/* Formulas */}
          {lectureSummary.keyFormulas.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                נוסחאות מפתח
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {lectureSummary.keyFormulas.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 font-mono text-sm"
                    style={{ background: "var(--navy)", color: "#e2e8f0" }}
                    dir="ltr"
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam notes */}
          {lectureSummary.examNotes.length > 0 && (
            <div className="mt-4 space-y-2">
              {lectureSummary.examNotes.map((note, i) => (
                <StudyCallout key={i} variant="exam">
                  {note}
                </StudyCallout>
              ))}
            </div>
          )}

          {lectureSummary.summarySourceFile && (
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              מקור: {lectureSummary.summarySourceFile}
              {lectureSummary.dataQuality === "ocr_only" && " · איכות: OCR בלבד"}
              {lectureSummary.dataQuality === "partial" && " · איכות: חלקי"}
              {lectureSummary.dataQuality === "good" && " · איכות: טוב"}
            </p>
          )}
        </section>
      )}

      {/* Recitation summary */}
      {recitationSummary && (
        <section
          className="rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" style={{ color: "var(--cyan)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              תרגול {recitationSummary.recitationNumber}
            </h2>
            {recitationSummary.practicesLecture && (
              <span className="badge badge-navy-light">
                מתרגל הרצאה {recitationSummary.practicesLecture}
              </span>
            )}
            <ExamRelevanceBadge level={recitationSummary.examRelevance} />
          </div>

          {recitationSummary.dataNote && (
            <StudyCallout variant="warning" className="mb-4">
              {recitationSummary.dataNote}
            </StudyCallout>
          )}

          {/* What was practiced */}
          <div
            className="mb-4 rounded-lg p-4 text-sm leading-7"
            style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
          >
            {recitationSummary.whatWasPracticed}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recitationSummary.keyTechniques.length > 0 && (
              <TopicSection title="טכניקות מפתח" items={recitationSummary.keyTechniques} accent="cyan" />
            )}
            {recitationSummary.mustPractice.length > 0 && (
              <TopicSection title="מה לתרגל" items={recitationSummary.mustPractice} accent="navy" />
            )}
            {recitationSummary.commonMistakes.length > 0 && (
              <TopicSection title="טעויות נפוצות" items={recitationSummary.commonMistakes} accent="red" />
            )}
          </div>

          {recitationSummary.conclusions.length > 0 && (
            <div className="mt-4 space-y-2">
              {recitationSummary.conclusions.map((c, i) => (
                <StudyCallout key={i} variant="success">
                  {c}
                </StudyCallout>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Homework priority */}
      {homeworkPriority && (
        <section
          className="rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5" style={{ color: "var(--gold)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              מטלה {homeworkPriority.homeworkNumber}
            </h2>
            <span className={`badge ${
              homeworkPriority.overallPriority === "critical" ? "badge-red" :
              homeworkPriority.overallPriority === "high" ? "badge-navy" : "badge-amber"
            }`}>
              {homeworkPriority.criticalQuestions} קריטיות · {homeworkPriority.highPriorityQuestions} גבוהות
            </span>
          </div>

          <div className="space-y-3">
            {homeworkPriority.questions
              .filter((q) => q.importanceLevel !== "low")
              .slice(0, 6)
              .map((q) => (
                <div
                  key={q.questionId}
                  className="rounded-lg border p-4"
                  style={{
                    borderColor:
                      q.importanceLevel === "critical" ? "var(--red-border)" :
                      q.importanceLevel === "high" ? "var(--navy-border)" : "var(--border)",
                    background:
                      q.importanceLevel === "critical" ? "var(--red-light)" :
                      q.importanceLevel === "high" ? "var(--navy-light)" : "var(--bg-subtle)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      שאלה {q.questionNumber}
                    </span>
                    <DifficultyBadge level={q.difficulty} />
                    <ExamRelevanceBadge level={q.examSimilarity} />
                  </div>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {q.whyItMatters}
                  </p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    ➤ {q.recommendedAction}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Recitation questions preview */}
      {recitationQuestions.length > 0 && (
        <section
          className="rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            שאלות מהתרגול ({recitationQuestions.length})
          </h2>
          <div className="space-y-4">
            {recitationQuestions.map((q, i) => (
              <div
                key={q.id}
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--navy)" }}
                  >
                    {i + 1}
                  </span>
                  <DifficultyBadge level={q.difficulty} />
                  <ExamRelevanceBadge level={q.examRelevance} />
                </div>
                <MathContent text={q.content.slice(0, 500)} className="text-sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {weekNum > 1 && (
          <Link
            href={`/weeks/${weekNum - 1}`}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:border-current"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            ← שבוע {weekNum - 1}
          </Link>
        )}
        <div className="flex-1" />
        {weekNum < 13 && (
          <Link
            href={`/weeks/${weekNum + 1}`}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:border-current"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            שבוע {weekNum + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}

function MaterialStatusCard({ label, status }: { label: string; status: string }) {
  const isAvail = status === "available" || status === "multiple";
  return (
    <div
      className="rounded-xl border p-4 text-center"
      style={{
        background: isAvail ? "var(--green-light)" : "var(--red-light)",
        borderColor: isAvail ? "var(--green-border)" : "var(--red-border)",
      }}
    >
      <p className="text-xs font-semibold" style={{ color: isAvail ? "var(--green)" : "var(--red)" }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-bold" style={{ color: isAvail ? "var(--green)" : "var(--red)" }}>
        {isAvail ? "✓" : "חסר"}
      </p>
    </div>
  );
}

function TopicSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "navy" | "green" | "blue" | "cyan" | "red";
}) {
  const colorMap = {
    navy: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
    green: { bg: "var(--green-light)", text: "var(--green)", border: "var(--green-border)" },
    blue: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
    cyan: { bg: "var(--cyan-light)", text: "var(--cyan)", border: "var(--cyan-border)" },
    red: { bg: "var(--red-light)", text: "var(--red)", border: "var(--red-border)" },
  }[accent];

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: colorMap.border, background: colorMap.bg }}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: colorMap.text, opacity: 0.8 }}>
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: colorMap.text }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
