"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DisplayMath, MathContent } from "./MathContent";
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

      {content.fullSummaryMarkdown && (
        <FullSummaryDocument markdown={content.fullSummaryMarkdown} />
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

function FullSummaryDocument({ markdown }: { markdown: string }) {
  const blocks = parseMarkdownBlocks(markdown);

  return (
    <article
      className="rounded-xl border bg-white px-4 py-5 shadow-sm sm:px-6"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-5 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          סיכום מלא
        </p>
        <h3 className="mt-1 text-lg font-black" style={{ color: "var(--text-primary)" }}>
          תרגול 9 — טורי חזקות
        </h3>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <MarkdownBlock key={index} block={block} />
        ))}
      </div>
    </article>
  );
}

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "math"; lines: string[] }
  | { type: "divider" };

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    if (trimmed === "[") {
      const mathLines: string[] = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== "]") {
        const mathLine = lines[index].trim();
        if (mathLine && !/^=+$/.test(mathLine)) {
          mathLines.push(mathLine.replace(/^#\s*/, ""));
        }
        index += 1;
      }
      blocks.push({ type: "math", lines: mathLines });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2] });
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quotes: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quotes.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quotes.join("\n") });
      continue;
    }

    if (isTableLine(trimmed)) {
      const tableLines: string[] = [];
      while (index < lines.length && isTableLine(lines[index].trim())) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const rows = tableLines
        .filter((tableLine) => !/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(tableLine))
        .map((tableLine) =>
          tableLine
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim())
        );
      if (rows.length > 0) blocks.push({ type: "table", rows });
      continue;
    }

    if (/^(\*|-)\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (index < lines.length) {
        const itemLine = lines[index].trim();
        if (ordered && /^\d+\.\s+/.test(itemLine)) {
          items.push(itemLine.replace(/^\d+\.\s+/, ""));
          index += 1;
          continue;
        }
        if (!ordered && /^(\*|-)\s+/.test(itemLine)) {
          items.push(itemLine.replace(/^(\*|-)\s+/, ""));
          index += 1;
          continue;
        }
        break;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const paragraphLine = lines[index].trim();
      if (
        !paragraphLine ||
        paragraphLine === "---" ||
        paragraphLine === "[" ||
        paragraphLine.startsWith("#") ||
        paragraphLine.startsWith(">") ||
        isTableLine(paragraphLine) ||
        /^(\*|-)\s+/.test(paragraphLine) ||
        /^\d+\.\s+/.test(paragraphLine)
      ) {
        break;
      }
      paragraphLines.push(paragraphLine);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
  }

  return blocks;
}

function isTableLine(line: string): boolean {
  return line.startsWith("|") && line.includes("|", 1);
}

function MarkdownBlock({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case "heading": {
      const size = block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-base";
      return (
        <div className={block.level === 1 ? "pt-2" : "pt-1"}>
          <MathContent text={block.text} className={`${size} font-black`} />
        </div>
      );
    }
    case "paragraph":
      return <MathContent text={block.text} className="text-sm" />;
    case "blockquote":
      return (
        <div
          className="rounded-lg border-r-4 px-4 py-3"
          style={{ borderColor: "var(--teal-border)", borderRightColor: "var(--teal)", background: "var(--teal-light)" }}
        >
          <MathContent text={block.text} className="text-sm font-semibold" />
        </div>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={block.ordered ? "list-decimal space-y-1 pr-6" : "list-disc space-y-1 pr-6"}>
          {block.items.map((item, index) => (
            <li key={index}>
              <MathContent text={item} className="text-sm" />
            </li>
          ))}
        </ListTag>
      );
    }
    case "table":
      return <SummaryTable rows={block.rows} />;
    case "math":
      return (
        <div className="space-y-2">
          {block.lines.map((line, index) => (
            <DisplayMath key={index} latex={line} />
          ))}
        </div>
      );
    case "divider":
      return <hr style={{ borderColor: "var(--border)" }} />;
  }
}

function SummaryTable({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
        <thead style={{ background: "var(--bg-subtle)" }}>
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="border-b px-3 py-2 text-right font-black" style={{ borderColor: "var(--border)" }}>
                <MathContent text={cell} className="text-sm" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b px-3 py-2 align-top" style={{ borderColor: "var(--border)" }}>
                  <MathContent text={cell} className="text-sm" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
            className="rounded-lg p-4 space-y-2"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            {parseMarkdownBlocks(section.formal).map((block, i) => (
              <MarkdownBlock key={i} block={block} />
            ))}
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
