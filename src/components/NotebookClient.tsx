"use client";

import { useState, useCallback, useMemo } from "react";
import { BookOpen, Plus, Trash2, X, BookMarked, StickyNote } from "lucide-react";
import type { NotebookEntry } from "@/lib/notebook";

const WEEK_LABELS: Record<number, string> = {
  0:  "כללי",
  1:  "שבוע 1",
  2:  "שבוע 2",
  3:  "שבוע 3",
  4:  "שבוע 4",
  5:  "שבוע 5",
  6:  "שבוע 6",
  7:  "שבוע 7",
  8:  "שבוע 8",
  9:  "שבוע 9",
  10: "שבוע 10",
  11: "שבוע 11",
  12: "שבוע 12",
  13: "שבוע 13",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso)
  );
}

export function NotebookClient({ initialEntries }: { initialEntries: NotebookEntry[] }) {
  const [entries, setEntries] = useState<NotebookEntry[]>(initialEntries);
  const [activeWeek, setActiveWeek] = useState<number | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addWeek, setAddWeek] = useState(0);
  const [addTitle, setAddTitle] = useState("");
  const [addContent, setAddContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // weeks that have at least one entry
  const weeksWithEntries = useMemo(() => {
    const set = new Set(entries.map((e) => e.weekNumber));
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter((w) => set.has(w));
  }, [entries]);

  const visibleEntries = useMemo(() => {
    if (activeWeek === "all") return entries;
    return entries.filter((e) => e.weekNumber === activeWeek);
  }, [entries, activeWeek]);

  // Group by week for "all" view
  const grouped = useMemo(() => {
    const map = new Map<number, NotebookEntry[]>();
    for (const e of visibleEntries) {
      const list = map.get(e.weekNumber) ?? [];
      list.push(e);
      map.set(e.weekNumber, list);
    }
    return map;
  }, [visibleEntries]);

  const weekOrder = useMemo(() => {
    return Array.from(grouped.keys()).sort((a, b) => a - b);
  }, [grouped]);

  const handleAdd = useCallback(async () => {
    if (!addContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          weekNumber: addWeek,
          title: addTitle.trim() || undefined,
          content: addContent.trim(),
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { ok: boolean; entry?: NotebookEntry };
      if (data.ok && data.entry) {
        setEntries((prev) => [data.entry!, ...prev]);
        setAddContent("");
        setAddTitle("");
        setShowAddForm(false);
      }
    } finally {
      setSaving(false);
    }
  }, [addContent, addTitle, addWeek]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/notebook?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--navy-light)", color: "var(--navy-mid)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              My Notebook
            </p>
            <h1 className="text-3xl font-black" style={{ letterSpacing: "-0.03em" }}>
              המחברת שלי
            </h1>
          </div>
          <div className="mr-auto">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition hover:opacity-80"
              style={{ background: "var(--navy-mid)", color: "#fff" }}
            >
              <Plus className="h-4 w-4" />
              הוסף הערה
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          {entries.length === 0
            ? "עדיין אין הערות. לחץ על הכפתורים שמופיעים על כרטיסים ברחבי האתר כדי להוסיף."
            : `${entries.length} הערות שמורות`}
        </p>
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl"
            style={{ borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">הוסף הערה חדשה</h2>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-1 transition hover:bg-gray-100"
              >
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Week select */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                שבוע
              </label>
              <select
                value={addWeek}
                onChange={(e) => setAddWeek(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm font-bold outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                {Object.entries(WEEK_LABELS).map(([num, label]) => (
                  <option key={num} value={num}>{label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                כותרת (אופציונלי)
              </label>
              <input
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="למשל: נוסחה חשובה"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Content */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                תוכן ההערה *
              </label>
              <textarea
                value={addContent}
                onChange={(e) => setAddContent(e.target.value)}
                placeholder="כתוב כאן..."
                rows={5}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !addContent.trim()}
              className="w-full rounded-xl py-3 text-sm font-black transition hover:opacity-80 disabled:opacity-40"
              style={{ background: "var(--navy-mid)", color: "#fff" }}
            >
              {saving ? "שומר..." : "שמור הערה"}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <BookOpen className="mx-auto h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-bold" style={{ color: "var(--text-secondary)" }}>
            המחברת ריקה
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            לחץ על כפתור "שמור למחברת" על כרטיסים ברחבי האתר
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Week filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveWeek("all")}
              className="rounded-full px-4 py-1.5 text-xs font-bold transition"
              style={
                activeWeek === "all"
                  ? { background: "var(--navy-mid)", color: "#fff" }
                  : { background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }
            >
              הכל ({entries.length})
            </button>
            {weeksWithEntries.map((w) => {
              const isActive = activeWeek === w;
              const count = entries.filter((e) => e.weekNumber === w).length;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveWeek(w)}
                  className="rounded-full px-4 py-1.5 text-xs font-bold transition"
                  style={
                    isActive
                      ? { background: "var(--navy-mid)", color: "#fff" }
                      : { background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                  }
                >
                  {WEEK_LABELS[w]} ({count})
                </button>
              );
            })}
          </div>

          {/* Entries grouped by week */}
          {weekOrder.map((weekNum) => {
            const weekEntries = grouped.get(weekNum) ?? [];
            return (
              <section key={weekNum}>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-px flex-1"
                    style={{ background: "var(--border)" }}
                  />
                  <h2
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                    style={{ background: "var(--navy-light)", color: "var(--navy-mid)" }}
                  >
                    {WEEK_LABELS[weekNum]}
                  </h2>
                  <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {weekEntries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EntryCard({
  entry,
  onDelete,
  deletingId,
}: {
  entry: NotebookEntry;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const isDeleting = deletingId === entry.id;

  return (
    <div
      className="group relative flex flex-col rounded-2xl border p-4 transition hover:shadow-md"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Type badge + delete */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {entry.type === "card" ? (
            <BookMarked className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--navy-mid)" }} />
          ) : (
            <StickyNote className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--teal)" }} />
          )}
          <span
            className="text-[10px] font-black uppercase tracking-wide"
            style={{ color: entry.type === "card" ? "var(--navy-mid)" : "var(--teal)" }}
          >
            {entry.type === "card" ? "כרטיס" : "הערה"}
          </span>
          {entry.source && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              {entry.source}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          disabled={isDeleting}
          className="shrink-0 rounded-lg p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 disabled:opacity-50"
          title="מחק"
        >
          <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--red-mid)" }} />
        </button>
      </div>

      {/* Title */}
      {entry.title && (
        <p className="mb-1.5 font-black text-sm" style={{ color: "var(--text-primary)" }}>
          {entry.title}
        </p>
      )}

      {/* Content */}
      <p
        className="flex-1 whitespace-pre-wrap text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {entry.content}
      </p>

      {/* Date */}
      <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
        {formatDate(entry.createdAt)}
      </p>
    </div>
  );
}
