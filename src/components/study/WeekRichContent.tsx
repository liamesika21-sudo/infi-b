"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MathContent } from "./MathContent";
import { DecisionTree } from "./DecisionTree";
import type { WeekRichContent, RichSection, SectionTag } from "@/lib/calculus2/week-rich-content";

const TAG_STYLES: Record<SectionTag, { bg: string; text: string; border: string }> = {
  "הגדרה":  { bg: "var(--green-light)",   text: "var(--green)",    border: "var(--green-border)" },
  "משפט":   { bg: "var(--navy-light)",    text: "var(--navy-mid)", border: "var(--navy-border)" },
  "כלל":    { bg: "var(--amber-light)",   text: "var(--amber-mid)",border: "var(--amber-border)" },
  "מסקנה":  { bg: "var(--teal-light)",    text: "var(--teal)",     border: "var(--teal-border)" },
  "הערה":   { bg: "var(--bg-subtle)",     text: "var(--text-muted)",border: "var(--border)" },
  "דוגמה":  { bg: "var(--purple-light)",  text: "var(--purple)",   border: "var(--purple-border)" },
  "שיטה":   { bg: "var(--navy-light)",    text: "var(--navy-mid)", border: "var(--navy-border)" },
  "אזהרה":  { bg: "var(--red-light)",     text: "var(--red-mid)",  border: "var(--red-border)" },
};

const ACCENT_BORDER: Record<SectionTag, string> = {
  "הגדרה":  "var(--green-mid)",
  "משפט":   "var(--navy-mid)",
  "כלל":    "var(--amber-mid)",
  "מסקנה":  "var(--teal)",
  "הערה":   "var(--border-strong)",
  "דוגמה":  "var(--purple-mid)",
  "שיטה":   "var(--navy-mid)",
  "אזהרה":  "var(--red-mid)",
};

export function WeekRichContentPanel({ content }: { content: WeekRichContent }) {
  return (
    <div className="space-y-8">
      {/* Goal + principle */}
      <div className="space-y-3">
        <div
          className="rounded-lg border-r-4 px-4 py-3"
          style={{
            borderColor: "var(--navy-border)",
            borderRightColor: "var(--navy-mid)",
            borderRightWidth: "4px",
            background: "var(--navy-light)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--navy-mid)" }}>
            מטרת הסף
          </p>
          <MathContent text={content.mainGoal} className="text-sm font-semibold" />
        </div>

        <div
          className="rounded-lg border-r-4 px-4 py-3"
          style={{
            borderColor: "var(--amber-border)",
            borderRightColor: "var(--amber-mid)",
            borderRightWidth: "4px",
            background: "var(--amber-light)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--amber-mid)" }}>
            העיקרון המוביל
          </p>
          <MathContent text={content.guidingPrinciple} className="text-sm font-semibold" />
        </div>

        {content.buildOn && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            בנוי על: {content.buildOn}
          </p>
        )}
      </div>

      {/* Decision tree */}
      {content.decisionTree && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            עץ החלטות — מה אני מסיקה?
          </p>
          <div
            className="rounded-xl border p-5 overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
          >
            <DecisionTree root={content.decisionTree} />
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {content.sections.map((section, i) => (
          <RichSectionCard key={i} section={section} />
        ))}
      </div>
    </div>
  );
}

function RichSectionCard({ section }: { section: RichSection }) {
  const [open, setOpen] = useState(true);
  const tagStyle = TAG_STYLES[section.tag];
  const accentBorder = ACCENT_BORDER[section.tag];

  return (
    <article
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: "var(--border)",
        borderRightWidth: "3px",
        borderRightColor: accentBorder,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-right"
        style={{ background: "var(--bg-subtle)", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 rounded-md px-2.5 py-0.5 text-[11px] font-black"
            style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
          >
            {section.tag}
          </span>
          <h3
            className="text-sm font-black"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
          >
            {section.title}
          </h3>
        </div>
        <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 py-5 space-y-4 bg-white">
          {/* Formal */}
          <div
            className="rounded-lg p-4"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            <MathContent text={section.formal} className="text-sm" />
          </div>

          {/* Why it exists */}
          {section.whyItExists && (
            <Row label="למה זה נוסף?" color="var(--teal)" content={section.whyItExists} />
          )}

          {/* Intuition */}
          {section.intuition && (
            <Row label="אינטואיציה" color="var(--navy-mid)" content={section.intuition} />
          )}

          {/* When to use */}
          {section.whenToUse && (
            <Row label="מתי להשתמש?" color="var(--amber-mid)" content={section.whenToUse} />
          )}

          {/* Notes */}
          {section.notes && section.notes.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                הערות חשובות
              </p>
              <ul className="space-y-1.5">
                {section.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--border-strong)" }} />
                    <MathContent text={note} className="text-sm" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning */}
          {section.warning && (
            <div
              className="rounded-lg border-r-4 px-4 py-3"
              style={{
                borderColor: "var(--red-border)",
                borderRightColor: "var(--red-mid)",
                background: "var(--red-light)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--red-mid)" }}>
                טעות נפוצה
              </p>
              <MathContent text={section.warning} className="text-sm" />
            </div>
          )}

          {/* Example */}
          {section.example && (
            <div
              className="rounded-lg border-r-4 px-4 py-3"
              style={{
                borderColor: "var(--purple-border)",
                borderRightColor: "var(--purple-mid)",
                background: "var(--purple-light)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--purple-mid)" }}>
                דוגמה
              </p>
              <MathContent text={section.example} className="text-sm" />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Row({ label, color, content }: { label: string; color: string; content: string }) {
  return (
    <div>
      <p
        className="text-[10px] font-black uppercase tracking-widest mb-1.5"
        style={{ color }}
      >
        {label}
      </p>
      <MathContent text={content} className="text-sm" />
    </div>
  );
}
