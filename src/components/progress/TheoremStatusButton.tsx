"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Minus } from "lucide-react";
import { loadProgress, saveProgress, theoremKey, type TheoremStatus } from "@/lib/progress-store";

interface Props {
  week: number;
  sectionIdx: number;
}

export function TheoremStatusButton({ week, sectionIdx }: Props) {
  const key = theoremKey(week, sectionIdx);
  const [status, setStatus] = useState<TheoremStatus | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = loadProgress();
    setStatus(data.theorems[key]);
  }, [key]);

  if (!mounted) return null;

  function toggle(next: TheoremStatus) {
    const data = loadProgress();
    if (data.theorems[key] === next) {
      delete data.theorems[key];
      saveProgress(data);
      setStatus(undefined);
    } else {
      data.theorems[key] = next;
      saveProgress(data);
      setStatus(next);
    }
    // Notify dashboard widgets on same page
    window.dispatchEvent(new Event("progress-updated"));
  }

  return (
    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
      <button
        title="יודעת את זה"
        onClick={() => toggle("known")}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
        style={{
          background: status === "known" ? "var(--green-mid)" : "var(--bg-subtle)",
          color: status === "known" ? "#fff" : "var(--text-muted)",
          border: `1px solid ${status === "known" ? "var(--green)" : "var(--border)"}`,
        }}
      >
        <Check className="h-3 w-3" />
        {status === "known" ? "יודעת" : "יודעת"}
      </button>

      <button
        title="צריך לחזור"
        onClick={() => toggle("review")}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black transition-all"
        style={{
          background: status === "review" ? "var(--amber-mid)" : "var(--bg-subtle)",
          color: status === "review" ? "#fff" : "var(--text-muted)",
          border: `1px solid ${status === "review" ? "var(--amber)" : "var(--border)"}`,
        }}
      >
        <RotateCcw className="h-3 w-3" />
        לחזור
      </button>

      {status && (
        <button
          title="מחק סימון"
          onClick={() => toggle(status)}
          className="rounded-full p-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          <Minus className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
