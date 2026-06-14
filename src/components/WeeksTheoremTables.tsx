import katex from "katex";
import "katex/dist/katex.min.css";
import { WEEKS_THEOREM_TABLES, type TheoremRow } from "@/lib/calculus2/weeks-theorem-tables";

/* ──────────────────────────────────────────────────────────────────────────
   "טבלאות משפטים" — verbatim theorem-summary tables shown below the week cards.
   Content (Hebrew + inline \(...\) LaTeX) is rendered with server-side KaTeX so
   it works without the source's CDN auto-render. Wording/LaTeX is never altered.
   ────────────────────────────────────────────────────────────────────────── */

function renderMath(expr: string): string | null {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode: false,
      throwOnError: false,
      strict: false, // formulas legitimately contain Hebrew inside \text{...}
    });
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mathSpan(expr: string): string {
  const html = renderMath(expr);
  return html ? `<span class="wtt-m" dir="ltr">${html}</span>` : escapeHtml(`\\(${expr}\\)`);
}

/** Convert a cell (Hebrew + inline \(...\)) into safe HTML with KaTeX. When
 *  `whole` is true the entire string is treated as one math expression
 *  (used for a formula cell that has no \(...\) delimiters). */
function cellHtml(text: string, whole = false): string {
  if (whole) {
    const html = renderMath(text);
    return html ? `<span class="wtt-m" dir="ltr">${html}</span>` : escapeHtml(text);
  }
  let out = "";
  let last = 0;
  const re = /\\\(([\s\S]*?)\\\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out += escapeHtml(text.slice(last, m.index));
    out += mathSpan(m[1]);
    last = re.lastIndex;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function Row({ row }: { row: TheoremRow }) {
  const isFormula = !row.p3;
  const wholeMath = isFormula && !row.c3.includes("\\(");
  return (
    <tr>
      <td className="wtt-c1" data-label="נושא / משפט: " dangerouslySetInnerHTML={{ __html: cellHtml(row.c1) }} />
      <td className="wtt-c2" data-label="משפט: " dangerouslySetInnerHTML={{ __html: cellHtml(row.c2) }} />
      <td
        className={isFormula ? "wtt-c3 wtt-formula" : "wtt-c3"}
        data-label="נוסחה / זיהוי: "
        dangerouslySetInnerHTML={{ __html: cellHtml(row.c3, wholeMath) }}
      />
    </tr>
  );
}

export function WeeksTheoremTables() {
  return (
    <section className="wtt-root" dir="rtl">
      <style>{WTT_CSS}</style>

      <div className="wtt-head">
        <h2>טבלאות משפטים — אינפי ב</h2>
        <p>כל שורה כתובה כמו משפט קצר לזכור: מה המשפט אומר, ומה הסימן/הנוסחה שכדאי לזהות במבחן.</p>
      </div>

      {WEEKS_THEOREM_TABLES.map((tbl) => (
        <div className="wtt-card" key={tbl.caption}>
          <table>
            <caption>{tbl.caption}</caption>
            <thead>
              <tr>
                <th>נושא / משפט</th>
                <th>מה הוא אומר במשפט אחד</th>
                <th>נוסחה / זיהוי</th>
              </tr>
            </thead>
            <tbody>
              {tbl.rows.map((row, i) => (
                <Row row={row} key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

const WTT_CSS = `
.wtt-root{margin-top:34px}
.wtt-head{margin-bottom:14px}
.wtt-head h2{font-size:20px;font-weight:900;margin:0 0 4px;color:var(--text-primary)}
.wtt-head p{margin:0;font-size:14px;color:var(--text-muted)}
.wtt-card{
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:18px;
  box-shadow:0 10px 30px rgba(20,30,60,.05);
  margin:16px 0;
  overflow:hidden;
}
.wtt-card table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed}
.wtt-card caption{
  caption-side:top;
  text-align:right;
  background:linear-gradient(90deg,var(--navy-light),var(--bg-card));
  padding:13px 18px;
  font-size:17px;
  font-weight:900;
  color:var(--navy-mid);
  border-bottom:1px solid var(--border);
}
.wtt-card th,.wtt-card td{vertical-align:top;padding:12px 14px;border-bottom:1px solid var(--border);text-align:right}
.wtt-card th{font-size:13px;color:var(--navy-mid);background:var(--bg-subtle);font-weight:900}
.wtt-card tr:last-child td{border-bottom:0}
.wtt-card td.wtt-c1{width:20%;font-weight:800;color:var(--navy)}
.wtt-card td.wtt-c2{width:46%;font-size:15px;color:var(--text-secondary);line-height:1.65}
.wtt-card td.wtt-c3{width:34%;font-size:14.5px;color:var(--text-primary);background:linear-gradient(90deg,var(--teal-light),transparent)}
.wtt-card td.wtt-formula{direction:ltr;text-align:left;unicode-bidi:isolate}
.wtt-m{display:inline-block;direction:ltr;unicode-bidi:isolate}
.wtt-card .katex{font-size:1.02em}
@media(max-width:760px){
  .wtt-card table,.wtt-card thead,.wtt-card tbody,.wtt-card tr,.wtt-card th,.wtt-card td{display:block;width:100% !important}
  .wtt-card thead{display:none}
  .wtt-card tr{border-bottom:1px solid var(--border);padding:8px 0}
  .wtt-card tr:last-child{border-bottom:0}
  .wtt-card td{border:0;padding:6px 14px}
  .wtt-card td.wtt-formula{text-align:right;direction:ltr}
  .wtt-card td::before{content:attr(data-label);display:block;color:var(--navy-mid);font-weight:900;font-size:12.5px;margin-bottom:2px}
}
`;
