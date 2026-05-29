import katex from "katex";
import "katex/dist/katex.min.css";

const mathPattern = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

function renderMath(raw: string): { html: string; displayMode: boolean } {
  const displayMode = raw.startsWith("\\[") || raw.startsWith("$$");
  const inner = displayMode
    ? raw.slice(2, -2)
    : raw.startsWith("\\(")
      ? raw.slice(2, -2)
      : raw.slice(1, -1);
  return {
    displayMode,
    html: katex.renderToString(inner.trim(), {
      displayMode,
      throwOnError: false,
      output: "html",
    }),
  };
}

export function MathContent({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={`math-content ${className}`} dir="rtl">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        const parts = line.split(mathPattern).filter(Boolean);
        return (
          <p key={li} className="my-1 leading-8">
            {parts.map((part, pi) => {
              const testPattern = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/;
              if (testPattern.test(part)) {
                const rendered = renderMath(part);
                return (
                  <span
                    key={pi}
                    dir="ltr"
                    className={rendered.displayMode ? "math-display" : "math-ltr"}
                    dangerouslySetInnerHTML={{ __html: rendered.html }}
                  />
                );
              }
              return (
                <span key={pi} dir="auto" style={{ unicodeBidi: "plaintext" }}>
                  {part}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

export function InlineMath({ latex }: { latex: string }) {
  try {
    const html = katex.renderToString(latex, { displayMode: false, throwOnError: false });
    return (
      <span dir="ltr" className="math-ltr" dangerouslySetInnerHTML={{ __html: html }} />
    );
  } catch {
    return <code dir="ltr" className="text-sm font-mono">{latex}</code>;
  }
}

export function DisplayMath({ latex }: { latex: string }) {
  try {
    const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
    return (
      <div dir="ltr" className="math-display" dangerouslySetInnerHTML={{ __html: html }} />
    );
  } catch {
    return <pre dir="ltr" className="overflow-x-auto text-sm font-mono">{latex}</pre>;
  }
}
