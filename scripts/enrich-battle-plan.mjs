/**
 * Enriches battle-plan-data.json with definition and theorem content.
 * Run: node scripts/enrich-battle-plan.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../data/generated/calculus2/battle-plan-data.json");

// ── Content map ──────────────────────────────────────────────────────────────
// Key: exact name from battle-plan-data.json
// Value: { content } — LaTeX inline with $...$

const CONTENT = {
  // ── Week 1 ──
  "גבול חד-צדדי": {
    content:
      "אומרים ש-$\\lim_{x \\to a^+} f(x) = L$ אם לכל $\\varepsilon > 0$ קיים $\\delta > 0$ כך שאם $0 < x - a < \\delta$ אז $|f(x) - L| < \\varepsilon$. בהתאמה $\\lim_{x \\to a^-} f(x) = L$ אם $0 < a - x < \\delta$. הגבול הדו-צדדי קיים אם\"ם שני הגבולות החד-צדדיים שווים.",
  },
  "גזירות בנקודה": {
    content:
      "$f$ גזירה ב-$a$ אם קיים הגבול $f'(a) = \\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}$. גזירות גוררת רציפות. אם $f$ גזירה חד-צדדית: גבול ימני/שמאלי של המנה ההפרשית.",
  },
  "כלל לופיטל": {
    content:
      "אם $\\lim_{x \\to a} f(x) = \\lim_{x \\to a} g(x) = 0$ (או $\\pm\\infty$), $g'(x)\\ne 0$ בסביבה מנוקבת של $a$, ו-$\\lim_{x\\to a}\\dfrac{f'(x)}{g'(x)}$ קיים (סופי או $\\infty$), אז: $\\displaystyle\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}$. מאפשר לטפל בצורות $\\frac{0}{0}$ ו-$\\frac{\\infty}{\\infty}$; צורות אחרות ($0\\cdot\\infty,\\ 1^\\infty$, וכו') דורשות עיבוד מוקדם.",
  },
  "משפט דרבו": {
    content:
      "אם $f$ גזירה על $[a,b]$, אז $f'$ מקיימת את תכונת ערך הביניים: לכל $c$ בין $f'(a)$ לבין $f'(b)$ קיים $\\xi \\in (a,b)$ כך ש-$f'(\\xi) = c$. שימו לב: $f'$ אינה חייבת להיות רציפה, אך עדיין לא יכולה לקפוץ.",
  },
  "משפט דרבו המורחב": {
    content:
      "(**MVT המוכלל / Cauchy**) אם $f, g$ רציפות על $[a,b]$ וגזירות על $(a,b)$, אז קיים $\\xi \\in (a,b)$ כך ש-$(f(b)-f(a))\\,g'(\\xi) = (g(b)-g(a))\\,f'(\\xi)$. כשבוחרים $g(x)=x$ מקבלים את ה-MVT הרגיל.",
  },

  // ── Week 2 ──
  "גבול סדרה (ε-N)": {
    content:
      "$\\lim_{n\\to\\infty} a_n = L$ אם לכל $\\varepsilon > 0$ קיים $N \\in \\mathbb{N}$ כך שלכל $n > N$: $|a_n - L| < \\varepsilon$. אם לא קיים $L$ ממשי כזה — הסדרה מתבדרת.",
  },
  "סדרה מונוטונית": {
    content:
      "סדרה **עולה בחלש** אם $a_{n+1} \\ge a_n$ לכל $n$; **עולה בחוזק** אם $a_{n+1} > a_n$. בהתאמה **יורדת** אם $a_{n+1} \\le a_n$ (או $<$). סדרה מונוטונית היא עולה או יורדת.",
  },
  "סדרה חסומה": {
    content:
      "קיים $M > 0$ כך ש-$|a_n| \\le M$ לכל $n$. שקילות: $a_n$ חסומה מלמעלה ($a_n \\le M$) ומלמטה ($a_n \\ge m$).",
  },
  "סדרת קושי": {
    content:
      "$(a_n)$ היא סדרת קושי אם לכל $\\varepsilon > 0$ קיים $N$ כך שלכל $n, m > N$: $|a_n - a_m| < \\varepsilon$. **משפט**: ב-$\\mathbb{R}$, סדרה מתכנסת אם\"ם היא סדרת קושי.",
  },
  "כל סדרה מונוטונית וחסומה מתכנסת": {
    content:
      "(**MCT**) אם $(a_n)$ מונוטונית (**עולה** ו**חסומה מלמעלה**, או **יורדת** ו**חסומה מלמטה**) — אז היא מתכנסת. הגבול הוא $\\sup\\{a_n\\}$ (בעולה) או $\\inf\\{a_n\\}$ (ביורדת). מוכח בעזרת אקסיומת השלמות.",
  },
  "משפט ה-Squeeze": {
    content:
      "אם $a_n \\le b_n \\le c_n$ לכל $n$ גדול מספיק, ו-$\\displaystyle\\lim_{n\\to\\infty} a_n = \\lim_{n\\to\\infty} c_n = L$, אז $\\displaystyle\\lim_{n\\to\\infty} b_n = L$.",
  },

  // ── Week 3 ──
  "נגזרת מסדר n": {
    content:
      "מוגדרת רקורסיבית: $f^{(0)} = f$, $f^{(k)} = \\bigl(f^{(k-1)}\\bigr)'$. סימון: $f^{(n)}(x) = \\dfrac{d^n f}{dx^n}$. דוגמאות: $(e^x)^{(n)} = e^x$, $(\\sin x)^{(n)} = \\sin\\!\\left(x + \\tfrac{n\\pi}{2}\\right)$. כלל לייבניץ: $(fg)^{(n)} = \\sum_{k=0}^n \\binom{n}{k}f^{(k)}g^{(n-k)}$.",
  },
  "פולינום טיילור": {
    content:
      "$P_n(x) = \\displaystyle\\sum_{k=0}^{n} \\dfrac{f^{(k)}(a)}{k!}(x-a)^k$. הפולינום הייחודי מסדר $\\le n$ שמקיים $P_n^{(k)}(a) = f^{(k)}(a)$ לכל $0 \\le k \\le n$. סביב $a=0$ נקרא **מקלורן**.",
  },
  "שארית לגרנז'": {
    content:
      "$R_n(x) = \\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$ לאיזשהו $\\xi$ ממשי בין $x$ ל-$a$. כך ש-$f(x) = P_n(x) + R_n(x)$. מאפשר חסימת שגיאת הקירוב.",
  },
  "MVT": {
    content:
      "(**משפט הערך הממוצע**) אם $f$ רציפה על $[a,b]$ וגזירה על $(a,b)$, קיים $\\xi \\in (a,b)$ כך ש-$f'(\\xi) = \\dfrac{f(b)-f(a)}{b-a}$. קוויית: הנגזרת שווה לשיפוע המיתר. מוכח מ**משפט רול**.",
  },
  "רול": {
    content:
      "אם $f$ רציפה על $[a,b]$, גזירה על $(a,b)$, ו-$f(a)=f(b)$, אז קיים $\\xi \\in (a,b)$ כך ש-$f'(\\xi)=0$. מוכח בעזרת משפט ויירשטראס (מינימום/מקסימום בקומפקטי). הוא המקרה הפרטי של MVT.",
  },
  "פיתוח טיילור עם שארית": {
    content:
      "$f(x) = \\displaystyle\\sum_{k=0}^{n}\\dfrac{f^{(k)}(a)}{k!}(x-a)^k + R_n(x)$ כאשר $R_n(x) = \\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$ (שארית לגרנז'). תנאי: $f \\in C^{n+1}$ בסביבת $a$.",
  },

  // ── Week 4 ──
  "אינטגרל רימן": {
    content:
      "לחלוקה $\\mathcal{P} = \\{a=x_0<x_1<\\cdots<x_n=b\\}$ ונקודות ביניים $\\xi_i \\in [x_{i-1},x_i]$: $S(f,\\mathcal{P}) = \\sum_{i=1}^n f(\\xi_i)\\Delta x_i$. האינטגרל הוא $\\int_a^b f(x)\\,dx = \\lim_{\\|\\mathcal{P}\\|\\to 0} S(f,\\mathcal{P})$ אם הגבול קיים ואינו תלוי בבחירת הנקודות.",
  },
  "פונקציה אינטגרבילית": {
    content:
      "$f$ אינטגרבילית רימן על $[a,b]$ אם $\\overline{\\int_a^b} f = \\underline{\\int_a^b} f$, כלומר האינטגרל העליון שווה לתחתון. **תנאי מספיק**: $f$ רציפה על $[a,b]$, או מונוטונית, או רציפה פרט למספר סופי של נקודות אי-רציפות קפיצה.",
  },
  "אנטי-נגזרת": {
    content:
      "$F$ היא אנטי-נגזרת (פרימיטיב) של $f$ על $(a,b)$ אם $F'(x) = f(x)$ לכל $x \\in (a,b)$. שתי אנטי-נגזרות של אותה $f$ שונות בקבוע. מסומן $\\int f(x)\\,dx = F(x)+C$.",
  },
  "משפט היסודי של החשבון (FTC)": {
    content:
      "(**FTC 1**) אם $f$ רציפה על $[a,b]$ ו-$F(x) = \\int_a^x f(t)\\,dt$, אז $F'(x) = f(x)$ לכל $x \\in [a,b]$.\n\n(**FTC 2**) אם $F' = f$ על $[a,b]$, אז $\\int_a^b f(x)\\,dx = F(b) - F(a)$.",
  },
  "FTC2 — גזירת אינטגרל": {
    content:
      "אם $f$ רציפה ו-$F(x) = \\int_a^x f(t)\\,dt$, אז $F'(x) = f(x)$. כלל השרשרת: $\\dfrac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\cdot g'(x)$.",
  },
  "IBP": {
    content:
      "(**אינטגרציה בחלקים**) $\\displaystyle\\int u\\,dv = uv - \\int v\\,du$. גרסה מוגדרת: $\\displaystyle\\int_a^b u\\,v'\\,dx = [uv]_a^b - \\int_a^b v\\,u'\\,dx$. טריק LIATE לבחירת $u$: Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential.",
  },

  // ── Week 5 ──
  "שבר חלקי": {
    content:
      "כל פונקציה רציונלית $\\dfrac{P(x)}{Q(x)}$ ($\\deg P < \\deg Q$) מתפרקת לסכום שברים חלקיים. עבור גורם ממשי $(x-a)^k$: $\\sum_{j=1}^k \\dfrac{A_j}{(x-a)^j}$. עבור גורם ריבועי $(x^2+bx+c)^k$: $\\sum_{j=1}^k \\dfrac{B_j x+C_j}{(x^2+bx+c)^j}$.",
  },
  "אינטגרל לא מסוים": {
    content:
      "$\\int f(x)\\,dx = F(x)+C$ — משפחת כל האנטי-נגזרות של $f$. הפעולות הבסיסיות: $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}+C$, $\\int e^x\\,dx = e^x+C$, $\\int \\dfrac{1}{x}\\,dx = \\ln|x|+C$.",
  },
  "FTC": {
    content:
      "ראו משפט היסודי של החשבון (FTC 1 + FTC 2) בשבוע 4.",
  },
  "משפט פיתוח לשברים חלקיים": {
    content:
      "כל פונקציה רציונלית $\\dfrac{P(x)}{Q(x)}$ (כאשר $\\deg P < \\deg Q$) מתפרקת ב-$\\mathbb{R}$ לצירוף ייחודי של שברים חלקיים מהסוגים $\\dfrac{A}{(x-a)^k}$ ו-$\\dfrac{Bx+C}{(x^2+px+q)^k}$ (כאשר $x^2+px+q$ אי-פריק מעל $\\mathbb{R}$). הפירוק קיים ויחיד.",
  },

  // ── Week 6 ──
  "טור מתכנס": {
    content:
      "$\\displaystyle\\sum_{n=1}^\\infty a_n = L$ אם הסכומים החלקיים $S_N = \\sum_{n=1}^N a_n$ מתכנסים ל-$L$. שקילות: $(S_N)$ היא סדרה מתכנסת.",
  },
  "טור מתבדר": {
    content:
      "הסכומים החלקיים $(S_N)$ אינם מתכנסים לאף גבול ממשי. יכול לקרות בגלל $a_n \\not\\to 0$, סכומים חלקיים חסרי גבול, או תנודות.",
  },
  "p-series": {
    content:
      "$\\displaystyle\\sum_{n=1}^\\infty \\frac{1}{n^p}$: מתכנס אם\"ם $p > 1$. מוכח ע\"י מבחן האינטגרל. מקרים מיוחדים: $p=1$ — הטור ההרמוני מתבדר; $p=2$ — מתכנס לפי בזל: $\\dfrac{\\pi^2}{6}$.",
  },
  "תנאי הכרחי — lim aₙ = 0": {
    content:
      "אם $\\sum a_n$ מתכנס, אז $\\lim_{n\\to\\infty} a_n = 0$. **ההיפך לא נכון**: הטור ההרמוני $\\sum \\dfrac{1}{n}$ מתבדר למרות $\\dfrac{1}{n}\\to 0$. שימוש: אם $a_n \\not\\to 0$ — הטור מתבדר.",
  },
  "מבחן השוואה": {
    content:
      "אם $0 \\le a_n \\le b_n$ לכל $n$ גדול מספיק:\n• אם $\\sum b_n$ מתכנס — $\\sum a_n$ מתכנס.\n• אם $\\sum a_n$ מתבדר — $\\sum b_n$ מתבדר.",
  },
  "LCT": {
    content:
      "(**מבחן ההשוואה הגבולי**) אם $a_n, b_n > 0$ ו-$\\lim_{n\\to\\infty} \\dfrac{a_n}{b_n} = L \\in (0,\\infty)$, אז $\\sum a_n$ מתכנס/מתבדר אם\"ם $\\sum b_n$ מתכנס/מתבדר. אם $L=0$: התכנסות $\\sum b_n$ גוררת $\\sum a_n$; אם $L=\\infty$: התבדרות $\\sum b_n$ גוררת $\\sum a_n$.",
  },
  "מבחן האינטגרל": {
    content:
      "אם $f: [1,\\infty)\\to\\mathbb{R}$ חיובית, רציפה, מונוטונית יורדת ו-$f(n) = a_n$, אז: $\\sum_{n=1}^\\infty a_n$ מתכנס אם\"ם $\\int_1^\\infty f(x)\\,dx$ מתכנס.",
  },

  // ── Week 7 ──
  "טור חלופי": {
    content:
      "טור בצורה $\\displaystyle\\sum_{n=1}^\\infty (-1)^{n+1} a_n = a_1 - a_2 + a_3 - \\cdots$ כאשר $a_n \\ge 0$. בדרך כלל מטופל ע\"י מבחן לייבניץ.",
  },
  "התכנסות מוחלטת": {
    content:
      "$\\sum a_n$ **מתכנסת בהחלט** אם $\\sum |a_n|$ מתכנס. **כלל**: התכנסות בהחלט גוררת התכנסות רגילה. ממשיכים להשתמש במבחן המנה/שורש כי הם בודקים התכנסות מוחלטת.",
  },
  "התכנסות בתנאי": {
    content:
      "$\\sum a_n$ **מתכנסת בתנאי** אם $\\sum a_n$ מתכנס אך $\\sum |a_n|$ מתבדר. דוגמה: $\\displaystyle\\sum_{n=1}^\\infty \\dfrac{(-1)^{n+1}}{n}$ מתכנסת בתנאי ($= \\ln 2$) אך $\\sum \\dfrac{1}{n}$ מתבדרת.",
  },
  "מבחן דלאמבר": {
    content:
      "תהי $L = \\lim_{n\\to\\infty}\\dfrac{|a_{n+1}|}{|a_n|}$. אז:\n• $L < 1$: $\\sum a_n$ מתכנסת בהחלט.\n• $L > 1$: $\\sum a_n$ מתבדרת.\n• $L = 1$: המבחן אינו מכריע.",
  },
  "מבחן קושי": {
    content:
      "תהי $L = \\lim_{n\\to\\infty}\\sqrt[n]{|a_n|}$. אז:\n• $L < 1$: $\\sum a_n$ מתכנסת בהחלט.\n• $L > 1$: $\\sum a_n$ מתבדרת.\n• $L = 1$: המבחן אינו מכריע.\nיעיל במיוחד כשיש $n$-ית.",
  },
  "מבחן לייבניץ": {
    content:
      "אם $(a_n)$ מונוטונית יורדת ו-$a_n \\to 0$, אז $\\displaystyle\\sum_{n=1}^\\infty (-1)^{n+1} a_n$ מתכנסת. גם: שגיאת חסימה $|S - S_N| \\le a_{N+1}$.",
  },

  // ── Week 8 ──
  "טור חזקות סביב x₀": {
    content:
      "$\\displaystyle\\sum_{n=0}^\\infty c_n(x-x_0)^n$. מתכנס לפחות ב-$x = x_0$. קיים $R \\in [0,\\infty]$ (**רדיוס התכנסות**) כך שהטור מתכנס בהחלט ב-$|x-x_0|<R$ ומתבדר ב-$|x-x_0|>R$. בקצוות $|x-x_0|=R$ צריך לבדוק בנפרד.",
  },
  "רדיוס התכנסות R": {
    content:
      "$R = \\dfrac{1}{\\limsup_{n\\to\\infty} \\sqrt[n]{|c_n|}}$ (נוסחת קושי–הדמר). חלופה (כשהגבול קיים): $R = \\lim_{n\\to\\infty}\\left|\\dfrac{c_n}{c_{n+1}}\\right|$. תחום ההתכנסות הוא $(x_0-R,\\ x_0+R)$ לפחות; הקצוות נבדקים בנפרד.",
  },
  "משפט הרדיוס": {
    content:
      "לטור חזקות $\\sum c_n(x-x_0)^n$, הרדיוס נתון ע\"י: $R = \\lim_{n\\to\\infty}\\left|\\dfrac{c_n}{c_{n+1}}\\right|$ (כשהגבול קיים). שקילות לנוסחת $R = 1/\\limsup \\sqrt[n]{|c_n|}$.",
  },
  "גזירת טור חזקות שומרת על R": {
    content:
      "אם $\\sum_{n=0}^\\infty c_n x^n$ מתכנס בתחום $|x| < R$, אז הפונקציה $f(x) = \\sum c_n x^n$ גזירה ב-$(−R, R)$ ו-$f'(x) = \\sum_{n=1}^\\infty n c_n x^{n-1}$. הרדיוס $R$ נשמר. (הגזירה איבר-איבר חוקית בפנים התחום.)",
  },
  "אינטגרציה של טור חזקות": {
    content:
      "אם $f(x) = \\sum_{n=0}^\\infty c_n x^n$ ב-$|x| < R$, אז $\\displaystyle\\int f(x)\\,dx = \\sum_{n=0}^\\infty \\dfrac{c_n}{n+1} x^{n+1} + C$ ב-$|x|<R$. הרדיוס נשמר. שימוש נפוץ: לחשב $\\int \\dfrac{1}{1-x}\\,dx$ ע\"י טור גיאומטרי.",
  },

  // ── Week 9 ──
  "טור טיילור של f סביב x₀": {
    content:
      "$\\displaystyle\\sum_{n=0}^\\infty \\dfrac{f^{(n)}(x_0)}{n!}(x-x_0)^n$. קיים כש-$f \\in C^\\infty$ בסביבת $x_0$. לא תמיד שווה ל-$f$ — דרוש $R_n(x) \\to 0$. טורי מקלורן חשובים: $e^x = \\sum \\dfrac{x^n}{n!}$, $\\sin x = \\sum \\dfrac{(-1)^n x^{2n+1}}{(2n+1)!}$, $\\dfrac{1}{1-x} = \\sum x^n$.",
  },
  "שארית קושי": {
    content:
      "$R_n(x) = \\dfrac{(x-x_0)^{n+1}}{n!}\\int_0^1 (1-t)^n f^{(n+1)}(x_0+t(x-x_0))\\,dt$. צורה נוספת לשארית (חלופה ללגרנז'). שימושית כשקשה לחסום את $f^{(n+1)}$ בנקודה בודדת.",
  },
  "כל פונקציה C^∞ שווה לטור טיילור שלה בתחום R": {
    content:
      "**לא נכון באופן כללי!** $f \\in C^\\infty$ לא מבטיחה $f(x) = \\sum \\frac{f^{(n)}(a)}{n!}(x-a)^n$. דרוש שגם $R_n(x) \\to 0$. דוגמת נגד: $f(x) = e^{-1/x^2}$ (עם $f(0)=0$) היא $C^\\infty$ אך טור הטיילור שלה ב-$0$ הוא אפס לכולם.",
  },

  // ── Week 10 ──
  "התכנסות נקודתית של סדרת פונקציות": {
    content:
      "$(f_n)$ **מתכנסת נקודתית** ל-$f$ על $D$ אם לכל $x \\in D$: $\\lim_{n\\to\\infty} f_n(x) = f(x)$. כלומר: לכל $x$ ולכל $\\varepsilon>0$ קיים $N = N(x,\\varepsilon)$ כך ש-$n>N \\Rightarrow |f_n(x)-f(x)| < \\varepsilon$. ה-$N$ עשוי להשתנות עם $x$.",
  },
  "התכנסות במידה שווה": {
    content:
      "$(f_n)$ **מתכנסת במידה שווה** ל-$f$ על $D$ אם $\\sup_{x\\in D} |f_n(x)-f(x)| \\to 0$. כלומר: לכל $\\varepsilon>0$ קיים $N = N(\\varepsilon)$ (אחד לכולם) כך ש-$n>N \\Rightarrow |f_n(x)-f(x)| < \\varepsilon$ **לכל** $x$. חזקה מהתכנסות נקודתית. שומרת על רציפות, אינטגרציה, ולעיתים גזירה.",
  },
  "טור פונקציות": {
    content:
      "$\\sum_{n=1}^\\infty f_n(x)$ — מוגדר ע\"י סכומים חלקיים $S_N(x) = \\sum_{n=1}^N f_n(x)$. **מתכנס נקודתית/במידה שווה** אם הסדרה $(S_N)$ מתכנסת נקודתית/במידה שווה.",
  },
  "קריטריון קושי להתכנסות במידה שווה": {
    content:
      "$(f_n)$ מתכנסת במידה שווה אם\"ם לכל $\\varepsilon>0$ קיים $N$ כך שלכל $n,m>N$: $\\sup_{x}|f_n(x)-f_m(x)|<\\varepsilon$. שקילות: $(f_n)$ היא סדרת קושי במרחב $L^\\infty$.",
  },
  "מבחן Weierstrass לטורי פונקציות": {
    content:
      "אם $|f_n(x)| \\le M_n$ לכל $x$ ו-$\\sum_{n=1}^\\infty M_n < \\infty$, אז $\\sum f_n(x)$ **מתכנסת במידה שווה ובהחלט** על כל התחום. כלי עיקרי להוכחת התכנסות במידה שווה.",
  },
  "החלפת גבול עם אינטגרל/נגזרת בתנאים": {
    content:
      "**אינטגרל**: אם $f_n \\rightrightarrows f$ על $[a,b]$ ו-$f_n$ רציפות, אז $\\int_a^b f_n(x)\\,dx \\to \\int_a^b f(x)\\,dx$.\n\n**נגזרת**: אם $f_n \\to f$ נקודתית, $f_n$ גזירות ו-$f_n' \\rightrightarrows g$, אז $f$ גזירה ו-$f' = g$.",
  },
};

// ── Main ─────────────────────────────────────────────────────────────────────

const raw = JSON.parse(readFileSync(DATA_PATH, "utf8"));

let defsEnriched = 0;
let thmsEnriched = 0;
let defsTotal = 0;
let thmsTotal = 0;

for (const block of raw) {
  for (const wd of block.weekData) {
    wd.definitions = wd.definitions.map((item) => {
      defsTotal++;
      if (typeof item === "string") {
        const c = CONTENT[item];
        if (c) { defsEnriched++; return { name: item, content: c.content }; }
        return { name: item, content: "" };
      }
      return item;
    });

    wd.theorems = wd.theorems.map((item) => {
      thmsTotal++;
      if (typeof item === "string") {
        const c = CONTENT[item];
        if (c) { thmsEnriched++; return { name: item, content: c.content }; }
        return { name: item, content: "" };
      }
      return item;
    });
  }
}

writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2), "utf8");
console.log(`Done. Defs: ${defsEnriched}/${defsTotal}, Theorems: ${thmsEnriched}/${thmsTotal}`);
