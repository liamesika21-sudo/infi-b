"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

const TOTAL_WEEKS = 13;

export function WeekNavBar({ currentWeek }: { currentWeek: number }) {
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
  const hasPrev = currentWeek > 1;
  const hasNext = currentWeek < TOTAL_WEEKS;

  return (
    <div
      className="sticky z-30 -mx-4 mb-6 lg:-mx-6"
      style={{ top: "52px" }}
    >
      <div
        className="flex items-center gap-1.5 px-4 py-2 lg:px-6"
        style={{
          background: "var(--bg-page)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          scrollbarWidth: "none",
        }}
      >
        {/* Prev */}
        {hasPrev ? (
          <Link
            href={`/weeks/${currentWeek - 1}`}
            className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition hover:opacity-70"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <ChevronRight className="h-3 w-3" />
            {currentWeek - 1}
          </Link>
        ) : (
          <div className="w-[42px] shrink-0" />
        )}

        {/* Week chips — scrollable */}
        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {weeks.map((week) => {
            const isActive = week === currentWeek;
            return (
              <Link
                key={week}
                href={`/weeks/${week}`}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition-all"
                style={
                  isActive
                    ? {
                        background: "var(--navy-mid)",
                        color: "#fff",
                        boxShadow: "0 1px 4px rgba(7,22,42,0.25)",
                      }
                    : {
                        color: "var(--text-muted)",
                        background: "transparent",
                      }
                }
              >
                {week}
              </Link>
            );
          })}
        </nav>

        {/* Next */}
        {hasNext ? (
          <Link
            href={`/weeks/${currentWeek + 1}`}
            className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition hover:opacity-70"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {currentWeek + 1}
            <ChevronLeft className="h-3 w-3" />
          </Link>
        ) : (
          <div className="w-[42px] shrink-0" />
        )}
      </div>
    </div>
  );
}
