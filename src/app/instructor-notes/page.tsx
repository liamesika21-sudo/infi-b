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
    <div className="space-y-8">
      <PageHeader
        eyebrow="הערות מקס מהלין — תמלולי תרגול"
        title="תובנות ועצות מהמרצה"
        description={`מחולץ מ-${insights.source}. מה שמקס הדגיש, חזר עליו, ואמר שחשוב למבחן.`}
      />

      {/* Critical exam notes */}
      <section>
        <SectionHeader title="⚠ קריטי למבחן — מה שמקס חזר עליו הכי הרבה" />
        <div className="space-y-3">
          {insights.examCriticalNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--red-border)", background: "var(--red-light)" }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-base">🚨</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {note.text}
                  </p>
                  {note.maxQuote && (
                    <blockquote
                      className="mt-2 border-r-2 pr-3 text-sm italic leading-7"
                      style={{ borderColor: "var(--red)", color: "var(--text-secondary)" }}
                    >
                      מקס: &quot;{note.maxQuote}&quot;
                    </blockquote>
                  )}
                  {note.recitation && (
                    <span className="mt-2 inline-block badge badge-red">תרגול {note.recitation}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Counter-examples */}
      <section>
        <SectionHeader title="📌 דוגמאות נגדיות — עם הסברים מלאים" />
        <div className="space-y-4">
          {insights.counterExamples.map((ce) => (
            <article
              key={ce.id}
              className="rounded-xl border bg-white shadow-sm overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between border-b px-5 py-3"
                style={{
                  borderColor: ce.verdict === "שגוי" ? "var(--red-border)" : "var(--green-border)",
                  background: ce.verdict === "שגוי" ? "var(--red-light)" : "var(--green-light)",
                }}
              >
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {ce.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="badge badge-navy-light">תרגול {ce.recitation} · שבוע {ce.week}</span>
                    <span className="badge badge-muted">{ce.topic}</span>
                  </div>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: ce.verdict === "שגוי" ? "var(--red)" : "var(--green)",
                    color: "white",
                  }}
                >
                  {ce.verdict}
                </span>
              </div>

              <div className="p-5 space-y-3">
                {/* Claim */}
                <div className="rounded-lg p-3" style={{ background: "var(--bg-subtle)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>הטענה</p>
                  <MathContent text={ce.claim} className="text-sm" />
                </div>

                {/* Explanation */}
                {(ce.explanation || ce.proof || ce.counterexampleConstruction) && (
                  <div className="rounded-lg p-3" style={{ background: "var(--navy-light)" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--navy-mid)" }}>
                      {ce.verdict === "שגוי" ? "דוגמה נגדית / הסבר" : "הוכחה / הסבר"}
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
                    className="rounded-lg p-3 font-mono text-sm"
                    style={{ background: "var(--navy)", color: "#e2e8f0" }}
                    dir="ltr"
                  >
                    {ce.formalCounterexample}
                  </div>
                )}

                {/* Why it works */}
                {ce.whyItWorks && (
                  <p className="text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
                    {ce.whyItWorks}
                  </p>
                )}

                {/* Max quote */}
                {ce.maxQuote && (
                  <blockquote
                    className="border-r-2 pr-3 text-sm italic leading-7"
                    style={{ borderColor: "var(--navy-mid)", color: "var(--text-secondary)" }}
                  >
                    מקס: &quot;{ce.maxQuote}&quot;
                  </blockquote>
                )}

                {/* Rule/key */}
                {ce.key && (
                  <StudyCallout variant="exam">
                    {ce.key}
                  </StudyCallout>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Key intuitions */}
      <section>
        <SectionHeader title="💡 אינטואיציות מרכזיות שמקס מדגיש" />
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.intuitions.map((intuition) => (
            <article
              key={intuition.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="badge badge-navy-light">תרגול {intuition.recitation}</span>
                {intuition.topic && <span className="badge badge-muted">{intuition.topic}</span>}
              </div>
              {intuition.title && (
                <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {intuition.title}
                </h3>
              )}
              <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                {intuition.text}
              </p>
              {intuition.formalStatement && (
                <div
                  className="mt-3 rounded-lg p-2.5 font-mono text-xs"
                  style={{ background: "var(--bg-subtle)" }}
                  dir="ltr"
                >
                  {intuition.formalStatement}
                </div>
              )}
              {intuition.maxQuote && (
                <blockquote
                  className="mt-3 border-r-2 pr-3 text-xs italic leading-6"
                  style={{ borderColor: "var(--navy-mid)", color: "var(--text-muted)" }}
                >
                  &quot;{intuition.maxQuote}&quot;
                </blockquote>
              )}
              {intuition.redFlag && (
                <StudyCallout variant="warning" className="mt-3">
                  {intuition.redFlag}
                </StudyCallout>
              )}
              {intuition.examImplication && (
                <StudyCallout variant="exam" className="mt-3">
                  {intuition.examImplication}
                </StudyCallout>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Weekly insights */}
      <section>
        <SectionHeader title="📅 תובנות לפי שבוע" />
        <div className="space-y-4">
          {insights.weeklyInsights.map((week) => (
            <article
              key={week.week}
              className="rounded-xl border bg-white shadow-sm overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center gap-3 border-b px-5 py-3"
                style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--navy)" }}
                >
                  {week.week}
                </span>
                <div>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    שבוע {week.week}
                  </span>
                  <span className="mr-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    תרגול {week.recitation} · {week.topic}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <ul className="space-y-1.5">
                  {week.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--navy-mid)" }} />
                      <MathContent text={insight} className="text-sm" />
                    </li>
                  ))}
                </ul>
                {(week.examTip ?? week.classicExamQuestion ?? week.examCritical ?? week.dangerZone) && (
                  <StudyCallout variant={week.examCritical ? "exam" : week.dangerZone ? "error" : "tip"} className="mt-4">
                    {week.examCritical ?? week.examTip ?? week.classicExamQuestion ?? week.dangerZone}
                  </StudyCallout>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Common mistakes */}
      <section>
        <SectionHeader title="❌ טעויות נפוצות שמקס מזהיר עליהן" />
        <div className="grid gap-3 md:grid-cols-2">
          {insights.commonMistakesFromMax.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--amber-border)", background: "var(--amber-light)" }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-xs shrink-0">⚠</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {m.mistake}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    שבוע {m.week} · מקס: &quot;{m.maxSays}&quot;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
    </div>
  );
}
