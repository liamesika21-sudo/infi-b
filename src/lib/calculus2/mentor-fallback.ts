import { readFile } from "fs/promises";
import path from "path";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type WeekSummary = {
  week: number;
  title: string;
  message: string;
};

type KnowledgeItem = {
  name: string;
  content: string;
};

type WeekData = {
  week: number;
  title: string;
  definitions?: KnowledgeItem[];
  theorems?: KnowledgeItem[];
  formulas?: string[];
  examNotes?: string[];
};

type BattlePlanBlock = {
  title: string;
  weekData?: WeekData[];
};

type LectureKnowledgeItem = {
  kind: "definition" | "theorem" | "corollary" | "lemma" | "note" | "example" | "exercise";
  label: string;
  number: string | null;
  name: string;
  statement_he: string;
  proof_he: string | null;
  topic: string;
};

type LectureKnowledge = {
  lecture: number;
  week: number;
  topics?: string[];
  items?: LectureKnowledgeItem[];
};

type Candidate = {
  title: string;
  text: string;
  score: number;
};

const COURSE_TERMS = [
  "גבול",
  "גבולות",
  "סדרה",
  "סדרות",
  "נגזרת",
  "נגזרות",
  "רציפות",
  "אינטגרל",
  "אינטגרלים",
  "טור",
  "טורים",
  "התכנסות",
  "התבדרות",
  "לופיטל",
  "דרבו",
  "לייבניץ",
  "דאלמבר",
  "מנה",
  "שורש",
  "קושי",
  "השוואה",
  "טיילור",
  "מקלורן",
  "רדיוס",
  "חזקה",
  "חזקות",
  "הוכחה",
  "משפט",
  "הגדרה",
  "שיעורי",
  "בית",
  "תרגיל",
  "בחינה",
];

const QUICK_FACTS: Array<{ terms: string[]; answer: string }> = [
  {
    terms: ["דאלמבר", "d alembert", "מנה"],
    answer:
      "**מבחן ד'אלמבר (מבחן המנה)**\nלטור $\\sum a_n$ מחשבים\n$$L=\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|.$$\nאם $L<1$ הטור מתכנס בהחלט. אם $L>1$ או $L=\\infty$ הטור מתבדר. אם $L=1$ המבחן לא קובע.\n\nמשתמשים בו בעיקר כשיש עצרות, חזקות שתלויות ב-$n$, או מכפלות שמצטמצמות יפה בין $a_{n+1}$ ל-$a_n$.",
  },
  {
    terms: ["שורש", "קושי"],
    answer:
      "**מבחן קושי (מבחן השורש)**\nלטור $\\sum a_n$ מחשבים\n$$L=\\limsup_{n\\to\\infty}\\sqrt[n]{|a_n|}.$$\nאם $L<1$ יש התכנסות בהחלט, אם $L>1$ יש התבדרות, ואם $L=1$ המבחן לא קובע.\n\nהוא נוח במיוחד כשיש ביטויים מהצורה $(\\cdots)^n$.",
  },
  {
    terms: ["לייבניץ", "מתחלף", "מתחלפים"],
    answer:
      "**מבחן לייבניץ לטור מתחלף**\nאם $a_n\\ge 0$, הסדרה $a_n$ יורדת מונוטונית, ו-$a_n\\to 0$, אז הטור\n$$\\sum (-1)^n a_n$$\nמתכנס. חשוב: המבחן נותן התכנסות של הטור המתחלף, לא בהכרח התכנסות מוחלטת.",
  },
  {
    terms: ["רדיוס", "חזקות"],
    answer:
      "**רדיוס התכנסות של טור חזקות**\nלטור $\\sum a_n(x-c)^n$ משתמשים בדרך כלל במנה או בשורש על המקדמים:\n$$R=\\frac{1}{\\limsup\\sqrt[n]{|a_n|}}.$$\nאחרי שמוצאים $R$, בודקים ידנית את שתי נקודות הקצה $x=c-R$ ו-$x=c+R$.",
  },
  {
    terms: ["לופיטל"],
    answer:
      "**כלל לופיטל**\nמותר להשתמש בו רק בצורות $0/0$ או $\\infty/\\infty$ ולאחר שמוודאים שהתנאים מתקיימים. אז אם הגבול\n$$\\lim_{x\\to a}\\frac{f'(x)}{g'(x)}$$\nקיים, מקבלים\n$$\\lim_{x\\to a}\\frac{f(x)}{g(x)}=\\lim_{x\\to a}\\frac{f'(x)}{g'(x)}.$$\nבצורות כמו $0\\cdot\\infty$ או $\\infty-\\infty$ קודם משנים צורה לשבר.",
  },
  {
    terms: ["דרבו"],
    answer:
      "**משפט דרבו**\nאם $f$ גזירה על $[a,b]$, אז $f'$ מקיימת את תכונת ערך הביניים: לכל ערך $c$ בין $f'(a)$ ל-$f'(b)$ קיים $\\xi\\in(a,b)$ כך ש-$f'(\\xi)=c$.\n\nהנקודה החשובה לבחינה: נגזרת לא חייבת להיות רציפה, אבל עדיין לא יכולה לעשות קפיצה.",
  },
];

let cachedWeeks: WeekSummary[] | null = null;
let cachedBattlePlan: BattlePlanBlock[] | null = null;
let cachedLectures: LectureKnowledge[] | null = null;

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data/generated/calculus2", filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function getWeeks(): Promise<WeekSummary[]> {
  cachedWeeks ??= await readJson<WeekSummary[]>("week-chat-summaries.json", []);
  return cachedWeeks;
}

async function getBattlePlan(): Promise<BattlePlanBlock[]> {
  cachedBattlePlan ??= await readJson<BattlePlanBlock[]>("battle-plan-data.json", []);
  return cachedBattlePlan;
}

async function getLectures(): Promise<LectureKnowledge[]> {
  cachedLectures ??= await readJson<LectureKnowledge[]>("lecture-knowledge.json", []);
  return cachedLectures;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0591-\u05c7]/g, "")
    .replace(/[״"]/g, "")
    .replace(/[׳']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termsFor(text: string): string[] {
  const normalized = normalize(text);
  return Array.from(new Set(normalized.split(" ").filter((term) => term.length > 1)));
}

function scoreText(text: string, terms: string[]): number {
  const haystack = normalize(text);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function hasCourseContext(question: string): boolean {
  const normalized = normalize(question);
  return COURSE_TERMS.some((term) => normalized.includes(normalize(term)));
}

function extractNumberAfter(question: string, labels: string[]): number | null {
  for (const label of labels) {
    const match = question.match(new RegExp(`${label}\\s*(\\d+)`, "i"));
    if (match) return Number(match[1]);
  }
  return null;
}

function stripFallbackNoise(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function truncate(text: string, maxLength: number): string {
  const clean = stripFallbackNoise(text);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength);
  const lastSentence = Math.max(sliced.lastIndexOf("."), sliced.lastIndexOf("\n"));
  return `${sliced.slice(0, lastSentence > 120 ? lastSentence : maxLength).trim()}...`;
}

function exactLectureAnswer(question: string, lectures: LectureKnowledge[]): string | null {
  const lectureNumber = extractNumberAfter(question, ["הרצאה", "lecture"]);
  if (!lectureNumber) return null;

  const normalized = normalize(question);
  const requestedKind = normalized.includes("משפט")
    ? "theorem"
    : normalized.includes("הגדרה")
      ? "definition"
      : normalized.includes("דוגמה")
        ? "example"
        : null;
  const itemNumber = extractNumberAfter(question, ["משפט", "הגדרה", "דוגמה", "example", "theorem", "definition"]);

  const lecture = lectures.find((entry) => entry.lecture === lectureNumber);
  if (!lecture) return `אין לי במאגר המקומי את הרצאה ${lectureNumber}.`;

  let items = lecture.items ?? [];
  if (requestedKind) {
    items = items.filter((item) => item.kind === requestedKind);
  }
  if (itemNumber) {
    items = items.filter((item) => item.number === String(itemNumber) || item.label.includes(String(itemNumber)));
  }

  const item = items[0];
  if (!item) {
    const available = (lecture.items ?? [])
      .filter((entry) => !requestedKind || entry.kind === requestedKind)
      .slice(0, 6)
      .map((entry) => entry.label)
      .join(", ");
    return `אין לי את הפריט המבוקש בהרצאה ${lectureNumber}. הפריטים שכן מופיעים אצלי: ${available || "אין פריטים מתאימים"}.`;
  }

  const proof = normalized.includes("הוכח") || normalized.includes("הוכחה")
    ? item.proof_he
    : null;

  return [
    `**${item.label}${item.name ? ` — ${item.name}` : ""}**`,
    item.statement_he,
    proof ? `\n**הוכחה:**\n${proof}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function weekSummaryAnswer(question: string, weeks: WeekSummary[]): string | null {
  const weekNumber = extractNumberAfter(question, ["שבוע", "week"]);
  if (!weekNumber) return null;

  const week = weeks.find((entry) => entry.week === weekNumber);
  if (!week) return null;

  return week.message;
}

function quickFactAnswer(question: string): string | null {
  const normalized = normalize(question);
  const scored = QUICK_FACTS.map((fact) => ({
    answer: fact.answer,
    score: fact.terms.reduce((total, term) => total + (normalized.includes(normalize(term)) ? 1 : 0), 0),
  }))
    .filter((fact) => fact.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.answer ?? null;
}

function buildCandidates(question: string, battlePlan: BattlePlanBlock[], lectures: LectureKnowledge[]): Candidate[] {
  const terms = termsFor(question);
  const candidates: Candidate[] = [];

  for (const block of battlePlan) {
    for (const week of block.weekData ?? []) {
      for (const definition of week.definitions ?? []) {
        const text = `${definition.name}\n${definition.content}`;
        candidates.push({
          title: `הגדרה: ${definition.name}`,
          text: definition.content,
          score: scoreText(`${week.title} ${text}`, terms),
        });
      }
      for (const theorem of week.theorems ?? []) {
        const text = `${theorem.name}\n${theorem.content}`;
        candidates.push({
          title: `משפט: ${theorem.name}`,
          text: theorem.content,
          score: scoreText(`${week.title} ${text}`, terms),
        });
      }
      if (week.formulas?.length) {
        const text = week.formulas.join("\n");
        candidates.push({
          title: `נוסחאות: ${week.title}`,
          text,
          score: scoreText(`${week.title} ${text}`, terms),
        });
      }
      if (week.examNotes?.length) {
        const text = week.examNotes.join("\n");
        candidates.push({
          title: `דגשי בחינה: ${week.title}`,
          text,
          score: scoreText(`${week.title} ${text}`, terms),
        });
      }
    }
  }

  for (const lecture of lectures) {
    for (const item of lecture.items ?? []) {
      if (!["definition", "theorem", "corollary", "lemma", "example"].includes(item.kind)) continue;
      const text = `${item.label} ${item.name}\n${item.statement_he}`;
      candidates.push({
        title: `הרצאה ${lecture.lecture}: ${item.label}${item.name ? ` — ${item.name}` : ""}`,
        text: item.statement_he,
        score: scoreText(`${lecture.topics?.join(" ") ?? ""} ${text}`, terms),
      });
    }
  }

  return candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function buildMentorFallbackResponse(messages: Message[]): Promise<string> {
  const question = messages[messages.length - 1]?.content ?? "";
  const [weeks, battlePlan, lectures] = await Promise.all([
    getWeeks(),
    getBattlePlan(),
    getLectures(),
  ]);

  const exactAnswer = exactLectureAnswer(question, lectures);
  const weekAnswer = weekSummaryAnswer(question, weeks);
  const quickAnswer = quickFactAnswer(question);
  const candidates = buildCandidates(question, battlePlan, lectures);

  const intro = "כרגע ספק ה-AI החיצוני לא זמין, אז אני עונה במצב גיבוי מתוך חומר הקורס המקומי.";

  if (exactAnswer) {
    return `${intro}\n\n${exactAnswer}`;
  }

  if (weekAnswer) {
    return `${intro}\n\n${weekAnswer}`;
  }

  if (quickAnswer) {
    return `${intro}\n\n${quickAnswer}`;
  }

  if (!hasCourseContext(question) && candidates.length === 0) {
    return `${intro}\n\nזה לא נראה כמו נושא מתוך אינפי ב׳. אפשר לשאול על גבולות, סדרות, אינטגרלים, טורים, טורי חזקות, טיילור/מקלורן, או שאלה משיעורי הבית.`;
  }

  if (candidates.length === 0) {
    return `${intro}\n\nלא מצאתי התאמה מספיק טובה במאגר המקומי. נסה לנסח עם שם הנושא, מספר שבוע/הרצאה, או מספר שאלה משיעורי הבית.`;
  }

  const blocks = candidates.map((candidate) => (
    `**${candidate.title}**\n${truncate(candidate.text, 700)}`
  ));

  return stripFallbackNoise(`${intro}\n\n${blocks.join("\n\n")}\n\nאם תרצה, שלח את התרגיל עצמו ואכוון לפי הצעד הראשון.`);
}
