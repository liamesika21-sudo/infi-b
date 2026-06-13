import { readFile } from "fs/promises";
import path from "path";

let cachedPrompt: string | null = null; // bump to invalidate: v2

interface HomeworkQuestion {
  questionNumber: string;
  content: string;
}

interface HomeworkAssignment {
  homeworkNumber: number;
  weekNumber: number;
  questions: HomeworkQuestion[];
}

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

interface LectureKnowledgeItem {
  kind: "definition" | "theorem" | "corollary" | "lemma" | "note" | "example" | "exercise";
  label: string;
  number: string | null;
  name: string;
  statement_he: string;
  proof_he: string | null;
  topic: string;
}

interface LectureKnowledge {
  lecture: number;
  week: number;
  date: string | null;
  topics: string[];
  items: LectureKnowledgeItem[];
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

async function readHomeworkData(): Promise<HomeworkAssignment[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data/generated/calculus2/homework-analysis.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as Record<string, HomeworkAssignment>;
    return Object.values(parsed).sort((a, b) => a.homeworkNumber - b.homeworkNumber);
  } catch {
    return [];
  }
}

function buildHomeworkBlock(homeworks: HomeworkAssignment[]): string {
  if (!homeworks.length) return "";
  const lines: string[] = [];
  for (const hw of homeworks) {
    lines.push(`### שיעורי בית ${hw.homeworkNumber} (שבוע ${hw.weekNumber})`);
    for (const q of hw.questions) {
      // "2025" is a misread of the year — it's actually question 1
      const qNum = q.questionNumber === "2025" ? "1" : q.questionNumber;
      lines.push(`\n**שאלה ${qNum}:**\n${q.content.trim()}`);
    }
    lines.push("\n---");
  }
  return lines.join("\n");
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

async function readLectureKnowledge(): Promise<LectureKnowledge[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data/generated/calculus2/lecture-knowledge.json"),
      "utf8"
    );
    return JSON.parse(raw) as LectureKnowledge[];
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

function buildLectureBlock(lectures: LectureKnowledge[]): string {
  if (!lectures.length) return "(לא נטענו משפטי ההרצאות)";
  return lectures
    .map((lec) => {
      const head = `### הרצאה ${lec.lecture}${lec.date ? ` (${lec.date})` : ""}${lec.topics?.length ? ` — ${lec.topics.join(", ")}` : ""}`;
      const lines: string[] = [head];
      // Only definitions, theorems, corollaries, lemmas — the numbered index the mentor must cite exactly.
      for (const it of lec.items) {
        if (!["definition", "theorem", "corollary", "lemma"].includes(it.kind)) continue;
        const stmt = it.statement_he.replace(/\s*\n\s*/g, " ").trim();
        lines.push(`**${it.label}${it.name ? ` — ${it.name}` : ""}:** ${stmt}`);
      }
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

  const [insights, lectures, battlePlan, homeworks] = await Promise.all([
    readMaxInsights(),
    readLectureKnowledge(),
    readBattlePlanData(),
    readHomeworkData(),
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
  const homeworkBlock = buildHomeworkBlock(homeworks);

  const prompt = `אתה "מנטור אינפי ב׳" — עוזר לימוד לקורס חדוון 2 של אוניברסיטת רייכמן, מועד א׳ 2026.

## האישיות שלך

אתה משתמש בחומר הרשמי של ההרצאות ובתובנות מהתרגולים, אבל מדבר כעוזר אחד רציף וטבעי.
אל תציג את עצמך בשם מרצה או מתרגל, ואל תחלק את התשובה לדמויות.

## כללים מחייבים

1. **חומר בלבד** — ענה אך ורק על שאלות הקשורות לחומר קורס זה: גבולות, סדרות, אינטגרלים (מסוים, לא-אמיתי), טורים, טורי חזקות, טיילור/מקלורן, וכן שאלות ספציפיות משיעורי הבית (1–7) ומהרצאות הקורס. אם שואלים על נושא אחר — השב: "זה לא בחומר הקורס, אוכל לעזור רק עם נושאי האינפי ב׳."
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
9. **מספרי משפטים/הגדרות — לפי האינדקס בלבד** — בסעיף "חומרי ההרצאה — משפטים והגדרות לפי מספור מדויק" למטה יש את המשפטים וההגדרות הרשמיים של כל הרצאה, עם המספור המדויק (למשל "משפט 3" של הרצאה 1). כששואלים "מה אומר משפט 3 בהרצאה 1", "הגדרה X" וכד׳ — מצא את הפריט המתאים באינדקס וצטט את הניסוח שלו במדויק. **אסור להמציא או לנחש**: אם המספר המבוקש לא מופיע באינדקס עבור אותה הרצאה — אמור בכנות "אין לי את הפריט הממוספר הזה בהרצאה הזו" והצע את המשפטים שכן קיימים שם לפי שם/מספר. שים לב: מספור המשפטים מתאפס/מתחיל מחדש בכל הרצאה.

---

## בסיס הידע — הגדרות ומשפטים מלאים

אלו הניסוחים הרשמיים של הקורס. **כאשר נשאלת על אחד מהמשפטים הבאים — השתמש בניסוח המדויק הזה.**

${knowledgeBase}

---

## חומרי ההרצאה — משפטים והגדרות לפי מספור מדויק

זהו האינדקס הרשמי. כששואלים על "משפט N בהרצאה X" או "הגדרה" מהרצאה מסוימת — צטט מכאן במדויק. המספור מתחיל מחדש בכל הרצאה.

${lectureBlock}

---

## שיעורי בית — שאלות ופתרונות מלאים

כשמשתמש שואל על שאלה מסוימת (למשל "שאלה 3 בשיעורי בית 2" או "3א משיעורי בית 2"), מצא אותה כאן וענה על פי הפתרון המלא. אם שאלה מכילה חלקים (a), (b) וכד׳ — עזור לפי החלק שנשאלת עליו.

${homeworkBlock}

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
