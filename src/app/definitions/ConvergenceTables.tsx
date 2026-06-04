import { MathContent } from "@/components/study/MathContent";

/* ─── types ─── */
interface SeriesRow {
  name: string;
  formula: string;
  convergesWhen: string;
  divergesWhen: string;
  note?: string;
}

interface TestRow {
  name: string;
  tag: string;
  tagColor: "navy" | "green" | "teal" | "amber" | "red" | "purple";
  conditions: string;
  converges: string;
  diverges: string;
  inconclusive: string;
  bestFor: string;
}

interface IdentRow {
  shape: string;
  test: string;
  why: string;
}

/* ─── data ─── */
const SERIES_ROWS: SeriesRow[] = [
  {
    name: "טור הנדסי",
    formula: "$\\displaystyle\\sum_{n=0}^{\\infty} r^n$",
    convergesWhen: "$|r| < 1$ → סכום $\\dfrac{1}{1-r}$",
    divergesWhen: "$|r| \\ge 1$",
    note: "הטור הנדסי הוא הסרגל שממנו נגזרים מבחן מנה ושורש",
  },
  {
    name: "טור הרמוני",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{1}{n}$",
    convergesWhen: "לעולם לא",
    divergesWhen: "תמיד",
    note: "הדוגמה הקלאסית: $a_n \\to 0$ לא מספיק",
  },
  {
    name: "טור p-הרמוני",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{1}{n^p}$",
    convergesWhen: "$p > 1$",
    divergesWhen: "$p \\le 1$",
    note: "הסרגל המרכזי לכל השוואה",
  },
  {
    name: "טור הרמוני מתחלף",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n}$",
    convergesWhen: "תמיד (לייבניץ) → $\\ln 2$",
    divergesWhen: "לעולם לא",
    note: "מתכנס מותנית בלבד — הטור המוחלט הוא הרמוני",
  },
  {
    name: "טור $p$-הרמוני מתחלף",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n^p}$",
    convergesWhen: "$p > 0$ (לייבניץ)",
    divergesWhen: "$p \\le 0$",
    note: "$p > 1$ → מוחלטת; $0 < p \\le 1$ → מותנית",
  },
  {
    name: "טור טלסקופי",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)$",
    convergesWhen: "תמיד — $S_N = 1 - \\tfrac{1}{N+1} \\to 1$",
    divergesWhen: "לעולם לא",
    note: "רשמי כ-$\\sum (a_n - a_{n+1})$ — הסכומים החלקיים מתקצרים",
  },
  {
    name: "$\\sum n^k / a^n$",
    formula: "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{n^k}{a^n}\\;(a>1)$",
    convergesWhen: "תמיד ($a > 1$, כל $k$)",
    divergesWhen: "$a \\le 1$",
    note: "אקספוננציאל מנצח פולינום",
  },
  {
    name: "$\\sum 1/(n \\ln n)$",
    formula: "$\\displaystyle\\sum_{n=2}^{\\infty} \\dfrac{1}{n \\ln n}$",
    convergesWhen: "לעולם לא",
    divergesWhen: "תמיד",
    note: "מבחן אינטגרל: $\\int dx/(x\\ln x) = \\ln(\\ln x) \\to \\infty$",
  },
  {
    name: "$\\sum 1/(n(\\ln n)^p)$",
    formula: "$\\displaystyle\\sum_{n=2}^{\\infty} \\dfrac{1}{n(\\ln n)^p}$",
    convergesWhen: "$p > 1$",
    divergesWhen: "$p \\le 1$",
    note: "אנלוגי לטור p-הרמוני, עם $\\ln n$ במקום $n$",
  },
];

const TAG_COLORS: Record<TestRow["tagColor"], { bg: string; text: string; border: string }> = {
  navy:   { bg: "var(--navy-light)",   text: "var(--navy-mid)", border: "var(--navy-border)" },
  green:  { bg: "var(--green-light)",  text: "var(--green)",    border: "var(--green-border)" },
  teal:   { bg: "var(--teal-light)",   text: "var(--teal)",     border: "var(--teal-border)" },
  amber:  { bg: "var(--amber-light)",  text: "var(--amber-mid)",border: "var(--amber-border)" },
  red:    { bg: "var(--red-light)",    text: "var(--red-mid)",  border: "var(--red-border)" },
  purple: { bg: "var(--purple-light)", text: "var(--purple)",   border: "var(--purple-border)" },
};

const TEST_ROWS: TestRow[] = [
  {
    name: "תנאי הכרחי",
    tag: "ראשון תמיד",
    tagColor: "red",
    conditions: "כל טור",
    converges: "—",
    diverges: "$a_n \\not\\to 0$",
    inconclusive: "$a_n \\to 0$",
    bestFor: "כל שאלה — בדיקה ראשונה",
  },
  {
    name: "השוואה",
    tag: "משפט",
    tagColor: "navy",
    conditions: "$0 \\le a_n \\le b_n$",
    converges: "$\\sum b_n < \\infty$",
    diverges: "$\\sum b_n = \\infty$ ו-$a_n \\ge b_n$",
    inconclusive: "$\\sum b_n = \\infty$ ו-$a_n \\le b_n$",
    bestFor: "כשניתן למצוא אי-שוויון ישיר",
  },
  {
    name: "גבול השוואה",
    tag: "משפט",
    tagColor: "navy",
    conditions: "$a_n, b_n > 0$",
    converges: "$L \\in (0,\\infty)$ וגם $\\sum b_n < \\infty$",
    diverges: "$L \\in (0,\\infty)$ וגם $\\sum b_n = \\infty$",
    inconclusive: "$L = 0$ או $L = \\infty$ — חד-כיווני בלבד",
    bestFor: "פולינום/שבר רציונלי — משווים ל-$1/n^p$",
  },
  {
    name: "שורש (קושי)",
    tag: "משפט",
    tagColor: "teal",
    conditions: "$L = \\lim \\sqrt[n]{|a_n|}$",
    converges: "$L < 1$",
    diverges: "$L > 1$",
    inconclusive: "$L = 1$",
    bestFor: "$(f(n))^n$, $n^n$ — כשיש חזקה-$n$",
  },
  {
    name: "מנה (ד'אלמבר)",
    tag: "משפט",
    tagColor: "teal",
    conditions: "$a_n > 0$, $L = \\lim |a_{n+1}/a_n|$",
    converges: "$L < 1$",
    diverges: "$L > 1$",
    inconclusive: "$L = 1$",
    bestFor: "$n!$, $a^n$ — כשיש עצרת או חזקה",
  },
  {
    name: "אינטגרל",
    tag: "משפט",
    tagColor: "green",
    conditions: "$f$ יורדת, חיובית, רציפה; $a_n = f(n)$",
    converges: "$\\int_k^\\infty f(x)\\,dx < \\infty$",
    diverges: "$\\int_k^\\infty f(x)\\,dx = \\infty$",
    inconclusive: "—",
    bestFor: "$1/(n\\ln n)$, $1/(n^p)$ — כשהאינטגרל קל",
  },
  {
    name: "לייבניץ",
    tag: "משפט",
    tagColor: "purple",
    conditions: "$\\sum (-1)^n b_n$, $b_n > 0$, $b_n\\searrow 0$",
    converges: "שני התנאים מתקיימים",
    diverges: "—",
    inconclusive: "לא בודק התבדרות",
    bestFor: "טורים מתחלפים, אחרי בדיקת מוחלטת",
  },
];

const IDENT_ROWS: IdentRow[] = [
  { shape: "$a_n \\not\\to 0$", test: "מתבדר מיד (תנאי הכרחי)", why: "בדיקה ראשונה, תמיד" },
  { shape: "$(f(n))^n$ או $n^n$", test: "שורש", why: "השורש-$n$ מוריד את החזקה" },
  { shape: "$n!$ או $a^n$", test: "מנה", why: "המנה מפשטת את העצרת" },
  { shape: "$P(n)/Q(n)$ — פולינומים", test: "גבול השוואה ל-$1/n^{\\deg Q - \\deg P}$", why: "החזקה הדומיננטית קובעת" },
  { shape: "$1/n^p$ ישיר", test: "טור $p$ — תשובה מיידית", why: "מקרה מוכר: $p>1$ מתכנס" },
  { shape: "$\\ln n$, $\\arctan$, פונקציה רציפה", test: "אינטגרל", why: "האינטגרל של $f(x)$ קל לחישוב" },
  { shape: "$(-1)^n \\cdot b_n$", test: "קודם מוחלטת, אחר-כך לייבניץ", why: "מוחלטת חזקה יותר — בדקי קודם" },
  { shape: "$a_n \\approx b_n$ בסדר גודל", test: "גבול השוואה", why: "היחס $a_n/b_n \\to L$ קובע גורל משותף" },
  { shape: "$0 \\le a_n \\le b_n$ ברור", test: "השוואה ישירה", why: "גדול מתכנס → קטן מתכנס" },
];

/* ─── components ─── */
export function ConvergenceTables() {
  return (
    <div className="space-y-12">
      <SeriesTable />
      <TestsTable />
      <IdentificationTable />
    </div>
  );
}

function TableSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2
          className="text-xl font-black"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function SeriesTable() {
  return (
    <TableSection
      title="טורים מיוחדים — מתי מתכנס?"
      subtitle="כל הטורים הנפוצים בקורס עם תנאי ההתכנסות שלהם"
    >
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm border-collapse" dir="rtl">
          <thead>
            <tr style={{ background: "var(--navy)", color: "#fff" }}>
              <Th>שם הטור</Th>
              <Th>נוסחה</Th>
              <Th color="var(--green-light)" textColor="var(--green)">מתכנס כאשר</Th>
              <Th color="var(--red-light)" textColor="var(--red-mid)">מתבדר כאשר</Th>
              <Th>הערה</Th>
            </tr>
          </thead>
          <tbody>
            {SERIES_ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-subtle)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <td className="px-4 py-3 font-bold" style={{ color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {row.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <MathContent text={row.formula} className="text-sm" />
                </td>
                <td className="px-4 py-3">
                  <div
                    className="rounded-md px-2.5 py-1.5"
                    style={{ background: "var(--green-light)", border: "1px solid var(--green-border)" }}
                  >
                    <MathContent text={row.convergesWhen} className="text-xs" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="rounded-md px-2.5 py-1.5"
                    style={{ background: "var(--red-light)", border: "1px solid var(--red-border)" }}
                  >
                    <MathContent text={row.divergesWhen} className="text-xs" />
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)", maxWidth: "220px" }}>
                  {row.note && <MathContent text={row.note} className="text-xs" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableSection>
  );
}

function TestsTable() {
  return (
    <TableSection
      title="מבחני התכנסות — כל המבחנים"
      subtitle="תנאים, מסקנות, וגבולות המבחן"
    >
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm border-collapse" dir="rtl">
          <thead>
            <tr style={{ background: "var(--navy)", color: "#fff" }}>
              <Th>מבחן</Th>
              <Th>תנאים להפעלה</Th>
              <Th color="var(--green-light)" textColor="var(--green)">מתכנס אם</Th>
              <Th color="var(--red-light)" textColor="var(--red-mid)">מתבדר אם</Th>
              <Th color="var(--amber-light)" textColor="var(--amber-mid)">לא חושף אם</Th>
              <Th>מתאים ל...</Th>
            </tr>
          </thead>
          <tbody>
            {TEST_ROWS.map((row, i) => {
              const tagColors = TAG_COLORS[row.tagColor];
              return (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-subtle)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
                    <p className="font-black text-xs mb-1" style={{ color: "var(--text-primary)" }}>
                      {row.name}
                    </p>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ background: tagColors.bg, color: tagColors.text, border: `1px solid ${tagColors.border}` }}
                    >
                      {row.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <MathContent text={row.conditions} className="text-xs" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="rounded px-2 py-1" style={{ background: "var(--green-light)" }}>
                      <MathContent text={row.converges} className="text-xs" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="rounded px-2 py-1" style={{ background: row.diverges === "—" ? "var(--bg-subtle)" : "var(--red-light)" }}>
                      <MathContent text={row.diverges} className="text-xs" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--amber-mid)" }}>
                    <MathContent text={row.inconclusive} className="text-xs" />
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {row.bestFor}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TableSection>
  );
}

function IdentificationTable() {
  return (
    <TableSection
      title="זיהוי מהיר — לפי צורת $a_n$"
      subtitle="ראית את הצורה? ← בחרי את המבחן"
    >
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm border-collapse" dir="rtl">
          <thead>
            <tr style={{ background: "var(--navy)", color: "#fff" }}>
              <Th>צורת $a_n$</Th>
              <Th color="var(--teal-light)" textColor="var(--teal)">המבחן / הכלי</Th>
              <Th>למה דווקא זה?</Th>
            </tr>
          </thead>
          <tbody>
            {IDENT_ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-subtle)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <td className="px-4 py-3">
                  <div
                    className="rounded-md px-3 py-1.5 inline-block"
                    style={{ background: "var(--navy-light)", border: "1px solid var(--navy-border)" }}
                  >
                    <MathContent text={row.shape} className="text-sm font-bold" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-black text-sm" style={{ color: "var(--teal)" }}>
                    <MathContent text={row.test} className="text-sm font-black" />
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  <MathContent text={row.why} className="text-xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick callouts */}
      <div className="grid gap-3 sm:grid-cols-3 mt-4">
        <Callout
          color="var(--red-mid)"
          bg="var(--red-light)"
          border="var(--red-border)"
          title="תמיד ראשון"
          text="תנאי הכרחי: $a_n \to 0$? אם לא — מתבדר. זה חוסך 90% מהמקרים."
        />
        <Callout
          color="var(--amber-mid)"
          bg="var(--amber-light)"
          border="var(--amber-border)"
          title="$L = 1$ — מה עושים?"
          text="מנה ושורש נכשלו? נסי גבול השוואה ל-$1/n^p$ או מבחן אינטגרל."
        />
        <Callout
          color="var(--purple)"
          bg="var(--purple-light)"
          border="var(--purple-border)"
          title="יש $(-1)^n$?"
          text="קודם בדקי מוחלטת. אם לא — לייבניץ. רק אחר-כך מסיקים מותנית."
        />
      </div>
    </TableSection>
  );
}

function Th({
  children,
  color,
  textColor,
}: {
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <th
      className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide"
      style={{
        background: color ?? "transparent",
        color: textColor ?? "#fff",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Callout({
  color,
  bg,
  border,
  title,
  text,
}: {
  color: string;
  bg: string;
  border: string;
  title: string;
  text: string;
}) {
  return (
    <div
      className="rounded-xl border-r-4 px-4 py-3.5"
      style={{
        borderColor: border,
        borderRightColor: color,
        borderRightWidth: "4px",
        background: bg,
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color }}>
        {title}
      </p>
      <MathContent text={text} className="text-xs" />
    </div>
  );
}
