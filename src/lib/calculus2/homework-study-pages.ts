export interface HomeworkStudyPage {
  slug: string;
  filename: string;
  homeworkNumber: number;
  weekNumber: number;
  title: string;
  subtitle: string;
  topics: string[];
  sourceLabel: string;
}

export const homeworkStudyPages: HomeworkStudyPage[] = [
  {
    slug: "homework-2",
    filename: "homework2_learning_page.html",
    homeworkNumber: 2,
    weekNumber: 2,
    title: "סדרות, גבולות והיינה",
    subtitle: "הגדרות פורמליות, מונוטוניות, חסימות, סופרימום/אינפימום וסדרות רקורסיביות.",
    topics: ["סדרות", "גבולות", "חסימות", "היינה"],
    sourceLabel: "Homework 2",
  },
  {
    slug: "homework-3",
    filename: "homework3_learning_page.html",
    homeworkNumber: 3,
    weekNumber: 3,
    title: "אינטגרלים ואנטי-נגזרות",
    subtitle: "חישובי אינטגרלים, אינטגרביליות, אנטי-נגזרות וכתיבת הוכחות נקייה.",
    topics: ["אינטגרלים", "אנטי-נגזרות", "אינטגרביליות"],
    sourceLabel: "Homework 3",
  },
  {
    slug: "homework-4",
    filename: "exercise4_learning_page.html",
    homeworkNumber: 4,
    weekNumber: 4,
    title: "טכניקות אינטגרציה",
    subtitle: "פיצול תחומים, סימטריה, חלקים, הצבה, חסימות וסכומי רימן.",
    topics: ["חלקים", "הצבה", "סכומי רימן", "סימטריה"],
    sourceLabel: "Homework 4",
  },
  {
    slug: "homework-5",
    filename: "exercise5_calculus2_study.html",
    homeworkNumber: 5,
    weekNumber: 5,
    title: "אינטגרלים לא אמיתיים",
    subtitle: "השוואות, משפטי ערך ביניים, התנהגות בקצוות ונוסחת ואליס.",
    topics: ["אינטגרלים לא אמיתיים", "השוואה", "ואליס"],
    sourceLabel: "Homework 5",
  },
  {
    slug: "homework-6",
    filename: "exercise6_calculus2_study.html",
    homeworkNumber: 6,
    weekNumber: 6,
    title: "טורים והתכנסות",
    subtitle: "טורים טלסקופיים, השוואות, זנבות, חסימות ומציאת טעויות.",
    topics: ["טורים", "התכנסות", "טלסקופיות", "השוואות"],
    sourceLabel: "Homework 6",
  },
  {
    slug: "homework-7",
    filename: "exercise7_calculus2_study.html",
    homeworkNumber: 7,
    weekNumber: 7,
    title: "מבחני התכנסות",
    subtitle: "מבחן האינטגרל, מבחן המנה/השורש, השוואות והסקת מסקנות למבחן.",
    topics: ["מבחני התכנסות", "מבחן האינטגרל", "טורי חזקות"],
    sourceLabel: "Homework 7",
  },
  {
    slug: "homework-8",
    filename: "exercise8_learning_page.html",
    homeworkNumber: 8,
    weekNumber: 8,
    title: "התכנסות בהחלט ובתנאי",
    subtitle: "לייבניץ, שינוי סדר, סוגריים, טורים חיוביים ושליליים וכתיבה מבחנית.",
    topics: ["לייבניץ", "בהחלט/בתנאי", "שינוי סדר", "טורים"],
    sourceLabel: "Homework 8",
  },
];

export const homeworkStudyPageFilenames = new Set(homeworkStudyPages.map((page) => page.filename));
