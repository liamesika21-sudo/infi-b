import katex from "katex";
import "katex/dist/katex.min.css";

/* ─── Tiny KaTeX helper (server-side) ─── */
function K({ m, d = false }: { m: string; d?: boolean }) {
  let html = "";
  try { html = katex.renderToString(m, { displayMode: d, throwOnError: false }); }
  catch { return <code dir="ltr">{m}</code>; }
  if (d) return <div dir="ltr" className="text-center my-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
  return <span dir="ltr" style={{ display: "inline-block", unicodeBidi: "isolate", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── Design tokens (matching lecture2-summary.html) ─── */
const S = {
  bg:       "#f5f0e8",
  card:     "#ffffff",
  primary:  "#1a3a5c",
  red:      "#c0392b",
  green:    "#2e7d32",
  purple:   "#6a1b9a",
  blue:     "#1565c0",
  teal:     "#00695c",
  border:   "#e0d6c8",
  shadow:   "0 2px 12px rgba(0,0,0,0.08)",
};

/* ─── Box components ─── */
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

/* ─── Arrow chain (inference diagram) ─── */
type Step = { text: React.ReactNode; sub?: string };
function Arrow({ from, to, label, dir: d = "right" }: { from: Step; to: Step; label?: string; dir?: "right" | "down" }) {
  if (d === "down") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <Chain1 s={from} />
        <div style={{ color: S.green, fontSize: 22, lineHeight: 1 }}>{label ? <span style={{ fontSize: 12, color: "#555" }}>{label}</span> : null}↓</div>
        <Chain1 s={to} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "6px 0" }}>
      <Chain1 s={from} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {label && <span style={{ fontSize: 11, color: "#888" }}>{label}</span>}
        <span style={{ color: S.green, fontSize: 20 }}>←</span>
      </div>
      <Chain1 s={to} />
    </div>
  );
}
function Chain1({ s }: { s: Step }) {
  return (
    <div style={{ background: "#e8f0fe", padding: "7px 14px", borderRadius: 8, textAlign: "center", fontSize: "0.88rem", lineHeight: 1.5 }}>
      {s.text}
      {s.sub && <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 2 }}>{s.sub}</div>}
    </div>
  );
}

/* ─── Week section ─── */
function WeekSection({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div id={`week-${num}`} style={{ background: S.card, borderRadius: 12, padding: "28px 30px", marginBottom: 24, boxShadow: S.shadow }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, borderBottom: `2px solid ${S.border}`, paddingBottom: 12, marginBottom: 20 }}>
        <span style={{ background: S.primary, color: "#fff", borderRadius: 999, padding: "3px 14px", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
          שבוע {num}
        </span>
        <h2 style={{ color: S.primary, fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function SubSection({ title, color = S.primary, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color, fontSize: "1.05rem", fontWeight: 700, marginBottom: 10, paddingRight: 10, borderRight: `3px solid ${color}` }}>{title}</h3>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main page
══════════════════════════════════════════════ */
export default function TheoremsPage() {
  return (
    <div dir="rtl" style={{ background: S.bg, minHeight: "100vh", fontFamily: "'Noto Sans Hebrew', 'Segoe UI', sans-serif", color: "#2c2c2c", lineHeight: 1.8 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${S.primary}, #2c5f8a)`, color: "#fff", padding: "36px 40px", borderRadius: 12, marginBottom: 28, textAlign: "center", boxShadow: S.shadow }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 20px", borderRadius: 20, fontSize: "0.85rem", marginBottom: 10 }}>
            אינפי ב׳ · מועד א׳ 2026 · יעד 90+
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 6px" }}>
            גרירות, מסקנות ומשפטים — לפי שבוע
          </h1>
          <div style={{ opacity: 0.85, fontSize: "1rem", fontWeight: 300 }}>
            תרשים מה גורר מה · מסקנות מקס · שאלות חשובות · משפטי הרצאה
          </div>
        </div>

        {/* TOC */}
        <div style={{ background: S.card, borderRadius: 12, padding: "20px 28px", marginBottom: 28, boxShadow: S.shadow, borderRight: `4px solid ${S.red}` }}>
          <div style={{ color: S.red, fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>תוכן עניינים</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
            {[
              [1,"גבולות — לופיטל ודרבו"],
              [2,"סדרות — מונוטוניות ורקורסיביות"],
              [3,"נגזרות — MVT, רול, טיילור"],
              [4,"אינטגרל — הגדרה ומשפט היסודי"],
              [5,"אינטגרלים לא אמיתיים"],
              [6,"טורים — מבחני השוואה ואינטגרל"],
              [7,"מבחן מנה, שורש וסדרי גודל"],
              [8,"התכנסות בהחלט ובתנאי"],
              [9,"טורי חזקות ומקלורן"],
            ].map(([n,t])=>(
              <a key={n} href={`#week-${n}`} style={{ color: S.primary, textDecoration: "none", fontSize: "0.92rem" }}>
                {n}. {t as string}
              </a>
            ))}
          </div>
        </div>

        {/* ══ WEEK 1 ══ */}
        <WeekSection num={1} title="גבולות — לופיטל ודרבו">
          <SubSection title="🔗 תרשים גרירה — מה גורר מה" color={S.blue}>
            <Arrow from={{ text: <>גבול בצורה <K m="\frac{0}{0}" /> או <K m="\frac{\infty}{\infty}" /></> }} to={{ text: <>כלל <b>לופיטל</b> → <K m="\lim\frac{f'}{g'}" /></> }} />
            <Arrow from={{ text: <><K m="f'(a)\cdot f'(b)<0" /></> }} to={{ text: <><b>דרבו</b> → <K m="\exists c:\;f'(c)=0" /></> }} />
            <Arrow from={{ text: <><K m="f'(a) < r < f'(b)" /></> }} to={{ text: <><b>דרבו מורחב</b> → <K m="\exists c:\;f'(c)=r" /></> }} />
            <NoteBox label="מסקנה: נגזרת לא יכולה לקפוץ">
              אי-רציפות <b>קפיצה / סליקה</b> — בלתי אפשרית בנגזרת. רק אי-רציפות <b>עיקרית</b> אפשרית (כמו <K m="\sin\frac{1}{x}" />).
              <br />זה ישיר מדרבו: נגזרת מקיימת ערך ביניים.
            </NoteBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>לופיטל תקף <b>רק</b> ב-<K m="\tfrac{0}{0}" /> או <K m="\tfrac{\infty}{\infty}" />. אחרי כל שימוש — עצור ובדוק שהתקדמת. אם לא — שנה כיוון.</MaxBox>
            <MaxBox>גבול מהצורה <K m="0\cdot\infty" /> — הוריד למכנה. איזה ביטוי? ניסוי וטעייה. אין אלגוריתם.</MaxBox>
            <MaxBox>שאלות "הוכח/הפרך" על נגזרות — דרבו המורחב הוא הכלי הראשי. זה בדיוק כמו IVT, רק על הנגזרת.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות מהשבוע" color="#f9a825">
            <QBox>חשב: <K m="\lim_{x\to 0}\!\left[x\cdot e^{1/x}\right]" /> — פרד לגבולות חד-צדדיים.</QBox>
            <QBox>חשב: <K m="\lim_{x\to 0^+}(\arctan x)^{\frac{1-\cos x}{x}}" /> — צורה <K m="1^\infty" />, השתמש בלוגריתם ולופיטל.</QBox>
            <QBox>הוכח: אם <K m="f'\in\mathbb{Q}" /> לכל <K m="x" />, אז <K m="f'" /> קבועה. (דרבו + צפיפות <K m="\mathbb{R}\setminus\mathbb{Q}" />)</QBox>
            <QBox>הוכח/הפרך: <K m="f" /> גזירה, <K m="\lim_{x\to\infty}f'(x)=L>0" />, אז <K m="\lim f(x)=\infty" />. (נכון — לופיטל)</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="כלל לופיטל">
              יהיו <K m="f,g" /> גזירות ב-<K m="(x_0,b)" />, <K m="\lim_{x\to x_0^+}f=\lim g=0" /> (או <K m="\infty" />, <K m="g'\ne 0" />. אם קיים <K m="\lim\frac{f'}{g'}" />, אז:
              <K m="\lim_{x\to x_0}\frac{f(x)}{g(x)}=\lim_{x\to x_0}\frac{f'(x)}{g'(x)}" d />
            </ThmBox>
            <ThmBox label="משפט דרבו">
              <K m="f" /> גזירה ב-<K m="[a,b]" />, <K m="f'(a)\cdot f'(b)<0" /> ⟹ <K m="\exists c\in(a,b): f'(c)=0" />.
            </ThmBox>
            <ThmBox label="משפט דרבו המורחב">
              <K m="f" /> גזירה ב-<K m="[a,b]" />, <K m="r" /> בין <K m="f'(a)" /> ל-<K m="f'(b)" /> ⟹ <K m="\exists c: f'(c)=r" />.
              <br /><b>מסקנה:</b> נגזרת אינה יכולה לקבל קפיצה (אי-רציפות מסוג 1).
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 2 ══ */}
        <WeekSection num={2} title="סדרות — מונוטוניות, חסימות ורקורסיביות">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: "מונוטונית + חסומה" }} to={{ text: <><b>מתכנסת</b> — קיים גבול <K m="L" /></> }} />
            <Arrow from={{ text: <>קיים גבול <K m="L" /></> }} to={{ text: <><K m="\lim a_n = L" /> וגם <K m="\lim a_{n+1}=L" /> → <K m="L=f(L)" /></> }} />
            <Arrow from={{ text: <><K m="|a_n - L| < \varepsilon" /> מ-<K m="N" /> ואילך</> }} to={{ text: <><b>הגדרת גבול</b> (ε-N)</> }} />
            <NoteBox label="⚠ אסור להניח גבול לפני שהוכחת!">
              בסדרה רקורסיבית: <b>קודם</b> הוכח מונוטוניות + חסימות → <b>אז</b> הסק שיש גבול → <b>אז</b> מצא <K m="L=f(L)" />.
              <br />דוגמה נגדית: <K m="a_1=3,\; a_{n+1}=1+2a_n" /> — הנחת גבול נותנת <K m="L=-1" /> (שגוי! הסדרה מתבדרת).
            </NoteBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>בסדרה — אסור לעשות לופיטל ישירות. צריך כלל היינה (עבור לפונקציה רציפה).</MaxBox>
            <MaxBox>סדרה רקורסיבית עם <K m="\arctan" />: מתקיים <K m="0<\arctan x < x" /> לכל <K m="x>0" /> → הסדרה יורדת וחסומה מלרע → מתכנסת.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>סדרה: <K m="a_1=\tfrac{1}{4},\; a_{n+1}=a_n^2+\tfrac{1}{4}" /> — הוכח שמתכנסת ומצא גבול.</QBox>
            <QBox>סדרה: <K m="a_1=c>0,\; a_{n+1}=\arctan(a_n)" /> — הוכח שהגבול הוא 0.</QBox>
            <QBox>הוכח/הפרך: אם <K m="a_n>0" /> ו-<K m="\lim a_n=0" />, אז <K m="\lim\frac{a_{n+1}}{a_n}=0" />. (שגוי — דוגמה נגדית)</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="משפט הסדרה המונוטונית והחסומה">
              כל סדרה <b>מונוטונית וחסומה</b> מתכנסת.
              <br />עולה וחסומה מלעיל → גבולה שווה לסופרמום. יורדת וחסומה מלרע → גבולה שווה לאינפימום.
            </ThmBox>
            <ThmBox label="כלל הסנדוויץ' (Squeeze Theorem)">
              אם <K m="a_n \le b_n \le c_n" /> לכל <K m="n" /> גדול מספיק, ו-<K m="\lim a_n = \lim c_n = L" />, אז <K m="\lim b_n = L" />.
            </ThmBox>
            <ThmBox label="גבולות חשובים לשנן">
              <K m="\lim_{n\to\infty}\left(1+\tfrac{1}{n}\right)^n = e" d />
              <K m="\lim_{n\to\infty} n^{1/n} = 1" d />
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 3 ══ */}
        <WeekSection num={3} title="נגזרות — MVT, רול, טיילור">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="f" /> רציפה ב-<K m="[a,b]" />, גזירה ב-<K m="(a,b)" /></> }} to={{ text: <><b>MVT</b>: <K m="\exists c: f'(c)=\frac{f(b)-f(a)}{b-a}" /></> }} />
            <Arrow from={{ text: <><K m="f'(x)=0" /> לכל <K m="x" /></> }} to={{ text: <><K m="f" /> <b>קבועה</b> (קורולר מ-MVT)</> }} />
            <Arrow from={{ text: <><K m="f^{(n+1)}" /> קיימת</> }} to={{ text: <><b>טיילור</b> עם שארית לגרנז'</> }} />
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>MVT הוא כלי ההוכחה הראשי לאי-שוויונות. לפונקציה <K m="f" /> על <K m="[a,b]" />, חפש <K m="c" /> שנותן את מה שאתה צריך.</MaxBox>
            <MaxBox>פיתוח טיילור = כלי מרכזי לחישוב גבולות ואינטגרלים. שארית לגרנז': <K m="R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}" />.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>הוכח: <K m="\forall x>0: e^x > 1+x" />. (MVT על <K m="e^x-1-x" />)</QBox>
            <QBox>הוכח: <K m="|\sin a - \sin b|\le|a-b|" /> לכל <K m="a,b" />. (MVT + <K m="|\cos|\le 1" />)</QBox>
            <QBox>חשב נגזרת מסדר <K m="n" /> של <K m="f(x)=\frac{1}{1-x}" /> — תבנית כללית.</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="משפט רול">
              <K m="f" /> רציפה ב-<K m="[a,b]" />, גזירה ב-<K m="(a,b)" />, <K m="f(a)=f(b)" /> ⟹ <K m="\exists c\in(a,b): f'(c)=0" />.
            </ThmBox>
            <ThmBox label="משפט הערך הממוצע (MVT)">
              <K m="f" /> רציפה ב-<K m="[a,b]" />, גזירה ב-<K m="(a,b)" /> ⟹
              <K m="\exists c\in(a,b):\quad f'(c)=\frac{f(b)-f(a)}{b-a}" d />
            </ThmBox>
            <ThmBox label="פיתוח טיילור עם שארית לגרנז'">
              <K m="f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k + \frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}" d />
              עבור <K m="\xi" /> כלשהו בין <K m="x_0" /> ל-<K m="x" />.
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 4 ══ */}
        <WeekSection num={4} title="אינטגרל מסוים — הגדרה, FTC ושיטות">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="f" /> <b>רציפה</b> ב-<K m="[a,b]" /></> }} to={{ text: <><K m="f" /> אינטגרבילית (מקיימת N-L)</> }} />
            <Arrow from={{ text: <><K m="F(x)=\int_a^x f(t)\,dt" /></> }} to={{ text: <><K m="F" /> <b>רציפה תמיד</b> + <K m="F'=f" /> אם <K m="f" /> רציפה (FTC2)</> }} />
            <Arrow from={{ text: <><K m="F" /> אנטי-נגזרת של <K m="f" /></> }} to={{ text: <><K m="\int_a^b f(x)\,dx = F(b)-F(a)" /> (נ-ל)</> }} />
            <ExBox label="שאלה קלאסית למבחן">
              נתון <K m="\int_a^b f(t)^2\,dt>1" />. הוכח שקיים <K m="c\in(a,b)" /> כך ש-<K m="F(c)=1" />.
              <br />פתרון: הגדר <K m="F(x)=\int_a^x f(t)^2\,dt" />, אז <K m="F(a)=0" />, <K m="F(b)>1" />, <K m="F" /> רציפה → IVT.
            </ExBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox><K m="F(x)=\int_a^x f(t)\,dt" /> היא פונקציה לכל דבר — רציפה, ולפעמים גזירה. אפשר לעשות עליה לופיטל, IVT, MVT.</MaxBox>
            <MaxBox>אסור להשתמש בניוטון-לייבניץ כשהפונקציה <b>לא רציפה</b> בקטע. זה טעות קלאסית שחוזרת בכל מבחן.</MaxBox>
            <MaxBox>כלל הפונקציה הזוגית/אי-זוגית: <K m="\int_{-a}^a f=0" /> (אי-זוגית), <K m="=2\int_0^a f" /> (זוגית) — <b>רק</b> לאינטגרל מסוים, לא לא-אמיתי!</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>חשב: <K m="\int \frac{f'(x)}{f(x)}\,dx" /> — ביטוי והנגזרת שלו → <K m="\ln|f(x)|+C" />.</QBox>
            <QBox>חשב: <K m="\int x e^x\,dx" /> — אינטגרציה בחלקים עם <K m="u=x" />.</QBox>
            <QBox>חשב: <K m="\int_0^\pi \sin^2 x\,dx" /> — השתמש ב-<K m="\sin^2 x=\frac{1-\cos 2x}{2}" />.</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="משפט ניוטון-לייבניץ (FTC1)">
              <K m="f" /> אינטגרבילית ב-<K m="[a,b]" />, <K m="F" /> אנטי-נגזרת שלה:
              <K m="\int_a^b f(x)\,dx = F(b)-F(a)" d />
              <b>תנאי:</b> <K m="f" /> חייבת להיות רציפה בקטע הסגור!
            </ThmBox>
            <ThmBox label="FTC2 — גזירת אינטגרל (הפונקציה הצוברת)">
              אם <K m="f" /> רציפה, אז <K m="F(x)=\int_a^x f(t)\,dt" /> גזירה ו-<K m="F'(x)=f(x)" />.
            </ThmBox>
            <ThmBox label="אינטגרציה בחלקים (IBP)">
              <K m="\int u'(x)v(x)\,dx = u(x)v(x) - \int u(x)v'(x)\,dx" d />
              או לאינטגרל מסוים: <K m="\left[u(x)v(x)\right]_a^b - \int_a^b u(x)v'(x)\,dx" d />
            </ThmBox>
            <ThmBox label="החלפת משתנה">
              <K m="\int_a^b g(f(x))\cdot f'(x)\,dx = \int_{f(a)}^{f(b)} g(t)\,dt" d />
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 5 ══ */}
        <WeekSection num={5} title="אינטגרלים לא אמיתיים">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="|f(x)|\le g(x)" /> + <K m="\int_a^\infty g" /> מתכנס</> }} to={{ text: <><K m="\int_a^\infty f" /> <b>מתכנס</b> (השוואה)</> }} />
            <Arrow from={{ text: <><K m="\int_a^\infty |f|" /> מתכנס</> }} to={{ text: <><K m="\int_a^\infty f" /> מתכנס (מוחלט)</> }} />
            <Arrow from={{ text: <><K m="f" /> לא רציפה ב-<K m="c\in[a,b]" /></> }} to={{ text: "⚠ אסור N-L → פתח לפי הגדרה (גבול)" }} />
            <NoteBox label="⚠ הטעות הקלאסית — ∫₋₁¹ (1/x) dx">
              <K m="\int_{-1}^{1}\frac{1}{x}\,dx \ne 0" /> — <K m="1/x" /> לא רציפה ב-0. N-L אסור. האינטגרל מתבדר!
              <br />גם הסימטריה לא עוזרת — כלל הפונקציה האי-זוגית חל על אינטגרל מסוים בלבד.
            </NoteBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox><K m="\int_{-\infty}^\infty f = \int_{-\infty}^0 f + \int_0^\infty f" /> — <b>שני גבולות נפרדים</b>. אם אחד מתבדר — כולו מתבדר.</MaxBox>
            <MaxBox>מבחן ההשוואה לאינטגרלים: אם <K m="0\le f\le g" /> ו-<K m="\int g" /> מתכנס → <K m="\int f" /> מתכנס. ואם <K m="\int f" /> מתבדר → <K m="\int g" /> מתבדר.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>חשב: <K m="\int_{-\infty}^\infty \frac{1}{e^x+e^{-x}}\,dx" /> — פרד לשניים, השתמש ב-<K m="\arctan(e^x)" />.</QBox>
            <QBox>בדוק: <K m="\int_1^\infty \frac{\ln x}{x^p}\,dx" /> — מתכנס עבור אלו <K m="p" />?</QBox>
            <QBox>הוכח/הפרך: אם <K m="\int_0^\infty f" /> מתכנס ו-<K m="f" /> אחידה רציפה, אז <K m="\lim_{x\to\infty} f(x)=0" />. (נכון)</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="הגדרת אינטגרל לא אמיתי">
              <K m="\int_a^\infty f(x)\,dx = \lim_{R\to\infty}\int_a^R f(x)\,dx" d />
              <K m="\int_{-\infty}^\infty f = \int_{-\infty}^0 f + \int_0^\infty f" /> (שני גבולות <b>נפרדים</b>).
            </ThmBox>
            <ThmBox label="מבחן ההשוואה לאינטגרלים">
              אם <K m="0\le f(x)\le g(x)" /> לכל <K m="x\ge a" />:
              <br />• <K m="\int_a^\infty g" /> מתכנס → <K m="\int_a^\infty f" /> מתכנס.
              <br />• <K m="\int_a^\infty f" /> מתבדר → <K m="\int_a^\infty g" /> מתבדר.
            </ThmBox>
            <ThmBox label="אינטגרל p">
              <K m="\int_1^\infty \frac{1}{x^p}\,dx" /> מתכנס <K m="\iff p>1" />.
              <br /><K m="\int_0^1 \frac{1}{x^p}\,dx" /> מתכנס <K m="\iff p<1" />.
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 6 ══ */}
        <WeekSection num={6} title="טורים — מבחני השוואה, אינטגרל ולייבניץ">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="\sum a_n" /> מתכנס</> }} to={{ text: <><K m="a_n\to 0" /> (תנאי הכרחי!)</> }} />
            <Arrow from={{ text: <><K m="\lim\frac{a_n}{b_n}=L\in(0,\infty)" /></> }} to={{ text: <><b>LCT</b>: <K m="\sum a_n\iff\sum b_n" /></> }} />
            <Arrow from={{ text: <><K m="p>1" /></> }} to={{ text: <><K m="\sum\frac{1}{n^p}" /> מתכנס (p-series)</> }} />
            <Arrow from={{ text: <><K m="a_n\ge 0" /> יורד, <K m="a_n\to 0" /></> }} to={{ text: <><b>לייבניץ</b>: <K m="\sum(-1)^n a_n" /> מתכנס</> }} />
            <NoteBox label="ציר הזמן: חוצץ בין מתכנס למתבדר">
              <K m="\sum\frac{1}{n^p}" />: מתכנס (<K m="p>1" />), מתבדר (<K m="p\le 1" />). החוצץ עובר ב-<K m="p=1" /> (הרמוני).
              <br />שכבה עדינה יותר: <K m="\sum\frac{1}{n\ln^\beta n}" /> מתכנס <K m="\iff \beta>1" />.
            </NoteBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>אסור לפצל <K m="\sum(a_n+b_n)=\sum a_n + \sum b_n" /> בלי לדעת ששניהם מתכנסים. פתח <K m="S_N" /> ואז קח גבול.</MaxBox>
            <MaxBox>LCT: אם <K m="\lim\frac{a_n}{b_n}=0" /> או <K m="\infty" /> — לא מסיקים כלום! צריך <K m="L\in(0,\infty)" />.</MaxBox>
            <MaxBox>טלסקופי: פתח <K m="S_N = \sum_{n=1}^N (b_{n+1}-b_n) = b_{N+1}-b_1" />, קח גבול.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>בדוק: <K m="\sum_{n=1}^\infty\frac{\sin n}{n^2}" /> — מתכנס? (כן — השוואה עם <K m="\frac{1}{n^2}" />)</QBox>
            <QBox>בדוק: <K m="\sum_{n=2}^\infty\frac{1}{n\ln n}" /> — מתכנס? (לא — מבחן האינטגרל)</QBox>
            <QBox>בדוק: <K m="\sum_{n=1}^\infty\frac{(-1)^n}{\sqrt{n}}" /> — מתכנס? (כן — לייבניץ, לא בהחלט)</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="תנאי הכרחי להתכנסות">
              אם <K m="\sum_{n=1}^\infty a_n" /> מתכנס, אז <K m="a_n\to 0" />.
              <br /><b>קונטרה-פוזיטיב:</b> אם <K m="a_n\not\to 0" /> → הטור מתבדר.
            </ThmBox>
            <ThmBox label="מבחן ההשוואה הגבולי (LCT)">
              אם <K m="a_n,b_n>0" /> ו-<K m="\lim_{n\to\infty}\frac{a_n}{b_n}=L\in(0,\infty)" />, אז <K m="\sum a_n" /> מתכנס <K m="\iff \sum b_n" /> מתכנס.
            </ThmBox>
            <ThmBox label="מבחן האינטגרל">
              <K m="f" /> חיובית, יורדת, רציפה ב-<K m="[1,\infty)" />. אז <K m="\sum_{n=1}^\infty f(n)" /> מתכנס <K m="\iff \int_1^\infty f(x)\,dx" /> מתכנס.
            </ThmBox>
            <ThmBox label="מבחן לייבניץ (Alternating Series Test)">
              אם <K m="a_n\ge 0" />, <K m="a_n" /> יורדת <b>(חייב!)</b>, <K m="a_n\to 0" />, אז <K m="\sum_{n=1}^\infty(-1)^n a_n" /> מתכנס.
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 7 ══ */}
        <WeekSection num={7} title="מבחן מנה, שורש וסדרי גודל">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: "מכפלות / עצרת" }} to={{ text: <><b>מבחן המנה</b> → <K m="\frac{a_{n+1}}{a_n}" /></> }} />
            <Arrow from={{ text: <><K m="x^n" /> / חזקות</> }} to={{ text: <><b>מבחן השורש</b> → <K m="|a_n|^{1/n}" /></> }} />
            <Arrow from={{ text: <><K m="L<1" /></> }} to={{ text: "מתכנס" }} />
            <Arrow from={{ text: <><K m="L>1" /></> }} to={{ text: "מתבדר" }} />
            <Arrow from={{ text: <><K m="L=1" /></> }} to={{ text: "⚠ לא קובע — נסה כלי אחר" }} />
            <ExBox label="סדרי גודל — חייבים לזכור">
              <K m="n! \;\gg\; a^n \;\gg\; n^k \;\gg\; \ln^k n \qquad (a>1,\; k>0)" d />
              מעריכים מנצח פולינום מנצח לוגריתם. <b>מיידית!</b>
            </ExBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>עצרת → מנה ראשון. כשעושים <K m="\frac{a_{n+1}}{a_n}" />, המכפלות מצטמצמות בצורה נקייה.</MaxBox>
            <MaxBox>אם L=1 במבחן מנה/שורש — באסה גדולה, צריך כלי אחר. זה לא אומר שלא מתכנס.</MaxBox>
            <MaxBox><K m="\lim_{n\to\infty}\left(\frac{n}{n+1}\right)^n = e^{-1}" /> — חשוב לדעת!</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>בדוק: <K m="\sum\frac{n!}{n^n}" /> — מבחן מנה, <K m="L=e^{-1}<1" /> → מתכנס.</QBox>
            <QBox>בדוק: <K m="\sum\frac{1\cdot 4\cdot 7\cdots(3n-2)}{3\cdot 6\cdot 9\cdots(3n)}" /> — מבחן מנה, שים לב לאיבר הבא.</QBox>
            <QBox>בדוק: <K m="\sum\left(\frac{n}{n+1}\right)^{n^2}" /> — מבחן שורש: <K m="\left(\frac{n}{n+1}\right)^n\to e^{-1}<1" /> → מתכנס.</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="מבחן המנה (D'Alembert)">
              <K m="L=\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|" />: אם <K m="L<1" /> מתכנס בהחלט, <K m="L>1" /> מתבדר, <K m="L=1" /> לא קובע.
            </ThmBox>
            <ThmBox label="מבחן השורש (Cauchy)">
              <K m="L=\limsup_{n\to\infty}|a_n|^{1/n}" />: אם <K m="L<1" /> מתכנס בהחלט, <K m="L>1" /> מתבדר, <K m="L=1" /> לא קובע.
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 8 ══ */}
        <WeekSection num={8} title="התכנסות בהחלט ובתנאי — הוכח/הפרך (⚠ קלאסי למבחן!)">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="\sum|a_n|<\infty" /></> }} to={{ text: <>מתכנס <b>בהחלט</b> → מתכנס</> }} />
            <Arrow from={{ text: "מתכנס" }} to={{ text: <>מתכנס בהחלט? — <b>לא בהכרח!</b></> }} />
            <Arrow from={{ text: <><K m="a_n\ge0" /> יורד, <K m="a_n\to 0" /></> }} to={{ text: <><b>לייבניץ</b>: <K m="\sum(-1)^n a_n" /> מתכנס</> }} />
            <NoteBox label="⚠ הנקודה הכי חשובה בשבוע זה">
              כשטור <b>אינו אי-שלילי</b> — כל האינטואיציות מהשבועות הקודמים מתאפסות! זה עולם אחר.
              <br />מבחן ההשוואה — רק לטורים <b>אי-שליליים</b>. חייבים לקרוא את השאלה!
            </NoteBox>
            <DefBox label="תרשים: 6 שאלות הוכח/הפרך מתרגול 8 — קלאסיות למבחן!">
              (1) <K m="\sum a_n^2" /> מתכנס ⟹ <K m="\sum\frac{a_n}{n}" /> מתכנס בהחלט? (כן — <K m="(a-b)^2\ge0" />)
              <br />(2) <K m="\sum a_n" /> מתכנס ⟹ <K m="\sum(-1)^n a_n" /> מתכנס? (לא בהכרח)
              <br />(3) <K m="a_n\ge0, a_n\to0" /> ⟹ <K m="\sum(-1)^n a_n" /> מתכנס? (שגוי! חסרה יורדת)
              <br />(4) לייבניץ בלי 'יורדת': הטענה שגויה — בנה דוגמה נגדית עם קפיצה זוגי/אי-זוגי.
            </DefBox>
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>טריק: <K m="(a-b)^2\ge0" /> → <K m="2ab\le a^2+b^2" />. שימושי כשרואים מכפלה שצריך לחסום.</MaxBox>
            <MaxBox>שתילת אפסים: לדוגמה נגדית עם טור לא אי-שלילי — שתל אפסים במיקומים זוגיים. <K m="\sum|a_n|" /> עדיין מתבדר.</MaxBox>
            <MaxBox>לקפץ בסדרה → הפרד זוגי ואי-זוגי. <K m="(-1)^n" /> אסור לסדרה אי-שלילית.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>הוכח: <K m="\sum a_n^2" /> מתכנס ⟹ <K m="\sum\frac{a_n}{n}" /> מתכנס בהחלט. (AM-GM)</QBox>
            <QBox>הפרך: <K m="a_n\ge0, a_n\to0" /> ⟹ <K m="\sum(-1)^n a_n" /> מתכנס. (סדרה קופצת)</QBox>
            <QBox>הוכח: <K m="\sum|a_n|=\infty" />, <K m="\sum a_n" /> מתכנס → <K m="\sum a_n" /> מתכנס <b>בתנאי</b>.</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="התכנסות מוחלטת">
              אם <K m="\sum|a_n|" /> מתכנס, אז <K m="\sum a_n" /> מתכנס. (ההפך לא נכון בכלל!)
            </ThmBox>
            <ThmBox label="מבחן לייבניץ — 3 תנאים חייבים!">
              (1) <K m="a_n\ge 0" />, (2) <K m="a_n" /> <b>יורדת</b> (חובה! יוסי השתמש בזה בהוכחה), (3) <K m="a_n\to 0" />.
              <br />אז <K m="\sum_{n=1}^\infty(-1)^n a_n" /> מתכנס. שגיאה נפוצה: לשכוח 'יורדת'.
            </ThmBox>
            <ThmBox label="משפט סוגריים">
              אם <K m="\sum a_n" /> מתכנס ומוסיפים סוגריים → הוא מתכנס לאותו ערך.
              <br />אם הוספנו סוגריים והוא מתבדר → <K m="\sum a_n" /> מתבדר. (שימושי לדוגמאות נגדיות)
            </ThmBox>
          </SubSection>
        </WeekSection>

        {/* ══ WEEK 9 ══ */}
        <WeekSection num={9} title="טורי חזקות — רדיוס התכנסות ומקלורן">
          <SubSection title="🔗 תרשים גרירה" color={S.blue}>
            <Arrow from={{ text: <><K m="\sum a_n x^n" /></> }} to={{ text: <><K m="R=\frac{1}{\limsup|a_n|^{1/n}}" /> (רדיוס התכנסות)</> }} />
            <Arrow from={{ text: <><K m="|x|<R" /></> }} to={{ text: "מתכנס <b>בהחלט</b>" }} />
            <Arrow from={{ text: <><K m="|x|>R" /></> }} to={{ text: "מתבדר" }} />
            <Arrow from={{ text: <><K m="|x|=R" /></> }} to={{ text: "⚠ לבדוק כל קצה בנפרד" }} />
            <Arrow from={{ text: "גזירה/אינטגרציה" }} to={{ text: <><K m="R" /> <b>לא משתנה</b> — אבל קצוות — בדוק מחדש!</> }} />
          </SubSection>

          <SubSection title="💡 מסקנות מהתרגולים של מקס" color={S.teal}>
            <MaxBox>קצוות: <K m="R" /> לא משתנה בגזירה/אינטגרציה, אבל ההתנהגות בקצוות יכולה להשתנות — תמיד לבדוק!</MaxBox>
            <MaxBox>חישוב סכום טור: לפעמים גוזרים/מאינטגרלים טור ידוע כדי להגיע לטור הרצוי. תרגול בסיסי.</MaxBox>
          </SubSection>

          <SubSection title="❓ שאלות חשובות" color="#f9a825">
            <QBox>מצא רדיוס התכנסות: <K m="\sum\frac{x^n}{n}" /> → <K m="R=1" />. בדוק קצוות: <K m="x=1" /> (מתבדר), <K m="x=-1" /> (מתכנס).</QBox>
            <QBox>חשב: <K m="\sum_{n=1}^\infty nx^n" /> עבור <K m="|x|<1" />. (גזור <K m="\sum x^n = \frac{1}{1-x}" />)</QBox>
            <QBox>הוכח: <K m="\sum_{n=0}^\infty\frac{x^n}{n!}=e^x" /> לכל <K m="x\in\mathbb{R}" />. (שארית לגרנז' שואפת ל-0)</QBox>
          </SubSection>

          <SubSection title="📐 משפטים מההרצאה" color={S.blue}>
            <ThmBox label="רדיוס התכנסות">
              לטור <K m="\sum a_n(x-x_0)^n" />, הרדיוס הוא:
              <K m="R=\frac{1}{\limsup_{n\to\infty}|a_n|^{1/n}}" d />
              או (כשהגבול קיים): <K m="R=\lim_{n\to\infty}\left|\frac{a_n}{a_{n+1}}\right|" d />
            </ThmBox>
            <ThmBox label="גזירה ואינטגרציה של טורי חזקות">
              ב-<K m="|x-x_0|<R" />:
              <K m="\frac{d}{dx}\sum_{n=0}^\infty a_n(x-x_0)^n = \sum_{n=1}^\infty na_n(x-x_0)^{n-1}" d />
              <K m="\int\sum_{n=0}^\infty a_n(x-x_0)^n\,dx = \sum_{n=0}^\infty\frac{a_n}{n+1}(x-x_0)^{n+1}+C" d />
            </ThmBox>
            <ThmBox label="טורי מקלורן — חובה לשנן">
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                <K m="e^x = \sum_{n=0}^\infty \frac{x^n}{n!},\quad x\in\mathbb{R}" d />
                <K m="\sin x = \sum_{n=0}^\infty \frac{(-1)^n x^{2n+1}}{(2n+1)!},\quad x\in\mathbb{R}" d />
                <K m="\cos x = \sum_{n=0}^\infty \frac{(-1)^n x^{2n}}{(2n)!},\quad x\in\mathbb{R}" d />
                <K m="\ln(1+x) = \sum_{n=1}^\infty \frac{(-1)^{n+1} x^n}{n},\quad x\in(-1,1]" d />
                <K m="\frac{1}{1-x} = \sum_{n=0}^\infty x^n,\quad |x|<1" d />
              </div>
            </ThmBox>
          </SubSection>
        </WeekSection>

        <div style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", padding: "20px 0" }}>
          אינפי ב׳ — מועד א׳ · 01.07.2026 · יעד 90+ · Max Mahlin
        </div>
      </div>
    </div>
  );
}

import type React from "react";
