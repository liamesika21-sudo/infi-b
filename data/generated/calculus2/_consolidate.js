// Consolidates per-lecture extractions into lecture-knowledge.json + regenerates
// rich week-chat-summaries.json. PV = lectures personally read & rewritten with
// clean proofs (only these render full proofs on the site).
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "extracted");
// Course structure: week N contains lecture (N-1), recitation N, assignment N.
// Week 1 has no lecture (recitation 1 + assignment 1 only). So lecture L lives in week L+1.
const L2W = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11 };
const PV = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // <-- update as lectures are hand-verified

const out = [];
for (let n = 1; n <= 10; n++) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, `lecture-${n}.json`), "utf8"));
  out.push({ lecture: n, week: L2W[n], verified: PV.includes(n), date: d.date || null, topics: d.topics || [], items: d.items || [] });
}
fs.writeFileSync(path.join(__dirname, "lecture-knowledge.json"), JSON.stringify(out, null, 2));

const clean = (s) => (s || "").replace(/\s*\n\s*/g, " ").trim();
const ws = out.map((lec) => {
  const defs = lec.items.filter((i) => i.kind === "definition");
  const thms = lec.items.filter((i) => ["theorem", "corollary", "lemma"].includes(i.kind));
  const notes = lec.items.filter((i) => i.kind === "note");
  const title = lec.topics.slice(0, 3).join(", ");
  const p = [`**שבוע ${lec.week} — ${title}**`, "", `📚 **מה למדנו השבוע (הרצאה ${lec.lecture}):**`, lec.topics.join(" · ")];
  if (defs.length) { p.push("", `📝 **הגדרות מרכזיות:**`); defs.slice(0, 9).forEach((d) => p.push(`- ${d.name || clean(d.statement_he).slice(0, 60)}`)); }
  if (thms.length) { p.push("", `📐 **משפטים מרכזיים:**`); thms.slice(0, 10).forEach((t) => p.push(`- **${t.label}** — ${t.name}`)); }
  if (notes.length) { p.push("", `⚠️ **הערות חשובות:**`); notes.slice(0, 5).forEach((n) => p.push(`- ${n.name || clean(n.statement_he).slice(0, 70)}`)); }
  p.push("", `💡 **הכי חשוב לקחת מהשבוע:**`);
  const k = thms.slice(0, 3).map((t) => t.label).join(", ");
  p.push(k ? `לשלוט בניסוח המדויק ובתנאים של ${k}, ולדעת מתי כל משפט חל. שננו את ההגדרות הפורמליות — הן הבסיס לכל הוכחה.` : `לשלוט בהגדרות הפורמליות ובמשפטים המרכזיים של השבוע.`);
  p.push("", `💬 רוצה שאסביר משפט מסוים לעומק, אוכיח אותו, או אבנה שאלת תרגול בסגנון בחינה? פשוט תכתוב לי.`);
  return { week: lec.week, title, message: p.join("\n") };
});
// Week 1 has no lecture — opening week with recitation 1 + assignment 1 (prerequisite review).
ws.unshift({
  week: 1,
  title: "שבוע פתיחה — תרגול 1 ומטלה 1",
  message: [
    `**שבוע 1 — שבוע פתיחה**`, "",
    `📚 **מה יש השבוע:**`,
    `שבוע הפתיחה של הקורס כולל את תרגול 1 ואת מטלה 1 — עדיין ללא הרצאה חדשה (ההרצאות מתחילות בשבוע 2).`, "",
    `📝 **על מה חוזרים:**`,
    `חזרה על חומר הבסיס מאינפי 1 — סדרות, גבולות, רציפות ונגזרות — שעליו נשען כל הקורס.`, "",
    `💡 **הכי חשוב לקחת מהשבוע:**`,
    `לוודא שליטה בהגדרת הגבול, ברציפות ובכללי הגזירה, כי הם הבסיס לאינטגרלים, לטורים ולטורי החזקות שיבואו בהמשך.`, "",
    `💬 רוצה שאסביר נושא בסיס מאינפי 1, או אבנה שאלת תרגול בסגנון בחינה? פשוט תכתוב לי.`,
  ].join("\n"),
});
fs.writeFileSync(path.join(__dirname, "week-chat-summaries.json"), JSON.stringify(ws, null, 2));

const v = out.filter((l) => l.verified).map((l) => l.lecture);
let proofs = 0; out.forEach((L) => L.items.forEach((it) => { if (it.proof_he) proofs++; }));
console.log("verified (full proofs):", v.join(","), "| proofs in data:", proofs);
