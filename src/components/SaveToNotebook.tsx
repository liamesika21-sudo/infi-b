"use client";

import { useState, useRef, useEffect } from "react";
import { BookmarkPlus, Check, ChevronDown } from "lucide-react";

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

type Props = {
  title?: string;
  content: string;
  source?: string;
  /** When provided, saves directly to that week without a picker. */
  weekNumber?: number;
};

export function SaveToNotebook({ title, content, source, weekNumber }: Props) {
  const [state, setState] = useState<"idle" | "picking" | "saving" | "saved">("idle");
  const [selectedWeek, setSelectedWeek] = useState<number>(weekNumber ?? 0);
  const ref = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (state !== "picking") return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setState("idle");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [state]);

  async function save(week: number) {
    setState("saving");
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "card", weekNumber: week, title, content, source }),
      });
      if (res.ok) {
        setState("saved");
        setTimeout(() => setState("idle"), 2000);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  function handleClick() {
    if (state === "saved") return;
    if (weekNumber !== undefined) {
      // Week known — save directly
      void save(weekNumber);
    } else {
      // Show week picker
      setState((s) => (s === "picking" ? "idle" : "picking"));
    }
  }

  if (state === "saved") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black"
        style={{ background: "var(--green-light)", color: "var(--green)", border: "1px solid var(--green-border)" }}
      >
        <Check className="h-3 w-3" />
        נשמר!
      </span>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "saving"}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black transition hover:opacity-80 disabled:opacity-50"
        style={{
          background: "var(--navy-light)",
          color: "var(--navy-mid)",
          border: "1px solid var(--navy-border)",
        }}
        title="שמור למחברת"
      >
        <BookmarkPlus className="h-3 w-3" />
        {state === "saving" ? "שומר..." : "שמור למחברת"}
        {weekNumber === undefined && <ChevronDown className="h-2.5 w-2.5 opacity-60" />}
      </button>

      {/* Week picker dropdown */}
      {state === "picking" && (
        <div
          className="absolute top-full mt-1 z-50 w-36 rounded-xl border bg-white py-1 shadow-lg"
          style={{ borderColor: "var(--border)", right: 0 }}
        >
          <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            שמור לשבוע:
          </p>
          <div className="max-h-52 overflow-y-auto">
            {WEEK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedWeek(opt.value);
                  void save(opt.value);
                }}
                className="w-full px-3 py-1.5 text-right text-xs font-semibold transition hover:bg-[var(--bg-subtle)]"
                style={{ color: "var(--text-primary)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
