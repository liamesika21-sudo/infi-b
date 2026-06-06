import type { Metadata } from "next";
import { HomeworkSolutionsClient } from "@/components/HomeworkSolutionsClient";
import { homeworkStudyPages } from "@/lib/calculus2/homework-study-pages";

export const metadata: Metadata = {
  title: "ניתוח מטלות ופתרונות מלאים | Mentora",
  description: "דפי ניתוח מטלות אינפי ב׳ עם תבניות, אינטואיציות ופתרונות רשמיים מסודרים לפי שבועות.",
};

export default function HomeworkSolutionsPage() {
  return <HomeworkSolutionsClient pages={homeworkStudyPages} />;
}
