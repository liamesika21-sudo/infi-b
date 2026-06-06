import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, isAdminEmail, readAuthCookieValue } from "@/lib/simple-auth";
import { MathContent } from "@/components/study/MathContent";

export const runtime = "nodejs";

export default async function StudyPlanPage() {
  const jar = await cookies();
  const auth = readAuthCookieValue(jar.get(AUTH_COOKIE_NAME)?.value);
  if (!auth.ok || !(await isAdminEmail(auth.email))) redirect("/dashboard");

  const examDate = new Date("2026-07-03T09:00:00");
  const today    = new Date("2026-06-06T00:00:00");
  const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / 86400000);

  return (
    <div className="space-y-8 pb-16" dir="rtl">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #0b1f3a 0%, #0b7285 100%)" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative z-10">
          <p className="mb-1 text-xs font-black uppercase tracking-widest text-white/60">תכנון אישי</p>
          <h1 className="mb-3 text-3xl font-black">מבחן אינפי ב׳ — 3.7.2026</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <Chip label={`${daysLeft} ימים למבחן`} color="#22d3ee" />
            <Chip label="12.6 — מועד ג׳ לינארית" color="#f59e0b" />
            <Chip label="18-22.6 — חו״ל" color="#8b5cf6" />
            <Chip label="26.6-2.7 — חרישה 10ש׳" color="#ef4444" />
          </div>
        </div>
      </section>

      {/* ── אל תשכחי אף פעם ── */}
      <NeverForget />

      {/* ── Phase 1 ── */}
      <Phase
        id="phase1"
        title="שלב א׳ — שמירה על הבסיס"
        subtitle="6–12.6 · שעתיים ביום · מועד ג׳ לינארית ב-12.6"
        color="var(--cyan)"
        bg="var(--cyan-light)"
        border="var(--cyan-border)"
        badge="2ש׳/יום"
      >
        <Day
          date="שישי 6.6" hours={2} label="מבחני התכנסות — חמשת המבחנים"
          tasks={{
            learn: [
              "קרי בקצרה את הגדרות כל 5 מבחני ההתכנסות: השוואה, LCT, מנה, שורש, לייבניץ",
              "הגדרת טור מתכנס: $\\sum_{n=k}^{\\infty} a_n = \\lim_{N \\to \\infty} \\sum_{n=k}^{N} a_n$",
            ],
            review: [
              "תנאי הכרחי: אם $\\sum a_n$ מתכנס אזי $\\lim_{n\\to\\infty} a_n = 0$ (הופך לא נכון!)",
              "טור $p$: $\\sum \\frac{1}{n^p}$ מתכנס אמ\"ם $p > 1$",
              "טור גיאומטרי: $\\sum_{n=0}^{\\infty} r^n = \\frac{1}{1-r}$ עבור $|r| < 1$",
            ],
            exercises: [
              "תרגול 6 שאלה 1 — LCT עם $\\frac{1}{n^p}$",
              "תרגול 6 שאלה 2 — מבחן השוואה",
              "תרגול 7 שאלה 1 — מבחן מנה עם $n!$",
            ],
            theorems: [
              "תנאי הכרחי — הצהרה מדויקת + דוגמה נגדית: $\\sum \\frac{1}{n}$ מתבדר למרות $\\frac{1}{n} \\to 0$",
              "LCT — $a_n, b_n > 0$, $\\lim \\frac{a_n}{b_n} = L \\in (0,\\infty)$ אז $\\sum a_n \\leftrightarrow \\sum b_n$",
            ],
            proofs: [
              "הוכחת תנאי הכרחי: אם $S_N \\to S$ אז $a_n = S_n - S_{n-1} \\to S - S = 0$ (5 דק׳ בכתיבה)",
            ],
            tricks: [
              "LCT עם $b_n = \\frac{1}{n^p}$ — בחרי $p$ = הפרש חזקות: עבור $\\frac{n^2+1}{n^4-2}$ בחרי $p=2$",
              "מנה טבעי כשיש $n!$ או $a^n$ — חשבי $\\left|\\frac{a_{n+1}}{a_n}\\right|$",
              "שורש טבעי כשיש $(f(n))^n$ — חשבי $\\sqrt[n]{a_n}$",
            ],
          }}
        />

        <Day
          date="שבת 7.6" hours={2} label="טורי חזקות — רדיוס ומרווח התכנסות"
          tasks={{
            learn: [
              "רדיוס התכנסות $R$ של $\\sum a_n x^n$ — שלוש שיטות: מנה, שורש, ליפשיץ",
              "מרווח ההתכנסות: $(-R, R)$ — חייבים לבדוק קצוות בנפרד",
              "משפט אבל: אם $\\sum a_n R^n$ מתכנס אז הפונקציה רציפה מהשמאל ב-$R$",
            ],
            review: [
              "נוסחת מנה לרדיוס: $R = \\lim \\left|\\frac{a_n}{a_{n+1}}\\right|$",
              "נוסחת שורש: $R = \\frac{1}{\\limsup \\sqrt[n]{|a_n|}}$",
            ],
            exercises: [
              "תרגול 9 שאלה 1 — מצאי $R$ ובדקי קצוות",
              "תרגול 9 שאלה 2 — $\\sum \\frac{x^n}{n \\cdot 2^n}$ (בדיקת קצה $x=2$: הסדרה הרמונית)",
            ],
            theorems: [
              "גזירה ואינטגרציה של טור חזקות — שומרת את $R$, עלולה לשנות התכנסות בקצוות",
            ],
            proofs: [
              "להבין (לא בע\"פ): למה $R = \\frac{1}{\\limsup \\sqrt[n]{|a_n|}}$ — קשור למבחן שורש",
            ],
            tricks: [
              "לבדוק קצה שמאלי ב-$x=-R$: לרוב מקבלים $\\sum \\frac{(-1)^n}{...}$ — לייבניץ",
              "לבדוק קצה ימני ב-$x=R$: לרוב $\\sum \\frac{1}{n^p}$ — מבחן $p$",
              "שכחת הנגזרת? $\\left(\\sum a_n x^n\\right)' = \\sum n \\cdot a_n x^{n-1}$",
            ],
          }}
        />

        <Day
          date="ראשון 8.6" hours={2} label="מקלורן — 7 הטורים הקנוניים"
          tasks={{
            learn: [
              "שבעת הטורים שחייבים להיות בזיכרון בע\"פ (ראה: ׳לא לשכוח׳ למטה)",
              "הרכבת טורים: $e^{x^2}$, $\\sin(x^2)$, $\\cos(\\sqrt{x})$, $\\ln(1+x^2)$",
            ],
            review: [
              "שארית לגרנג': $R_n(x) = \\frac{f^{(n+1)}(c)}{(n+1)!}x^{n+1}$ לאיזשהו $c$ בין $0$ ל-$x$",
              "סדר הטור: $n$ שבו שארית לגרנג' נעשית קטנה מדי (לשגיאה נתונה)",
            ],
            exercises: [
              "פתחי $\\ln(1+x)$ עד סדר 4 — ובדקי בשארית לגרנג׳ השגיאה ב-$x=0.1$",
              "מהי $\\lim_{x\\to 0} \\frac{e^x - 1 - x}{x^2}$ — פתרי עם מקלורן (ולא עם לופיטל!)",
            ],
            theorems: [
              "שארית לגרנג' — ידי (נוסחה + שימוש להערכת שגיאה)",
              "עקרון הזהות לטורי חזקות: אם שני טורים שווים ב-$(−R,R)$ אז כל מקדמיהם שווים",
            ],
            proofs: [
              "להבין איך מגיעים ל-$e^x = \\sum \\frac{x^n}{n!}$ — חישוב נגזרות + $f^{(n)}(0) = 1$",
            ],
            tricks: [
              "הרכבה: $\\sin(x^2) = \\sum \\frac{(-1)^n x^{4n+2}}{(2n+1)!}$ — פשוט מחליפים $x \\to x^2$",
              "גזירה: $\\frac{1}{(1-x)^2} = \\left(\\frac{1}{1-x}\\right)' = \\sum n x^{n-1}$",
              "אינטגרציה: $\\arctan x = \\int_0^x \\frac{dt}{1+t^2} = \\sum \\frac{(-1)^n x^{2n+1}}{2n+1}$",
            ],
          }}
        />

        <Day
          date="שני 9.6" hours={2} label="אינטגרל לא-אמיתי — התכנסות"
          tasks={{
            learn: [
              "שני סוגי אינטגרל לא-אמיתי: קצה אינסופי $\\int_1^\\infty$, וסינגולריות בנקודה $\\int_0^1 \\frac{1}{x^p}dx$",
              "מבחן $p$: $\\int_1^{\\infty} \\frac{1}{x^p} dx$ מתכנס אמ\"ם $p > 1$; $\\int_0^1 \\frac{1}{x^p} dx$ מתכנס אמ\"ם $p < 1$",
            ],
            review: [
              "מבחן השוואה לאינטגרל: $0 \\leq f(x) \\leq g(x)$, אם $\\int g$ מתכנס אז $\\int f$ מתכנס",
              "LCT לאינטגרל: $f,g \\geq 0$, $\\lim_{x\\to\\infty} \\frac{f(x)}{g(x)} = L \\in (0,\\infty)$ אז $\\int f \\leftrightarrow \\int g$",
            ],
            exercises: [
              "האם $\\int_1^\\infty \\frac{\\ln x}{x^2} dx$ מתכנס? (LCT עם $1/x^{3/2}$)",
              "האם $\\int_0^1 \\frac{1}{\\sqrt{x}(1+x)} dx$ מתכנס? (סינגולריות ב-$0$, LCT עם $1/\\sqrt{x}$)",
              "שאלת מבחן עבר: $\\int_1^\\infty \\frac{\\sin^2 x}{x^{3/2}} dx$",
            ],
            theorems: [
              "שימו לב: סינגולריות פנימית! $\\int_{-1}^{1} \\frac{1}{x} dx$ — אינה מוגדרת ב-$0$, צריך לפצל",
              "דיריכלה לאינטגרל: אם $F(x) = \\int_a^x f$ חסומה ו-$g$ יורדת ל-$0$ אחידות, אז $\\int_a^\\infty fg$ מתכנס",
            ],
            proofs: [
              "הוכחת מבחן $p$ לאינטגרל $\\int_1^\\infty \\frac{1}{x^p}$: חשבי ישירות ובדקי מתי הגבול סופי",
            ],
            tricks: [
              "ב-$\\infty$: השווי ל-$\\frac{1}{x^p}$ — בחרי $p$ = החזקה הדומיננטית",
              "ב-$0$: השווי ל-$\\frac{1}{x^p}$ — בחרי $p$ כך שהגבול $\\lim_{x\\to 0} f(x) \\cdot x^p$ קיים וחיובי",
              "לא לשכוח: לבדוק כל סינגולריות בנפרד (כולל פנימיות!)",
            ],
          }}
        />

        <Day
          date="שלישי 10.6" hours={2} label="שיטות אינטגרציה — חלקים, שברים חלקיים"
          tasks={{
            learn: [
              "חלקים: $\\int u \\, dv = uv - \\int v \\, du$ — בחרי $u$ לפי LIATE: לוגריתם, אינוורס-טריג, אלגברי, טריג, אקספוננט",
              "שברים חלקיים — שלושה מקרים: גורמים שונים, גורם חוזר, גורם ריבועי אי-פריק",
            ],
            review: [
              "החלפה טריגונומטרית: $\\sqrt{a^2-x^2} \\Rightarrow x=a\\sin\\theta$; $\\sqrt{a^2+x^2} \\Rightarrow x=a\\tan\\theta$; $\\sqrt{x^2-a^2} \\Rightarrow x=a\\sec\\theta$",
              "החלפת ויירשטרס: $t = \\tan(x/2)$ — הופכת כל ביטוי ב-$\\sin x, \\cos x$ לפונקציה רציונלית",
            ],
            exercises: [
              "$\\int x^2 e^x dx$ — חלקים פעמיים",
              "$\\int \\frac{x^2+1}{x^3-x} dx$ — שברים חלקיים (גורמים לינאריים)",
              "$\\int \\frac{dx}{x^2+4x+5}$ — ריבוע שלם + ארקטנגנס",
            ],
            theorems: [
              "נוסחת הפחתה: $\\int \\sin^n x \\, dx$ — להכיר (לא לשנן, אבל לדעת לגזור)",
            ],
            proofs: ["לא קריטי להיום"],
            tricks: [
              "חלקים בטבלה: כשצריך לבצע חלקים פעמים רבות ($x^n e^x$, $x^n \\sin x$)",
              "$\\int \\frac{P(x)}{Q(x)}dx$ — אם $\\deg P \\geq \\deg Q$ קודם חלקי פולינומים!",
              "חזרה על עצמה: $\\int e^x \\sin x \\, dx$ — חלקים פעמיים, קבלת משוואה, פתרון ל-$I$",
            ],
          }}
        />

        <Day
          date="רביעי 11.6" hours={2} label="חזרה כוללת + גיליון נוסחאות"
          tasks={{
            learn: [
              "צרי לעצמך גיליון נוסחאות (A4) עם כל הנוסחאות הקריטיות",
              "כל הגדרה חשובה: טור, התכנסות, רדיוס, שארית לגרנג׳, אינטגרל לא-אמיתי",
            ],
            review: [
              "קרי שוב את 7 טורי המקלורן — שני בהם עד שהם זורמים",
              "חזרי על כל 5 מבחני ההתכנסות — הצהרות מדויקות",
            ],
            exercises: [
              "שאלה מעורבת אחת ממבחן עבר — פתרי בתנאי מבחן (80 דק')",
              "בדקי: כמה זמן לקח? איפה נתקעת?",
            ],
            theorems: ["חזרה על כל משפטים מהשבוע — קרי ורשמי מהזיכרון"],
            proofs: ["תנאי הכרחי + גיאומטרי — כתבי מהזיכרון"],
            tricks: [
              "רשמי לעצמך: ׳מה אני עדיין לא בטוחה בו?׳ — זו רשימת העבודה לאחרי מועד ג׳",
            ],
          }}
        />

        <Day
          date="חמישי 12.6 ⭐" hours={0.5} label="יום מועד ג׳ לינארית — 30 דק' בלבד"
          urgent
          tasks={{
            learn: ["אל תלמדי שום דבר חדש!"],
            review: ["קרי את גיליון הנוסחאות שיצרת אתמול — 30 דק' בלבד"],
            exercises: ["אין — שמרי אנרגיה למועד ג׳"],
            theorems: [""],
            proofs: [""],
            tricks: ["הצלחה! 🎯 אחרי המועד — מנוחה של שעה, ואז חזרה לאינפי"],
          }}
        />
      </Phase>

      {/* ── Phase 2 ── */}
      <Phase
        id="phase2"
        title="שלב ב׳ — עלייה בהילוך"
        subtitle="13–17.6 · 5-6 שעות ביום · צלילה עמוקה לכל נושא"
        color="var(--green)"
        bg="var(--green-light)"
        border="var(--green-border)"
        badge="5-6ש׳/יום"
      >
        <Day
          date="שישי 13.6" hours={5} label="טורים בעומק — הוכחות + שאלות מבחן"
          tasks={{
            learn: [
              "הוכחת מבחן מנה (d'Alembert): אם $L < 1$ בחרי $r$ כך ש-$L < r < 1$ ועבור $n$ גדול $|a_{n+1}| \\leq r|a_n|$",
              "הוכחת לייבניץ: הסדרות $S_{2N}$ עולה, $S_{2N+1}$ יורדת, שתיהן חסומות → שתיהן מתכנסות לאותו גבול",
            ],
            review: [
              "כל 5 מבחני ההתכנסות — נוסחה + דוגמה + מקרה גבולי ($L=1$)",
              "מה לעשות כש-$L=1$ במבחן מנה/שורש: עבור ל-LCT, השוואה, או אינטגרל",
            ],
            exercises: [
              "4 שאלות טורים ממועד א׳ 2024 — תנאי מדויק לכל מבחן",
              "2 שאלות ממועד ב׳ 2023 — טורים עם פרמטר $\\alpha$",
              "שאלת בונוס: טור חלופי עם $a_n = \\frac{(-1)^n \\ln n}{n}$ — לייבניץ? כן! (למה?)",
            ],
            theorems: [
              "התכנסות מוחלטת גוררת התכנסות: $\\sum |a_n| < \\infty \\Rightarrow \\sum a_n < \\infty$",
              "טור חלופי מתכנס בתנאי אם $\\sum |a_n| = \\infty$ אבל $\\sum a_n < \\infty$",
            ],
            proofs: [
              "הוכחת לייבניץ — לכתוב מהזיכרון (15 דק׳)",
              "הרעיון בהוכחת מבחן מנה — לא שינון מילה במילה, אבל הלוגיקה",
            ],
            tricks: [
              "טור עם $(-1)^n$: קודם בדוק התכנסות מוחלטת ($\\sum |a_n|$) — אם כן, גמרת",
              "אם לא מוחלטת: בדוק לייבניץ ($a_n \\to 0$? $a_n$ יורד מונוטוני?)",
              "לייבניץ עם $a_n$ לא מונוטוני: הפרד $\\sum a_n^+$ ו-$\\sum a_n^-$",
            ],
          }}
        />

        <Day
          date="שבת 14.6" hours={5} label="אינטגרלים בעומק — כל השיטות"
          tasks={{
            learn: [
              "שברים חלקיים — מקרה ריבועי: $\\frac{Ax+B}{x^2+bx+c}$ — ריבוע שלם + ארקטנגנס",
              "וולס: $\\int_0^{\\pi/2} \\sin^n x \\, dx = \\int_0^{\\pi/2} \\cos^n x \\, dx$ — נוסחת הפחתה",
            ],
            review: [
              "חלקים בטבלה: $\\int x^n e^x dx$, $\\int x^n \\sin x \\, dx$",
              "החלפה טריגונומטרית — שלושת המקרים",
            ],
            exercises: [
              "$\\int \\frac{x^3}{(x^2+1)^2} dx$ — החלפה + שברים",
              "$\\int_0^1 x^2 \\sqrt{1-x^2} \\, dx$ — החלפה טריג $x = \\sin\\theta$",
              "$\\int \\frac{dx}{\\sin x + \\cos x}$ — ויירשטרס $t = \\tan(x/2)$",
              "$\\int \\frac{3x+1}{x^2-5x+6} dx$ — שברים חלקיים פשוטים",
            ],
            theorems: [
              "נוסחת פחתה: $\\int \\sin^n x = -\\frac{1}{n}\\sin^{n-1}x\\cos x + \\frac{n-1}{n}\\int \\sin^{n-2}x$",
            ],
            proofs: ["לא קריטי"],
            tricks: [
              "האינטגרל $\\int e^x(f(x)+f'(x))dx = e^x f(x) + C$ — זהות שימושית מאוד",
              "ביטויים מהצורה $\\int \\frac{dx}{ax^2+bx+c}$: תמיד ריבוע שלם קודם",
            ],
          }}
        />

        <Day
          date="ראשון 15.6" hours={5} label="טורי חזקות + התכנסות אחידה"
          tasks={{
            learn: [
              "התכנסות אחידה: $\\sum f_n(x)$ מתכנס אחידה ב-$A$ אם $\\sup_{x\\in A} |S_N(x) - S(x)| \\to 0$",
              "קריטריון $M$: $|f_n(x)| \\leq M_n$ לכל $x\\in A$ ו-$\\sum M_n < \\infty$ $\\Rightarrow$ התכנסות אחידה",
            ],
            review: [
              "התכנסות אחידה → רציפות של הגבול (אם $f_n$ רציפות)",
              "גזירה ואינטגרציה תחת סימן הסכום — מותרות בהתכנסות אחידה",
              "מרווח פתוח vs. סגור: טור חזקות $\\sum a_n x^n$ מתכנס אחידה בכל $[-r, r]$ עבור $r < R$",
            ],
            exercises: [
              "מצאי את $R$ של $\\sum \\frac{(-1)^n}{n+1} x^n$ ובדקי קצוות + האם מתכנס אחידה בקצוות?",
              "הוכיחי שהטור $\\sum \\frac{x^n}{n^2}$ מתכנס אחידה ב-$[-1,1]$",
              "מצאי $\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n+1}$ באמצעות הטור של $\\arctan x$ ב-$x=1$",
            ],
            theorems: [
              "כל 4 תוצאות על התכנסות אחידה: רציפות, אינטגרציה, גזירה, חסימות אחידה",
            ],
            proofs: [
              "קריטריון $M$ (Weierstrass M-test) — הרעיון: $|S(x) - S_N(x)| \\leq \\sum_{n>N} M_n \\to 0$",
            ],
            tricks: [
              "להוכיח אחידות: תמיד נסי קריטריון $M$ קודם — הכי פשוט",
              "להפריך אחידות: מצאי סדרת נקודות $x_n$ ש-$S_N(x_n) \\not\\to S(x_n)$",
            ],
          }}
        />

        <Day
          date="שני 16.6" hours={6} label="מבחן מדומה 1 + 2 — תנאי מבחן אמיתי"
          tasks={{
            learn: ["אין לימוד — יום מבחן מדומה"],
            review: [""],
            exercises: [
              "09:00–11:30: מועד א׳ 2024 — פתרי לבד, בלי עזרה, עם טיימר (90 דק׳)",
              "11:30–13:00: תיקון מפורט — לכל טעות: מה לא ידעתי? מה הטריק שהחסרתי?",
              "14:00–15:30: מועד ב׳ 2023 — שוב מבחן מלא",
              "15:30–17:00: תיקון + רשימת נקודות חולשה לטיפול מחר",
            ],
            theorems: [""],
            proofs: [""],
            tricks: [
              "כתבי: ׳3 הדברים שהכי הפריעו לי היום׳ — זה מה שלומדים מחר",
            ],
          }}
        />

        <Day
          date="שלישי 17.6" hours={5} label="נקודות חולשה + כל ההוכחות הקריטיות"
          tasks={{
            learn: [
              "טפלי ברשימת החולשות מאתמול — שעתיים על הנושאים הכי קשים שצצו",
            ],
            review: [
              "אינטגרל לא-אמיתי + שיטות אינטגרציה (נושאים שלרוב מרגישים ׳פחות בטוחים׳)",
            ],
            exercises: [
              "3 שאלות ממבחן עבר — רק הנושאים שבהם נכשלת אתמול",
            ],
            theorems: [
              "תנאי הכרחי, גיאומטרי, p-series — שלושה משפטים לשנן בע\"פ",
            ],
            proofs: [
              "תנאי הכרחי — כתבי מהזיכרון (5 דק׳)",
              "גיאומטרי $\\sum r^n = \\frac{1}{1-r}$ — הוכחה ידי ממש (חשוב במבחנים!) (5 דק׳)",
              "p-series בעזרת מבחן אינטגרל — $\\int_1^\\infty \\frac{dx}{x^p}$ (10 דק׳)",
              "לייבניץ — הלוגיקה של $S_{2N}$ ו-$S_{2N+1}$ (15 דק׳)",
              "מבחן מנה — הרעיון עם $r$ (10 דק׳)",
            ],
            tricks: ["כל הטריקים שרשמת בשבוע — קרי ושנני"],
          }}
        />
      </Phase>

      {/* ── Phase 3 ── */}
      <Phase
        id="phase3"
        title="שלב ג׳ — תחזוקה בחו״ל"
        subtitle="18–22.6 · 20-30 דק' ביום · לא לשכוח, לא להוסיף"
        color="var(--purple)"
        bg="var(--purple-light)"
        border="var(--purple-border)"
        badge="30 דק׳/יום"
      >
        <DayCompact
          dates="18–22.6 (כל יום)"
          tasks={[
            "10 דק': קרי גיליון הנוסחאות — 7 טורי מקלורן + 5 מבחני התכנסות + מבחן $p$",
            "15 דק': פתרי שאלת טורים אחת פשוטה (לא יותר!) מהמחברת שלך",
            "אל תנסי ללמוד חומר חדש — זה רק ישגע אותך",
            "אם ממש רוצה — חזרי על גיליון ההוכחות בלבד",
          ]}
        />
      </Phase>

      {/* ── Phase 4 ── */}
      <Phase
        id="phase4"
        title="שלב ד׳ — חזרה ועלייה"
        subtitle="23–25.6 · 6-8 שעות ביום · חזרה לקצב מלא"
        color="var(--gold)"
        bg="var(--gold-light)"
        border="var(--gold-border)"
        badge="6-8ש׳/יום"
      >
        <Day
          date="שני 23.6" hours={6} label="רענון כל הנושאים — חזרה מאורגנת"
          tasks={{
            learn: [
              "עברי על כל הנושאים לפי סדר: טורים → אינטגרל לא-אמיתי → שיטות אינטגרציה → טורי חזקות → מקלורן",
              "לכל נושא: קרי הגדרות, משפטים, וודאי שהידע לא נשחק",
            ],
            review: [
              "7 טורי מקלורן — שני בע\"פ",
              "5 מבחני התכנסות — הצהרות מדויקות",
            ],
            exercises: [
              "מבחן מדומה מלא (90 דק') — מועד א׳ 2023",
              "תיקון מלא עם הבנת כל טעות",
            ],
            theorems: [""],
            proofs: ["תנאי הכרחי + גיאומטרי — כתבי מהזיכרון"],
            tricks: [""],
          }}
        />

        <Day
          date="שלישי 24.6" hours={7} label="אינטגרלים — הנושא הכי נוטה לאבד קצב"
          tasks={{
            learn: [
              "חזרה מלאה: חלקים, שברים חלקיים (3 מקרים), החלפות טריג, ויירשטרס",
              "אינטגרל לא-אמיתי: כל מבחני ההתכנסות + סינגולריות פנימיות",
            ],
            review: [
              "האינטגרל $\\int e^x(f+f')dx = e^xf + C$ — לדעת להשתמש",
              "ריבוע שלם: $x^2+4x+5 = (x+2)^2+1$",
            ],
            exercises: [
              "5 אינטגרלים ממבחני עבר — בחרי הכי מסובכים",
              "3 שאלות אינטגרל לא-אמיתי — כולל אחת עם פרמטר $\\alpha$",
            ],
            theorems: ["LCT לאינטגרל — הצהרה מדויקת + דוגמה"],
            proofs: ["p-integral — כתבי מהזיכרון"],
            tricks: [""],
          }}
        />

        <Day
          date="רביעי 25.6" hours={8} label="טורי חזקות + מבחן מדומה 3"
          tasks={{
            learn: [
              "רדיוס התכנסות — שלוש שיטות: מנה, שורש, הגדרה",
              "בדיקת קצוות — לא לשכוח! בדרך כלל מקבלים p-series או לייבניץ",
              "גזירה ואינטגרציה: שימוש להוכחת זהויות (לדוגמה: $\\sum n x^{n-1} = \\frac{1}{(1-x)^2}$)",
            ],
            review: [
              "7 טורי מקלורן + הרכבות + גזירה + אינטגרציה שלהם",
              "שארית לגרנג׳ — שימוש להוכחת כדאיות קירוב",
            ],
            exercises: [
              "09:00–10:30: מבחן מדומה מלא (90 דק')",
              "10:30–12:00: תיקון מלא",
              "אחריים: 4 שאלות על רדיוס התכנסות + קצוות",
            ],
            theorems: ["גזירה ואינטגרציה תחת סימן הסכום — תנאים"],
            proofs: ["לייבניץ — מהזיכרון, 15 דק׳"],
            tricks: [""],
          }}
        />
      </Phase>

      {/* ── Phase 5 ── */}
      <Phase
        id="phase5"
        title="שלב ה׳ — חרישה מלאה"
        subtitle="26.6–2.7 · 10 שעות ביום · מבחנים מדומים + חיזוק"
        color="var(--red-mid)"
        bg="var(--red-light)"
        border="var(--red-border)"
        badge="10ש׳/יום"
      >
        <Day
          date="חמישי 26.6" hours={10} label="יום טורים — כל המבחנים בצלילה"
          tasks={{
            learn: [
              "09:00–13:00: לכל אחד מ-5 מבחני ההתכנסות — הצהרה, הוכחת הרעיון, 2 דוגמאות, מקרה גבולי",
            ],
            review: [
              "מה לעשות כש-$L=1$: לנסות LCT, או מבחן אינטגרל, או השוואה ישירה",
              "טורים עם פרמטר: $\\sum \\frac{(\\alpha n)!}{(n!)^\\alpha}$ — מתי מתכנס?",
            ],
            exercises: [
              "16:00–17:30: מבחן מדומה מלא (90 דק') — מועד ב׳ 2022",
              "17:30–19:00: תיקון + ניתוח",
              "19:00–20:00: טורי חזקות — 3 שאלות",
            ],
            theorems: ["כל 5 מבחני ההתכנסות — לכתוב מהזיכרון ללא הצצה"],
            proofs: [
              "תנאי הכרחי (5 דק׳), גיאומטרי (5 דק׳), p-series (10 דק׳), לייבניץ (15 דק׳)",
            ],
            tricks: [""],
          }}
        />

        <Day
          date="שישי 27.6" hours={10} label="יום אינטגרלים — כל שיטה + אינטגרל לא-אמיתי"
          tasks={{
            learn: ["09:00–12:00: כל שיטות האינטגרציה — כל מקרה, עם דוגמה"],
            review: [
              "אינטגרל לא-אמיתי: כל מבחני ההתכנסות + דיריכלה",
              "סינגולריות פנימיות — לפצל את האינטגרל",
            ],
            exercises: [
              "12:00–13:30: מבחן מדומה (90 דק')",
              "אחריים: 4 אינטגרלים קשים + 3 אינטגרלים לא-אמיתיים ממבחני עבר",
            ],
            theorems: [""],
            proofs: ["p-integral — שוב, מהזיכרון"],
            tricks: ["זהות $\\int e^x(f+f') = e^xf + C$ — בדוק שאת זוכרת"],
          }}
        />

        <Day
          date="שבת 28.6" hours={10} label="יום מקלורן + טורי חזקות"
          tasks={{
            learn: [
              "09:00–11:00: 7 טורי מקלורן + כל הרכבות + גזירה + אינטגרציה",
              "11:00–13:00: רדיוס התכנסות + קצוות + שאלות מסובכות",
            ],
            review: [
              "שארית לגרנג׳ — חישוב שגיאה בקירוב",
              "מציאת טור מקלורן ב-x₀ ≠ 0 (טיילור)",
            ],
            exercises: [
              "16:00–17:30: מבחן מדומה (90 דק')",
              "אחריים: 5 שאלות מקלורן + 3 שאלות רדיוס + קצוות",
            ],
            theorems: [""],
            proofs: [""],
            tricks: [""],
          }}
        />

        <Day
          date="ראשון 29.6" hours={10} label="יום חולשות + מבחן מדומה"
          tasks={{
            learn: ["שעיים על הנושא שעדיין הכי קשה לך — כל היום אחריו"],
            review: [""],
            exercises: [
              "מבחן מדומה (90 דק') — נסי מועד א׳ 2022",
              "אחריים: שאלות מעורבות (שאלות שמשלבות טורים + אינטגרל)",
            ],
            theorems: ["כל המשפטים — כתבי רשימה מהזיכרון"],
            proofs: ["כל 5 הוכחות — מהזיכרון"],
            tricks: [""],
          }}
        />

        <Day
          date="שני 30.6" hours={10} label="יום מסכם + טריקים"
          tasks={{
            learn: ["עברי על כל הנושאים — 30 דק' לכל נושא"],
            review: [""],
            exercises: [
              "מבחן מדומה (90 דק') — מועד ב׳ 2024",
              "אחריים: 5 שאלות שמשלבות נושאים (שאלות מורכבות ממבחנים)",
            ],
            theorems: [""],
            proofs: [""],
            tricks: [
              "כתבי רשימה סופית של כל הטריקים שלמדת — 1 עמוד",
              "קרי ושנני את כל הטעויות הנפוצות מרשימת ׳אל תשכחי׳",
            ],
          }}
        />

        <Day
          date="שלישי 1.7" hours={10} label="יום הוכחות + שאלות מסובכות"
          tasks={{
            learn: [""],
            review: [""],
            exercises: [
              "09:00–10:30: מבחן מדומה אחרון (מלא!)",
              "10:30–12:30: תיקון מלא",
              "אחריים: 6 שאלות מהכי קשות שמצאת במבחנים",
            ],
            theorems: ["כל הגדרות — קרי + בדקי שהכל ברור"],
            proofs: [
              "כתבי מהזיכרון את כל 5 הוכחות — ב-45 דק' (כמו במבחן)",
            ],
            tricks: [""],
          }}
        />

        <Day
          date="רביעי 2.7 ⭐" hours={4} label="יום לפני — קל ומדוד"
          urgent
          tasks={{
            learn: ["לא ללמוד דברים חדשים!"],
            review: [
              "בוקר: קרי גיליון נוסחאות — 7 מקלורן + 5 מבחנים + הגדרות",
              "צהריים: 2-3 שאלות ׳חמות׳ — שאלות שפתרת היטב בעבר (לקחת ביטחון)",
            ],
            exercises: [""],
            theorems: [""],
            proofs: [""],
            tricks: [
              "שינה מוקדמת — 10 שעות שינה הכי חשובות מכל הלימוד",
              "לאכול טוב, לשתות מים",
              "להגיע 15 דק' מוקדם לבחינה",
            ],
          }}
        />
      </Phase>

      {/* ── Exam Day ── */}
      <section
        className="overflow-hidden rounded-2xl border-2 p-6 text-center"
        style={{ background: "linear-gradient(135deg, #082f49 0%, #0b7285 100%)", borderColor: "var(--navy-border)", color: "white" }}
      >
        <p className="text-5xl mb-3">🎯</p>
        <h2 className="text-2xl font-black mb-2">יום חמישי, 3.7 — יום המבחן!</h2>
        <p className="text-white/80 text-sm">
          הגעת עד לכאן — את מוכנה. לנשום עמוק, לקרוא שאלה בעיון, ולזהות את הדפוס.
        </p>
      </section>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════ */

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {label}
    </span>
  );
}

function NeverForget() {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ background: "#fff8f0", borderColor: "var(--amber-border)" }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-base font-black" style={{ color: "#92400e" }}>
        <span>⚠️</span> דברים שאסור לשכוח — אל תפספסי אף אחד!
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {NEVER_FORGET.map((item, i) => (
          <div key={i} className="rounded-xl border p-3" style={{ background: "#fffbf3", borderColor: "var(--amber-border)" }}>
            <p className="mb-0.5 text-xs font-black uppercase tracking-wide" style={{ color: "#b45309" }}>{item.title}</p>
            <p className="text-sm" style={{ color: "#451a03" }}>{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border p-4" style={{ background: "var(--navy-light)", borderColor: "var(--navy-border)" }}>
        <p className="mb-2 text-xs font-black" style={{ color: "var(--navy-mid)" }}>7 טורי מקלורן — לדעת בעל פה מחוץ לשינה</p>
        <div className="grid gap-1.5 text-xs" style={{ color: "var(--text-primary)", fontFamily: "monospace", lineHeight: 1.7 }}>
          {MACLAURIN.map((m, i) => <div key={i}>{m}</div>)}
        </div>
      </div>
    </section>
  );
}

const NEVER_FORGET = [
  {
    title: "תנאי הכרחי — לא מספיק!",
    body: "אם aₙ→0 זה לא מספיק! הסדרה ההרמונית Σ1/n מתבדרת למרות 1/n→0.",
  },
  {
    title: "LCT — L חייב להיות (0,∞)",
    body: "אם L=0 או L=∞ המבחן לא עובד! תבחרי bₙ שונה.",
  },
  {
    title: "לייבניץ — גם מונוטוניות!",
    body: "לא מספיק שaₙ→0. aₙ חייב לרדת מונוטוני (לפחות מסוף מסוים).",
  },
  {
    title: "L=1 במנה/שורש — חסר!",
    body: "L=1 לא אומר כלום! עברי למבחן אחר: LCT, השוואה, או מבחן אינטגרל.",
  },
  {
    title: "קצוות בטורי חזקות — תמיד!",
    body: "רדיוס התכנסות נותן קטע פתוח (−R,R). חייבים לבדוק x=R וx=−R בנפרד.",
  },
  {
    title: "סינגולריות פנימית!",
    body: "∫₋₁¹ 1/x dx לא מוגדר! חייבים לפצל ב-0 ולבדוק כל חצי בנפרד.",
  },
  {
    title: "dx בהחלפה!",
    body: "כשמחליפים u=f(x) — חייבים להחליף גם את dx=du/f'(x). שכחה נפוצה!",
  },
  {
    title: "בדיקת קצה — הכי שוכחים!",
    body: "אחרי מציאת R, לבדוק x=R: לרוב מקבלים Σ1/nᵖ. לבדוק x=−R: לרוב לייבניץ.",
  },
];

const MACLAURIN = [
  "eˣ  = Σ xⁿ/n!   (כל x)",
  "sin x = Σ (-1)ⁿ x^(2n+1)/(2n+1)!   (כל x)",
  "cos x = Σ (-1)ⁿ x^(2n)/(2n)!       (כל x)",
  "ln(1+x) = Σ (-1)ⁿ⁺¹ xⁿ/n          (|x|≤1, x≠-1)",
  "1/(1-x) = Σ xⁿ                     (|x|<1)",
  "(1+x)^α = Σ C(α,n) xⁿ             (|x|<1)",
  "arctan x = Σ (-1)ⁿ x^(2n+1)/(2n+1) (|x|≤1)",
];

/* ── Phase wrapper ── */
function Phase({
  id, title, subtitle, color, bg, border, badge, children,
}: {
  id: string; title: string; subtitle: string;
  color: string; bg: string; border: string; badge: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <div
        className="flex items-center justify-between gap-3 rounded-xl border p-4"
        style={{ background: bg, borderColor: border }}
      >
        <div>
          <h2 className="text-lg font-black" style={{ color }}>{title}</h2>
          <p className="text-xs font-medium" style={{ color }}>{subtitle}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
          style={{ background: color, color: "#fff" }}
        >
          {badge}
        </span>
      </div>
      <div className="space-y-3 pr-2">{children}</div>
    </section>
  );
}

/* ── Day card ── */
interface DayTasks {
  learn: string[];
  review: string[];
  exercises: string[];
  theorems: string[];
  proofs: string[];
  tricks: string[];
}

function Day({
  date, hours, label, tasks, urgent = false,
}: {
  date: string; hours: number; label: string;
  tasks: DayTasks; urgent?: boolean;
}) {
  return (
    <details
      className="group overflow-hidden rounded-xl border"
      style={{ borderColor: urgent ? "var(--amber-border)" : "var(--border)", background: urgent ? "var(--amber-light)" : "#fff" }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 select-none">
        <div
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center"
          style={{ background: urgent ? "var(--amber-mid)" : "var(--navy)", color: "#fff" }}
        >
          <span className="text-[10px] font-black leading-tight">{date.split(" ")[0]}</span>
          <span className="text-[10px] leading-tight">{date.split(" ")[1]}</span>
          {hours > 0 && <span className="text-[8px] opacity-80">{hours}ש׳</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm leading-tight" style={{ color: "var(--text-primary)" }}>{label}</p>
          {urgent && <p className="text-xs font-semibold" style={{ color: "var(--amber-mid)" }}>⚠️ יום מיוחד</p>}
        </div>
        <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </summary>

      <div
        className="border-t px-4 py-4 space-y-4"
        style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
      >
        <TaskSection icon="📖" title="מה ללמוד" items={tasks.learn} color="var(--navy)" />
        <TaskSection icon="🔁" title="מה לחזור" items={tasks.review} color="var(--cyan)" />
        <TaskSection icon="✏️" title="תרגילים" items={tasks.exercises} color="var(--green)" />
        {tasks.theorems.some(t => t) && <TaskSection icon="📐" title="משפטים והגדרות לשנן" items={tasks.theorems} color="var(--purple)" />}
        {tasks.proofs.some(p => p) && <TaskSection icon="🧮" title="הוכחות לדעת" items={tasks.proofs} color="var(--red-mid)" />}
        {tasks.tricks.some(t => t) && <TaskSection icon="💡" title="טריקים ודפוסים" items={tasks.tricks} color="var(--amber-mid)" />}
      </div>
    </details>
  );
}

function TaskSection({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return null;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide" style={{ color }}>
        <span>{icon}</span>{title}
      </p>
      <div className="space-y-1.5">
        {filtered.map((item, i) => (
          <div key={i} className="task-item flex gap-2">
            <span className="mt-1 shrink-0 text-[10px] font-black leading-none" style={{ color }}>•</span>
            <div className="min-w-0 flex-1">
              <MathContent text={item} className="text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Compact day (abroad) ── */
function DayCompact({ dates, tasks }: { dates: string; tasks: string[] }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--purple-border)", background: "var(--purple-light)" }}
    >
      <p className="mb-2 text-sm font-black" style={{ color: "var(--purple)" }}>{dates}</p>
      <ul className="space-y-1.5">
        {tasks.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
            <span className="shrink-0" style={{ color: "var(--purple)" }}>•</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
