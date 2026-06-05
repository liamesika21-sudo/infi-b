/**
 * Rich pedagogical content for each week — written manually based on
 * lecture summaries, recitation notes, and Max's explanations.
 * This is the "real" content that makes the summaries useful for studying.
 */

import { readFileSync } from "fs";
import path from "path";

export type SectionTag =
  | "הגדרה"
  | "משפט"
  | "כלל"
  | "מסקנה"
  | "הערה"
  | "דוגמה"
  | "שיטה"
  | "אזהרה";

export interface RichSection {
  title: string;
  tag: SectionTag;
  /** The formal statement, conditions, formula */
  formal: string;
  /** Why was this introduced? What problem does it solve? */
  whyItExists?: string;
  /** Intuitive, human-language explanation */
  intuition?: string;
  /** When exactly to use this tool */
  whenToUse?: string;
  /** Important notes, edge cases */
  notes?: string[];
  /** Common mistake */
  warning?: string;
  /** Short worked example */
  example?: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  yes?: { label: string; next?: DecisionNode; conclusion?: string; conclusionColor?: "green" | "red" | "amber" };
  no?: { label: string; next?: DecisionNode; conclusion?: string; conclusionColor?: "green" | "red" | "amber" };
  info?: string;
}

export interface WeekRichContent {
  weekNumber: number;
  /** The one sentence goal for the week */
  mainGoal: string;
  /** The central "take this home" principle */
  guidingPrinciple: string;
  /** Optional: what this week builds on */
  buildOn?: string;
  /** Optional: decision tree for "what can I conclude" */
  decisionTree?: DecisionNode;
  /** Optional full long-form study page, usually copied from a curated source. */
  fullSummaryMarkdown?: string;
  sections: RichSection[];
}

function readContentFile(filename: string): string {
  return readFileSync(path.join(process.cwd(), "src", "content", "calculus2", filename), "utf8");
}

/* ══════════════════════════════════════════════════════════════
   WEEK 1 — L'Hôpital's Rule and Darboux's Theorem
   Based on: recitation1_transcript_clean_copy.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_1: WeekRichContent = {
  weekNumber: 1,
  mainGoal:
    "לשלוט בכלל לופיטל לחישוב גבולות מהצורות $0/0$, $\\infty/\\infty$, $0\\cdot\\infty$, $0^0$, $\\infty^0$, ולהבין את משפט דרבו.",
  guidingPrinciple:
    "לופיטל הוא כלי — לא קסם. בדקי תמיד שהצורה אכן לא-קבועה ($0/0$ או $\\infty/\\infty$) לפני כל שימוש. צורות כמו $0\\cdot\\infty$ ו-$0^0$ דורשות קודם המרה לשבר.",
  sections: [
    {
      title: "כלל לופיטל",
      tag: "משפט",
      formal:
        "אם $\\lim_{x\\to a} f(x) = \\lim_{x\\to a} g(x) = 0$ (או $\\pm\\infty$), ו-$g'(x) \\ne 0$ בסביבת $a$, אז:\n$$\\lim_{x\\to a} \\frac{f(x)}{g(x)} = \\lim_{x\\to a} \\frac{f'(x)}{g'(x)}$$\nבתנאי שהגבול מימין קיים (או $\\pm\\infty$).",
      whyItExists:
        "גבולות מהצורה $0/0$ ו-$\\infty/\\infty$ אינם ניתנים לחישוב ישיר — נוצרת אי-בהירות. לופיטל מאפשר להחליף את הגבול המקורי בגבול של הנגזרות.",
      intuition:
        "כשמונה ומכנה שניהם שואפים לאפס, הם מתחרים על ה'קצב'. הנגזרות מודדות את הקצב הזה — ולכן יחס הנגזרות נותן את התשובה.",
      whenToUse:
        "כשגבול ישיר נותן $0/0$ או $\\infty/\\infty$. לא לפני כן! תמיד נסי להציב קודם.",
      notes: [
        "ניתן להפעיל שוב אם הגבול החדש עדיין $0/0$ או $\\infty/\\infty$.",
        "הגבול מימין חייב להתכנס — אם לא מתכנס, הכלל לא מסייע (אבל לא אומר שגבול המקורי לא קיים).",
        "כלל לופיטל תקף גם לגבולות חד-צדדיים ולגבולות ב-$\\pm\\infty$.",
      ],
      warning:
        "אסור להפעיל לופיטל כשהצורה אינה $0/0$ או $\\infty/\\infty$! לדוגמה: $\\lim_{x\\to 0} \\frac{\\sin x}{x+1}$ — כאן $\\sin(0)/(0+1) = 0$ ישירות, אין צורך בלופיטל.",
      example:
        "$\\lim_{x\\to 0} \\dfrac{e^x - 1}{x}$: הצבה נותנת $0/0$. לופיטל: $\\dfrac{e^x}{1} \\to 1$.",
    },
    {
      title: "צורה $0 \\cdot \\infty$ — המרה לשבר",
      tag: "שיטה",
      formal:
        "אם $\\lim f(x) = 0$ ו-$\\lim g(x) = \\infty$, כתבי:\n$$f(x) \\cdot g(x) = \\frac{f(x)}{1/g(x)} \\quad \\text{או} \\quad \\frac{g(x)}{1/f(x)}$$\nואז הפעילי לופיטל.",
      intuition:
        "צורת $0 \\cdot \\infty$ היא תחרות — מי ינצח? המרה לשבר מגלה את התוצאה.",
      whenToUse:
        "כשאחד הגורמים שואף לאפס והשני לאינסוף. בחרי איזה גורם לשים במכנה: בדרך כלל עדיף לשים את $e^x$ או החזקה במכנה.",
      notes: [
        "כלל אצבע: שימי את הגורם ה'חזק' (למשל $e^x$) במכנה — כי נגזרתו עדיין $e^x$ ולא מסבכת.",
      ],
      warning:
        "שימי לב לגבולות חד-צדדיים! לדוגמה: $\\lim_{x\\to 0^+} x \\cdot e^{1/x} = \\infty$ (מצד ימין), אבל $\\lim_{x\\to 0^-} x \\cdot e^{1/x} = 0$ (מצד שמאל). הגבול הדו-צדדי לא קיים.",
      example:
        "$\\lim_{x\\to 0^+} x \\ln x$: כתבי $\\frac{\\ln x}{1/x}$. לופיטל: $\\frac{1/x}{-1/x^2} = -x \\to 0$.",
    },
    {
      title: "צורות $0^0$, $\\infty^0$, $1^\\infty$ — טכניקת הלוגריתם",
      tag: "שיטה",
      formal:
        "אם $\\lim f(x)^{g(x)}$ היא צורה בלתי-קבועה, הגדירי $L = \\lim f^g$ ואז:\n$$\\ln L = \\lim g(x) \\cdot \\ln f(x)$$\nזוהי צורת $0\\cdot\\infty$ — המירי לשבר והפעילי לופיטל.",
      intuition:
        "הלוגריתם הופך חזקות למכפלות. אחרי שחישבנו $\\ln L$, הגבול המקורי הוא $L = e^{\\ln L}$.",
      whenToUse:
        "לכל גבול מהצורה $[f(x)]^{g(x)}$ שהוא $0^0$, $\\infty^0$ או $1^\\infty$.",
      notes: [
        "תמיד לזכור $L = e^{\\text{התשובה}}$ בסוף!",
        "אם $\\ln L = 0$ אז $L = e^0 = 1$.",
      ],
      example:
        "$\\lim_{x\\to 0^+} [\\arctan(x)]^{\\frac{1-\\cos x}{x}}$: $\\ln L = \\lim \\frac{1-\\cos x}{x} \\cdot \\ln(\\arctan x)$. כשיש $x\\to 0^+$: $\\arctan x \\approx x$, $\\ln(\\arctan x) \\approx \\ln x$, $\\frac{1-\\cos x}{x} \\approx x/2 \\to 0$. לכן $\\ln L = 0$, $L = 1$.",
    },
    {
      title: "משפט דרבו",
      tag: "משפט",
      formal:
        "תהי $f$ גזירה על $[a,b]$. אם $f'(a) < c < f'(b)$ (או $f'(b) < c < f'(a)$), אז קיים $\\xi \\in (a,b)$ כך ש-$f'(\\xi) = c$.\nכלומר: **הנגזרת מקיימת את משפט ערך הביניים**, גם אם היא עצמה לא רציפה.",
      whyItExists:
        "מאפשר לשלול קיומן של אי-רציפויות מסוגים מסוימים בנגזרת.",
      intuition:
        "הנגזרת 'לא יכולה לקפוץ'. אם $f'(a) = 0$ ו-$f'(b) = 2$, היא חייבת לעבור בכל ערך בין 0 ל-2 — גם ב-1.",
      notes: [
        "**מסקנה**: לנגזרת אין אי-רציפויות קפיצה (jump) ואין אי-רציפויות ניתנות להסרה (removable). הסוג היחידי המותר הוא אי-רציפות עצמותית (essential).",
        "הוכחה: מגדירים $h(x) = f(x) - cx$ ומשתמשים במינימום/מקסימום.",
        "דרבו שונה מ-IVT — הנגזרת לא חייבת להיות רציפה, אבל עדיין מקיימת ערך ביניים.",
      ],
      warning:
        "אל תניחי שהנגזרת רציפה! דרבו אומר שהיא מקיימת IVT — לא שהיא רציפה. פונקציה כמו $f(x) = x^2 \\sin(1/x)$ (עם $f(0)=0$) גזירה אך $f'$ לא רציפה ב-0.",
      example:
        "נתון $f'(0) = -1$, $f'(1) = 3$. לפי דרבו, קיים $\\xi \\in (0,1)$ כך ש-$f'(\\xi) = 0$ — כלומר לפונקציה יש נקודה קריטית.",
    },
    {
      title: "יישום דרבו: שלילת קיום נגזרת",
      tag: "כלל",
      formal:
        "אם $f'$ מוגדרת בסביבת $x_0$ ויש לה גבול חד-צדדי שאינו שווה ל-$f'(x_0)$, אז $f'$ אינה גזירה בנקודה זו (סתירה לדרבו).",
      intuition:
        "אם נגזרת 'קופצת' בנקודה מסוימת, זה סתירה למשפט דרבו. אי-רציפות קפיצה בנגזרת — בלתי אפשרית.",
      whenToUse:
        "בשאלות הוכחה: 'הוכח שלפונקציה זו אין נגזרת/שהנגזרת לא יכולה לקיים תכונה X'.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 2 — Sequences, Heine's Lemma, Recursive Sequences
   Based on: recitation2_sequences_heine.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_2: WeekRichContent = {
  weekNumber: 2,
  mainGoal:
    "להבין את הקשר בין גבולות של פונקציות לגבולות של סדרות, ולדעת לטפל בסדרות רקורסיביות.",
  guidingPrinciple:
    "סדרה היא מקרה פרטי של פונקציה — אבל יש הבדלים. עבור סדרות רקורסיביות: קודם מוכיחים מונוטוניות וחסימות, ורק אז מחשבים גבול. אסור להניח גבול קיים ולמצוא אותו לפני ההוכחה.",
  buildOn: "גבולות פונקציות, כלל לופיטל (שבוע 1)",
  sections: [
    {
      title: "סדרה מונוטונית וחסומה מתכנסת",
      tag: "משפט",
      formal:
        "כל סדרה מונוטונית (עולה או יורדת) וחסומה (מלמעלה ומלמטה) מתכנסת.\n- עולה וחסומה מלמעלה: $\\lim a_n = \\sup\\{a_n\\}$.\n- יורדת וחסומה מלמטה: $\\lim a_n = \\inf\\{a_n\\}$.",
      whyItExists:
        "זהו הכלי הבסיסי להוכחת קיום גבול לסדרות רקורסיביות — מבלי לחשב את הגבול בפועל.",
      intuition:
        "סדרה שעולה ולא 'בורחת' לאינסוף חייבת להתכנס. היא כמו טיפוס הר שמגיע בסוף לצמרת.",
      whenToUse:
        "סדרות רקורסיביות: תמיד הוכח מונוטוניות + חסימה לפני שמחשבים גבול.",
      notes: [
        "חסימה וחסימה מלמעלה/מלמטה: צריך את שניהם (חסומה = חסומה מלמעלה ומלמטה).",
        "זה אקסיומת שלמות הממשיים — לא ניתן להוכיח, רק להניח.",
      ],
    },
    {
      title: "למת היינה (Heine's Lemma)",
      tag: "משפט",
      formal:
        "$\\lim_{x \\to x_0} f(x) = L$ אם ורק אם לכל סדרה $x_n \\to x_0$ (עם $x_n \\ne x_0$):\n$$\\lim_{n\\to\\infty} f(x_n) = L$$",
      whyItExists:
        "מאפשרת לחשב גבולות של פונקציות בעזרת גבולות של סדרות, ולהפך. בפרט שימושית לחישוב $\\lim \\sqrt[n]{n}$ ו-$\\lim \\sqrt[n]{a}$.",
      intuition:
        "גבול של פונקציה ב-$x_0$ הוא אותו דבר כמו גבול על כל סדרה המתכנסת ל-$x_0$. ניתן לנצל זאת בכיוון הנוח.",
      whenToUse:
        "לחישוב $\\lim_{n\\to\\infty} n^{1/n}$ ו-$\\lim_{n\\to\\infty} a^{1/n}$: בוחרים $f(x) = x^{1/x}$ ומחשבים $\\lim_{x\\to\\infty} f(x)$ בעזרת לופיטל.",
      notes: [
        "גם: $\\lim_{x\\to x_0} f(x)$ לא קיים $\\iff$ קיימת סדרה $x_n \\to x_0$ עם $f(x_n)$ לא מתכנסת.",
        "שימושי להוכחת **אי-קיום** גבולות.",
      ],
      example:
        "$\\lim_{n\\to\\infty} \\sqrt[n]{n}$: נגדיר $f(x) = x^{1/x} = e^{\\ln x / x}$. $\\lim_{x\\to\\infty} \\frac{\\ln x}{x} \\overset{L'H}{=} \\lim \\frac{1/x}{1} = 0$. לכן $\\lim f(x) = e^0 = 1$. לפי היינה: $\\sqrt[n]{n} \\to 1$.",
    },
    {
      title: "גבולות ידועים של סדרות",
      tag: "כלל",
      formal:
        "$$\\lim_{n\\to\\infty} \\sqrt[n]{n} = 1 \\qquad \\lim_{n\\to\\infty} \\sqrt[n]{a} = 1 \\; (a>0)$$\n$$\\lim_{n\\to\\infty} \\left(1 + \\frac{1}{n}\\right)^n = e \\qquad \\lim_{n\\to\\infty} \\frac{n^k}{a^n} = 0 \\; (a>1)$$\n$$\\lim_{n\\to\\infty} \\frac{a^n}{n!} = 0 \\qquad \\lim_{n\\to\\infty} \\frac{\\ln n}{n} = 0$$",
      intuition:
        "סדר גדילה: $\\ln n \\ll n^k \\ll a^n \\ll n! \\ll n^n$. העצרת גדולה מכל חזקה, וחזקה גדולה מכל פולינום.",
      whenToUse:
        "שנני אותם — הם מופיעים בכמעט כל שאלת סדרות ובמבחני התכנסות לטורים.",
    },
    {
      title: "סדרות רקורסיביות — שיטת הפתרון",
      tag: "שיטה",
      formal:
        "נתונה $a_{n+1} = f(a_n)$. השלבים:\n1. **חסימה**: הוכח ש-$a_n \\in [m, M]$ לכל $n$ (בדרך כלל באינדוקציה).\n2. **מונוטוניות**: הוכח ש-$a_{n+1} - a_n \\ge 0$ (עולה) או $\\le 0$ (יורדת).\n3. **ממשפט**: הגבול $L = \\lim a_n$ קיים.\n4. **חישוב $L$**: עבור גבול בשני צדדי $a_{n+1} = f(a_n)$ לקבל $L = f(L)$. פתרי.",
      intuition:
        "הסדרה 'שואפת' לנקודת שבת (fixed point) של $f$ — נקודה שבה $f(L) = L$.",
      whenToUse:
        "כל סדרה מהצורה $a_{n+1} = f(a_n)$. חשוב: השלבים 1-2 לפני 3-4!",
      warning:
        "אסור לכתוב 'נניח $\\lim a_n = L$' לפני שהוכחת שהגבול קיים! ראשית — מונוטוניות וחסימה. ואז — הנחת הגבול ופתרון $L = f(L)$.",
      example:
        "$a_1 = 1/4$, $a_{n+1} = a_n^2 + 1/4$. (1) נוכיח $0 < a_n < 1/2$: בבסיס $a_1 = 1/4 \\in (0,1/2)$. בצעד: $a_{n+1} = a_n^2 + 1/4 < (1/2)^2 + 1/4 = 1/2$. (2) מונוטוניות: $a_{n+1} - a_n = a_n^2 - a_n + 1/4 = (a_n - 1/2)^2 \\ge 0$ — עולה. (3) גבול קיים. (4) $L = L^2 + 1/4 \\Rightarrow L = 1/2$.",
    },
    {
      title: "סדרה לעומת פונקציה",
      tag: "הערה",
      formal:
        "סדרה $\\{a_n\\}$ היא פונקציה מ-$\\mathbb{N}$ ל-$\\mathbb{R}$. ניתן להרחיב לפונקציה $f: [1,\\infty) \\to \\mathbb{R}$ ולהשתמש בלופיטל — אבל זה דורש שהפונקציה תהיה גזירה.",
      intuition:
        "כשכותבים $\\lim_{n\\to\\infty} f(n)$ ועוברים ל-$\\lim_{x\\to\\infty} f(x)$ — זו שימוש בהיינה. מותר כשהפונקציה $f$ מוגדרת ורציפה לכל $x \\ge 1$.",
      notes: [
        "בלי לדעת שהגבול של $f(x)$ קיים לא ניתן להסיק על $f(n)$ בכיוון ההפוך.",
        "אם $\\lim_{x\\to\\infty} f(x) = L$ קיים — אז גם $\\lim f(n) = L$.",
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 3 — Indefinite Integrals and Integration Techniques
   Based on: recitation3_transcript_clean_copy.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_3: WeekRichContent = {
  weekNumber: 3,
  mainGoal:
    "לשלוט בחישוב אינטגרלים לא מסוימים: טבלת אינטגרלים, החלפת משתנה, ואינטגרציה בחלקים.",
  guidingPrinciple:
    "בכל אינטגרל — תחילה זהי את הצורה: האם זה דפוס ישיר מהטבלה? החלפה לינארית? החלפה קוסמטית? דפוס $f'/f$ או $f \\cdot f'$? רק אם לא — עברי לחלקים.",
  sections: [
    {
      title: "טבלת אינטגרלים בסיסית",
      tag: "כלל",
      formal:
        "$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\ne -1)$$\n$$\\int \\frac{1}{x}\\,dx = \\ln|x| + C$$\n$$\\int e^x\\,dx = e^x + C$$\n$$\\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\cos x\\,dx = \\sin x + C$$\n$$\\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C, \\quad \\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C$$",
      intuition:
        "אלה הלבנים הבסיסיות. כל אינטגרל מורכב בסוף מתפרק לאחת מהצורות הללו.",
      whenToUse:
        "תמיד — בדקי תחילה אם האינטגרל הוא ישיר מהטבלה לפני כל שיטה אחרת.",
    },
    {
      title: "החלפה לינארית: $t = ax+b$",
      tag: "שיטה",
      formal:
        "אם $f(x) = g(ax+b)$, הנח $t = ax+b$, אז $dt = a\\,dx$ ולכן $dx = dt/a$:\n$$\\int g(ax+b)\\,dx = \\frac{1}{a} \\int g(t)\\,dt$$",
      intuition:
        "ארגומנט לינארי מאפשר 'לפשט' בלי לשנות את מבנה הפונקציה — רק מחלקים בקצב שינוי הארגומנט.",
      whenToUse:
        "כשהארגומנט הוא $ax+b$ (לינארי). לדוגמה: $\\int e^{3x}\\,dx$, $\\int \\sin(2x+1)\\,dx$.",
      notes: [
        "לא לשכוח לחלק ב-$a$!",
        "עבור $a=1$ — אין שינוי (כי $dx = dt$).",
      ],
      example:
        "$\\int e^{3x}\\,dx$: $t = 3x$, $dx = dt/3$. $\\int e^t \\cdot dt/3 = e^t/3 + C = e^{3x}/3 + C$.",
    },
    {
      title: "החלפה קוסמטית",
      tag: "שיטה",
      formal:
        "כשהארגומנט לא לינארי, הנח $t = h(x)$ ובטא את $dx$ בעזרת $dt = h'(x)\\,dx$:\n$$dx = \\frac{dt}{h'(x)}$$\nהמטרה: לכתוב את כל האינטגרל בפונקציה של $t$ בלבד.",
      intuition:
        "הדוגמה הקלאסית: $\\int f(\\sqrt{x})\\,dx$. הנח $t = \\sqrt{x}$, אז $x = t^2$, $dx = 2t\\,dt$. כל $\\sqrt{x}$ הופך ל-$t$.",
      whenToUse:
        "כשיש שורש, לוגריתם, או ביטוי שקשה לטפל בו ישירות.",
      notes: [
        "בסוף תמיד מחזירים ל-$x$ בהחלפה הפוכה.",
        "ניתן גם להניח $t = x^2$, $t = e^x$, וכו' לפי הצורה.",
      ],
      example:
        "$\\int \\frac{1}{\\sqrt{x}(1+\\sqrt{x})}\\,dx$: $t = \\sqrt{x}$, $dx = 2t\\,dt$. $\\int \\frac{2t\\,dt}{t(1+t)} = 2\\int \\frac{dt}{1+t} = 2\\ln|1+t| + C = 2\\ln(1+\\sqrt{x}) + C$.",
    },
    {
      title: "דפוס: $f'(x)/f(x)$",
      tag: "כלל",
      formal:
        "$$\\int \\frac{f'(x)}{f(x)}\\,dx = \\ln|f(x)| + C$$",
      whyItExists:
        "זהו מקרה פרטי של החלפה $t = f(x)$, $dt = f'(x)\\,dx$. התוצאה תמיד $\\ln|t| = \\ln|f(x)|$.",
      intuition:
        "תזהי: 'האם המונה הוא נגזרת המכנה (עד לקבוע)?' — אם כן, התוצאה היא $\\ln|f(x)|$.",
      whenToUse:
        "כל אינטגרל שבר שבו המונה הוא נגזרת המכנה. לדוגמה: $\\int \\frac{2x}{x^2+1}$, $\\int \\frac{\\cos x}{\\sin x}$.",
      example:
        "$\\int \\frac{2x}{x^2+1}\\,dx = \\ln(x^2+1) + C$ (כי $(x^2+1)' = 2x$).",
    },
    {
      title: "דפוס: $f(x) \\cdot f'(x)$",
      tag: "כלל",
      formal:
        "$$\\int f(x) \\cdot f'(x)\\,dx = \\frac{[f(x)]^2}{2} + C$$",
      intuition:
        "זה $\\int t\\,dt = t^2/2$ עם $t = f(x)$.",
      whenToUse:
        "כשרואים פונקציה כפול נגזרתה: $\\sin x \\cos x$, $x \\cdot \\sqrt{1+x^2}$.",
      example:
        "$\\int \\sin x \\cos x\\,dx = \\frac{\\sin^2 x}{2} + C$ (כי $f = \\sin x$, $f' = \\cos x$).",
    },
    {
      title: "אינטגרציה בחלקים (IBP)",
      tag: "משפט",
      formal:
        "$$\\int u\\,dv = uv - \\int v\\,du$$\nהכלל: בחרי $u$ ו-$dv$ כך ש-$\\int v\\,du$ פשוט יותר מ-$\\int u\\,dv$.",
      whyItExists:
        "נגזרת מכפלה: $(uv)' = u'v + uv'$. אינטגרל: $uv = \\int u'v + \\int uv'$. לכן $\\int uv' = uv - \\int u'v$.",
      intuition:
        "IBP מחליפה אינטגרל 'קשה' $\\int u\\,dv$ באינטגרל (מקווים) 'קל' $\\int v\\,du$.",
      whenToUse:
        "מכפלות של: פולינום × $e^x$, פולינום × $\\sin/\\cos$, $\\ln x$ לבד, $\\arctan x$ לבד.",
      notes: [
        "כלל LIATE לבחירת $u$: **L**og, **I**nverse trig, **A**lgebra (פולינום), **T**rig, **E**xponential — לוגריתם ראשון!",
        "לפעמים צריך IBP פעמיים.",
        "לפעמים האינטגרל חוזר — אז מוסיפים לשני הצדדים ומחלקים.",
      ],
      example:
        "$\\int x e^x\\,dx$: $u = x$, $dv = e^x\\,dx$. $du = dx$, $v = e^x$. $= xe^x - \\int e^x\\,dx = xe^x - e^x + C = (x-1)e^x + C$.",
    },
    {
      title: "IBP חוזר: כשהאינטגרל מופיע מחדש",
      tag: "שיטה",
      formal:
        "אם אחרי IBP מקבלים $\\int I = \\text{ביטוי} - c \\cdot \\int I$, אז:\n$$\\int I + c \\cdot \\int I = \\text{ביטוי} \\implies \\int I = \\frac{\\text{ביטוי}}{1+c}$$",
      intuition:
        "האינטגרל 'זזה' מצד לצד ונוצרת משוואה. פותרים אותה אלגברית.",
      example:
        "$\\int e^x \\cos x\\,dx$: IBP עם $u=e^x$, $dv=\\cos x$: $= e^x \\sin x - \\int e^x \\sin x$. IBP שוב: $= e^x \\sin x - (-e^x \\cos x + \\int e^x \\cos x)$. לכן $2\\int e^x \\cos x = e^x(\\sin x + \\cos x)$, $\\int = \\frac{e^x(\\sin x + \\cos x)}{2} + C$.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 4 — Definite Integrals, Newton-Leibniz, Riemann Sums
   Based on: recitation_clean_markdown4.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_4: WeekRichContent = {
  weekNumber: 4,
  mainGoal:
    "לחשב אינטגרלים מסוימים בעזרת ניוטון-לייבניץ, לבצע החלפת משתנה נכונה (עם שינוי גבולות), ולהסיק גבולות מסדרות בעזרת סכומי רימן.",
  guidingPrinciple:
    "בהחלפת משתנה באינטגרל מסוים — חובה לשנות את גבולות האינטגרציה. ובסכומי רימן — לא ניתן להשתמש באלגברת גבולות כשמספר האיברים תלוי ב-$n$.",
  buildOn: "אינטגרלים לא-מסוימים (שבוע 3), המשפט היסודי של החשבון",
  sections: [
    {
      title: "המשפט היסודי של החשבון (ניוטון-לייבניץ)",
      tag: "משפט",
      formal:
        "אם $f$ רציפה על $[a,b]$ ו-$F' = f$, אז:\n$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$\nוכן: $\\displaystyle\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$.",
      whyItExists:
        "מחבר בין שני מושגים שונים לכאורה: אינטגרל (שטח) ונגזרת. הוכחה שהם הפוכים זה לזה.",
      intuition:
        "הגרסה השנייה אומרת: נגזרת של 'שטח מצטבר' היא הפונקציה עצמה. כל כמה שמוסיפים שטח ב-$x$, הקצב הוא $f(x)$.",
      notes: [
        "לגרסה השנייה: כשהגבול העליון הוא $g(x)$ במקום $x$, הנגזרת היא $f(g(x)) \\cdot g'(x)$ (כלל השרשרת).",
        "לא להשתמש בניוטון-לייבניץ עם אינטגרלים לא תקינים בלי לבדוק תחילה!",
      ],
      example:
        "$\\frac{d}{dx}\\int_0^{x^2} e^{t^2}\\,dt = e^{(x^2)^2} \\cdot 2x = 2x e^{x^4}$.",
    },
    {
      title: "החלפת משתנה באינטגרל מסוים",
      tag: "שיטה",
      formal:
        "כשמניחים $t = g(x)$, גבולות האינטגרציה משתנים:\n$$\\int_a^b f(g(x)) g'(x)\\,dx = \\int_{g(a)}^{g(b)} f(t)\\,dt$$",
      intuition:
        "הגבולות חייבים לתאר אותה תנועה — מ-$g(a)$ עד $g(b)$ במשתנה $t$.",
      whenToUse:
        "בכל החלפת משתנה באינטגרל מסוים. אפשר גם לא לשנות גבולות, אבל אז צריך לחזור ל-$x$ בסוף.",
      warning:
        "הטעות הנפוצה ביותר: לשכוח לשנות את גבולות האינטגרציה! אם $t = g(x)$: גבול תחתון הוא $g(a)$, גבול עליון הוא $g(b)$.",
      example:
        "$\\int_0^1 x e^{x^2}\\,dx$: $t = x^2$, $dt = 2x\\,dx$. גבולות: $x=0 \\to t=0$, $x=1 \\to t=1$. $= \\frac{1}{2}\\int_0^1 e^t\\,dt = \\frac{1}{2}[e^t]_0^1 = \\frac{e-1}{2}$.",
    },
    {
      title: "אינטגרציה בחלקים באינטגרל מסוים",
      tag: "שיטה",
      formal:
        "$$\\int_a^b u\\,dv = [uv]_a^b - \\int_a^b v\\,du$$\nחשוב: $[uv]_a^b = u(b)v(b) - u(a)v(a)$ — מציבים את הגבולות **ב-$uv$ מיד**.",
      notes: [
        "הגבולות מוצבים ב-$uv$ בסוף (לא ב-$\\int v\\,du$).",
        "בפועל: נוח לחשב $\\int v\\,du$ ללא גבולות, ואז להציב את שניהם.",
      ],
      example:
        "$\\int_0^1 x e^x\\,dx$: $u=x$, $dv=e^x dx$. $[xe^x]_0^1 - \\int_0^1 e^x\\,dx = e - [e^x]_0^1 = e - (e-1) = 1$.",
    },
    {
      title: "סכומי רימן — גבול כאינטגרל",
      tag: "שיטה",
      formal:
        "$$\\lim_{n\\to\\infty} \\frac{1}{n} \\sum_{k=1}^{n} f\\!\\left(\\frac{k}{n}\\right) = \\int_0^1 f(x)\\,dx$$\nבאופן כללי: $\\frac{b-a}{n}\\sum_{k=0}^{n-1} f\\!\\left(a + k\\cdot\\frac{b-a}{n}\\right) \\to \\int_a^b f(x)\\,dx$.",
      whyItExists:
        "מאפשרת לחשב גבולות של סכומים שמספר האיברים גדל — הם הם סכומי רימן של אינטגרל מסוים.",
      intuition:
        "$\\frac{1}{n}$ הוא רוחב כל מלבן, $f(k/n)$ הוא הגובה. הסכום הוא שטח מקורב — ובגבול הוא מדויק.",
      whenToUse:
        "כשמזהים $\\frac{1}{n}\\sum f(k/n)$ — זהו $\\int_0^1 f$. כשמזהים $\\frac{b-a}{n}\\sum f(a + k(b-a)/n)$ — זהו $\\int_a^b f$.",
      warning:
        "לא ניתן לפצל $\\lim$ שבתוכו מספר אינסופי של איברים תלויי $n$ (אסור: $\\lim \\frac{1}{n^2+1^2} + \\lim \\frac{1}{n^2+2^2} + \\ldots$). כל הסכום הוא ביחד — זיהוי כאינטגרל.",
      example:
        "$\\lim_{n\\to\\infty} \\sum_{k=1}^n \\frac{1}{n+k} = \\lim \\frac{1}{n}\\sum_{k=1}^n \\frac{1}{1+k/n} = \\int_0^1 \\frac{dx}{1+x} = \\ln 2$.",
    },
    {
      title: "תכונות האינטגרל המסוים",
      tag: "כלל",
      formal:
        "$$\\int_a^b f + \\int_b^c f = \\int_a^c f \\qquad \\int_a^b f = -\\int_b^a f$$\n$$\\left|\\int_a^b f(x)\\,dx\\right| \\le \\int_a^b |f(x)|\\,dx$$\n$$m(b-a) \\le \\int_a^b f \\le M(b-a) \\quad (m \\le f \\le M)$$",
      notes: [
        "הלינאריות: $\\int(\\alpha f + \\beta g) = \\alpha \\int f + \\beta \\int g$.",
        "אי-שוויון אינטגרל: שימושי להוכחות.",
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 5 — Improper Integrals
   Based on: recitation5_improper_integrals.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_5: WeekRichContent = {
  weekNumber: 5,
  mainGoal:
    "להגדיר ולחשב אינטגרלים לא תקינים (גבול אינסופי או פונקציה לא חסומה), ולדעת לקבוע התכנסות/התבדרות.",
  guidingPrinciple:
    "אינטגרל לא תקין הוא **גבול** — לא חישוב ישיר. אסור להציב $\\infty$ בנוסחה. לאינטגרל $\\int_{-\\infty}^{\\infty}$ — חייבים לפצל לשניים ושניהם חייבים להתכנס בנפרד.",
  buildOn: "ניוטון-לייבניץ, החלפת משתנה (שבוע 4), גבולות (שבוע 1)",
  sections: [
    {
      title: "הגדרת אינטגרל לא תקין (גבול אינסופי)",
      tag: "הגדרה",
      formal:
        "$$\\int_a^{\\infty} f(x)\\,dx = \\lim_{b\\to\\infty} \\int_a^b f(x)\\,dx$$\nהאינטגרל **מתכנס** אם הגבול קיים וסופי; **מתבדר** אחרת.\nבאופן דומה: $\\int_{-\\infty}^b f = \\lim_{a\\to-\\infty}\\int_a^b f$.",
      whyItExists:
        "השטח מתחת לגרף עד אינסוף לא מוגדר ישירות — מגדירים אותו כגבול של שטחים סופיים.",
      intuition:
        "חושבים על 'אינסוף' כ'גדול מאוד'. לוקחים גבול עליון $b$ ולוחצים לאינסוף.",
      warning:
        "**אסור** לכתוב $[F(x)]_a^\\infty = F(\\infty) - F(a)$ ישירות. צריך לכתוב $\\lim_{b\\to\\infty} F(b) - F(a)$.",
      example:
        "$\\int_0^\\infty e^{px}\\,dx$ ($p < 0$): $\\lim_{b\\to\\infty} \\left[\\frac{e^{px}}{p}\\right]_0^b = \\lim_{b\\to\\infty} \\frac{e^{pb}-1}{p} = \\frac{0-1}{p} = -\\frac{1}{p}$ (כי $p<0$ ולכן $e^{pb}\\to 0$). מתכנס לכל $p<0$.",
    },
    {
      title: "אינטגרל לא תקין דו-צדדי",
      tag: "הגדרה",
      formal:
        "$$\\int_{-\\infty}^{\\infty} f(x)\\,dx = \\int_{-\\infty}^c f(x)\\,dx + \\int_c^{\\infty} f(x)\\,dx$$\nלכל $c$ קבוע. **שני החלקים** חייבים להתכנס בנפרד.",
      intuition:
        "לא ניתן לסמוך על 'ביטול' בין $-\\infty$ ל-$+\\infty$. כל צד נבדק לחוד.",
      warning:
        "**טעות קלאסית**: $\\int_{-1}^{1} \\frac{1}{x}\\,dx \\ne 0$. האינטגרל **מתבדר** כי $\\int_0^1 \\frac{1}{x}\\,dx = \\infty$. לא ניתן לטעון 'הם מבטלים זה את זה'.",
      example:
        "$\\int_{-\\infty}^{\\infty} x\\,dx$: $\\int_0^\\infty x\\,dx = \\lim_{b\\to\\infty} b^2/2 = \\infty$. **מתבדר** (גם לבד!).",
    },
    {
      title: "אינטגרל לא תקין — פונקציה לא חסומה",
      tag: "הגדרה",
      formal:
        "אם $f$ לא חסומה בסביבת $b$, אז:\n$$\\int_a^b f(x)\\,dx = \\lim_{\\varepsilon \\to 0^+} \\int_a^{b-\\varepsilon} f(x)\\,dx$$\nאם הגבול קיים וסופי — מתכנס.",
      example:
        "$\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx = \\lim_{\\varepsilon\\to 0^+} [2\\sqrt{x}]_\\varepsilon^1 = 2 - \\lim 2\\sqrt{\\varepsilon} = 2$. **מתכנס**.",
    },
    {
      title: "מבחן ה-$p$ לאינטגרלים לא תקינים",
      tag: "מסקנה",
      formal:
        "$$\\int_1^{\\infty} \\frac{1}{x^p}\\,dx \\text{ מתכנס} \\iff p > 1$$\n$$\\int_0^{1} \\frac{1}{x^p}\\,dx \\text{ מתכנס} \\iff p < 1$$",
      intuition:
        "ב-$[1,\\infty)$: $p>1$ = קטנים מהר מספיק. ב-$(0,1]$: $p<1$ = לא מתפוצצים מהר מדי ליד 0. שמי לב לדחיפות ההפוכה!",
      whenToUse:
        "כסרגל להשוואה: בדקי לאיזה $p$ דומה $f(x)$ ואז החל מבחן ה-$p$.",
      notes: [
        "מבחן ה-$p$ לטורים (שבוע 6): $\\sum 1/n^p$ מתכנס $\\iff$ $p>1$ — **אותו כיוון** כמו $\\int_1^\\infty$.",
      ],
    },
    {
      title: "מבחן ההשוואה לאינטגרלים לא תקינים",
      tag: "משפט",
      formal:
        "אם $0 \\le f(x) \\le g(x)$ לכל $x \\ge a$, אז:\n- $\\int_a^\\infty g < \\infty \\Rightarrow \\int_a^\\infty f < \\infty$ (מתכנס)\n- $\\int_a^\\infty f = \\infty \\Rightarrow \\int_a^\\infty g = \\infty$ (מתבדר)",
      intuition:
        "אם הפונקציה הגדולה מתכנסת — הקטנה ממנה בטוח מתכנסת. אם הקטנה מתבדרת — הגדולה בטוח מתבדרת.",
      whenToUse:
        "כשניתן להשוות ל-$1/x^p$ או ל-$e^{px}$.",
      example:
        "$\\int_1^\\infty \\frac{1}{x^2+\\sin^2 x}\\,dx$: $0 < \\frac{1}{x^2+\\sin^2 x} \\le \\frac{1}{x^2}$ ו-$\\int_1^\\infty 1/x^2 < \\infty$. לכן **מתכנס**.",
    },
    {
      title: "דוגמה: $\\int_2^\\infty \\frac{1}{x\\ln x}\\,dx$",
      tag: "דוגמה",
      formal:
        "$\\int_2^\\infty \\frac{dx}{x\\ln x} = \\lim_{b\\to\\infty}[\\ln(\\ln x)]_2^b = \\lim_{b\\to\\infty} \\ln(\\ln b) - \\ln(\\ln 2) = \\infty$.\n**מתבדר**.",
      intuition:
        "למרות שהאינטגרנד קטן מאוד, הוא קטן לאט מדי — $\\ln(\\ln x)$ גדל לאינסוף.",
      notes: [
        "השוואה: $\\int_2^\\infty \\frac{1}{x(\\ln x)^2}$ מתכנס (כי מתקבל $[-1/\\ln x]_2^\\infty = 1/\\ln 2$).",
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 6 — Series: Fundamentals and Basic Tests
   Based on: recitation6_series.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_6: WeekRichContent = {
  weekNumber: 6,
  mainGoal:
    "להגדיר טורים אינסופיים ולהבין את הקשר בין הסדרה $a_n$ לסדרת הסכומים החלקיים. ללמוד מתי טור מתכנס ומדוע.",
  guidingPrinciple:
    "טור $\\sum a_n$ מוגדר כגבול של סכומים חלקיים — לא כסכום של אינסוף מספרים ישירות. התנאי ההכרחי ($a_n \\to 0$) הוא **הכרחי בלבד** — לא מספיק!",
  buildOn: "סדרות וגבולות (שבוע 2), אינטגרלים לא תקינים (שבוע 5)",
  sections: [
    {
      title: "הגדרת טור אינסופי",
      tag: "הגדרה",
      formal:
        "נתונה סדרה $\\{a_n\\}_{n=k}^\\infty$. הסכום החלקי ה-$N$-י הוא $S_N = \\sum_{n=k}^N a_n$.\nהטור $\\sum_{n=k}^\\infty a_n$ **מתכנס** אם $\\lim_{N\\to\\infty} S_N = S$ סופי. ערכו הוא $S$.\nאחרת הטור **מתבדר**.",
      whyItExists:
        "מאפשר לדון ב'סכום אינסופי' בצורה מוגדרת היטב — לא כפעולת חיבור אלא כגבול.",
      intuition:
        "אנחנו חוברים 'מלמטה' — $S_1, S_2, S_3, \\ldots$ — ושואלים אם הרצף הזה מתייצב.",
      notes: [
        "שינוי מספר סופי של איברים בהתחלה לא משנה התכנסות (רק את הערך).",
        "הטור והסדרה: $a_n \\to 0$ הוא **תנאי הכרחי** — הסדרה $S_N$ לא יכולה להתייצב אם צועדים גדולים.",
      ],
    },
    {
      title: "תנאי הכרחי להתכנסות",
      tag: "משפט",
      formal:
        "אם $\\sum a_n$ מתכנס, אז $\\lim_{n\\to\\infty} a_n = 0$.\n**מסקנה**: אם $a_n \\not\\to 0$, הטור **בהכרח מתבדר**.",
      whyItExists:
        "הוכחה: $a_n = S_n - S_{n-1} \\to S - S = 0$.",
      intuition:
        "אם הטור מתכנס, הסכומים החלקיים חייבים 'להתייצב' — ואז כל צעד חדש $a_n$ חייב להיות קטן יותר ויותר.",
      whenToUse:
        "**תמיד בדקי זאת ראשונה!** אם $a_n \\not\\to 0$ — הטור מתבדר ואין צורך בבדיקות נוספות.",
      warning:
        "ההפך **לא נכון**: $a_n \\to 0$ לא מבטיח התכנסות! דוגמה: $\\sum 1/n$ — הרמוני, $1/n \\to 0$ אבל הטור מתבדר.",
      example:
        "$\\sum \\frac{n}{n+1}$: $\\frac{n}{n+1} \\to 1 \\ne 0$. **מתבדר** (תנאי הכרחי נכשל).",
    },
    {
      title: "טור גיאומטרי",
      tag: "משפט",
      formal:
        "$$\\sum_{n=0}^{\\infty} q^n = \\frac{1}{1-q} \\quad \\text{אם } |q| < 1$$\nמתבדר אם $|q| \\ge 1$.\nסכום חלקי: $S_N = \\frac{1-q^{N+1}}{1-q}$.",
      intuition:
        "כשכל איבר הוא $q$ כפול קודמו, הסכום הוא מכונה גיאומטרית — ובמקרה $|q|<1$ היא 'מתכווצת' ומגיעה לערך סופי.",
      whenToUse:
        "לזיהוי צורת $q^n$ — ישירות. גם לאחר שינוי אינדקס.",
      notes: [
        "לא לשכוח: המינוי הראשון. $\\sum_{n=0}^\\infty q^n = 1/(1-q)$; $\\sum_{n=1}^\\infty q^n = q/(1-q)$.",
        "אם הטור מתחיל מ-$n=k$: $\\sum_{n=k}^\\infty q^n = q^k/(1-q)$.",
      ],
      example:
        "$\\sum_{n=2}^\\infty \\left(\\frac{2}{3}\\right)^n = \\frac{(2/3)^2}{1-2/3} = \\frac{4/9}{1/3} = \\frac{4}{3}$.",
    },
    {
      title: "טור מתטלסקופי (Telescoping)",
      tag: "שיטה",
      formal:
        "אם $a_n = f(n) - f(n+1)$, אז:\n$$S_N = \\sum_{n=1}^N (f(n)-f(n+1)) = f(1) - f(N+1)$$\nואם $f(N+1) \\to L$, הטור מתכנס ל-$f(1) - L$.",
      intuition:
        "כמו מפלפל שמתהפך — כל איבר 'מוחק' חלק מהקודם. רק הראש והזנב נשארים.",
      whenToUse:
        "כשניתן לכתוב $a_n$ כהפרש של פונקציה ב-$n$ ו-$n+1$. לרוב: פירוק לשברים חלקיים.",
      example:
        "$\\sum_{n=1}^\\infty \\frac{1}{n(n+1)}$: $\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$. $S_N = 1 - \\frac{1}{N+1} \\to 1$.",
    },
    {
      title: "אסור: פיצול טור לפני הוכחת התכנסות",
      tag: "אזהרה",
      formal:
        "**אסור** לכתוב $\\sum(a_n + b_n) = \\sum a_n + \\sum b_n$ אם לא ידוע שכל אחד מהטורים מתכנס!",
      intuition:
        "אם שניהם מתבדרים, הפיצול עלול לתת תשובה שגויה לגמרי.",
      warning:
        "גם אם $\\sum(a_n - b_n)$ מתכנס, לא ניתן להסיק שום דבר על $\\sum a_n$ ו-$\\sum b_n$ בנפרד. דוגמה: $a_n = 1/n$, $b_n = 1/n$ — $\\sum(a_n - b_n) = 0$ מתכנס, אבל $\\sum a_n$ ו-$\\sum b_n$ מתבדרים.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 7 — Convergence tests for non-negative series
   Based on: Lecture 6 (taught in recitation 7) + recitation 7
   ══════════════════════════════════════════════════════════════ */
const WEEK_7: WeekRichContent = {
  weekNumber: 7,
  mainGoal:
    "ללמוד את כל מבחני ההתכנסות לטורים אי-שליליים ולדעת מתי להשתמש בכל אחד.",
  guidingPrinciple:
    "אל תחשבי \"לחשב את סכום הטור\". המטרה היא להחליט אם הוא מתכנס או מתבדר — ולכן משתמשים במבחנים.",
  buildOn: "תנאי הכרחי (שבוע 3–4), טור הרמוני (שבוע 5), מבחן השוואה בסיסי (שבוע 5–6)",
  sections: [
    {
      title: "טור אי-שלילי",
      tag: "הגדרה",
      formal: "טור $\\sum a_n$ הוא אי-שלילי אם $a_n \\ge 0$ לכל $n \\ge k$.",
      whyItExists:
        "רוב מבחני ההתכנסות (השוואה, שורש, מנה, אינטגרל) מחייבים שהאיברים יהיו אי-שליליים. לכן חשוב לזהות את הסוג לפני שבוחרים מבחן.",
      intuition:
        "כשכל האיברים חיוביים, הסכומים החלקיים $S_N$ רק עולים. הטור מתכנס אם ורק אם הסכומים חסומים מלמעלה.",
      whenToUse: "לפני כל מבחן — בדקי שהאיברים אי-שליליים. אם יש סימנות מתחלפות — עוברים לשבוע 8.",
    },
    {
      title: "מבחן ההשוואה הגבולי",
      tag: "משפט",
      formal:
        "יהיו $a_n, b_n > 0$. אם $\\displaystyle\\lim_{n\\to\\infty} \\frac{a_n}{b_n} = L$ כאשר $0 < L < \\infty$, אז $\\sum a_n$ ו-$\\sum b_n$ מתכנסים יחד או מתבדרים יחד.",
      whyItExists:
        "מבחן ההשוואה הרגיל מחייב אי-שוויון מדויק ($a_n \\le b_n$) שלעיתים קשה להוכיח. הגרסה הגבולית מחליפה זאת בחישוב גבול — הרבה יותר נוח.",
      intuition:
        "אם $a_n / b_n \\to L > 0$, פירוש הדבר ש-$a_n$ ו-$b_n$ \"באותו סדר גודל\" — הם גדלים ומתקטנים יחד. לכן גורלם זהה.",
      whenToUse:
        "כשרואים $a_n$ שנראה כמו פולינום חלקי פולינום — מחלקים בחזקה הדומיננטית ומשווים ל-$1/n^p$.",
      notes: [
        "אם $L = 0$: רק כיוון אחד — $\\sum b_n$ מתכנס $\\Rightarrow$ $\\sum a_n$ מתכנס.",
        "אם $L = \\infty$: רק כיוון אחד — $\\sum b_n$ מתבדר $\\Rightarrow$ $\\sum a_n$ מתבדר.",
        "הכי שימושי: $b_n = 1/n^p$ לאיזה $p$ שנבחר לפי הדרגה.",
      ],
      warning:
        "לא לשכוח לבדוק ש-$L$ חיובי וסופי לפני שמסיקים בשני הכיוונים!",
      example:
        "$a_n = \\dfrac{n+1}{n^3 - n}$. בחרי $b_n = \\dfrac{1}{n^2}$.\n$\\dfrac{a_n}{b_n} = \\dfrac{n^2(n+1)}{n^3-n} = \\dfrac{n^3+n^2}{n^3-n} \\to 1$.\nמכיוון ש-$\\sum 1/n^2$ מתכנס, גם $\\sum a_n$ מתכנס.",
    },
    {
      title: "מבחן האינטגרל",
      tag: "משפט",
      formal:
        "תהי $f: [k, \\infty) \\to \\mathbb{R}$ **יורדת, חיובית ורציפה**. אז:\n$$\\sum_{n=k}^{\\infty} f(n) < \\infty \\iff \\int_k^{\\infty} f(x)\\,dx < \\infty$$\nובנוסף: $\\displaystyle\\int_k^{\\infty} f(x)\\,dx \\le \\sum_{n=k}^{\\infty} f(n) \\le f(k) + \\int_k^{\\infty} f(x)\\,dx$",
      whyItExists:
        "כלי לטורים שמבחני השוואה/מנה/שורש לא עובדים עליהם — למשל כשיש $\\ln n$ באיבר.",
      intuition:
        "הסכום $\\sum f(n)$ הוא שטח של \"מדרגות\" מתחת לגרף. אם שטח הפונקציה $\\int f(x)\\,dx$ סופי — המדרגות גם כן.",
      whenToUse:
        "כשרואים $1/(n \\ln n)$, $1/(n (\\ln n)^2)$ וכד' — פונקציות שניתן לאינטגרל בקלות.",
      notes: [
        "**חובה לבדוק**: $f$ יורדת ורציפה! אם לא — המבחן לא חל.",
        "המבחן נותן **התכנסות**, לא את ערך הסכום.",
        "הטור ה-$p$ הרמוני הוא מקרה פרטי: $f(x) = 1/x^p$.",
      ],
      warning: "שכחת לבדוק יורדת? המבחן לא תקף! בדקי $f'(x) < 0$.",
      example:
        "$\\sum_{n=2}^{\\infty} \\dfrac{1}{n \\ln n}$: $f(x) = \\dfrac{1}{x \\ln x}$, יורדת וחיובית.\n$\\int_2^\\infty \\frac{dx}{x \\ln x} = [\\ln(\\ln x)]_2^\\infty = \\infty$. לכן הטור **מתבדר**.",
    },
    {
      title: "מבחן השורש (קושי)",
      tag: "משפט",
      formal:
        "יהי $L = \\displaystyle\\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}$.\n- $L < 1$: הטור **מתכנס** (מוחלטת).\n- $L > 1$: הטור **מתבדר**.\n- $L = 1$: המבחן **לא חושף**.",
      whyItExists:
        "כשיש חזקה ה-$n$ באיבר, השורש-$n$ \"מוריד\" את החזקה ומשאיר ביטוי פשוט יותר.",
      intuition:
        "אם $\\sqrt[n]{a_n} \\to L < 1$, אז לגדולים מספיק $n$: $a_n \\approx L^n$, כלומר הטור מתנהג כטור הנדסי עם $|q| < 1$ — מתכנס.",
      whenToUse:
        "כשרואים $(f(n))^n$, $n^n$, $a^n$ בנומרטור/מכנה. כלל אצבע: **$n^n$ → שורש**.",
      notes: [
        "בהרצאה: מוגדר עם $\\limsup$ — לביטחון לבדות גבול רגיל כשהוא קיים.",
        "המבחן מיוחד לביטויים עם חזקות $n$ — לא להפעיל על פולינומים פשוטים.",
      ],
      warning: "$L = 1$: צריך מבחן אחר. דוגמה: $\\sum 1/n$ ו-$\\sum 1/n^2$ שניהם נותנים $L=1$.",
      example:
        "$\\sum \\left(\\dfrac{n}{2n+1}\\right)^n$: $\\sqrt[n]{a_n} = \\dfrac{n}{2n+1} \\to \\dfrac{1}{2} < 1$. **מתכנס**.",
    },
    {
      title: "מבחן המנה (ד'אלמבר)",
      tag: "משפט",
      formal:
        "אם הטור חיובי ויהי $L = \\displaystyle\\lim_{n\\to\\infty} \\dfrac{a_{n+1}}{a_n}$:\n- $L < 1$: **מתכנס**.\n- $L > 1$: **מתבדר**.\n- $L = 1$: המבחן **לא חושף**.",
      whyItExists:
        "עצרת $n!$ מופיעה הרבה — במנה $a_{n+1}/a_n$ היא מפשטת לגורם $(n+1)$. המבחן בנוי לזה.",
      intuition:
        "בוחן אם כל איבר קטן מקודמו בגורם קבוע $< 1$. אם כן — הטור מתנהג כטור הנדסי.",
      whenToUse:
        "כשרואים $n!$, $a^n$, $n^n$ — או כל שילוב שלהם. כלל אצבע: **$n!$ → מנה**.",
      notes: [
        "הרעיון: היחס $a_{n+1}/a_n$ \"מחקה\" את $q$ של טור הנדסי.",
        "בפועל לרוב ישתמשו בבית: מנה ← שורש הוא חזק יותר (אם המנה נותנת $L$, השורש נותן את אותו $L$).",
      ],
      warning: "כשיש $n^n$ בנומרטור — **שורש** בדרך כלל יותר קל ממנה!",
      example:
        "$\\sum \\dfrac{n!}{n^n}$: $\\dfrac{a_{n+1}}{a_n} = \\dfrac{(n+1)!}{(n+1)^{n+1}} \\cdot \\dfrac{n^n}{n!} = \\left(\\dfrac{n}{n+1}\\right)^n \\to e^{-1} < 1$. **מתכנס**.",
    },
    {
      title: "הטור ה-p הרמוני",
      tag: "מסקנה",
      formal:
        "$\\displaystyle\\sum_{n=1}^{\\infty} \\dfrac{1}{n^p}$ מתכנס $\\iff$ $p > 1$.",
      whyItExists:
        "זהו הסרגל המרכזי למבחן ההשוואה. כשרואים $a_n \\sim 1/n^p$ — התשובה מיידית.",
      intuition:
        "$p > 1$: האיברים קטנים מספיק מהר. $p \\le 1$: האיברים קטנים לאט מדי — הסכום 'מתפוצץ'.",
      whenToUse: "כסרגל לכל השוואה. בדקי תמיד לאיזה $p$ דומה $a_n$.",
      notes: [
        "$p = 1$: הטור הרמוני — **מתבדר**.",
        "$p = 2$: $\\sum 1/n^2 = \\pi^2/6$ — **מתכנס** (תוצאת אוילר).",
        "הוכחה: מבחן אינטגרל עם $f(x) = 1/x^p$.",
      ],
    },
    {
      title: "מתי להשתמש באיזה מבחן?",
      tag: "שיטה",
      formal:
        "זרימת החלטה:\n1. **תנאי הכרחי**: $a_n \\not\\to 0$? → מתבדר מיד.\n2. **$(f(n))^n$ או $n^n$** → מבחן שורש.\n3. **$n!$ או $a^n$** → מבחן מנה.\n4. **פולינום / שבר רציונלי** → השוואה גבולית ל-$1/n^p$.\n5. **$\\ln n$ או $\\arctan n$** → מבחן אינטגרל.",
      intuition:
        "הפעולה הראשונה תמיד: תנאי הכרחי. אחר כך — מה הצורה של $a_n$ קובעת את המבחן.",
      warning:
        "לא לקפוץ ישר למנה/שורש בלי לבדוק תנאי הכרחי. הרבה תרגילים מסתיימים שם.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 8 — Absolute convergence, conditional, Leibniz
   Based on: Lecture 7 + Recitation 8 (user's handwritten notes)
   ══════════════════════════════════════════════════════════════ */
const WEEK_8_DECISION_TREE: DecisionNode = {
  id: "root",
  question: "האם $a_n \\to 0$?",
  info: "תנאי הכרחי — בדיקה ראשונה תמיד",
  no: {
    label: "$a_n \\not\\to 0$",
    conclusion: "הטור מתבדר",
    conclusionColor: "red",
  },
  yes: {
    label: "$a_n \\to 0$ ✓",
    next: {
      id: "absolute",
      question: "האם $\\sum |a_n|$ מתכנס?",
      info: "השתמשי בכל מבחני שבוע 7 על $|a_n|$",
      yes: {
        label: "$\\sum |a_n| < \\infty$",
        conclusion: "מתכנס מוחלטת",
        conclusionColor: "green",
      },
      no: {
        label: "$\\sum |a_n| = \\infty$",
        next: {
          id: "leibniz",
          question: "האם תנאי לייבניץ מתקיימים?",
          info: "הטור = $\\sum (-1)^n b_n$, ו: (1) $b_n$ יורדת, (2) $b_n \\to 0$",
          yes: {
            label: "שני התנאים ✓",
            conclusion: "מתכנס מותנית",
            conclusionColor: "amber",
          },
          no: {
            label: "תנאי לא מתקיים",
            conclusion: "מתבדר",
            conclusionColor: "red",
          },
        },
      },
    },
  },
};

const WEEK_8: WeekRichContent = {
  weekNumber: 8,
  mainGoal:
    "להבין את ההבדל בין התכנסות מוחלטת למותנית, ולדעת להפעיל את מבחן לייבניץ.",
  guidingPrinciple:
    "כשיש $(-1)^n$ — קודם נסי מוחלטת. אם לא — נסי לייבניץ. אל תפעילי לייבניץ לפני שבדקת מוחלטת.",
  buildOn:
    "כל מבחני שבוע 7 — הם נחוצים לבדיקת $\\sum |a_n|$",
  decisionTree: WEEK_8_DECISION_TREE,
  sections: [
    {
      title: "התכנסות מוחלטת",
      tag: "הגדרה",
      formal:
        "$\\sum a_n$ מתכנס **מוחלטת** אם $\\sum |a_n|$ מתכנס.",
      whyItExists:
        "זוהי צורת ההתכנסות ה\"חזקה\". אם הטור מתכנס גם בלי לתת לסימנות לבטל — הוא בטוח מתכנס.",
      intuition:
        "דמייני שכל האיברים חיוביים — הטור עדיין מסתדר. זה הרבה חזק יותר מהתכנסות רגילה שמסתמכת על ביטולי סימנות.",
      notes: [
        "**משפט**: מוחלטת $\\Rightarrow$ התכנסות רגילה. ההפך לא נכון.",
        "לכן: אם הוכחת מוחלטת — סיימת. אין צורך בלייבניץ.",
      ],
      example:
        "$\\sum \\dfrac{(-1)^n}{n^2}$: $\\sum \\dfrac{1}{n^2}$ מתכנס $(p=2>1)$. לכן **מוחלטת**.",
    },
    {
      title: "התכנסות מותנית",
      tag: "הגדרה",
      formal:
        "$\\sum a_n$ מתכנסת **מותנית** אם: (1) $\\sum a_n$ מתכנס, אך (2) $\\sum |a_n|$ מתבדר.",
      whyItExists:
        "מציינת מצב ביניים — הטור מתכנס רק בזכות ביטול בין חיוביים לשליליים, לא בזכות 'קטנות' אמיתית.",
      intuition:
        "כמו קבוצה שמתאזנת רק כי כל חוב מקוזז מיד. אם נסדר מחדש את הסדר — האיזון יתמוטט.",
      warning:
        "**משפט ריארנז'מנט של רימן**: כל טור מתכנס מותנית ניתן לסדר מחדש כך שיתכנס לכל מספר שנרצה — או אפילו יתבדר. לכן אל תשני סדר בטורים מותניים!",
      example:
        "$\\sum \\dfrac{(-1)^{n+1}}{n} = 1 - \\tfrac{1}{2} + \\tfrac{1}{3} - \\cdots = \\ln 2$. מתכנס (לייבניץ). $\\sum \\tfrac{1}{n}$ מתבדר. לכן **מותנית**.",
    },
    {
      title: "מבחן לייבניץ",
      tag: "משפט",
      formal:
        "יהי $\\sum_{n=1}^\\infty (-1)^{n+1} b_n$ עם $b_n > 0$. אם:\n1. $b_n$ **יורדת מונוטונית**: $b_{n+1} \\le b_n$\n2. $\\lim_{n\\to\\infty} b_n = 0$\n\nאז הטור **מתכנס**. ובנוסף: $|S - S_N| \\le b_{N+1}$ (הערכת שגיאה).",
      whyItExists:
        "כשהמבחנים של שבוע 7 לא עובדים (כי $\\sum |a_n|$ מתבדר), לייבניץ נותן קריטריון להתכנסות מותנית.",
      intuition:
        "הסכומים החלקיים $S_1, S_2, S_3, \\ldots$ מקפצים: גדול, קטן, גדול, קטן... אבל הקפיצות קטנות ומתאפסות — לכן מתכנסים לגבול.",
      whenToUse:
        "רק אחרי שבדקת ש-$\\sum |a_n|$ מתבדר. אל תפעילי לפני.",
      notes: [
        "**צריך לבדוק שניהם**: יורדת **וגם** $b_n \\to 0$.",
        "לפעמים יורדת רק מ-$n = k$ גדול מסוים — זה בסדר (זנב).",
        "הערכת שגיאה: $|S - S_N| \\le b_{N+1}$ שימושית בשאלות קירוב.",
      ],
      warning:
        "לא בדקת שיורדת מונוטונית? לייבניץ לא תקף! לדוגמה: $b_n = 1/n$ עם $b_1 > b_2 > \\cdots$ — צריך לאמת, לא רק להניח.",
      example:
        "$\\sum_{n=1}^\\infty \\dfrac{(-1)^{n+1}}{\\sqrt{n}}$: $b_n = 1/\\sqrt{n}$. יורדת? כן, $1/\\sqrt{n+1} < 1/\\sqrt{n}$. $b_n \\to 0$? כן. לכן **מתכנס** (מותנית — כי $\\sum 1/\\sqrt{n} = \\sum 1/n^{1/2}$ מתבדר, $p=1/2 < 1$).",
    },
    {
      title: "אסטרטגיית הפתרון לטורים עם סימנות",
      tag: "שיטה",
      formal:
        "**צעד 1**: תנאי הכרחי — $a_n \\to 0$? אם לא — מתבדר.\n**צעד 2**: נסי מוחלטת — $\\sum |a_n|$ מתכנס? השתמשי בכל מבחני שבוע 7.\n**צעד 3**: אם לא מוחלטת — האם $\\sum (-1)^n b_n$ ותנאי לייבניץ?\n**צעד 4**: אם כן — מתכנס מותנית. אם לא — מתבדר.",
      intuition:
        "הסדר הזה לא מקרי: הוא הולך מהחזק לחלש. כשמצאת מוחלטת — סיימת. כשלא — ניסית להציל.",
      notes: [
        "סיכום: $\\sum |a_n| < \\infty$ ← מוחלטת ← מתכנס.",
        "סיכום: $\\sum |a_n| = \\infty$, לייבניץ ← מותנית.",
        "אם גם לייבניץ נכשל — מתבדר.",
      ],
    },
    {
      title: "הסכומים החלקיים $S_{2N}$ ו-$S_{2N-1}$ בלייבניץ",
      tag: "הערה",
      formal:
        "בטור לייבניץ: $S_{2N}$ עולה מונוטונית וחסומה מעל. $S_{2N-1}$ יורדת ומחסומה מתחת. שניהם שואפים לאותו גבול $S$.",
      intuition:
        "הסכומים הזוגיים 'מתקרבים מלמטה' והסכומים האי-זוגיים 'מתקרבים מלמעלה'. כמו מספריים שמתכנסים לנקודה אחת.",
      notes: [
        "זה הרעיון שעומד מאחורי הוכחת לייבניץ — מונוטוני-חסום על כל אחת מהסדרות.",
        "מכאן גם השגיאה: $|S - S_N| \\le |a_{N+1}| = b_{N+1}$.",
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 9 — Power series
   ══════════════════════════════════════════════════════════════ */
const WEEK_9: WeekRichContent = {
  weekNumber: 9,
  mainGoal:
    "להבין טורי חזקות: תחום התכנסות, רדיוס התכנסות, בדיקת קצוות וערך מפורש ללא סיגמה.",
  guidingPrinciple:
    "בטור חזקות קודם מוצאים את האזור הפנימי בעזרת רדיוס, ואז בודקים את הקצוות ידנית בטור המקורי.",
  buildOn: "טורים גיאומטריים, מבחן מנה, מבחן שורש, טורי $p$, לייבניץ והתכנסות מוחלטת",
  fullSummaryMarkdown: readContentFile("week-9-summary.md"),
  sections: [
    {
      title: "טבלת מבחנים — זיהוי מהיר",
      tag: "שיטה",
      formal:
        "| צורת $a_n$ | מבחן מומלץ |\n|---|---|\n| $a_n \\not\\to 0$ | **תנאי הכרחי** — מתבדר |\n| $(f(n))^n$ | **שורש** |\n| $a^n$ בלבד | **שורש** או **מנה** |\n| $n!$ | **מנה** |\n| $n^n$ | **שורש** |\n| $P(n)/Q(n)$ (פולינומים) | **השוואה גבולית** ל-$1/n^{\\deg Q - \\deg P}$ |\n| $1/(n^p)$ ישיר | **טור $p$** |\n| $f(n)$ שניתן לאינטגרל | **אינטגרל** |\n| $(-1)^n b_n$ | **מוחלטת** קודם, אח\"כ **לייבניץ** |",
      intuition:
        "בחרי מבחן לפי הצורה של $a_n$ — לא לפי מה שנוח. טעות נפוצה: להפעיל מנה כשיש $n^n$.",
    },
    {
      title: "מה ההבדל בין מוחלטת, מותנית, מתבדרת?",
      tag: "מסקנה",
      formal:
        "שלושת האפשרויות:\n- **מוחלטת**: $\\sum |a_n| < \\infty$ (← $\\sum a_n$ מתכנס).\n- **מותנית**: $\\sum a_n$ מתכנס אך $\\sum |a_n| = \\infty$.\n- **מתבדר**: $\\sum a_n$ לא מתכנס.",
      intuition:
        "מוחלטת = חזק. מותנית = חלש (רק בזכות ביטול). מתבדרת = אין התכנסות.",
      notes: [
        "כשנשאלים 'האם מתכנס?' — ציינו **מוחלטת/מותנית/מתבדר**, לא רק כן/לא.",
        "בבחינות לרוב מבקשים לסווג — לא רק לקבוע.",
      ],
    },
    {
      title: "אזהרה: $L = 1$ במנה ובשורש",
      tag: "אזהרה",
      formal:
        "כשמבחן מנה או שורש נותנים $L = 1$, המבחן **לא חושף** כלום. צריך מבחן אחר.",
      intuition:
        "גם הטור המתכנס $\\sum 1/n^2$ וגם המתבדר $\\sum 1/n$ נותנים $L=1$ במנה ובשורש. לכן $L=1$ לא מסייע.",
      whenToUse:
        "כשקיבלת $L=1$: נסי השוואה גבולית, אינטגרל, או לפרק את $a_n$ ישירות.",
      example:
        "$\\sum 1/n$: מנה: $(n/(n+1)) \\to 1$. שורש: $\\sqrt[n]{1/n} = 1/n^{1/n} \\to 1$. שני המבחנים לא עוזרים — צריך השוואה / אינטגרל.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   WEEK 10 — Taylor / Maclaurin Series, Computing Power Series Values
   Based on: תרגול_10_תמלול_נקי.md
   ══════════════════════════════════════════════════════════════ */
const WEEK_10: WeekRichContent = {
  weekNumber: 10,
  mainGoal:
    "לדעת לחשב סכומי טורי חזקות ידועים, לגזור ולאנטגרל טורי חזקות איבר-איבר, ולהשתמש במשפט היחידות של טיילור.",
  guidingPrinciple:
    "כמעט כל טור חזקות ניתן לחישוב על ידי 'קוסמטיקה' — החלפת משתנה, גזירה, או אינטגרציה של טור גיאומטרי ידוע. המפתח: זהי איזה טור ידוע מסתתר.",
  buildOn: "טורי חזקות ורדיוס התכנסות (שבוע 9), שיטות אינטגרציה (שבוע 3–4)",
  sections: [
    {
      title: "טורי מקלורן הבסיסיים — לשנן!",
      tag: "כלל",
      formal:
        "$$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\cdots \\quad (|x| < \\infty)$$\n$$\\sin x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} \\quad (|x| < \\infty)$$\n$$\\cos x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!} \\quad (|x| < \\infty)$$\n$$\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n \\quad (|x| < 1)$$\n$$\\ln(1+x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1} x^n}{n} \\quad (-1 < x \\le 1)$$\n$$\\arctan x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{2n+1} \\quad (|x| \\le 1)$$",
      intuition:
        "אלה 'הלבנות' של חשבון טורי חזקות. כל חישוב אחר מתבסס על אחד מהטורים הללו.",
      whenToUse:
        "תמיד — זהי תחילה איזה טור ידוע מסתתר בתוך הטור שנשאלים עליו.",
    },
    {
      title: "גזירה ואינטגרציה איבר-איבר",
      tag: "משפט",
      formal:
        "אם $f(x) = \\sum_{n=0}^\\infty a_n x^n$ לכל $|x| < R$, אז לכל $|x| < R$:\n$$f'(x) = \\sum_{n=1}^\\infty n \\cdot a_n x^{n-1}$$\n$$\\int_0^x f(t)\\,dt = \\sum_{n=0}^\\infty \\frac{a_n}{n+1} x^{n+1}$$\nורדיוס ההתכנסות נשמר.",
      whyItExists:
        "מאפשר לחשב טורים חדשים מטורים ידועים — בגזירה ואינטגרציה של האיברים.",
      intuition:
        "טור חזקות הוא 'פולינום אינסופי'. כמו שגוזרים פולינום איבר-איבר, כך גם טור חזקות.",
      whenToUse:
        "כשרואים טור שדומה לנגזרת או לאינטגרל של טור ידוע.",
      notes: [
        "גזירה: הרדיוס לא משתנה, אבל **הקצוות** עלולים להשתנות — בדקי אותם מחדש.",
        "אינטגרציה: אותו הדבר.",
      ],
      example:
        "$\\frac{1}{(1-x)^2} = \\frac{d}{dx}\\left(\\frac{1}{1-x}\\right) = \\frac{d}{dx}\\sum x^n = \\sum_{n=1}^\\infty n x^{n-1}$ לכל $|x|<1$.",
    },
    {
      title: "קוסמטיקה — החלפת משתנה בטורים ידועים",
      tag: "שיטה",
      formal:
        "כדי לחשב $\\sum a_n x^n$ שאינו סטנדרטי, החלף $x \\to g(x)$ בטור ידוע:\n- $\\frac{1}{1+x^2} = \\sum_{n=0}^\\infty (-1)^n x^{2n}$ (הנח $x \\to -x^2$ ב-$\\frac{1}{1-x}$)\n- $e^{-x^2} = \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n}}{n!}$ (הנח $x \\to -x^2$ ב-$e^x$)",
      intuition:
        "הטור הגיאומטרי הוא 'עץ' שמולידים ממנו אחרים. כל פעם מחליפים את $x$ במשהו אחר.",
      whenToUse:
        "כשרואים ביטוי שמזכיר אחד מהטורים הידועים, אבל עם ארגומנט שונה.",
      example:
        "$\\int_0^x e^{-t^2}\\,dt$: אין אנטי-נגזרת יסודית. אבל $e^{-t^2} = \\sum_{n=0}^\\infty \\frac{(-1)^n t^{2n}}{n!}$, ולכן:\n$\\int_0^x e^{-t^2}\\,dt = \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{n!(2n+1)}$.",
    },
    {
      title: "טריק: $n \\cdot x^n = x \\cdot \\frac{d}{dx}(x^n)$",
      tag: "שיטה",
      formal:
        "כדי לחשב $\\sum_{n=0}^\\infty n x^n$, שים לב: $n x^n = x \\cdot (x^n)' = x \\cdot n x^{n-1}$. לכן:\n$$\\sum_{n=0}^\\infty n x^n = x \\sum_{n=1}^\\infty n x^{n-1} = x \\cdot \\frac{d}{dx}\\left(\\frac{1}{1-x}\\right) = \\frac{x}{(1-x)^2}$$",
      intuition:
        "כשיש גורם $n$ לפני $x^n$ — זה 'צועק' גזירה. גוזרים את $\\sum x^n$, כופלים ב-$x$.",
      whenToUse:
        "כשרואים $\\sum n x^n$, $\\sum n^2 x^n$, $\\sum n(n-1) x^n$ — הכפלה בגזירות חוזרות.",
      example:
        "$\\sum_{n=1}^\\infty \\frac{n}{2^n}$: הנח $x = 1/2$ ב-$\\sum n x^n = \\frac{x}{(1-x)^2}$. $\\frac{1/2}{(1/2)^2} = \\frac{1/2}{1/4} = 2$.",
    },
    {
      title: "משפט היחידות של טיילור",
      tag: "משפט",
      formal:
        "אם $f(x) = \\sum_{n=0}^\\infty a_n x^n$ בסביבת 0, אז $a_n = \\dfrac{f^{(n)}(0)}{n!}$.\nכלומר: הפיתוח חד-ערכי — **אין שני פיתוחים שונים** לטור חזקות של אותה פונקציה.",
      whyItExists:
        "מאפשר לחשב נגזרות גבוהות של פונקציה בנקודה — פשוט מהמקדמים של הטור!",
      intuition:
        "אם מצאנו את פיתוח הטיילור בכל דרך שהיא (קוסמטיקה, גזירה, אינטגרציה) — הוא הנכון. אין חשיבות לדרך.",
      whenToUse:
        "שאלות מהצורה 'מה $f^{(17)}(0)$?' — פתח ל-$x^{17}$ ומצא $a_{17} = f^{(17)}(0)/17!$.",
      example:
        "$f(x) = \\frac{\\sin x}{x}$ (עם $f(0)=1$). $\\sin x = x - x^3/6 + x^5/120 - \\cdots$, ולכן $f(x) = 1 - x^2/6 + x^4/120 - \\cdots$.\nמשפט היחידות: $f''(0)/2! = -1/6$, ולכן $f''(0) = -1/3$.",
    },
    {
      title: "חישוב סכום טור בנקודה נתונה",
      tag: "שיטה",
      formal:
        "שלבים:\n1. זהי את הטור: לאיזה טור ידוע $\\sum a_n x^n$ הוא שווה?\n2. בצעי קוסמטיקה אם נחוץ (גזור / אנטגרל / החלף $x$).\n3. הצב את הערך הנתון.",
      intuition:
        "סכום טור = ערך פונקציה. אם $\\sum a_n x^n = f(x)$, אז הסכום בנקודה $x_0$ הוא $f(x_0)$.",
      notes: [
        "חשוב: ודאי שהנקודה נמצאת בתחום ההתכנסות לפני ההצבה!",
        "לתחום פתוח: מבחן מנה/שורש. לקצוות: בדיקה ידנית.",
      ],
      example:
        "$\\sum_{n=0}^\\infty \\frac{(-1)^n}{2n+1}$: זהי $\\arctan x = \\sum \\frac{(-1)^n x^{2n+1}}{2n+1}$. הצב $x=1$: $\\arctan 1 = \\pi/4$. לכן הסכום הוא $\\pi/4$.",
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   Registry
   ══════════════════════════════════════════════════════════════ */
const REGISTRY: Record<number, WeekRichContent> = {
  1: WEEK_1,
  2: WEEK_2,
  3: WEEK_3,
  4: WEEK_4,
  5: WEEK_5,
  6: WEEK_6,
  7: WEEK_7,
  8: WEEK_8,
  9: WEEK_9,
  10: WEEK_10,
};

export function getWeekRichContent(weekNumber: number): WeekRichContent | null {
  return REGISTRY[weekNumber] ?? null;
}
