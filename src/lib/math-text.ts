/**
 * Math text preprocessor — conservative version.
 *
 * ONLY processes text that has explicit LaTeX commands (\sum, \frac, etc.).
 * Does NOT auto-wrap standalone unicode symbols (∑, ∫, →) because Hebrew text
 * often contains those and mixing Hebrew inside $…$ breaks KaTeX.
 *
 * Rule: if a string segment already has $ or \( delimiters → leave it.
 *       if it has \command patterns → wrap just those spans.
 *       otherwise → return as-is (unicode math renders fine in the browser).
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
  return r;
}

// Detects whether text has real LaTeX commands that KaTeX can handle
const HAS_LATEX_CMD = /\\[a-zA-Z]+/;

/**
 * Conservative math preprocessor.
 *
 * - Segments that already have $…$ or \(…\) or \[…\] → pass through unchanged.
 * - Segments with \command patterns (but no $ yet) → apply atom conversion only;
 *   do NOT auto-wrap in $; rely on the JSON data to have proper $…$ already.
 * - Segments with only unicode math chars (∑, ∫, →, …) → leave as plain text;
 *   they are readable and mixing them into KaTeX alongside Hebrew breaks things.
 *
 * For actual KaTeX rendering to happen, the source string must already contain
 * $…$ or \(…\) delimiters.  The JSON data layer is responsible for that.
 */
export function preprocessMath(text: string): string {
  // Fast path: already has explicit delimiters — just apply atom conversion inside each span
  const DELIM_RE = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

  return text.replace(DELIM_RE, (match) => {
    // Extract the inner content, convert atoms, put delimiters back
    const isDisplay = match.startsWith("\\[") || match.startsWith("$$");
    let inner: string;
    if (match.startsWith("\\[") || match.startsWith("\\(")) {
      inner = match.slice(2, -2);
    } else if (match.startsWith("$$")) {
      inner = match.slice(2, -2);
    } else {
      inner = match.slice(1, -1);
    }
    const converted = convertAtomsOnly(inner);
    if (isDisplay) return match.startsWith("\\[") ? `\\[${converted}\\]` : `$$${converted}$$`;
    return `$${converted}$`;
  });
}

/** Public helper: does a string need math processing at all? */
export function hasMathContent(text: string): boolean {
  return /[$]|\\[a-zA-Z]|\\\(|\\\[/.test(text);
}
