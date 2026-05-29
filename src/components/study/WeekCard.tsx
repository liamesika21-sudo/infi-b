import Link from "next/link";
import { BookOpen, CheckCircle, ChevronLeft, FileText, XCircle } from "lucide-react";
import type { CourseWeek } from "@/lib/calculus2/types";

export function WeekCard({ week }: { week: CourseWeek }) {
  const hasLecture = week.materialStatus.lecture === "available";
  const hasRecitation = week.materialStatus.recitation !== "missing";
  const hasHomework = week.materialStatus.homework === "available";
  const hasSummary = week.materialStatus.summary === "available";

  const availableCount = [hasLecture, hasRecitation, hasHomework, hasSummary].filter(Boolean).length;

  const borderColor =
    availableCount === 4
      ? "var(--green-border)"
      : availableCount >= 2
        ? "var(--navy-border)"
        : "var(--border)";

  return (
    <Link href={`/weeks/${week.weekNumber}`}>
      <article
        className="group rounded-xl border bg-white shadow-sm transition hover:shadow-md cursor-pointer overflow-hidden"
        style={{ borderColor }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "var(--navy)" }}
            >
              {week.weekNumber}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              שבוע {week.weekNumber}
            </span>
          </div>
          <ChevronLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        <div className="p-4">
          {/* Material status grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <MaterialStatus label="הרצאה" available={hasLecture} />
            <MaterialStatus label="תרגול" available={hasRecitation} />
            <MaterialStatus label="מטלה" available={hasHomework} />
            <MaterialStatus label="סיכום" available={hasSummary} />
          </div>

          {/* Topics */}
          {week.topicCoverage.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {week.topicCoverage.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Lecture/recitation info */}
          <div
            className="mt-3 flex items-center gap-3 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              הרצאה {week.lectureNumber}
            </span>
            {week.practicedLectureNumber && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                תרגול הרצאה {week.practicedLectureNumber}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function MaterialStatus({ label, available }: { label: string; available: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{ background: available ? "var(--green-light)" : "var(--red-light)" }}
    >
      {available ? (
        <CheckCircle className="h-3 w-3 shrink-0" style={{ color: "var(--green)" }} />
      ) : (
        <XCircle className="h-3 w-3 shrink-0" style={{ color: "var(--red)" }} />
      )}
      <span
        className="text-xs"
        style={{ color: available ? "var(--green)" : "var(--red)" }}
      >
        {label}
      </span>
    </div>
  );
}
