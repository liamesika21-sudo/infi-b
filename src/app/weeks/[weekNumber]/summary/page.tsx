import { notFound } from "next/navigation";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";
import { getWeekSummary, type WeekSummary, type ContentBox, type InferenceArrow } from "@/lib/calculus2/week-summaries";
import type React from "react";

/* ─── Design tokens ─── */
const S = {
  bg:      "#f5f0e8",
  card:    "#ffffff",
  primary: "#1a3a5c",
  red:     "#c0392b",
  green:   "#2e7d32",
  purple:  "#6a1b9a",
  blue:    "#1565c0",
  teal:    "#00695c",
  amber:   "#b45309",
  border:  "#e0d6c8",
  shadow:  "0 2px 12px rgba(0,0,0,0.08)",
};

/* ─── KaTeX helper (server-side) ─── */
function K({ m, d = false }: { m: string; d?: boolean }) {
  let html = "";
  try { html = katex.renderToString(m, { displayMode: d, throwOnError: false }); }
  catch { return <code dir="ltr">{m}</code>; }
  if (d) return <div dir="ltr" className="text-center my-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
  return <span dir="ltr" style={{ display: "inline-block", unicodeBidi: "isolate", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* Split a string on $…$ and $$…$$ and render inline/block KaTeX */
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Block math $$…$$
    const blockIdx = remaining.indexOf("$$");
    // Inline math $…$
    const inlineIdx = remaining.indexOf("$");

    if (inlineIdx === -1) {
      parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: remaining.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }} />);
      break;
    }

    // Text before first $
    if (inlineIdx > 0) {
      const before = remaining.slice(0, inlineIdx);
      parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: before.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }} />);
      remaining = remaining.slice(inlineIdx);
      continue;
    }

    // Check if it's $$block$$
    if (remaining.startsWith("$$")) {
      const end = remaining.indexOf("$$", 2);
      if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
      const math = remaining.slice(2, end);
      parts.push(<K key={key++} m={math} d />);
      remaining = remaining.slice(end + 2);
      continue;
    }

    // $inline$
    const end = remaining.indexOf("$", 1);
    if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
    const math = remaining.slice(1, end);
    parts.push(<K key={key++} m={math} />);
    remaining = remaining.slice(end + 1);
  }

  return <>{parts}</>;
}

/* ─── Card components ─── */
function ThmBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#f0f4fe", borderRight: `4px solid ${S.blue}`, borderRadius: 8, padding: "14px 18px", margin: "12px 0" }}>
      <div style={{ color: S.blue, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
function DefBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fef9f0", borderRight: `4px solid ${S.red}`, borderRadius: 8, padding: "14px 18px", margin: "12px 0" }}>
      <div style={{ color: S.red, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
function NoteBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#faf0fa", borderRight: `4px solid ${S.purple}`, borderRadius: 8, padding: "14px 18px", margin: "12px 0" }}>
      <div style={{ color: S.purple, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
function ExBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#f2f9f2", borderRight: `4px solid ${S.green}`, borderRadius: 8, padding: "14px 18px", margin: "12px 0" }}>
      <div style={{ color: S.green, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
function MaxBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#e8f5e9", borderRight: `4px solid ${S.teal}`, borderRadius: 8, padding: "12px 16px", margin: "10px 0" }}>
      <div style={{ color: S.teal, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: 4 }}>מקס אמר ←</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
function QBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff8e1", borderRight: `4px solid #f9a825`, borderRadius: 8, padding: "10px 14px", margin: "6px 0", fontSize: "0.92rem" }}>
      {children}
    </div>
  );
}
function WarnBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff3f3", borderRight: `4px solid ${S.red}`, borderRadius: 8, padding: "10px 14px", margin: "8px 0" }}>
      <div style={{ color: S.red, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", marginBottom: 4 }}>⚠ {label}</div>
      <div style={{ lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}

/* ─── Section header ─── */
function SubSection({ title, color = S.primary, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color, fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, paddingRight: 10, borderRight: `3px solid ${color}` }}>{title}</h3>
      {children}
    </div>
  );
}

/* ─── Inference arrow ─── */
function InferArrow({ from, to, label }: InferenceArrow) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
      <div style={{ background: "#e8f0fe", padding: "7px 14px", borderRadius: 8, fontSize: "0.88rem", lineHeight: 1.5 }}>
        <RichText text={from} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {label && <span style={{ fontSize: 11, color: "#888" }}>{label}</span>}
        <span style={{ color: S.green, fontSize: 20 }}>←</span>
      </div>
      <div style={{ background: "#e8f0fe", padding: "7px 14px", borderRadius: 8, fontSize: "0.88rem", lineHeight: 1.5 }}>
        <RichText text={to} />
      </div>
    </div>
  );
}

/* ─── Render a ContentBox (def or thm) ─── */
function ContentBoxCard({ box }: { box: ContentBox }) {
  const body = <RichText text={box.body} />;
  if (box.kind === "def") return <DefBox label={`הגדרה: ${box.title}`}>{body}</DefBox>;
  if (box.kind === "note") return <NoteBox label={box.title}>{body}</NoteBox>;
  if (box.kind === "ex")   return <ExBox label={box.title}>{body}</ExBox>;
  if (box.kind === "warn") return <WarnBox label={box.title}>{body}</WarnBox>;
  return <ThmBox label={`משפט: ${box.title}`}>{body}</ThmBox>;
}

/* ══════════════════════════════════════════════
   Main page
══════════════════════════════════════════════ */
interface Props {
  params: Promise<{ weekNumber: string }>;
}

export default async function WeekSummaryPage({ params }: Props) {
  const { weekNumber: weekParam } = await params;
  const weekNum = parseInt(weekParam, 10);
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 13) notFound();

  const data = getWeekSummary(weekNum);
  if (!data) notFound();

  return (
    <div
      dir="rtl"
      style={{
        background: S.bg,
        minHeight: "100vh",
        fontFamily: "'Noto Sans Hebrew', 'Segoe UI', sans-serif",
        color: "#2c2c2c",
        lineHeight: 1.8,
        margin: "-24px -16px",
        padding: "0 0 40px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 16, fontSize: "0.85rem", color: "#666" }}>
          <Link href="/weeks" style={{ color: S.primary, textDecoration: "none" }}>שבועות</Link>
          {" / "}
          <Link href={`/weeks/${weekNum}`} style={{ color: S.primary, textDecoration: "none" }}>שבוע {weekNum}</Link>
          {" / "}
          <span>סיכום</span>
        </div>

        {/* Page header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${S.primary}, #2c5f8a)`,
            color: "#fff",
            padding: "36px 40px",
            borderRadius: 12,
            marginBottom: 28,
            textAlign: "center",
            boxShadow: S.shadow,
          }}
        >
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 20px", borderRadius: 20, fontSize: "0.85rem", marginBottom: 10 }}>
            אינפי ב׳ · מועד א׳ 2026 · יעד 90+
          </div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "2px 14px", borderRadius: 20, fontSize: "0.8rem", marginRight: 8 }}>
            שבוע {weekNum}
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 900, margin: "8px 0 6px" }}>
            {data.title}
          </h1>
          <div style={{ opacity: 0.85, fontSize: "0.95rem", fontWeight: 300 }}>
            {data.mainGoal}
          </div>
        </div>

        {/* ─── Section 1: Before you start ─── */}
        <SummaryCard>
          <SubSection title="🚀 לפני שמתחילים" color={S.red}>
            <NoteBox label="מטרת השבוע">
              <RichText text={data.mainGoal} />
            </NoteBox>

            {data.prereqs.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, color: S.primary, marginBottom: 6 }}>דרישות קדם — מה חייבים לדעת לפני:</div>
                <ul style={{ margin: 0, paddingRight: 20 }}>
                  {data.prereqs.map((p, i) => (
                    <li key={i} style={{ marginBottom: 4 }}><RichText text={p} /></li>
                  ))}
                </ul>
              </div>
            )}

            {data.buildOn && (
              <div style={{ marginTop: 12, fontSize: "0.9rem", color: "#555", fontStyle: "italic" }}>
                <strong>קשר לחומר קודם:</strong> <RichText text={data.buildOn} />
              </div>
            )}
          </SubSection>
        </SummaryCard>

        {/* ─── Section 2: Study guide ─── */}
        <SummaryCard>
          <SubSection title="📋 מדריך לימוד" color={S.teal}>
            {data.quickTip && (
              <MaxBox><RichText text={`💡 טיפ מהיר: ${data.quickTip}`} /></MaxBox>
            )}

            {data.mustMemorize.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: S.green, marginBottom: 6 }}>✅ חובה לשנן:</div>
                <ul style={{ margin: 0, paddingRight: 20 }}>
                  {data.mustMemorize.map((m, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><RichText text={m} /></li>
                  ))}
                </ul>
              </div>
            )}

            {data.studySteps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: S.blue, marginBottom: 8 }}>📖 סדר לימוד מומלץ:</div>
                <ol style={{ margin: 0, paddingRight: 22 }}>
                  {data.studySteps.map((s, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><RichText text={s} /></li>
                  ))}
                </ol>
              </div>
            )}

            {data.commonMistakes.length > 0 && (
              <WarnBox label="טעויות נפוצות">
                <ul style={{ margin: 0, paddingRight: 20 }}>
                  {data.commonMistakes.map((m, i) => (
                    <li key={i} style={{ marginBottom: 4 }}><RichText text={m} /></li>
                  ))}
                </ul>
              </WarnBox>
            )}
          </SubSection>
        </SummaryCard>

        {/* ─── Section 3: Inference diagram ─── */}
        {data.inferences.length > 0 && (
          <SummaryCard>
            <SubSection title="🔗 מה ההגדרות / המשפטים מאפשרים להסיק" color={S.blue}>
              <div style={{ marginBottom: 8, fontSize: "0.85rem", color: "#666" }}>
                כל חץ מראה: אם מתקיים ה<strong>שמאלי</strong>, ניתן להסיק את ה<strong>ימני</strong>
              </div>
              {data.inferences.map((inf, i) => (
                <InferArrow key={i} {...inf} />
              ))}
              {data.importantNote && (
                <NoteBox label={data.importantNote.title}>
                  <RichText text={data.importantNote.body} />
                </NoteBox>
              )}
            </SubSection>
          </SummaryCard>
        )}

        {/* ─── Section 4: Definitions ─── */}
        {data.definitions.length > 0 && (
          <SummaryCard>
            <SubSection title="📖 הגדרות מהשבוע" color={S.red}>
              {data.definitions.map((d, i) => (
                <ContentBoxCard key={i} box={d} />
              ))}
            </SubSection>
          </SummaryCard>
        )}

        {/* ─── Section 5: Theorems ─── */}
        {data.theorems.length > 0 && (
          <SummaryCard>
            <SubSection title="📐 משפטים מרכזיים" color={S.blue}>
              {data.theorems.map((t, i) => (
                <ContentBoxCard key={i} box={t} />
              ))}
            </SubSection>
          </SummaryCard>
        )}

        {/* ─── Section 6 & 7: Recitation ─── */}
        {(data.maxSays.length > 0 || data.practiceQuestions.length > 0) && (
          <SummaryCard>
            {data.maxSays.length > 0 && (
              <SubSection title="💡 דברים חשובים שעלו בתרגול — מסקנות מקס" color={S.teal}>
                {data.maxSays.map((m, i) => (
                  <MaxBox key={i}><RichText text={m} /></MaxBox>
                ))}
              </SubSection>
            )}

            {data.practiceQuestions.length > 0 && (
              <SubSection title="❓ שאלות חשובות לתרגול" color="#f9a825">
                {data.practiceQuestions.map((q, i) => (
                  <QBox key={i}><RichText text={q} /></QBox>
                ))}
              </SubSection>
            )}
          </SummaryCard>
        )}

        {/* ─── Navigation ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          {weekNum > 1 ? (
            <Link
              href={`/weeks/${weekNum - 1}/summary`}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: "10px 18px", fontSize: "0.9rem", color: S.primary, textDecoration: "none", fontWeight: 600 }}
            >
              ← שבוע {weekNum - 1}
            </Link>
          ) : <div />}
          <Link
            href={`/weeks/${weekNum}`}
            style={{ background: S.primary, color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: "0.9rem", textDecoration: "none", fontWeight: 600 }}
          >
            לדף השבוע המלא
          </Link>
          {weekNum < 13 ? (
            <Link
              href={`/weeks/${weekNum + 1}/summary`}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: "10px 18px", fontSize: "0.9rem", color: S.primary, textDecoration: "none", fontWeight: 600 }}
            >
              שבוע {weekNum + 1} →
            </Link>
          ) : <div />}
        </div>

        <div style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", padding: "20px 0 0" }}>
          אינפי ב׳ — מועד א׳ · 01.07.2026 · יעד 90+ · Max Mahlin
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: S.card, borderRadius: 12, padding: "24px 28px", marginBottom: 20, boxShadow: S.shadow }}>
      {children}
    </div>
  );
}
