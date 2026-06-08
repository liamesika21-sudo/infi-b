"use client";

import { useEffect, useState } from "react";
import { Check, Circle, Flame, Target } from "lucide-react";
import type { HomeworkQuestionPriority } from "@/lib/calculus2/analysis-types";
import { HomeworkHintSystem } from "@/components/study/HomeworkHintSystem";
import {
  loadProgress, saveProgress, hwQuestionKey,
  type DifficultyRating, type QuestionProgress,
} from "@/lib/progress-store";

export function WeekHomeworkSection({
  questions,
}: {
  questions: HomeworkQuestionPriority[];
}) {
  const visibleQuestions = questions.slice(0, 8);
  const homeworkNumber = visibleQuestions[0]?.homeworkNumber;
  const hotCount = visibleQuestions.filter((q) => q.importanceLevel === "critical" || q.importanceLevel === "high").length;

  if (visibleQuestions.length === 0) {
    return (
      <div className="rounded-2xl border p-5 text-sm font-bold" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}>
        לא נמצאו שאלות מטלה לשבוע הזה.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--bg-card)", boxShadow: "0 18px 45px rgba(15, 34, 64, 0.08)" }}
    >
      <div className="border-b px-4 py-4 sm:px-5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--navy-light), var(--bg-card))" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              טבלת מטלה
            </p>
            <h3 className="mt-1 text-base font-black" style={{ color: "var(--text-primary)" }}>
              מטלה {homeworkNumber} — שאלות לתרגול ומעקב
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <SummaryBadge label={`${visibleQuestions.length} שאלות`} />
            <SummaryBadge label={`${hotCount} בעדיפות גבוהה`} tone="hot" />
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-[70px_minmax(0,1fr)_180px] gap-4 border-b px-5 py-2 text-[10px] font-black uppercase tracking-widest md:grid" style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-subtle)" }}>
        <span>סימון</span>
        <span>נוסח והקשר</span>
        <span>רמת קושי</span>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {visibleQuestions.map((q) => (
          <HomeworkQuestionRow key={q.questionId} q={q} />
        ))}
      </div>
    </div>
  );
}

const DIFFICULTY_LABELS: { value: DifficultyRating; label: string; color: string; bg: string; border: string }[] = [
  { value: "easy",   label: "קל",    color: "var(--green)",     bg: "var(--green-light)",  border: "var(--green-border)"  },
  { value: "medium", label: "בינוני", color: "var(--amber-mid)", bg: "var(--amber-light)", border: "var(--amber-border)" },
  { value: "hard",   label: "קשה",   color: "var(--red-mid)",   bg: "var(--red-light)",    border: "var(--red-border)"    },
];

function HomeworkQuestionRow({ q }: { q: HomeworkQuestionPriority }) {
  const key = hwQuestionKey(q.homeworkNumber, q.questionId);
  const [progress, setProgress] = useState<QuestionProgress | undefined>(() => loadProgress().questions[key]);
  const isDone = progress?.done ?? false;
  const isHot = q.importanceLevel === "critical" || q.importanceLevel === "high";

  useEffect(() => {
    const refresh = () => setProgress(loadProgress().questions[key]);
    window.addEventListener("progress-updated", refresh);
    return () => window.removeEventListener("progress-updated", refresh);
  }, [key]);

  function toggleDone() {
    const data = loadProgress();
    const current = data.questions[key];
    if (current?.done) {
      delete data.questions[key];
      saveProgress(data);
      setProgress(undefined);
    } else {
      data.questions[key] = { done: true };
      saveProgress(data);
      setProgress({ done: true });
    }
    window.dispatchEvent(new Event("progress-updated"));
  }

  function setDifficulty(d: DifficultyRating) {
    const data = loadProgress();
    const current = data.questions[key] ?? { done: true };
    data.questions[key] = current.difficulty === d
      ? { done: current.done }
      : { done: true, difficulty: d };
    saveProgress(data);
    setProgress(data.questions[key]);
    window.dispatchEvent(new Event("progress-updated"));
  }

  return (
    <article
      className="grid gap-3 px-4 py-4 transition md:grid-cols-[70px_minmax(0,1fr)_180px] md:gap-4 md:px-5"
      style={{
        background: isDone
          ? "linear-gradient(135deg, rgba(236,253,245,0.95), var(--bg-card))"
          : isHot
            ? "linear-gradient(135deg, rgba(255,251,235,0.95), var(--bg-card))"
            : "var(--bg-card)",
      }}
    >
      <div className="flex items-center gap-3 md:block">
        <button
          type="button"
          onClick={toggleDone}
          title={isDone ? "סמן כלא בוצע" : "סמן כבוצע"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md"
          style={{
            background: isDone ? "var(--green-mid)" : isHot ? "var(--amber-mid)" : "var(--navy-mid)",
            color: "#fff",
            boxShadow: isDone ? "0 10px 22px rgba(34,197,94,0.22)" : "0 10px 22px rgba(15,34,64,0.14)",
          }}
        >
          {isDone ? <Check className="h-5 w-5" /> : q.questionNumber}
        </button>
        <div className="md:mt-2">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            שאלה {q.questionNumber}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: isHot ? "var(--amber-light)" : "var(--navy-light)", color: isHot ? "var(--amber-mid)" : "var(--navy-mid)", border: `1px solid ${isHot ? "var(--amber-border)" : "var(--navy-border)"}` }}>
            {isHot ? <Flame className="h-3 w-3" /> : <Target className="h-3 w-3" />}
            {getImportanceLabel(q.importanceLevel)}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {q.topicIds.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {topic}
            </span>
          ))}
          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--purple-light)", color: "var(--purple-mid)", border: "1px solid var(--purple-border)" }}>
            קושי משוער: {getDifficultyText(q.difficulty)}
          </span>
        </div>

        {q.requiredKnowledge.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {q.requiredKnowledge.slice(0, 3).map((item) => (
              <span key={item} className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: "var(--teal-light)", color: "var(--teal)", border: "1px solid var(--teal-border)" }}>
                {translateHomeworkText(item)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          <HomeworkHintSystem question={q} />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-1.5 md:block md:space-y-1.5">
        <button
          type="button"
          onClick={toggleDone}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5"
          style={{
            background: isDone ? "var(--green-light)" : "var(--bg-subtle)",
            color: isDone ? "var(--green)" : "var(--text-secondary)",
            border: `1px solid ${isDone ? "var(--green-border)" : "var(--border)"}`,
          }}
        >
          {isDone ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
          {isDone ? "בוצע" : "סמני בוצע"}
        </button>

        <div className="flex flex-wrap gap-1.5 md:mt-2">
          {DIFFICULTY_LABELS.map(({ value, label, color, bg, border }) => {
            const active = progress?.difficulty === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setDifficulty(value)}
                className="rounded-full px-2.5 py-1 text-[11px] font-black transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: active ? bg : "transparent",
                  color: active ? color : "var(--text-muted)",
                  border: `1px solid ${active ? border : "var(--border)"}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SummaryBadge({ label, tone = "default" }: { label: string; tone?: "default" | "hot" }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-black"
      style={{
        background: tone === "hot" ? "var(--amber-light)" : "var(--bg-card)",
        color: tone === "hot" ? "var(--amber-mid)" : "var(--navy-mid)",
        border: `1px solid ${tone === "hot" ? "var(--amber-border)" : "var(--navy-border)"}`,
      }}
    >
      {label}
    </span>
  );
}

function translateHomeworkText(text: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bCompute each of the following limits or prove that it doesn[’']?t exist\b/gi, "חשבו כל אחד מהגבולות הבאים או הוכיחו שהוא אינו קיים"],
    [/\bCompute each of the following\b/gi, "חשבו כל אחד מהביטויים הבאים"],
    [/\bCompute the following\b/gi, "חשבו את הביטוי הבא"],
    [/\bthe following limits\b/gi, "הגבולות הבאים"],
    [/\bor prove that it doesn[’']?t exist\b/gi, "או הוכיחו שהוא אינו קיים"],
    [/\bor prove that it does not exist\b/gi, "או הוכיחו שהוא אינו קיים"],
    [/\bCompute\b/gi, "חשבו"],
    [/\bCalculate\b/gi, "חשבו"],
    [/\bFind\b/gi, "מצאו"],
    [/\bDefine each of the following terms\b/gi, "הגדירו כל אחד מהמונחים הבאים"],
    [/\bGive a full and complete mathematical definition\b/gi, "תנו הגדרה מתמטית מלאה ומדויקת"],
    [/\bProve each of the following statements\b/gi, "הוכיחו כל אחת מהטענות הבאות"],
    [/\bthe following statements\b/gi, "הטענות הבאות"],
    [/\bProve that\b/gi, "הוכיחו כי"],
    [/\bShow that\b/gi, "הראו כי"],
    [/\bSuppose that\b/gi, "נניח כי"],
    [/\bAssume that\b/gi, "נניח כי"],
    [/\btwice-differentiable\b/gi, "גזירה פעמיים"],
    [/\bLet\b/gi, "יהי"],
    [/\bbe a function\b/gi, "תהי פונקציה"],
    [/\bis defined on\b/gi, "מוגדרת על"],
    [/\bdefined by\b/gi, "המוגדרת על ידי"],
    [/\bdifferentiable\b/gi, "גזירה"],
    [/\bat every\b/gi, "בכל"],
    [/\bin addition\b/gi, "בנוסף"],
    [/\bwe have\b/gi, "מתקיים"],
    [/\bindefinite integrals\b/gi, "אינטגרלים לא מסוימים"],
    [/\bdefinite integrals\b/gi, "אינטגרלים מסוימים"],
    [/\bimproper integral\b/gi, "אינטגרל לא אמיתי"],
    [/\bintegral\b/gi, "אינטגרל"],
    [/\blimit\b/gi, "גבול"],
    [/\bsequence\b/gi, "סדרה"],
    [/\bseries\b/gi, "טור"],
    [/\bconverges\b/gi, "מתכנס"],
    [/\bdiverges\b/gi, "מתבדר"],
    [/\bradius of convergence\b/gi, "רדיוס התכנסות"],
    [/\bpower series\b/gi, "טור חזקות"],
    [/\bfor every\b/gi, "לכל"],
    [/\bfor all\b/gi, "לכל"],
    [/\bsuch that\b/gi, "כך ש"],
    [/\bwhere\b/gi, "כאשר"],
    [/\bif and only if\b/gi, "אם ורק אם"],
    [/\bodd function\b/gi, "פונקציה אי-זוגית"],
    [/\beven function\b/gi, "פונקציה זוגית"],
    [/\bfunction\b/gi, "פונקציה"],
    [/\breal numbers\b/gi, "מספרים ממשיים"],
    [/\bneighborhood\b/gi, "סביבה"],
    [/\busing only the definitions\b/gi, "בעזרת ההגדרות בלבד"],
    [/\bin the extended sense\b/gi, "במובן המורחב"],
    [/\bStudent A has\b/gi, "סטודנט א׳"],
    [/\bExplain\b/gi, "הסבירו"],
    [/\bConsider\b/gi, "נתבונן ב"],
    [/\brecursive formula\b/gi, "נוסחת נסיגה"],
    [/\bpartitions\b/gi, "חלוקות"],
    [/\bbounded\b/gi, "חסומה"],
  ];

  return replacements
    .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;])/g, "$1")
    .trim();
}

function getImportanceLabel(level: HomeworkQuestionPriority["importanceLevel"]) {
  switch (level) {
    case "critical":
      return "קריטי";
    case "high":
      return "חשוב";
    case "medium":
      return "בינוני";
    default:
      return "נמוך";
  }
}

function getDifficultyText(value: string) {
  switch (value) {
    case "easy":
      return "קל";
    case "medium":
      return "בינוני";
    case "hard":
      return "קשה";
    case "mixed":
      return "מעורב";
    default:
      return "לא ידוע";
  }
}
