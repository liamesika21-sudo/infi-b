"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, Filter, RotateCcw, Target, X } from "lucide-react";
import type { HomeworkPriorityEntry, HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import { PriorityBadge, DifficultyBadge, ExamRelevanceBadge } from "@/components/study/Badges";
import { HomeworkHintSystem } from "@/components/study/HomeworkHintSystem";

type PriorityFilter = "all" | "critical" | "high" | "medium";

export function HomeworkReviewClient({ priorityMap }: { priorityMap: HomeworkPriorityEntry[] }) {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [homeworkFilter, setHomeworkFilter] = useState<number | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  const questions = useMemo(
    () =>
      priorityMap
        .flatMap((homework) => homework.questions.map((question) => ({ ...question, filename: homework.filename })))
        .filter((question) => question.importanceLevel !== "low"),
    [priorityMap],
  );

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const question of questions) {
      for (const topic of question.topicIds.length > 0 ? question.topicIds : ["לא מסווג"]) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      const priorityMatches = priorityFilter === "all" || question.importanceLevel === priorityFilter;
      const homeworkMatches = homeworkFilter === "all" || question.homeworkNumber === homeworkFilter;
      const topicMatches = topicFilter === "all" || question.topicIds.includes(topicFilter);
      return priorityMatches && homeworkMatches && topicMatches;
    });
  }, [homeworkFilter, priorityFilter, questions, topicFilter]);

  const criticalCount = questions.filter((q) => q.importanceLevel === "critical").length;
  const highCount = questions.filter((q) => q.importanceLevel === "high").length;
  const mediumCount = questions.filter((q) => q.importanceLevel === "medium").length;

  function clearFilters() {
    setPriorityFilter("all");
    setHomeworkFilter("all");
    setTopicFilter("all");
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#10284d] via-[#1e3a5f] to-[#0b7285] p-6 text-white shadow-lg">
        <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <BookOpenCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Homework Review</p>
                <h1 className="text-2xl font-extrabold">חזרת מטלות לפי חשיבות</h1>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-white/80">
              כל שאלה כוללת נושא, רמת חשיבות ורמזים מדורגים — לחצי על &quot;צריכה כיוון?&quot; לגלות שלב-שלב.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <HeaderMetric label="קריטי" value={criticalCount} tone="red" />
            <HeaderMetric label="גבוה" value={highCount} tone="amber" />
            <HeaderMetric label="בינוני" value={mediumCount} tone="blue" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" style={{ color: "var(--teal)" }} />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>סינון שאלות מטלה</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>— נמצאו {filtered.length} שאלות</span>
          </div>
          {(priorityFilter !== "all" || homeworkFilter !== "all" || topicFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition"
              style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
            >
              <X className="h-3.5 w-3.5" />
              נקה סינון
            </button>
          )}
        </div>

        <div className="space-y-4 p-4">
          <FilterGroup label="חשיבות">
            <FilterPill active={priorityFilter === "all"} onClick={() => setPriorityFilter("all")} label="הכל" count={questions.length} />
            <FilterPill active={priorityFilter === "critical"} onClick={() => setPriorityFilter("critical")} label="קריטי" count={criticalCount} tone="red" />
            <FilterPill active={priorityFilter === "high"} onClick={() => setPriorityFilter("high")} label="גבוה" count={highCount} tone="navy" />
            <FilterPill active={priorityFilter === "medium"} onClick={() => setPriorityFilter("medium")} label="בינוני" count={mediumCount} tone="amber" />
          </FilterGroup>

          <FilterGroup label="מטלה">
            <FilterPill active={homeworkFilter === "all"} onClick={() => setHomeworkFilter("all")} label="כל המטלות" count={questions.length} />
            {priorityMap.map((homework) => (
              <FilterPill
                key={homework.homeworkNumber}
                active={homeworkFilter === homework.homeworkNumber}
                onClick={() => setHomeworkFilter(homeworkFilter === homework.homeworkNumber ? "all" : homework.homeworkNumber)}
                label={`מטלה ${homework.homeworkNumber}`}
                count={homework.questions.filter((q) => q.importanceLevel !== "low").length}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="נושא">
            <FilterPill active={topicFilter === "all"} onClick={() => setTopicFilter("all")} label="כל הנושאים" count={questions.length} />
            {topics.slice(0, 12).map(([topic, count]) => (
              <FilterPill
                key={topic}
                active={topicFilter === topic}
                onClick={() => setTopicFilter(topicFilter === topic ? "all" : topic)}
                label={topic}
                count={count}
                tone="teal"
              />
            ))}
          </FilterGroup>
        </div>
      </section>

      {/* Study guidance callout */}
      <div
        className="rounded-xl border-r-4 px-5 py-3.5"
        style={{ borderColor: "var(--teal)", background: "var(--teal-light)", borderWidth: "1.5px", borderRightWidth: "4px" }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--teal)" }}>
          איך להשתמש
        </p>
        <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          כל שאלה מציגה את הנושא וההמלצה. לחצי על <strong>צריכה כיוון?</strong> לרמז נוסף — שלב-שלב, בלי לחשוף יותר ממה שצריך.
          זיהוי הנושא הוא חלק מהלמידה עצמה.
        </p>
      </div>

      {filtered.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed bg-white p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>לא נמצאו שאלות לפי הסינון הנוכחי.</p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white"
            style={{ background: "var(--navy)" }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס סינון
          </button>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filtered.map((question) => (
            <HomeworkQuestionCard key={question.questionId} question={question} />
          ))}
        </section>
      )}
    </div>
  );
}

function HomeworkQuestionCard({
  question,
}: {
  question: HomeworkQuestionPriority & { filename: string };
}) {
  const isHot = question.importanceLevel === "critical";
  const isHigh = question.importanceLevel === "high";

  const borderStyle = isHot
    ? { borderColor: "var(--red-border)", background: "var(--bg-card)" }
    : isHigh
      ? { borderColor: "var(--navy-border)", background: "var(--bg-card)" }
      : { borderColor: "var(--border)", background: "var(--bg-card)" };

  const accentColor = isHot ? "var(--red-mid)" : isHigh ? "var(--navy-mid)" : "var(--text-muted)";

  return (
    <article
      className="overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md"
      style={borderStyle}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5"
        style={{
          background: isHot
            ? "linear-gradient(90deg, var(--red-mid), var(--red))"
            : isHigh
              ? "linear-gradient(90deg, var(--navy-mid), var(--navy))"
              : "var(--border)",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <span
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background: isHot
                ? "linear-gradient(135deg, var(--red-mid), var(--red))"
                : isHigh
                  ? "linear-gradient(135deg, var(--navy-mid), var(--navy))"
                  : "linear-gradient(135deg, var(--text-muted), var(--border-strong))",
            }}
          >
            <span className="text-[10px] font-bold opacity-75">שאלה</span>
            <span className="text-lg font-black">{question.questionNumber}</span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-bold shadow-sm"
                style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
              >
                מטלה {question.homeworkNumber} · שבוע {question.weekNumber}
              </span>
              <PriorityBadge level={question.importanceLevel} />
              <DifficultyBadge level={question.difficulty} />
              <ExamRelevanceBadge level={question.examSimilarity} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {question.topicIds.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info boxes */}
        <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr] mb-0">
          <InfoBox
            icon={<Target className="h-4 w-4" />}
            label="נושא מייצג"
            value={question.topicIds[0] ?? "לא מסווג"}
            accentColor={accentColor}
          />
          <InfoBox
            icon={<AlertTriangle className="h-4 w-4" />}
            label="מסקנה לקחת מהשאלה"
            value={question.whyItMatters}
            accentColor={accentColor}
          />
        </div>

        {/* Progressive hint system */}
        <HomeworkHintSystem question={question} />
      </div>
    </article>
  );
}

function HeaderMetric({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "blue" }) {
  const classes = {
    red: "bg-red-500/20 text-red-50",
    amber: "bg-amber-400/20 text-amber-50",
    blue: "bg-cyan-400/20 text-cyan-50",
  }[tone];
  return (
    <div className={`min-w-20 rounded-xl px-3 py-2 ${classes}`}>
      <p className="font-mono text-2xl font-black">{value}</p>
      <p className="text-[11px] font-bold opacity-80">{label}</p>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone = "slate",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "slate" | "red" | "navy" | "amber" | "teal";
}) {
  const activeStyle: React.CSSProperties = {
    slate: { background: "var(--text-primary)", color: "#fff" },
    red:   { background: "linear-gradient(135deg, var(--red-mid), var(--red))", color: "#fff" },
    navy:  { background: "linear-gradient(135deg, var(--navy-mid), var(--navy))", color: "#fff" },
    amber: { background: "linear-gradient(135deg, var(--amber-mid), var(--amber))", color: "#fff" },
    teal:  { background: "linear-gradient(135deg, var(--teal), #0e9bad)", color: "#fff" },
  }[tone];

  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-bold transition"
      style={
        active
          ? activeStyle
          : { background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
      }
    >
      {label}
      <span
        className="mr-1.5 rounded px-1.5 py-0.5 text-[10px]"
        style={{ background: active ? "rgba(255,255,255,0.22)" : "var(--bg-card)", color: active ? "#fff" : "var(--text-muted)" }}
      >
        {count}
      </span>
    </button>
  );
}

function InfoBox({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
    >
      <div
        className="mb-1 flex items-center gap-1.5 text-xs font-bold"
        style={{ color: accentColor }}
      >
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold leading-6" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
