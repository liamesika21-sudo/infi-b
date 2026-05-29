import katex from "katex";
import "katex/dist/katex.min.css";
import { preprocessMath } from "@/lib/math-text";

// Matches any LaTeX-delimited span
const SPLIT_RE = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
const TEST_RE  = /^(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)$/;

function renderKatexSafely(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex.trim(), { displayMode, throwOnError: false });
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
  const html = renderKatexSafely(inner, displayMode);
  return html ? { html, displayMode } : null;
}

function renderLine(rawLine: string) {
  // Run auto-detection first, then split on LaTeX delimiters
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
    }
    return (
      <span key={i} dir="auto" style={{ unicodeBidi: "plaintext" }}>
        {part}
      </span>
    );
  });
}

export function MathContent({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={`math-content ${className}`} dir="rtl">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-1.5" />;
        return (
          <p key={li} className="my-0.5 leading-9">
            {renderLine(line)}
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
