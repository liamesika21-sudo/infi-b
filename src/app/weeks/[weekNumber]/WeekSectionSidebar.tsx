"use client";

import { useEffect, useMemo, useState } from "react";

export type WeekSectionNavItem = {
  id: string;
  label: string;
};

export function WeekSectionSidebar({ sections }: { sections: WeekSectionNavItem[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-24% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.45],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds]);

  if (sections.length === 0) return null;

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
