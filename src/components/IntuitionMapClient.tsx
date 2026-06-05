"use client";

import { useMemo, useState } from "react";
import { BookMarked, ChevronDown, Filter, Lightbulb, Search, Sigma, X } from "lucide-react";
import type { CourseWeek } from "@/lib/calculus2/types";
import type { WeekIntuition } from "@/lib/calculus2/intuition-map";
import { GLOBAL_TOOLBOX_ROWS, KNOWN_SERIES } from "@/lib/calculus2/intuition-map";
import { DisplayMath, MathContent } from "@/components/study/MathContent";

interface EnrichedWeek {
  week: CourseWeek;
  intuition?: WeekIntuition;
}

export function IntuitionMapClient({ weeks }: { weeks: EnrichedWeek[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredWeeks = useMemo(() => {
    if (!normalizedQuery) return weeks;
    return weeks.filter(({ week, intuition }) => {
      const haystack = [
        week.weekNumber,
        week.topicCoverage.join(" "),
        intuition?.title,
        intuition?.mainIdea,
        intuition?.questionTypes.join(" "),
        intuition?.quickRules.join(" "),
        intuition?.patterns.map((pattern) => [
          pattern.title,
          pattern.asking,
          pattern.toolbox.join(" "),
          pattern.conditions.join(" "),
          pattern.identify.join(" "),
          pattern.mistakes.join(" "),
          pattern.maxNote,
          pattern.examples.join(" "),
        ].join(" ")).join(" "),
      ].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, weeks]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_340px] lg:p-6">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>
              Intuition Map
            </p>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--navy-light)", color: "var(--navy-mid)" }}>
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold">מפת אינטואיציה</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                  דף עבודה שמסביר מה כל ניסוח שאלה באמת מבקש, איזה כלים זמינים, אילו תנאים חייבים לבדוק, ואיך לבחור כיוון לפני חישובים.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
            <label htmlFor="intuition-search" className="mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              <Search className="h-4 w-4" />
              חיפוש בתוך המפה
            </label>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2" style={{ borderColor: "var(--border)" }}>
              <input
                id="intuition-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="לייבניץ, רדיוס, לופיטל, קצוות..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md p-1 transition hover:bg-[var(--bg-subtle)]"
                  aria-label="נקה חיפוש"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              מוצגים {filteredWeeks.length} מתוך {weeks.length} שבועות.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: "var(--border)" }}>
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              <Filter className="h-4 w-4" />
              ניווט שבועות
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
              {weeks.map(({ week, intuition }) => (
                <a
                  key={week.id}
                  href={`#week-${week.weekNumber}`}
                  className="flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-[var(--navy-light)] lg:w-full"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <span>שבוע {week.weekNumber}</span>
                  <span className="max-w-[115px] truncate font-medium" style={{ color: "var(--text-muted)" }}>
                    {intuition?.title ?? "טרם נותח"}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <ToolboxTable />
          <DifferentiateIntegrate />
          <KnownSeriesBank />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" style={{ color: "var(--teal)" }} />
              <h2 className="text-xl font-extrabold">מפה שבועית לפי מבנה הקורס</h2>
            </div>

            {filteredWeeks.map(({ week, intuition }) => (
              <WeekPanel key={week.id} week={week} intuition={intuition} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

function ToolboxTable() {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="mb-3 flex items-center gap-2">
        <Sigma className="h-5 w-5" style={{ color: "var(--navy-mid)" }} />
        <h2 className="text-xl font-extrabold">Toolbox Tables / טבלת בחירת כלי</h2>
      </div>
      <ResponsiveTable rows={GLOBAL_TOOLBOX_ROWS} />
    </section>
  );
}

function DifferentiateIntegrate() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <ConceptCard
        tone="blue"
        title="מתי גוזרים טור חזקות?"
        body="גוזרים כאשר הטור הנוכחי קשה לזיהוי, אבל הגזירה מפשטת מקדמים או מורידה חזקות. המטרה אינה לגזור כי אפשר, אלא להפוך ביטוי זר לטור מוכר."
        bullets={[
          "חלוקה ב-n נעלמת לעיתים אחרי גזירה.",
          "חזקות יורדות ויכולות להפוך לגיאומטרי.",
          "אחרי שמוצאים f', צריך לאינטגרל חזרה ולקבוע קבוע.",
        ]}
        formulas={["\\frac{x^n}{n}\\xrightarrow{\\text{differentiate}}x^{n-1}", "x^{2n+1}\\xrightarrow{\\text{differentiate}}(2n+1)x^{2n}"]}
      />
      <ConceptCard
        tone="green"
        title="מתי מאנטגרלים טור חזקות?"
        body="מאנטגרלים כאשר רוצים ליצור מכנים כמו n+1 או 2n+1, או להגיע לדפוסי ln ו-arctan מתוך טור גיאומטרי."
        bullets={[
          "אינטגרציה יוצרת מכנה חדש.",
          "היא שימושית במיוחד מטור גיאומטרי אל ln או arctan.",
          "חייבים לזכור קבוע אינטגרציה ותחום תקפות.",
        ]}
        formulas={["\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C", "\\int\\frac{1}{1+x^2}\\,dx=\\arctan x"]}
      />
    </section>
  );
}

function KnownSeriesBank() {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="mb-4 flex items-center gap-2">
        <Sigma className="h-5 w-5" style={{ color: "var(--teal)" }} />
        <h2 className="text-xl font-extrabold">Known Series Bank / בנק טורים מוכרים</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {KNOWN_SERIES.map((series) => (
          <article key={series.name} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
            <h3 className="text-base font-extrabold">{series.name}</h3>
            <DisplayMath latex={series.formula} />
            <InfoList
              items={[
                ["איך מזהים", series.recognize],
                ["מה מוביל אליו", series.transformations],
                ["הצבות נפוצות", series.substitutions],
                ["טעות נפוצה", series.mistakes],
              ]}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function WeekPanel({ week, intuition }: EnrichedWeek) {
  return (
    <details
      id={`week-${week.weekNumber}`}
      open={week.weekNumber >= 6 && week.weekNumber <= 9}
      className="group scroll-mt-24 rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>
            Week {week.weekNumber} · הרצאה {week.lectureNumber} · תרגול {week.recitationNumber}
          </p>
          <h2 className="mt-1 text-xl font-extrabold">{intuition?.title ?? "שבוע ללא חומרים זמינים לניתוח אינטואיציה"}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            {intuition?.mainIdea ?? "במפת הקורס השבוע קיים, אך לא נמצאו עבורו חומרים מועלים מספיקים לבניית בלוק אינטואיציה אמין."}
          </p>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
      </summary>

      <div className="space-y-5 border-t p-4" style={{ borderColor: "var(--border)" }}>
        <div className="grid gap-3 md:grid-cols-3">
          <MetaBox label="נושאים במפה" value={week.topicCoverage.length > 0 ? week.topicCoverage.join(", ") : "לא זוהו נושאים"} />
          <MetaBox label="סוגי שאלות" value={intuition?.questionTypes.join(", ") ?? "אין בלוק אינטואיציה ידני לשבוע זה"} />
          <MetaBox label="סטטוס חומרים" value={`הרצאה: ${week.materialStatus.lecture}, תרגול: ${week.materialStatus.recitation}, מטלה: ${week.materialStatus.homework}`} />
        </div>

        {intuition && (
          <>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--navy-border)", background: "var(--navy-light)" }}>
              <h3 className="mb-2 text-sm font-extrabold">Short rules / אם רואים את זה → חושבים על זה</h3>
              <ul className="grid gap-2 text-sm leading-7 md:grid-cols-2">
                {intuition.quickRules.map((rule) => (
                  <li key={rule} className="rounded-md bg-white/70 px-3 py-2">{rule}</li>
                ))}
              </ul>
            </div>

            <ResponsiveTable rows={intuition.toolboxRows} />

            <div className="space-y-4">
              {intuition.patterns.map((pattern) => (
                <article key={pattern.title} className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-lg font-extrabold">{pattern.title}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <HighlightBox title="מה השאלה שואלת?" tone="blue" text={pattern.asking} />
                    <HighlightList title="Toolbox" tone="green" items={pattern.toolbox} />
                    <HighlightList title="Conditions" tone="amber" items={pattern.conditions} />
                    <HighlightList title="איך מזהים?" tone="purple" items={pattern.identify} />
                    <HighlightList title="Common mistake" tone="red" items={pattern.mistakes} />
                    {pattern.maxNote && <HighlightBox title="Max's note" tone="gold" text={pattern.maxNote} />}
                  </div>
                  <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      KaTeX examples
                    </p>
                    <div className="space-y-2">
                      {pattern.examples.map((example) => (
                        <DisplayMath key={example} latex={example} />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </details>
  );
}

function ResponsiveTable({ rows }: { rows: { wording: string; means: string; toolbox: string; conditions: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full min-w-[760px] border-collapse text-right text-sm">
        <thead style={{ background: "var(--bg-subtle)" }}>
          <tr>
            <Th>ניסוח שאלה</Th>
            <Th>מה זה אומר</Th>
            <Th>Toolbox</Th>
            <Th>תנאים</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.wording}-${row.means}`} className="border-t" style={{ borderColor: "var(--border)" }}>
              <Td strong>{row.wording}</Td>
              <Td>{row.means}</Td>
              <Td>{row.toolbox}</Td>
              <Td>{row.conditions}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-xs font-extrabold" style={{ color: "var(--text-secondary)" }}>{children}</th>;
}

function Td({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`align-top px-3 py-3 leading-7 ${strong ? "font-bold" : ""}`}>{children}</td>;
}

function ConceptCard({ title, body, bullets, formulas, tone }: { title: string; body: string; bullets: string[]; formulas: string[]; tone: "blue" | "green" }) {
  const colors = tone === "blue"
    ? { bg: "var(--navy-light)", border: "var(--navy-border)", text: "var(--navy-mid)" }
    : { bg: "var(--green-light)", border: "var(--green-border)", text: "var(--green)" };
  return (
    <article className="rounded-xl border p-4 shadow-sm" style={{ background: colors.bg, borderColor: colors.border }}>
      <h2 className="text-lg font-extrabold" style={{ color: colors.text }}>{title}</h2>
      <p className="mt-2 text-sm leading-7">{body}</p>
      <ul className="mt-3 space-y-1 text-sm leading-7">
        {bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}
      </ul>
      <div className="mt-3 space-y-2">
        {formulas.map((formula) => <DisplayMath key={formula} latex={formula} />)}
      </div>
    </article>
  );
}

function HighlightBox({ title, text, tone }: { title: string; text: string; tone: Tone }) {
  return (
    <div className="rounded-lg border p-3" style={toneStyle(tone)}>
      <p className="mb-1 text-xs font-extrabold uppercase tracking-widest">{title}</p>
      <MathContent text={text} className="text-sm" />
    </div>
  );
}

function HighlightList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="rounded-lg border p-3" style={toneStyle(tone)}>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-widest">{title}</p>
      <ul className="space-y-1 text-sm leading-7">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

type Tone = "blue" | "green" | "amber" | "red" | "purple" | "gold";

function toneStyle(tone: Tone) {
  const map = {
    blue: { background: "var(--navy-light)", borderColor: "var(--navy-border)" },
    green: { background: "var(--green-light)", borderColor: "var(--green-border)" },
    amber: { background: "var(--amber-light)", borderColor: "var(--amber-border)" },
    red: { background: "var(--red-light)", borderColor: "var(--red-border)" },
    purple: { background: "var(--purple-light)", borderColor: "var(--purple-border)" },
    gold: { background: "var(--gold-light)", borderColor: "var(--gold-border)" },
  };
  return map[tone];
}

function InfoList({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-3 space-y-2 text-sm leading-7">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="inline font-extrabold">{label}: </dt>
          <dd className="inline">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-1 text-sm font-semibold leading-7">{value}</p>
    </div>
  );
}
