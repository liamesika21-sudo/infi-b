export type CoreFormulaGroup =
  | "limits"
  | "sequences"
  | "integrals"
  | "improper"
  | "series"
  | "power-series"
  | "taylor";

export interface CoreFormula {
  id: string;
  group: CoreFormulaGroup;
  week: number;
  title: string;
  latex: string;
  use: string;
  conditions: string;
  warning?: string;
}

export const CORE_FORMULA_GROUP_LABELS: Record<CoreFormulaGroup, string> = {
  limits: "גבולות ולופיטל",
  sequences: "סדרות",
  integrals: "אינטגרלים",
  improper: "אינטגרלים לא-אמיתיים",
  series: "טורים",
  "power-series": "טורי חזקות",
  taylor: "טיילור ומקלורן",
};

export const CORE_FORMULAS: CoreFormula[] = [
  {
    id: "lhopital-zero-zero",
    group: "limits",
    week: 1,
    title: "כלל לופיטל לצורה 0/0 או אינסוף/אינסוף",
    latex: "\\lim_{x\\to a}\\frac{f(x)}{g(x)}=\\lim_{x\\to a}\\frac{f'(x)}{g'(x)}",
    use: "כשגבול מנה נותן צורה בלתי-קבועה ורוצים להחליף את הבעיה בגבול של נגזרות.",
    conditions: "צריך לוודא שזו באמת צורה 0/0 או \\infty/\\infty, שהפונקציות גזירות בסביבה, וש-g' לא מתאפסת שם.",
    warning: "לא מפעילים לופיטל על מכפלה, חזקה או הפרש לפני שממירים אותם למנה.",
  },
  {
    id: "log-trick",
    group: "limits",
    week: 1,
    title: "טכניקת לוגריתם לחזקות",
    latex: "y=f(x)^{g(x)}\\quad\\Rightarrow\\quad \\ln y=g(x)\\ln(f(x))",
    use: "לגבולות מהצורות 1^\\infty, 0^0 או \\infty^0.",
    conditions: "צריך f(x)>0 בסביבה הרלוונטית כדי שלוגריתם יהיה מוגדר.",
    warning: "בסוף חוזרים עם אקספוננט: אם \\lim \\ln y=L אז \\lim y=e^L.",
  },
  {
    id: "monotone-bounded",
    group: "sequences",
    week: 2,
    title: "סדרה מונוטונית וחסומה מתכנסת",
    latex: "a_n \\uparrow \\text{ and bounded above}\\Rightarrow a_n\\to \\sup\\{a_n:n\\in\\mathbb{N}\\}",
    use: "להוכחת התכנסות של סדרה רקורסיבית בלי לנחש גבול מיד.",
    conditions: "מוכיחים מונוטוניות וחסימות באינדוקציה או מאי-שוויונים.",
  },
  {
    id: "heine",
    group: "sequences",
    week: 2,
    title: "למת היינה",
    latex: "\\lim_{x\\to a}f(x)=L\\iff \\forall x_n\\to a,\\ x_n\\ne a:\\ f(x_n)\\to L",
    use: "לקשר בין גבול פונקציה לבין גבולות של סדרות, ובעיקר להפריך גבול בעזרת שתי סדרות.",
    conditions: "הסדרות צריכות להתכנס לנקודת הגבול ולהישאר בתחום ההגדרה.",
  },
  {
    id: "integration-by-parts",
    group: "integrals",
    week: 3,
    title: "אינטגרציה בחלקים",
    latex: "\\int u\\,dv=uv-\\int v\\,du",
    use: "כשיש מכפלה ואחד הגורמים נעשה פשוט יותר אחרי גזירה.",
    conditions: "בוחרים u לגזירה ו-dv לאינטגרציה כך שהאינטגרל החדש פשוט יותר.",
  },
  {
    id: "linear-substitution",
    group: "integrals",
    week: 3,
    title: "הצבה ליניארית",
    latex: "\\int f(ax+b)\\,dx=\\frac{1}{a}F(ax+b)+C",
    use: "כאשר הארגומנט הוא ביטוי ליניארי.",
    conditions: "a\\ne 0 ו-F היא קדומה של f.",
  },
  {
    id: "ftc",
    group: "integrals",
    week: 4,
    title: "המשפט היסודי של החדו״א",
    latex: "F(x)=\\int_a^x f(t)\\,dt\\quad\\Rightarrow\\quad F'(x)=f(x)",
    use: "לגזירה של פונקציה שמוגדרת כאינטגרל עם גבול עליון משתנה.",
    conditions: "f רציפה בנקודה שבה גוזרים.",
  },
  {
    id: "newton-leibniz",
    group: "integrals",
    week: 4,
    title: "ניוטון-לייבניץ",
    latex: "\\int_a^b f(x)\\,dx=G(b)-G(a)",
    use: "לחישוב אינטגרל מסוים אחרי שמצאנו פונקציה קדומה.",
    conditions: "f רציפה ב-[a,b] ו-G קדומה של f.",
  },
  {
    id: "p-improper",
    group: "improper",
    week: 5,
    title: "מבחן p לאינטגרל לא-אמיתי באינסוף",
    latex: "\\int_1^\\infty \\frac{1}{x^p}\\,dx\\ \\operatorname{converges}\\iff p>1",
    use: "להשוואה מהירה באינטגרלים לא-אמיתיים עם זנב פולינומי.",
    conditions: "ההשוואה היא בקצה הבעייתי, בדרך כלל כש-x\\to\\infty.",
  },
  {
    id: "p-improper-zero",
    group: "improper",
    week: 5,
    title: "מבחן p ליד 0",
    latex: "\\int_0^1 \\frac{1}{x^p}\\,dx\\ \\operatorname{converges}\\iff p<1",
    use: "כשיש סינגולריות בקצה סופי, בעיקר ליד 0.",
    conditions: "בודקים את ההתנהגות רק ליד הנקודה הבעייתית.",
  },
  {
    id: "series-definition",
    group: "series",
    week: 6,
    title: "הגדרת התכנסות טור",
    latex: "\\sum_{n=1}^{\\infty}a_n\\ \\operatorname{converges}\\iff S_N=\\sum_{n=1}^{N}a_n\\ \\operatorname{converges}",
    use: "להבין שטור הוא גבול של סכומים חלקיים.",
    conditions: "הסדרה S_N של הסכומים החלקיים צריכה להתכנס.",
  },
  {
    id: "necessary-series-condition",
    group: "series",
    week: 6,
    title: "תנאי הכרחי להתכנסות טור",
    latex: "\\sum a_n\\ \\operatorname{converges}\\Rightarrow a_n\\to 0",
    use: "בדיקה ראשונה ומהירה לפסילת טור.",
    conditions: "זה תנאי הכרחי בלבד, לא מספיק.",
    warning: "אם a_n\\to0 זה לא אומר שהטור מתכנס.",
  },
  {
    id: "geometric-series",
    group: "series",
    week: 6,
    title: "טור הנדסי",
    latex: "\\sum_{n=0}^{\\infty}q^n=\\frac{1}{1-q}\\quad (|q|<1)",
    use: "לזיהוי וחישוב טורים עם יחס קבוע בין איברים.",
    conditions: "מתכנס רק כאשר |q|<1.",
  },
  {
    id: "ratio-test",
    group: "series",
    week: 7,
    title: "מבחן המנה",
    latex: "L=\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|",
    use: "טוב במיוחד לפקטוריאלים, חזקות ומכפלות שתלויות ב-n.",
    conditions: "אם L<1 הטור מתכנס בהחלט; אם L>1 מתבדר; אם L=1 אין הכרעה.",
  },
  {
    id: "root-test",
    group: "series",
    week: 7,
    title: "מבחן השורש",
    latex: "L=\\limsup_{n\\to\\infty}\\sqrt[n]{|a_n|}",
    use: "טוב כשכל האיבר בחזקת n או כשיש ביטויים מעריכיים.",
    conditions: "אם L<1 הטור מתכנס בהחלט; אם L>1 מתבדר; אם L=1 אין הכרעה.",
  },
  {
    id: "leibniz",
    group: "series",
    week: 7,
    title: "מבחן לייבניץ",
    latex: "\\sum (-1)^n b_n\\ \\operatorname{converges}\\quad\\text{if}\\quad b_n\\downarrow 0",
    use: "לטורים מתחלפים כאשר ההתכנסות המוחלטת לא עובדת או לא נדרשת.",
    conditions: "צריך b_n\\ge0, מונוטונית יורדת, ומתכנסת ל-0.",
  },
  {
    id: "power-radius-ratio",
    group: "power-series",
    week: 9,
    title: "רדיוס התכנסות לפי נוסחת המנה",
    latex: "R=\\lim_{n\\to\\infty}\\left|\\frac{a_n}{a_{n+1}}\\right|",
    use: "לטור חזקות \\sum a_n(x-x_0)^n כאשר היחס בין המקדמים פשוט.",
    conditions: "אם הגבול קיים ומתאים; אחרי מציאת R עדיין בודקים קצוות בנפרד.",
  },
  {
    id: "power-radius-root",
    group: "power-series",
    week: 9,
    title: "קושי-הדמר לרדיוס התכנסות",
    latex: "R=\\frac{1}{\\limsup_{n\\to\\infty}\\sqrt[n]{|a_n|}}",
    use: "לטורי חזקות כשהשורש ה-n-י של המקדם פשוט יותר מהמנה.",
    conditions: "מתייחסים למקדמים a_n בלבד, לא לכל הביטוי עם (x-x_0)^n.",
  },
  {
    id: "taylor",
    group: "taylor",
    week: 9,
    title: "טור טיילור סביב a",
    latex: "f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n",
    use: "לפיתוח פונקציה סביב נקודה ולחישוב קירובים או מקדמים.",
    conditions: "צריך הצדקה שהטור מתכנס לפונקציה בתחום הרלוונטי.",
  },
  {
    id: "maclaurin",
    group: "taylor",
    week: 10,
    title: "מקלורן",
    latex: "f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(0)}{n!}x^n",
    use: "טיילור סביב 0; שימושי במיוחד לזיהוי טורים מוכרים והצבות.",
    conditions: "בודקים תחום התכנסות אחרי הצבה, גזירה או אינטגרציה איבר-איבר.",
  },
];
