import Link from "next/link";
import type React from "react";
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  Gauge,
  Layers3,
  ScrollText,
  Sigma,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { calculus2Course } from "@/lib/calculus2/config";
import type { GeneratedDataSnapshot, MaterialInventory } from "@/lib/calculus2";
import type { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { StudyCallout } from "@/components/study/StudyCallout";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const moduleCards = [
  { href: "/weeks",            label: "שבועות",        desc: "מפת 13 שבועות",      icon: Calendar,      accent: "navy" },
  { href: "/topics",           label: "נושאים",        desc: "מבנה topic-first",   icon: Layers3,       accent: "navy" },
  { href: "/definitions",      label: "הגדרות",        desc: "בנק הגדרות",         icon: BookMarked,    accent: "cyan" },
  { href: "/formulas",         label: "נוסחאות",       desc: "בנק נוסחאות",        icon: Sigma,         accent: "cyan" },
  { href: "/theorems",         label: "משפטים",        desc: "בנק משפטים",         icon: ScrollText,    accent: "cyan" },
  { href: "/proof-patterns",   label: "תבניות הוכחה",  desc: "דפוסים חוזרים",     icon: BookOpen,      accent: "purple" },
  { href: "/practice",         label: "תרגול",         desc: "שאלות לפי נושא",     icon: Target,        accent: "green" },
  { href: "/simulations",      label: "סימולציות",     desc: "מבחני תרגול",        icon: FlaskConical,  accent: "amber" },
  { href: "/past-exams",       label: "מבחני עבר",     desc: "תדירות ודפוסים",     icon: FileQuestion,  accent: "amber" },
  { href: "/homework-review",  label: "חזרת מטלות",    desc: "עדיפות מטלות",       icon: ClipboardList, accent: "gold" },
  { href: "/quick-review",     label: "חזרה מהירה",    desc: "לפני המבחן",         icon: Zap,           accent: "red" },
  { href: "/progress",         label: "מעקב שליטה",    desc: "סטטוס נושאים",       icon: Gauge,        accent: "green" },
  { href: "/mentor",           label: "מנטור",         desc: "עזרה ואינטראקציה",   icon: Brain,         accent: "navy" },
  { href: "/instructor-notes", label: "הערות מקס",     desc: "הערות והנחיות",      icon: Sparkles,      accent: "purple" },
] as const;

export function Dashboard({
  inventory,
  generatedData,
  analysisData,
}: {
  inventory: MaterialInventory;
  generatedData: GeneratedDataSnapshot;
  analysisData: Awaited<ReturnType<typeof readAnalysisData>>;
}) {
  const daysLeft = getDaysUntilExam();
  const criticalTopics = analysisData.examPriorityMap?.topics.filter((t) => t.priorityLevel === "critical") ?? [];
  const highTopics = analysisData.examPriorityMap?.topics.filter((t) => t.priorityLevel === "high") ?? [];
  const readySimulations = analysisData.simulationExams.filter((s) => !s.needsReview && s.questions.length >= 4);
  const criticalHw = analysisData.homeworkPriorityMap.flatMap((hw) =>
    hw.questions.filter((q) => q.importanceLevel === "critical")
  ).slice(0, 3);
  const fullMaterialWeeks = generatedData.weekMap.filter(
    (week) =>
      week.materialStatus.lecture === "available" &&
      week.materialStatus.recitation !== "missing" &&
      week.materialStatus.homework === "available",
  ).length;
  const analyzedWeeks = generatedData.weekMap.filter((week) => week.topicCoverage.length > 0).length;
  const analyzedPercent = percentage(analyzedWeeks, calculus2Course.totalWeeks);
  const completeMaterialPercent = percentage(fullMaterialWeeks, calculus2Course.totalWeeks);
  const extractionSuccessPercent = percentage(
    generatedData.extractedTextIndex.filter((record) => record.status === "success").length,
    generatedData.extractedTextIndex.length,
  );
  const topicProgress = buildTopicProgress(analysisData);
  const strongTopics = topicProgress.filter((topic) => topic.status === "strong").slice(0, 4);
  const weakerTopics = topicProgress.filter((topic) => topic.status === "needs_work").slice(0, 4);

  const urgency = daysLeft <= 7 ? "red" : daysLeft <= 21 ? "amber" : "navy";

  return (
    <div className="space-y-6">
      {/* Hero / Exam countdown */}
      <section
        className="rounded-xl border p-6 shadow-sm"
        style={{
          background: urgency === "red" ? "var(--red-light)" : urgency === "amber" ? "var(--amber-light)" : "var(--navy)",
          borderColor: urgency === "red" ? "var(--red-border)" : urgency === "amber" ? "var(--amber-border)" : "var(--navy)",
          color: urgency === "navy" ? "#fff" : "var(--text-primary)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest opacity-70"
            >
              {calculus2Course.nameHe} · מועד א׳ · {calculus2Course.targetScoreLabel}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {daysLeft} ימים למבחן
            </h1>
            <p className="mt-1 text-sm opacity-80">
              01.07.2026 · יעד: {calculus2Course.targetScoreLabel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: urgency === "navy" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
              }}
            >
              {daysLeft <= 14 ? "⚠ פחות מ-2 שבועות" : daysLeft <= 30 ? "מצב כוננות" : "זמן ראוי לתכנון"}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "נוסחאות", value: analysisData.formulaBank.filter(f => f.confidence >= 0.5).length, href: "/formulas" },
            { label: "משפטים", value: analysisData.theoremBank.length, href: "/theorems" },
            { label: "שאלות", value: analysisData.questionBank.length, href: "/practice" },
            { label: "סימולציות", value: readySimulations.length, href: "/simulations" },
          ].map(({ label, value, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg p-3 text-center transition hover:opacity-80"
              style={{
                background: urgency === "navy" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)",
              }}
            >
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-0.5 text-xs opacity-70">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* No data warning */}
      {!generatedData.hasGeneratedData && (
        <StudyCallout variant="warning">
          עדיין לא בוצע עיבוד חומרים. הריצי{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">npm run process:calculus2</code>
          {" "}ואז{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">npm run analyze:calculus2</code>
          {" "}כדי להתחיל.
        </StudyCallout>
      )}

      <LearningProgressPanel
        analyzedPercent={analyzedPercent}
        completeMaterialPercent={completeMaterialPercent}
        extractionSuccessPercent={extractionSuccessPercent}
        analyzedWeeks={analyzedWeeks}
        fullMaterialWeeks={fullMaterialWeeks}
        strongTopics={strongTopics}
        weakerTopics={weakerTopics}
        hasAnalysis={analysisData.hasAnalysis}
      />

      {/* What to do NOW */}
      {analysisData.hasAnalysis && (
        <section
          className="rounded-xl border bg-white p-6 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            מה לעשות עכשיו
          </h2>

          <div className="mt-4 space-y-3">
            {criticalTopics.slice(0, 3).map((topic) => (
              <ActionItem
                key={topic.topicId}
                level="critical"
                title={`לתרגל: ${topic.title}`}
                desc={topic.recommendedAction}
                href="/topics"
              />
            ))}
            {criticalHw.slice(0, 2).map((q) => (
              <ActionItem
                key={q.questionId}
                level="high"
                title={`מטלה ${q.homeworkNumber} · שאלה ${q.questionNumber} — לחזור`}
                desc={q.whyItMatters}
                href="/homework-review"
              />
            ))}
            {readySimulations.slice(0, 1).map((sim) => (
              <ActionItem
                key={sim.id}
                level="medium"
                title={`פתרי סימולציה: ${sim.title}`}
                desc={`${sim.questions.length} שאלות · ${sim.estimatedDurationMinutes} דקות`}
                href={`/simulations/${sim.id}`}
              />
            ))}
            {criticalTopics.length === 0 && criticalHw.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                הריצי ניתוח חומרים כדי לקבל המלצות מדויקות.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Materials status + analysis status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            סטטוס חומרים
          </h2>
          <div className="space-y-2">
            {[
              { label: "הרצאות", value: inventory.countsByType.lecture },
              { label: "תרגולים", value: inventory.countsByType.recitation },
              { label: "מטלות", value: inventory.countsByType.homework },
              { label: "סיכומים", value: inventory.countsByType.summary },
              { label: "מבחני עבר", value: inventory.countsByType.past_exam },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "var(--bg-subtle)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            נושאים קריטיים למבחן
          </h2>
          {criticalTopics.length > 0 || highTopics.length > 0 ? (
            <div className="space-y-2">
              {[...criticalTopics, ...highTopics].slice(0, 7).map((topic) => (
                <div key={topic.topicId} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "var(--bg-subtle)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{topic.title}</span>
                  <span className={`badge ${topic.priorityLevel === "critical" ? "badge-red" : "badge-navy"}`}>
                    {topic.priorityLevel === "critical" ? "קריטי" : "גבוה"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              הריצי ניתוח חומרים לקבלת מפת עדיפות.
            </p>
          )}
        </section>
      </div>

      {/* Module grid */}
      <section>
        <h2 className="mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          עוד כלים
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map(({ href, label, desc, icon: Icon, accent }) => (
            <ModuleLink key={href} href={href} label={label} desc={desc} icon={Icon} accent={accent} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ActionItem({
  level,
  title,
  desc,
  href,
}: {
  level: "critical" | "high" | "medium";
  title: string;
  desc: string;
  href: string;
}) {
  const styles = {
    critical: { bg: "var(--red-light)", border: "var(--red-border)", dot: "var(--red)", label: "קריטי" },
    high: { bg: "var(--navy-light)", border: "var(--navy-border)", dot: "var(--navy-mid)", label: "גבוה" },
    medium: { bg: "var(--bg-subtle)", border: "var(--border)", dot: "var(--text-muted)", label: "" },
  }[level];

  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg border p-3 transition hover:opacity-80"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ background: styles.dot }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
          {desc}
        </p>
      </div>
    </Link>
  );
}

type TopicProgress = {
  topicId: string;
  title: string;
  score: number;
  priorityLevel: "low" | "medium" | "high" | "critical";
  status: "strong" | "needs_work" | "developing";
  reason: string;
};

function LearningProgressPanel({
  analyzedPercent,
  completeMaterialPercent,
  extractionSuccessPercent,
  analyzedWeeks,
  fullMaterialWeeks,
  strongTopics,
  weakerTopics,
  hasAnalysis,
}: {
  analyzedPercent: number;
  completeMaterialPercent: number;
  extractionSuccessPercent: number;
  analyzedWeeks: number;
  fullMaterialWeeks: number;
  strongTopics: TopicProgress[];
  weakerTopics: TopicProgress[];
  hasAnalysis: boolean;
}) {
  const bars = [
    analyzedPercent,
    completeMaterialPercent,
    extractionSuccessPercent,
    Math.max(12, Math.min(100, strongTopics.length * 22)),
    Math.max(12, Math.min(100, weakerTopics.length * 18)),
    Math.max(18, Math.round((analyzedPercent + completeMaterialPercent) / 2)),
    Math.max(18, Math.round((extractionSuccessPercent + analyzedPercent) / 2)),
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="group relative overflow-hidden rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/20">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
        <div className="absolute inset-px rounded-[11px] bg-slate-950" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">מעקב התקדמות בחומר</h2>
                <p className="text-xs text-slate-400">מבוסס על חומרים שנותחו, לא על סימון אישי ידני</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {hasAnalysis ? "פעיל" : "ממתין לניתוח"}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <DarkMetric label="שבועות שנותחו" value={`${analyzedWeeks}/13`} trend={`${analyzedPercent}%`} />
            <DarkMetric label="חומר מלא לשבוע" value={`${fullMaterialWeeks}/13`} trend={`${completeMaterialPercent}%`} />
            <DarkMetric label="חילוץ תקין" value={`${extractionSuccessPercent}%`} trend="PDF" />
            <DarkMetric label="נושאים חזקים" value={strongTopics.length} trend="כיסוי גבוה" />
          </div>

          <div
            className="learning-progress-container mb-4"
            style={{ "--progress-value": `${analyzedPercent}%` } as React.CSSProperties}
          >
            <div className="learning-progress-particles" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="learning-progress-bar" />
            <span className="learning-progress-text">{analyzedPercent}% נותח</span>
          </div>

          <div className="mb-4 h-20 w-full overflow-hidden rounded-lg bg-slate-900/60 p-3">
            <div className="flex h-full w-full items-end justify-between gap-1">
              {bars.map((bar, index) => (
                <div key={`${bar}-${index}`} className="flex h-full w-3 items-end rounded-sm bg-cyan-500/20">
                  <div
                    className="w-full rounded-sm bg-gradient-to-t from-cyan-500 to-emerald-300 transition-all duration-300"
                    style={{ height: `${bar}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">עדכון אחרון מתוך JSON מקומי</span>
            <Link
              href="/progress"
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:from-cyan-600 hover:to-indigo-600"
            >
              פירוט שליטה
              <Gauge className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopicListCard
          title="נושאים חזקים כרגע"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          items={strongTopics}
          empty="עדיין אין מספיק כיסוי כדי לסמן נושא כחזק."
        />
        <TopicListCard
          title="נושאים שדורשים חיזוק"
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="amber"
          items={weakerTopics}
          empty="לא זוהו פערים משמעותיים לפי החומרים המעובדים."
        />
      </div>
    </section>
  );
}

function DarkMetric({ label, value, trend }: { label: string; value: string | number; trend: string }) {
  return (
    <div className="rounded-lg bg-slate-900/60 p-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      <span className="text-xs font-medium text-emerald-400">{trend}</span>
    </div>
  );
}

function TopicListCard({
  title,
  icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "green" | "amber";
  items: TopicProgress[];
  empty: string;
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-amber-50 text-amber-800 border-amber-100";

  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClass}`}>{icon}</span>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((topic) => (
            <div key={topic.topicId} className="rounded-lg p-3" style={{ background: "var(--bg-subtle)" }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {topic.title}
                </span>
                <span className="font-mono text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                  {topic.score}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={tone === "green" ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-500"}
                  style={{ width: `${topic.score}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                {topic.reason}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7" style={{ color: "var(--text-muted)" }}>
          {empty}
        </p>
      )}
    </article>
  );
}

function buildTopicProgress(analysisData: Awaited<ReturnType<typeof readAnalysisData>>): TopicProgress[] {
  const topics = analysisData.examPriorityMap?.topics ?? [];
  const questionCountByTopic = new Map<string, number>();
  const formulaCountByTopic = new Map<string, number>();
  const theoremCountByTopic = new Map<string, number>();

  for (const question of analysisData.questionBank) {
    for (const topicId of question.topicIds) {
      questionCountByTopic.set(topicId, (questionCountByTopic.get(topicId) ?? 0) + 1);
    }
  }
  for (const formula of analysisData.formulaBank) {
    for (const topicId of formula.topicIds) {
      formulaCountByTopic.set(topicId, (formulaCountByTopic.get(topicId) ?? 0) + 1);
    }
  }
  for (const theorem of analysisData.theoremBank) {
    for (const topicId of theorem.topicIds) {
      theoremCountByTopic.set(topicId, (theoremCountByTopic.get(topicId) ?? 0) + 1);
    }
  }

  return topics
    .map((topic) => {
      const sourceCoverage =
        topic.appearedInLectures * 12 +
        topic.appearedInRecitations * 10 +
        topic.appearedInHomework * 10 +
        topic.appearedInPastExams * 16;
      const extractedCoverage =
        (questionCountByTopic.get(topic.topicId) ?? 0) * 3 +
        (formulaCountByTopic.get(topic.topicId) ?? 0) +
        (theoremCountByTopic.get(topic.topicId) ?? 0) * 4;
      const score = Math.min(100, Math.round(sourceCoverage + extractedCoverage));
      const isExamImportant = topic.priorityLevel === "critical" || topic.priorityLevel === "high";
      const status: TopicProgress["status"] =
        score >= 70 ? "strong" : isExamImportant && score < 55 ? "needs_work" : "developing";
      const reason =
        status === "strong"
          ? "יש כיסוי טוב בהרצאות/תרגולים/מטלות או הרבה פריטים שחולצו."
          : status === "needs_work"
            ? "הנושא חשוב למבחן, אבל הכיסוי המעובד או כמות התרגול נמוכים יחסית."
            : "נושא בתהליך בנייה; צריך עוד תרגול או אימות מול המקורות.";

      return {
        topicId: topic.topicId,
        title: topic.title,
        score,
        priorityLevel: topic.priorityLevel,
        status,
        reason,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function ModuleLink({
  href,
  label,
  desc,
  icon: Icon,
  accent,
}: {
  href: string;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  accent: string;
}) {
  const colors: Record<string, { bg: string; icon: string }> = {
    navy: { bg: "var(--navy-light)", icon: "var(--navy-mid)" },
    cyan: { bg: "var(--cyan-light)", icon: "var(--cyan)" },
    green: { bg: "var(--green-light)", icon: "var(--green)" },
    amber: { bg: "var(--amber-light)", icon: "var(--amber)" },
    red: { bg: "var(--red-light)", icon: "var(--red)" },
    purple: { bg: "var(--purple-light)", icon: "var(--purple)" },
    gold: { bg: "var(--gold-light)", icon: "var(--gold)" },
  };
  const c = colors[accent] ?? colors.navy;

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
      style={{ borderColor: "var(--border)" }}
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: c.bg }}
      >
        <span style={{ color: c.icon }}>
          <Icon className="h-4 w-4" />
        </span>
      </span>
      <span>
        <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
          {desc}
        </span>
      </span>
    </Link>
  );
}
