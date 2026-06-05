"use client";

import { useState } from "react";
import { ChevronDown, FlaskConical, BookOpen, FileQuestion } from "lucide-react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";

// ── Group metadata ─────────────────────────────────────────────────────────

interface SourceGroup {
  id: string;
  label: string;         // "תרגול 1"
  sublabel: string;      // "לופיטל, דרבו"
  type: "recitation" | "homework" | "past_exam";
  sortKey: number;
  questions: QuestionItem[];
}

const RECITATION_TOPICS: Record<number, string> = {
  1:  "לופיטל ודרבו",
  2:  "סדרות",
  3:  "אינטגרל לא-מסוים",
  4:  "אינטגרל מסוים",
  5:  "אינטגרל לא-אמיתי",
  6:  "טורים בסיסיים",
  7:  "מבחני התכנסות",
  8:  "התכנסות מוחלטת",
  9:  "טורי חזקות",
  10: "מקלורן",
};

const HOMEWORK_TOPICS: Record<number, string> = {
  1: "גבולות",
  2: "סדרות ונגזרות",
  3: "אינטגרל לא-מסוים",
  4: "אינטגרל מסוים",
  5: "אינטגרל לא-אמיתי",
  6: "טורים",
  7: "טורי חזקות",
};

function parseSourceGroup(fileId: string): { type: SourceGroup["type"]; label: string; sublabel: string; sortKey: number } | null {
  // recitation-recitation-N-*
  const recMatch = fileId.match(/recitation-recitation-(\d+)-/i)
    ?? fileId.match(/recitation-script-.*?(\d+)/i);
  if (recMatch) {
    const n = parseInt(recMatch[1]);
    // recitation-9 is numbered as script-recitation-9
    const scriptMatch = fileId.includes("script");
    const num = scriptMatch ? (fileId.includes("10") || fileId.includes("תרגול-10") ? 10 : 9) : n;
    return {
      type: "recitation",
      label: `תרגול ${num}`,
      sublabel: RECITATION_TOPICS[num] ?? "",
      sortKey: num,
    };
  }

  // hw-exercise-N-*
  const hwMatch = fileId.match(/hw-exercise-(\d+)-/i);
  if (hwMatch) {
    const n = parseInt(hwMatch[1]);
    return {
      type: "homework",
      label: `מטלה ${n}`,
      sublabel: HOMEWORK_TOPICS[n] ?? "",
      sortKey: 100 + n,
    };
  }

  // past-exams-*
  if (fileId.startsWith("past-exams-")) {
    const yearMatch = fileId.match(/(\d{4})/);
    const year = yearMatch?.[1] ?? "";
    const isA = /moeda|moed-a|term-a/i.test(fileId);
    const isB = /moedb|moed-b|term-b/i.test(fileId);
    const isSim = /simulation/i.test(fileId);
    const isFormula = /formula/i.test(fileId);
    const isTheoremList = /theorem.*list|list.*theorem/i.test(fileId);
    const isExcluded = /excluded|not.*material/i.test(fileId);

    if (isExcluded) return { type: "past_exam", label: "שאלות שאינן בחומר", sublabel: "", sortKey: 210 };
    if (isFormula) return { type: "past_exam", label: "גיליון נוסחאות", sublabel: year, sortKey: 205 };
    if (isTheoremList) return { type: "past_exam", label: "רשימת משפטים", sublabel: year, sortKey: 206 };
    if (isSim) return { type: "past_exam", label: `סימולציה ${year}`, sublabel: "", sortKey: 200 };
    if (isA) return { type: "past_exam", label: `מועד א׳ ${year}`, sublabel: "", sortKey: 150 + (2026 - parseInt(year)) };
    if (isB) return { type: "past_exam", label: `מועד ב׳ ${year}`, sublabel: "", sortKey: 175 + (2026 - parseInt(year)) };
    return { type: "past_exam", label: fileId.replace("past-exams-", "").replace(/-/g, " "), sublabel: "", sortKey: 199 };
  }

  return null;
}

function buildGroups(questions: QuestionItem[]): SourceGroup[] {
  const map = new Map<string, SourceGroup>();

  for (const q of questions) {
    const meta = parseSourceGroup(q.sourceFileId);
    if (!meta) continue;
    const key = q.sourceFileId;
    if (!map.has(key)) {
      map.set(key, { id: key, ...meta, questions: [] });
    }
    map.get(key)!.questions.push(q);
  }

  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

// ── Sidebar nav ────────────────────────────────────────────────────────────

const TYPE_ICON = {
  recitation: <FlaskConical className="h-3.5 w-3.5 shrink-0" />,
  homework:   <BookOpen className="h-3.5 w-3.5 shrink-0" />,
  past_exam:  <FileQuestion className="h-3.5 w-3.5 shrink-0" />,
};

const TYPE_SECTION: { type: SourceGroup["type"]; title: string }[] = [
  { type: "recitation", title: "תרגולים" },
  { type: "homework",   title: "מטלות" },
  { type: "past_exam",  title: "מבחני עבר" },
];

function Sidebar({ groups, active, onSelect }: {
  groups: SourceGroup[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:block shrink-0 sticky self-start" style={{ width: 210, top: 68 }}>
      <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: "var(--border)" }}>
        {TYPE_SECTION.map(({ type, title }) => {
          const gs = groups.filter(g => g.type === type);
          if (!gs.length) return null;
          return (
            <div key={type} className="mb-3 last:mb-0">
              <p
                className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {title}
              </p>
              {gs.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    onSelect(g.id);
                    document.getElementById(`group-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all text-right"
                  style={{
                    background: active === g.id ? "var(--navy-light)" : "transparent",
                    color: active === g.id ? "var(--navy-mid)" : "var(--text-secondary)",
                    border: active === g.id ? "1px solid var(--navy-border)" : "1px solid transparent",
                  }}
                >
                  <span style={{ color: active === g.id ? "var(--navy-mid)" : "var(--text-muted)" }}>
                    {TYPE_ICON[g.type]}
                  </span>
                  <span className="flex-1 truncate">{g.label}</span>
                  <span
                    className="shrink-0 rounded-full px-1.5 text-[9px] font-bold"
                    style={{
                      background: active === g.id ? "var(--navy)" : "var(--bg-subtle)",
                      color: active === g.id ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {g.questions.length}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ── Question display ───────────────────────────────────────────────────────

const DIFF_LABEL: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "קשה", mixed: "מעורב" };
const DIFF_COLOR: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "var(--green-light)", text: "var(--green)" },
  medium: { bg: "var(--amber-light)", text: "var(--amber-mid)" },
  hard:   { bg: "var(--red-light)",   text: "var(--red-mid)" },
};
const REL_COLOR: Record<string, { bg: string; text: string }> = {
  critical: { bg: "var(--red-light)",    text: "var(--red-mid)" },
  high:     { bg: "var(--amber-light)",  text: "var(--amber-mid)" },
};

function QuestionRow({ q, index }: { q: QuestionItem; index: number }) {
  const [open, setOpen] = useState(false);
  const dc = DIFF_COLOR[q.difficulty];
  const rc = REL_COLOR[q.examRelevance];

  // Detect language direction
  const heChars = (q.content.match(/[֐-׿]/g) || []).length;
  const enChars = (q.content.match(/[a-zA-Z]/g) || []).length;
  const dir = heChars >= enChars ? "rtl" : "ltr";

  const preview = q.content.slice(0, 300).trim();
  const hasMore = q.content.length > 300;
  const displayText = open ? q.content : preview;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "#fff" }}
    >
      {/* mini header */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b text-xs"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
          style={{ background: "var(--navy)" }}
        >
          {index + 1}
        </span>

        {q.questionNumber && (
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
            שאלה {q.questionNumber}
          </span>
        )}

        {dc && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={dc}>
            {DIFF_LABEL[q.difficulty]}
          </span>
        )}
        {rc && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={rc}>
            {q.examRelevance === "critical" ? "קריטי" : "חשוב"}
          </span>
        )}

        {q.topicIds.slice(0, 3).map(t => (
          <span
            key={t}
            className="rounded-full px-1.5 py-0.5 text-[9px]"
            style={{ background: "var(--bg-page)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* content */}
      <div className="px-4 py-3">
        <pre
          className="text-sm font-sans"
          style={{
            direction: dir,
            textAlign: dir === "rtl" ? "right" : "left",
            lineHeight: "1.85",
            color: "var(--text-primary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
            fontFamily: "inherit",
          }}
        >
          {displayText}
          {!open && hasMore && "…"}
        </pre>

        {hasMore && (
          <button
            onClick={() => setOpen(v => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--navy-mid)" }}
          >
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            {open ? "פחות" : "הצג הכל"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Group panel (details element) ─────────────────────────────────────────

const GROUP_COLORS: Record<SourceGroup["type"], { accent: string; bg: string; border: string }> = {
  recitation: { accent: "var(--cyan)", bg: "var(--cyan-light)", border: "var(--cyan-border)" },
  homework:   { accent: "var(--gold)", bg: "var(--gold-light)", border: "var(--gold-border)" },
  past_exam:  { accent: "var(--purple)", bg: "var(--purple-light)", border: "var(--purple-border)" },
};

function GroupPanel({ group, defaultOpen }: { group: SourceGroup; defaultOpen: boolean }) {
  const c = GROUP_COLORS[group.type];

  return (
    <details
      id={`group-${group.id}`}
      open={defaultOpen}
      className="group scroll-mt-20 rounded-2xl border overflow-hidden shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Summary / header */}
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Type icon */}
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm"
            style={{ background: c.accent }}
          >
            {TYPE_ICON[group.type]}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                {group.label}
              </h2>
              {group.sublabel && (
                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  — {group.sublabel}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {group.questions.length} שאלות
            </p>
          </div>
        </div>

        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
          style={{ color: "var(--text-muted)" }}
        />
      </summary>

      {/* Questions list */}
      <div
        className="border-t px-5 py-4 space-y-3"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        {group.questions.map((q, i) => (
          <QuestionRow key={q.id} q={q} index={i} />
        ))}
      </div>
    </details>
  );
}

// ── Page Client ────────────────────────────────────────────────────────────

export function PracticePageClient({ questions }: { questions: QuestionItem[] }) {
  const groups = buildGroups(questions);
  const [active, setActive] = useState(groups[0]?.id ?? "");

  const recitations = groups.filter(g => g.type === "recitation");
  const homework    = groups.filter(g => g.type === "homework");
  const pastExams   = groups.filter(g => g.type === "past_exam");

  return (
    <div className="flex gap-6 items-start">
      <Sidebar groups={groups} active={active} onSelect={setActive} />

      <main className="min-w-0 flex-1 space-y-4">

        {recitations.length > 0 && (
          <Section title="תרגולים" color="var(--cyan)">
            {recitations.map((g, i) => (
              <GroupPanel key={g.id} group={g} defaultOpen={i === 0} />
            ))}
          </Section>
        )}

        {homework.length > 0 && (
          <Section title="מטלות" color="var(--gold)">
            {homework.map((g, i) => (
              <GroupPanel key={g.id} group={g} defaultOpen={i === 0} />
            ))}
          </Section>
        )}

        {pastExams.length > 0 && (
          <Section title="מבחני עבר" color="var(--purple)">
            {pastExams.map((g, i) => (
              <GroupPanel key={g.id} group={g} defaultOpen={i === 0} />
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div
        className="flex items-center gap-2 border-b pb-2"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        <h2 className="text-base font-black" style={{ color: "var(--text-secondary)" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
