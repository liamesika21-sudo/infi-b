"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MathContent } from "@/components/study/MathContent";

/* ═══════════════════════════════════════════════════════════════
   תוכנית חרישה — 8 ימים עד המבחן (24.6 → 1.7), מבחן 3.7.2026
   מבוסס על: המדריך השבועי (ד״ר יוסי שמאי), רשימת המשפטים וההוכחות,
   ניתוח מלא של מבחני העבר, ושיעורי הבית.
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "infi-studyplan-v1";

type ChkMap = Record<string, boolean>;

/* ── סוגי משימה ── */
type Item = string | { t: string; href?: string; hl?: string };

interface Section {
  key: string;
  icon: string;
  title: string;
  color: string;
  items: Item[];
}

interface Day {
  id: string;
  date: string;       // "24.6"
  weekday: string;    // "רביעי"
  hours: number;
  title: string;
  subtitle: string;
  type: "learn" | "exam" | "light";
  weeks: number[];    // שבועות מהמדריך שהיום מכסה
  sections: Section[];
}

/* ───────────────────────── צבעים ───────────────────────── */
const C = {
  navy: "var(--navy)",
  cyan: "var(--cyan)",
  green: "var(--green)",
  purple: "var(--purple)",
  gold: "var(--gold)",
  red: "var(--red-mid)",
  amber: "var(--amber-mid)",
};

/* ───────────────── 10 ההוכחות לשנן בעל-פה ───────────────── */
const PROOFS_10: { n: number; name: string; week: number }[] = [
  { n: 1, name: "משפט לייבניץ (התכנסות + חסם השארית)", week: 8 },
  { n: 2, name: "מבחן המנה (דאלמבר) — $L<1 \\Rightarrow$ מתכנס", week: 7 },
  { n: 3, name: "מבחן השורש (קושי–הדמר)", week: 7 },
  { n: 4, name: "משפט אבל — התכנסות בנקודה $\\Rightarrow$ בהחלט פנימה", week: 9 },
  { n: 5, name: "המשפט היסודי של החדו״א (FTC)", week: 4 },
  { n: 6, name: "אי-רציונליות של $e$", week: 10 },
  { n: 7, name: "קריטריון השוואה / השוואה גבולי", week: 6 },
  { n: 8, name: "משפט תת-סדרה (גבול תת-סדרה = גבול הסדרה)", week: 2 },
  { n: 9, name: "תנאי הכרחי — $\\sum a_n$ מתכנס $\\Rightarrow a_n \\to 0$", week: 6 },
  { n: 10, name: "קריטריון אינטגרביליות רימן", week: 4 },
];

/* ───────── המשפטים לפי שבוע (הדף הראשון: מה יש לכל שבוע) ───────── */
interface WeekRef {
  week: number;
  lecture: string;     // הרצאה/תרגול
  title: string;
  weight: "לב המבחן" | "חשוב" | "בסיס";
  dayId: string;       // באיזה יום בתוכנית לומדים
  theorems: string[];  // שמות המשפטים לשנן
  proofs: number[];    // אילו מ-10 ההוכחות שייכים לשבוע
}

const WEEKS: WeekRef[] = [
  {
    week: 1, lecture: "תרגול 1", title: "גבולות, לופיטל ומשפט דרבו", weight: "בסיס", dayId: "d1",
    theorems: ["כלל לופיטל — התנאים! (רק $\\frac{0}{0}$ או $\\frac{\\infty}{\\infty}$)", "משפט דרבו (ערך ביניים לנגזרת)"],
    proofs: [],
  },
  {
    week: 2, lecture: "הרצאה 1", title: "סדרות: מונוטוניות, חסימות, היינה ורקורסיה", weight: "בסיס", dayId: "d1",
    theorems: ["הגדרת גבול סדרה", "משפט הסדרה המונוטונית (הכלי לרקורסיה)", "הלמה של היינה", "משפט תת-סדרה (משפט 5, הרצאה 1)", "רעיון נקודת השבת"],
    proofs: [8],
  },
  {
    week: 3, lecture: "הרצאה 2", title: "אינטגרל לא מסוים: קדומה, הצבה, חלקים", weight: "חשוב", dayId: "d1",
    theorems: ["טבלת אינטגרלים + הצבה ליניארית", "אינטגרציה בחלקים", "החלפת משתנה (הצבה)"],
    proofs: [],
  },
  {
    week: 4, lecture: "הרצאה 3", title: "אינטגרל מסוים, FTC וניוטון–לייבניץ", weight: "חשוב", dayId: "d2",
    theorems: ["המשפט היסודי (FTC)", "ניוטון–לייבניץ (התנאי: רציפות!)", "FTC מוכלל (גבול עליון מורכב)", "תכונות + משפט הערך הממוצע האינטגרלי", "קריטריון אינטגרביליות רימן"],
    proofs: [5, 10],
  },
  {
    week: 5, lecture: "הרצאה 4", title: "אינטגרלים לא אמיתיים: התכנסות והשוואה", weight: "חשוב", dayId: "d2",
    theorems: ["הגדרת אינטגרל לא אמיתי (פיצול — אין קיזוז!)", "מבחן ה-$p$ לאינטגרל", "מבחן ההשוואה לאינטגרלים"],
    proofs: [],
  },
  {
    week: 6, lecture: "הרצאה 5", title: "טורים: סכומים חלקיים, גיאומטרי, טלסקופי, $p$", weight: "לב המבחן", dayId: "d3",
    theorems: ["הגדרת טור ($S_N$ מול $a_n$)", "תנאי הכרחי", "טור $p$ / גיאומטרי (החוצצים)", "מבחן השוואה / השוואה גבולי"],
    proofs: [9, 7],
  },
  {
    week: 7, lecture: "הרצאה 6", title: "מבחני התכנסות: שורש, מנה, אינטגרל, השוואה גבולי", weight: "לב המבחן", dayId: "d3",
    theorems: ["מבחן השורש (קושי)", "מבחן המנה (דאלמבר)", "מבחן האינטגרל", "השוואה גבולי (מלא)"],
    proofs: [2, 3],
  },
  {
    week: 8, lecture: "הרצאה 7", title: "התכנסות בהחלט/בתנאי, לייבניץ, סוגריים", weight: "לב המבחן", dayId: "d4",
    theorems: ["התכנסות בהחלט", "התכנסות בתנאי (הגדרה)", "מבחן לייבניץ", "משפט הסוגריים"],
    proofs: [1],
  },
  {
    week: 9, lecture: "הרצאה 8", title: "טורי חזקות, משפט אבל ורדיוס התכנסות", weight: "לב המבחן", dayId: "d4",
    theorems: ["הגדרת טור חזקות", "משפט אבל", "רדיוס ותחום התכנסות (בדיקת קצוות!)"],
    proofs: [4],
  },
  {
    week: 10, lecture: "הרצאה 9", title: "גזירה/אינטגרציה איבר-איבר + הטורים המוכרים", weight: "לב המבחן", dayId: "d5",
    theorems: ["גזירה/אינטגרציה איבר-איבר (הרדיוס נשמר)", "5 הטורים המוכרים — לשנן!", "אי-רציונליות של $e$"],
    proofs: [6],
  },
  {
    week: 11, lecture: "הרצאה 10", title: "יחידות המקדמים + טור/פולינום טיילור", weight: "לב המבחן", dayId: "d5",
    theorems: ["משפט היחידות", "פולינום/טור טיילור", "אסטרטגיית נגזרת גבוהה ($f^{(n)}(0)=n!\\cdot a_n$)"],
    proofs: [],
  },
];

/* ───────── 5 הטורים המוכרים — בעל פה ───────── */
const KNOWN_SERIES = [
  "$\\dfrac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n \\quad (|x|<1)$",
  "$e^x = \\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!} \\quad (\\forall x)$",
  "$\\ln(1+x) = \\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}x^n}{n} \\quad (-1<x\\le 1)$",
  "$\\arctan x = \\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n+1}}{2n+1} \\quad (|x|\\le 1)$",
  "$\\sin x,\\ \\cos x$ — מתוך $e^x$ (זוגי/אי-זוגי)",
];

/* ───────── חתימות חוזרות במבחנים (תרגלי עד שינה) ───────── */
const SIGNATURES = [
  { t: "$\\arctan(x)/x$ → מציאת טור + חילוץ מקדם", src: "2023א, 2025א, סימולציה" },
  { t: "סדרה רקורסיבית → הוכחת קיום גבול ואז חישובו", src: "סימולציה = ש״ב 2 שאלה 5א מילה במילה" },
  { t: "מבחן סוגריים → קריסה לטור הרמוני מתבדר", src: "2024א, 2024ב, 2025א" },
  { t: "סנדוויץ׳ אינטגרל (חסימה ע״י מונוטוניות)", src: "2024א, 2025ב" },
  { t: "טור פרמטרי ״מצא כל $\\alpha$״ עם מבחן שורש", src: "2024א, 2025ב" },
];

/* ───────── מלכודות — אל תשכחי אף פעם ───────── */
const PITFALLS = [
  { title: "תנאי הכרחי לא מספיק!", body: "אם $a_n \\to 0$ זה לא אומר שהטור מתכנס — ההרמוני $\\sum 1/n$ מתבדר." },
  { title: "לופיטל — רק $\\frac{0}{0}$ או $\\frac{\\infty}{\\infty}$", body: "אסור לופיטל כשהגבול אינו צורה לא-מוגדרת. נקודת הפסד נפוצה (ש״ב 1, 4a)." },
  { title: "קודם קיום, אחר כך ערך", body: "בסדרה רקורסיבית — אסור להניח שגבול קיים ואז ״למצוא״ אותו. קודם מוכיחים קיום!" },
  { title: "אין קיזוז באינטגרל לא אמיתי", body: "סינגולריות פנימית ($\\int_{-1}^{1} \\frac{1}{x}$) — לפצל לשני גבולות נפרדים; אם אחד מתבדר — הכול מתבדר." },
  { title: "קצוות בטורי חזקות — תמיד!", body: "רדיוס נותן קטע פתוח $(-R,R)$. חייבים לבדוק כל קצה ($x=\\pm R$) ידנית." },
  { title: "לייבניץ דורש $a_n$ יורד מונוטוני", body: "לא מספיק ש-$a_n \\to 0$ — היא חייבת לרדת. (ש״ב 8, 4c — דוגמה נגדית)." },
  { title: "$L=1$ בשורש/מנה = חוסר הכרעה", body: "עברי לכלי אחר — בד״כ השוואה גבולי, או מבחן אינטגרל." },
  { title: "$dx$ בהצבה + אסור לשנות סדר סכימה", body: "בהצבה $u=f(x)$ — להחליף גם $dx$. ובטור אינסופי אין קומוטטיביות." },
];

/* ───────── מחוץ לחומר (0%) ───────── */
const OUT_OF_SCOPE = "כל הרב-משתנה · שארית לגרנז׳/טיילור כחסם שגיאה · משפט קושי לערך הממוצע. אל תבזבזי עליהם דקה.";

/* ═══════════════════════════ הימים ═══════════════════════════ */
const DAYS: Day[] = [
  /* ───────── יום 1 ───────── */
  {
    id: "d1", date: "24.6", weekday: "רביעי", hours: 6, type: "learn",
    title: "בסיס: סדרות רקורסיביות + אינטגרל לא מסוים",
    subtitle: "שבועות 1–3 · רקורסיה היא חתימת מבחן · אינטגרציה היא תנאי מקדים לכול",
    weeks: [1, 2, 3],
    sections: [
      {
        key: "learn", icon: "📖", title: "מה ללמוד", color: C.navy, items: [
          "סדרות: מונוטוניות + חסימות → התכנסות. הלמה של היינה (איך ״לופיטל״ על סדרה).",
          "רקורסיה: קודם מוכיחים קיום גבול (מונוטוני + חסום), ורק אז $L = f(L)$.",
          "אינטגרל לא מסוים: טבלה + הצבה ליניארית, אינטגרציה בחלקים, החלפת משתנה.",
        ],
      },
      {
        key: "thm", icon: "📐", title: "משפטים לשנן בעל פה", color: C.purple, items: [
          { t: "שבוע 2 — משפט הסדרה המונוטונית + הלמה של היינה + משפט תת-סדרה (הרצאה 1)", href: "/weeks/2", hl: "שבוע 2" },
          { t: "שבוע 1 — כלל לופיטל (התנאים!) + משפט דרבו", href: "/weeks/1", hl: "שבוע 1" },
          { t: "שבוע 3 — אינטגרציה בחלקים + נוסחת ההצבה $\\int g(F(x))f(x)\\,dx$", href: "/weeks/3", hl: "שבוע 3" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "הוכחות לדעת (מתוך ה-10)", color: C.red, items: [
          { t: "הוכחה #8 — משפט תת-סדרה (גבול תת-סדרה = גבול הסדרה)", href: "/theorems", hl: "משפטים" },
          "הלמה של היינה — לכתוב מהזיכרון (תרגול)",
        ],
      },
      {
        key: "ex", icon: "✏️", title: "תרגילים ושיעורי בית ספציפיים", color: C.green, items: [
          { t: "ש״ב 2, שאלה 5(a) — $a_{n+1}=\\sqrt{2+a_n}$ — הוכחה מלאה. הופיע בסימולציה מילה במילה!", href: "/weeks/2", hl: "ש״ב 2" },
          { t: "ש״ב 2, שאלה 5(b) — רקורסיה: עולה + חסומה מלעיל, ואז מציאת הגבול", href: "/weeks/2", hl: "ש״ב 2" },
          { t: "ש״ב 1, שאלות 1(b), 1(d), 4(a) — לופיטל + מתי אסור לופיטל", href: "/weeks/1", hl: "ש״ב 1" },
          { t: "ש״ב 3, שאלות 1(a), 1(d), 2(a) — הצבת שורש, פישוט שבר, ״החזרת האינטגרל לאגף שמאל״", href: "/weeks/3", hl: "ש״ב 3" },
        ],
      },
      {
        key: "tip", icon: "💡", title: "טריקים ומלכודות", color: C.amber, items: [
          "טעות קטלנית: להניח שהגבול קיים ואז ״לחשב״ אותו — קודם מוכיחים קיום!",
          "אין ״אינטגרל של מכפלה = מכפלת אינטגרלים״. שתי קדומות נבדלות בקבוע בלבד.",
        ],
      },
    ],
  },

  /* ───────── יום 2 ───────── */
  {
    id: "d2", date: "25.6", weekday: "חמישי", hours: 6, type: "learn",
    title: "אינטגרל מסוים + FTC + אינטגרל לא אמיתי",
    subtitle: "שבועות 4–5 · FTC ואינטגרל לא אמיתי = 30% מהמבחן",
    weeks: [4, 5],
    sections: [
      {
        key: "learn", icon: "📖", title: "מה ללמוד", color: C.navy, items: [
          "FTC + ניוטון–לייבניץ (התנאי הוא רציפות!). FTC מוכלל עם גבול עליון מורכב.",
          "סכום רימן ← אינטגרל: מתכון הזיהוי (מבחן קלאסי, מחבר סדרות + אינטגרל).",
          "אינטגרל לא אמיתי: הגדרה כגבול, פיצול נכון (אין קיזוז!), מבחן $p$ ומבחן השוואה.",
        ],
      },
      {
        key: "thm", icon: "📐", title: "משפטים לשנן בעל פה", color: C.purple, items: [
          { t: "שבוע 4 — FTC, ניוטון–לייבניץ, FTC מוכלל, ערך ממוצע, קריטריון רימן (הרצאה 3)", href: "/weeks/4", hl: "שבוע 4" },
          { t: "שבוע 5 — הגדרת אינטגרל לא אמיתי, מבחן ה-$p$, מבחן ההשוואה (הרצאה 4)", href: "/weeks/5", hl: "שבוע 5" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "הוכחות לדעת (מתוך ה-10)", color: C.red, items: [
          { t: "הוכחה #5 — המשפט היסודי (FTC)", href: "/theorems", hl: "משפטים" },
          { t: "הוכחה #10 — קריטריון אינטגרביליות רימן", href: "/theorems", hl: "משפטים" },
        ],
      },
      {
        key: "ex", icon: "✏️", title: "תרגילים ושיעורי בית ספציפיים", color: C.green, items: [
          { t: "ש״ב 4, שאלה 4 — זיהוי סכום רימן כאינטגרל (הכי חשוב השבוע)", href: "/weeks/4", hl: "ש״ב 4" },
          { t: "ש״ב 4, שאלות 3(c) [FTC מוכלל + לופיטל], 2(b) [חסימת אינטגרל ע״י מונוטוניות]", href: "/weeks/4", hl: "ש״ב 4" },
          { t: "ש״ב 5, שאלה 1(a) — פיצול נכון לשני גבולות (הנקודה שאסור לקזז)", href: "/weeks/5", hl: "ש״ב 5" },
          { t: "ש״ב 5, שאלות 2(b) [חסימה מלמעלה→התכנסות], 2(c) [חסימה מלמטה→התבדרות]", href: "/weeks/5", hl: "ש״ב 5" },
        ],
      },
      {
        key: "tip", icon: "💡", title: "טריקים ומלכודות", color: C.amber, items: [
          "כלל זהב: קודם פותחים לפי ההגדרה (גבול), ורק בתוך הגבול משתמשים בניוטון–לייבניץ.",
          "מלכודת: $\\int_{-1}^{1}\\frac{1}{x}dx$ מתבדר! אסור טיעון אי-זוגיות סביב סינגולריות.",
        ],
      },
    ],
  },

  /* ───────── יום 3 ───────── */
  {
    id: "d3", date: "26.6", weekday: "שישי", hours: 6, type: "learn",
    title: "טורים: בסיס + כל מבחני ההתכנסות ⭐ לב המבחן",
    subtitle: "שבועות 6–7 · זה ה-60% — תני לזה את מירב הזמן",
    weeks: [6, 7],
    sections: [
      {
        key: "learn", icon: "📖", title: "מה ללמוד", color: C.navy, items: [
          "הגדרת טור ($S_N$ מול $a_n$), גיאומטרי, טלסקופי, טור $p$. תנאי הכרחי ככלי פסילה.",
          "תרשים בחירת מבחן: חזקות→שורש · עצרות/מכפלות→מנה · ״ביטוי+נגזרתו״→אינטגרל · $\\sin$/חסום→השוואה · סדר גודל ברור→השוואה גבולי.",
          "מה עושים כש-$L=1$ בשורש/מנה: עוברים להשוואה גבולי או מבחן אינטגרל.",
        ],
      },
      {
        key: "thm", icon: "📐", title: "משפטים לשנן בעל פה", color: C.purple, items: [
          { t: "שבוע 6 — תנאי הכרחי, גיאומטרי/$p$, מבחן השוואה/השוואה גבולי (הרצאה 5)", href: "/weeks/6", hl: "שבוע 6" },
          { t: "שבוע 7 — מבחן השורש, מבחן המנה, מבחן האינטגרל, השוואה גבולי מלא (הרצאה 6)", href: "/weeks/7", hl: "שבוע 7" },
          { t: "טבלאות ההכרעה המלאות", href: "/definitions", hl: "הגדרות" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "הוכחות לדעת (מתוך ה-10)", color: C.red, items: [
          { t: "הוכחה #9 — תנאי הכרחי ($\\sum a_n$ מתכנס $\\Rightarrow a_n\\to 0$)", href: "/theorems", hl: "משפטים" },
          { t: "הוכחה #7 — קריטריון השוואה / השוואה גבולי", href: "/theorems", hl: "משפטים" },
          { t: "הוכחה #2 — מבחן המנה · הוכחה #3 — מבחן השורש", href: "/theorems", hl: "משפטים" },
        ],
      },
      {
        key: "ex", icon: "✏️", title: "תרגילים ושיעורי בית ספציפיים", color: C.green, items: [
          { t: "ש״ב 6, שאלה 1(a) — פירוק לשני גיאומטריים + ערך מדויק · 1(e) — טור טלסקופי", href: "/weeks/6", hl: "ש״ב 6" },
          { t: "ש״ב 6, שאלה 2(b) — כפל בצמוד → השוואה גבולי", href: "/weeks/6", hl: "ש״ב 6" },
          { t: "ש״ב 7, שאלה 1(a) — מבחן מנה · 1(d) — מבחן שורש על חזקה $n$", href: "/weeks/7", hl: "ש״ב 7" },
          { t: "ש״ב 7, שאלה 2 — מבחן אינטגרל עם $\\ln$ (החוצצים הלוגריתמיים)", href: "/weeks/7", hl: "ש״ב 7" },
        ],
      },
      {
        key: "tip", icon: "💡", title: "טריקים ומלכודות", color: C.amber, items: [
          "אסור לפצל טור ל-$\\sum a + \\sum b$ בלי לדעת ששניהם מתכנסים.",
          "שרשרת סדרי גודל: $\\ln n \\ll n^\\varepsilon \\ll a^n \\ll n! \\ll n^n$.",
        ],
      },
    ],
  },

  /* ───────── יום 4 ───────── */
  {
    id: "d4", date: "27.6", weekday: "שבת", hours: 6, type: "learn",
    title: "התכנסות בהחלט/בתנאי + לייבניץ + טורי חזקות ⭐ לב",
    subtitle: "שבועות 8–9 · המשך הליבה — לייבניץ ואבל הם הוכחות חובה",
    weeks: [8, 9],
    sections: [
      {
        key: "learn", icon: "📖", title: "מה ללמוד", color: C.navy, items: [
          "התכנסות בהחלט ⟹ התכנסות. התכנסות בתנאי: מתכנס אבל $\\sum|a_n|=\\infty$.",
          "מבחן לייבניץ ($a_n$ יורד ל-0) + משפט הסוגריים (קונטרה-פוזיטיב: אחרי סוגריים מתבדר ⟹ המקורי מתבדר).",
          "טור חזקות: הגדרה, משפט אבל, רדיוס ותחום התכנסות — ותמיד בדיקת קצוות ידנית.",
        ],
      },
      {
        key: "thm", icon: "📐", title: "משפטים לשנן בעל פה", color: C.purple, items: [
          { t: "שבוע 8 — התכנסות בהחלט/בתנאי, מבחן לייבניץ, משפט הסוגריים (הרצאה 7)", href: "/weeks/8", hl: "שבוע 8" },
          { t: "שבוע 9 — הגדרת טור חזקות, משפט אבל, רדיוס ותחום התכנסות (הרצאה 8)", href: "/weeks/9", hl: "שבוע 9" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "הוכחות לדעת (מתוך ה-10)", color: C.red, items: [
          { t: "הוכחה #1 — משפט לייבניץ (התכנסות + חסם השארית)", href: "/theorems", hl: "משפטים" },
          { t: "הוכחה #4 — משפט אבל (התכנסות בנקודה ⟹ בהחלט פנימה)", href: "/theorems", hl: "משפטים" },
        ],
      },
      {
        key: "ex", icon: "✏️", title: "תרגילים ושיעורי בית ספציפיים", color: C.green, items: [
          { t: "ש״ב 8, שאלה 1(b) — צמוד → לא בהחלט → לייבניץ → מתכנס בתנאי (התהליך המלא)", href: "/weeks/8", hl: "ש״ב 8" },
          { t: "ש״ב 8, שאלה 4(c) — הפרכה: לייבניץ דורש ש-$a_n$ עצמה יורדת", href: "/weeks/8", hl: "ש״ב 8" },
          { t: "ש״ב 8, שאלה 3 — סוגריים + הרמוני מתחלף (הוכחה מעגלית = פסול)", href: "/weeks/8", hl: "ש״ב 8" },
          { t: "תרגול 9 — מציאת רדיוס + בדיקת שני הקצוות (לרוב: קצה אחד לייבניץ, השני $p$)", href: "/weeks/9", hl: "תרגול 9" },
        ],
      },
      {
        key: "tip", icon: "💡", title: "טריקים ומלכודות", color: C.amber, items: [
          "תרשים זרימה: טור מוכר? → תנאי הכרחי? → אי-שלילי: השוואה/שורש/מנה/אינטגרל → לא: בהחלט → לייבניץ → סוגריים → הגדרה.",
          "אם לא נתון אי-שליליות — מבחני טורים אי-שליליים (השוואה!) לא תקפים. קראי את השאלה!",
        ],
      },
    ],
  },

  /* ───────── יום 5 ───────── */
  {
    id: "d5", date: "28.6", weekday: "ראשון", hours: 7, type: "learn",
    title: "איבר-איבר + 5 הטורים המוכרים + טיילור + מבחן מדומה ראשון ⭐ לב",
    subtitle: "שבועות 10–11 · סיום הליבה + מבחן מלא ראשון בתנאי אמת",
    weeks: [10, 11],
    sections: [
      {
        key: "learn", icon: "📖", title: "מה ללמוד", color: C.navy, items: [
          "גזירה/אינטגרציה איבר-איבר (הרדיוס נשמר). 5 הטורים המוכרים — בעל פה!",
          "משפט היחידות + טור/פולינום טיילור. אסטרטגיית נגזרת גבוהה: $f^{(n)}(0)=n!\\cdot a_n$.",
          "אי-רציונליות של $e$ — ההוכחה הקלאסית (הוכחה #6).",
        ],
      },
      {
        key: "thm", icon: "📐", title: "משפטים לשנן בעל פה", color: C.purple, items: [
          { t: "שבוע 10 — גזירה/אינטגרציה איבר-איבר + 5 הטורים המוכרים (הרצאה 9)", href: "/weeks/10", hl: "שבוע 10" },
          { t: "שבוע 11 — משפט היחידות + טור טיילור (הרצאה 10)", href: "/weeks/11", hl: "שבוע 11" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "הוכחות — רענון כל ה-10", color: C.red, items: [
          { t: "הוכחה #6 — אי-רציונליות של $e$", href: "/theorems", hl: "משפטים" },
          { t: "עברי על כל 10 ההוכחות — וודאי שאת יודעת לכתוב כל אחת", href: "/proof-guide", hl: "מדריך הוכחות" },
        ],
      },
      {
        key: "exam", icon: "📝", title: "מבחן מדומה ראשון — בתנאי אמת", color: C.gold, items: [
          { t: "סימולציה 2025 — 3 שעות, 4 שאלות מתוך 5, בלי הצצה (הכי קרוב למבחן שלנו)", href: "/simulations", hl: "סימולציות" },
          "תיקון מפורט: לכל טעות — מה לא ידעתי? איזה טריק החסרתי? רשמי רשימת חולשות.",
        ],
      },
      {
        key: "tip", icon: "💡", title: "טריקים", color: C.amber, items: [
          "התאמת אינדקסים לא המשתנה: עצרת במכנה → $e$/$\\sin$/$\\cos$; $n$ במכנה → $\\ln/\\arctan$.",
          "אינטגרל ללא קדומה אלמנטרית ($e^{-x^2}$) — מפתחים לטור ומאנטגרים איבר-איבר.",
        ],
      },
    ],
  },

  /* ───────── יום 6 (חרישת מבחנים) ───────── */
  {
    id: "d6", date: "29.6", weekday: "שני", hours: 8, type: "exam",
    title: "חרישת מבחנים — מועד א׳ + ב׳ 2025 ⭐ הכי קרובים",
    subtitle: "מכאן והלאה: רק פתירת מבחנים מלאים + תיקון",
    weeks: [],
    sections: [
      {
        key: "exam", icon: "📝", title: "מבחנים מלאים (תנאי מבחן: 3ש׳, 4 שאלות)", color: C.red, items: [
          { t: "בוקר — מועד א׳ 2025: פתרי לבד עם טיימר", href: "/past-exams", hl: "מבחני עבר" },
          { t: "אחה״צ — מועד ב׳ 2025: מבחן מלא נוסף", href: "/past-exams", hl: "מבחני עבר" },
        ],
      },
      {
        key: "fix", icon: "🔧", title: "תיקון וניתוח", color: C.cyan, items: [
          "לכל שאלה: מה הדפוס? איזה משפט/הוכחה נדרשו? איפה נתקעתי?",
          "רשמי רשימת נקודות חולשה לטיפול ממוקד מחר.",
        ],
      },
      {
        key: "sig", icon: "🎯", title: "שימי לב לחתימות החוזרות", color: C.amber, items: [
          { t: "מבחן סוגריים → קריסה לטור הרמוני מתבדר (הופיע ב-2025א)", href: "/past-exams", hl: "מבחני עבר" },
          "$\\arctan(x)/x$ → מציאת טור + חילוץ מקדם (2025א).",
        ],
      },
    ],
  },

  /* ───────── יום 7 (חרישת מבחנים) ───────── */
  {
    id: "d7", date: "30.6", weekday: "שלישי", hours: 8, type: "exam",
    title: "חרישת מבחנים — 2024 + נקודות חולשה",
    subtitle: "מבחנים נוספים + טיפול ממוקד בחולשות מאתמול",
    weeks: [],
    sections: [
      {
        key: "exam", icon: "📝", title: "מבחנים מלאים", color: C.red, items: [
          { t: "בוקר — מועד א׳ 2024 (כולל סנדוויץ׳ אינטגרל + טור פרמטרי עם מבחן שורש)", href: "/past-exams", hl: "מבחני עבר" },
          { t: "אחה״צ — מועד ב׳ 2024 + תיקון מלא", href: "/past-exams", hl: "מבחני עבר" },
        ],
      },
      {
        key: "weak", icon: "💪", title: "טיפול בנקודות החולשה", color: C.purple, items: [
          "שעתיים על הנושא שהכי קשה לך (לפי הרשימה מאתמול).",
          { t: "אם נחלשת בהוכחות — חזרי למדריך ההוכחות וכתבי מהזיכרון", href: "/proof-guide", hl: "מדריך הוכחות" },
        ],
      },
      {
        key: "sig", icon: "🎯", title: "חתימות חוזרות לתרגל", color: C.amber, items: [
          { t: "סדרה רקורסיבית (= ש״ב 2 שאלה 5א) · סנדוויץ׳ אינטגרל (2024א)", href: "/practice", hl: "תרגול" },
        ],
      },
    ],
  },

  /* ───────── יום 8 (חרישת מבחנים) ───────── */
  {
    id: "d8", date: "1.7", weekday: "רביעי", hours: 8, type: "exam",
    title: "חרישה אחרונה + 10 ההוכחות מהזיכרון",
    subtitle: "מבחנים אחרונים + כתיבת כל ההוכחות בתנאי מבחן",
    weeks: [],
    sections: [
      {
        key: "exam", icon: "📝", title: "מבחנים מלאים אחרונים", color: C.red, items: [
          { t: "בוקר — מועד א׳/ב׳ 2023 (כולל $\\arctan(x)/x$)", href: "/past-exams", hl: "מבחני עבר" },
          { t: "אחה״צ — שאלות מעורבות מהכי קשות שמצאת (2022 + מאגר)", href: "/practice", hl: "תרגול" },
        ],
      },
      {
        key: "proof", icon: "🧮", title: "כל 10 ההוכחות — מהזיכרון", color: C.cyan, items: [
          { t: "כתבי את כל 10 ההוכחות בתוך 45 דקות, כמו במבחן (כל מבחן כולל לפחות אחת — ״כסף קל״)", href: "/proof-guide", hl: "מדריך הוכחות" },
        ],
      },
      {
        key: "rev", icon: "🔁", title: "רענון אחרון", color: C.amber, items: [
          "גיליון נוסחאות + 5 הטורים המוכרים + טבלאות ההכרעה של מבחני ההתכנסות.",
        ],
      },
    ],
  },

  /* ───────── יום לפני (קל) ───────── */
  {
    id: "d9", date: "2.7", weekday: "חמישי", hours: 2, type: "light",
    title: "יום לפני — קל ומדוד, אוגרים אנרגיה",
    subtitle: "לא ללמוד חומר חדש! רק רענון קצר ושינה טובה",
    weeks: [],
    sections: [
      {
        key: "rev", icon: "🔁", title: "רענון קל בלבד", color: C.purple, items: [
          "בוקר: קריאת גיליון הנוסחאות — 5 הטורים המוכרים + טבלת מבחני ההתכנסות (30 דק׳).",
          "צהריים: 2–3 שאלות ״חמות״ שפתרת היטב בעבר — לקחת ביטחון.",
        ],
      },
      {
        key: "self", icon: "🌙", title: "טיפול עצמי", color: C.cyan, items: [
          "שינה מוקדמת — 8–10 שעות. זה חשוב יותר מכל לימוד נוסף.",
          "לאכול טוב, לשתות מים, להגיע 15 דק׳ מוקדם למבחן.",
        ],
      },
    ],
  },
];

/* ═══════════════════════════ קומפוננטה ═══════════════════════════ */

export default function StudyPlanClient() {
  const [checked, setChecked] = useState<ChkMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw) as ChkMap);
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch { /* ignore */ }
  }, [checked, loaded]);

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  /* כל מזהי המשימות (לחישוב התקדמות) */
  const allTaskIds = useMemo(() => {
    const ids: string[] = [];
    for (const day of DAYS)
      for (const sec of day.sections)
        sec.items.forEach((_, i) => ids.push(`${day.id}.${sec.key}.${i}`));
    return ids;
  }, []);

  const doneCount = allTaskIds.filter(id => checked[id]).length;
  const pct = allTaskIds.length ? Math.round((doneCount / allTaskIds.length) * 100) : 0;

  function dayProgress(day: Day) {
    const ids: string[] = [];
    for (const sec of day.sections) sec.items.forEach((_, i) => ids.push(`${day.id}.${sec.key}.${i}`));
    const d = ids.filter(id => checked[id]).length;
    return { d, total: ids.length };
  }

  return (
    <div className="space-y-7 pb-20" dir="rtl">

      {/* ── Hero + התקדמות כללית ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #0b1f3a 0%, #0b7285 100%)" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <p className="mb-1 text-xs font-black uppercase tracking-widest text-white/60">תוכנית חרישה אישית · ליאם</p>
          <h1 className="mb-1 text-3xl font-black">8 ימי חרישה → מבחן אינפי 2</h1>
          <p className="mb-4 text-sm text-white/70">24.6–1.7 חרישה · 2.7 יום לפני · <span className="font-black text-white">3.7 מבחן 🎯</span></p>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
              <span>התקדמות כללית</span>
              <span>{doneCount}/{allTaskIds.length} משימות · {pct}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22d3ee,#34d399)" }} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Chip label="5 ימי לימוד · שבועות 1–11" color="#22d3ee" />
            <Chip label="3 ימי חרישת מבחנים" color="#f87171" />
            <Chip label="60% מהמבחן = טורים (שבועות 6–11)" color="#fbbf24" />
          </div>
        </div>
      </section>

      {/* ── אסטרטגיית המבחן ── */}
      <section className="rounded-2xl border p-5" style={{ background: "var(--navy-light)", borderColor: "var(--navy-border)" }}>
        <h2 className="mb-2 text-base font-black" style={{ color: "var(--navy-mid)" }}>📋 מבנה המבחן והעדיפויות</h2>
        <p className="mb-3 text-sm" style={{ color: "var(--text-primary)" }}>
          5 שאלות × 25 נק׳, עונים על 4, 3 שעות. כל שאלה ≈ <strong>הוכחת משפט</strong> + סעיף הגדרה + סעיף חישוב/הכרעה.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Pill color={C.red} label="לב המבחן (60%)" body="שבועות 6–11: כל מבחני ההתכנסות + טורי חזקות/טיילור" />
          <Pill color={C.gold} label="חשוב (30%)" body="שבועות 3–5: אינטגרל מסוים, FTC, אינטגרל לא אמיתי, רקורסיה" />
          <Pill color={C.cyan} label="בסיס (10%)" body="שבועות 1–2: גבולות/לופיטל, סדרות, היינה" />
          <Pill color={C.amber} label="מחוץ לחומר (0%)" body={OUT_OF_SCOPE} />
        </div>
      </section>

      {/* ── הדף הראשון: משפטים לכל שבוע ── */}
      <WeekTheoremRef />

      {/* ── 10 ההוכחות ── */}
      <section className="rounded-2xl border p-5" style={{ background: "#fef2f2", borderColor: "var(--red-border)" }}>
        <h2 className="mb-1 text-base font-black" style={{ color: "var(--red-mid)" }}>🧮 10 ההוכחות לשנן בעל פה</h2>
        <p className="mb-3 text-xs" style={{ color: "#7f1d1d" }}>כל מבחן כולל לפחות אחת — ״כסף קל״. סמני כשאת יודעת לכתוב כל אחת מהזיכרון.</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {PROOFS_10.map(p => {
            const id = `proof.${p.n}`;
            return (
              <button key={p.n} onClick={() => toggle(id)} className="flex items-start gap-2 rounded-lg border p-2 text-right transition-colors"
                style={{ background: checked[id] ? "#dcfce7" : "#fff", borderColor: checked[id] ? "var(--green-border)" : "var(--red-border)" }}>
                <Box on={!!checked[id]} color={C.green} />
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  <span className="font-black" style={{ color: C.red }}>{p.n}.</span>
                  <MathContent text={p.name} className="text-sm" />
                  <Link href="/theorems" className="shrink-0 text-[10px] underline" style={{ color: C.cyan }}>שבוע {p.week}</Link>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── אל תשכחי — מלכודות ── */}
      <section className="rounded-2xl border p-5" style={{ background: "#fff8f0", borderColor: "var(--amber-border)" }}>
        <h2 className="mb-3 flex items-center gap-2 text-base font-black" style={{ color: "#92400e" }}>⚠️ אל תשכחי אף פעם — מלכודות נפוצות</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PITFALLS.map((p, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ background: "#fffbf3", borderColor: "var(--amber-border)" }}>
              <p className="mb-0.5 text-xs font-black" style={{ color: "#b45309" }}><MathContent text={p.title} className="text-xs" /></p>
              <div className="text-sm" style={{ color: "#451a03" }}><MathContent text={p.body} className="text-sm" /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5 הטורים המוכרים + חתימות ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border p-5" style={{ background: "var(--navy-light)", borderColor: "var(--navy-border)" }}>
          <h2 className="mb-2 text-sm font-black" style={{ color: "var(--navy-mid)" }}>📐 5 הטורים המוכרים — בעל פה</h2>
          <div className="space-y-1.5">
            {KNOWN_SERIES.map((s, i) => <div key={i} className="text-sm"><MathContent text={s} className="text-sm" /></div>)}
          </div>
        </section>
        <section className="rounded-2xl border p-5" style={{ background: "#faf5ff", borderColor: "var(--purple-border)" }}>
          <h2 className="mb-2 text-sm font-black" style={{ color: C.purple }}>🎯 חתימות חוזרות במבחנים</h2>
          <div className="space-y-2">
            {SIGNATURES.map((s, i) => (
              <div key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>
                <MathContent text={s.t} className="text-sm" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}> — {s.src}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── לוז יומי ── */}
      <div>
        <h2 className="mb-3 text-xl font-black" style={{ color: "var(--text-primary)" }}>🗓️ הלוז היומי — צ׳קליסט אישי</h2>
        <div className="space-y-3">
          {DAYS.map(day => (
            <DayCard key={day.id} day={day} checked={checked} toggle={toggle} progress={dayProgress(day)} />
          ))}
        </div>
      </div>

      {/* ── יום המבחן ── */}
      <section className="overflow-hidden rounded-2xl border-2 p-6 text-center"
        style={{ background: "linear-gradient(135deg, #082f49 0%, #0b7285 100%)", borderColor: "var(--navy-border)", color: "white" }}>
        <p className="text-5xl mb-3">🎯</p>
        <h2 className="text-2xl font-black mb-2">יום שישי, 3.7 — יום המבחן!</h2>
        <p className="text-white/80 text-sm">
          80% מהמבחן = טורים + טורי חזקות/טיילור + אינטגרציה. עברת על הכול, פתרת מבחנים, יודעת את ההוכחות.<br />
          לנשום עמוק, לקרוא כל שאלה בעיון, ולזהות את הדפוס. את יכולה לעשות 100. קדימה! 💪
        </p>
      </section>

    </div>
  );
}

/* ───────────────────── תת-קומפוננטות ───────────────────── */

function Chip({ label, color }: { label: string; color: string }) {
  return <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{label}</span>;
}

function Pill({ color, label, body }: { color: string; label: string; body: string }) {
  return (
    <div className="rounded-xl border bg-white/60 p-3" style={{ borderColor: `${color}55` }}>
      <p className="mb-0.5 text-xs font-black" style={{ color }}>{label}</p>
      <p className="text-xs" style={{ color: "var(--text-primary)" }}>{body}</p>
    </div>
  );
}

function Box({ on, color }: { on: boolean; color: string }) {
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
      style={{ borderColor: on ? color : "var(--border)", background: on ? color : "transparent" }}>
      {on && <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="3"><path d="M3 8l3.5 3.5L13 4" /></svg>}
    </span>
  );
}

function weightColor(w: WeekRef["weight"]) {
  return w === "לב המבחן" ? C.red : w === "חשוב" ? C.gold : C.cyan;
}

function WeekTheoremRef() {
  return (
    <section className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "var(--border)" }}>
      <h2 className="mb-1 text-base font-black" style={{ color: "var(--text-primary)" }}>📚 משפטים לכל שבוע — מה לשנן ומתי</h2>
      <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
        כל שבוע ממופה ליום בתוכנית. ⭐ = הוכחה מתוך ה-10 שצריך לדעת בעל פה. לחצי על שם השבוע למעבר לדף המלא.
      </p>
      <div className="space-y-2">
        {WEEKS.map(w => (
          <details key={w.week} className="group rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 select-none">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: weightColor(w.weight) }}>{w.week}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/weeks/${w.week}`} className="text-sm font-black hover:underline" style={{ color: "var(--text-primary)" }} onClick={e => e.stopPropagation()}>{w.title}</Link>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{w.lecture} · {w.weight} · נלמד ביום {dayLabel(w.dayId)}</p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ background: weightColor(w.weight) }}>{w.weight}</span>
              <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </summary>
            <div className="border-t px-3 py-2.5" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
              <ul className="space-y-1">
                {w.theorems.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
                    <span className="mt-1 text-[10px]" style={{ color: weightColor(w.weight) }}>●</span>
                    <MathContent text={t} className="text-sm" />
                  </li>
                ))}
              </ul>
              {w.proofs.length > 0 && (
                <p className="mt-2 text-xs font-bold" style={{ color: C.red }}>
                  ⭐ הוכחות חובה: {w.proofs.map(n => `#${n}`).join(", ")}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function dayLabel(dayId: string) {
  const d = DAYS.find(x => x.id === dayId);
  return d ? `${d.weekday} ${d.date}` : dayId;
}

function DayCard({ day, checked, toggle, progress }: { day: Day; checked: ChkMap; toggle: (id: string) => void; progress: { d: number; total: number } }) {
  const accent = day.type === "exam" ? C.red : day.type === "light" ? C.purple : C.navy;
  const bg = day.type === "exam" ? "#fef2f2" : day.type === "light" ? "#faf5ff" : "#fff";
  const complete = progress.total > 0 && progress.d === progress.total;
  const dayNum = DAYS.filter(d => d.type !== "light").findIndex(d => d.id === day.id) + 1;

  return (
    <details className="group overflow-hidden rounded-xl border" style={{ borderColor: complete ? "var(--green-border)" : "var(--border)", background: bg }}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 select-none">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-center text-white" style={{ background: complete ? C.green : accent }}>
          <span className="text-[9px] font-bold leading-tight">{day.weekday}</span>
          <span className="text-xs font-black leading-tight">{day.date}</span>
          <span className="text-[8px] opacity-80">{day.hours}ש׳</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: accent }}>
            {day.type === "exam" ? "🔥 חרישת מבחנים" : day.type === "light" ? "🌙 יום לפני" : `יום ${dayNum} · לימוד`}
          </p>
          <p className="text-sm font-black leading-tight" style={{ color: "var(--text-primary)" }}>{day.title}</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{day.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: complete ? C.green : `${accent}22`, color: complete ? "#fff" : accent }}>
            {complete ? "✓ הושלם" : `${progress.d}/${progress.total}`}
          </span>
          <svg className="h-4 w-4 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </div>
      </summary>

      <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
        {day.weeks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>שבועות:</span>
            {day.weeks.map(wn => (
              <Link key={wn} href={`/weeks/${wn}`} className="rounded-full border px-2 py-0.5 text-[11px] font-bold hover:bg-white"
                style={{ borderColor: "var(--navy-border)", color: "var(--navy-mid)" }}>שבוע {wn}</Link>
            ))}
          </div>
        )}
        {day.sections.map(sec => (
          <TaskSection key={sec.key} dayId={day.id} sec={sec} checked={checked} toggle={toggle} />
        ))}
      </div>
    </details>
  );
}

function TaskSection({ dayId, sec, checked, toggle }: { dayId: string; sec: Section; checked: ChkMap; toggle: (id: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide" style={{ color: sec.color }}>
        <span>{sec.icon}</span>{sec.title}
      </p>
      <div className="space-y-1">
        {sec.items.map((item, i) => {
          const id = `${dayId}.${sec.key}.${i}`;
          const on = !!checked[id];
          const text = typeof item === "string" ? item : item.t;
          const href = typeof item === "string" ? undefined : item.href;
          const hl = typeof item === "string" ? undefined : item.hl;
          return (
            <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors" style={{ background: on ? "#f0fdf4" : "transparent" }}>
              <button onClick={() => toggle(id)} aria-label="סמן כבוצע" className="shrink-0"><Box on={on} color={sec.color} /></button>
              <div className="min-w-0 flex-1">
                <span style={{ opacity: on ? 0.55 : 1, textDecoration: on ? "line-through" : "none" }}>
                  <MathContent text={text} className="text-sm" />
                </span>
                {href && (
                  <Link href={href} className="mr-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold no-underline hover:underline"
                    style={{ background: `${C.cyan}1a`, color: C.cyan }}>↗ {hl ?? "פתחי"}</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
