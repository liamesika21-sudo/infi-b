// Consolidates per-lecture extractions into lecture-knowledge.json + regenerates
// rich week-chat-summaries.json. PV = lectures personally read & rewritten with
// clean proofs (only these render full proofs on the site).
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "extracted");
const L2W = { 1: 2, 2: 4, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 9, 10: 9 };
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
  const p = [`**שבוע ${lec.lecture} — ${title}**`, "", `📚 **מה למדנו השבוע:**`, lec.topics.join(" · ")];
  if (defs.length) { p.push("", `📝 **הגדרות מרכזיות:**`); defs.slice(0, 9).forEach((d) => p.push(`- ${d.name || clean(d.statement_he).slice(0, 60)}`)); }
  if (thms.length) { p.push("", `📐 **משפטים מרכזיים:**`); thms.slice(0, 10).forEach((t) => p.push(`- **${t.label}** — ${t.name}`)); }
  if (notes.length) { p.push("", `⚠️ **הערות חשובות:**`); notes.slice(0, 5).forEach((n) => p.push(`- ${n.name || clean(n.statement_he).slice(0, 70)}`)); }
  p.push("", `💡 **הכי חשוב לקחת מהשבוע:**`);
  const k = thms.slice(0, 3).map((t) => t.label).join(", ");
  p.push(k ? `לשלוט בניסוח המדויק ובתנאים של ${k}, ולדעת מתי כל משפט חל. שננו את ההגדרות הפורמליות — הן הבסיס לכל הוכחה.` : `לשלוט בהגדרות הפורמליות ובמשפטים המרכזיים של השבוע.`);
  p.push("", `💬 רוצה שאסביר משפט מסוים לעומק, אוכיח אותו, או אבנה שאלת תרגול בסגנון בחינה? פשוט תכתוב לי.`);
  return { week: lec.lecture, title, message: p.join("\n") };
});
fs.writeFileSync(path.join(__dirname, "week-chat-summaries.json"), JSON.stringify(ws, null, 2));

const v = out.filter((l) => l.verified).map((l) => l.lecture);
let proofs = 0; out.forEach((L) => L.items.forEach((it) => { if (it.proof_he) proofs++; }));
console.log("verified (full proofs):", v.join(","), "| proofs in data:", proofs);
