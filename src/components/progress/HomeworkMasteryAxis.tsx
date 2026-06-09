"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgress, type ProgressData } from "@/lib/progress-store";

// ── Types ──────────────────────────────────────────────────────────────────────

type HwEntry = {
  hwNum: number;
  done: number;
  touched: number;
  easy: number;
  medium: number;
  hard: number;
};

type MasteryStats = {
  hwBreakdown: HwEntry[];
  totalDone: number;
  totalTouched: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  undiffCount: number; // done but no difficulty tagged
  masteryScore: number; // 0–100
};

// ── Data ───────────────────────────────────────────────────────────────────────

function computeMasteryStats(data: ProgressData): MasteryStats {
  const byHw = new Map<number, HwEntry>();

  let totalDone = 0;
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  let undiffCount = 0;

  for (const [key, q] of Object.entries(data.questions)) {
    const m = key.match(/^hw-(\d+)-/);
    if (!m) continue;
    const hwNum = parseInt(m[1], 10);

    const cur = byHw.get(hwNum) ?? { hwNum, done: 0, touched: 0, easy: 0, medium: 0, hard: 0 };
    cur.touched++;

    if (q.done) {
      cur.done++;
      totalDone++;
      if (q.difficulty === "easy") { cur.easy++; easyCount++; }
      else if (q.difficulty === "medium") { cur.medium++; mediumCount++; }
      else if (q.difficulty === "hard") { cur.hard++; hardCount++; }
      else { undiffCount++; }
    }

    byHw.set(hwNum, cur);
  }

  const totalTouched = Object.keys(data.questions).length;

  // Mastery score: easy = full confidence, medium = partial, hard = low, undiff = neutral
  const scoreSum = easyCount * 100 + mediumCount * 65 + hardCount * 28 + undiffCount * 50;
  const masteryScore = totalDone > 0 ? Math.round(scoreSum / totalDone) : 0;

  const hwBreakdown = Array.from(byHw.values()).sort((a, b) => a.hwNum - b.hwNum);

  return {
    hwBreakdown,
    totalDone,
    totalTouched,
    easyCount,
    mediumCount,
    hardCount,
    undiffCount,
    masteryScore,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HomeworkMasteryAxis() {
  const [stats, setStats] = useState<MasteryStats | null>(null);

  useEffect(() => {
    function refresh() {
      setStats(computeMasteryStats(loadProgress()));
    }
    refresh();
    window.addEventListener("progress-updated", refresh);
    return () => window.removeEventListener("progress-updated", refresh);
  }, []);

  if (!stats || stats.totalDone === 0) return null;

  const { hwBreakdown, totalDone, easyCount, mediumCount, hardCount, undiffCount, masteryScore } = stats;

  const masteryLabel =
    masteryScore >= 85 ? "שולטת מצוין" :
    masteryScore >= 65 ? "שליטה טובה" :
    masteryScore >= 40 ? "בדרך הנכונה" :
    "בתחילת הדרך";

  const axisColor =
    masteryScore >= 70 ? "var(--green)" :
    masteryScore >= 40 ? "var(--amber)" :
    "var(--navy-mid)";

  const axisBg =
    masteryScore >= 70 ? "var(--green-light)" :
    masteryScore >= 40 ? "var(--amber-light)" :
    "var(--navy-light)";

  const axisBorder =
    masteryScore >= 70 ? "var(--green-border)" :
    masteryScore >= 40 ? "var(--amber-border)" :
    "var(--navy-border)";

  // Segments for the heatbar, right = mastered, left = not mastered (RTL layout)
  const segments: { key: string; count: number; bg: string; border: string; label: string }[] = [
    { key: "hard",   count: hardCount,   bg: "#fee2e2", border: "#fca5a5", label: "קשה" },
    { key: "undiff", count: undiffCount, bg: "var(--bg-inset)", border: "var(--border)", label: "ללא דירוג" },
    { key: "medium", count: mediumCount, bg: "#fef3c7", border: "#fcd34d", label: "בינוני" },
    { key: "easy",   count: easyCount,   bg: "#dcfce7", border: "#86efac", label: "קל" },
  ].filter((s) => s.count > 0);

  const nudge =
    hardCount >= 3 ? `${hardCount} שאלות קשות — אלה המקום לחזק שליטה` :
    mediumCount >= 4 ? `${mediumCount} שאלות בינוניות — עוד צעד לשליטה מלאה` :
    totalDone < 5 ? "המשיכי לסמן שאלות כדי לעדכן את ציר השליטה" :
    "ממשיכים! כל שאלה שעושים בונה שליטה";

  return (
    <section
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: "var(--border)" }}
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            ציר שליטה אישי
          </p>
          <h2 className="mt-0.5 text-xl font-black" style={{ color: "var(--text-primary)" }}>
            מס הבית שלי — {masteryLabel}
          </h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {totalDone} שאלות מסומנות · לפי קלות הביצוע שדיווחת
          </p>
        </div>

        <div
          className="shrink-0 rounded-xl px-5 py-3 text-center"
          style={{ background: axisBg, border: `1px solid ${axisBorder}` }}
        >
          <p className="text-3xl font-black tabular-nums leading-none" style={{ color: axisColor }}>
            {masteryScore}%
          </p>
          <p className="mt-1 text-[10px] font-black" style={{ color: axisColor }}>
            ציון שליטה
          </p>
        </div>
      </div>

      {/* ── Heatbar axis ── */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
          <span>ביצוע קשה ← אין שליטה</span>
          <span>שליטה מלאה → ביצוע קל</span>
        </div>

        {/* Segmented bar */}
        <div className="flex h-7 overflow-hidden rounded-xl" style={{ gap: "2px" }}>
          {segments.map((seg) => {
            const pct = (seg.count / totalDone) * 100;
            return (
              <div
                key={seg.key}
                title={`${seg.label}: ${seg.count}`}
                className="flex h-full items-center justify-center text-[10px] font-black transition-all"
                style={{
                  width: `${pct}%`,
                  background: seg.bg,
                  border: `1px solid ${seg.border}`,
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              >
                {pct > 10 && (
                  <span style={{ color: "var(--text-primary)" }}>{seg.count}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-3">
          {segments.map((seg) => (
            <span
              key={seg.key}
              className="flex items-center gap-1 text-[10px] font-bold"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded"
                style={{ background: seg.bg, border: `1px solid ${seg.border}` }}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                {seg.label} ({seg.count})
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Mastery position indicator ── */}
      <div className="mt-4 px-1">
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-inset)" }}>
          {/* gradient fill */}
          <div
            className="absolute inset-y-0 right-0 rounded-full transition-all duration-700"
            style={{
              width: `${masteryScore}%`,
              background: `linear-gradient(to left, ${axisColor}cc, ${axisColor}33)`,
            }}
          />
        </div>
        <div className="relative" style={{ marginRight: `${100 - masteryScore}%`, transition: "margin 0.7s" }}>
          <div
            className="flex flex-col items-center"
            style={{ transform: "translateX(50%)" }}
          >
            <div
              className="mt-0.5 h-3 w-0.5 rounded-full"
              style={{ background: axisColor }}
            />
            <span className="text-[10px] font-black" style={{ color: axisColor }}>
              {masteryScore}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Per-homework grid ── */}
      {hwBreakdown.length > 0 && (
        <div className="mt-5">
          <p
            className="mb-3 text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            פירוט לפי מס הבית
          </p>
          <div className="flex flex-wrap gap-2">
            {hwBreakdown.map(({ hwNum, done, easy, medium, hard }) => {
              const primaryColor =
                done === 0 ? "var(--text-muted)" :
                easy >= medium && easy >= hard ? "#16a34a" :
                hard > easy && hard >= medium ? "#dc2626" :
                "#d97706";

              const primaryBg =
                done === 0 ? "var(--bg-subtle)" :
                easy >= medium && easy >= hard ? "#dcfce7" :
                hard > easy && hard >= medium ? "#fee2e2" :
                "#fef3c7";

              const primaryBorder =
                done === 0 ? "var(--border)" :
                easy >= medium && easy >= hard ? "#86efac" :
                hard > easy && hard >= medium ? "#fca5a5" :
                "#fcd34d";

              return (
                <div
                  key={hwNum}
                  className="flex flex-col items-center gap-1"
                  title={`מ"ב ${hwNum}: ${done} שאלות · קל ${easy} · בינוני ${medium} · קשה ${hard}`}
                >
                  <div
                    className="flex h-12 w-12 flex-col items-center justify-center rounded-xl text-center"
                    style={{
                      background: primaryBg,
                      border: `2px solid ${primaryBorder}`,
                    }}
                  >
                    <span
                      className="text-sm font-black leading-none tabular-nums"
                      style={{ color: primaryColor }}
                    >
                      {done}
                    </span>
                    <span className="text-[9px] font-bold" style={{ color: primaryColor, opacity: 0.7 }}>
                      שאלות
                    </span>
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: "var(--text-muted)" }}>
                    מ"ב {hwNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Nudge + CTA ── */}
      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-2.5"
        style={{ background: "var(--bg-subtle)" }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          {nudge}
        </p>
        <Link
          href="/homework-review"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-black transition hover:opacity-80"
          style={{
            background: axisBg,
            color: axisColor,
            border: `1px solid ${axisBorder}`,
          }}
        >
          חזרת מטלות ←
        </Link>
      </div>
    </section>
  );
}
