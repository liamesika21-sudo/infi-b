import type { Calculus2Course } from "./types";

export const calculus2Course: Calculus2Course = {
  courseId: "calculus2",
  nameHe: "אינפי ב׳",
  nameEn: "Calculus 2",
  mode: "moed-a-exam-prep",
  targetScoreLabel: "90+",
  totalWeeks: 13,
  availableWeeks: 10,
  sourceRoot: "docs",
};

export const moduleRoutes = [
  { href: "/dashboard", label: "דשבורד", description: "מצב חומרים, מוכנות ופעולה הבאה" },
  { href: "/weeks", label: "מפת שבועות", description: "13 שבועות עם היסט הרצאה-תרגול" },
  { href: "/topics", label: "נושאים", description: "מבנה topic-first להכנה למבחן" },
  { href: "/formulas", label: "נוסחאות", description: "תנאים, שימושים וטעויות נפוצות" },
  { href: "/theorems", label: "משפטים", description: "ניסוח, הנחות, מסקנה והוכחה" },
  { href: "/proof-patterns", label: "תבניות הוכחה", description: "דפוסים שחוזרים במבחנים" },
  { href: "/practice", label: "תרגול", description: "שאלות לפי נושא, קושי וחשיבות" },
  { href: "/past-exams", label: "מבחני עבר", description: "תדירויות, דפוסים וסדר פתרון" },
  { href: "/homework-review", label: "חזרת מטלות", description: "שאלות מטלה שקרובות למבחן" },
  { href: "/quick-review", label: "חזרה מהירה", description: "רגע לפני מבחן: נוסחאות ומשפטים" },
  { href: "/progress", label: "מעקב שליטה", description: "סטטוסים וחזרה מרווחת" },
  { href: "/mentor", label: "מנטור", description: "תשתית מנטור קורס-מודע" },
  { href: "/instructor-notes", label: "הערות מקס", description: "תובנות מהתמלולים, דוגמאות נגדיות, קריטי למבחן" },
] as const;
