"use client";

import { useEffect, useState } from "react";

const WEEKS: [number, string][] = [
  [1, "גבולות — לופיטל ודרבו"],
  [2, "סדרות — מונוטוניות"],
  [3, "נגזרות — MVT, טיילור"],
  [4, "אינטגרל — FTC"],
  [5, "אינטגרלים לא אמיתיים"],
  [6, "טורים — השוואה"],
  [7, "מבחן מנה ושורש"],
  [8, "התכנסות בהחלט"],
  [9, "טורי חזקות"],
];

const S = {
  primary: "#1a3a5c",
  blue:    "#1565c0",
  border:  "#e0d6c8",
};

export function TheoremsSidebar() {
  const [active, setActive] = useState<number>(1);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const [num] of WEEKS) {
      const el = document.getElementById(`week-${num}`);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(num); },
        { rootMargin: "-10% 0px -65% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <aside
      className="hidden xl:block"
      style={{
        width: 210,
        flexShrink: 0,
        position: "sticky",
        top: 76,
        maxHeight: "calc(100vh - 88px)",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "14px 12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: `1px solid ${S.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            color: S.primary,
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: `1px solid ${S.border}`,
          }}
        >
          ניווט מהיר
        </div>

        {/* Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {WEEKS.map(([num, title]) => {
            const isActive = active === num;
            return (
              <a
                key={num}
                href={`#week-${num}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 7,
                  textDecoration: "none",
                  background: isActive ? "#e8f0fe" : "transparent",
                  transition: "background 140ms",
                  borderRight: isActive ? `3px solid ${S.blue}` : "3px solid transparent",
                }}
              >
                {/* Week number pill */}
                <span
                  style={{
                    flexShrink: 0,
                    marginTop: 1,
                    background: isActive ? S.blue : "#dde4ef",
                    color: isActive ? "#fff" : "#6b82a0",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    lineHeight: 1.7,
                  }}
                >
                  {num}
                </span>

                {/* Title */}
                <span
                  style={{
                    fontSize: "0.74rem",
                    lineHeight: 1.45,
                    color: isActive ? S.blue : "#4a5568",
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {title}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
