import type { ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { preprocessMath } from "@/lib/math-text";

const SPLIT_RE = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
const TEST_RE  = /^(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)$/;
// A line that is ONLY a display-math block (possibly with surrounding whitespace)
const DISPLAY_ONLY_RE = /^\s*(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$)\s*$/;

function renderKatexSafely(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex.trim(), { displayMode, throwOnError: false, strict: false });
  } catch {
    return null;
  }
}

function parseMathDelim(raw: string): { html: string; displayMode: boolean } | null {
  const displayMode = raw.startsWith("\\[") || raw.startsWith("$$");
  let inner: string;
  if (raw.startsWith("\\[") || raw.startsWith("\\(")) inner = raw.slice(2, -2);
  else if (raw.startsWith("$$")) inner = raw.slice(2, -2);
  else inner = raw.slice(1, -1);
  if (/[\u0590-\u05ff]/.test(inner)) return null;
  const html = renderKatexSafely(inner, displayMode);
  return html ? { html, displayMode } : null;
}

function unwrapMathDelim(raw: string): string {
  if (raw.startsWith("\\[") || raw.startsWith("\\(")) return raw.slice(2, -2);
  if (raw.startsWith("$$")) return raw.slice(2, -2);
  if (raw.startsWith("$")) return raw.slice(1, -1);
  return raw;
}

function renderBoldText(text: string): ReactNode {
  if (!text.includes("**")) return text;
  const result: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, idx = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result.push(<span key={idx++}>{text.slice(last, m.index)}</span>);
    result.push(<strong key={idx++}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push(<span key={idx++}>{text.slice(last)}</span>);
  return <>{result}</>;
}

/** Render a single line that may contain Hebrew + inline math. */
function renderInlineLine(rawLine: string) {
  const processed = preprocessMath(rawLine);
  const parts = processed.split(SPLIT_RE).filter(Boolean);
  return parts.map((part, i) => {
    if (TEST_RE.test(part)) {
      const result = parseMathDelim(part);
      if (result) {
        return (
          <span
            key={i}
            dir="ltr"
            className={result.displayMode ? "math-display" : "math-ltr"}
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        );
      }
      return (
        <span key={i} dir="auto" style={{ unicodeBidi: "plaintext" }}>
          {renderBoldText(unwrapMathDelim(part))}
        </span>
      );
    }
    return (
      <span key={i} dir="auto" style={{ unicodeBidi: "plaintext" }}>
        {renderBoldText(part)}
      </span>
    );
  });
}

/**
 * Full block renderer. Lines that are ONLY $$...$$ are rendered as centred
 * display equations. Full-bold lines become sub-headings. Bullet and
 * numbered-list lines get dedicated structure. Everything else is a paragraph.
 */
export function MathContent({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={`math-content ${className}`} dir="rtl">
      {lines.map((line, li) => {
        // Empty line → visible paragraph break
        if (!line.trim()) return <div key={li} className="h-6" />;

        // Full-line display math → centred block
        const displayMatch = line.match(DISPLAY_ONLY_RE);
        if (displayMatch) {
          const result = parseMathDelim(displayMatch[1].trim());
          if (result) {
            return (
              <div
                key={li}
                dir="ltr"
                className="math-display my-5"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            );
          }
        }

        const trimmed = line.trim();

        // Full-bold line (e.g. **תזכורת: משפט דרבו:**) → sub-heading
        if (/^\*\*[^*\n]+\*\*$/.test(trimmed)) {
          return (
            <p key={li} className="mc-head" dir="rtl">
              {renderInlineLine(trimmed.slice(2, -2))}
            </p>
          );
        }

        // Bullet point (• text)
        if (trimmed.startsWith("• ") || trimmed.startsWith("• ")) {
          return (
            <p key={li} className="mc-bullet" dir="rtl">
              {renderInlineLine(trimmed.slice(2))}
            </p>
          );
        }

        // Numbered condition: "1. text"
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) {
          return (
            <div key={li} className="mc-num">
              <span className="mc-num-marker">{numMatch[1]}.</span>
              <span className="mc-num-body">{renderInlineLine(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={li} dir="rtl">
            {renderInlineLine(line)}
          </p>
        );
      })}
    </div>
  );
}

export function InlineMath({ latex }: { latex: string }) {
  const html = renderKatexSafely(latex, false);
  if (!html) return <code dir="ltr" className="font-mono text-sm">{latex}</code>;
  return <span dir="ltr" className="math-ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function DisplayMath({ latex }: { latex: string }) {
  const html = renderKatexSafely(latex, true);
  if (!html) return <pre dir="ltr" className="overflow-x-auto font-mono text-sm">{latex}</pre>;
  return <div dir="ltr" className="math-display" dangerouslySetInnerHTML={{ __html: html }} />;
}
