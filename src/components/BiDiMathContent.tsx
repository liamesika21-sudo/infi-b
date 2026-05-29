import katex from "katex";
import "katex/dist/katex.min.css";

const mathPattern = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

function renderMath(raw: string): { html: string; displayMode: boolean } {
  const displayMode = raw.startsWith("\\[") || raw.startsWith("$$");
  const inner = raw.startsWith("\\[")
    ? raw.slice(2, -2)
    : raw.startsWith("\\(")
      ? raw.slice(2, -2)
      : raw.startsWith("$$")
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

export function BiDiMathContent({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");

  return (
    <div className={className} dir="rtl">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) return <div key={lineIndex} className="h-2" />;
        const parts = line.split(mathPattern).filter(Boolean);

        return (
          <p key={lineIndex} className="my-1 leading-8">
            {parts.map((part, partIndex) => {
              if (mathPattern.test(part)) {
                mathPattern.lastIndex = 0;
                const rendered = renderMath(part);
                return (
                  <span
                    key={partIndex}
                    dir="ltr"
                    className={rendered.displayMode ? "my-3 block text-center" : "inline-block"}
                    style={{ unicodeBidi: "isolate" }}
                    dangerouslySetInnerHTML={{ __html: rendered.html }}
                  />
                );
              }
              mathPattern.lastIndex = 0;
              return (
                <span key={partIndex} dir="auto" style={{ unicodeBidi: "plaintext" }}>
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
