"use client";

import { useMemo, useState } from "react";
import { Filter, FunctionSquare, RotateCcw, Sigma, X } from "lucide-react";
import type { FormulaItem } from "@/lib/calculus2/analysis-types";
import { FormulaBlock, isUsableFormula } from "@/components/study/FormulaBlock";

type ImportanceFilter = "all" | "critical" | "high" | "medium" | "low";
type ConfidenceFilter = "all" | "reliable" | "review";

export function FormulaCenterClient({ formulas }: { formulas: FormulaItem[] }) {
  const usableFormulas = useMemo(() => formulas.filter(isUsableFormula), [formulas]);
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("all");

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const formula of usableFormulas) {
      for (const topic of formula.topicIds.length > 0 ? formula.topicIds : ["לא מסווג"]) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [usableFormulas]);

  const filtered = useMemo(() => {
    return usableFormulas.filter((formula) => {
      const importanceMatches = importanceFilter === "all" || formula.examImportance === importanceFilter;
      const topicMatches = topicFilter === "all" || formula.topicIds.includes(topicFilter);
      const confidenceMatches =
        confidenceFilter === "all" ||
        (confidenceFilter === "reliable" && formula.confidence >= 0.65) ||
        (confidenceFilter === "review" && formula.confidence < 0.65);
      return importanceMatches && topicMatches && confidenceMatches;
    });
  }, [confidenceFilter, importanceFilter, topicFilter, usableFormulas]);

  const criticalCount = usableFormulas.filter((formula) => formula.examImportance === "critical").length;
  const highCount = usableFormulas.filter((formula) => formula.examImportance === "high").length;
  const mediumCount = usableFormulas.filter((formula) => formula.examImportance === "medium").length;
  const reliableCount = usableFormulas.filter((formula) => formula.confidence >= 0.65).length;
  const needsReviewCount = usableFormulas.length - reliableCount;
  const ocrFiltered = formulas.length - usableFormulas.length;

  function clearFilters() {
    setImportanceFilter("all");
    setTopicFilter("all");
    setConfidenceFilter("all");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#082f49] via-[#0f3b67] to-[#0b7285] p-6 text-white shadow-lg">
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-cyan-200/10 blur-2xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Sigma className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Formula Center</p>
                <h1 className="text-2xl font-extrabold">מרכז נוסחאות</h1>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-white/78">
              נוסחאות שחולצו מהחומרים ומוצגות עם רינדור מתמטי, הסבר קצר, מקור ורמת ביטחון. ביטויי OCR לא קריאים אינם מוצגים כנוסחאות אמינות.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <HeaderMetric label="אמינות טובה" value={reliableCount} />
            <HeaderMetric label="לאימות" value={needsReviewCount} />
            <HeaderMetric label="סוננו" value={ocrFiltered} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#0b7285]" />
            <span className="font-bold text-slate-950">סינון נוסחאות</span>
            <span className="text-sm text-slate-500">— מוצגות {filtered.length} מתוך {usableFormulas.length}</span>
          </div>
          {(importanceFilter !== "all" || topicFilter !== "all" || confidenceFilter !== "all") && (
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
          <FilterGroup label="חשיבות למבחן">
            <FilterPill active={importanceFilter === "all"} onClick={() => setImportanceFilter("all")} label="הכל" count={usableFormulas.length} />
            <FilterPill active={importanceFilter === "critical"} onClick={() => setImportanceFilter("critical")} label="קריטי" count={criticalCount} tone="red" />
            <FilterPill active={importanceFilter === "high"} onClick={() => setImportanceFilter("high")} label="גבוה" count={highCount} tone="navy" />
            <FilterPill active={importanceFilter === "medium"} onClick={() => setImportanceFilter("medium")} label="בינוני" count={mediumCount} tone="teal" />
          </FilterGroup>

          <FilterGroup label="אמינות חילוץ">
            <FilterPill active={confidenceFilter === "all"} onClick={() => setConfidenceFilter("all")} label="כל הרמות" count={usableFormulas.length} />
            <FilterPill active={confidenceFilter === "reliable"} onClick={() => setConfidenceFilter("reliable")} label="אמין יותר" count={reliableCount} tone="navy" />
            <FilterPill active={confidenceFilter === "review"} onClick={() => setConfidenceFilter("review")} label="דורש בדיקה" count={needsReviewCount} tone="amber" />
          </FilterGroup>

          <FilterGroup label="נושא">
            <FilterPill active={topicFilter === "all"} onClick={() => setTopicFilter("all")} label="כל הנושאים" count={usableFormulas.length} />
            {topics.slice(0, 14).map(([topic, count]) => (
              <FilterPill
                key={topic}
                active={topicFilter === topic}
                onClick={() => setTopicFilter(topicFilter === topic ? "all" : topic)}
                label={topic}
                count={count}
                tone="blue"
              />
            ))}
          </FilterGroup>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <FunctionSquare className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500">לא נמצאו נוסחאות לפי הסינון הנוכחי.</p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס סינון
          </button>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <FormulaBlock key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-xl bg-white/14 px-3 py-2">
      <p className="font-mono text-2xl font-black">{value}</p>
      <p className="text-[11px] font-bold text-white/75">{label}</p>
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
  tone?: "slate" | "red" | "navy" | "amber" | "teal" | "blue";
}) {
  const activeClass = {
    slate: "bg-slate-950 text-white",
    red: "bg-gradient-to-l from-red-600 to-rose-700 text-white",
    navy: "bg-gradient-to-l from-[#082f49] to-[#1e3a5f] text-white",
    amber: "bg-gradient-to-l from-amber-500 to-orange-600 text-white",
    teal: "bg-gradient-to-l from-[#0b7285] to-cyan-600 text-white",
    blue: "bg-gradient-to-l from-blue-600 to-cyan-700 text-white",
  }[tone];

  return (
    <button
      type="button"
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
