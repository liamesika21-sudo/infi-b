"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, Database, Filter, FunctionSquare, RotateCcw, Search, Sigma, X } from "lucide-react";
import type { FormulaItem } from "@/lib/calculus2/analysis-types";
import { CORE_FORMULA_GROUP_LABELS, CORE_FORMULAS, type CoreFormula } from "@/lib/calculus2/core-formulas";
import { FormulaBlock, isUsableFormula } from "@/components/study/FormulaBlock";
import { DisplayMath } from "@/components/study/MathContent";

type ImportanceFilter = "all" | "critical" | "high" | "medium" | "low";
type ConfidenceFilter = "all" | "reliable" | "review";

export function FormulaCenterClient({ formulas }: { formulas: FormulaItem[] }) {
  const usableFormulas = useMemo(() => formulas.filter(isUsableFormula), [formulas]);
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("all");
  const [coreQuery, setCoreQuery] = useState("");

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
  const normalizedCoreQuery = coreQuery.trim().toLowerCase();
  const coreFormulas = useMemo(() => {
    if (!normalizedCoreQuery) return CORE_FORMULAS;
    return CORE_FORMULAS.filter((formula) => {
      const haystack = [
        formula.title,
        formula.use,
        formula.conditions,
        formula.warning ?? "",
        CORE_FORMULA_GROUP_LABELS[formula.group],
        `שבוע ${formula.week}`,
      ].join(" ").toLowerCase();
      return haystack.includes(normalizedCoreQuery);
    });
  }, [normalizedCoreQuery]);

  const groupedCoreFormulas = useMemo(() => {
    const groups = new Map<string, CoreFormula[]>();
    for (const formula of coreFormulas) {
      const label = CORE_FORMULA_GROUP_LABELS[formula.group];
      const current = groups.get(label) ?? [];
      current.push(formula);
      groups.set(label, current);
    }
    return [...groups.entries()];
  }, [coreFormulas]);

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
              נוסחאות הליבה של אינפי ב׳, מסודרות לפי נושא עם שימוש, תנאים ואזהרות. החילוץ האוטומטי מה-PDFים נשאר למטה כארכיון לבדיקה, לא כחומר לשינון.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <HeaderMetric label="נוסחאות ליבה" value={CORE_FORMULAS.length} />
            <HeaderMetric label="נושאים" value={Object.keys(CORE_FORMULA_GROUP_LABELS).length} />
            <HeaderMetric label="חילוץ אוטומטי" value={usableFormulas.length} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-[#0b7285]" />
            <div>
              <h2 className="font-extrabold text-slate-950">נוסחאות ליבה לשינון ותרגול</h2>
              <p className="text-sm text-slate-500">זו הרשימה הנקייה. כל כרטיס אומר מה הנוסחה, מתי להשתמש בה ומה חייבים לבדוק.</p>
            </div>
          </div>
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={coreQuery}
              onChange={(event) => setCoreQuery(event.target.value)}
              placeholder="חיפוש: לופיטל, טור הנדסי, טיילור..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-9 text-sm outline-none transition focus:border-[#0b7285] focus:bg-white"
            />
          </label>
        </div>
      </section>

      {groupedCoreFormulas.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <FunctionSquare className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500">לא נמצאו נוסחאות ליבה לפי החיפוש הנוכחי.</p>
          <button
            onClick={() => setCoreQuery("")}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס חיפוש
          </button>
        </section>
      ) : (
        <div className="space-y-6">
          {groupedCoreFormulas.map(([group, items]) => (
            <section key={group} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-950">{group}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{items.length}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <CoreFormulaCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <details className="rounded-2xl border border-amber-200 bg-amber-50/70 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-700" />
            <span>
              <span className="block font-extrabold text-slate-950">חילוץ אוטומטי מהמקורות</span>
              <span className="block text-sm text-slate-600">
                מוצגות {filtered.length} מתוך {usableFormulas.length}; {ocrFiltered} ביטויים סוננו כ-OCR לא שמיש.
              </span>
            </span>
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">פתיחה לבדיקה</span>
        </summary>

        <div className="border-t border-amber-200 bg-white p-4">
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-950">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <p>
              האזור הזה נוצר מ-OCR וניתוח AI של PDFים, ולכן חלק מהכרטיסים יכולים להיות ביטויים חלקיים או שמות כלליים. לשינון עדיף להשתמש בנוסחאות הליבה שמעל.
            </p>
          </div>

          <ExtractedFormulaExplorer
            filtered={filtered}
            usableCount={usableFormulas.length}
            criticalCount={criticalCount}
            highCount={highCount}
            mediumCount={mediumCount}
            reliableCount={reliableCount}
            needsReviewCount={needsReviewCount}
            topics={topics}
            importanceFilter={importanceFilter}
            topicFilter={topicFilter}
            confidenceFilter={confidenceFilter}
            setImportanceFilter={setImportanceFilter}
            setTopicFilter={setTopicFilter}
            setConfidenceFilter={setConfidenceFilter}
            clearFilters={clearFilters}
          />
        </div>
      </details>
    </div>
  );
}

function CoreFormulaCard({ item }: { item: CoreFormula }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="font-extrabold text-slate-950">{item.title}</h3>
          <p className="text-xs font-bold text-[#0b7285]">שבוע {item.week} · {CORE_FORMULA_GROUP_LABELS[item.group]}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="overflow-x-auto rounded-lg bg-[#082f49] p-3 text-white">
          <DisplayMath latex={item.latex} />
        </div>

        <FormulaInfo label="מתי משתמשים" value={item.use} />
        <FormulaInfo label="תנאים לבדיקה" value={item.conditions} />
        {item.warning && <FormulaInfo label="זהירות" value={item.warning} tone="warning" />}
      </div>
    </article>
  );
}

function FormulaInfo({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" }) {
  return (
    <div className={`border-r-4 pr-3 text-sm leading-7 ${tone === "warning" ? "border-amber-400 text-amber-950" : "border-[#0b7285] text-slate-700"}`}>
      <span className="font-extrabold text-slate-950">{label}: </span>
      {value}
    </div>
  );
}

function ExtractedFormulaExplorer({
  filtered,
  usableCount,
  criticalCount,
  highCount,
  mediumCount,
  reliableCount,
  needsReviewCount,
  topics,
  importanceFilter,
  topicFilter,
  confidenceFilter,
  setImportanceFilter,
  setTopicFilter,
  setConfidenceFilter,
  clearFilters,
}: {
  filtered: FormulaItem[];
  usableCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  reliableCount: number;
  needsReviewCount: number;
  topics: [string, number][];
  importanceFilter: ImportanceFilter;
  topicFilter: string;
  confidenceFilter: ConfidenceFilter;
  setImportanceFilter: (value: ImportanceFilter) => void;
  setTopicFilter: (value: string) => void;
  setConfidenceFilter: (value: ConfidenceFilter) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#0b7285]" />
            <span className="font-bold text-slate-950">סינון נוסחאות</span>
            <span className="text-sm text-slate-500">— מוצגות {filtered.length} מתוך {usableCount}</span>
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
            <FilterPill active={importanceFilter === "all"} onClick={() => setImportanceFilter("all")} label="הכל" count={usableCount} />
            <FilterPill active={importanceFilter === "critical"} onClick={() => setImportanceFilter("critical")} label="קריטי" count={criticalCount} tone="red" />
            <FilterPill active={importanceFilter === "high"} onClick={() => setImportanceFilter("high")} label="גבוה" count={highCount} tone="navy" />
            <FilterPill active={importanceFilter === "medium"} onClick={() => setImportanceFilter("medium")} label="בינוני" count={mediumCount} tone="teal" />
          </FilterGroup>

          <FilterGroup label="אמינות חילוץ">
            <FilterPill active={confidenceFilter === "all"} onClick={() => setConfidenceFilter("all")} label="כל הרמות" count={usableCount} />
            <FilterPill active={confidenceFilter === "reliable"} onClick={() => setConfidenceFilter("reliable")} label="אמין יותר" count={reliableCount} tone="navy" />
            <FilterPill active={confidenceFilter === "review"} onClick={() => setConfidenceFilter("review")} label="דורש בדיקה" count={needsReviewCount} tone="amber" />
          </FilterGroup>

          <FilterGroup label="נושא">
            <FilterPill active={topicFilter === "all"} onClick={() => setTopicFilter("all")} label="כל הנושאים" count={usableCount} />
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
