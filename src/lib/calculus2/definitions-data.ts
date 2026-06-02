export type DefinitionCategory =
  | "sequences"
  | "series"
  | "convergence-tests"
  | "special-series"
  | "convergence-types";

export interface DefinitionEntry {
  id: string;
  term: string;
  termHe: string;
  category: DefinitionCategory;
  weekNumbers: number[];
  recitationNumbers: number[];
  formal: string;
  intuitive: string;
  whenUsed: string;
  example: string;
  commonMistake?: string;
  relatedIds: string[];
}

export const DEFINITIONS: DefinitionEntry[] = [
  /* ──────────────────────────── SEQUENCES ──────────────────────────── */
  {
    id: "sequence",
    term: "Sequence",
    termHe: "סדרה",
    category: "sequences",
    weekNumbers: [1, 2],
    recitationNumbers: [2, 3],
    formal:
      "סדרה היא פונקציה $a: \\mathbb{N} \\to \\mathbb{R}$. " +
      "כותבים $\\{a_n\\}_{n=1}^{\\infty}$ או $(a_n)$.",
    intuitive:
      "רשימה אינסופית של מספרים ממוינים לפי סדר: $a_1, a_2, a_3, \\ldots$ " +
      "כל איבר $a_n$ הוא מספר ממשי שמוגדר על-ידי הנוסחה של הסדרה.",
    whenUsed:
      "כאשר בוחנים את ההתנהגות של ביטויים תלויי-$n$ עבור $n \\to \\infty$, " +
      "ובמיוחד כצעד ראשון לפני הגדרת טור.",
    example:
      "$a_n = \\dfrac{1}{n}$ נותנת $1,\\, \\tfrac{1}{2},\\, \\tfrac{1}{3},\\, \\ldots$ — סדרה שמתכנסת לאפס.",
    relatedIds: ["sequence-limit", "bounded-sequence", "monotone-sequence", "series"],
  },
  {
    id: "sequence-limit",
    term: "Limit of a sequence",
    termHe: "גבול סדרה",
    category: "sequences",
    weekNumbers: [1, 2],
    recitationNumbers: [2, 3],
    formal:
      "$\\lim_{n \\to \\infty} a_n = L$ אם לכל $\\varepsilon > 0$ קיים $N \\in \\mathbb{N}$ כך שלכל $n > N$: $|a_n - L| < \\varepsilon$.",
    intuitive:
      "הסדרה מתקרבת ל-$L$ ככל שנלך רחוק יותר ברשימה. " +
      "\"קרוב\" פירושו שניתן לדרוש כל דיוק $\\varepsilon$ שנרצה ולמצוא נקודה ממנה הסדרה לעולם לא תתרחק יותר מ-$\\varepsilon$ מ-$L$.",
    whenUsed:
      "כדי לבדוק אם סדרה מתכנסת. " +
      "נחוץ לפני בדיקת התכנסות טור (תנאי הכרחי: $a_n \\to 0$).",
    example:
      "$a_n = \\dfrac{n+1}{n} = 1 + \\dfrac{1}{n} \\xrightarrow{n\\to\\infty} 1$. " +
      "כאן $L = 1$.",
    commonMistake:
      "לבלבל בין גבול הסדרה $\\lim a_n$ לבין גבול הפונקציה $\\lim_{x\\to\\infty} f(x)$. " +
      "הם קשורים אך לא זהים; גבול הפונקציה מחייב את $f$ להיות רציפה.",
    relatedIds: ["sequence", "series", "necessary-condition"],
  },
  {
    id: "bounded-sequence",
    term: "Bounded sequence",
    termHe: "סדרה חסומה",
    category: "sequences",
    weekNumbers: [2],
    recitationNumbers: [2, 3],
    formal:
      "סדרה $(a_n)$ חסומה אם קיים $M > 0$ כך שלכל $n$: $|a_n| \\le M$. " +
      "חסומה מלמעלה אם $a_n \\le M$; חסומה מלמטה אם $a_n \\ge m$.",
    intuitive:
      "כל איברי הסדרה נמצאים בתוך תחום קבוע — הסדרה לא יכולה ל\"ברוח\" לאינסוף.",
    whenUsed:
      "בשילוב עם מונוטוניות: סדרה מונוטונית וחסומה בהכרח מתכנסת (משפט הקיום). " +
      "גם שימושי בבדיקות השוואה.",
    example:
      "$a_n = (-1)^n$ חסומה ($|a_n| = 1 \\le 1$) אך אינה מתכנסת — חסימות לא מספיקה לבדה.",
    commonMistake:
      "לא כל סדרה חסומה מתכנסת! חסימות + מונוטוניות ← התכנסות.",
    relatedIds: ["sequence", "monotone-sequence", "sequence-limit"],
  },
  {
    id: "monotone-sequence",
    term: "Monotone sequence",
    termHe: "סדרה מונוטונית",
    category: "sequences",
    weekNumbers: [2],
    recitationNumbers: [2, 3],
    formal:
      "$(a_n)$ עולה (monotone increasing) אם $a_{n+1} \\ge a_n$ לכל $n$. " +
      "יורדת אם $a_{n+1} \\le a_n$ לכל $n$.",
    intuitive:
      "הסדרה הולכת תמיד באותו כיוון — עולה או יורדת — ולא 'קופצת' לכאן ולכאן.",
    whenUsed:
      "משפט מונוטוני-חסום: אם סדרה מונוטונית וחסומה, היא מתכנסת. " +
      "שימושי כשאי-אפשר לחשב את הגבול ישירות.",
    example:
      "$a_n = 1 - \\dfrac{1}{n}$ עולה מונוטונית ומתכנסת ל-$1$.",
    relatedIds: ["sequence", "bounded-sequence", "sequence-limit"],
  },

  /* ──────────────────────────── SERIES ──────────────────────────── */
  {
    id: "series",
    term: "Series",
    termHe: "טור",
    category: "series",
    weekNumbers: [3, 4],
    recitationNumbers: [4, 5],
    formal:
      "טור הוא סכום אינסופי $\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\cdots$. " +
      "הסכום החלקי ה-$N$ הוא $S_N = \\sum_{n=1}^{N} a_n$.",
    intuitive:
      "מחברים את כל איברי הסדרה יחד. אם הסכומים החלקיים $(S_N)$ מתכנסים לגבול $L$, " +
      "אומרים שהטור מתכנס ל-$L$.",
    whenUsed:
      "בכל שאלה שמבקשת לבדוק אם סכום אינסופי מתכנס, או לחשב ערכו.",
    example:
      "$\\sum_{n=1}^{\\infty} \\dfrac{1}{2^n} = \\dfrac{1/2}{1-1/2} = 1$ — טור הנדסי שמתכנס.",
    relatedIds: ["sequence", "convergent-series", "divergent-series", "series-tail"],
  },
  {
    id: "convergent-series",
    term: "Convergent series",
    termHe: "טור מתכנס",
    category: "series",
    weekNumbers: [3, 4],
    recitationNumbers: [4, 5],
    formal:
      "$\\sum a_n$ מתכנס אם $\\lim_{N \\to \\infty} S_N$ קיים וסופי, " +
      "כלומר $\\lim_{N\\to\\infty} \\sum_{n=1}^{N} a_n = L \\in \\mathbb{R}$.",
    intuitive:
      "ניתן להגיע ל\"סכום\" של כל האינסוף — מספר סופי ומוגדר. " +
      "כמו לחסוך אינסוף מטבעות שמתקטנות מהר מספיק.",
    whenUsed:
      "מטרת רוב שאלות הטורים: לקבוע אם הטור מתכנס ולמצוא לאן.",
    example:
      "$\\sum_{n=0}^{\\infty} \\dfrac{1}{3^n} = \\dfrac{1}{1-1/3} = \\dfrac{3}{2}$ מתכנס.",
    relatedIds: ["series", "divergent-series", "absolute-convergence", "conditional-convergence"],
  },
  {
    id: "divergent-series",
    term: "Divergent series",
    termHe: "טור מתבדר",
    category: "series",
    weekNumbers: [3, 4],
    recitationNumbers: [4, 5],
    formal:
      "$\\sum a_n$ מתבדר אם $\\lim_{N\\to\\infty} S_N$ לא קיים (כולל $\\pm\\infty$).",
    intuitive:
      "הסכום 'ברח' לאינסוף או 'קופץ' ולא מסתדר. " +
      "אין שום מספר שניתן לקרוא לו 'ערך הטור'.",
    whenUsed:
      "אחרי שבדקנו ומצאנו שהטור לא מתכנס. " +
      "חשוב להוכיח התבדרות, לא רק להניח אותה.",
    example:
      "$\\sum_{n=1}^{\\infty} 1 = 1+1+1+\\cdots$ מתבדר לאינסוף. " +
      "$\\sum (-1)^n$ מתבדר כי $S_N$ מקפץ בין $0$ ו-$-1$.",
    commonMistake:
      "אם $a_n \\not\\to 0$, הטור מתבדר (תנאי הכרחי). " +
      "אך $a_n \\to 0$ לא מבטיח התכנסות — ראי טור הרמוני!",
    relatedIds: ["series", "convergent-series", "necessary-condition", "harmonic-series"],
  },
  {
    id: "necessary-condition",
    term: "Necessary condition for convergence",
    termHe: "תנאי הכרחי להתכנסות",
    category: "series",
    weekNumbers: [3, 4],
    recitationNumbers: [4, 5],
    formal:
      "אם $\\sum a_n$ מתכנס, אז $\\lim_{n\\to\\infty} a_n = 0$. " +
      "(ניגוד: אם $a_n \\not\\to 0$, הטור מתבדר.)",
    intuitive:
      "לא ניתן לסכום מספרים שלא מתאפסים. " +
      "אם האיברים לא הולכים לאפס, הסכום 'גדל ללא עצור'.",
    whenUsed:
      "תמיד בדיקה ראשונה! אם $\\lim a_n \\ne 0$ — הטור מתבדר מיד. " +
      "חוסך הרבה עבודה.",
    example:
      "$\\sum \\dfrac{n}{n+1}$: כאן $a_n = \\dfrac{n}{n+1} \\to 1 \\ne 0$ — הטור מתבדר.",
    commonMistake:
      "$a_n \\to 0$ הוא תנאי הכרחי אך לא מספיק. " +
      "הטור הרמוני $\\sum 1/n$ הוא הדוגמה הקלאסית: $1/n \\to 0$ אך הטור מתבדר.",
    relatedIds: ["series", "divergent-series", "harmonic-series"],
  },
  {
    id: "series-tail",
    term: "Tail of a series",
    termHe: "זנב טור",
    category: "series",
    weekNumbers: [4, 5],
    recitationNumbers: [5, 6],
    formal:
      "הזנב מ-$N$ של הטור $\\sum a_n$ הוא $\\sum_{n=N}^{\\infty} a_n$. " +
      "הטור מתכנס אם ורק אם כל זנב שלו מתכנס.",
    intuitive:
      "ניתן 'לחתוך' מספר סופי של איברים מתחילת הטור מבלי לשנות את ההתכנסות. " +
      "רק הזנב קובע.",
    whenUsed:
      "כאשר הגדרת הטור מתחילה ממספר שאינו 1, " +
      "או כאשר צריך להתמקד בהתנהגות לאינסוף בלבד.",
    example:
      "$\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ מתכנס ↔ $\\sum_{n=100}^{\\infty} \\frac{1}{n^2}$ מתכנס. " +
      "הזנב לא משנה התכנסות, רק ערך.",
    relatedIds: ["series", "convergent-series", "comparison-test"],
  },

  /* ──────────────────────────── SPECIAL SERIES ──────────────────────────── */
  {
    id: "geometric-series",
    term: "Geometric series",
    termHe: "טור הנדסי",
    category: "special-series",
    weekNumbers: [3],
    recitationNumbers: [4],
    formal:
      "$\\sum_{n=0}^{\\infty} r^n = \\dfrac{1}{1-r}$ עבור $|r| < 1$. " +
      "מתבדר עבור $|r| \\ge 1$.",
    intuitive:
      "כל איבר הוא פי $r$ מקודמו. אם $|r| < 1$ האיברים מתאפסים מהר מספיק, " +
      "והסכום מתכנס לנוסחה סגורה.",
    whenUsed:
      "בדיקת ראיית דמיון לטור הנדסי (מבחן המנה/שורש יתנו $|r|$). " +
      "גם ישירות כשרואים $c^n$ בנומרטור/מכנה.",
    example:
      "$\\sum_{n=0}^{\\infty} \\left(\\dfrac{2}{3}\\right)^n = \\dfrac{1}{1 - 2/3} = 3$.",
    commonMistake:
      "לא לשכוח שהנוסחה מתחילה מ-$n=0$! " +
      "אם הטור מתחיל מ-$n=1$: $\\sum_{n=1}^\\infty r^n = \\dfrac{r}{1-r}$.",
    relatedIds: ["series", "convergent-series", "ratio-test"],
  },
  {
    id: "harmonic-series",
    term: "Harmonic series",
    termHe: "טור הרמוני",
    category: "special-series",
    weekNumbers: [4, 5],
    recitationNumbers: [5, 6],
    formal:
      "$\\sum_{n=1}^{\\infty} \\dfrac{1}{n} = 1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\cdots$ — מתבדר.",
    intuitive:
      "למרות שהאיברים הולכים לאפס, הם עושים זאת לאט מדי. " +
      "ניתן לקבץ אותם לחבילות שכל אחת מסתכמת ל-$\\ge \\frac{1}{2}$, " +
      "ולכן הסכום הולך לאינסוף.",
    whenUsed:
      "כסרגל בדיקת השוואה: טורים 'לא קטנים מ-$1/n$' בדרך כלל מתבדרים. " +
      "הדוגמה ה'קלאסית' של תנאי הכרחי שלא מספיק.",
    example:
      "$\\sum_{n=1}^{\\infty} \\dfrac{1}{n}$ מתבדר, למרות ש-$\\dfrac{1}{n} \\to 0$.",
    commonMistake:
      "הרבה סטודנטים מניחים שהוא מתכנס כי $1/n \\to 0$. זו הטעות הקלאסית.",
    relatedIds: ["p-harmonic-series", "comparison-test", "integral-test", "necessary-condition"],
  },
  {
    id: "p-harmonic-series",
    term: "p-series (p-harmonic series)",
    termHe: "טור p-הרמוני",
    category: "special-series",
    weekNumbers: [5, 6],
    recitationNumbers: [6, 7],
    formal:
      "$\\sum_{n=1}^{\\infty} \\dfrac{1}{n^p}$ מתכנס אם ורק אם $p > 1$.",
    intuitive:
      "ל-$p$ גדול ($p > 1$) האיברים קטנים מספיק מהר — הסכום מסתדר. " +
      "ל-$p \\le 1$ האיברים קטנים לאט מדי (כמו ב-$1/n$).",
    whenUsed:
      "זהו הסרגל המרכזי לבדיקת השוואה! " +
      "כאשר רואים $1/n^{\\text{מספר}}$, הכרת טור ה-$p$ נותנת תשובה מיידית.",
    example:
      "$\\sum 1/n^2$ מתכנס ($p=2>1$). $\\sum 1/\\sqrt{n} = \\sum 1/n^{1/2}$ מתבדר ($p=1/2<1$).",
    commonMistake:
      "לבלבל עם $p = 1$ (טור רמוני, מתבדר). גבול — $p > 1$ בדיוק.",
    relatedIds: ["harmonic-series", "comparison-test", "integral-test"],
  },

  /* ──────────────────────────── NON-NEG SERIES ──────────────────────────── */
  {
    id: "nonneg-series",
    term: "Non-negative series",
    termHe: "טור עם איברים אי-שליליים",
    category: "series",
    weekNumbers: [5, 6],
    recitationNumbers: [6, 7],
    formal:
      "טור $\\sum a_n$ עם $a_n \\ge 0$ לכל $n$. " +
      "הסכומים החלקיים עולים מונוטונית: $S_1 \\le S_2 \\le \\cdots$",
    intuitive:
      "כשכל האיברים חיוביים, הסכומים החלקיים רק גדלים. " +
      "לכן הסכום מתכנס אם ורק אם הוא חסום מלמעלה.",
    whenUsed:
      "רוב מבחני ההתכנסות (השוואה, גבול השוואה, שורש, מנה, אינטגרל) מחייבים $a_n \\ge 0$.",
    example:
      "$\\sum 1/n^2 \\ge 0$ לכל $n$, ולכן ניתן להפעיל מבחן אינטגרל.",
    relatedIds: ["series", "comparison-test", "limit-comparison-test"],
  },

  /* ──────────────────────────── CONVERGENCE TESTS ──────────────────────────── */
  {
    id: "comparison-test",
    term: "Comparison test",
    termHe: "מבחן ההשוואה",
    category: "convergence-tests",
    weekNumbers: [5, 6],
    recitationNumbers: [6, 7],
    formal:
      "אם $0 \\le a_n \\le b_n$ לכל $n$ מספיק גדול: " +
      "\\n\\n" +
      "• $\\sum b_n$ מתכנס $\\Rightarrow$ $\\sum a_n$ מתכנס. " +
      "• $\\sum a_n$ מתבדר $\\Rightarrow$ $\\sum b_n$ מתבדר.",
    intuitive:
      "אם הטור הגדול מתכנס, הקטן ממנו בטוח מתכנס. " +
      "אם הטור הקטן מתבדר, הגדול ממנו בטוח מתבדר.",
    whenUsed:
      "כשניתן למצוא סרגל מוכר ($1/n^p$, טור הנדסי) שקל להשוות אליו. " +
      "שימושי כשרואים $a_n$ שמזכיר טור מוכר אך לא שווה לו.",
    example:
      "$\\dfrac{1}{n^2+1} \\le \\dfrac{1}{n^2}$ ו-$\\sum 1/n^2$ מתכנס $\\Rightarrow$ $\\sum \\dfrac{1}{n^2+1}$ מתכנס.",
    commonMistake:
      "הטבעה לא נכונה: $a_n \\le b_n$ עם $\\sum b_n$ מתבדר — לא מסיקים כלום על $\\sum a_n$.",
    relatedIds: ["limit-comparison-test", "p-harmonic-series", "nonneg-series"],
  },
  {
    id: "limit-comparison-test",
    term: "Limit comparison test",
    termHe: "מבחן גבול ההשוואה",
    category: "convergence-tests",
    weekNumbers: [6, 7],
    recitationNumbers: [7, 8],
    formal:
      "אם $a_n, b_n > 0$ ו-$\\lim_{n\\to\\infty} \\dfrac{a_n}{b_n} = L \\in (0,\\infty)$, " +
      "אז $\\sum a_n$ ו-$\\sum b_n$ שניהם מתכנסים או שניהם מתבדרים.",
    intuitive:
      "אם האיברים של שני הטורים בסדר גודל זהה (יחסם חיובי וסופי), " +
      "גורל ההתכנסות שלהם זהה.",
    whenUsed:
      "כשיש $a_n$ מורכב וניתן למצוא $b_n$ פשוט יותר שמתנהג דומה (אותו 'סדר גודל'). " +
      "נוח כשמבחן ההשוואה הרגיל קשה להפעלה.",
    example:
      "$a_n = \\dfrac{n+1}{n^3 - n}$ מול $b_n = \\dfrac{1}{n^2}$: " +
      "$\\dfrac{a_n}{b_n} = \\dfrac{n^2(n+1)}{n^3-n} \\to 1$. " +
      "כי $\\sum 1/n^2$ מתכנס, גם $\\sum a_n$ מתכנס.",
    commonMistake:
      "אם $L = 0$ או $L = \\infty$ — המבחן לא חושף שני-כיווני. " +
      "$L = 0$: $\\sum a_n$ מתכנס אם $\\sum b_n$ מתכנס. " +
      "$L = \\infty$: $\\sum a_n$ מתבדר אם $\\sum b_n$ מתבדר.",
    relatedIds: ["comparison-test", "p-harmonic-series", "nonneg-series"],
  },
  {
    id: "root-test",
    term: "Root test (Cauchy)",
    termHe: "מבחן השורש (קושי)",
    category: "convergence-tests",
    weekNumbers: [7, 8],
    recitationNumbers: [8, 9],
    formal:
      "יהי $L = \\limsup_{n\\to\\infty} \\sqrt[n]{|a_n|}$. " +
      "אם $L < 1$: הטור מתכנס. אם $L > 1$: מתבדר. אם $L = 1$: המבחן לא חושף.",
    intuitive:
      "בוחן עד כמה האיברים קטנים כ-'שורש-$n$' שלהם. " +
      "אם בסופו של דבר הם מתנהגים כמו $r^n$ עם $r < 1$ — הטור מתכנס.",
    whenUsed:
      "מצוין כש-$a_n$ מכיל חזקה ה-$n$ (למשל $(f(n))^n$ או $n^n$ ו-$n!$ בשבר). " +
      "לעיתים קרובות קל ממבחן המנה כשיש $n^n$.",
    example:
      "$\\sum \\left(\\dfrac{n}{2n+1}\\right)^n$: $\\sqrt[n]{a_n} = \\dfrac{n}{2n+1} \\to \\dfrac{1}{2} < 1$. מתכנס.",
    commonMistake:
      "מבחן שורש ומנה נותנים לעיתים $L = 1$ — צריך לנסות מבחן אחר.",
    relatedIds: ["ratio-test", "nonneg-series", "absolute-convergence"],
  },
  {
    id: "ratio-test",
    term: "Ratio test (D'Alembert)",
    termHe: "מבחן המנה (ד'אלמבר)",
    category: "convergence-tests",
    weekNumbers: [7, 8],
    recitationNumbers: [8, 9],
    formal:
      "יהי $L = \\lim_{n\\to\\infty} \\left|\\dfrac{a_{n+1}}{a_n}\\right|$. " +
      "אם $L < 1$: הטור מתכנס. אם $L > 1$: מתבדר. אם $L = 1$: המבחן לא חושף.",
    intuitive:
      "בוחן אם כל איבר קטן מקודמו בגורם קבוע $< 1$. " +
      "אם כן — הטור מתנהג כמו טור הנדסי ומתכנס.",
    whenUsed:
      "כשיש עצרת $n!$ או $a^n$ בנומרטור/מכנה — המנה $a_{n+1}/a_n$ מפשטת יפה. " +
      "הכי נוח כש-$a_n$ מכיל כפלים של כוחות וגורמי עצרת.",
    example:
      "$\\sum \\dfrac{n!}{n^n}$: $\\dfrac{a_{n+1}}{a_n} = \\dfrac{(n+1)! \\cdot n^n}{(n+1)^{n+1} \\cdot n!} = \\left(\\dfrac{n}{n+1}\\right)^n \\to e^{-1} < 1$. מתכנס.",
    commonMistake:
      "כשיש $n^n$ בנומרטור — מבחן שורש לרוב יותר קל מהמנה.",
    relatedIds: ["root-test", "nonneg-series", "geometric-series"],
  },
  {
    id: "integral-test",
    term: "Integral test",
    termHe: "מבחן האינטגרל",
    category: "convergence-tests",
    weekNumbers: [5, 6],
    recitationNumbers: [6, 7],
    formal:
      "תהי $f$ יורדת, חיובית ורציפה ב-$[1,\\infty)$, ו-$a_n = f(n)$. " +
      "אז $\\sum_{n=1}^{\\infty} a_n$ מתכנס $\\Leftrightarrow$ $\\int_1^{\\infty} f(x)\\,dx$ מתכנס.",
    intuitive:
      "הסכום האינסופי וה'אינטגרל' עם אותה פונקציה 'נסגרים' יחד. " +
      "שטח ה'מדרגות' (הסכום) מוחסם ע\"י שטח הפונקציה (האינטגרל) וה'חסם' הפוך.",
    whenUsed:
      "כשניתן לחשב את האינטגרל הלא-אמיתי של $f(x)$ בקלות, " +
      "ו-$f$ יורדת ורציפה (למשל $1/x^p$, $1/(x\\ln x)$).",
    example:
      "$\\sum 1/n^p$: $\\int_1^\\infty x^{-p}\\,dx$ מתכנס $\\Leftrightarrow p > 1$. מוכיח מבחן ה-$p$.",
    commonMistake:
      "לא לשכוח לבדוק ש-$f$ יורדת! אחרת המבחן לא חל.",
    relatedIds: ["p-harmonic-series", "nonneg-series", "comparison-test"],
  },

  /* ──────────────────────────── CONVERGENCE TYPES ──────────────────────────── */
  {
    id: "absolute-convergence",
    term: "Absolute convergence",
    termHe: "התכנסות מוחלטת",
    category: "convergence-types",
    weekNumbers: [8, 9],
    recitationNumbers: [9, 10],
    formal:
      "$\\sum a_n$ מתכנס מוחלטת אם $\\sum |a_n|$ מתכנס.",
    intuitive:
      "אפילו בלי סימנות (כולם חיוביים) הסכום מסתדר. " +
      "זוהי צורת ההתכנסות 'החזקה' ביותר.",
    whenUsed:
      "כשיש סימנות חיוביות ושליליות: בדוק קודם אם הטור מתכנס מוחלטת. " +
      "אם כן — ודאי מתכנס (התכנסות מוחלטת ← התכנסות רגילה). " +
      "רלוונטי לטורים עם $(-1)^n$ ולסימן כלשהו.",
    example:
      "$\\sum \\dfrac{(-1)^n}{n^2}$: $\\sum \\dfrac{1}{n^2}$ מתכנס ($p=2>1$). " +
      "לכן $\\sum (-1)^n/n^2$ מתכנס מוחלטת.",
    commonMistake:
      "לא כל טור שמתכנס הוא מוחלטת. " +
      "$\\sum (-1)^{n+1}/n$ מתכנס (לייבניץ) אך לא מוחלטת (טור רמוני מתבדר).",
    relatedIds: ["conditional-convergence", "root-test", "ratio-test", "leibniz-series"],
  },
  {
    id: "conditional-convergence",
    term: "Conditional convergence",
    termHe: "התכנסות מותנית",
    category: "convergence-types",
    weekNumbers: [8, 9],
    recitationNumbers: [9, 10],
    formal:
      "$\\sum a_n$ מתכנס מותנית אם $\\sum a_n$ מתכנס אך $\\sum |a_n|$ מתבדר.",
    intuitive:
      "הסימנות המתחלפות 'מבטלות' אחד את השני ויוצרות התכנסות, " +
      "אך לו כולם היו חיוביים — הסכום היה מתפוצץ.",
    whenUsed:
      "לאחר שהוכחנו התכנסות (לרוב ע\"י לייבניץ) ואי-התכנסות מוחלטת.",
    example:
      "$\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n} = 1 - \\frac{1}{2} + \\frac{1}{3} - \\cdots = \\ln 2$. " +
      "מתכנס (לייבניץ) אך לא מוחלטת (טור רמוני מתבדר). לכן מותנית.",
    commonMistake:
      "משפט ריארנז'מנט של רימן: טור מתכנס מותנית ניתן לסדר מחדש כך שיתכנס לכל מספר! " +
      "לכן התכנסות מוחלטת חשובה הרבה יותר.",
    relatedIds: ["absolute-convergence", "leibniz-series"],
  },
  {
    id: "leibniz-series",
    term: "Leibniz series (Alternating series)",
    termHe: "טור לייבניץ / טור מתחלף",
    category: "convergence-types",
    weekNumbers: [8, 9],
    recitationNumbers: [9, 10],
    formal:
      "טור $\\sum_{n=1}^{\\infty} (-1)^{n+1} b_n$ (כאשר $b_n > 0$) מתכנס אם: " +
      "(1) $b_n$ יורדת מונוטונית, ו-(2) $\\lim_{n\\to\\infty} b_n = 0$.",
    intuitive:
      "הסימנות המתחלפות + + - + ... מבטלות אחד את השני. " +
      "אם האיברים קטנים ומתאפסים — הביטול 'מקרב' את הסכום מכיוון לכיוון.",
    whenUsed:
      "כאשר הטור מסתיים ב-$(-1)^n \\cdot b_n$ עם $b_n$ יורד לאפס. " +
      "בדרך כלל אחרי שמצאנו שאין התכנסות מוחלטת.",
    example:
      "$\\sum \\dfrac{(-1)^{n+1}}{n}$: $b_n = 1/n$ יורד ל-$0$. מתכנס (לייבניץ). " +
      "שגיאת הקירוב: $|S - S_N| \\le b_{N+1}$.",
    commonMistake:
      "לבדוק שגם $b_n$ יורדת (מונוטונית!) וגם $b_n \\to 0$. " +
      "גם וגם — לא רק אחד מהם.",
    relatedIds: ["conditional-convergence", "absolute-convergence"],
  },
];

export const CATEGORY_LABELS: Record<DefinitionCategory, string> = {
  sequences: "סדרות",
  series: "טורים — בסיסי",
  "convergence-tests": "מבחני התכנסות",
  "special-series": "טורים מיוחדים",
  "convergence-types": "סוגי התכנסות",
};

export const CATEGORY_COLORS: Record<DefinitionCategory, { bg: string; text: string; border: string }> = {
  sequences: { bg: "var(--green-light)", text: "var(--green)", border: "var(--green-border)" },
  series: { bg: "var(--navy-light)", text: "var(--navy-mid)", border: "var(--navy-border)" },
  "convergence-tests": { bg: "var(--purple-light)", text: "var(--purple)", border: "var(--purple-border)" },
  "special-series": { bg: "var(--teal-light)", text: "var(--teal)", border: "var(--teal-border)" },
  "convergence-types": { bg: "var(--amber-light)", text: "var(--amber)", border: "var(--amber-border)" },
};
