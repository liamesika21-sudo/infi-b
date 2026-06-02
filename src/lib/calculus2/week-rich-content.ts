/**
 * Rich pedagogical content for each week — written manually based on
 * lecture summaries, recitation notes, and Max's explanations.
 * This is the "real" content that makes the summaries useful for studying.
 */

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
  sections: RichSection[];
}

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
        "בפועל לרוב ישתמשים בבית: מנה ← שורש הוא חזק יותר (אם המנה נותנת $L$, השורש נותן את אותו $L$).",
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
   WEEK 9 — Mixed practice + review of all convergence
   ══════════════════════════════════════════════════════════════ */
const WEEK_9: WeekRichContent = {
  weekNumber: 9,
  mainGoal:
    "לפתור שאלות מעורבות על התכנסות — לזהות את המבחן הנכון לפי צורת $a_n$.",
  guidingPrinciple:
    "בשאלת טור: (1) תנאי הכרחי תמיד ראשון. (2) יש $(-1)^n$? → מוחלטת קודם. (3) שאר הסימנים קובעים את המבחן.",
  buildOn: "כל מבחני שבועות 5–8",
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
   Registry
   ══════════════════════════════════════════════════════════════ */
const REGISTRY: Record<number, WeekRichContent> = {
  7: WEEK_7,
  8: WEEK_8,
  9: WEEK_9,
};

export function getWeekRichContent(weekNumber: number): WeekRichContent | null {
  return REGISTRY[weekNumber] ?? null;
}
