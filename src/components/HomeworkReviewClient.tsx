"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, Filter, RotateCcw, Target, X } from "lucide-react";
import type { HomeworkPriorityEntry, HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import { PriorityBadge, DifficultyBadge, ExamRelevanceBadge } from "@/components/study/Badges";

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

  const criticalCount = questions.filter((question) => question.importanceLevel === "critical").length;
  const highCount = questions.filter((question) => question.importanceLevel === "high").length;
  const mediumCount = questions.filter((question) => question.importanceLevel === "medium").length;

  function clearFilters() {
    setPriorityFilter("all");
    setHomeworkFilter("all");
    setTopicFilter("all");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#10284d] via-[#1e3a5f] to-[#0b7285] p-6 text-white shadow-lg">
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
            <p className="max-w-3xl text-sm leading-7 text-white/78">
              בלי טקסט השאלה עצמה: רק מטלה, מספר שאלה, נושא מייצג, רמת חשיבות והמסקנה שצריך לקחת לתרגול.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <HeaderMetric label="קריטי" value={criticalCount} tone="red" />
            <HeaderMetric label="גבוה" value={highCount} tone="amber" />
            <HeaderMetric label="בינוני" value={mediumCount} tone="blue" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#0b7285]" />
            <span className="font-bold text-slate-950">סינון שאלות מטלה</span>
            <span className="text-sm text-slate-500">— נמצאו {filtered.length} שאלות</span>
          </div>
          {(priorityFilter !== "all" || homeworkFilter !== "all" || topicFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
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
                count={homework.questions.filter((question) => question.importanceLevel !== "low").length}
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

      {filtered.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">לא נמצאו שאלות לפי הסינון הנוכחי.</p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white"
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
  const tone =
    question.importanceLevel === "critical"
      ? "border-red-200 bg-red-50"
      : question.importanceLevel === "high"
        ? "border-blue-200 bg-blue-50"
        : "border-amber-200 bg-amber-50";
  const mainTopic = question.topicIds[0] ?? "לא מסווג";

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${tone}`}>
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#10284d] to-[#0b7285] text-white shadow-sm">
          <span className="text-[10px] font-bold opacity-75">שאלה</span>
          <span className="text-lg font-black">{question.questionNumber}</span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm">
              מטלה {question.homeworkNumber} · שבוע {question.weekNumber}
            </span>
            <PriorityBadge level={question.importanceLevel} />
            <DifficultyBadge level={question.difficulty} />
            <ExamRelevanceBadge level={question.examSimilarity} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {question.topicIds.slice(0, 5).map((topic) => (
              <span key={topic} className="rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
            <InfoBox icon={<Target className="h-4 w-4" />} label="נושא מייצג" value={mainTopic} />
            <InfoBox icon={<AlertTriangle className="h-4 w-4" />} label="מסקנה לקחת מהשאלה" value={question.whyItMatters} />
          </div>

          <div className="mt-3 rounded-xl bg-white/70 p-3">
            <p className="text-xs font-bold text-slate-500">פעולה מומלצת</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{question.recommendedAction}</p>
          </div>
        </div>
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
      <p className="mb-2 text-xs font-bold text-slate-500">{label}</p>
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
  const activeClass = {
    slate: "bg-slate-950 text-white",
    red: "bg-gradient-to-l from-red-600 to-rose-700 text-white",
    navy: "bg-gradient-to-l from-[#10284d] to-[#1e3a5f] text-white",
    amber: "bg-gradient-to-l from-amber-500 to-orange-600 text-white",
    teal: "bg-gradient-to-l from-[#0b7285] to-cyan-600 text-white",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active ? `${activeClass} shadow` : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
      <span className={`mr-1.5 rounded px-1.5 py-0.5 text-[10px] ${active ? "bg-white/22" : "bg-white text-slate-600"}`}>
        {count}
      </span>
    </button>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}
