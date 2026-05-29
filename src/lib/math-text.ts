/**
 * Smart math text preprocessor.
 *
 * Converts plain unicode math notation → KaTeX-renderable $…$ / $$…$$ strings,
 * while leaving existing LaTeX delimiters and pure Hebrew text untouched.
 */

// ─── Unicode → LaTeX atom map ────────────────────────────────────────────────
const ATOMS: [RegExp, string][] = [
  // Subscript digits
  [/₀/g, "_0"], [/₁/g, "_1"], [/₂/g, "_2"], [/₃/g, "_3"], [/₄/g, "_4"],
  [/₅/g, "_5"], [/₆/g, "_6"], [/₇/g, "_7"], [/₈/g, "_8"], [/₉/g, "_9"],
  // Subscript letters
  [/ₙ/g, "_n"], [/ₖ/g, "_k"], [/ᵢ/g, "_i"], [/ⱼ/g, "_j"],
  [/ₐ/g, "_a"], [/ₑ/g, "_e"],
  // Superscript digits
  [/⁰/g, "^0"], [/¹/g, "^1"], [/²/g, "^2"], [/³/g, "^3"], [/⁴/g, "^4"],
  [/⁵/g, "^5"], [/⁶/g, "^6"], [/⁷/g, "^7"], [/⁸/g, "^8"], [/⁹/g, "^9"],
  // Superscript letters
  [/ⁿ/g, "^n"], [/ᵏ/g, "^k"], [/ˢ/g, "^s"],
  // Core operators
  [/∑/g, "\\sum"], [/∫/g, "\\int"],
  [/∞/g, "\\infty"],
  [/→/g, "\\to"], [/⟹/g, "\\Rightarrow"], [/⟺/g, "\\Leftrightarrow"],
  [/≤/g, "\\leq"], [/≥/g, "\\geq"], [/≠/g, "\\neq"],
  [/≈/g, "\\approx"], [/≡/g, "\\equiv"],
  [/∈/g, "\\in"], [/∉/g, "\\notin"],
  [/⊆/g, "\\subseteq"], [/⊂/g, "\\subset"],
  [/∩/g, "\\cap"], [/∪/g, "\\cup"],
  [/∀/g, "\\forall"], [/∃/g, "\\exists"],
  [/∅/g, "\\emptyset"],
  [/√/g, "\\sqrt"],
  [/·/g, "\\cdot"],
  [/±/g, "\\pm"],
  // Greek letters (lowercase)
  [/\bα\b/g, "\\alpha"], [/\bβ\b/g, "\\beta"], [/\bγ\b/g, "\\gamma"],
  [/\bδ\b/g, "\\delta"], [/\bε\b/g, "\\varepsilon"], [/\bζ\b/g, "\\zeta"],
  [/\bη\b/g, "\\eta"], [/\bθ\b/g, "\\theta"], [/\bλ\b/g, "\\lambda"],
  [/\bμ\b/g, "\\mu"], [/\bπ\b/g, "\\pi"], [/\bρ\b/g, "\\rho"],
  [/\bσ\b/g, "\\sigma"], [/\bτ\b/g, "\\tau"], [/\bφ\b/g, "\\varphi"],
  [/\bψ\b/g, "\\psi"], [/\bω\b/g, "\\omega"],
  // Greek letters (uppercase)
  [/\bΣ\b/g, "\\Sigma"], [/\bΩ\b/g, "\\Omega"], [/\bΠ\b/g, "\\Pi"],
  [/\bΓ\b/g, "\\Gamma"], [/\bΔ\b/g, "\\Delta"], [/\bΛ\b/g, "\\Lambda"],
];

/** Pattern that identifies a "math character" – unicode math or ASCII formula chars */
const MATH_CHAR = /[∑∫∞→⟹⟺≤≥≠≈≡∈∉⊆⊂∩∪∀∃∅√·±₀₁₂₃₄₅₆₇₈₉ₙₖᵢⱼₐₑ⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏαβγδεζηθλμπρστφψωΣΩΠΓΔΛ]/;

/**
 * Convert a math-island string (already identified as math) into LaTeX.
 * Applies atom replacements and does basic cleanup.
 */
function toLatex(s: string): string {
  let result = s;
  for (const [pattern, replacement] of ATOMS) {
    result = result.replace(pattern, replacement);
  }
  // Trim surrounding whitespace from the LaTeX output
  return result.trim();
}

/**
 * Determine if a token looks like it belongs in a math context.
 * Heuristic: contains math chars, or looks like a formula (letters+digits+operators).
 */
function isMathIsland(s: string): boolean {
  if (!s.trim()) return false;
  if (MATH_CHAR.test(s)) return true;
  // Patterns like "a_n", "x^2", "n^k", simple fractions in formulas
  if (/[a-zA-Z][_^][a-zA-Z0-9]/.test(s)) return true;
  return false;
}

/**
 * Scan text for "math islands" – contiguous spans that contain math characters –
 * and wrap them in single-dollar `$...$` for KaTeX to render inline.
 *
 * Already-delimited spans (`$...$`, `\(...\)`, `\[...\]`) are left as-is.
 */
export function preprocessMath(text: string): string {
  // Skip the entire preprocessing step if there are no unicode math chars
  // and no explicit delimiters; avoids touching pure-Hebrew prose.
  if (!MATH_CHAR.test(text) && !/\$|\\\(|\\\[/.test(text)) return text;

  // Tokenise: split on existing LaTeX delimiters first so we don't double-wrap
  const DELIMITED = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(DELIMITED);

  return parts
    .map((part) => {
      // Already a LaTeX span – keep verbatim
      if (DELIMITED.test(part)) {
        DELIMITED.lastIndex = 0;
        return part;
      }
      DELIMITED.lastIndex = 0;

      // For plain-text parts, find math islands and wrap them
      // Strategy: split on Hebrew/space boundaries and check each token
      return part.replace(
        // A "math run": starts with or contains math char, bounded by whitespace/Hebrew punctuation
        /(^|[\s,;:!?()\[\]])([^,;:!?()\[\]\s֐-׿יִ-ﭏ]+)/g,
        (match, prefix, token) => {
          if (isMathIsland(token)) {
            const latex = toLatex(token);
            // Only wrap if conversion actually changed something or has math chars
            if (latex !== token || MATH_CHAR.test(token)) {
              return `${prefix}$${latex}$`;
            }
          }
          return match;
        },
      );
    })
    .join("");
}

/**
 * Light version: only converts unicode subscripts/superscripts and wraps
 * explicitly math-heavy strings. Safe to call on any string.
 */
export function convertUnicodeMath(s: string): string {
  let result = s;
  for (const [pattern, replacement] of ATOMS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
