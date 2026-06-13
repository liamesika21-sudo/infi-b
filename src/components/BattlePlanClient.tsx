"use client";

import { useState, useEffect, useRef } from "react";
import { CheckSquare, Square, ChevronDown, ChevronRight, Swords, BookOpen, FlaskConical, FileQuestion, Lightbulb, AlertTriangle } from "lucide-react";
import { MathContent } from "@/components/study/MathContent";

// ── Types ──────────────────────────────────────────────────────────────────

interface PracticeQuestion {
  id: string;
  content: string;
  contentHe: string | null;
}

interface KnowledgeItem {
  name: string;
  content: string;
}

interface WeekData {
  week: number;
  title: string;
  definitions: KnowledgeItem[];
  theorems: KnowledgeItem[];
  formulas: string[];
  examNotes: string[];
  practiceQuestions: PracticeQuestion[];
}

interface Block {
  id: string;
  weeks: string;
  title: string;
  color: "teal" | "gold" | "purple";
  weekData: WeekData[];
  pastExamQuestions: PracticeQuestion[];
}

// ── Color map ──────────────────────────────────────────────────────────────

const COLOR = {
  teal:   { bg: "var(--teal-light)",   border: "var(--teal-border)",   text: "var(--teal)",   badge: "badge-teal"   },
  gold:   { bg: "var(--gold-light)",   border: "var(--gold-border)",   text: "var(--gold)",   badge: "badge-amber"  },
  purple: { bg: "var(--purple-light)", border: "var(--purple-border)", text: "var(--purple)", badge: "badge-purple" },
};

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "infi-battle-plan-v1";

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveChecked(set: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch {}
}

// ── Collapsible knowledge item (definition / theorem) ─────────────────────

function CollapsibleKnowledgeItem({
  id, item, checked, onToggle,
}: { id: string; item: { name: string; content: string }; checked: boolean; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const hasContent = item.content.trim().length > 0;

  return (
    <div style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-0 pr-1">
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => hasContent && setOpen(v => !v)}
          className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-right transition hover:bg-(--bg-inset)"
          style={{ color: checked ? "var(--text-muted)" : "var(--text-primary)", cursor: hasContent ? "pointer" : "default" }}
          aria-expanded={open}
        >
          {hasContent && (
            <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>
              {open
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          )}
          <span className={`flex-1 text-sm font-semibold leading-snug ${checked ? "line-through opacity-50" : ""}`}>
            {item.name}
          </span>
        </button>

        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-(--bg-inset)"
          aria-label={checked ? "סמן כלא נעשה" : "סמן כנעשה"}
        >
          <span style={{ color: checked ? "var(--teal)" : "var(--border-strong)" }}>
            {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </span>
        </button>
      </div>

      {open && hasContent && (
        <div
          className="border-t px-4 py-3 text-sm leading-relaxed"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            direction: "rtl",
          }}
        >
          <MathContent text={item.content} className="" />
        </div>
      )}
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-inset)" }}>
        <div
          className="absolute inset-y-0 right-0 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="shrink-0 text-[10px] font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>
        {done}/{total}
      </span>
    </div>
  );
}

// ── Section collapsible wrapper ────────────────────────────────────────────

function Section({
  id, title, icon, children, defaultOpen = true, accent
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl px-1 py-2 text-right transition hover:opacity-80"
      >
        <span className="shrink-0" style={{ color: accent || "var(--text-secondary)" }}>{icon}</span>
        <h3 className="flex-1 text-base font-black" style={{ color: "var(--text-primary)" }}>{title}</h3>
        {open
          ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ── Practice question ──────────────────────────────────────────────────────

function PracticeQ({ q, index, checked, onToggle }: { q: PracticeQuestion; index: number; checked: boolean; onToggle: (id: string) => void }) {
  const [showHe, setShowHe] = useState(false);
  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: checked ? "var(--teal-border)" : "var(--border)",
        background: checked ? "var(--teal-light)" : "var(--bg-subtle)",
        opacity: checked ? 0.7 : 1,
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
            style={{ background: "var(--bg-inset)", color: "var(--text-muted)" }}
          >
            {index + 1}
          </span>
          {q.contentHe && (
            <button
              type="button"
              onClick={() => setShowHe(v => !v)}
              className="rounded-full border px-2 py-0.5 text-[10px] font-bold transition hover:opacity-80"
              style={{
                borderColor: showHe ? "var(--teal-border)" : "var(--border)",
                color: showHe ? "var(--teal)" : "var(--text-muted)",
                background: showHe ? "var(--teal-light)" : undefined,
              }}
            >
              {showHe ? "מקור" : "עברית"}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggle(q.id)}
          className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition hover:opacity-80"
          style={{
            borderColor: checked ? "var(--teal-border)" : "var(--border)",
            color: checked ? "var(--teal)" : "var(--text-secondary)",
            background: checked ? "var(--teal-light)" : undefined,
          }}
        >
          {checked ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
          {checked ? "פתרתי" : "סמן כפתור"}
        </button>
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed">
        <MathContent
          text={showHe && q.contentHe ? q.contentHe : q.content}
          className="practice-question-text"
          dir={showHe && q.contentHe ? "rtl" : "ltr"}
        />
      </div>
    </div>
  );
}

// ── Week section ───────────────────────────────────────────────────────────

function WeekSection({ wd, blockColor, checked, onToggle }: { wd: WeekData; blockColor: Block["color"]; checked: Set<string>; onToggle: (id: string) => void }) {
  const col = COLOR[blockColor];
  const allItems = [
    ...wd.definitions.map(d => `def-w${wd.week}-${d.name}`),
    ...wd.theorems.map(t => `thm-w${wd.week}-${t.name}`),
  ];
  const doneItems = allItems.filter(id => checked.has(id)).length;

  return (
    <div id={`week-${wd.week}`} className="scroll-mt-24 space-y-5 py-6 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      {/* Week header */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-black"
          style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
        >
          שבוע {wd.week}
        </span>
        <h3 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{wd.title}</h3>
        <div className="flex-1 min-w-30">
          <ProgressBar done={doneItems} total={allItems.length} color={col.text} />
        </div>
      </div>

      {/* Definitions */}
      {wd.definitions.length > 0 && (
        <Section id={`defs-w${wd.week}`} title="הגדרות" icon={<BookOpen className="h-4 w-4" />} accent={col.text}>
          <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {wd.definitions.map(def => (
              <CollapsibleKnowledgeItem
                key={def.name}
                id={`def-w${wd.week}-${def.name}`}
                item={def}
                checked={checked.has(`def-w${wd.week}-${def.name}`)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Theorems */}
      {wd.theorems.length > 0 && (
        <Section id={`thms-w${wd.week}`} title="משפטים והוכחות" icon={<Lightbulb className="h-4 w-4" />} accent={col.text}>
          <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {wd.theorems.map(thm => (
              <CollapsibleKnowledgeItem
                key={thm.name}
                id={`thm-w${wd.week}-${thm.name}`}
                item={thm}
                checked={checked.has(`thm-w${wd.week}-${thm.name}`)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Formulas */}
      {wd.formulas.length > 0 && (
        <Section id={`formulas-w${wd.week}`} title="נוסחאות מרכזיות" icon={<span className="font-black text-sm" style={{ color: col.text }}>∑</span>} defaultOpen={false}>
          <div className="rounded-xl border px-4 py-3 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
            {wd.formulas.map((f, i) => (
              <div key={i} className="text-sm" style={{ direction: "rtl" }}>
                <MathContent text={f} className="" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Exam tips */}
      {wd.examNotes.length > 0 && (
        <Section id={`notes-w${wd.week}`} title="נקודות לבחינה" icon={<AlertTriangle className="h-4 w-4" />} accent="var(--gold)" defaultOpen={false}>
          <ul className="space-y-1.5 px-1">
            {wd.examNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "var(--gold)" }}>•</span>
                {note}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Practice questions */}
      {wd.practiceQuestions.length > 0 && (
        <Section id={`practice-w${wd.week}`} title={`תרגול — שיעורי בית שבוע ${wd.week}`} icon={<FlaskConical className="h-4 w-4" />} accent={col.text} defaultOpen={false}>
          <div className="space-y-3">
            {wd.practiceQuestions.map((q, i) => (
              <PracticeQ key={q.id} q={q} index={i} checked={checked.has(q.id)} onToggle={onToggle} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Block section ──────────────────────────────────────────────────────────

function BlockSection({ block, checked, onToggle }: { block: Block; checked: Set<string>; onToggle: (id: string) => void }) {
  const col = COLOR[block.color];
  const allCheckable = [
    ...block.weekData.flatMap(wd => [
      ...wd.definitions.map(d => `def-w${wd.week}-${d.name}`),
      ...wd.theorems.map(t => `thm-w${wd.week}-${t.name}`),
    ]),
    ...block.pastExamQuestions.map(q => q.id),
    ...block.weekData.flatMap(wd => wd.practiceQuestions.map(q => q.id)),
  ];
  const done = allCheckable.filter(id => checked.has(id)).length;
  const pct = allCheckable.length ? Math.round((done / allCheckable.length) * 100) : 0;

  return (
    <section id={block.id} className="scroll-mt-20 rounded-2xl border overflow-hidden mb-10" style={{ borderColor: col.border }}>
      {/* Block header */}
      <div className="px-6 py-5" style={{ background: col.bg, borderBottom: `1px solid ${col.border}` }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: col.border, color: col.text }}
            >
              <Swords className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{block.title}</h2>
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  שבועות {block.weeks}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {done}/{allCheckable.length} פריטים הושלמו — {pct}%
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <ProgressBar done={done} total={allCheckable.length} color={col.text} />
          </div>
        </div>
      </div>

      {/* Week content */}
      <div className="px-6" style={{ background: "var(--bg-page)" }}>
        {block.weekData.map(wd => (
          <WeekSection key={wd.week} wd={wd} blockColor={block.color} checked={checked} onToggle={onToggle} />
        ))}
      </div>

      {/* Past exam questions */}
      <div
        className="px-6 py-6 border-t"
        style={{ borderColor: col.border, background: "var(--bg-subtle)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <FileQuestion className="h-5 w-5 shrink-0" style={{ color: col.text }} />
          <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>
            שאלות ממבחני עבר — {block.title}
          </h3>
        </div>
        <div className="space-y-4">
          {block.pastExamQuestions.map((q, i) => (
            <PracticeQ key={q.id} q={q} index={i} checked={checked.has(q.id)} onToggle={onToggle} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ blocks, checked }: { blocks: Block[]; checked: Set<string> }) {
  const totalAll = blocks.flatMap(b => [
    ...b.weekData.flatMap(wd => [
      ...wd.definitions.map(d => `def-w${wd.week}-${d.name}`),
      ...wd.theorems.map(t => `thm-w${wd.week}-${t.name}`),
    ]),
    ...b.pastExamQuestions.map(q => q.id),
    ...b.weekData.flatMap(wd => wd.practiceQuestions.map(q => q.id)),
  ]);
  const totalDone = totalAll.filter(id => checked.has(id)).length;
  const totalPct = totalAll.length ? Math.round((totalDone / totalAll.length) * 100) : 0;

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: "var(--border)" }}>
        {/* Global progress */}
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
              סה״כ התקדמות
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color: "var(--teal)" }}>
              {totalPct}%
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-inset)" }}>
            <div
              className="absolute inset-y-0 right-0 rounded-full transition-all duration-500"
              style={{ width: `${totalPct}%`, background: "var(--teal)" }}
            />
          </div>
        </div>

        <div className="space-y-1 max-h-[calc(100dvh-12rem)] overflow-y-auto">
          {blocks.map(b => {
            const col = COLOR[b.color];
            const blockItems = [
              ...b.weekData.flatMap(wd => [
                ...wd.definitions.map(d => `def-w${wd.week}-${d.name}`),
                ...wd.theorems.map(t => `thm-w${wd.week}-${t.name}`),
              ]),
              ...b.pastExamQuestions.map(q => q.id),
              ...b.weekData.flatMap(wd => wd.practiceQuestions.map(q => q.id)),
            ];
            const bDone = blockItems.filter(id => checked.has(id)).length;
            const bPct = blockItems.length ? Math.round((bDone / blockItems.length) * 100) : 0;

            return (
              <div key={b.id} className="rounded-lg border p-2 space-y-1.5" style={{ borderColor: col.border, background: col.bg }}>
                <a
                  href={`#${b.id}`}
                  className="flex items-center justify-between gap-2 font-black text-xs"
                  style={{ color: col.text }}
                >
                  <span>שבועות {b.weeks}</span>
                  <span className="tabular-nums">{bPct}%</span>
                </a>
                <ProgressBar done={bDone} total={blockItems.length} color={col.text} />
                <div className="space-y-0.5 pt-0.5">
                  {b.weekData.map(wd => (
                    <a
                      key={wd.week}
                      href={`#week-${wd.week}`}
                      className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] transition hover:bg-white/60"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="font-bold" style={{ color: col.text }}>ש{wd.week}</span>
                      <span className="truncate">{wd.title.split("—")[0].trim()}</span>
                    </a>
                  ))}
                  <a
                    href={`#${b.id}`}
                    className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] transition hover:bg-white/60"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <FileQuestion className="h-3 w-3 shrink-0" style={{ color: col.text }} />
                    <span>מבחני עבר</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────

export function BattlePlanClient({ blocks }: { blocks: Block[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // Try server first, fall back to localStorage
    fetch("/api/battle-plan-progress")
      .then(r => r.ok ? r.json() as Promise<{ ok: boolean; checked?: string[] }> : Promise.reject())
      .then(data => {
        if (data.ok && Array.isArray(data.checked) && data.checked.length > 0) {
          const serverSet = new Set(data.checked as string[]);
          setChecked(serverSet);
          saveChecked(serverSet); // keep localStorage in sync
        } else {
          setChecked(loadChecked()); // fallback
        }
      })
      .catch(() => {
        setChecked(loadChecked()); // offline / not logged in
      });
  }, []);

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveChecked(next);
      // Save to server (fire-and-forget)
      fetch("/api/battle-plan-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: [...next] }),
      }).catch(() => {});
      return next;
    });
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Swords className="h-6 w-6" style={{ color: "var(--navy-mid)" }} />
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>תכנית קרב</h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          חזרה שיטתית לפי בלוקים — הגדרות, משפטים, תרגול ומבחני עבר. סמן כל פריט שחזרת עליו.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Sidebar blocks={blocks} checked={checked} />
        <main className="min-w-0">
          {blocks.map(b => (
            <BlockSection key={b.id} block={b} checked={checked} onToggle={toggle} />
          ))}
        </main>
      </div>
    </div>
  );
}
