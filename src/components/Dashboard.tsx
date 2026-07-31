import Link from "next/link";
import type React from "react";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Brain,
  Calendar,
  FileQuestion,
  Gauge,
  Layers3,
  Lightbulb,
  ScrollText,
  Sigma,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { calculus2Course } from "@/lib/calculus2/config";
import type { GeneratedDataSnapshot } from "@/lib/calculus2";
import type { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import type { LectureSummary } from "@/lib/calculus2/analysis-types";
import { StudyCallout } from "@/components/study/StudyCallout";
import { TrigValuesTables } from "@/components/TrigValuesTables";
import { DashboardProgress } from "@/components/progress/DashboardProgress";
import { HomeworkMasteryAxis } from "@/components/progress/HomeworkMasteryAxis";

const EXAM_DATE = new Date("2026-07-01T09:00:00");

function getDaysUntilExam(): number {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ═══ The learning flow — the spine of the app, in order ═══ */
interface FlowStage {
  n: number;
  icon: React.FC<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  extra?: { label: string; href: string }[];
}

const FLOW: FlowStage[] = [
  {
    n: 1,
    icon: Calendar,
    color: "#3b82f6",
    title: "ללמוד שבוע-שבוע",
    desc: "11 השבועות לפי הסדר — לכל שבוע: הרצאה, תרגול, מטלה, המשפטים וההגדרות שצריך לדעת.",
    href: "/weeks",
    cta: "פתחי את השבועות",
    extra: [{ label: "הערות מקס מהתרגול", href: "/instructor-notes" }],
  },
  {
    n: 2,
    icon: Target,
    color: "#f59e0b",
    title: "לתרגל",
    desc: "שאלות לפי נושא + פתרונות מלאים לכל המטלות. כאן בונים ביטחון וזיהוי דפוסים.",
    href: "/practice",
    cta: "למאגר התרגול",
    extra: [{ label: "פתרונות מטלות", href: "/homework-solutions" }],
  },
  {
    n: 3,
    icon: FileQuestion,
    color: "#ef4444",
    title: "לחרוש מבחנים",
    desc: "מבחני עבר וסימולציות בתנאי מבחן — הכי דומה למבחן האמיתי. הימים האחרונים = רק זה.",
    href: "/past-exams",
    cta: "למבחני עבר",
    extra: [{ label: "סימולציות", href: "/simulations" }],
  },
  {
    n: 4,
    icon: Zap,
    color: "#8b5cf6",
    title: "חזרה אחרונה",
    desc: "רענון מהיר לפני המבחן — נוסחאות, משפטים, וטעויות נפוצות שאסור לחזור עליהן.",
    href: "/quick-review",
    cta: "לחזרה מהירה",
    extra: [{ label: "מפת אינטואיציה", href: "/intuition-map" }],
  },
  {
    n: 5,
    icon: Brain,
    color: "#0b7285",
    title: "תקועה? שאלי את המנטור",
    desc: "עזרה אישית בכל שעה, מבוססת בדיוק על חומר הקורס שלך.",
    href: "/mentor",
    cta: "פתחי צ׳אט מנטור",
  },
];

/* Reference banks + personal tools — used throughout, not part of the linear path */
const REFERENCES = [
  { href: "/theorems", label: "משפטים", desc: "בנק המשפטים", icon: ScrollText },
  { href: "/definitions", label: "הגדרות", desc: "בנק ההגדרות", icon: BookMarked },
  { href: "/formulas", label: "נוסחאות", desc: "בנק הנוסחאות", icon: Sigma },
  { href: "/proof-patterns", label: "תבניות הוכחה", desc: "דפוסים חוזרים", icon: BookOpen },
  { href: "/topics", label: "נושאים", desc: "לפי נושא", icon: Layers3 },
  { href: "/intuition-map", label: "אינטואיציה", desc: "מפת מושגים", icon: Lightbulb },
];

const TOOLS = [
  { href: "/progress", label: "מעקב שליטה", desc: "איפה אני עומדת", icon: Gauge },
  { href: "/notebook", label: "המחברת שלי", desc: "הערות אישיות", icon: BookOpen },
  { href: "/instructor-notes", label: "הערות מקס", desc: "תובנות מהתרגול", icon: Sparkles },
  { href: "/homework-review", label: "חזרת מטלות", desc: "לפי עדיפות", icon: BookOpenCheck },
];

export function Dashboard({
  generatedData,
  analysisData,
}: {
  generatedData: GeneratedDataSnapshot;
  analysisData: Awaited<ReturnType<typeof readAnalysisData>>;
}) {
  const daysLeft = getDaysUntilExam();

  const criticalTopics =
    analysisData.examPriorityMap?.topics.filter((t) => t.priorityLevel === "critical") ?? [];
  const readySimulations = analysisData.simulationExams.filter(
    (s) => !s.needsReview && s.questions.length >= 4,
  );
  const criticalHw = analysisData.homeworkPriorityMap
    .flatMap((hw) => hw.questions.filter((q) => q.importanceLevel === "critical"))
    .slice(0, 3);

  const urgency = daysLeft <= 7 ? "red" : daysLeft <= 21 ? "amber" : "navy";
  const heroHeadline =
    daysLeft <= 7 ? "שבוע אחרון — מיקוד מלא" : daysLeft <= 14 ? "ספרינט סופי" : daysLeft <= 30 ? "בשלב הכוננות" : "בונים לקראת 90+";

  const countdownAccent = urgency === "red" ? "#f87171" : urgency === "amber" ? "#fbbf24" : "#ffffff";

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
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6" style={{ padding: "clamp(1.5rem,4vw,2rem)" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              {calculus2Course.nameHe} · מועד א׳ · {calculus2Course.targetScoreLabel}
            </p>
            <h1 className="mb-2 font-black text-white" style={{ fontSize: "clamp(1.6rem,4vw,2.5rem)", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
              {heroHeadline}
            </h1>
            <p className="mb-5 text-sm" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "440px", lineHeight: 1.6 }}>
              כל מה שצריך למבחן, לפי סדר. עקבי אחרי המסלול למטה — שלב אחרי שלב.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/weeks"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
              >
                התחילי ללמוד <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
              >
                לתרגול מהיר
              </Link>
            </div>
          </div>

          {/* countdown */}
          <div
            className="shrink-0 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "1.5rem 2rem",
            }}
          >
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              זמן עד המבחן
            </p>
            <p dir="ltr" className="font-black tabular-nums" style={{ color: countdownAccent, fontSize: "clamp(3rem,10vw,5rem)", lineHeight: 1, letterSpacing: "-0.06em" }}>
              {daysLeft}
            </p>
            <p className="mt-1 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>ימים</p>
          </div>
        </div>
      </section>

      {!generatedData.hasGeneratedData && (
        <StudyCallout variant="warning">
          עדיין לא בוצע עיבוד חומרים. הריצי{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">npm run process:calculus2</code>{" "}ואז{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">npm run analyze:calculus2</code>.
        </StudyCallout>
      )}

      {/* ══ THE LEARNING FLOW — the centerpiece ══ */}
      <section>
        <SectionHeader title="מסלול הלמידה למבחן" accent="#3b82f6" />
        <p className="-mt-2 mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          לא בטוחה מאיפה להתחיל? זה הסדר. כל שלב מוביל אותך לשלב הבא.
        </p>
        <div className="space-y-3">
          {FLOW.map((stage, i) => (
            <FlowStageCard key={stage.n} stage={stage} isLast={i === FLOW.length - 1} />
          ))}
        </div>
      </section>

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

      {/* ══ PERSONAL PROGRESS ══ */}
      <DashboardProgress />
      <HomeworkMasteryAxis />

      {/* ══ REFERENCE BANKS ══ */}
      <section>
        <SectionHeader title="מקורות ומאגרים" accent="#6366f1" />
        <p className="-mt-2 mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          נתקעת באמצע? כל ההגדרות, המשפטים והנוסחאות במקום אחד.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REFERENCES.map((item) => (
            <NavCard key={item.href} {...item} accent="#3b82f6" />
          ))}
        </div>
      </section>

      {/* ══ PERSONAL TOOLS ══ */}
      <section>
        <SectionHeader title="הכלים שלי" accent="#8b5cf6" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((item) => (
            <NavCard key={item.href} {...item} accent="#8b5cf6" />
          ))}
        </div>
      </section>

      {/* ══ REFERENCE: what each lecture covered ══ */}
      {analysisData.lectureSummaries.length > 0 && (
        <LectureOverviewTable lectureSummaries={analysisData.lectureSummaries} />
      )}

      {/* ══ REFERENCE: trig values + function domains ══ */}
      <TrigValuesTables />
    </div>
  );
}

/* ─── Section header with colored bar ─────────────────────────── */
function SectionHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span style={{ width: "3px", height: "22px", borderRadius: "999px", background: accent, flexShrink: 0 }} />
      <h2 className="font-black" style={{ fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
    </div>
  );
}

/* ─── A single stage in the learning flow ─────────────────────── */
function FlowStageCard({ stage, isLast }: { stage: FlowStage; isLast: boolean }) {
  const { n, icon: Icon, color, title, desc, href, cta, extra } = stage;
  return (
    <div className="relative">
      <Link
        href={href}
        className="group flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        style={{ borderColor: "var(--border)", borderRight: `4px solid ${color}`, textDecoration: "none" }}
      >
        {/* number + icon */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-black text-white"
            style={{ background: color }}
          >
            {n}
          </span>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>{title}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold transition group-hover:gap-1.5" style={{ color }}>
              {cta} <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{desc}</p>
          {extra && extra.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {extra.map((e) => (
                <span
                  key={e.href}
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
                >
                  {e.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      {/* connector line to next stage */}
      {!isLast && (
        <div aria-hidden className="mr-9 h-3 w-px" style={{ background: "var(--border)" }} />
      )}
    </div>
  );
}

/* ─── Priority action card (today's focus) ─────────────────────── */
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
    critical: { borderColor: "#ef4444", badge: { bg: "#fee2e2", text: "#dc2626", label: "קריטי" } },
    high: { borderColor: "#f59e0b", badge: { bg: "#fef3c7", text: "#d97706", label: "גבוה" } },
    medium: { borderColor: "#3b82f6", badge: { bg: "#dbeafe", text: "#2563eb", label: "תרגול" } },
  }[level];

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
      style={{ borderColor: "var(--border)", borderRight: `3px solid ${cfg.borderColor}`, textDecoration: "none" }}
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
      <p className="text-sm font-bold" style={{ color: "var(--text-primary)", lineHeight: 1.4 }}>{title}</p>
      <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.55 }}>{desc}</p>
    </Link>
  );
}

/* ─── Navigation card for reference/tool grids ─────────────────── */
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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="block text-sm font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
        <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>{desc}</span>
      </span>
    </Link>
  );
}

/* ─────────────────── Lecture Overview Table ─────────────────── */
function LectureOverviewTable({ lectureSummaries }: { lectureSummaries: LectureSummary[] }) {
  const sorted = [...lectureSummaries].sort((a, b) => a.lectureNumber - b.lectureNumber);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <SectionHeader title="מה למדנו בכל הרצאה" accent="#0b7285" />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>הגדרות ומשפטים לפי שבוע</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--border)" }}>
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead style={{ background: "var(--bg-subtle)" }}>
            <tr>
              <th className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--text-muted)", width: "52px" }}>שבוע</th>
              <th className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--text-muted)", minWidth: "160px" }}>נושא</th>
              <th className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--text-muted)", minWidth: "200px" }}>הגדרות</th>
              <th className="border-b px-4 py-3 text-right text-xs font-black uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--text-muted)", minWidth: "200px" }}>משפטים</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lec, i) => (
              <tr key={lec.lectureNumber} style={{ background: i % 2 === 1 ? "var(--bg-subtle)" : "#fff" }}>
                <td className="border-b px-4 py-3 align-top" style={{ borderColor: "var(--border)" }}>
                  <Link
                    href={`/weeks/${lec.lectureNumber + 1}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition hover:opacity-70"
                    style={{ background: "var(--navy-light)", color: "var(--navy-mid)", border: "1px solid var(--navy-border)" }}
                  >
                    {lec.lectureNumber + 1}
                  </Link>
                </td>
                <td className="border-b px-4 py-3 align-top" style={{ borderColor: "var(--border)" }}>
                  <p className="font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{lec.title}</p>
                  {lec.mainTopics.length > 0 && (
                    <p className="mt-0.5 text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{lec.mainTopics.slice(0, 3).join(" · ")}</p>
                  )}
                </td>
                <td className="border-b px-4 py-3 align-top" style={{ borderColor: "var(--border)" }}>
                  <LectureChipList items={lec.keyDefinitions} color="green" />
                </td>
                <td className="border-b px-4 py-3 align-top" style={{ borderColor: "var(--border)" }}>
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
    return <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>;
  }
  const styles = {
    green: { bg: "var(--green-light)", text: "var(--green-mid)", border: "var(--green-border)" },
    navy: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
  }[color];
  return (
    <div className="flex flex-wrap gap-1">
      {items.slice(0, 6).map((item, i) => (
        <span
          key={i}
          className="rounded px-1.5 py-0.5 text-[11px] font-medium leading-snug"
          style={{ background: styles.bg, color: styles.text, border: `1px solid ${styles.border}` }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
