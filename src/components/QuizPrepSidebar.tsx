"use client";
import { useEffect, useState } from "react";

type SidebarItem = { id: string; label: string; children?: { id: string; label: string }[] };

const NAV: SidebarItem[] = [
  {
    id: "part-a",
    label: "חלק א׳ — משפטים",
    children: [
      { id: "thm-necessary",      label: "מ׳5 — תנאי הכרחי" },
      { id: "thm-compare-direct", label: "מ׳6 — השוואה ישיר" },
      { id: "thm-compare-limit",  label: "מ׳6׳ — השוואה גבולי" },
      { id: "thm-root-1a",        label: "צבר 1a — שורש ישיר" },
      { id: "thm-root-1b",        label: "צבר 1b — מבחן שורש" },
      { id: "thm-ratio-2a",       label: "צבר 2a — מנה (השוואה)" },
      { id: "thm-ratio-2b",       label: "צבר 2b — מבחן מנה" },
      { id: "thm-root-div",       label: "מ׳3 — שורש התבדרות" },
      { id: "thm-integral",       label: "מ׳5 — מבחן האינטגרל" },
      { id: "thm-abs-conv",       label: "מ׳1 — התכנסות מוחלטת" },
      { id: "thm-leibniz",        label: "מ׳2 — לייבניץ" },
    ],
  },
  {
    id: "part-b",
    label: "חלק ב׳ — שיעורי בית",
    children: [
      { id: "hw6", label: "שיעורי בית 6" },
      { id: "hw7", label: "שיעורי בית 7" },
      { id: "hw8", label: "שיעורי בית 8" },
    ],
  },
  { id: "part-c", label: "חלק ג׳ — תרגול" },
  { id: "part-d", label: "חלק ד׳ — נקודות מרכזיות" },
];

const ALL_IDS = NAV.flatMap(s => [s.id, ...(s.children?.map(c => c.id) ?? [])]);

const navy = "#1e3a5f";
const blue = "#1d4ed8";

export default function QuizPrepSidebar() {
  const [active, setActive] = useState<string>("part-a");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "part-a": true, "part-b": true,
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSet = new Set<string>();

    ALL_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visibleSet.add(id);
          else visibleSet.delete(id);
          const first = ALL_IDS.find(i => visibleSet.has(i));
          if (first) setActive(first);
        },
        { rootMargin: "-10% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const toggle = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      position: "sticky",
      top: "5rem",
      maxHeight: "calc(100vh - 6rem)",
      overflowY: "auto",
      background: "#fff",
      border: "1px solid #e5e0d8",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      padding: "12px 0 16px",
      direction: "rtl",
    }}>
      <div style={{
        padding: "0 14px 10px",
        borderBottom: "1px solid #e5e0d8",
        fontWeight: 900,
        fontSize: "0.78rem",
        letterSpacing: "0.05em",
        color: "#6b7280",
        textTransform: "uppercase",
      }}>
        ניווט מהיר
      </div>

      <nav style={{ marginTop: 6 }}>
        {NAV.map(section => {
          const parentActive = active === section.id ||
            section.children?.some(c => c.id === active);
          const isOpen = openSections[section.id] ?? false;

          return (
            <div key={section.id}>
              <button
                onClick={() => {
                  scrollTo(section.id);
                  if (section.children?.length) toggle(section.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "7px 14px",
                  textAlign: "right",
                  fontWeight: parentActive ? 800 : 600,
                  fontSize: "0.82rem",
                  color: parentActive ? navy : "#374151",
                  borderRight: parentActive ? `3px solid ${navy}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ flex: 1 }}>{section.label}</span>
                {section.children?.length ? (
                  <span style={{
                    fontSize: "0.65rem",
                    color: "#9ca3af",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                    marginRight: 4,
                  }}>▶</span>
                ) : null}
              </button>

              {section.children?.length && isOpen && (
                <div style={{ background: "#fafaf9", borderTop: "1px solid #f0ece4", borderBottom: "1px solid #f0ece4" }}>
                  {section.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => scrollTo(child.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px 14px 5px 20px",
                        textAlign: "right",
                        fontSize: "0.77rem",
                        fontWeight: active === child.id ? 700 : 400,
                        color: active === child.id ? blue : "#6b7280",
                        borderRight: active === child.id ? `3px solid ${blue}` : "3px solid transparent",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "all 0.15s",
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
