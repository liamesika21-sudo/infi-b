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
import type { LectureSummary } from "@/lib/calculus2/analysis-types";
import { StudyCallout } from "@/components/study/StudyCallout";
import { DashboardProgress } from "@/components/progress/DashboardProgress";
import { HomeworkMasteryAxis } from "@/components/progress/HomeworkMasteryAxis";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

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
  const criticalTopics =
    analysisData.examPriorityMap?.topics.filter((t) => t.priorityLevel === "critical") ?? [];
  const highTopics =
    analysisData.examPriorityMap?.topics.filter((t) => t.priorityLevel === "high") ?? [];
  const readySimulations = analysisData.simulationExams.filter(
    (s) => !s.needsReview && s.questions.length >= 4,
  );
  const criticalHw = analysisData.homeworkPriorityMap
    .flatMap((hw) => hw.questions.filter((q) => q.importanceLevel === "critical"))
    .slice(0, 3);
  const fullMaterialWeeks = generatedData.weekMap.filter(
    (week) =>
      week.materialStatus.lecture === "available" &&
      week.materialStatus.recitation !== "missing" &&
      week.materialStatus.homework === "available",
  ).length;
  const analyzedWeeks = generatedData.weekMap.filter(
    (week) => week.topicCoverage.length > 0,
  ).length;
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

  const heroHeadline =
    daysLeft <= 7
      ? "שבוע אחרון — מיקוד מלא"
      : daysLeft <= 14
        ? "ספרינט סופי"
        : daysLeft <= 30
          ? "בשלב הכוננות"
          : "בונים לקראת 90+";

  const heroSubline =
    daysLeft > 30
      ? "יש זמן לבנות בסיס חזק — כסו שבוע שבוע ותרגלו כל נושא."
      : daysLeft > 14
        ? "עכשיו הזמן לסגור פערים ולהתחיל סימולציות מלאות."
        : "מיקוד על נושאים קריטיים, ביטחון עצמי, ותרגול מבחנים אמיתיים.";

  const statPills = [
    {
      label: "נוסחאות",
      value: analysisData.formulaBank.filter((f) => f.confidence >= 0.5).length,
      href: "/formulas",
      rgb: "34,197,94",
    },
    {
      label: "משפטים",
      value: analysisData.theoremBank.length,
      href: "/theorems",
      rgb: "59,130,246",
    },
    {
      label: "שאלות",
      value: analysisData.questionBank.length,
      href: "/practice",
      rgb: "251,146,60",
    },
    {
      label: "סימולציות",
      value: readySimulations.length,
      href: "/simulations",
      rgb: "167,139,250",
    },
  ];

  const countdownAccentColor =
    urgency === "red" ? "#f87171" : urgency === "amber" ? "#fbbf24" : "#ffffff";
  const countdownBgColor =
    urgency === "red"
      ? "rgba(239,68,68,0.12)"
      : urgency === "amber"
        ? "rgba(245,158,11,0.12)"
        : "rgba(255,255,255,0.06)";
  const countdownBorderColor =
    urgency === "red"
      ? "rgba(239,68,68,0.25)"
      : urgency === "amber"
        ? "rgba(245,158,11,0.25)"
        : "rgba(255,255,255,0.1)";
  const ctaBg =
    urgency === "red"
      ? "#ef4444"
      : urgency === "amber"
        ? "#f59e0b"
        : "linear-gradient(135deg,#3b82f6,#6366f1)";

  return (
    <div className="space-y-8">
      {/* ══ HERO ══ */}
      <section
        style={{
          background: "linear-gradient(135deg,#061424 0%,#0c1f3d 50%,#061424 100%)",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* dot-grid decoration */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }}
        />
        {/* ambient glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-60px",
            right: "15%",
            width: "280px",
            height: "280px",
            background: "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", padding: "clamp(1.5rem,4vw,2rem)" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
            }}
          >
            {/* Left: text + stat pills */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "10px",
                }}
              >
                {calculus2Course.nameHe} · מועד א׳ · {calculus2Course.targetScoreLabel}
              </p>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(1.75rem,4vw,2.75rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: "10px",
                  letterSpacing: "-0.025em",
                }}
              >
                {heroHeadline}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  marginBottom: "1.5rem",
                  maxWidth: "400px",
                }}
              >
                {heroSubline}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {statPills.map(({ label, value, href, rgb }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      background: `rgba(${rgb},0.15)`,
                      border: `1px solid rgba(${rgb},0.3)`,
                      borderRadius: "999px",
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "15px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {value}
                    </span>
                    <span
                      style={{
                        color: `rgba(${rgb},0.95)`,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: countdown box */}
            <div
              style={{
                background: countdownBgColor,
                border: `1px solid ${countdownBorderColor}`,
                borderRadius: "14px",
                padding: "1.75rem 2rem",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "6px",
                }}
              >
                זמן עד מבחן
              </p>
              <p
                dir="ltr"
                style={{
                  color: countdownAccentColor,
                  fontSize: "clamp(3rem,10vw,5.5rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {daysLeft}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "4px",
                  marginBottom: "16px",
                }}
              >
                ימים
              </p>
              <Link
                href="/practice"
                style={{
                  display: "block",
                  background: ctaBg,
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "9px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                תרגל עכשיו ←
              </Link>
              <Link
                href="/quiz-prep"
                style={{
                  display: "block",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "9px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  marginTop: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                📋 הכנה לבוחן
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* No data warning */}
      {!generatedData.hasGeneratedData && (
        <StudyCallout variant="warning">
          עדיין לא בוצע עיבוד חומרים. הריצי{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">
            npm run process:calculus2
          </code>{" "}
          ואז{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">
            npm run analyze:calculus2
          </code>{" "}
          כדי להתחיל.
        </StudyCallout>
      )}

      {/* ══ PERSONAL PROGRESS ══ */}
      <DashboardProgress />

      {/* ══ HOMEWORK MASTERY AXIS ══ */}
      <HomeworkMasteryAxis />

      {/* ══ NAVIGATION GRID ══ */}
      <section>
        <SectionHeader title="כלי לימוד" accent="#6366f1" />
        <div className="space-y-5">
          {(
            [
              {
                title: "תיאוריה ולמידה",
                accent: "#3b82f6",
                items: [
                  { href: "/weeks", label: "שבועות", desc: "מפת 13 שבועות", icon: Calendar },
                  { href: "/topics", label: "נושאים", desc: "מבנה topic-first", icon: Layers3 },
                  { href: "/formulas", label: "נוסחאות", desc: "בנק נוסחאות", icon: Sigma },
                  { href: "/theorems", label: "משפטים", desc: "בנק משפטים", icon: ScrollText },
                  { href: "/definitions", label: "הגדרות", desc: "בנק הגדרות", icon: BookMarked },
                  {
                    href: "/proof-patterns",
                    label: "תבניות הוכחה",
                    desc: "דפוסים חוזרים",
                    icon: BookOpen,
                  },
                ],
              },
              {
                title: "תרגול ובחינה",
                accent: "#f59e0b",
                items: [
                  { href: "/practice", label: "תרגול", desc: "שאלות לפי נושא", icon: Target },
                  {
                    href: "/simulations",
                    label: "סימולציות",
                    desc: "מבחני תרגול",
                    icon: FlaskConical,
                  },
                  {
                    href: "/past-exams",
                    label: "מבחני עבר",
                    desc: "תדירות ודפוסים",
                    icon: FileQuestion,
                  },
                  {
                    href: "/homework-review",
                    label: "חזרת מטלות",
                    desc: "עדיפות מטלות",
                    icon: ClipboardList,
                  },
                ],
              },
              {
                title: "מעקב וכלים",
                accent: "#8b5cf6",
                items: [
                  { href: "/quick-review", label: "חזרה מהירה", desc: "לפני המבחן", icon: Zap },
                  {
                    href: "/progress",
                    label: "מעקב שליטה",
                    desc: "סטטוס נושאים",
                    icon: Gauge,
                  },
                  { href: "/mentor", label: "מנטור", desc: "עזרה ואינטראקציה", icon: Brain },
                  {
                    href: "/instructor-notes",
                    label: "הערות מקס",
                    desc: "הערות והנחיות",
                    icon: Sparkles,
                  },
                ],
              },
            ] as Array<{
              title: string;
              accent: string;
              items: Array<{
                href: string;
                label: string;
                desc: string;
                icon: React.FC<{ className?: string }>;
              }>;
            }>
          ).map((group) => (
            <div key={group.title}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: group.accent,
                    flexShrink: 0,
                  }}
                />
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--text-muted)",
                  }}
                >
                  {group.title}
                </h3>
                <div
                  style={{ flex: 1, height: "1px", background: "var(--border)" }}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map(({ href, label, desc, icon }) => (
                  <NavCard
                    key={href}
                    href={href}
                    label={label}
                    desc={desc}
                    icon={icon}
                    accent={group.accent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LEARNING PROGRESS ══ */}
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

      {/* ══ TODAY'S FOCUS ══ */}
      {analysisData.hasAnalysis &&
        (criticalTopics.length > 0 || criticalHw.length > 0 || readySimulations.length > 0) && (
          <section>
            <SectionHeader title="מיקוד להיום" accent="#ef4444" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ...criticalTopics.slice(0, 2).map((topic) => ({
                  level: "critical" as const,
                  title: `נושא קריטי: ${topic.title}`,
                  desc: topic.recommendedAction,
                  href: "/topics",
                })),
                ...criticalHw.slice(0, 1).map((q) => ({
                  level: "high" as const,
                  title: `מטלה ${q.homeworkNumber} · שאלה ${q.questionNumber}`,
                  desc: q.whyItMatters,
                  href: "/homework-review",
                })),
                ...readySimulations.slice(0, 1).map((sim) => ({
                  level: "medium" as const,
                  title: `סימולציה: ${sim.title}`,
                  desc: `${sim.questions.length} שאלות · ${sim.estimatedDurationMinutes} דקות`,
                  href: `/simulations/${sim.id}`,
                })),
              ].map((item, i) => (
                <ActionItem key={i} {...item} />
              ))}
            </div>
          </section>
        )}

      {/* ══ STATUS PANELS ══ */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Materials status */}
        <section
          className="rounded-xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <SectionHeader title="סטטוס חומרים" accent="#3b82f6" small />
          <div className="mt-4 space-y-2">
            {[
              { label: "הרצאות", value: inventory.countsByType.lecture, emoji: "📖" },
              { label: "תרגולים", value: inventory.countsByType.recitation, emoji: "✏️" },
              { label: "מטלות", value: inventory.countsByType.homework, emoji: "📝" },
              { label: "סיכומים", value: inventory.countsByType.summary, emoji: "📋" },
              { label: "מבחני עבר", value: inventory.countsByType.past_exam, emoji: "📄" },
            ].map(({ label, value, emoji }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg px-4 py-2.5"
                style={{ background: "var(--bg-subtle)" }}
              >
                <span
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span>{emoji}</span>
                  {label}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={
                    value > 0
                      ? {
                          background: "var(--navy-light)",
                          color: "var(--navy-mid)",
                          border: "1px solid var(--navy-border)",
                        }
                      : {
                          background: "var(--bg-inset)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Critical topics */}
        <section
          className="rounded-xl border bg-white p-5 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <SectionHeader title="נושאים קריטיים למבחן" accent="#ef4444" small />
          {criticalTopics.length > 0 || highTopics.length > 0 ? (
            <div className="mt-4 space-y-2">
              {[...criticalTopics, ...highTopics].slice(0, 7).map((topic) => (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between rounded-lg px-4 py-2.5"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {topic.title}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={
                      topic.priorityLevel === "critical"
                        ? { background: "#fee2e2", color: "#dc2626" }
                        : { background: "#dbeafe", color: "#2563eb" }
                    }
                  >
                    {topic.priorityLevel === "critical" ? "קריטי" : "גבוה"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
              הריצי ניתוח חומרים לקבלת מפת עדיפות.
            </p>
          )}
        </section>
      </div>

      {/* ══ LECTURE TABLE ══ */}
      {analysisData.lectureSummaries.length > 0 && (
        <LectureOverviewTable lectureSummaries={analysisData.lectureSummaries} />
      )}
    </div>
  );
}

/* ─── Section header with colored bar ─────────────────────────── */
function SectionHeader({
  title,
  accent,
  small = false,
}: {
  title: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: small ? 0 : "16px",
      }}
    >
      <span
        style={{
          width: "3px",
          height: small ? "16px" : "22px",
          borderRadius: "999px",
          background: accent,
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          fontSize: small ? "16px" : "20px",
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ─── Priority action card ─────────────────────────────────────── */
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
  const cfg = {
    critical: {
      borderColor: "#ef4444",
      badge: { bg: "#fee2e2", text: "#dc2626", label: "קריטי" },
    },
    high: {
      borderColor: "#f59e0b",
      badge: { bg: "#fef3c7", text: "#d97706", label: "גבוה" },
    },
    medium: {
      borderColor: "#3b82f6",
      badge: { bg: "#dbeafe", text: "#2563eb", label: "תרגול" },
    },
  }[level];

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
      style={{
        borderColor: "var(--border)",
        borderRight: `3px solid ${cfg.borderColor}`,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: cfg.badge.bg,
          color: cfg.badge.text,
          fontSize: "11px",
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: "999px",
          width: "fit-content",
        }}
      >
        {cfg.badge.label}
      </span>
      <p
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.4,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
        }}
      >
        {desc}
      </p>
    </Link>
  );
}

/* ─── Navigation card for the bottom grid ─────────────────────── */
function NavCard({
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
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
      style={{ borderColor: "var(--border)", textDecoration: "none" }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "2px",
          }}
        >
          {desc}
        </span>
      </span>
    </Link>
  );
}

/* ─── Learning Progress Panel (dark card + topics) ─────────────── */
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
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-500 via-indigo-500 to-amber-400 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
        <div className="absolute inset-px rounded-[11px] bg-slate-950" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500 to-indigo-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">מעקב התקדמות בחומר</h2>
                <p className="text-xs text-slate-400">
                  מבוסס על חומרים שנותחו, לא על סימון אישי ידני
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {hasAnalysis ? "פעיל" : "ממתין לניתוח"}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <DarkMetric
              label="שבועות שנותחו"
              value={`${analyzedWeeks}/13`}
              trend={`${analyzedPercent}%`}
            />
            <DarkMetric
              label="חומר מלא לשבוע"
              value={`${fullMaterialWeeks}/13`}
              trend={`${completeMaterialPercent}%`}
            />
            <DarkMetric
              label="חילוץ תקין"
              value={`${extractionSuccessPercent}%`}
              trend="PDF"
            />
            <DarkMetric
              label="נושאים חזקים"
              value={strongTopics.length}
              trend="כיסוי גבוה"
            />
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
                <div
                  key={`${bar}-${index}`}
                  className="flex h-full w-3 items-end rounded-sm bg-cyan-500/20"
                >
                  <div
                    className="w-full rounded-sm bg-linear-to-t from-cyan-500 to-emerald-300 transition-all duration-300"
                    style={{ height: `${bar}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              עדכון אחרון מתוך JSON מקומי
            </span>
            <Link
              href="/progress"
              className="flex items-center gap-1 rounded-lg bg-linear-to-r from-cyan-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:from-cyan-600 hover:to-indigo-600"
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

function DarkMetric({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: string;
}) {
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
    <article
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClass}`}
        >
          {icon}
        </span>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((topic) => (
            <div
              key={topic.topicId}
              className="rounded-lg p-3"
              style={{ background: "var(--bg-subtle)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {topic.title}
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {topic.score}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={
                    tone === "green"
                      ? "h-full rounded-full bg-emerald-500"
                      : "h-full rounded-full bg-amber-500"
                  }
                  style={{ width: `${topic.score}%` }}
                />
              </div>
              <p
                className="mt-2 text-xs leading-5"
                style={{ color: "var(--text-secondary)" }}
              >
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

/* ─── Data processing ──────────────────────────────────────────── */
function buildTopicProgress(
  analysisData: Awaited<ReturnType<typeof readAnalysisData>>,
): TopicProgress[] {
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
      const isExamImportant =
        topic.priorityLevel === "critical" || topic.priorityLevel === "high";
      const status: TopicProgress["status"] =
        score >= 70
          ? "strong"
          : isExamImportant && score < 55
            ? "needs_work"
            : "developing";
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

/* ─────────────────── Lecture Overview Table ─────────────────── */
function LectureOverviewTable({ lectureSummaries }: { lectureSummaries: LectureSummary[] }) {
  const sorted = [...lectureSummaries].sort((a, b) => a.lectureNumber - b.lectureNumber);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <SectionHeader title="מה למדנו בכל הרצאה" accent="#0b7285" />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          הגדרות ומשפטים לפי שבוע
        </p>
      </div>

      <div
        className="overflow-x-auto rounded-xl border bg-white shadow-sm"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead style={{ background: "var(--bg-subtle)" }}>
            <tr>
              <th
                className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)", width: "52px" }}
              >
                שבוע
              </th>
              <th
                className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                  minWidth: "160px",
                }}
              >
                נושא
              </th>
              <th
                className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                  minWidth: "200px",
                }}
              >
                הגדרות
              </th>
              <th
                className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                  minWidth: "200px",
                }}
              >
                משפטים
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lec, i) => (
              <tr
                key={lec.lectureNumber}
                style={{ background: i % 2 === 1 ? "var(--bg-subtle)" : "#fff" }}
              >
                <td
                  className="border-b px-4 py-3 align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Link
                    href={`/weeks/${lec.lectureNumber}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition hover:opacity-70"
                    style={{
                      background: "var(--navy-light)",
                      color: "var(--navy-mid)",
                      border: "1px solid var(--navy-border)",
                    }}
                  >
                    {lec.lectureNumber}
                  </Link>
                </td>
                <td
                  className="border-b px-4 py-3 align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="font-semibold leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {lec.title}
                  </p>
                  {lec.mainTopics.length > 0 && (
                    <p
                      className="mt-0.5 text-xs leading-snug"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {lec.mainTopics.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </td>
                <td
                  className="border-b px-4 py-3 align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <LectureChipList items={lec.keyDefinitions} color="green" />
                </td>
                <td
                  className="border-b px-4 py-3 align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <LectureChipList items={lec.keyTheorems} color="navy" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LectureChipList({ items, color }: { items: string[]; color: "green" | "navy" }) {
  if (items.length === 0) {
    return (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        —
      </span>
    );
  }
  const styles = {
    green: {
      bg: "var(--green-light)",
      text: "var(--green-mid)",
      border: "var(--green-border)",
    },
    navy: {
      bg: "var(--navy-light)",
      text: "var(--navy-mid)",
      border: "var(--navy-border)",
    },
  }[color];
  return (
    <div className="flex flex-wrap gap-1">
      {items.slice(0, 6).map((item, i) => (
        <span
          key={i}
          className="rounded px-1.5 py-0.5 text-[11px] font-medium leading-snug"
          style={{
            background: styles.bg,
            color: styles.text,
            border: `1px solid ${styles.border}`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
