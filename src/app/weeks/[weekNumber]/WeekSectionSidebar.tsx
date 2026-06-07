"use client";

import { useEffect, useRef, useState } from "react";

export type WeekSectionNavItem = {
  id: string;
  label: string;
};

export function WeekSectionSidebar({ sections }: { sections: WeekSectionNavItem[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));
  // Track if user just clicked — suppress observer for a moment
  const clickedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const ids = sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates right after a click
        if (clickedRef.current) return;

        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const ay = (a.target as HTMLElement).getBoundingClientRect().top;
            const by = (b.target as HTMLElement).getBoundingClientRect().top;
            return ay - by;
          })[0];

        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-10% 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (sections.length === 0) return null;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    // Immediately set active without waiting for observer
    setActiveId(id);
    clickedRef.current = true;

    target.scrollIntoView({ behavior: "smooth", block: "start" });

    // Re-enable observer after scroll settles
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickedRef.current = false; }, 1000);
  }

  return (
    <nav
      className="week-section-nav"
      aria-label="ניווט בתוך השבוע"
      style={{ "--total-week-sections": sections.length } as React.CSSProperties}
    >
      <p className="week-section-nav-title">בתוך השבוע</p>
      <div className="week-section-nav-list">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="week-section-nav-item"
              data-active={isActive ? "true" : undefined}
              aria-current={isActive ? "location" : undefined}
              onClick={(e) => handleClick(e, section.id)}
            >
              {section.label}
            </a>
          );
        })}
        <div className="week-section-glider-container" aria-hidden="true">
          <div
            className="week-section-glider"
            style={{ transform: `translateY(${activeIndex * 100}%)` }}
          />
        </div>
      </div>
    </nav>
  );
}
