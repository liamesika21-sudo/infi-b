import katex from "katex";
import "katex/dist/katex.min.css";
import Link from "next/link";
import QuizPrepSidebar from "@/components/QuizPrepSidebar";

export const metadata = { title: "הכנה לבוחן 3 — טורים | Mentora" };

/* ── KaTeX helpers ───────────────────────────────────────────── */
function K({ m, d = false }: { m: string; d?: boolean }) {
  let html = "";
  try { html = katex.renderToString(m, { displayMode: d, throwOnError: false }); }
  catch { return <code dir="ltr">{m}</code>; }
  if (d) return (
    <div dir="ltr" className="my-3 overflow-x-auto text-center py-1"
      dangerouslySetInnerHTML={{ __html: html }} />
  );
  return (
    <span dir="ltr" style={{ display: "inline-block", unicodeBidi: "isolate", verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/* ── Design tokens ───────────────────────────────────────────── */
const C = {
  pageBg:   "#f8f6f2",
  card:     "#ffffff",
  border:   "#e5e0d8",
  navy:     "#1e3a5f",
  navyBg:   "#eef2f8",
  navyBd:   "#c7d4e8",
  blue:     "#1d4ed8",
  blueBg:   "#eff6ff",
  blueBd:   "#bfdbfe",
  green:    "#15803d",
  greenBg:  "#f0fdf4",
  greenBd:  "#bbf7d0",
  amber:    "#b45309",
  amberBg:  "#fffbeb",
  amberBd:  "#fde68a",
  red:      "#b91c1c",
  redBg:    "#fef2f2",
  redBd:    "#fecaca",
  purple:   "#6d28d9",
  purpleBg: "#f5f3ff",
  purpleBd: "#ddd6fe",
  muted:    "#6b7280",
  text:     "#111827",
  shadow:   "0 2px 8px rgba(0,0,0,0.07)",
};

/* ── Reusable components ─────────────────────────────────────── */
function SectionTitle({ children, color = C.navy }: { children: React.ReactNode; color?: string }) {
  return (
    <h2 style={{ color, fontSize: "1.35rem", fontWeight: 900, marginBottom: "1rem",
      paddingBottom: "0.5rem", borderBottom: `2px solid ${color}22` }}>
      {children}
    </h2>
  );
}

function TheoremCard({ title, accent = C.navy, id, children }: {
  title: React.ReactNode; accent?: string; id?: string; children: React.ReactNode;
}) {
  return (
    <div id={id} style={{
      background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
      borderRight: `5px solid ${accent}`, boxShadow: C.shadow,
      marginBottom: "1.25rem", overflow: "hidden",
    }}>
      <div style={{ padding: "10px 18px", background: "#fafaf9",
        borderBottom: `1px solid ${C.border}`, fontWeight: 800,
        fontSize: "1rem", color: accent }}>
        {title}
      </div>
      <div style={{ padding: "14px 18px 16px", fontSize: "0.92rem",
        lineHeight: 1.85, color: C.text }}>
        {children}
      </div>
    </div>
  );
}

function Proof({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem",
      borderTop: `1px dashed ${C.border}` }}>
      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: C.muted,
        textTransform: "uppercase", letterSpacing: "0.08em" }}>הוכחה ✱</span>
      <div style={{ marginTop: "0.4rem" }}>{children}</div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start",
      marginBottom: "0.5rem" }}>
      <span style={{ background: C.navy, color: "#fff", borderRadius: "50%",
        width: 22, height: 22, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "0.7rem", fontWeight: 800,
        flexShrink: 0, marginTop: 3 }}>{n}</span>
      <div style={{ flex: 1, lineHeight: 1.8 }}>{text}</div>
    </div>
  );
}

function HWTable({ rows }: { rows: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode][] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.87rem" }}>
        <thead>
          <tr style={{ background: C.navyBg }}>
            {["שאלה", "הבעיה", "שיטה", "תוצאה"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "right",
                fontWeight: 800, color: C.navy, borderBottom: `2px solid ${C.navyBd}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([q, prob, method, res], i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}`,
              background: i % 2 === 0 ? "#fff" : "#fafaf9" }}>
              <td style={{ padding: "8px 12px", fontWeight: 700, color: C.navy,
                whiteSpace: "nowrap" }}>{q}</td>
              <td style={{ padding: "8px 12px" }}>{prob}</td>
              <td style={{ padding: "8px 12px", color: C.muted }}>{method}</td>
              <td style={{ padding: "8px 12px" }}>
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: 6,
                  fontSize: "0.8rem", fontWeight: 700,
                  background: C.navyBg, color: C.navy, border: `1px solid ${C.navyBd}`,
                }}>{res}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tag({ children, color = C.blue, bg = C.blueBg, bd = C.blueBd }: {
  children: React.ReactNode; color?: string; bg?: string; bd?: string;
}) {
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 6,
      fontSize: "0.75rem", fontWeight: 700, background: bg, color, border: `1px solid ${bd}`,
      marginLeft: "0.35rem" }}>
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function QuizPrepPage() {
  return (
    <div dir="rtl" style={{ background: C.pageBg, minHeight: "100vh",
      padding: "0 0 3rem", fontFamily: "var(--font-heebo, sans-serif)" }}>

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, #2d5a9e 100%)`,
        padding: "2rem 1.5rem 1.75rem", marginBottom: "2rem",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Link href="/battle-plan" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            color: "rgba(255,255,255,0.75)", textDecoration: "none",
            fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem",
            padding: "4px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            ← חזרה לתכנית הקרב
          </Link>
          <p style={{ fontSize: "0.7rem", fontWeight: 900, color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>
            Mentora · הכנה לבוחן
          </p>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#fff",
            lineHeight: 1.2, marginBottom: "0.5rem" }}>
            דף הכנה לבוחן 3
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
            טורים ושיטות התכנסות · משפטים + הוכחות + מ"ב 6, 7, 8 + שאלות לתרגול
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            {["11 משפטים", "מ\"ב 6+7+8", "4 שאלות תרגול", "נקודות מרכזיות"].map(t => (
              <span key={t} style={{
                padding: "3px 10px", borderRadius: 20,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontSize: "0.75rem", fontWeight: 700, color: "#fff",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 1rem", display: "flex", flexDirection: "row", gap: "1.5rem", alignItems: "flex-start" }}>
        <QuizPrepSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

        {/* ══════════════════════════════════════════════════════
            PART A — THEOREMS
        ══════════════════════════════════════════════════════ */}
        <div id="part-a">
        <SectionTitle color={C.navy}>חלק א׳ — כל המשפטים עם הוכחות מילה במילה</SectionTitle>

        {/* 1. תנאי הכרחי */}
        <TheoremCard id="thm-necessary" title="משפט 5 — תנאי הכרחי" accent={C.navy}>
          <strong>משפט:</strong> יהי <K m="(a_n)_{n=k}^\infty" /> סדרה. אם{" "}
          <K m="\sum_{n=k}^\infty a_n < \infty" /> אזי <K m="\lim_{n\to\infty} a_n = 0" />.
          <Proof>
            <K d m="\lim_{n\to\infty} a_n = \lim_{N\to\infty}\!\left(\sum_{n=k}^N a_n - \sum_{n=k}^{N-1} a_n\right) = S - S = 0 \quad \checkmark" />
          </Proof>
        </TheoremCard>

        {/* 2. השוואה ישיר */}
        <TheoremCard id="thm-compare-direct" title="משפט 6 — השוואה ישיר" accent={C.blue}>
          <strong>משפט:</strong> יהיו <K m="(a_n),(b_n)" /> סדרות כך ש{" "}
          <K m="0 \le a_n \le b_n" /> לכל <K m="n \ge k" />.
          אם <K m="\sum b_n < \infty" /> אזי <K m="\sum a_n < \infty" />.
          <Proof>
            <Step n={1} text={<>נסמן <K m="S_N^a = \sum_{n=k}^N a_n" />. מאחר ש <K m="a_n \ge 0" />, <K m="(S_N^a)" /> עולה.</>} />
            <Step n={2} text={<>מאחר ש <K m="a_n \le b_n" />:<K d m="S_N^a \le \sum_{n=k}^N b_n \le \sum_{n=k}^\infty b_n < \infty" /></>} />
            <Step n={3} text={<><K m="(S_N^a)" /> עולה וחסומה מעל ← <K m="\sum a_n < \infty" />. ✓</>} />
          </Proof>
        </TheoremCard>

        {/* 3. השוואה גבולי */}
        <TheoremCard id="thm-compare-limit" title="משפט 6′ — השוואה גבולי" accent={C.blue}>
          <strong>משפט:</strong> יהיו <K m="(a_n),(b_n)" /> חיוביות, <K m="L = \lim \frac{a_n}{b_n} \in (0,\infty)" />.
          אזי <K m="\sum a_n < \infty" /> אמ"מ <K m="\sum b_n < \infty" />.
          <Proof>
            <div style={{ marginBottom: "0.3rem" }}>
              <Tag color={C.green} bg={C.greenBg} bd={C.greenBd}>⟸ נניח <K m="\sum b_n{<}\infty" /></Tag>
            </div>
            קח <K m="\epsilon = L/2" />. קיים <K m="N" /> כך שלכל <K m="n \ge N" />:{" "}
            <K m="\frac{a_n}{b_n} < L + \frac{L}{2} = \frac{3L}{2}" />, כלומר <K m="a_n < \frac{3L}{2} b_n" />.
            לפי משפט 6: <K m="\sum a_n < \frac{3L}{2}\sum b_n < \infty" />. ✓
            <br /><br />
            <Tag color={C.amber} bg={C.amberBg} bd={C.amberBd}>⟹ נניח <K m="\sum a_n{<}\infty" /></Tag>
            {" "}קח <K m="\epsilon=1" />. לכל <K m="n" /> גדול: <K m="\frac{a_n}{b_n} > L-1 > 0" />,
            כלומר <K m="b_n < \frac{a_n}{L-1}" />. לפי משפט 6: <K m="\sum b_n < \infty" />. ✓
          </Proof>
        </TheoremCard>

        {/* 4. שורש גרסה 1 */}
        <TheoremCard id="thm-root-1a" title="נוסחת צבר 1, גרסה 1 — שורש ישיר" accent={C.green}>
          <strong>משפט:</strong> יהי <K m="(a_n)" /> עם <K m="a_n \ge 0" />. נניח שקיים <K m="0 \le q < 1" /> ו{" "}
          <K m="N \in \mathbb{N}" /> כך שלכל <K m="n \ge N" />: <K m="\sqrt[n]{a_n} \le q" />.
          אזי <K m="\sum a_n < \infty" />.
          <Proof>
            לכל <K m="n \ge N" />: <K m="a_n \le q^n" />. מאחר ש <K m="0 \le q < 1" />:{" "}
            <K m="\sum_{n=N}^\infty q^n < \infty" /> (הנדסי). לפי משפט 6: <K m="\sum a_n < \infty" />. ✓
          </Proof>
        </TheoremCard>

        {/* 5. מבחן השורש */}
        <TheoremCard id="thm-root-1b" title="נוסחת צבר 1, גרסה 2 — מבחן השורש" accent={C.green}>
          <strong>משפט:</strong> יהי <K m="L = \lim_{n\to\infty} \sqrt[n]{a_n}" /> קיים עם <K m="0 \le L < 1" />.
          אזי <K m="\sum a_n < \infty" />.
          <Proof>
            נסמן <K m="q = \frac{1+L}{2}" />. מאחר ש <K m="0 \le L < 1" />: <K m="L < q < 1" />.
            קיים <K m="N_1" /> כך שלכל <K m="n \ge N_1" />: <K m="\sqrt[n]{a_n} < q" />.
            לפי גרסה 1: <K m="\sum a_n < \infty" />. ✓
          </Proof>
        </TheoremCard>

        {/* 6. מנה השוואה */}
        <TheoremCard title="נוסחת צבר 2 — גרסת השוואה (מנה)" accent={C.purple}>
          <strong>משפט:</strong> יהיו <K m="(a_n),(b_n)" /> חיוביות. נניח שלכל <K m="n \ge N" />:{" "}
          <K m="\frac{a_{n+1}}{a_n} \le \frac{b_{n+1}}{b_n}" />.
          אם <K m="\sum b_n < \infty" /> אזי <K m="\sum a_n < \infty" />.
          <Proof>
            לכל <K m="n \ge N" />, בטלסקופ:{" "}
            <K m="\frac{a_n}{b_n} \le \frac{a_{n-1}}{b_{n-1}} \le \cdots \le \frac{a_N}{b_N} =: C" />.
            לכן <K m="a_n \le C \cdot b_n" />. לפי משפט 6: <K m="\sum a_n < \infty" />. ✓
          </Proof>
        </TheoremCard>

        {/* 7. מבחן המנה */}
        <TheoremCard title="נוסחת צבר 2, גרסה 2 — מבחן המנה ✱" accent={C.purple}>
          <strong>משפט:</strong> יהי <K m="L = \lim_{n\to\infty} \frac{a_{n+1}}{a_n}" /> קיים עם <K m="0 \le L < 1" />.
          אזי <K m="\sum a_n < \infty" />.
          <Proof>
            <Step n={1} text={<>נסמן <K m="q = \frac{1+L}{2}" />. מאחר ש <K m="0 \le L < 1" />: <K m="0 \le q < 1" />.</>} />
            <Step n={2} text={<>
              מאחר ש <K m="L = \lim \frac{a_{n+1}}{a_n}" />, קיים <K m="N_1 \in \mathbb{N}" /> כך שלכל <K m="n \ge N_1" />:
              <K d m="\left|\frac{a_{n+1}}{a_n} - L\right| < \boxed{\dfrac{1+L}{2}}" />
            </>} />
            <Step n={3} text={<>לכן <K m="\frac{a_{n+1}}{a_n} \le L + \frac{1+L}{2} = q = \frac{b_{n+1}}{b_n}" /> עבור <K m="b_n = q^n" />.</>} />
            <Step n={4} text={<>מאחר ש <K m="0 \le q < 1" />: <K m="\sum q^n < \infty" />. לפי נוסחת צבר 2 (השוואה): <K m="\sum a_n < \infty" />. ✓</>} />
          </Proof>
        </TheoremCard>

        {/* 8. שורש התבדרות */}
        <TheoremCard title="משפט 3 — שורש, גרסת התבדרות ✱" accent={C.red}>
          <strong>משפט:</strong> יהי <K m="L = \lim_{n\to\infty} \sqrt[n]{a_n} > 1" />.
          אזי <K m="\lim a_n \ne 0" /> — הטור מתבדר.
          <Proof>
            <Step n={1} text={<>מאחר ש <K m="L > 1" /> — <strong>חיוני</strong>. קיים <K m="N_1" /> כך שלכל <K m="n \ge N_1" />:<K d m="\left|\sqrt[n]{a_n} - L\right| < \boxed{L-1}" /></>} />
            <Step n={2} text={<>לכן <K m="\sqrt[n]{a_n} \ge L-(L-1) = 1" />, ולכן <K m="a_n \ge 1" /> לכל <K m="n \ge N_1" />.</>} />
            <Step n={3} text={<>לפי מונוטוניות גבולים: <K m="\lim a_n \ge 1 \ne 0" />. הטור מתבדר. ✓</>} />
          </Proof>
        </TheoremCard>

        {/* 9. מבחן האינטגרל */}
        <TheoremCard title="משפט 5 — מבחן האינטגרל ✱" accent={C.amber}>
          <strong>משפט:</strong> תהי <K m="f" /> על <K m="[k,\infty)" />, יורדת, <K m="\lim_{x\to\infty} f(x)=0" />.
          אזי <K m="\sum_{n=k}^\infty f(n) < \infty" /> אמ"מ <K m="\int_k^\infty f(x)\,dx < \infty" />.
          יתרה מזו:
          <K d m="\int_k^\infty f(x)\,dx \;\le\; \sum_{n=k}^\infty f(n) \;\le\; f(k)+\int_k^\infty f(x)\,dx" />
          <Proof>
            <div style={{ marginBottom: "0.4rem" }}>
              ראשית, <K m="f" /> יורדת ו<K m="\lim f=0" /> ← <K m="\inf f = 0" /> ← <K m="f(x) \ge 0" />.
            </div>
            <Tag color={C.green} bg={C.greenBg} bd={C.greenBd}>⟸ נניח <K m="\sum f(n){<}\infty" /></Tag>
            <div style={{ marginTop: "0.4rem", marginBottom: "0.6rem" }}>
              יהי <K m="S = \sum f(n)" />. הגדר <K m="F(x)=\int_k^x f(t)\,dt" />. <K m="F" /> עולה.
              עבור <K m="N=\lfloor x\rfloor" />:
              <K d m="F(x) \le F(N) = \int_k^{k+1} f + \cdots + \int_{N-1}^N f \le \sum_{n=k}^{N-1} f(n) \le S" />
              <K m="F" /> עולה וחסומה ← <K m="\int_k^\infty f = \lim F \le S" />. ✓
            </div>
            <Tag color={C.amber} bg={C.amberBg} bd={C.amberBd}>⟹ נניח <K m="\int_k^\infty f{<}\infty" /></Tag>
            <div style={{ marginTop: "0.4rem" }}>
              יהי <K m="S=\int_k^\infty f" />. לכל <K m="N \ge k" />:
              <K d m="S_N = \sum_{n=k}^N f(n) \le f(k) + \int_k^N f \le f(k) + S" />
              <K m="(S_N)" /> עולה וחסומה ← <K m="\sum f(n) = \sup\{S_N\} \le f(k)+S" />. ✓
            </div>
          </Proof>
        </TheoremCard>

        {/* 10. התכנסות מוחלטת */}
        <TheoremCard title="משפט 1 — מבחן ההתכנסות המוחלטת" accent={C.green}>
          <strong>משפט:</strong> אם <K m="\sum |a_n| < \infty" /> אזי <K m="\sum a_n < \infty" />.
          <Proof>
            <Step n={1} text={<>הגדר <K m="b_n = |a_n| - a_n" />. מאחר ש <K m="|x| \ge x" /> ו<K m="|x| \ge -x" />:<K d m="0 \le b_n = |a_n|-a_n \le 2|a_n|" /></>} />
            <Step n={2} text={<>לפי מבחן ההשוואה: <K m="\sum b_n \le 2\sum|a_n| < \infty" />.</>} />
            <Step n={3} text={<><K m="\sum a_n = \sum(|a_n|-b_n) = \sum|a_n| - \sum b_n = \text{מתכנס} - \text{מתכנס}" />. ✓</>} />
          </Proof>
        </TheoremCard>

        {/* 11. לייבניץ */}
        <TheoremCard title="משפט 2 — מבחן לייבניץ ✱" accent={C.navy}>
          <strong>משפט:</strong> נניח ש<K m="(a_n)" /> יורדת, <K m="\lim a_n = 0" />.
          אזי <K m="\sum_{n=1}^\infty (-1)^{n+1}a_n = S \in \mathbb{R}" /> ו<K m="a_1-a_2 \le S \le a_1" />.
          <Proof>
            <Step n={1} text={<>
              <K m="S_{2N} = a_1-a_2+a_3-\cdots+a_{2N-1}-a_{2N}" />
            </>} />
            <Step n={2} text={<>
              <K m="S_{2(N+1)}-S_{2N} = a_{2N+1}-a_{2N+2} \ge 0" /> ← <K m="(S_{2N})" /> עולה.
            </>} />
            <Step n={3} text={<>
              <K m="S_{2N} = a_1-(a_2-a_3)-\cdots-a_{2N} \le a_1" />
              {" "}(✱ <K m="a_{2N}\ge 0" /> כי <K m="\inf a_n = 0" />).
            </>} />
            <Step n={4} text={<>
              <K m="(S_{2N})" /> עולה וחסומה ← <K m="S = \lim S_{2N} = \sup\{S_{2N}\}" /> קיים, <K m="a_1-a_2 \le S \le a_1" />.
            </>} />
            <Step n={5} text={<>
              <K m="\lim S_{2N-1} = \lim[S_{2N}+a_{2N}] \stackrel{(**)}{=} S+0 = S" />{" "}
              (<K m="\lim a_{2N}=0" />). לכן <K m="\lim S_N = S" />. ✓
            </>} />
          </Proof>
        </TheoremCard>

        {/* ══════════════════════════════════════════════════════
            PART B — HOMEWORK ANALYSIS
        ══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "2.5rem" }}>
          <SectionTitle color="#7c3aed">חלק ב׳ — ניתוח שיעורי בית 6, 7, 8</SectionTitle>

          {/* HW 6 */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
            boxShadow: C.shadow, marginBottom: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "10px 18px", background: C.navyBg,
              borderBottom: `1px solid ${C.navyBd}`, fontWeight: 800,
              fontSize: "1rem", color: C.navy }}>
              📘 שיעורי בית 6 — נושאים: השוואה, טלסקופ, טורים הנדסיים
            </div>
            <div style={{ padding: "14px 18px 16px" }}>
              <HWTable rows={[
                ["1(a)", <><K m="\sum_{n=0}^\infty \frac{(-1)^n \cdot 2^{2n+1}+(-1)^n}{5^n}" /></>, "פיצול + הנדסי", "מתכנס = 85/36"],
                ["1(b)", <><K m="\sum \cosh(1/n)" /></>, "תנאי הכרחי (lim=1)", "מתבדר"],
                ["1(c)", <><K m="\sum \frac{n^2-1}{n^3}" /></>, "השוואה גבולי vs 1/n", "מתבדר"],
                ["1(d)", <><K m="\sum \ln\frac{2n+3}{2n+1}" /></>, "טלסקופ → ∞", "מתבדר"],
                ["1(e)", <><K m="\sum [\arcsin\frac{1}{\sqrt{n+1}}-\arcsin\frac{1}{\sqrt{n}}]" /></>, "טלסקופ", "מתכנס = −π/2"],
                ["2(a)", <><K m="\sum 1/\ln n" /></>, "1/ln n ≥ 1/n, השוואה ישיר", "מתבדר"],
                ["2(b)", <><K m="\sum (\sqrt{n+2}-\sqrt{n})^3" /></>, "גבולי vs 1/n^{3/2}, L=1", "מתכנס"],
                ["2(c)", <><K m="\sum 1/((n+e)^n-e^n)" /></>, "ישיר vs 1/eⁿ", "מתכנס"],
                ["4", "b_n=±a_k — הכמ ← lim bn=0", "S₂N=0, S₂N−1 → 0", "מתכנס"],
                ["5", "bn = a·aₙ+b·aₙ₊₁+c·aₙ₊₂, a+b+c=0", "טלסקופ", "מתכנס"],
              ]} />
            </div>
          </div>

          {/* HW 7 */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
            boxShadow: C.shadow, marginBottom: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "10px 18px", background: C.purpleBg,
              borderBottom: `1px solid ${C.purpleBd}`, fontWeight: 800,
              fontSize: "1rem", color: C.purple }}>
              📗 שיעורי בית 7 — נושאים: מבחן המנה, מבחן השורש, מבחן האינטגרל
            </div>
            <div style={{ padding: "14px 18px 16px" }}>
              <HWTable rows={[
                ["1(a)", <><K m="\sum \frac{4^{3n}(n!)^2}{(2n+1)^{2n}}" /></>, <>מנה: <K m="L=16/e^2>1" /></>, "מתבדר"],
                ["1(b)", <><K m="\sum \frac{2\cdot4\cdots2n}{n^n}" /></>, <>מנה: <K m="L=2/e<1" /></>, "מתכנס"],
                ["1(c)", <><K m="\sum \frac{(n!)^2}{2\cdot4\cdots(4n)}" /></>, <>מנה: <K m="L=1/16<1" /></>, "מתכנס"],
                ["1(d)", <><K m="\sum [n^{2n}(1-\cos\tfrac{1}{n})^n]" /></>, <>שורש: <K m="L=1/2<1" /></>, "מתכנס"],
                ["1(e)", <><K m="\sum n^{\sqrt{n^2}}a^n/n^{1.5}" /></>, <>שורש: <K m="L=a" /></>, "מתכנס אמ\"מ a<1"],
                ["2", <><K m="\sum_{n=3}^\infty \frac{1}{n\ln n\cdot\ln\ln n\cdot[\ln\ln\ln n]^p}" /></>, "אינטגרל חוזר", "מתכנס אמ\"מ p>1"],
                ["3", "קבוע אוילר — T_N = Σ1/n − ln N", "יורדת + חסומה מ-0", "γ = lim T_N קיים"],
                ["4(a)", "lim n·aₙ=0 ⟹ Σaₙ<∞?", <>דוגמא נגדית: <K m="a_n=1/(n\ln n)" /></>, "שקר!"],
                ["4(b)", "aₙ₊₁/aₙ ≤ n²/(n+1)²", <>נוסחת צבר 2 vs <K m="b_n=1/n^2" /></>, "מתכנס ✓"],
              ]} />
            </div>
          </div>

          {/* HW 8 */}
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
            boxShadow: C.shadow, marginBottom: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "10px 18px", background: C.amberBg,
              borderBottom: `1px solid ${C.amberBd}`, fontWeight: 800,
              fontSize: "1rem", color: C.amber }}>
              📙 שיעורי בית 8 — נושאים: התכנסות מוחלטת/מותנית, לייבניץ, הסדרה המתחלפת
            </div>
            <div style={{ padding: "14px 18px 16px" }}>
              <HWTable rows={[
                ["1(a)", <><K m="\sum \frac{n\sin(n^2)}{2^n+n}" /></>, <>שורש על <K m="\sum|a_n|" />, גבולי vs n/2ⁿ</>, "מתכנס בהחלט"],
                ["1(b)", <><K m="\sum (-1)^{n+1}\!\sqrt{\frac{\sqrt{n+1}-\sqrt{n}}{n+1}}" /></>, <>גבולי: לא בהחלט. לייבניץ: <K m="\lim b_n=0" /></>, "מתכנס מותנית"],
                ["2(a)", "Σaₙ, Σbₙ בהחלט ⟹ Σ(aₙ−bₙ) בהחלט?", <><K m="\sum|a_n-b_n| \le \sum|a_n|+\sum|b_n|" /></>, "אמת ✓"],
                ["2(b,c)", "מותנית ± מוחלטת", "דוגמאות ומשפט: מות+מוח=מות", "ראה הוכחה"],
                ["2(d)", <><K m="\sum \frac{\cos n+(-1)^{n+1}(n+1)}{(n+1)\ln^2(n+1)}" /></>, "חלוקה לסדרות + 2(c)", "מתכנס מותנית"],
                ["4(a)", <><K m="\sum (-1)^{n+1}\frac{\ln n}{\sqrt{n}+1}" /></> + " — בהחלט?", "השוואה: ≥ 1/(2√n)", "לא בהחלט"],
                ["4(b)", "1−½+⅔−⅓+¼−¼+… — מתכנס?", "סוגריים: =Σ1/n = ∞", "מתבדר ✓"],
                ["4(c)", "0≤aₙ≤bₙ, lim bₙ=0, יורדת ⟹ Σ(−1)ⁿ⁺¹aₙ?", <>דוגמא נגדית: <K m="a_n=0" /> לזוגיים</>, "שקר!"],
                ["4(d)", <><K m="\sum (\sqrt{n^3+(-1)^{n+1}}-n^{1.5})" /></>, <>גבולי vs <K m="1/n^{1.5}" />, L=1/2</>, "מתכנס בהחלט"],
                ["4(e)", <><K m="\sum_{n=1}^\infty \frac{1}{n(2n+1)} = 2-\ln 4" /></>, "חלוקה + לייבניץ", "אמת ✓"],
                ["5", <><K m="\sum (n^3\sin\tfrac{1}{n}-n^2+\alpha)" /></> + " — עבור אילו α?", "תנאי הכרחי: L'Hôpital 4 פעמים", <><K m="\alpha=1/6" /> בלבד</>],
                ["6(c)", "bₙ=(−1)ⁿaₙ עולה ⟹ Σaₙ מתכנס?", "−bₙ יורדת → 0, לייבניץ על −bₙ", "אמת ✓"],
              ]} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            PART C — PRACTICE QUESTIONS
        ══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "2.5rem" }}>
          <SectionTitle color={C.green}>חלק ג׳ — 4 שאלות לתרגול</SectionTitle>

          {[
            {
              q: "שאלה 1",
              problem: <span>קבעי האם <K m="\displaystyle\sum_{n=1}^\infty \frac{n!\cdot 3^n}{(2n)!}" /> מתכנס.</span>,
              method: "מבחן המנה",
              accent: C.purple,
              solution: (
                <>
                  <K d m="L = \lim_{n\to\infty} \frac{a_{n+1}}{a_n} = \lim_{n\to\infty} \frac{(n+1)!\cdot 3^{n+1}}{(2n+2)!} \cdot \frac{(2n)!}{n!\cdot 3^n} = \lim_{n\to\infty} \frac{3(n+1)}{(2n+2)(2n+1)} = 0 < 1" />
                  <div style={{ color: C.green, fontWeight: 700 }}>✓ הטור מתכנס.</div>
                </>
              ),
            },
            {
              q: "שאלה 2",
              problem: <span>קבעי האם <K m="\displaystyle\sum_{n=2}^\infty \frac{(-1)^n}{\sqrt{n}}" /> מתכנס. האם בהחלט?</span>,
              method: "מבחן לייבניץ",
              accent: C.amber,
              solution: (
                <>
                  <K m="(a_n) = 1/\sqrt{n}" /> — יורדת ו<K m="\lim 1/\sqrt{n} = 0" />.
                  לפי לייבניץ: <strong style={{ color: C.green }}>הטור מתכנס (מותנית)</strong>.
                  <br />לא בהחלט: <K m="\sum 1/\sqrt{n}" /> מתבדר (<K m="p=1/2 \le 1" />). ✓
                </>
              ),
            },
            {
              q: "שאלה 3 — בסגנון הסימולציה",
              problem: (
                <span>
                  יהי <K m="(a_n)" /> חיובית. הגדר <K m="b_n = \frac{\ln(1/a_n)}{\ln n}" /> לכל <K m="n \ge 2" />.
                  נניח <K m="\lim b_n = p > 1" />. הוכיחי ש<K m="\sum a_n < \infty" />.
                </span>
              ),
              method: "השוואה ישיר + p-series",
              accent: C.blue,
              solution: (
                <>
                  <Step n={1} text={<>קח <K m="\epsilon = \frac{p-1}{2}" />. קיים <K m="N" /> כך שלכל <K m="n \ge N" />: <K m="b_n > \frac{p+1}{2} =: q > 1" />.</>} />
                  <Step n={2} text={<><K m="\frac{\ln(1/a_n)}{\ln n} > q" /> ←  <K m="\ln(1/a_n) > q\ln n" /> ← <K m="a_n < \frac{1}{n^q}" />.</>} />
                  <Step n={3} text={<>מאחר ש <K m="q > 1" />: <K m="\sum 1/n^q < \infty" />. לפי השוואה ישיר: <strong style={{ color: C.green }}><K m="\sum a_n < \infty" />. ✓</strong></>} />
                </>
              ),
            },
            {
              q: "שאלה 4",
              problem: (
                <span>
                  הוכיחי: אם <K m="\sum a_n" /> מתכנס לחלוטין, אזי{" "}
                  <K m="\left|\sum_{n=1}^\infty a_n\right| \le \sum_{n=1}^\infty |a_n|" />.
                </span>
              ),
              method: "אי-שוויון המשולש + גבול",
              accent: C.navy,
              solution: (
                <>
                  לכל <K m="N" />: <K m="\left|\sum_{n=1}^N a_n\right| \le \sum_{n=1}^N |a_n|" />.
                  שני הגבולות קיימים, לכן:
                  <K d m="\left|\sum_{n=1}^\infty a_n\right| = \lim_{N\to\infty}\left|\sum_{n=1}^N a_n\right| \le \lim_{N\to\infty}\sum_{n=1}^N|a_n| = \sum_{n=1}^\infty|a_n| \quad\checkmark" />
                </>
              ),
            },
          ].map(({ q, problem, method, accent, solution }) => (
            <div key={q} style={{
              background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
              borderRight: `5px solid ${accent}`, boxShadow: C.shadow,
              marginBottom: "1.25rem", overflow: "hidden",
            }}>
              <div style={{ padding: "10px 18px", background: "#fafaf9",
                borderBottom: `1px solid ${C.border}`, display: "flex",
                alignItems: "center", gap: "0.75rem" }}>
                <span style={{ background: accent, color: "#fff", borderRadius: 8,
                  padding: "2px 10px", fontSize: "0.8rem", fontWeight: 800 }}>{q}</span>
                <span style={{ fontSize: "0.92rem", fontWeight: 600, flex: 1 }}>{problem}</span>
                <Tag color={accent}>{method}</Tag>
              </div>
              <div style={{ padding: "14px 18px 16px", fontSize: "0.92rem",
                lineHeight: 1.85, color: C.text }}>
                <strong style={{ color: C.muted, fontSize: "0.75rem",
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>פתרון:</strong>
                <div style={{ marginTop: "0.5rem" }}>{solution}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            PART D — KEY POINTS
        ══════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "2.5rem" }}>
          <SectionTitle color={C.red}>חלק ד׳ — נקודות חשובות לזכור</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "0.875rem" }}>
            {[
              { icon: "⚠️", title: "תנאי הכרחי", text: <><K m="\lim a_n = 0" /> הכרחי אך לא מספיק — <K m="\sum 1/n" /> מתבדר!</>, color: C.red, bg: C.redBg, bd: C.redBd },
              { icon: "📐", title: "p-series", text: <><K m="\sum 1/n^p" /> מתכנס אמ"מ <K m="p>1" /></>, color: C.navy, bg: C.navyBg, bd: C.navyBd },
              { icon: "🔢", title: "מנה vs שורש", text: "n! → עדיף מנה. חזקות nⁿ → עדיף שורש", color: C.purple, bg: C.purpleBg, bd: C.purpleBd },
              { icon: "📊", title: "גבולי עם L=0", text: <><K m="b_n" /> מתכנס + <K m="L=0" /> ← <K m="a_n" /> מתכנס. ההיפך לא נכון!</>, color: C.blue, bg: C.blueBg, bd: C.blueBd },
              { icon: "↕️", title: "לייבניץ", text: "חייב: (1) יורדת, (2) lim=0. שניהם חובה!", color: C.amber, bg: C.amberBg, bd: C.amberBd },
              { icon: "🔁", title: "מוחלטת → מותנית", text: <><K m="\sum|a_n|<\infty \Rightarrow \sum a_n<\infty" />. ההיפך לא נכון.</>, color: C.green, bg: C.greenBg, bd: C.greenBd },
              { icon: "🌊", title: "טלסקופ", text: <><K m="f(n)-f(n+k)" /> — ערך = <K m="f(k)-\lim f(n)" /></>, color: C.green, bg: C.greenBg, bd: C.greenBd },
              { icon: "🎯", title: "שגיאה נפוצה", text: <><K m="\lim na_n=0" /> לא מספיק! דוגמא: <K m="a_n=1/(n\ln n)" /></>, color: C.red, bg: C.redBg, bd: C.redBd },
              { icon: "➕", title: "הנדסי", text: <><K m="\sum_{n=k}^\infty q^n = \frac{q^k}{1-q}" /> אמ"מ <K m="|q|<1" /></>, color: C.navy, bg: C.navyBg, bd: C.navyBd },
              { icon: "♻️", title: "סדר איברים", text: "ניתן לסדר מחדש רק בטורים מוחלטים! לא במותנית.", color: C.amber, bg: C.amberBg, bd: C.amberBd },
            ].map(({ icon, title, text, color, bg, bd }) => (
              <div key={title} style={{
                background: bg, border: `1px solid ${bd}`,
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color, marginBottom: "0.3rem" }}>{title}</div>
                <div style={{ fontSize: "0.85rem", lineHeight: 1.65, color: C.text }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: "3rem", padding: "1.5rem", textAlign: "center",
          borderTop: `1px solid ${C.border}` }}>
          <Link href="/battle-plan" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: C.navy, color: "#fff", padding: "10px 24px",
            borderRadius: 10, fontWeight: 800, fontSize: "0.95rem",
            textDecoration: "none",
          }}>
            ← חזרה לתכנית הקרב
          </Link>
          <p style={{ marginTop: "0.75rem", color: C.muted, fontSize: "0.8rem" }}>
            Mentora · הכנה לבוחן 3 · בהצלחה! 🍀
          </p>
        </div>

      </div>
    </div>
  );
}
