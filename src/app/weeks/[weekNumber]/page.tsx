import { notFound } from "next/navigation";
import Link from "next/link";
import type React from "react";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";
import { ExamRelevanceBadge } from "@/components/study/Badges";
import { getStudyGuide } from "@/lib/calculus2/study-guides";
import { getWeekRichContent } from "@/lib/calculus2/week-rich-content";
import { WeekRichContentPanel } from "@/components/study/WeekRichContent";
import { WeekSectionSidebar, type WeekSectionNavItem } from "./WeekSectionSidebar";
import {
  ArrowRight,
  BookMarked,
  ChevronRight,
  FileText,
  AlertTriangle,
  Wrench,
  Star,
  ListOrdered,
  CheckSquare,
} from "lucide-react";
import { WeekHomeworkSection } from "./WeekHomeworkSection";
import { WeekProgressTracker, type ProgSection, type ProgQuestion } from "@/components/progress/WeekProgressTracker";
import { LectureKnowledgeForWeek } from "@/components/LectureKnowledge";

export const dynamic = "force-dynamic";

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

  // Correct mapping: Recitation N practices Lecture N-1
  const practicedLecture = weekNum > 1 ? weekNum - 1 : null;
  // Homework N is based on Recitation N + Lecture N-1
  const homeworkBasedOnLecture = weekNum > 1 ? weekNum - 1 : null;

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

  const hwQuestions = homeworkPriority?.questions ?? [];
  const studyGuide = getStudyGuide(weekNum);
  const richContent = getWeekRichContent(weekNum);

  // Build progress tracker data
  const TRACKABLE_TAGS = ["הגדרה", "משפט", "כלל", "מסקנה"];
  const trackerSections: ProgSection[] = (richContent?.sections ?? [])
    .map((s, idx) => ({ idx, tag: s.tag, title: s.title }))
    .filter(s => TRACKABLE_TAGS.includes(s.tag));
  const trackerQuestions: ProgQuestion[] = hwQuestions.slice(0, 8).map(q => ({
    questionId: q.questionId,
    questionNumber: q.questionNumber,
    homeworkNumber: q.homeworkNumber,
  }));
  const hasTracker = trackerSections.length > 0 || trackerQuestions.length > 0;

  // Collect all common mistakes from recitation summary
  const allCommonMistakes = recitationSummary?.commonMistakes ?? [];
  // Collect conclusions / key takeaways
  const allConclusions = recitationSummary?.conclusions ?? [];
  // Collect must-practice items
  const mustPractice = recitationSummary?.mustPractice ?? [];
  const hasWeeklySummary = allCommonMistakes.length > 0 || allConclusions.length > 0 || mustPractice.length > 0;
  const hasInferenceDiagram = buildInferenceNodes(lectureSummary, recitationSummary, homeworkPriority).length > 0;
  const weekSections = [
    hasTracker && { id: "week-tracker", label: "מעקב" },
    hasWeeklySummary && { id: "week-start", label: "לפני שמתחילים" },
    studyGuide && { id: "study-guide", label: "איך ללמוד" },
    richContent && { id: "week-rich-content", label: "חומר והגדרות" },
    hasInferenceDiagram && { id: "week-diagram", label: "תרשים שבוע" },
    { id: "lecture-summary", label: "סיכום הרצאה" },
    { id: "recitation-summary", label: "סיכום תרגול" },
    { id: "homework-summary", label: "מטלה" },
    lectureQuotes.length > 0 && { id: "lecture-source", label: "ציטוטי הרצאה" },
    recitationQuestions.length > 0 && { id: "recitation-questions", label: "שאלות מתרגול" },
  ].filter(Boolean) as WeekSectionNavItem[];

  return (
    /* Full-page flex: sidebar right (RTL first = right), content left */
    <div className="lg:flex lg:gap-6 lg:items-start">

      {/* ── Desktop sticky sidebar ── */}
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start shrink-0 w-55 xl:w-60">
        <WeekSectionSidebar sections={weekSections} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-0">

        {/* Mobile sidebar — horizontal pill strip */}
        <div className="lg:hidden -mx-4 mb-2">
          <WeekSectionSidebar sections={weekSections} />
        </div>

        {/* ── Nav breadcrumb ── */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link href="/weeks" className="hover:underline" style={{ color: "var(--text-secondary)" }}>
              שבועות
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>שבוע {weekNum}</span>
          </div>
          <Link
            href={`/weeks/${weekNum}/summary`}
            className="rounded-lg px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
            style={{ background: "var(--navy-light)", color: "var(--navy-mid)", border: "1px solid var(--navy-border)" }}
          >
            סיכום שבוע
          </Link>
        </div>

        {/* ── Hero ── */}
        <div className="mb-8 pb-7 border-b" style={{ borderColor: "var(--border)" }}>
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            שבוע {weekNum}
          </p>
          <h1
            className="text-4xl font-black mb-4"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: "1.15" }}
          >
            {lectureSummary?.title ?? `שבוע ${weekNum} — אינפי ב׳`}
          </h1>

          {lectureSummary && lectureSummary.mainTopics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {lectureSummary.mainTopics.map((t) => (
                <span
                  key={t}
                  className="rounded-md px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/weeks/${weekNum}/summary`}
            className="mb-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
            style={{
              background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
              boxShadow: "0 10px 24px rgba(15, 34, 64, 0.18)",
            }}
          >
            <FileText className="h-4 w-4" />
            פתחי סיכום שבוע {weekNum}
          </Link>

          {/* Course mapping */}
          <div className="flex flex-wrap gap-2">
            <MappingPill icon="📖" label={`הרצאה ${weekNum}`} desc="חומר חדש" />
            <span className="self-center text-sm" style={{ color: "var(--border-strong)" }}>→</span>
            <MappingPill
              icon="✏️"
              label={`תרגול ${weekNum}`}
              desc={practicedLecture ? `מתרגל הרצאה ${practicedLecture}` : "פתיחת קורס"}
              highlight
            />
            <span className="self-center text-sm" style={{ color: "var(--border-strong)" }}>→</span>
            <MappingPill
              icon="📋"
              label={`מטלה ${weekNum}`}
              desc={
                homeworkBasedOnLecture
                  ? `תרגול ${weekNum} + הרצאה ${homeworkBasedOnLecture}`
                  : "חומר ראשון"
              }
            />
          </div>
        </div>

        {/* ── Progress tracker ── */}
        {hasTracker && (
          <WeekProgressTracker
            weekNum={weekNum}
            sections={trackerSections}
            questions={trackerQuestions}
          />
        )}

        {/* ── Weekly Summary Banner — Important notes, conclusions, mistakes ── */}
        {hasWeeklySummary && (
            <WeeklySummaryBanner
              id="week-start"
              weekNum={weekNum}
              commonMistakes={allCommonMistakes}
              conclusions={allConclusions}
              mustPractice={mustPractice}
              keyTechniques={recitationSummary?.keyTechniques ?? []}
            />
          )}

          {/* ── How to Study This Week ── */}
          {studyGuide && (
            <StudyGuideSection id="study-guide" guide={studyGuide} weekNum={weekNum} />
          )}

          {/* ── Rich pedagogical content (weeks 7–9+) ── */}
          {richContent && (
            <section id="week-rich-content" className="mb-8 scroll-mt-24">
              <div className="mb-5">
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  סיכום שבוע {weekNum}
                </p>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  חומר, הגדרות ומבחנים
                </h2>
              </div>
              <WeekRichContentPanel content={richContent} weekNum={weekNum} />
            </section>
          )}

          <WeekInferenceDiagram
            id="week-diagram"
            weekNumber={weekNum}
            lectureSummary={lectureSummary}
            recitationSummary={recitationSummary}
            homeworkPriority={homeworkPriority}
          />

          {/* ── 3-column layout ── */}
          <div className="grid gap-5 lg:grid-cols-3 mb-8">

            {/* ─ Lecture ─ */}
            <Column id="lecture-summary" title="📖 הרצאה" subtitle={`הרצאה ${weekNum} — חומר חדש`} accentColor="var(--navy-mid)">
              {lectureSummary ? (
                <div className="space-y-5">
                  {lectureSummary.ocrWarning && (
                    <StudyCallout variant="warning">{lectureSummary.ocrWarning}</StudyCallout>
                  )}

                  {lectureSummary.keyDefinitions.length > 0 && (
                    <BulletGroup label="הגדרות" color="green" items={lectureSummary.keyDefinitions} />
                  )}

                  {lectureSummary.keyTheorems.length > 0 && (
                    <BulletGroup label="משפטים" color="navy" items={lectureSummary.keyTheorems} />
                  )}

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
              id="recitation-summary"
              title="✏️ תרגול"
              subtitle={
                recitationSummary
                  ? `תרגול ${recitationSummary.recitationNumber} · מתרגל הרצאה ${practicedLecture ?? "פתיחה"}`
                  : `תרגול ${weekNum}`
              }
              accentColor="var(--teal)"
            >
              {recitationSummary ? (
                <div className="space-y-5">
                  {practicedLecture !== null &&
                    recitationSummary.practicesLecture !== null &&
                    practicedLecture !== recitationSummary.practicesLecture && (
                      <StudyCallout variant="info">
                        לפי מבנה הקורס, תרגול {weekNum} מתרגל הרצאה {practicedLecture}. הניתוח הפנימי סימן הרצאה {recitationSummary.practicesLecture ?? "לא ידועה"}.
                      </StudyCallout>
                    )}

                  <p className="text-sm leading-8" style={{ color: "var(--text-secondary)" }}>
                    {recitationSummary.whatWasPracticed}
                  </p>

                  {recitationSummary.keyTechniques.length > 0 && (
                    <BulletGroup label="טכניקות" color="teal" items={recitationSummary.keyTechniques} />
                  )}

                  {recitationSummary.mustPractice.length > 0 && (
                    <BulletGroup label="חובה לתרגל" color="navy" items={recitationSummary.mustPractice} />
                  )}

                  {recitationSummary.commonMistakes.length > 0 && (
                    <BulletGroup label="טעויות נפוצות" color="red" items={recitationSummary.commonMistakes} />
                  )}

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

            {/* ─ Homework — with progressive hints ─ */}
            <Column
              id="homework-summary"
              title="📋 מטלה"
              subtitle={
                homeworkPriority
                  ? `מטלה ${homeworkPriority.homeworkNumber} · מבוסס תרגול ${homeworkPriority.homeworkNumber}${homeworkBasedOnLecture ? ` + הרצאה ${homeworkBasedOnLecture}` : ""}`
                  : ""
              }
              accentColor="var(--amber-mid)"
            >
              {hwQuestions.length > 0 ? (
                <WeekHomeworkSection questions={hwQuestions} />
              ) : (
                <EmptyCol text="אין ניתוח מטלה לשבוע זה" />
              )}
            </Column>
          </div>

          {/* ── Word-for-word definitions & theorems from the lectures ── */}
          <section id="lecture-knowledge" className="mb-8 scroll-mt-24">
            <LectureKnowledgeForWeek week={weekNum} />
          </section>

          {/* ── Definitions quick-link ── */}
          <div
            className="mb-8 rounded-lg border px-4 py-3 flex items-center justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <BookMarked className="h-4 w-4 shrink-0" style={{ color: "var(--teal)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                נתקעת בהגדרה? מאגר ההגדרות כולל פורמלי + אינטואיציה + דוגמה לכל מושג.
              </p>
            </div>
            <Link
              href="/definitions"
              className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition hover:bg-white"
              style={{ borderColor: "var(--teal-border)", color: "var(--teal)" }}
            >
              פתחי מאגר
            </Link>
          </div>

          <LectureSourceQuotes id="lecture-source" quotes={lectureQuotes} />

          {/* ── Recitation questions ── */}
          {recitationQuestions.length > 0 && (
            <section id="recitation-questions" className="mb-8 scroll-mt-24">
              <SectionTitle label="שאלות מהתרגול" />
              <div
                className="mt-4 rounded-xl border bg-white overflow-hidden"
                style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {recitationQuestions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex gap-4 p-5"
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black"
                        style={{ background: "var(--bg-inset)", color: "var(--text-secondary)" }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <ExamRelevanceBadge level={q.examRelevance} />
                          {q.topicIds.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-md px-2 py-0.5 text-xs"
                              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
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
            </section>
          )}

          {/* ── Week navigation ── */}
          <div className="flex items-center justify-between pt-2 pb-4">
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
      </div>
  );
}

/* ─────────────────── Mapping Pill ─────────────────── */
function MappingPill({
  icon,
  label,
  desc,
  highlight,
}: {
  icon: string;
  label: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: highlight ? "var(--navy-light)" : "var(--bg-subtle)",
        border: `1px solid ${highlight ? "var(--navy-border)" : "var(--border)"}`,
      }}
    >
      <span className="text-sm">{icon}</span>
      <div>
        <p
          className="text-xs font-black"
          style={{ color: highlight ? "var(--navy-mid)" : "var(--text-primary)" }}
        >
          {label}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────── Weekly Summary Banner ─────────────────── */
function WeeklySummaryBanner({
  id,
  weekNum,
  commonMistakes,
  conclusions,
  mustPractice,
  keyTechniques,
}: {
  id: string;
  weekNum: number;
  commonMistakes: string[];
  conclusions: string[];
  mustPractice: string[];
  keyTechniques: string[];
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <SectionTitle label="לפני שמתחילים" sub={`סיכום שבוע ${weekNum}`} />
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {conclusions.length > 0 && (
          <SummaryCard
            icon={<Star className="h-3.5 w-3.5" />}
            title="מסקנות מרכזיות"
            color="var(--amber-mid)"
            bgColor="var(--amber-light)"
            borderColor="var(--amber-border)"
            items={conclusions}
          />
        )}

        {commonMistakes.length > 0 && (
          <SummaryCard
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            title="טעויות נפוצות"
            color="var(--red-mid)"
            bgColor="var(--red-light)"
            borderColor="var(--red-border)"
            items={commonMistakes}
          />
        )}

        {(keyTechniques.length > 0 || mustPractice.length > 0) && (
          <SummaryCard
            icon={<Wrench className="h-3.5 w-3.5" />}
            title="כלים מרכזיים"
            color="var(--teal)"
            bgColor="var(--teal-light)"
            borderColor="var(--teal-border)"
            items={[...keyTechniques, ...mustPractice].slice(0, 6)}
          />
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  icon,
  title,
  color,
  bgColor,
  borderColor,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: string[];
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: bgColor, borderColor }}
    >
      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        {icon}
        <p className="text-xs font-black uppercase tracking-wider">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 5).map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <MathContent text={item} className="text-xs" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────── Study Guide Section ─────────────────── */
function StudyGuideSection({
  id,
  guide,
  weekNum,
}: {
  id: string;
  guide: ReturnType<typeof getStudyGuide>;
  weekNum: number;
}) {
  if (!guide) return null;

  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <SectionTitle label={`איך ללמוד שבוע ${weekNum}`} sub="מדריך לימוד" />

      {guide.quickTip && (
        <p className="mt-3 mb-5 text-sm" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
          {guide.quickTip}
        </p>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GuideCard icon={<BookMarked className="h-3.5 w-3.5" />} title="מה לחזור קודם" color="var(--navy-mid)" items={guide.reviewFirst} />
        <GuideCard icon={<CheckSquare className="h-3.5 w-3.5" />} title="חובה לשנן" color="var(--green)" items={guide.mustMemorize} />
        <GuideCard icon={<Wrench className="h-3.5 w-3.5" />} title="כלים מרכזיים" color="var(--teal)" items={guide.centralTools} />
        <GuideCard icon={<AlertTriangle className="h-3.5 w-3.5" />} title="טעויות נפוצות" color="var(--red-mid)" items={guide.commonMistakes} />
      </div>

      {/* Study order */}
      {guide.studyOrder.length > 0 && (
        <div
          className="mt-5 rounded-xl border p-5"
          style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
        >
          <div className="flex items-center gap-2 mb-4" style={{ color: "var(--text-muted)" }}>
            <ListOrdered className="h-3.5 w-3.5" />
            <p className="text-xs font-bold uppercase tracking-widest">סדר לימוד מומלץ</p>
          </div>
          <ol className="space-y-2">
            {guide.studyOrder.map((step, i) => (
              <li key={i} className="study-guide-step">
                <span className="study-guide-step-num">{i + 1}</span>
                <MathContent text={step.text} className="text-sm" />
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function GuideCard({
  icon,
  title,
  color,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <p className="text-xs font-black uppercase tracking-wider">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <MathContent text={item} className="text-xs leading-6" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────── Section title ─────────────────── */
function SectionTitle({ label, sub }: { label: string; sub?: string }) {
  return (
    <div>
      {sub && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      )}
      <h2 className="text-xl font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {label}
      </h2>
    </div>
  );
}

/* ─────────────────── Column ─────────────────── */
function Column({
  id,
  title,
  subtitle,
  accentColor,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-xl border bg-white overflow-hidden"
      style={{
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{
          borderColor: "var(--border)",
          borderRightWidth: "3px",
          borderRightStyle: "solid",
          borderRightColor: accentColor,
        }}
      >
        <h2 className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
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
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: dotColor[color] }}
            />
            <MathContent text={item} className="flex-1 text-sm leading-8" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormulaDisplay({ formula }: { formula: string }) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--navy-border)", background: "var(--navy-light)" }}
    >
      <MathContent text={formula} />
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

/* ─────────────────── Week Inference Diagram ─────────────────── */
type WeekInferenceProps = {
  id: string;
  weekNumber: number;
  lectureSummary: { mainTopics: string[]; keyDefinitions: string[]; keyTheorems: string[]; keyFormulas: string[]; examNotes: string[] } | undefined;
  recitationSummary: { keyTechniques: string[]; conclusions: string[]; mustPractice: string[] } | undefined;
  homeworkPriority: { questions: Array<{ topicIds: string[]; whyItMatters: string; importanceLevel: string }> } | undefined;
};

function WeekInferenceDiagram({ id, weekNumber, lectureSummary, recitationSummary, homeworkPriority }: WeekInferenceProps) {
  const nodes = buildInferenceNodes(lectureSummary, recitationSummary, homeworkPriority);
  if (nodes.length === 0) return null;

  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <SectionTitle label="מה ההגדרות מאפשרות להסיק" sub={`תרשים שבוע ${weekNumber}`} />
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {nodes.map((node, index) => (
          <div key={`${node.title}-${index}`} className="relative">
            <InferenceNode node={node} />
            {index < nodes.length - 1 && (
              <div
                className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 text-sm font-black"
                style={{ color: "var(--border-strong)" }}
              >
                ←
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

type InferenceNodeData = { title: string; label: string; detail: string; tone: "navy" | "green" | "teal" | "amber" };

function InferenceNode({ node }: { node: InferenceNodeData }) {
  const toneMap = {
    navy:  { accent: "var(--navy-mid)",  bg: "var(--bg-card)" },
    green: { accent: "var(--green-mid)", bg: "var(--bg-card)" },
    teal:  { accent: "var(--teal)",      bg: "var(--bg-card)" },
    amber: { accent: "var(--amber-mid)", bg: "var(--bg-card)" },
  }[node.tone];

  return (
    <article
      className="h-full rounded-xl border p-4"
      style={{
        background: toneMap.bg,
        borderColor: "var(--border)",
        borderTopWidth: "2px",
        borderTopColor: toneMap.accent,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: toneMap.accent }}>
        {node.title}
      </p>
      <div className="min-h-10">
        <MathContent text={node.label} className="text-sm font-bold" />
      </div>
      <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
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
    homeworkPriority?.questions.find((q) => q.importanceLevel !== "low")?.whyItMatters;

  return [
    definition && { title: "הגדרה", label: definition, detail: "מגדירה את האובייקט שעליו מותר לעבוד בהמשך השבוע.", tone: "green" as const },
    theorem && { title: "משפט", label: theorem, detail: "נותן תנאים שמאפשרים להסיק תוצאה בלי לפתור מאפס.", tone: "navy" as const },
    (formula ?? technique) && { title: formula ? "נוסחה" : "טכניקה", label: formula ?? technique ?? "", detail: formula ? "הופכת את המשפט לכלי חישוב/זיהוי בתרגילים." : "זה הצעד הפרקטי שמתרגלים על בסיס הרצאה קודמת.", tone: "teal" as const },
    conclusion && { title: "מה מסיקים", label: conclusion, detail: "זו המסקנה שצריך לקחת לתרגול, מטלות ומבחני עבר.", tone: "amber" as const },
  ].filter(Boolean) as InferenceNodeData[];
}

function firstMeaningful(items: string[] | undefined): string | undefined {
  return items?.find((item) => item.trim().length > 0);
}

/* ─────────────────── Lecture Source Quotes ─────────────────── */
type QuoteBlock = { kind: string; source: string; text: string };

function LectureSourceQuotes({ id, quotes }: { id: string; quotes: QuoteBlock[] }) {
  if (quotes.length === 0) return null;

  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <SectionTitle label="הגדרות ומשפטים מהרצאה" sub="ציטוט מקור" />
      <p className="mt-1 mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
        טקסט שחולץ בפועל מהקבצים — אם OCR לא קריא, מוצג סיכום מקושר.
      </p>
      <div
        className="rounded-xl border bg-white divide-y overflow-hidden"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {quotes.map((quote, index) => (
          <article key={`${quote.kind}-${index}`} className="p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2.5 py-0.5 text-xs font-bold"
                style={{ background: "var(--navy-light)", color: "var(--navy-mid)", border: "1px solid var(--navy-border)" }}
              >
                {index + 1}. {quote.kind}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>מקור: {quote.source}</span>
            </div>
            <div
              className="rounded-lg p-4"
              style={{
                borderRight: "3px solid var(--teal)",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRightColor: "var(--teal)",
                borderRightWidth: "3px",
              }}
            >
              <MathContent text={quote.text} className="text-sm" />
            </div>
          </article>
        ))}
      </div>
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
    quotes.push({ kind: match[1], source, text: block });
  }

  return quotes;
}
