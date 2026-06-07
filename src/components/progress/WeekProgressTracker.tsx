"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  loadProgress, saveProgress,
  theoremKey, hwQuestionKey,
  type TheoremStatus, type DifficultyRating, type ProgressData,
} from "@/lib/progress-store";

export interface ProgSection {
  idx: number;
  tag: string;
  title: string;
}

export interface ProgQuestion {
  questionId: string;
  questionNumber: number;
  homeworkNumber: number;
  preview: string;
}

interface Props {
  weekNum: number;
  sections: ProgSection[];
  questions: ProgQuestion[];
}

const TAG_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  "הגדרה": { bg: "var(--green-light)",  text: "var(--green)",     border: "var(--green-border)"  },
  "משפט":  { bg: "var(--navy-light)",   text: "var(--navy-mid)",  border: "var(--navy-border)"   },
  "כלל":   { bg: "var(--amber-light)",  text: "var(--amber-mid)", border: "var(--amber-border)"  },
  "מסקנה": { bg: "var(--teal-light)",   text: "var(--teal)",      border: "var(--teal-border)"   },
};

const DIFF: { value: DifficultyRating; label: string; color: string; bg: string; border: string }[] = [
  { value: "easy",   label: "קל",    color: "var(--green)",     bg: "var(--green-light)",  border: "var(--green-border)"  },
  { value: "medium", label: "בינוני", color: "var(--amber-mid)", bg: "var(--amber-light)", border: "var(--amber-border)" },
  { value: "hard",   label: "קשה",   color: "var(--red-mid)",   bg: "var(--red-light)",    border: "var(--red-border)"    },
];

export function WeekProgressTracker({ weekNum, sections, questions }: Props) {
  const [data, setData] = useState<ProgressData | null>(null);

  const refresh = useCallback(() => setData(loadProgress()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("progress-updated", refresh);
    return () => window.removeEventListener("progress-updated", refresh);
  }, [refresh]);

  if (!data) return null;
  if (sections.length === 0 && questions.length === 0) return null;

  function setTheoremStatus(idx: number, status: TheoremStatus) {
    const fresh = loadProgress();
    const key = theoremKey(weekNum, idx);
    if (fresh.theorems[key] === status) {
      delete fresh.theorems[key];
    } else {
      fresh.theorems[key] = status;
    }
    saveProgress(fresh);
    setData({ ...fresh });
    window.dispatchEvent(new Event("progress-updated"));
  }

  function toggleQuestionDone(qId: string, hwNum: number) {
    const fresh = loadProgress();
    const key = hwQuestionKey(hwNum, qId);
    const cur = fresh.questions[key];
    if (cur?.done) {
      delete fresh.questions[key];
    } else {
      fresh.questions[key] = { done: true };
    }
    saveProgress(fresh);
    setData({ ...fresh });
    window.dispatchEvent(new Event("progress-updated"));
  }

  function setDifficulty(qId: string, hwNum: number, d: DifficultyRating) {
    const fresh = loadProgress();
    const key = hwQuestionKey(hwNum, qId);
    const cur = fresh.questions[key] ?? { done: true };
    fresh.questions[key] = cur.difficulty === d
      ? { done: cur.done }
      : { done: true, difficulty: d };
    saveProgress(fresh);
    setData({ ...fresh });
    window.dispatchEvent(new Event("progress-updated"));
  }

  const knownCount = sections.filter(s => data.theorems[theoremKey(weekNum, s.idx)] === "known").length;
  const reviewCount = sections.filter(s => data.theorems[theoremKey(weekNum, s.idx)] === "review").length;
  const doneCount = questions.filter(q => data.questions[hwQuestionKey(q.homeworkNumber, q.questionId)]?.done).length;

  return (
    <section
      id="week-tracker"
      className="mb-8 scroll-mt-24 rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--bg-card)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            מעקב אישי
          </p>
          <h2 className="text-sm font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
            שבוע {weekNum} — הגדרות, משפטים ושאלות
          </h2>
        </div>
        {/* Summary chips */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {sections.length > 0 && (
            <>
              <Chip label={`${knownCount}/${sections.length} ידוע`} color="var(--green)" bg="var(--green-light)" border="var(--green-border)" />
              {reviewCount > 0 && (
                <Chip label={`${reviewCount} לחזור`} color="var(--amber-mid)" bg="var(--amber-light)" border="var(--amber-border)" />
              )}
            </>
          )}
          {questions.length > 0 && (
            <Chip label={`${doneCount}/${questions.length} שאלות`} color="var(--navy-mid)" bg="var(--navy-light)" border="var(--navy-border)" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className={`grid divide-y sm:divide-y-0 ${sections.length > 0 && questions.length > 0 ? "sm:grid-cols-2 sm:divide-x" : ""}`}
        style={{ "--tw-divide-opacity": 1, borderColor: "var(--border)" } as React.CSSProperties}
      >
        {/* Theorems / Definitions */}
        {sections.length > 0 && (
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              הגדרות ומשפטים
            </p>
            <div className="space-y-2">
              {sections.map((sec) => {
                const key = theoremKey(weekNum, sec.idx);
                const status = data.theorems[key];
                const tagStyle = TAG_COLOR[sec.tag] ?? TAG_COLOR["הגדרה"];
                return (
                  <div key={sec.idx} className="flex items-center gap-2 min-w-0">
                    {/* Tag */}
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black"
                      style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
                    >
                      {sec.tag}
                    </span>
                    {/* Title */}
                    <span className="flex-1 min-w-0 text-xs font-semibold truncate" style={{ color: "var(--text-secondary)" }}>
                      {sec.title}
                    </span>
                    {/* Status buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setTheoremStatus(sec.idx, "known")}
                        className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
                        style={{
                          background: status === "known" ? "var(--green-mid)" : "transparent",
                          color: status === "known" ? "#fff" : "var(--text-muted)",
                          border: `1px solid ${status === "known" ? "var(--green-mid)" : "var(--border)"}`,
                        }}
                      >
                        <Check className="h-2.5 w-2.5" />
                        יודעת
                      </button>
                      <button
                        onClick={() => setTheoremStatus(sec.idx, "review")}
                        className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
                        style={{
                          background: status === "review" ? "var(--amber-mid)" : "transparent",
                          color: status === "review" ? "#fff" : "var(--text-muted)",
                          border: `1px solid ${status === "review" ? "var(--amber-mid)" : "var(--border)"}`,
                        }}
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        לחזור
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Homework questions */}
        {questions.length > 0 && (
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              מטלה {questions[0]?.homeworkNumber} — שאלות
            </p>
            <div className="space-y-2.5">
              {questions.map((q) => {
                const key = hwQuestionKey(q.homeworkNumber, q.questionId);
                const qprog = data.questions[key];
                const isDone = qprog?.done ?? false;
                return (
                  <div key={q.questionId}>
                    <div className="flex items-start gap-2">
                      {/* Done toggle */}
                      <button
                        onClick={() => toggleQuestionDone(q.questionId, q.homeworkNumber)}
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white transition-all"
                        style={{
                          background: isDone ? "var(--green-mid)" : "var(--bg-subtle)",
                          border: `1.5px solid ${isDone ? "var(--green-mid)" : "var(--border)"}`,
                          color: isDone ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        {isDone ? "✓" : q.questionNumber}
                      </button>
                      {/* Preview */}
                      <p className="flex-1 min-w-0 text-xs leading-5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {q.preview}
                      </p>
                    </div>
                    {/* Difficulty — shown always, enabled after done */}
                    <div className="flex items-center gap-1 mt-1 pr-8">
                      {DIFF.map(({ value, label, color, bg, border }) => (
                        <button
                          key={value}
                          onClick={() => setDifficulty(q.questionId, q.homeworkNumber, value)}
                          disabled={!isDone}
                          className="rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
                          style={{
                            background: qprog?.difficulty === value ? bg : "transparent",
                            color: qprog?.difficulty === value ? color : isDone ? "var(--text-muted)" : "var(--border)",
                            border: `1px solid ${qprog?.difficulty === value ? border : "var(--border)"}`,
                            opacity: isDone ? 1 : 0.4,
                            cursor: isDone ? "pointer" : "default",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-black"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  );
}
