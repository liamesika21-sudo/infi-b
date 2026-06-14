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

      {/* Sticky in-section jump nav — pins below the header once you reach the tables */}
      <nav className="wtt-nav" aria-label="קפיצה להרצאה">
        <span className="wtt-nav-label">הרצאה</span>
        <div className="wtt-nav-pills">
          {WEEKS_THEOREM_TABLES.map((_, i) => (
            <a key={i} href={`#wtt-lec-${i + 1}`} className="wtt-nav-pill">
              {i + 1}
            </a>
          ))}
        </div>
      </nav>

      {WEEKS_THEOREM_TABLES.map((tbl, i) => (
        <div className="wtt-card" id={`wtt-lec-${i + 1}`} key={tbl.caption}>
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
.wtt-nav{
  position:sticky;
  top:56px;
  z-index:20;
  display:flex;
  align-items:center;
  gap:10px;
  margin:0 -4px 6px;
  padding:8px 10px;
  background:color-mix(in srgb, var(--bg-page) 88%, transparent);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  border:1px solid var(--border);
  border-radius:14px;
}
.wtt-nav-label{font-size:12.5px;font-weight:900;color:var(--text-muted);flex-shrink:0}
.wtt-nav-pills{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.wtt-nav-pills::-webkit-scrollbar{display:none}
.wtt-nav-pill{
  flex-shrink:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:30px;
  height:30px;
  padding:0 6px;
  border-radius:9px;
  font-size:13.5px;
  font-weight:800;
  text-decoration:none;
  color:var(--navy-mid);
  background:var(--navy-light);
  border:1px solid var(--navy-border);
  transition:opacity .15s, transform .15s;
}
.wtt-nav-pill:hover{opacity:.8;transform:translateY(-1px)}
.wtt-card{
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:18px;
  box-shadow:0 10px 30px rgba(20,30,60,.05);
  margin:16px 0;
  overflow:hidden;
  scroll-margin-top:104px;
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
