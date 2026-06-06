"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Layers3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { HomeworkStudyPage } from "@/lib/calculus2/homework-study-pages";

export function HomeworkSolutionsClient({ pages }: { pages: HomeworkStudyPage[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? null,
    [pages, selectedSlug],
  );

  const pagesByWeek = useMemo(() => {
    return pages.reduce<Array<{ weekNumber: number; pages: HomeworkStudyPage[] }>>((groups, page) => {
      const group = groups.find((item) => item.weekNumber === page.weekNumber);
      if (group) {
        group.pages.push(page);
      } else {
        groups.push({ weekNumber: page.weekNumber, pages: [page] });
      }
      return groups;
    }, []);
  }, [pages]);

  function selectPage(slug: string) {
    setSelectedSlug(slug);
    window.setTimeout(() => {
      document.getElementById("homework-study-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <div className="space-y-6">
      <section className="border-b pb-5" style={{ borderColor: "var(--border)" }}>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Homework Analysis
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              ניתוח מטלות ופתרונות מלאים
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              קודם בוחרים מטלה לפי שבוע, ורק אחרי הבחירה נפתח דף הלמידה המלא עם תבניות, אינטואיציות ופתרונות רשמיים מסודרים.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <HeaderMetric label="מטלות" value={pages.length.toString()} />
            <HeaderMetric label="שבועות" value={`${pages[0]?.weekNumber ?? 0}-${pages.at(-1)?.weekNumber ?? 0}`} />
          </div>
        </div>
      </section>

      <section
        className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-4"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        aria-label="שלבי העבודה"
      >
        <FlowStep active={!selectedPage} icon={<Layers3 className="h-4 w-4" />} title="1. בחירת מטלה" text="כרטיסים לפי שבוע." />
        <FlowStep active={Boolean(selectedPage)} icon={<BookOpenCheck className="h-4 w-4" />} title="2. דף מלא" text="ניתוח ופתרונות." />
        <FlowStep active={Boolean(selectedPage)} icon={<CheckCircle2 className="h-4 w-4" />} title="3. תרגול ממוקד" text="כתיבה מחדש לפי התבניות." />
        <FlowStep active={Boolean(selectedPage)} icon={<Sparkles className="h-4 w-4" />} title="4. חזרה לפני מבחן" text="פתיחה מהירה לכל מטלה." />
      </section>

      {!selectedPage ? (
        <section className="space-y-5">
          {pagesByWeek.map((group) => (
            <div key={group.weekNumber} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black text-white"
                  style={{ background: "var(--navy)" }}
                >
                  {group.weekNumber}
                </span>
                <div>
                  <h2 className="text-lg font-black">שבוע {group.weekNumber}</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    בחרי את המטלה כדי לפתוח את דף הניתוח והפתרונות.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.pages.map((page) => (
                  <HomeworkCard key={page.slug} page={page} onSelect={() => selectPage(page.slug)} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section id="homework-study-viewer" className="space-y-4">
          <div
            className="rounded-2xl border p-4 shadow-sm"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, var(--navy-mid), var(--teal))" }}
                >
                  <span className="text-[10px] font-bold opacity-80">מטלה</span>
                  <span className="text-lg font-black">{selectedPage.homeworkNumber}</span>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: "var(--teal)" }}>
                    שבוע {selectedPage.weekNumber} · {selectedPage.sourceLabel}
                  </p>
                  <h2 className="text-2xl font-black">{selectedPage.title}</h2>
                  <p className="mt-1 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                    {selectedPage.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  בחירת מטלה אחרת
                </button>
                <a
                  href={`/api/homework-study/${selectedPage.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition"
                  style={{ background: "var(--navy)" }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  פתיחה בלשונית
                </a>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border shadow-sm"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <iframe
              title={`דף ניתוח ופתרונות - מטלה ${selectedPage.homeworkNumber}`}
              src={`/api/homework-study/${selectedPage.filename}`}
              className="h-[78vh] min-h-[720px] w-full"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function HomeworkCard({ page, onSelect }: { page: HomeworkStudyPage; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full min-h-56 flex-col rounded-2xl border p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--navy-mid), var(--teal))" }}
        >
          <span className="text-[10px] font-bold opacity-80">מטלה</span>
          <span className="text-lg font-black">{page.homeworkNumber}</span>
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold"
          style={{ background: "var(--teal-light)", borderColor: "var(--teal-border)", color: "var(--teal)" }}
        >
          שבוע {page.weekNumber}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-black leading-tight">{page.title}</h3>
        <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          {page.subtitle}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {page.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-md border px-2 py-1 text-[11px] font-bold"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <span className="inline-flex items-center gap-2 text-xs font-black" style={{ color: "var(--navy)" }}>
          <FileText className="h-4 w-4" />
          ניתוח + פתרונות מלאים
        </span>
        <span
          className="rounded-lg px-3 py-1.5 text-xs font-black text-white transition group-hover:bg-[var(--teal)]"
          style={{ background: "var(--navy)" }}
        >
          פתיחה
        </span>
      </div>
    </button>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg border px-4 py-2 text-center"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="text-xl font-black tabular-nums" style={{ color: "var(--navy)" }}>
        {value}
      </div>
      <div className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function FlowStep({
  active,
  icon,
  title,
  text,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2"
      style={{
        background: active ? "var(--teal-light)" : "var(--bg-subtle)",
        borderColor: active ? "var(--teal-border)" : "var(--border)",
        color: active ? "var(--teal)" : "var(--text-muted)",
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-black leading-5">{title}</span>
        <span className="block truncate text-[11px] font-semibold opacity-80">{text}</span>
      </span>
    </div>
  );
}
