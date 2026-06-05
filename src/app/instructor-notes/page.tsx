import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";
import type { MaxInsightsData, MaxInsight, MaxCounterExample } from "@/lib/calculus2/analysis-types";
import type React from "react";

type WeeklyInsight = MaxInsightsData["weeklyInsights"][number];
type CommonMistake = MaxInsightsData["commonMistakesFromMax"][number];

interface MaxWeekGroup {
  week: number;
  topic?: string;
  recitations: number[];
  weekly?: WeeklyInsight;
  criticalNotes: MaxInsight[];
  intuitions: MaxInsight[];
  counterExamples: MaxCounterExample[];
  mistakes: CommonMistake[];
}

export default async function InstructorNotesPage() {
  const analysis = await readAnalysisData();
  const insights = analysis.maxInsights;

  if (!insights) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center" style={{ color: "var(--text-muted)" }}>
        לא נמצא קובץ max-insights.json.
      </div>
    );
  }

  const weekGroups = buildWeekGroups(insights);

  return (
    <div className="mx-auto max-w-6xl py-2">

      {/* Page title */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--teal)" }}>
          Max Mahlin · תמלולי תרגול
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          תובנות, עצות ודוגמאות נגדיות
        </h1>
        <p className="mt-3 text-base leading-8" style={{ color: "var(--text-secondary)" }}>
          מה שמקס אמר שחשוב למבחן, חזר עליו, וביקש שתשננו. הנוסחאות מוצגות כמתמטיקה אמיתית.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <WeekSidebar groups={weekGroups} />

        <main className="min-w-0 space-y-8">
          {weekGroups.map((group) => (
            <WeekSection key={group.week} group={group} />
          ))}
        </main>
      </div>

    </div>
  );
}

function buildWeekGroups(insights: MaxInsightsData): MaxWeekGroup[] {
  const groups = new Map<number, MaxWeekGroup>();

  function ensureGroup(week: number): MaxWeekGroup {
    const existing = groups.get(week);
    if (existing) return existing;
    const group: MaxWeekGroup = {
      week,
      recitations: [],
      criticalNotes: [],
      intuitions: [],
      counterExamples: [],
      mistakes: [],
    };
    groups.set(week, group);
    return group;
  }

  function addRecitation(group: MaxWeekGroup, recitation?: number) {
    if (!recitation || group.recitations.includes(recitation)) return;
    group.recitations.push(recitation);
    group.recitations.sort((a, b) => a - b);
  }

  for (const weekly of insights.weeklyInsights) {
    const group = ensureGroup(weekly.week);
    group.weekly = weekly;
    group.topic = weekly.topic;
    addRecitation(group, weekly.recitation);
  }

  for (const note of insights.examCriticalNotes) {
    const week = note.week ?? note.recitation;
    if (!week) continue;
    const group = ensureGroup(week);
    group.criticalNotes.push(note);
    addRecitation(group, note.recitation);
  }

  for (const intuition of insights.intuitions) {
    const week = intuition.week ?? intuition.recitation;
    if (!week) continue;
    const group = ensureGroup(week);
    group.intuitions.push(intuition);
    addRecitation(group, intuition.recitation);
  }

  for (const ce of insights.counterExamples) {
    const group = ensureGroup(ce.week);
    group.counterExamples.push(ce);
    addRecitation(group, ce.recitation);
  }

  for (const mistake of insights.commonMistakesFromMax) {
    ensureGroup(mistake.week).mistakes.push(mistake);
  }

  return [...groups.values()].sort((a, b) => a.week - b.week);
}

function WeekSidebar({ groups }: { groups: MaxWeekGroup[] }) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <nav
        className="rounded-xl border bg-white p-3 shadow-sm"
        style={{ borderColor: "var(--border)" }}
        aria-label="ניווט לפי שבועות"
      >
        <p className="mb-2 px-1 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          שבועות
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
          {groups.map((group) => (
            <a
              key={group.week}
              href={`#week-${group.week}`}
              className="flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-[var(--navy-light)] lg:w-full"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <span>שבוע {group.week}</span>
              <span className="max-w-[105px] truncate font-medium" style={{ color: "var(--text-muted)" }}>
                {group.topic ?? "הערות"}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}

function WeekSection({ group }: { group: MaxWeekGroup }) {
  return (
    <section id={`week-${group.week}`} className="scroll-mt-24 space-y-5">
      <div className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>
          Week {group.week}
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              שבוע {group.week}
            </h2>
            <p className="mt-1 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              {group.topic ?? "הערות ותובנות מהתרגול"}
            </p>
          </div>
          {group.recitations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.recitations.map((recitation) => (
                <span key={recitation} className="badge badge-navy-light">
                  תרגול {recitation}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {group.weekly && (
        <Section label="תובנות שבועיות">
          <WeekAccordion week={group.weekly} />
        </Section>
      )}

      {group.criticalNotes.length > 0 && (
        <Section label="קריטי למבחן">
          <div className="space-y-4">
            {group.criticalNotes.map((note) => (
              <CriticalNote key={note.id} note={note} />
            ))}
          </div>
        </Section>
      )}

      {group.intuitions.length > 0 && (
        <Section label="אינטואיציות שמקס הדגיש">
          <div className="space-y-5">
            {group.intuitions.map((intuition) => (
              <IntuitionCard key={intuition.id} item={intuition} />
            ))}
          </div>
        </Section>
      )}

      {group.counterExamples.length > 0 && (
        <Section label="דוגמאות נגדיות">
          <div className="space-y-6">
            {group.counterExamples.map((ce) => (
              <CounterExampleCard key={ce.id} ce={ce} />
            ))}
          </div>
        </Section>
      )}

      {group.mistakes.length > 0 && (
        <Section label="טעויות נפוצות">
          <div className="space-y-3">
            {group.mistakes.map((mistake) => (
              <MistakeRow key={mistake.id} mistake={mistake.mistake} says={mistake.maxSays} week={mistake.week} />
            ))}
          </div>
        </Section>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   Section wrapper
────────────────────────────────────────────── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div
        className="mb-4 border-b pb-2"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
          {label}
        </h3>
      </div>
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────
   Critical note — large, red-accented
────────────────────────────────────────────── */
function CriticalNote({ note }: { note: MaxInsight }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--red-light)",
        borderRight: "5px solid var(--red-mid)",
        border: "1.5px solid var(--red-border)",
        borderRightWidth: "5px",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ background: "var(--red-mid)" }}
        >
          !
        </span>
        <div className="flex-1">
          <RichText text={note.text} className="font-bold" style={{ color: "var(--text-primary)" }} />
          {note.recitation && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--red-mid)" }}>
              תרגול {note.recitation}
            </p>
          )}
          {note.maxQuote && (
            <MaxQuote text={note.maxQuote} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Intuition card — clean, math displayed properly
────────────────────────────────────────────── */
function IntuitionCard({ item }: { item: MaxInsight }) {
  return (
    <article
      className="rounded-2xl border bg-white overflow-hidden shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Header strip */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        {item.recitation && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ background: "var(--navy)", color: "#fff" }}
          >
            תרגול {item.recitation}
          </span>
        )}
        {item.topic && (
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            {item.topic}
          </span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Title */}
        {item.title && (
          <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
            {item.title}
          </h3>
        )}

        <RichText text={item.text} style={{ color: "var(--text-secondary)" }} />

        {/* Formal statement — math block */}
        {item.formalStatement && (
          <MathBlock content={item.formalStatement} />
        )}

        {/* Order of growth — rendered as display math */}
        {item.orderOfGrowth && (
          <MathBlock content={item.orderOfGrowth} />
        )}

        {/* Max quote */}
        {item.maxQuote && (
          <MaxQuote text={item.maxQuote} />
        )}

        {/* Warnings / exam implications */}
        {item.redFlag && (
          <StudyCallout variant="warning">
            <RichText text={item.redFlag} />
          </StudyCallout>
        )}
        {item.examImplication && (
          <StudyCallout variant="exam">
            <RichText text={item.examImplication} />
          </StudyCallout>
        )}
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────
   Counter-example — verdict first, then logic
────────────────────────────────────────────── */
function CounterExampleCard({ ce }: { ce: MaxCounterExample }) {
  const isWrong = ce.verdict === "שגוי";

  return (
    <article>
      {/* Title + verdict */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>
            {ce.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            תרגול {ce.recitation} · שבוע {ce.week} · {ce.topic}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black text-white"
          style={{ background: isWrong ? "var(--red-mid)" : "var(--green-mid)" }}
        >
          {ce.verdict}
        </span>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {/* The claim */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            הטענה
          </p>
          <RichText text={ce.claim} className="font-medium" style={{ color: "var(--text-primary)" }} />
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Explanation / counter-example */}
          {(ce.explanation ?? ce.proof ?? ce.counterexampleConstruction) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: isWrong ? "var(--red-mid)" : "var(--green-mid)" }}>
                {isWrong ? "דוגמה נגדית" : "הוכחה"}
              </p>
              <RichText text={ce.explanation ?? ce.proof ?? ce.counterexampleConstruction ?? ""} style={{ color: "var(--text-secondary)" }} />
            </div>
          )}

          {/* Formal counterexample — RTL prose with isolated math. */}
          {ce.formalCounterexample && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "var(--navy-light)", border: "1px solid var(--navy-border)" }}
            >
              <RichText text={ce.formalCounterexample} />
            </div>
          )}

          {/* Why it works */}
          {ce.whyItWorks && (
            <RichText text={ce.whyItWorks} className="italic" style={{ color: "var(--text-muted)" }} />
          )}

          {/* Key takeaway */}
          {ce.key && (
            <StudyCallout variant={isWrong ? "exam" : "success"}>
              <RichText text={ce.key} />
            </StudyCallout>
          )}
          {ce.rule && (
            <StudyCallout variant="info">
              <RichText text={ce.rule} />
            </StudyCallout>
          )}

          {/* Max quote */}
          {ce.maxQuote && <MaxQuote text={ce.maxQuote} />}
        </div>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────
   Weekly insights — collapsible
────────────────────────────────────────────── */
function WeekAccordion({ week }: {
  week: MaxInsightsData["weeklyInsights"][number]
}) {
  return (
    <details
      className="group rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <summary
        className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 select-none"
        style={{ background: "var(--bg-subtle)" }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ background: "var(--navy)" }}
        >
          {week.week}
        </span>
        <div className="flex-1">
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            שבוע {week.week}
          </span>
          <span className="mr-2 text-xs" style={{ color: "var(--text-muted)" }}>
            תרגול {week.recitation} · {week.topic}
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>פתח</span>
      </summary>

      <div className="px-5 pb-5 pt-4">
        <ul className="space-y-2.5">
          {week.keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--navy-mid)" }}
              />
              <RichText text={insight} className="flex-1" />
            </li>
          ))}
        </ul>

        {(week.examTip ?? week.examCritical ?? week.dangerZone) && (
          <div className="mt-4">
            <StudyCallout
              variant={week.examCritical ? "exam" : week.dangerZone ? "error" : "tip"}
            >
              <RichText text={week.examCritical ?? week.examTip ?? week.classicExamQuestion ?? week.dangerZone ?? ""} />
            </StudyCallout>
          </div>
        )}
      </div>
    </details>
  );
}

/* ──────────────────────────────────────────────
   Mistake row
────────────────────────────────────────────── */
function MistakeRow({ mistake, says, week }: { mistake: string; says: string; week: number }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: "var(--bg-subtle)", borderRight: "4px solid var(--amber-mid)" }}
    >
      <RichText text={mistake} className="font-bold" style={{ color: "var(--text-primary)" }} />
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        שבוע {week}
      </p>
      <div className="mt-1.5">
        <MaxQuote text={says} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Shared helpers
────────────────────────────────────────────── */

/** Renders a formula block. Separates math ($...$) from Hebrew prose. */
function MathBlock({ content }: { content: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: "var(--navy-light)", border: "1.5px solid var(--navy-border)" }}
    >
      <MathContent text={normalizeMaxMath(content)} className="text-sm" />
    </div>
  );
}

function RichText({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div dir="rtl" style={style}>
      <MathContent text={normalizeMaxMath(text)} className={`text-sm leading-8 ${className}`} />
    </div>
  );
}

function MaxQuote({ text }: { text: string }) {
  return (
    <blockquote
      className="text-sm leading-8 italic"
      style={{
        color: "var(--text-secondary)",
        paddingRight: "1rem",
        borderRight: "3px solid var(--border-strong)",
      }}
    >
      <span aria-hidden="true">&ldquo;</span>
      <RichText text={text} className="inline" />
      <span aria-hidden="true">&rdquo;</span>
    </blockquote>
  );
}

/* ── Unicode → LaTeX char map ───────────────────────────────── */
const U2L: Record<string, string> = {
  '∑':'\\sum',   '∫':'\\int',     '∞':'\\infty',
  '≤':'\\leq',   '≥':'\\geq',     '≠':'\\neq',
  '→':'\\to',    '←':'\\leftarrow',
  '⟹':'\\Rightarrow', '⟸':'\\Leftarrow',
  '≈':'\\approx','·':'\\cdot',   '×':'\\times',  '÷':'\\div',
  '√':'\\sqrt',  '∂':'\\partial', '∇':'\\nabla',
  '∃':'\\exists','∀':'\\forall',
  '∈':'\\in',    '∉':'\\notin',
  '⊂':'\\subset','⊃':'\\supset',
  '∪':'\\cup',   '∩':'\\cap',
  '⊕':'\\oplus', '∓':'\\mp',      '±':'\\pm',     '∏':'\\prod',
  'α':'\\alpha', 'β':'\\beta',   'γ':'\\gamma',  'δ':'\\delta',
  'ε':'\\varepsilon','ζ':'\\zeta','η':'\\eta',   'θ':'\\theta',
  'ι':'\\iota',  'κ':'\\kappa',  'λ':'\\lambda', 'μ':'\\mu',
  'ν':'\\nu',    'ξ':'\\xi',     'π':'\\pi',     'ρ':'\\rho',
  'σ':'\\sigma', 'τ':'\\tau',    'υ':'\\upsilon','φ':'\\phi',
  'χ':'\\chi',   'ψ':'\\psi',    'ω':'\\omega',
  // subscripts
  '₀':'_0','₁':'_1','₂':'_2','₃':'_3','₄':'_4',
  '₅':'_5','₆':'_6','₇':'_7','₈':'_8','₉':'_9',
  'ₙ':'_n','ₖ':'_k','ₘ':'_m','ₐ':'_a',
  // superscripts
  '⁰':'^0','¹':'^1','²':'^2','³':'^3','⁴':'^4',
  '⁵':'^5','⁶':'^6','⁷':'^7','⁸':'^8','⁹':'^9',
  'ⁿ':'^n','⁺':'^+','⁻':'^-',
};

const HAS_UMATH = /[∑∫∞≤≥≠→←⟹⟸≈·×÷√∂∇∃∀∈∉⊂⊃∪∩⊕∓±∏αβγδεζηθικλμνξπρστυφχψω₀₁₂₃₄₅₆₇₈₉ₙₖₘₐ⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻]/;
const IS_HEBREW = /[א-תְ-ׇ]/;

/** Convert a non-Hebrew, non-$-delimited segment that contains unicode math. */
function convertSegment(seg: string): string {
  if (!HAS_UMATH.test(seg)) return seg;

  const leading = seg.match(/^\s*/)?.[0] ?? '';
  const trailing = seg.match(/\s*$/)?.[0] ?? '';
  let inner = seg.trim();
  if (!inner) return seg;

  // Strip trailing sentence punctuation (keep outside math)
  const punctMatch = inner.match(/^([\s\S]*?)([.!?,;:]*)$/);
  const trailingPunct = punctMatch?.[2] ?? '';
  inner = punctMatch?.[1] ?? inner;
  if (!inner) return seg;

  // char-by-char unicode → LaTeX
  let latex = '';
  for (const ch of inner) latex += U2L[ch] ?? ch;

  // ^/_ before multi-char LaTeX command → wrap in braces
  latex = latex.replace(/([_^])(\\[a-zA-Z]+)/g, '$1{$2}');

  // Ensure space between a LaTeX command and a following letter
  // e.g. \cdotln → \cdot ln (so ln can then be replaced with \ln)
  latex = latex.replace(/(\\[a-zA-Z]+)([a-zA-Z])/g, '$1 $2');

  // Recognize common math function names
  latex = latex
    .replace(/(?<![\\a-zA-Z])ln(?![a-zA-Z])/g, '\\ln')
    .replace(/(?<![\\a-zA-Z])lim(?![a-zA-Z])/g, '\\lim')
    .replace(/(?<![\\a-zA-Z])limsup(?![a-zA-Z])/g, '\\limsup')
    .replace(/(?<![\\a-zA-Z])liminf(?![a-zA-Z])/g, '\\liminf')
    .replace(/(?<![\\a-zA-Z])sin(?![a-zA-Z])/g, '\\sin')
    .replace(/(?<![\\a-zA-Z])cos(?![a-zA-Z])/g, '\\cos')
    .replace(/(?<![\\a-zA-Z])max(?![a-zA-Z])/g, '\\max')
    .replace(/(?<![\\a-zA-Z])min(?![a-zA-Z])/g, '\\min');

  return `${leading}$${latex}$${trailingPunct}${trailing}`;
}

/**
 * For text OUTSIDE existing $...$ blocks:
 * split on Hebrew letter runs (keep them), convert unicode math in the gaps.
 */
function fixUnicode(raw: string): string {
  if (!HAS_UMATH.test(raw)) return raw;
  return raw
    .split(/([א-תְ-ׇ]+)/)
    .map(part => IS_HEBREW.test(part) ? part : convertSegment(part))
    .join('');
}

/** Apply fixUnicode only to text outside $...$ / $$...$$ delimiters. */
function applyOutsideMath(text: string): string {
  const parts: string[] = [];
  const re = /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(fixUnicode(text.slice(last, m.index)));
    parts.push(m[0]);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(fixUnicode(text.slice(last)));
  return parts.join('');
}

function normalizeMaxMath(text: string): string {
  // Phase 1 — fix the known broken $\\cmd$_subscript patterns from the raw data
  const phase1 = text
    .replaceAll("$\\int$_a^x f(t)dt", "$\\int_a^x f(t)\\,dt$")
    .replaceAll("$\\int$_{-a}^{a} f", "$\\int_{-a}^{a} f$")
    .replaceAll("2$\\int$_0^a f", "$2\\int_0^a f$")
    .replaceAll(
      "$\\int$_a^$\\infty$ f = lim_{R$\\to$$\\infty$} $\\int$_a^R f",
      "$\\int_a^\\infty f=\\lim_{R\\to\\infty}\\int_a^R f$",
    )
    .replaceAll(
      "$\\int$_{-$\\infty$}^{$\\infty$} f = $\\int$_{-$\\infty$}^{0} f + $\\int$_0^{$\\infty$} f",
      "$\\int_{-\\infty}^{\\infty} f=\\int_{-\\infty}^{0} f+\\int_0^{\\infty} f$",
    )
    .replaceAll("$\\sum$($a_n$ + $b_n$) = $\\sum$$a_n$ + $\\sum$$b_n$", "$\\sum(a_n+b_n)=\\sum a_n+\\sum b_n$")
    .replaceAll("$\\sum$$a_n$", "$\\sum a_n$")
    .replaceAll("$\\sum$$b_n$", "$\\sum b_n$")
    .replaceAll("$\\sum$$q^n$", "$\\sum q^n$")
    .replaceAll("$\\sum$$x^n$", "$\\sum x^n$")
    .replaceAll("$\\sum$1/nᵖ", "$\\sum 1/n^p$")
    .replaceAll("$$a^n$$/nᵏ", "$a^n/n^k$")
    .replaceAll("$\\sum$n!", "$\\sum n!$")
    .replaceAll("$\\sum$$r^n$", "$\\sum r^n$")
    .replaceAll("$\\sum$(-1)ⁿx^(2n+1)/(2n+1)!", "$\\sum (-1)^n x^{2n+1}/(2n+1)!$")
    .replaceAll("$\\sum$(-1)ⁿx^(2n)/(2n)!", "$\\sum (-1)^n x^{2n}/(2n)!$")
    .replaceAll("$\\sum$(-1)^(n+1)$x^n$/n", "$\\sum (-1)^{n+1}x^n/n$")
    .replaceAll("$a_n$₊₁ = f($a_n$)", "$a_{n+1}=f(a_n)$")
    .replaceAll("lim $a_n$/$b_n$ = L $\\neq$ 0, $\\infty$", "$\\lim a_n/b_n=L\\ne 0,\\infty$")
    .replaceAll("$a_n$ $\\to$ 0", "$a_n\\to 0$")
    .replaceAll("$a_n$ $\\geq$ 0", "$a_n\\geq 0$")
    .replaceAll("שורש/מנה = 1 $\\to$", "שורש/מנה = $1\\to$")
    .replaceAll("n^(1/n) $\\to$", "$n^{1/n}\\to$")
    .replaceAll("לn$\\geq$3", "ל-$n\\geq 3$")
    .replaceAll("R = 1/limsup|$a_n$|^(1/n)", "$R=1/\\limsup |a_n|^{1/n}$")
    .replaceAll("|x-x₀|<R", "$|x-x_0|<R$")
    .replaceAll("|x-x₀|=R", "$|x-x_0|=R$");

  // Phase 2 — convert remaining raw unicode math (∑ ∫ ≤ ≥ subscripts …)
  return applyOutsideMath(phase1);
}
