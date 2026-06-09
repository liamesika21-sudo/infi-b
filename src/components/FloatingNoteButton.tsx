"use client";

import { useState, useEffect, useRef } from "react";
import { BookmarkPlus, X, Check, PenLine } from "lucide-react";
import type { NotebookEntry } from "@/lib/notebook";

const WEEK_OPTIONS = [
  { value: 0,  label: "כללי" },
  { value: 1,  label: "שבוע 1" },
  { value: 2,  label: "שבוע 2" },
  { value: 3,  label: "שבוע 3" },
  { value: 4,  label: "שבוע 4" },
  { value: 5,  label: "שבוע 5" },
  { value: 6,  label: "שבוע 6" },
  { value: 7,  label: "שבוע 7" },
  { value: 8,  label: "שבוע 8" },
  { value: 9,  label: "שבוע 9" },
  { value: 10, label: "שבוע 10" },
  { value: 11, label: "שבוע 11" },
  { value: 12, label: "שבוע 12" },
  { value: 13, label: "שבוע 13" },
];

export function FloatingNoteButton() {
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reset form when opened
  function handleOpen() {
    setState("idle");
    setOpen(true);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          weekNumber: week,
          title: title.trim() || undefined,
          content: content.trim(),
          source: "הוספה ידנית",
        }),
      });
      if (res.ok) {
        setState("saved");
        setTimeout(() => {
          setOpen(false);
          setTitle("");
          setContent("");
          setState("idle");
        }, 1400);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 left-6 z-40 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition hover:scale-105 hover:opacity-90"
        style={{
          background: "var(--navy-mid)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(6,20,38,0.35)",
        }}
        title="הוסף הערה למחברת"
        aria-label="הוסף הערה למחברת"
      >
        <PenLine className="h-5 w-5" />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-start p-6 sm:items-center sm:justify-start"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
        >
          <div
            ref={panelRef}
            dir="rtl"
            className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl"
            style={{ borderColor: "var(--border)" }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4" style={{ color: "var(--navy-mid)" }} />
                <h3 className="font-black">הוסף למחברת</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 transition hover:bg-gray-100"
              >
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Week */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                שבוע
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setWeek(opt.value)}
                    className="rounded-full px-3 py-1 text-xs font-bold transition"
                    style={
                      week === opt.value
                        ? { background: "var(--navy-mid)", color: "#fff" }
                        : { background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                כותרת (אופציונלי)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="כותרת קצרה..."
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                הערה *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="הדבק או כתוב כאן..."
                rows={4}
                autoFocus
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={state !== "idle" || !content.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition hover:opacity-80 disabled:opacity-40"
              style={{ background: "var(--navy-mid)", color: "#fff" }}
            >
              {state === "saving" ? (
                "שומר..."
              ) : state === "saved" ? (
                <>
                  <Check className="h-4 w-4" />
                  נשמר!
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                  שמור למחברת
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
