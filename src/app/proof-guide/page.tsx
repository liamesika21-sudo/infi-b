import katex from "katex";
import "katex/dist/katex.min.css";

/* ─── KaTeX helper ─── */
function K({ m, d = false }: { m: string; d?: boolean }) {
  let html = "";
  try { html = katex.renderToString(m, { displayMode: d, throwOnError: false }); }
  catch { return <code dir="ltr">{m}</code>; }
  if (d) return <div dir="ltr" className="my-2 overflow-x-auto text-center" dangerouslySetInnerHTML={{ __html: html }} />;
  return <span dir="ltr" style={{ display: "inline-block", unicodeBidi: "isolate", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── Design ─── */
const C = {
  bg:     "#f5f0e8",
  card:   "#ffffff",
  navy:   "#1a3a5c",
  blue:   "#1565c0",
  red:    "#c0392b",
  green:  "#2e7d32",
  purple: "#6a1b9a",
  teal:   "#00695c",
  amber:  "#e65100",
  border: "#e0d6c8",
  shadow: "0 2px 12px rgba(0,0,0,0.08)",
};

/* ─── Step card: one proof step with full formal justification ─── */
interface StepProps {
  num: number;
  action: string;           // "עשית בפועל"
  why: string;              // "שם המשפט/הגדרה"
  conditions: string[];     // "תנאים שחייבים להתקיים"
  formalWrite: string;      // "איך כותבים בדיוק"
  trap?: string;            // "טעות נפוצה"
  accentColor?: string;
}
function Step({ num, action, why, conditions, formalWrite, trap, accentColor = C.blue }: StepProps) {
  return (
    <div style={{
      background: C.card, borderRadius: 10, boxShadow: C.shadow,
      borderRight: `5px solid ${accentColor}`, marginBottom: 14, overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ padding: "10px 18px", background: "#f8f8f8", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          background: accentColor, color: "#fff", borderRadius: "50%",
          width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 800, flexShrink: 0, marginTop: 1
        }}>{num}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a1a" }}>{action}</div>
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: 2 }}>
            ← מנמקים לפי: <strong style={{ color: accentColor }}>{why}</strong>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Conditions */}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            תנאים שחייבים לבדוק ✓
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {conditions.map((c, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5, fontSize: "0.88rem", color: "#333", lineHeight: 1.5 }}>
                <span style={{ color: C.green, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formal write */}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            כתיבה פורמלית במבחן 📝
          </div>
          <div style={{
            background: "#f0f4ff", border: `1px solid #c5d0f0`, borderRadius: 7,
            padding: "10px 12px", fontSize: "0.86rem", lineHeight: 1.7, color: "#1a2a4a", fontStyle: "italic"
          }}>
            {formalWrite}
          </div>
        </div>
      </div>

      {/* Trap */}
      {trap && (
        <div style={{
          margin: "0 14px 14px", padding: "8px 12px", background: "#fff5f5",
          border: `1px solid #fca5a5`, borderRadius: 7, fontSize: "0.83rem", color: C.red
        }}>
          ⚠ <strong>טעות נפוצה:</strong> {trap}
        </div>
      )}
    </div>
  );
}

/* ─── Topic block ─── */
function Topic({ title, subtitle, color = C.navy, children }: {
  title: string; subtitle: string; color?: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: C.card, borderRadius: 12, boxShadow: C.shadow, marginBottom: 28, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", padding: "20px 28px" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900 }}>{title}</h2>
        <div style={{ opacity: 0.8, fontSize: "0.9rem", marginTop: 4, fontWeight: 300 }}>{subtitle}</div>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: "0.78rem", color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

/* ══ PAGE ══ */
export default function ProofGuidePage() {
  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Noto Sans Hebrew', 'Segoe UI', sans-serif", color: "#2c2c2c", lineHeight: 1.8 }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy}, #2c5f8a)`,
          color: "#fff", padding: "36px 40px", borderRadius: 12, marginBottom: 28,
          textAlign: "center", boxShadow: C.shadow
        }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", padding: "4px 20px", borderRadius: 20, fontSize: "0.85rem", marginBottom: 10 }}>
            אינפי ב׳ · מדריך הנימוק הפורמלי
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 900, margin: "0 0 8px" }}>
            עשית את הצעד — עכשיו נמקי לפי מה
          </h1>
          <div style={{ opacity: 0.85, fontSize: "1rem", fontWeight: 300, maxWidth: 600, margin: "0 auto" }}>
            לכל צעד בפתרון: שם המשפט/הגדרה · תנאים שחייבים לבדוק · איך כותבים פורמלית
          </div>
        </div>

        {/* ══ SECTION 1: LIMITS ══ */}
        <Topic title="גבולות" subtitle="לופיטל · גבולות חד-צדדיים · רציפות" color={C.navy}>
          <Step
            num={1}
            action={'עשית גזירת מונה ומכנה בגבול: "לופיטל"'}
            why="כלל לופיטל"
            accentColor={C.blue}
            conditions={[
              "הגבול בצורה 0/0 או ∞/∞ בלבד",
              "f, g גזירות בסביבת x₀",
              "g′(x) ≠ 0 בסביבה (חוץ מx₀)",
              "קיים lim f′/g′ (במובן הרחב)",
            ]}
            formalWrite={`"הגבול בצורה 0/0 [או ∞/∞], לכן ממשפט לופיטל: lim f/g = lim f′/g′"`}
            trap="שימוש בלופיטל כשהגבול לא בצורה 0/0 ∞/∞ — כגון 1·∞ ישירות בלי להוריד למכנה!"
          />
          <Step
            num={2}
            action="הפרדת לגבולות חד-צדדיים כי הפונקציה לא מוגדרת/שונה בכל צד"
            why="הגדרת גבול דו-צדדי"
            accentColor={C.blue}
            conditions={[
              "יש חשד שהפונקציה מתנהגת שונה מימין ומשמאל (כגון |x|/x, sign, e^(1/x))",
            ]}
            formalWrite={`"נבדיל בין גבול מימין ומשמאל. גבול מימין: ... = L₁. גבול משמאל: ... = L₂. היות ש-L₁ ≠ L₂, הגבול לא קיים."`}
            trap="לא לבדוק חד-צדדי ולהניח שהגבול קיים"
          />
          <Step
            num={3}
            action='כתבת "AOL" — השתמשת בחוקי אלגברה של גבולות'
            why="אלגברה של גבולות (AOL)"
            accentColor={C.blue}
            conditions={[
              "שני הגבולות קיימים (סופיים)",
              "אין חלוקה באפס או ∞-∞",
            ]}
            formalWrite={`"מאלגברה של גבולות [AOL]: lim(f+g) = lim f + lim g = ... + ... = ..."`}
            trap="AOL אסור כשיש ∞-∞ או ∞/∞ — צריך לחקור!"
          />
          <Step
            num={4}
            action="השתמשת בסנדוויץ′ (כלל המלחיץ)"
            why="משפט הסנדוויץ′ / Squeeze Theorem"
            accentColor={C.blue}
            conditions={[
              "a(x) ≤ f(x) ≤ b(x) בסביבת x₀",
              "lim a(x) = lim b(x) = L",
            ]}
            formalWrite={`"מאחר ש- a(x) ≤ f(x) ≤ b(x) וכן lim a(x) = lim b(x) = L, ממשפט הסנדוויץ′: lim f(x) = L"`}
          />
        </Topic>

        {/* ══ SECTION 2: SEQUENCES ══ */}
        <Topic title="סדרות" subtitle="מונוטוניות · חסימות · רקורסיביות · גבול" color="#1b5e20">
          <Step
            num={5}
            action="הסקת קיום גבול לסדרה מונוטונית"
            why="משפט הסדרה המונוטונית והחסומה"
            accentColor={C.green}
            conditions={[
              "הסדרה מונוטונית עולה (או יורדת)",
              "הסדרה חסומה מלעיל (עולה) / מלרע (יורדת)",
            ]}
            formalWrite={`"הסדרה מונוטונית עולה וחסומה מלעיל, לכן ממשפט הסדרה המונוטונית, קיים lim aₙ = L ∈ ℝ"`}
            trap="לא להניח שהגבול קיים לפני שהוכחת מונוטוניות + חסימות!"
          />
          <Step
            num={6}
            action="מצאת את ערך הגבול של סדרה רקורסיבית"
            why="הגדרת גבול סדרה + רציפות"
            accentColor={C.green}
            conditions={[
              "כבר הוכחת שהגבול קיים (מונוטוניות + חסימות)",
              "f רציפה (כדי להעביר את הגבול פנימה)",
            ]}
            formalWrite={`"מאחר שהגבול קיים, נסמן lim aₙ = L. נעביר גבול בנוסחה: L = f(L). נפתור: L = ..."`}
            trap="לכתוב lim aₙ = L לפני שהוכחת קיום — זו טעות קלאסית!"
          />
          <Step
            num={7}
            action="הוכחת מונוטוניות של סדרה רקורסיבית באינדוקציה"
            why="אינדוקציה מתמטית"
            accentColor={C.green}
            conditions={[]}
            formalWrite={`"נוכיח ב-אינדוקציה שaₙ₊₁ ≥ aₙ. בסיס: a₂ = f(a₁) = ... ≥ a₁. צעד: נניח aₙ₊₁ ≥ aₙ, נוכיח aₙ₊₂ ≥ aₙ₊₁ ..."`}
          />
        </Topic>

        {/* ══ SECTION 3: DERIVATIVES ══ */}
        <Topic title="נגזרות — MVT, רול, דרבו, טיילור" subtitle="כלי ההוכחה המרכזיים" color="#4a148c">
          <Step
            num={8}
            action='מצאת c כך ש-f′(c) = 0 כי f(a)=f(b)'
            why="משפט רול"
            accentColor={C.purple}
            conditions={[
              "f רציפה ב-[a,b]",
              "f גזירה ב-(a,b)",
              "f(a) = f(b)",
            ]}
            formalWrite={`"f רציפה ב-[a,b], גזירה ב-(a,b), וf(a)=f(b). ממשפט רול, קיים c∈(a,b) כך שf′(c)=0"`}
            trap="לשכוח לבדוק f(a)=f(b)!"
          />
          <Step
            num={9}
            action="מצאת c כך שf′(c) = שיפוע ממוצע"
            why="משפט הערך הממוצע (MVT / Lagrange)"
            accentColor={C.purple}
            conditions={[
              "f רציפה ב-[a,b]",
              "f גזירה ב-(a,b)",
            ]}
            formalWrite={`"f רציפה ב-[a,b] וגזירה ב-(a,b). ממשפט הערך הממוצע (לגרנז'), קיים c∈(a,b) כך ש: f′(c) = (f(b)-f(a))/(b-a)"`}
          />
          <Step
            num={10}
            action="מצאת c כך שf′(c) = r כלשהו בין f′(a) לf′(b)"
            why="משפט דרבו המורחב"
            accentColor={C.purple}
            conditions={[
              "f גזירה ב-[a,b] (לא צריך רציפות של f′!)",
              "r נמצא בין f′(a) לf′(b)",
            ]}
            formalWrite={`"f גזירה ב-[a,b] וf′(a) < r < f′(b). ממשפט דרבו המורחב, קיים c∈(a,b) כך שf′(c)=r"`}
            trap="אל תשתמשי ב-IVT על f′ — f′ לא חייבת להיות רציפה! צריך דרבו."
          />
          <Step
            num={11}
            action="הסקת קיום c∈(a,b) כך שf(c)=0 (ערך ביניים)"
            why="משפט ערך הביניים (IVT)"
            accentColor={C.purple}
            conditions={[
              "f רציפה ב-[a,b]",
              "f(a) ו-f(b) בעלי סימנים שונים (או ערך יעד נמצא ביניהם)",
            ]}
            formalWrite={`"f רציפה ב-[a,b], f(a) = ... > 0 ו-f(b) = ... < 0. ממשפט ערך הביניים, קיים c∈(a,b) כך שf(c) = 0"`}
          />
          <Step
            num={12}
            action="השתמשת בפיתוח טיילור עם שארית"
            why="פיתוח טיילור עם שארית לגרנז'"
            accentColor={C.purple}
            conditions={[
              "f גזירה n+1 פעמים בסביבת x₀",
            ]}
            formalWrite={`"ממשפט טיילור, קיים ξ בין x₀ לx כך ש: f(x) = Σ f^(k)(x₀)/k! (x-x₀)^k + f^(n+1)(ξ)/(n+1)! (x-x₀)^(n+1)"`}
          />
        </Topic>

        {/* ══ SECTION 4: INTEGRALS ══ */}
        <Topic title="אינטגרלים — FTC, IBP, החלפת משתנה" subtitle="הצדקה פורמלית לכל שלב" color={C.teal}>
          <Step
            num={13}
            action="חישבת ∫f(x)dx = F(b)-F(a)"
            why="משפט ניוטון-לייבניץ (FTC1)"
            accentColor={C.teal}
            conditions={[
              "f רציפה ב-[a,b]",
              "F היא אנטי-נגזרת של f (F′=f)",
            ]}
            formalWrite={`"f רציפה ב-[a,b], F אנטי-נגזרת שלה. ממשפט ניוטון-לייבניץ: ∫_a^b f(x)dx = F(b)-F(a) = ..."`}
            trap="שימוש ב-N-L כשיש נקודת אי-רציפות בקטע! (כגון 1/x ב-[-1,1])"
          />
          <Step
            num={14}
            action="גזרת את הפונקציה F(x)=∫_a^x f(t)dt"
            why="משפט היסודי של החשבון (FTC2)"
            accentColor={C.teal}
            conditions={[
              "f רציפה בסביבת x",
            ]}
            formalWrite={`"ממשפט היסודי של החשבון (FTC2): F′(x) = d/dx ∫_a^x f(t)dt = f(x)"`}
          />
          <Step
            num={15}
            action="השתמשת באינטגרציה בחלקים"
            why="אינטגרציה בחלקים (IBP)"
            accentColor={C.teal}
            conditions={[
              "u, v גזירות",
              "בחרת נכון u ו-dv",
            ]}
            formalWrite={`"בבחירת u=... ו-v′=..., מאינטגרציה בחלקים: ∫u·v′dx = uv - ∫u′v dx = ..."`}
          />
          <Step
            num={16}
            action="עשית החלפת משתנה t=g(x)"
            why="משפט החלפת משתנה"
            accentColor={C.teal}
            conditions={[
              "g גזירה, g′ רציפה",
              "שינוי גבולות בהתאם לt=g(x)",
            ]}
            formalWrite={`"בהצבת t=g(x), dt=g′(x)dx, הגבולות משתנים ל-[g(a),g(b)]: ∫_a^b f(g(x))g′(x)dx = ∫_{g(a)}^{g(b)} f(t)dt = ..."`}
          />
          <Step
            num={17}
            action='אמרת שהאינטגרל שווה 0 כי הפונקציה אי-זוגית'
            why="משפט הפונקציה האי-זוגית על קטע סימטרי"
            accentColor={C.teal}
            conditions={[
              "f אי-זוגית: f(-x) = -f(x)",
              "הקטע הוא [-a,a]",
              "f אינטגרבילית על הקטע",
              "⚠ תקף רק לאינטגרל מסוים — לא לאינטגרל לא-אמיתי!",
            ]}
            formalWrite={`"f אי-זוגית ואינטגרבילית על [-a,a]. לפי משפט הפונקציה האי-זוגית: ∫_{-a}^{a} f(x)dx = 0"`}
            trap="להשתמש בזה על אינטגרל לא-אמיתי! (∫_{-∞}^{∞} x dx ≠ 0 — הוא מתבדר!)"
          />
        </Topic>

        {/* ══ SECTION 5: IMPROPER INTEGRALS ══ */}
        <Topic title="אינטגרלים לא אמיתיים" subtitle="הגדרה · השוואה · תנאים" color={C.amber}>
          <Step
            num={18}
            action="פצלת אינטגרל לא-אמיתי לשניים"
            why="הגדרת האינטגרל הלא-אמיתי"
            accentColor={C.amber}
            conditions={[
              "שני הגבולות חייבים להתכנס בנפרד",
            ]}
            formalWrite={`"לפי הגדרת האינטגרל הלא-אמיתי: ∫_{-∞}^{∞} f = ∫_{-∞}^{0} f + ∫_0^{∞} f = lim_{a→-∞}∫_a^0 f + lim_{b→∞}∫_0^b f"`}
            trap="לכתוב lim_{R→∞} ∫_{-R}^{R} f — זה ערך ראשי של קושי, לא האינטגרל הלא-אמיתי!"
          />
          <Step
            num={19}
            action="הסקת התכנסות מ-|f|≤g"
            why="מבחן ההשוואה לאינטגרלים"
            accentColor={C.amber}
            conditions={[
              "0 ≤ f(x) ≤ g(x) לכל x≥a",
              "∫_a^∞ g מתכנס",
            ]}
            formalWrite={`"מאחר ש-0≤f(x)≤g(x) לכל x≥a ו-∫_a^∞ g(x)dx מתכנס, ממבחן ההשוואה: ∫_a^∞ f(x)dx מתכנס"`}
          />
        </Topic>

        {/* ══ SECTION 6: SERIES ══ */}
        <Topic title="טורים — מבחני התכנסות" subtitle="כל מבחן: שם + תנאים + כתיבה" color="#b71c1c">
          <Divider label="מבחנים לטורים אי-שליליים בלבד" />
          <Step
            num={20}
            action="הסקת התבדרות כי האיבר הכללי לא שואף ל-0"
            why="תנאי הכרחי להתכנסות (קונטרה-פוזיטיב)"
            accentColor={C.red}
            conditions={["aₙ ↛ 0"]}
            formalWrite={`"מאחר ש-lim aₙ = ... ≠ 0, מהתנאי ההכרחי להתכנסות: הטור מתבדר"`}
            trap="aₙ → 0 לא מספיק! ∑1/n מתבדר למרות ש-1/n → 0"
          />
          <Step
            num={21}
            action="השווית הטור לp-series ידוע"
            why="p-series: ∑1/nᵖ מתכנס ↔ p>1"
            accentColor={C.red}
            conditions={["הטור מהצורה ∑1/nᵖ"]}
            formalWrite={`"הטור הוא p-series עם p=... . מאחר ש-p [>/<] 1, הטור [מתכנס/מתבדר]"`}
          />
          <Step
            num={22}
            action="השתמשת ב-LCT — מבחן ההשוואה הגבולי"
            why="מבחן ההשוואה הגבולי (LCT)"
            accentColor={C.red}
            conditions={[
              "aₙ, bₙ > 0",
              "lim aₙ/bₙ = L ∈ (0,∞) — לא 0 ולא ∞!",
            ]}
            formalWrite={`"מאחר ש-aₙ,bₙ>0 ו-lim(aₙ/bₙ) = L = ... ∈(0,∞), ממבחן ההשוואה הגבולי: ∑aₙ מתכנס ↔ ∑bₙ מתכנס. מאחר ש-∑bₙ [מתכנס/מתבדר], גם ∑aₙ [מתכנס/מתבדר]"`}
            trap="אם L=0 או L=∞ — LCT לא קובע! צריך CT רגיל."
          />
          <Step
            num={23}
            action="השתמשת במבחן האינטגרל"
            why="מבחן האינטגרל"
            accentColor={C.red}
            conditions={[
              "f חיובית, יורדת, רציפה ב-[1,∞)",
              "aₙ = f(n)",
            ]}
            formalWrite={`"f חיובית, יורדת ורציפה ב-[N,∞). ממבחן האינטגרל: ∑aₙ מתכנס ↔ ∫_N^∞ f(x)dx מתכנס"`}
            trap="לשכוח לבדוק שf יורדת!"
          />
          <Step
            num={24}
            action="השתמשת במבחן המנה"
            why="מבחן המנה (D'Alembert)"
            accentColor={C.red}
            conditions={[
              "aₙ > 0",
              "L = lim |aₙ₊₁/aₙ| קיים",
            ]}
            formalWrite={`"nנחשב lim|aₙ₊₁/aₙ| = ... = L. מאחר ש-L [</>] 1, ממבחן המנה: הטור [מתכנס בהחלט/מתבדר]"`}
            trap="L=1 — המבחן לא קובע! לנסות כלי אחר."
          />
          <Step
            num={25}
            action="השתמשת במבחן השורש"
            why="מבחן השורש (Cauchy)"
            accentColor={C.red}
            conditions={[
              "L = limsup |aₙ|^(1/n) קיים",
            ]}
            formalWrite={`"נחשב lim|aₙ|^(1/n) = ... = L. מאחר ש-L [</>] 1, ממבחן השורש: הטור [מתכנס בהחלט/מתבדר]"`}
          />
          <Divider label="טורים לא אי-שליליים" />
          <Step
            num={26}
            action="הסקת התכנסות מטור חלופי"
            why="מבחן לייבניץ (3 תנאים — כולם חייבים!)"
            accentColor={C.red}
            conditions={[
              "① aₙ ≥ 0",
              "② aₙ יורדת (monotone decreasing) — חובה!",
              "③ aₙ → 0",
            ]}
            formalWrite={`"① aₙ≥0, ② aₙ יורדת (הראינו ש-aₙ₊₁≤aₙ), ③ lim aₙ=0. ממבחן לייבניץ: ∑(-1)ⁿaₙ מתכנס"`}
            trap="לשכוח 'יורדת' — זה בדיוק מה שמבדיל מקרה נכון משגוי!"
          />
          <Step
            num={27}
            action="הסקת התכנסות מהתכנסות מוחלטת"
            why="משפט: התכנסות מוחלטת ⟹ התכנסות"
            accentColor={C.red}
            conditions={["∑|aₙ| מתכנס"]}
            formalWrite={`"הראינו ש-∑|aₙ| מתכנס, כלומר הטור מתכנס בהחלט. ממשפט ההתכנסות המוחלטת: ∑aₙ מתכנס"`}
          />
        </Topic>

        {/* ══ SECTION 7: POWER SERIES ══ */}
        <Topic title="טורי חזקות ומקלורן" subtitle="רדיוס · גזירה · אינטגרציה" color="#1a237e">
          <Step
            num={28}
            action="חישבת רדיוס התכנסות R"
            why="נוסחת הרדיוס (ממשפט קושי-הדמר)"
            accentColor="#3949ab"
            conditions={["הגבול lim|aₙ|^(1/n) [או lim|aₙ/aₙ₊₁|] קיים"]}
            formalWrite={`"ממשפט קושי-הדמר, רדיוס ההתכנסות: R = 1/limsup|aₙ|^(1/n) = 1/... = ...[או ממבחן המנה: R=lim|aₙ/aₙ₊₁|]"`}
          />
          <Step
            num={29}
            action="בדקת התכנסות בקצוות ±R"
            why="הגדרת תחום ההתכנסות"
            accentColor="#3949ab"
            conditions={[
              "קצוות |x|=R חייבים להיבדק בנפרד",
              "להציב x=R ו-x=-R ולהשתמש במבחן מתאים",
            ]}
            formalWrite={`"בקצה x=R: הטור הוא ∑aₙRⁿ = ... . מ[מבחן X], הטור [מתכנס/מתבדר]. בקצה x=-R: ... . לכן תחום ההתכנסות הוא [R-/R+/(-R,R)/[-R,R]]"`}
          />
          <Step
            num={30}
            action="גזרת/אינטגרלת טור חזקות"
            why="משפט גזירה/אינטגרציה של טורי חזקות"
            accentColor="#3949ab"
            conditions={[
              "בתוך הרדיוס: |x|<R",
              "הרדיוס R לא משתנה — אבל הקצוות כן!",
            ]}
            formalWrite={`"בתחום |x|<R, ממשפט גזירת טורי חזקות: (∑aₙxⁿ)′ = ∑naₙxⁿ⁻¹. הרדיוס נשאר R, אבל יש לבדוק קצוות מחדש"`}
            trap="לא לבדוק קצוות מחדש אחרי גזירה/אינטגרציה!"
          />
        </Topic>

        {/* ══ QUICK REFERENCE TABLE ══ */}
        <div style={{ background: C.card, borderRadius: 12, boxShadow: C.shadow, padding: "24px 28px", marginBottom: 28 }}>
          <h2 style={{ color: C.navy, fontSize: "1.3rem", fontWeight: 900, marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 10 }}>
            📋 טבלת עזר מהירה — שם המשפט לפי הפעולה
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: C.navy, color: "#fff" }}>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700 }}>מה עשית?</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700 }}>שם המשפט</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700 }}>תנאי מפתח</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["גזרת מונה/מכנה בגבול","כלל לופיטל","רק 0/0 או ∞/∞"],
                  ["סנדוויץ′ בין שני גבולות שווים","Squeeze Theorem","שני הצדדים → L"],
                  ["הסקת גבול = L מסדרה","הגדרת גבול (ε-N)","∀ε>0 ∃N: |aₙ-L|<ε"],
                  ["מונוטונית + חסומה → מתכנסת","משפט המונוטוני","הסדרה חייבת להיות גם מונוטונית וגם חסומה"],
                  ["f(a)=f(b) → f′(c)=0","משפט רול","רציפות ב-[a,b] + גזירות ב-(a,b)"],
                  ["קיים c עם שיפוע ממוצע","MVT (לגרנז′)","רציפות + גזירות"],
                  ["קיים c עם f′(c)=r בין הקצוות","דרבו המורחב","גזירות בלבד (ללא רציפות f′)"],
                  ["קיים c עם f(c)=0 (IVT)","ערך הביניים","רציפות + סימנים שונים"],
                  ["∫f = F(b)-F(a)","ניוטון-לייבניץ","f רציפה בקטע הסגור!"],
                  ["F′(x) = f(x) לפונקציה צוברת","FTC2","f רציפה ב-x"],
                  ["אינטגרציה בחלקים","IBP","u,v גזירות"],
                  ["הצבת t=g(x)","החלפת משתנה","שינוי גבולות בהתאם!"],
                  ["∑aₙ מתכנס → aₙ→0","תנאי הכרחי","קונטרה-פוזיטיב: aₙ↛0 → מתבדר"],
                  ["p>1 → ∑1/nᵖ מתכנס","p-series","p=1 הרמוני מתבדר!"],
                  ["lim aₙ/bₙ=L∈(0,∞) → אותה התנהגות","LCT","L חייב להיות בין 0 ל-∞"],
                  ["f יורדת → ∑f(n)≈∫f","מבחן האינטגרל","f חיובית, יורדת, רציפה"],
                  ["lim|aₙ₊₁/aₙ|<1 → מתכנס","מבחן המנה","L=1 לא קובע!"],
                  ["aₙ≥0 יורדת →0 + (-1)ⁿ","לייבניץ","שלושת התנאים חייבים! כולל 'יורדת'"],
                  ["∑|aₙ|<∞ → ∑aₙ מתכנס","התכנסות מוחלטת","ההפך לא נכון!"],
                  ["גזירת טור חזקות","FPS — גזירה","R לא משתנה, קצוות — בדוקי מחדש"],
                ].map(([action, thm, cond], i) => (
                  <tr key={i} style={{ background: i%2===0 ? "#fafafa" : "#fff", borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 14px", color: "#222" }}>{action}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: C.blue }}>{thm}</td>
                    <td style={{ padding: "9px 14px", color: "#555", fontSize: "0.83rem" }}>{cond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#888", fontSize: "0.85rem", padding: "16px 0" }}>
          אינפי ב׳ · מועד א׳ 01.07.2026 · יעד 90+ · מדריך נימוקים פורמליים
        </div>
      </div>
    </div>
  );
}

import type React from "react";
