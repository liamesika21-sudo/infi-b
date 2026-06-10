import { readFile } from "fs/promises";
import path from "path";

let cachedPrompt: string | null = null;

interface MaxInsightsData {
  intuitions?: Array<{ topic: string; title: string; text: string; maxQuote?: string }>;
  counterExamples?: Array<{ topic: string; claim: string; verdict: string; maxQuote?: string }>;
  weeklyInsights?: Array<{
    week: number;
    topic: string;
    keyInsights: string[];
    examTip?: string;
    dangerZone?: string;
  }>;
}

interface LectureSummary {
  lectureNumber: number;
  mainTopics?: string[];
  keyTheorems?: string[];
  keyDefinitions?: string[];
  keyFormulas?: string[];
}

interface KnowledgeItem {
  name: string;
  content: string;
}

interface WeekData {
  week: number;
  title: string;
  definitions: KnowledgeItem[];
  theorems: KnowledgeItem[];
}

interface BattlePlanBlock {
  title: string;
  weekData: WeekData[];
}

async function readMaxInsights(): Promise<MaxInsightsData> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data/generated/calculus2/max-insights.json"),
      "utf8"
    );
    return JSON.parse(raw) as MaxInsightsData;
  } catch {
    return {};
  }
}

async function readLectureSummaries(): Promise<LectureSummary[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data/generated/calculus2/lecture-summaries.json"),
      "utf8"
    );
    return JSON.parse(raw) as LectureSummary[];
  } catch {
    return [];
  }
}

async function readBattlePlanData(): Promise<BattlePlanBlock[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data/generated/calculus2/battle-plan-data.json"),
      "utf8"
    );
    return JSON.parse(raw) as BattlePlanBlock[];
  } catch {
    return [];
  }
}

function buildLectureBlock(lectures: LectureSummary[]): string {
  if (!lectures.length) return "(לא נטענו סיכומי הרצאות)";
  return lectures
    .map((lec) => {
      const lines: string[] = [`### הרצאה ${lec.lectureNumber}${lec.mainTopics?.length ? ` — ${lec.mainTopics.join(", ")}` : ""}`];
      if (lec.keyTheorems?.length) lines.push(`  משפטים: ${lec.keyTheorems.join(" | ")}`);
      if (lec.keyDefinitions?.length) lines.push(`  הגדרות: ${lec.keyDefinitions.join(" | ")}`);
      if (lec.keyFormulas?.length) lines.push(`  נוסחאות: ${lec.keyFormulas.join(" | ")}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildKnowledgeBase(blocks: BattlePlanBlock[]): string {
  if (!blocks.length) return "";
  const lines: string[] = [];
  for (const block of blocks) {
    lines.push(`### ${block.title}`);
    for (const wd of block.weekData) {
      lines.push(`\n**שבוע ${wd.week} — ${wd.title}**`);

      if (wd.definitions.length) {
        lines.push("\n**הגדרות:**");
        for (const def of wd.definitions) {
          if (def.content) {
            lines.push(`\n📌 **${def.name}**\n${def.content}`);
          }
        }
      }

      if (wd.theorems.length) {
        lines.push("\n**משפטים:**");
        for (const thm of wd.theorems) {
          if (thm.content) {
            lines.push(`\n📐 **${thm.name}**\n${thm.content}`);
          }
        }
      }
    }
    lines.push("\n---");
  }
  return lines.join("\n");
}

export async function buildMentorSystemPrompt(): Promise<string> {
  if (cachedPrompt) return cachedPrompt;

  const [insights, lectures, battlePlan] = await Promise.all([
    readMaxInsights(),
    readLectureSummaries(),
    readBattlePlanData(),
  ]);

  const intuitionLines = (insights.intuitions ?? [])
    .map((i) => `- [${i.topic}] ${i.title}: ${i.text}${i.maxQuote ? `\n  דגש מהתרגול: "${i.maxQuote}"` : ""}`)
    .join("\n");

  const counterLines = (insights.counterExamples ?? [])
    .map((c) => `- [${c.topic}] ${c.claim} → ${c.verdict}`)
    .join("\n");

  const weeklyLines = (insights.weeklyInsights ?? [])
    .map((w) => {
      const tips = w.keyInsights.map((t) => `    • ${t}`).join("\n");
      const extras = [
        w.examTip ? `    ★ בחינה: ${w.examTip}` : "",
        w.dangerZone ? `    ⚠ סכנה: ${w.dangerZone}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return `  שבוע ${w.week} — ${w.topic}:\n${tips}${extras ? "\n" + extras : ""}`;
    })
    .join("\n");

  const lectureBlock = buildLectureBlock(lectures);
  const knowledgeBase = buildKnowledgeBase(battlePlan);

  const prompt = `אתה "מנטור אינפי ב׳" — עוזר לימוד לקורס חדוון 2 של אוניברסיטת רייכמן, מועד א׳ 2026.

## האישיות שלך

אתה משתמש בחומר הרשמי של ההרצאות ובתובנות מהתרגולים, אבל מדבר כעוזר אחד רציף וטבעי.
אל תציג את עצמך בשם מרצה או מתרגל, ואל תחלק את התשובה לדמויות.

## כללים מחייבים

1. **חומר בלבד** — ענה אך ורק על שאלות הקשורות לחומר קורס זה: גבולות, סדרות, אינטגרלים (מסוים, לא-אמיתי), טורים, טורי חזקות, טיילור/מקלורן. אם שואלים על נושא אחר — השב: "זה לא בחומר הקורס, אוכל לעזור רק עם נושאי האינפי ב׳."
2. **עברית** — ענה תמיד בעברית.
3. **LaTeX** — כתוב מתמטיקה תמיד כ-LaTeX: $...$ לביטוי בשורה, $$...$$ לתצוגה מרכזית.
4. **קצר וממוקד** — ברירת המחדל היא 4-8 שורות או עד 3 צעדים. אל תכתוב מגילות, אל תיתן פתרון מלא אם המשתמש ביקש רק כיוון, ובסוף אפשר לשאול שאלה קצרה להמשך.
5. **הוכחות ומשפטים**:
   - **עדיפות ראשונה**: השתמש בניסוחים שמופיעים במפורש בסעיף "בסיס הידע — הגדרות ומשפטים מלאים" למטה — אלו הניסוחים הרשמיים של הקורס.
   - **מותר ומצופה**: אם שואלים על הוכחה של משפט שמופיע שם — תן אותה במלואה ובניסוח המדויק.
   - **עבור הוכחות שאינן בבסיס הידע**: תן את ההוכחה הסטנדרטית מהמתמטיקה — זה חומר אקדמי מוכר. אל תגיד "לא יודע" על הוכחות סטנדרטיות בחדו"א.
6. **שאלות תרגול** — כשמבקשים שאלה, בנה שאלה בסגנון בחינה אמיתית.
7. **בלי תוויות דוברים** — אסור לכתוב ביטויים כמו "יוסי מדבר", "מקס מדבר", "לפי יוסי", "מקס אומר", או כותרות דומות. אם צריך פורמליות ואינטואיציה, שלב אותן טבעית באותה תשובה.
8. **בונים יחד** — אם השאלה גדולה, התחל בצעד הראשון, בדוק שהמשתמש איתך, ורק אז המשך. אל תזרוק את כל הפתרון בבת אחת אלא אם ביקשו "פתרון מלא".

---

## בסיס הידע — הגדרות ומשפטים מלאים

אלו הניסוחים הרשמיים של הקורס. **כאשר נשאלת על אחד מהמשפטים הבאים — השתמש בניסוח המדויק הזה.**

${knowledgeBase}

---

## חומרי ההרצאה — מה נלמד בכל הרצאה

${lectureBlock}

---

## תובנות אינטואיטיביות מהתרגולים (זכור תמיד)

${intuitionLines}

## דוגמאות נגדיות קלאסיות (שמור אותן)

${counterLines}

## עיקרי כל שבוע

${weeklyLines}

---

## ניסוחים פורמליים — משפטי מפתח (ניסוח קצר לשימוש מהיר)

**לופיטל**: אם $f(a)=g(a)=0$ (או $\\pm\\infty$) ו-$g'(x) \\neq 0$ סביב $a$, אז $\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}$ אם הגבול הימני קיים.

**משפט דרבו**: אם $f$ גזירה על $[a,b]$ ו-$f'(a) < c < f'(b)$ (או הפוך), אז קיים $\\xi \\in (a,b)$ כך ש-$f'(\\xi)=c$.

**סדרה מונוטונית חסומה מתכנסת**: כל סדרה מונוטונית עולה וחסומה מלמעלה מתכנסת.

**FTC (משפט היסודי)**: אם $f$ רציפה על $[a,b]$ ו-$F(x)=\\int_a^x f(t)dt$, אז $F'(x)=f(x)$.

**ניוטון-לייבניץ**: $\\int_a^b f(x)dx = F(b) - F(a)$ כאשר $F'=f$.

**מבחן האינטגרל**: אם $f:[1,\\infty)\\to\\mathbb{R}$ חיובית, רציפה ויורדת ו-$f(n)=a_n$, אז $\\sum_{n=1}^\\infty a_n$ מתכנס אמ"מ $\\int_1^\\infty f(x)dx$ מתכנס.
הוכחה: מאחר ש-$f$ יורדת, לכל $k\\geq 1$: $f(k+1) \\leq \\int_k^{k+1}f(x)dx \\leq f(k)$. סכום מ-$k=1$ עד $N-1$ נותן: $\\sum_{k=2}^N a_k \\leq \\int_1^N f(x)dx \\leq \\sum_{k=1}^{N-1} a_k$. לכן הטור והאינטגרל חסומים זה על ידי זה, ומתכנסות/מתבדרות ביחד.

**טור גאומטרי**: $\\sum_{n=0}^\\infty q^n = \\frac{1}{1-q}$ עבור $|q|<1$.

**מבחן $p$**: $\\sum_{n=1}^\\infty \\frac{1}{n^p}$ מתכנס אמ"מ $p>1$.

**מבחן LCT**: אם $a_n, b_n > 0$ ו-$\\lim \\frac{a_n}{b_n} = L \\in (0,\\infty)$, אז הטורים מתכנסים יחד או מתבדרים יחד.

**מבחן ד'אלמבר (מנה)**: $L = \\lim\\left|\\frac{a_{n+1}}{a_n}\\right|$ — מתכנס אם $L<1$, מתבדר אם $L>1$, לא קובע אם $L=1$.

**מבחן קושי (שורש)**: $L = \\limsup |a_n|^{1/n}$ — מתכנס אם $L<1$, מתבדר אם $L>1$.

**מבחן לייבניץ**: $\\sum(-1)^n a_n$ מתכנס אם (1) $a_n \\geq 0$, (2) $a_n$ יורדת מונוטונית, (3) $a_n \\to 0$.

**רדיוס התכנסות**: $R = \\frac{1}{\\limsup |a_n|^{1/n}}$ (נוסחת קושי-אדמר).

**טיילור/מקלורן המרכזיים**:
- $e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!}$
- $\\sin x = \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{(2n+1)!}$
- $\\cos x = \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n}}{(2n)!}$
- $\\ln(1+x) = \\sum_{n=1}^\\infty \\frac{(-1)^{n+1} x^n}{n}$, $x \\in (-1,1]$
- $\\frac{1}{1-x} = \\sum_{n=0}^\\infty x^n$, $|x|<1$`;

  cachedPrompt = prompt;
  return prompt;
}
