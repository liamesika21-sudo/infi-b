"use client";

import { useState, useMemo } from "react";
import { BookOpen, FlaskConical, FileQuestion, Filter, ChevronDown, ChevronUp } from "lucide-react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";

// ── Helpers ────────────────────────────────────────────────────────────────

function sourceLabel(t: string) {
  if (t === "recitation") return "תרגול";
  if (t === "homework") return "מטלה";
  if (t === "past_exam") return "מבחן עבר";
  return t;
}

function sourceIcon(t: string) {
  if (t === "recitation") return <FlaskConical className="h-3.5 w-3.5" />;
  if (t === "homework") return <BookOpen className="h-3.5 w-3.5" />;
  return <FileQuestion className="h-3.5 w-3.5" />;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  recitation: { bg: "var(--cyan-light)", text: "var(--cyan)", border: "var(--cyan-border)" },
  homework:   { bg: "var(--gold-light)", text: "var(--gold)", border: "var(--gold-border)" },
  past_exam:  { bg: "var(--purple-light)", text: "var(--purple)", border: "var(--purple-border)" },
};

const DIFF_COLORS: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "var(--green-light)", text: "var(--green)" },
  medium: { bg: "var(--amber-light)", text: "var(--amber-mid)" },
  hard:   { bg: "var(--red-light)", text: "var(--red-mid)" },
  mixed:  { bg: "var(--purple-light)", text: "var(--purple)" },
};

const REL_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: "var(--red-light)", text: "var(--red-mid)" },
  high:     { bg: "var(--amber-light)", text: "var(--amber-mid)" },
  medium:   { bg: "var(--navy-light)", text: "var(--navy-mid)" },
  low:      { bg: "var(--bg-subtle)", text: "var(--text-muted)" },
};

function diffLabel(d: string) {
  const m: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "קשה", mixed: "מעורב" };
  return m[d] ?? d;
}
function relLabel(r: string) {
  const m: Record<string, string> = { critical: "קריטי", high: "גבוה", medium: "בינוני", low: "נמוך" };
  return m[r] ?? r;
}

// Extract week number from sourceFileId or topicIds
function guessWeek(q: QuestionItem): number | null {
  const m = q.sourceFileId.match(/recitation-?(\d+)|lecture-?(\d+)|exercise-?(\d+)/i);
  if (m) return parseInt(m[1] ?? m[2] ?? m[3]);
  return null;
}

// Detect language direction from content
function isRtl(text: string): boolean {
  const heCount = (text.match(/[֐-׿]/g) || []).length;
  const enCount = (text.match(/[a-zA-Z]/g) || []).length;
  return heCount >= enCount;
}

// ── Question Card ──────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: QuestionItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const sc = SOURCE_COLORS[q.sourceType] ?? SOURCE_COLORS.recitation;
  const dc = DIFF_COLORS[q.difficulty] ?? {};
  const rc = REL_COLORS[q.examRelevance] ?? {};
  const week = guessWeek(q);
  const rtl = isRtl(q.content);

  // Split content into paragraphs — helps with long OCR blocks
  const preview = q.content.slice(0, 280).trim();
  const hasMore = q.content.length > 280;
  const displayContent = expanded ? q.content : preview;

  return (
    <article
      className="rounded-2xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--border)", background: "#fff" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border)", background: sc.bg }}
      >
        {/* Number */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
          style={{ background: sc.text }}
        >
          {index + 1}
        </span>

        {/* Source badge */}
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
        >
          {sourceIcon(q.sourceType)}
          {sourceLabel(q.sourceType)}
          {week && ` · שבוע ${week}`}
        </span>

        {/* Difficulty */}
        {q.difficulty && q.difficulty !== "unknown" && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: dc.bg, color: dc.text }}
          >
            {diffLabel(q.difficulty)}
          </span>
        )}

        {/* Exam relevance */}
        {q.examRelevance && (q.examRelevance === "critical" || q.examRelevance === "high") && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: rc.bg, color: rc.text }}
          >
            {relLabel(q.examRelevance)} למבחן
          </span>
        )}

        {/* Question number from source */}
        {q.questionNumber && (
          <span className="mr-auto text-[10px] font-medium" style={{ color: sc.text, opacity: 0.7 }}>
            שאלה {q.questionNumber}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-5 py-4">
        <ContentBlock text={displayContent} rtl={rtl} />

        {hasMore && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "הצג פחות" : "הצג הכל"}
          </button>
        )}
      </div>

      {/* ── Topic chips ── */}
      {q.topicIds.length > 0 && (
        <div className="flex flex-wrap gap-1 px-5 pb-4">
          {q.topicIds.slice(0, 5).map(t => (
            <span
              key={t}
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ── ContentBlock — renders OCR math text readably ─────────────────────────

function ContentBlock({ text, rtl }: { text: string; rtl: boolean }) {
  // Split into paragraphs by blank lines or sentence-final periods + newlines
  const paras = text.split(/\n\s*\n|\n(?=[.•])/g)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  return (
    <div className="space-y-2.5">
      {paras.map((para, i) => {
        // Numbered list items (.1 .2 etc, common in RTL PDFs)
        const isListItem = /^\.\d|^•|^\d+\.|^\([a-z]\)/.test(para.trim());

        return (
          <p
            key={i}
            className="text-sm"
            style={{
              direction: rtl ? "rtl" : "ltr",
              textAlign: rtl ? "right" : "left",
              lineHeight: "1.9",
              color: "var(--text-primary)",
              fontFamily: isListItem
                ? "inherit"
                : "'SFMono-Regular', 'Fira Code', Menlo, monospace",
              paddingRight: isListItem && rtl ? "1rem" : undefined,
              paddingLeft: isListItem && !rtl ? "1rem" : undefined,
              borderRight: isListItem && rtl ? "2px solid var(--navy-border)" : undefined,
              borderLeft: isListItem && !rtl ? "2px solid var(--navy-border)" : undefined,
            }}
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}

// ── Main Client Component ──────────────────────────────────────────────────

const SOURCES = ["all", "recitation", "homework", "past_exam"] as const;
type SourceFilter = typeof SOURCES[number];
const DIFFS = ["all", "easy", "medium", "hard"] as const;
type DiffFilter = typeof DIFFS[number];
const RELEVANCE = ["all", "critical", "high", "medium"] as const;
type RelFilter = typeof RELEVANCE[number];

export function PracticePageClient({ questions }: { questions: QuestionItem[] }) {
  const [source, setSource] = useState<SourceFilter>("all");
  const [diff, setDiff] = useState<DiffFilter>("all");
  const [rel, setRel] = useState<RelFilter>("all");
  const [weekFilter, setWeekFilter] = useState<number | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const counts = useMemo(() => ({
    recitation: questions.filter(q => q.sourceType === "recitation").length,
    homework:   questions.filter(q => q.sourceType === "homework").length,
    past_exam:  questions.filter(q => q.sourceType === "past_exam").length,
  }), [questions]);

  const weeks = useMemo(() => {
    const ws = new Set<number>();
    questions.forEach(q => { const w = guessWeek(q); if (w) ws.add(w); });
    return Array.from(ws).sort((a, b) => a - b);
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (source !== "all" && q.sourceType !== source) return false;
      if (diff !== "all" && q.difficulty !== diff) return false;
      if (rel !== "all" && q.examRelevance !== rel) return false;
      if (weekFilter !== "all" && guessWeek(q) !== weekFilter) return false;
      return true;
    });
  }, [questions, source, diff, rel, weekFilter]);

  return (
    <div className="space-y-6">

      {/* ── Source tabs ── */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "all",        label: `הכל (${questions.length})`,          color: "var(--text-secondary)" },
          { key: "recitation", label: `תרגולים (${counts.recitation})`,     color: "var(--cyan)" },
          { key: "homework",   label: `מטלות (${counts.homework})`,          color: "var(--gold)" },
          { key: "past_exam",  label: `מבחני עבר (${counts.past_exam})`,    color: "var(--purple)" },
        ] as { key: SourceFilter; label: string; color: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSource(tab.key)}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: source === tab.key ? tab.color : "var(--bg-subtle)",
              color: source === tab.key ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${source === tab.key ? tab.color : "var(--border)"}`,
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="mr-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
          style={{
            background: showFilters ? "var(--navy-light)" : "var(--bg-subtle)",
            color: showFilters ? "var(--navy-mid)" : "var(--text-secondary)",
            border: `1px solid ${showFilters ? "var(--navy-border)" : "var(--border)"}`,
          }}
        >
          <Filter className="h-3.5 w-3.5" />
          סינון
        </button>
      </div>

      {/* ── Expandable filters ── */}
      {showFilters && (
        <div
          className="rounded-xl border p-4 space-y-4"
          style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
        >
          {/* Week */}
          {weeks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>שבוע</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip label="הכל" active={weekFilter === "all"} onClick={() => setWeekFilter("all")} />
                {weeks.map(w => (
                  <FilterChip key={w} label={`שבוע ${w}`} active={weekFilter === w} onClick={() => setWeekFilter(w)} />
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>קושי</p>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "easy", "medium", "hard"] as DiffFilter[]).map(d => (
                <FilterChip
                  key={d}
                  label={d === "all" ? "הכל" : diffLabel(d)}
                  active={diff === d}
                  onClick={() => setDiff(d)}
                />
              ))}
            </div>
          </div>

          {/* Relevance */}
          <div>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>חשיבות למבחן</p>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "critical", "high", "medium"] as RelFilter[]).map(r => (
                <FilterChip
                  key={r}
                  label={r === "all" ? "הכל" : relLabel(r)}
                  active={rel === r}
                  onClick={() => setRel(r)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          {filtered.length} שאלות
        </p>
        {(source !== "all" || diff !== "all" || rel !== "all" || weekFilter !== "all") && (
          <button
            onClick={() => { setSource("all"); setDiff("all"); setRel("all"); setWeekFilter("all"); }}
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--red-mid)" }}
          >
            נקה סינון
          </button>
        )}
      </div>

      {/* ── Questions grid ── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>אין שאלות תואמות לסינון.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.slice(0, 60).map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} />
          ))}
        </div>
      )}

      {filtered.length > 60 && (
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          מוצגות 60 מתוך {filtered.length} שאלות · צמצם/י עם הסינון לתוצאות ממוקדות יותר
        </p>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
      style={{
        background: active ? "var(--navy)" : "var(--bg-card, #fff)",
        color: active ? "#fff" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--navy)" : "var(--border)"}`,
      }}
    >
      {label}
    </button>
  );
}
