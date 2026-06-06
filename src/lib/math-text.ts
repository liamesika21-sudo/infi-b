/**
 * Math text preprocessor.
 *
 * Most course text is OCR Hebrew with inline math that has no $...$
 * delimiters. This file keeps Hebrew as plain RTL text and wraps only
 * math-looking spans in \( ... \), so KaTeX can render the formulas without
 * swallowing Hebrew words into the equation.
 */

// Map unicode → LaTeX atom (used only inside already-identified math spans)
const ATOM_MAP: [RegExp, string][] = [
  // Subscript digits/letters
  [/₀/g,"_0"],[/₁/g,"_1"],[/₂/g,"_2"],[/₃/g,"_3"],[/₄/g,"_4"],
  [/₅/g,"_5"],[/₆/g,"_6"],[/₇/g,"_7"],[/₈/g,"_8"],[/₉/g,"_9"],
  [/ₙ/g,"_n"],[/ₖ/g,"_k"],[/ᵢ/g,"_i"],[/ⱼ/g,"_j"],
  // Superscript digits/letters
  [/⁰/g,"^0"],[/¹/g,"^1"],[/²/g,"^2"],[/³/g,"^3"],[/⁴/g,"^4"],
  [/⁵/g,"^5"],[/⁶/g,"^6"],[/⁷/g,"^7"],[/⁸/g,"^8"],[/⁹/g,"^9"],
  [/ⁿ/g,"^n"],[/ᵏ/g,"^k"],
];

/** Apply unicode → LaTeX atom substitutions inside a known-math span. */
export function convertAtomsOnly(s: string): string {
  let r = s;
  for (const [pat, rep] of ATOM_MAP) r = r.replace(pat, rep);
  return r
    .replace(/[−–]/g, "-")
    .replace(/×/g, "\\times ")
    .replace(/·/g, "\\cdot ")
    .replace(/∞/g, "\\infty ")
    .replace(/∈/g, "\\in ")
    .replace(/∉/g, "\\notin ")
    .replace(/⊆/g, "\\subseteq ")
    .replace(/⊂/g, "\\subset ")
    .replace(/⊇/g, "\\supseteq ")
    .replace(/∪/g, "\\cup ")
    .replace(/∩/g, "\\cap ")
    .replace(/≤|/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/→/g, "\\to ")
    .replace(/←/g, "\\leftarrow ")
    .replace(/↔/g, "\\leftrightarrow ")
    .replace(/π|⇡/g, "\\pi ")
    .replace(/ε/g, "\\varepsilon ")
    .replace(/δ/g, "\\delta ")
    .replace(/∆/g, "\\Delta ")
    .replace(/′/g, "'")
    .replace(/√\s*\(?\s*([A-Za-z0-9_{}^.'+-]+)\s*\)?/g, "\\sqrt{$1}");
}

const DELIM_RE = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
const DELIM_ONLY_RE = /^(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)$/;

function isHebrewChar(ch: string): boolean {
  return ch >= "\u0590" && ch <= "\u05ff";
}

function isMathStarter(ch: string): boolean {
  return /[A-Za-z0-9∞∈∉⊆⊂⊇∪∩→←↔√∑∫π⇡εδ∆()[\]{}|+\-−=<>≤≥≠]/.test(ch);
}

function isMathishChar(ch: string): boolean {
  return /[A-Za-z0-9\s.,:;?!()[\]{}|+\-−=<>≤≥≠×·*/^_∞∈∉⊆⊂⊇∪∩→←↔√′'∑∫π⇡εδ∆]/.test(ch);
}

function shouldWrapMathCandidate(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 2) return false;
  if (!/[A-Za-z0-9∞∈→√∑∫π⇡εδ]/.test(s)) return false;

  return (
    /[=<>≤≥≠∞∈∉⊆⊂⊇∪∩→←↔√∑∫^_]|\\[a-zA-Z]+/.test(s) ||
    /\b(lim|sin|cos|tan|ln|log|exp|arctan|arcsin|arccos)\b/.test(s) ||
    /[A-Za-z]\s*[′']?\s*\(/.test(s) ||
    /\d\s*[+\-−*/]\s*\d/.test(s)
  );
}

function convertPlainMathToLatex(raw: string): string {
  let s = convertAtomsOnly(raw.trim());

  s = s
    .replace(/[−–]/g, "-")
    .replace(/×/g, "\\times ")
    .replace(/·/g, "\\cdot ")
    .replace(/∞/g, "\\infty ")
    .replace(/∈/g, "\\in ")
    .replace(/∉/g, "\\notin ")
    .replace(/⊆/g, "\\subseteq ")
    .replace(/⊂/g, "\\subset ")
    .replace(/⊇/g, "\\supseteq ")
    .replace(/∪/g, "\\cup ")
    .replace(/∩/g, "\\cap ")
    .replace(/≤|/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/→/g, "\\to ")
    .replace(/←/g, "\\leftarrow ")
    .replace(/↔/g, "\\leftrightarrow ")
    .replace(/π|⇡/g, "\\pi ")
    .replace(/ε/g, "\\varepsilon ")
    .replace(/δ/g, "\\delta ")
    .replace(/∆/g, "\\Delta ")
    .replace(/′/g, "'");

  s = s
    .replace(/\b6\s*=\s*/g, "\\ne ")
    .replace(/√\s*\(?\s*([A-Za-z0-9_{}^.'+-]+)\s*\)?/g, "\\sqrt{$1}")
    .replace(/([A-Za-z])\s*\+\s*0/g, "$1_0^+")
    .replace(/([A-Za-z])\s*-\s*0/g, "$1_0^-")
    .replace(/\blim\s+([A-Za-z])\s*\\to\s*([A-Za-z0-9_{}^+.'-]+)/g, "\\lim_{$1\\to $2}")
    .replace(/\blim\s*([A-Za-z])\s*\\to\s*([A-Za-z0-9_{}^+.'-]+)/g, "\\lim_{$1\\to $2}")
    .replace(/\blim\s+([A-Za-z])\s*->\s*([A-Za-z0-9_{}^+.'-]+)/g, "\\lim_{$1\\to $2}")
    .replace(/\bR\b/g, "\\mathbb{R}")
    .replace(/\bN\b/g, "\\mathbb{N}")
    .replace(/\bQ\b/g, "\\mathbb{Q}")
    .replace(/\bZ\b/g, "\\mathbb{Z}")
    .replace(/\s+/g, " ");

  return s;
}

function wrapPlainMathSpans(text: string): string {
  let out = "";
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (isHebrewChar(ch) || !isMathStarter(ch)) {
      out += ch;
      i += 1;
      continue;
    }

    const start = i;
    i += 1;
    while (i < text.length && !isHebrewChar(text[i]) && isMathishChar(text[i])) {
      i += 1;
    }

    const candidate = text.slice(start, i);
    if (!shouldWrapMathCandidate(candidate)) {
      out += candidate;
      continue;
    }

    const leading = candidate.match(/^\s*/)?.[0] ?? "";
    const trailing = candidate.match(/\s*$/)?.[0] ?? "";
    const body = candidate.slice(leading.length, candidate.length - trailing.length);
    const listPrefix = body.match(/^(\d+\s*[.:)]\s+)/)?.[1] ?? "";
    const mathBody = listPrefix ? body.slice(listPrefix.length) : body;
    out += `${leading}${listPrefix}\\(${convertPlainMathToLatex(mathBody)}\\)${trailing}`;
  }

  return out;
}

/**
 * Existing delimiters stay intact. Plain OCR math around Hebrew is wrapped
 * conservatively as inline KaTeX.
 */
export function preprocessMath(text: string): string {
  return text
    .split(DELIM_RE)
    .filter(Boolean)
    .map((part) => {
      if (!DELIM_ONLY_RE.test(part)) return wrapPlainMathSpans(part);

      const isDisplay = part.startsWith("\\[") || part.startsWith("$$");
      let inner: string;
      if (part.startsWith("\\[") || part.startsWith("\\(")) {
        inner = part.slice(2, -2);
      } else if (part.startsWith("$$")) {
        inner = part.slice(2, -2);
      } else {
        inner = part.slice(1, -1);
      }
      const converted = convertAtomsOnly(inner);
      if (isDisplay) return part.startsWith("\\[") ? `\\[${converted}\\]` : `$$${converted}$$`;
      return `$${converted}$`;
    })
    .join("");
}

/** Public helper: does a string need math processing at all? */
export function hasMathContent(text: string): boolean {
  return /[$]|\\[a-zA-Z]|\\\(|\\\[|[=<>≤≥≠∞∈∉⊆⊂⊇→√∑∫π⇡]|\b(lim|sin|cos|ln|exp)\b/.test(text);
}
