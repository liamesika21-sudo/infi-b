import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";
import { MathContent } from "@/components/study/MathContent";

export default async function InstructorNotesPage() {
  const analysis = await readAnalysisData();
  const insights = analysis.maxInsights;

  if (!insights) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="הערות מקס" title="תובנות מהתרגול" />
        <StudyCallout variant="warning">
          לא נמצא קובץ max-insights.json. הריצי npm run generate:simulations.
        </StudyCallout>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Max Mahlin — תמלולי תרגול"
        title="תובנות ועצות מהמרצה"
        description={`מחולץ מ-${insights.source}. מה שמקס הדגיש, חזר עליו, ואמר שחשוב למבחן. המתמטיקה מוצגת כנוסחאות KaTeX.`}
      />

      {/* ── Critical exam notes ── */}
      <section>
        <ColourHeader title="⚠ קריטי למבחן" subtitle="מקס חזר על אלה שוב ושוב" color="red" />
        <div className="mt-4 space-y-3">
          {insights.examCriticalNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border-2 p-5"
              style={{ borderColor: "var(--red-border)", background: "var(--red-light)" }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">🚨</span>
                <div className="flex-1">
                  <p className="font-bold leading-6" style={{ color: "var(--text-primary)" }}>
                    {note.text}
                  </p>
                  {note.recitation && (
                    <span className="mt-2 inline-block badge badge-red">
                      תרגול {note.recitation}
                    </span>
                  )}
                  {note.maxQuote && (
                    <blockquote
                      className="mt-3 border-r-4 pr-3 text-sm italic leading-7"
                      style={{ borderColor: "var(--red-mid)", color: "var(--text-secondary)" }}
                    >
                      מקס: &quot;{note.maxQuote}&quot;
                    </blockquote>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Counter-examples ── */}
      <section>
        <ColourHeader title="📌 דוגמאות נגדיות" subtitle="עם הסברים מלאים וכיוון בנייה" color="navy" />
        <div className="mt-4 space-y-5">
          {insights.counterExamples.map((ce) => {
            const isWrong = ce.verdict === "שגוי";
            return (
              <article
                key={ce.id}
                className="overflow-hidden rounded-xl border-2 bg-white shadow-sm"
                style={{ borderColor: isWrong ? "var(--red-border)" : "var(--green-border)" }}
              >
                {/* Coloured header */}
                <div
                  className={isWrong ? "card-header-red" : "card-header-navy"}
                  style={{ padding: "0.75rem 1.25rem" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">{ce.title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="badge badge-navy-light">{ce.topic}</span>
                        <span className="text-xs opacity-70 text-white">שבוע {ce.week} · תרגול {ce.recitation}</span>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black text-white"
                      style={{ background: isWrong ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.2)" }}
                    >
                      {ce.verdict}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Claim */}
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      הטענה
                    </p>
                    <MathContent text={ce.claim} className="text-sm font-medium" />
                  </div>

                  {/* Explanation / proof */}
                  {(ce.explanation ?? ce.proof ?? ce.counterexampleConstruction) && (
                    <div
                      className="rounded-lg p-4"
                      style={{
                        background: isWrong ? "var(--red-light)" : "var(--green-light)",
                        borderRight: `4px solid ${isWrong ? "var(--red-mid)" : "var(--green-mid)"}`,
                      }}
                    >
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: isWrong ? "var(--red-mid)" : "var(--green-mid)" }}>
                        {isWrong ? "דוגמה נגדית / הסבר" : "הוכחה"}
                      </p>
                      <MathContent
                        text={ce.explanation ?? ce.proof ?? ce.counterexampleConstruction ?? ""}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Formal counterexample */}
                  {ce.formalCounterexample && (
                    <div
                      className="rounded-lg px-4 py-3 font-mono text-sm leading-7"
                      style={{ background: "var(--navy)", color: "#c7d5e8" }}
                      dir="ltr"
                    >
                      {ce.formalCounterexample}
                    </div>
                  )}

                  {/* Why it works */}
                  {ce.whyItWorks && (
                    <p className="text-xs leading-6 italic" style={{ color: "var(--text-secondary)" }}>
                      {ce.whyItWorks}
                    </p>
                  )}

                  {/* Key insight */}
                  {ce.key && (
                    <StudyCallout variant={isWrong ? "exam" : "success"}>
                      {ce.key}
                    </StudyCallout>
                  )}

                  {/* Rule */}
                  {ce.rule && (
                    <StudyCallout variant="info">
                      {ce.rule}
                    </StudyCallout>
                  )}

                  {/* Max quote */}
                  {ce.maxQuote && (
                    <blockquote
                      className="border-r-4 pr-3 text-sm italic leading-7"
                      style={{ borderColor: "var(--navy-mid)", color: "var(--text-secondary)" }}
                    >
                      &quot;{ce.maxQuote}&quot;
                    </blockquote>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Key intuitions ── */}
      <section>
        <ColourHeader title="💡 אינטואיציות מרכזיות" subtitle="מה שמקס אמר שחייבים להפנים" color="teal" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {insights.intuitions.map((intuition) => (
            <article
              key={intuition.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
              style={{ borderColor: "var(--teal-border)" }}
            >
              <div className="card-header-teal px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white opacity-80">
                    תרגול {intuition.recitation}
                  </span>
                  {intuition.topic && (
                    <span className="badge badge-navy-light">{intuition.topic}</span>
                  )}
                </div>
                {intuition.title && (
                  <h3 className="mt-1 text-sm font-bold text-white">{intuition.title}</h3>
                )}
              </div>

              <div className="p-5 space-y-3">
                <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                  {intuition.text}
                </p>

                {intuition.formalStatement && (
                  <div
                    className="rounded-lg px-4 py-3"
                    style={{ background: "var(--navy)", color: "#d4e4f0" }}
                  >
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest opacity-60">נוסחה</p>
                    <div dir="ltr" className="overflow-x-auto">
                      <MathContent text={intuition.formalStatement} />
                    </div>
                  </div>
                )}

                {intuition.orderOfGrowth && (
                  <div
                    className="rounded-lg p-3 text-sm font-mono"
                    style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}
                    dir="ltr"
                  >
                    {intuition.orderOfGrowth}
                  </div>
                )}

                {intuition.maxQuote && (
                  <blockquote
                    className="border-r-4 pr-3 text-xs italic leading-6"
                    style={{ borderColor: "var(--teal)", color: "var(--text-muted)" }}
                  >
                    &quot;{intuition.maxQuote}&quot;
                  </blockquote>
                )}

                {intuition.redFlag && (
                  <StudyCallout variant="warning">{intuition.redFlag}</StudyCallout>
                )}
                {intuition.examImplication && (
                  <StudyCallout variant="exam">{intuition.examImplication}</StudyCallout>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Weekly insights ── */}
      <section>
        <ColourHeader title="📅 תובנות לפי שבוע" subtitle="מה שמקס הדגיש בכל תרגול" color="purple" />
        <div className="mt-4 space-y-3">
          {insights.weeklyInsights.map((week) => (
            <details
              key={week.week}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <summary
                className="card-header-purple flex cursor-pointer list-none items-center gap-3 px-5 py-3"
                style={{ borderRadius: "0.75rem" }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-black text-white">
                  {week.week}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white">שבוע {week.week}</span>
                  <span className="mr-2 text-xs text-white opacity-70">
                    תרגול {week.recitation} · {week.topic}
                  </span>
                </div>
                <span className="text-xs text-white opacity-50">▾</span>
              </summary>

              <div className="p-5">
                <ul className="space-y-2">
                  {week.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: "var(--purple-mid)" }}
                      />
                      <MathContent text={insight} className="text-sm flex-1" />
                    </li>
                  ))}
                </ul>

                {(week.examTip ?? week.classicExamQuestion ?? week.examCritical ?? week.dangerZone) && (
                  <div className="mt-4">
                    <StudyCallout
                      variant={week.examCritical ? "exam" : week.dangerZone ? "error" : "tip"}
                    >
                      <MathContent
                        text={week.examCritical ?? week.examTip ?? week.classicExamQuestion ?? week.dangerZone ?? ""}
                        className="text-sm"
                      />
                    </StudyCallout>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Common mistakes ── */}
      <section>
        <ColourHeader title="❌ טעויות נפוצות" subtitle="שמקס הזהיר עליהן שוב ושוב" color="amber" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {insights.commonMistakesFromMax.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border-2 p-4"
              style={{ borderColor: "var(--amber-border)", background: "var(--amber-light)" }}
            >
              <p className="text-sm font-bold leading-6" style={{ color: "var(--text-primary)" }}>
                ✗ {m.mistake}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                שבוע {m.week}
              </p>
              <blockquote
                className="mt-2 border-r-4 pr-2.5 text-xs italic leading-5"
                style={{ borderColor: "var(--amber-mid)", color: "var(--text-secondary)" }}
              >
                &quot;{m.maxSays}&quot;
              </blockquote>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Helpers ─── */

type HeaderColor = "red" | "navy" | "teal" | "purple" | "amber";

function ColourHeader({ title, subtitle, color }: { title: string; subtitle: string; color: HeaderColor }) {
  const styles: Record<HeaderColor, { border: string; text: string }> = {
    red:    { border: "var(--red-mid)",    text: "var(--red)"    },
    navy:   { border: "var(--navy-mid)",   text: "var(--navy)"   },
    teal:   { border: "var(--teal)",       text: "var(--teal)"   },
    purple: { border: "var(--purple-mid)", text: "var(--purple)" },
    amber:  { border: "var(--amber-mid)",  text: "var(--amber)"  },
  };
  const s = styles[color];
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-1 rounded-full" style={{ background: s.border }} />
      <div>
        <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
