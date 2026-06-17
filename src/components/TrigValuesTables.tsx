import { MathContent } from "@/components/study/MathContent";

/* ──────────────────────────────────────────────────────────────────────────
   Reference cards on the main dashboard: basic trig values + function domains.
   Content is verbatim from the provided source; math is rendered with the
   site's server-side KaTeX (the source's MathJax CDN doesn't run here).
   ────────────────────────────────────────────────────────────────────────── */

const r = String.raw;
const UNDEFINED = "לא מוגדר";

const ANGLES = [r`$0$`, r`$\frac{\pi}{6}$`, r`$\frac{\pi}{4}$`, r`$\frac{\pi}{3}$`, r`$\frac{\pi}{2}$`];

const TRIG_ROWS: { fn: string; vals: string[] }[] = [
  { fn: r`$\sin(x)$`, vals: [r`$0$`, r`$\frac{1}{2}$`, r`$\frac{\sqrt{2}}{2}$`, r`$\frac{\sqrt{3}}{2}$`, r`$1$`] },
  { fn: r`$\cos(x)$`, vals: [r`$1$`, r`$\frac{\sqrt{3}}{2}$`, r`$\frac{\sqrt{2}}{2}$`, r`$\frac{1}{2}$`, r`$0$`] },
  { fn: r`$\tan(x)=\frac{\sin(x)}{\cos(x)}$`, vals: [r`$0$`, r`$\frac{\sqrt{3}}{3}$`, r`$1$`, r`$\sqrt{3}$`, UNDEFINED] },
  { fn: r`$\cot(x)=\frac{\cos(x)}{\sin(x)}$`, vals: [UNDEFINED, r`$\sqrt{3}$`, r`$1$`, r`$\frac{\sqrt{3}}{3}$`, r`$0$`] },
];

const DOMAINS: { fn: string; domain: string; note: string }[] = [
  { fn: r`$e^x$`, domain: r`כל $x \in \mathbb{R}$`, note: r`מותר להציב גם מספרים שליליים, למשל $e^{-1}=\frac{1}{e}$.` },
  { fn: r`$\ln(x)$`, domain: r`$x>0$`, note: r`לא $x>1$ — מספיק שהביטוי בתוך הלוג יהיה חיובי.` },
  { fn: r`$\sqrt{x}$`, domain: r`$x\ge 0$`, note: r`השורש הרגיל מוגדר רק על מספרים אי־שליליים.` },
  { fn: r`$\frac{1}{x}$`, domain: r`$x\ne 0$`, note: r`אסור לחלק באפס.` },
  { fn: r`$\frac{1}{g(x)}$`, domain: r`$g(x)\ne 0$`, note: r`כל מכנה חייב להיות שונה מאפס.` },
  { fn: r`$\tan(x)=\frac{\sin(x)}{\cos(x)}$`, domain: r`$\cos(x)\ne 0$`, note: r`לא מוגדר ב־$x=\frac{\pi}{2}+k\pi$.` },
  { fn: r`$\cot(x)=\frac{\cos(x)}{\sin(x)}$`, domain: r`$\sin(x)\ne 0$`, note: r`לא מוגדר ב־$x=k\pi$.` },
  { fn: r`$\arcsin(x)$`, domain: r`$-1\le x\le 1$`, note: r`אפשר להכניס רק ערכים בין $-1$ ל־$1$.` },
  { fn: r`$\arccos(x)$`, domain: r`$-1\le x\le 1$`, note: r`גם כאן הקלט חייב להיות בין $-1$ ל־$1$.` },
  { fn: r`$\arctan(x)$`, domain: r`כל $x \in \mathbb{R}$`, note: r`מוגדר לכל מספר ממשי.` },
];

function Cell({ text }: { text: string }) {
  if (text === UNDEFINED) {
    return <span className="tvt-bad">{UNDEFINED}</span>;
  }
  return <MathContent text={text} className="tvt-m" />;
}

export function TrigValuesTables() {
  return (
    <section className="tvt-root" dir="rtl">
      <style>{TVT_CSS}</style>

      {/* ── Basic trig values ── */}
      <div className="tvt-card">
        <div className="tvt-head">
          <h2><MathContent text={r`טבלת ערכים בסיסיים — $\sin,\cos,\tan,\cot$`} /></h2>
          <p>הזוויות המרכזיות שצריך לזכור באינטגרלים והצבות.</p>
        </div>
        <div className="tvt-scroll">
          <table>
            <thead>
              <tr>
                <th><MathContent text={r`זווית $x$`} /></th>
                {ANGLES.map((a, i) => (
                  <th key={i}><MathContent text={a} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRIG_ROWS.map((row, i) => (
                <tr key={i}>
                  <td className="tvt-fn"><Cell text={row.fn} /></td>
                  {row.vals.map((v, j) => (
                    <td key={j}><Cell text={v} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tvt-note">
          <b>זכירה מהירה:</b>
          <MathContent text={r`$\tan(x)$ לא מוגדר כש־$\cos(x)=0$, לכן ב־$\frac{\pi}{2}$ הוא לא מוגדר.`} />
          <MathContent text={r`$\cot(x)$ לא מוגדר כש־$\sin(x)=0$, לכן ב־$0$ הוא לא מוגדר.`} />
        </div>
      </div>

      {/* ── Domains ── */}
      <div className="tvt-card">
        <div className="tvt-head">
          <h2>תחומי הגדרה בסיסיים</h2>
          <p>מה מותר להציב בכל פונקציה — קצר ולעניין.</p>
        </div>
        <div className="tvt-scroll">
          <table className="tvt-domains">
            <thead>
              <tr>
                <th>פונקציה</th>
                <th>תחום הגדרה</th>
                <th>מה לזכור</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((d, i) => (
                <tr key={i}>
                  <td className="tvt-fn"><MathContent text={d.fn} /></td>
                  <td><MathContent text={d.domain} /></td>
                  <td className="tvt-remember"><MathContent text={d.note} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tvt-note">
          <b>כלל זהב:</b>
          <MathContent text={r`ב־$\ln(\square)$ חייבים $\square>0$. בשורש $\sqrt{\square}$ חייבים $\square\ge0$. במכנה חייבים $\square\ne0$.`} />
        </div>
      </div>
    </section>
  );
}

const TVT_CSS = `
.tvt-root{margin-top:34px}
.tvt-card{
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:18px;
  box-shadow:0 10px 30px rgba(20,30,60,.05);
  overflow:hidden;
  margin:16px 0;
}
.tvt-head{
  padding:16px 20px;
  background:linear-gradient(135deg,var(--navy-light),var(--bg-card));
  border-bottom:1px solid var(--border);
}
.tvt-head h2{margin:0 0 4px;font-size:19px;font-weight:900;color:var(--text-primary)}
.tvt-head p{margin:0;font-size:14px;color:var(--text-muted)}
.tvt-scroll{overflow-x:auto}
.tvt-card table{width:100%;border-collapse:collapse;text-align:center;font-size:16px;min-width:520px}
.tvt-card th,.tvt-card td{border-bottom:1px solid var(--border);padding:13px 10px}
.tvt-card th{background:var(--bg-subtle);font-weight:800;color:var(--navy-mid)}
.tvt-card td.tvt-fn,.tvt-card th:first-child{font-weight:800;background:var(--bg-subtle);color:var(--navy)}
.tvt-card tr:last-child td{border-bottom:none}
.tvt-bad{color:var(--red,#c0392b);font-weight:800}
.tvt-m{display:inline-block}
.tvt-domains td:nth-child(3){text-align:right;font-size:15px;line-height:1.6;color:var(--text-secondary)}
.tvt-domains td,.tvt-domains th{text-align:center}
.tvt-note{
  padding:14px 20px 16px;
  font-size:14.5px;
  color:var(--text-secondary);
  background:var(--bg-subtle);
  border-top:1px solid var(--border);
  line-height:1.8;
}
.tvt-note b{color:var(--text-primary)}
`;
