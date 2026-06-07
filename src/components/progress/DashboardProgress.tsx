"use client";

import { useEffect, useState } from "react";
import { loadProgress, computeStats, type ProgressStats } from "@/lib/progress-store";

export function DashboardProgress() {
  const [stats, setStats] = useState<ProgressStats | null>(null);

  useEffect(() => {
    function refresh() {
      const data = loadProgress();
      setStats(computeStats(data));
    }
    refresh();
    window.addEventListener("progress-updated", refresh);
    return () => window.removeEventListener("progress-updated", refresh);
  }, []);

  if (!stats) return null;
  if (stats.totalMarkedTheorems === 0 && stats.totalMarkedQuestions === 0) return null;

  const knownPct = stats.totalMarkedTheorems > 0
    ? Math.round((stats.knownCount / stats.totalMarkedTheorems) * 100)
    : 0;

  return (
    <section
      className="rounded-xl border p-5 mb-6"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-subtle)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
        מעקב אישי
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Known theorems */}
        <StatCard
          label="יודעת"
          value={stats.knownCount}
          sub="הגדרות ומשפטים"
          color="var(--green)"
          bg="var(--green-light)"
          border="var(--green-border)"
        />

        {/* Needs review */}
        <StatCard
          label="לחזור"
          value={stats.reviewCount}
          sub="הגדרות ומשפטים"
          color="var(--amber-mid)"
          bg="var(--amber-light)"
          border="var(--amber-border)"
        />

        {/* Done homework questions */}
        <StatCard
          label="שאלות"
          value={stats.doneCount}
          sub="מטלות שנעשו"
          color="var(--navy-mid)"
          bg="var(--navy-light)"
          border="var(--navy-border)"
        />

        {/* Difficulty distribution */}
        <div
          className="rounded-lg border p-3"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            רמות קושי
          </p>
          <div className="space-y-1">
            <DiffRow label="קל" count={stats.easyCount} color="var(--green)" total={stats.doneCount} />
            <DiffRow label="בינוני" count={stats.mediumCount} color="var(--amber-mid)" total={stats.doneCount} />
            <DiffRow label="קשה" count={stats.hardCount} color="var(--red-mid)" total={stats.doneCount} />
          </div>
        </div>
      </div>

      {/* Progress bar for theorems */}
      {stats.totalMarkedTheorems > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              הגדרות ומשפטים שנשלטים
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color: "var(--green)" }}>
              {knownPct}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${knownPct}%`,
                background: "linear-gradient(90deg, var(--green-mid), var(--green))",
              }}
            />
          </div>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            {stats.knownCount} מתוך {stats.totalMarkedTheorems} מסומנים · {stats.reviewCount} לחזור
          </p>
        </div>
      )}
    </section>
  );
}

function StatCard({
  label, value, sub, color, bg, border,
}: {
  label: string; value: number; sub: string; color: string; bg: string; border: string;
}) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ background: bg, borderColor: border }}
    >
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      <p className="text-xs font-black" style={{ color }}>{label}</p>
      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}

function DiffRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-[10px] font-bold" style={{ color }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: "width 0.4s" }}
        />
      </div>
      <span className="w-4 text-[10px] tabular-nums text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
    </div>
  );
}
