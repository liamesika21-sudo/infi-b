import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";
import type { MaxInsightsData, MaxInsight, MaxCounterExample } from "@/lib/calculus2/analysis-types";

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

  return (
    <div className="mx-auto max-w-3xl space-y-16 py-2">

      {/* Page title */}
      <div>
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

      {/* ── 1. Exam-critical notes ── */}
      <Section id="critical" label="קריטי למבחן">
        <div className="space-y-4">
          {insights.examCriticalNotes.map((note) => (
            <CriticalNote key={note.id} note={note} />
          ))}
        </div>
      </Section>

      {/* ── 2. Key intuitions ── */}
      <Section id="intuitions" label="אינטואיציות — מה שחייבים להפנים">
        <div className="space-y-6">
          {insights.intuitions.map((intuition) => (
            <IntuitionCard key={intuition.id} item={intuition} />
          ))}
        </div>
      </Section>

      {/* ── 3. Counter-examples ── */}
      <Section id="counterexamples" label="דוגמאות נגדיות — עם הסבר מלא">
        <div className="space-y-8">
          {insights.counterExamples.map((ce) => (
            <CounterExampleCard key={ce.id} ce={ce} />
          ))}
        </div>
      </Section>

      {/* ── 4. Weekly insights (accordion) ── */}
      <Section id="weekly" label="תובנות לפי שבוע">
        <div className="space-y-2">
          {insights.weeklyInsights.map((week) => (
            <WeekAccordion key={week.week} week={week} />
          ))}
        </div>
      </Section>

      {/* ── 5. Common mistakes ── */}
      <Section id="mistakes" label="טעויות נפוצות שמקס מזהיר עליהן">
        <div className="space-y-3">
          {insights.commonMistakesFromMax.map((m) => (
            <MistakeRow key={m.id} mistake={m.mistake} says={m.maxSays} week={m.week} />
          ))}
        </div>
      </Section>

    </div>
  );
}

/* ──────────────────────────────────────────────
   Section wrapper
────────────────────────────────────────────── */
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <div
        className="mb-6 border-b pb-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
          {label}
        </h2>
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
        <span className="text-xl leading-none mt-0.5">🚨</span>
        <div className="flex-1">
          <p className="text-base font-bold leading-7" style={{ color: "var(--text-primary)" }}>
            {note.text}
          </p>
          {note.recitation && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--red-mid)" }}>
              תרגול {note.recitation}
            </p>
          )}
          {note.maxQuote && (
            <p className="mt-3 text-sm leading-7 italic" style={{ color: "var(--text-secondary)" }}>
              &ldquo;{note.maxQuote}&rdquo;
            </p>
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

        {/* Main text — plain Hebrew prose */}
        <p className="text-sm leading-8" style={{ color: "var(--text-secondary)" }}>
          {item.text}
        </p>

        {/* Formal statement — math block */}
        {item.formalStatement && (
          <MathBlock content={item.formalStatement} />
        )}

        {/* Order of growth */}
        {item.orderOfGrowth && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-mono"
            style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", direction: "ltr" }}
          >
            {item.orderOfGrowth}
          </div>
        )}

        {/* Max quote */}
        {item.maxQuote && (
          <MaxQuote text={item.maxQuote} />
        )}

        {/* Warnings / exam implications */}
        {item.redFlag && (
          <StudyCallout variant="warning">{item.redFlag}</StudyCallout>
        )}
        {item.examImplication && (
          <StudyCallout variant="exam">{item.examImplication}</StudyCallout>
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
          <p className="text-sm leading-7 font-medium" style={{ color: "var(--text-primary)" }}>
            {ce.claim}
          </p>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Explanation / counter-example */}
          {(ce.explanation ?? ce.proof ?? ce.counterexampleConstruction) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: isWrong ? "var(--red-mid)" : "var(--green-mid)" }}>
                {isWrong ? "דוגמה נגדית" : "הוכחה"}
              </p>
              <p className="text-sm leading-8" style={{ color: "var(--text-secondary)" }}>
                {ce.explanation ?? ce.proof ?? ce.counterexampleConstruction}
              </p>
            </div>
          )}

          {/* Formal — code-style block, LTR */}
          {ce.formalCounterexample && (
            <div
              className="rounded-xl px-4 py-3 font-mono text-sm"
              style={{ background: "var(--navy)", color: "#c7d5e8", direction: "ltr" }}
            >
              {ce.formalCounterexample}
            </div>
          )}

          {/* Why it works */}
          {ce.whyItWorks && (
            <p className="text-sm italic leading-7" style={{ color: "var(--text-muted)" }}>
              {ce.whyItWorks}
            </p>
          )}

          {/* Key takeaway */}
          {ce.key && (
            <StudyCallout variant={isWrong ? "exam" : "success"}>
              {ce.key}
            </StudyCallout>
          )}
          {ce.rule && (
            <StudyCallout variant="info">{ce.rule}</StudyCallout>
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
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>▾</span>
      </summary>

      <div className="px-5 pb-5 pt-4">
        <ul className="space-y-2.5">
          {week.keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--navy-mid)" }}
              />
              {/* Plain text — no math preprocessing to avoid KaTeX chaos */}
              <span>{insight}</span>
            </li>
          ))}
        </ul>

        {(week.examTip ?? week.examCritical ?? week.dangerZone) && (
          <div className="mt-4">
            <StudyCallout
              variant={week.examCritical ? "exam" : week.dangerZone ? "error" : "tip"}
            >
              {week.examCritical ?? week.examTip ?? week.classicExamQuestion ?? week.dangerZone}
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
      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
        ✗ {mistake}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        שבוע {week}
      </p>
      <p className="mt-1.5 text-sm italic leading-6" style={{ color: "var(--text-secondary)" }}>
        &ldquo;{says}&rdquo;
      </p>
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
      <MathContent text={content} className="text-sm" />
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
      &ldquo;{text}&rdquo;
    </blockquote>
  );
}

import type React from "react";
