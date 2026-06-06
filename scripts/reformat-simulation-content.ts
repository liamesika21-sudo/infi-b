/**
 * Reformat simulation question content with Claude.
 * Adds KaTeX delimiters and proper line breaks to raw OCR text.
 *
 * Run: npx tsx scripts/reformat-simulation-content.ts
 */

import fs from "fs";
import path from "path";

const SIM_FILE = path.resolve(
  __dirname,
  "../data/generated/calculus2/simulation-exams.json"
);

const SYSTEM_PROMPT = `אתה עוזר שמעצב מחדש טקסט מתמטי עברי שחולץ מ-PDF באמצעות OCR.

המשימה שלך:
1. הוסף סוגריים KaTeX/LaTeX נכונים סביב כל ביטוי מתמטי:
   - מתמטיקה אינליין: $...$
   - משוואות עצמאיות (שורה שלמה): $$...$$
2. הוסף שורות חדשות במקומות לוגיים:
   - לפני ואחרי • (bullets)
   - לפני פתרון: / תשובה:
   - לפני דוגמאות: / דוגמה:
   - לפני תזכורת:
   - לפני משפטים/טענות מוספרים
   - בין שאלות מספרים (.1 .2 .3)
3. תקן סדר הפוך של טקסט OCR מ-PDF עברי אם צריך
4. שמור את כל הטקסט העברי בדיוק — אל תוסיף/תמחק תוכן

דפוסים נפוצים להמיר:
- lim n→∞ → $\\lim_{n \\to \\infty}$
- lim n→∞ f(n) = L → $\\lim_{n \\to \\infty} f(n) = L$
- ∞ ∑ n=k an → $\\sum_{n=k}^{\\infty} a_n$
- N ∑ n=k an → $\\sum_{n=k}^{N} a_n$
- ∑ n=1 → $\\sum_{n=1}^{\\infty}$
- n √an → $\\sqrt[n]{a_n}$
- an+1/an → $\\frac{a_{n+1}}{a_n}$
- an+1 an → $\\frac{a_{n+1}}{a_n}$
- 1/np → $\\frac{1}{n^p}$
- 1 np → $\\frac{1}{n^p}$
- np = → $n^p =$
- p ≤ 1 → $p \\leq 1$
- p > 1 → $p > 1$
- ∈ R → $\\in \\mathbb{R}$
- ∈ Z → $\\in \\mathbb{Z}$
- ∈ N → $\\in \\mathbb{N}$
- ⌊x⌋ → $\\lfloor x \\rfloor$
- → (בהקשר מתמטי) → $\\to$
- ≤ (בהקשר מתמטי) → $\\leq$
- ≥ (בהקשר מתמטי) → $\\geq$
- 6= → $\\neq$
- < ∞ → $< \\infty$
- = ∞ → $= \\infty$
- π/2 → $\\frac{\\pi}{2}$
- arctan → $\\arctan$
- α(n) → $\\alpha(n)$

החזר רק את הטקסט המעוצב מחדש, ללא הסבר.`;

async function callClaude(content: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `עצב מחדש את הטקסט הבא:\n\n${content}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { content: Array<{ text: string }> };
  return json.content[0]?.text?.trim() ?? content;
}

async function main() {
  const dotenvPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(dotenvPath)) {
    for (const line of fs.readFileSync(dotenvPath, "utf8").split("\n")) {
      const [key, ...vals] = line.split("=");
      if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
    }
  }

  const sims = JSON.parse(fs.readFileSync(SIM_FILE, "utf8")) as Array<{
    id: string;
    title: string;
    questions: Array<{ id: string; content: string; [key: string]: unknown }>;
    [key: string]: unknown;
  }>;

  let processed = 0;
  const total = sims.reduce((s, sim) => s + sim.questions.length, 0);

  for (const sim of sims) {
    console.log(`\n📚 ${sim.title}`);
    for (const q of sim.questions) {
      process.stdout.write(`  Q${q.id} (${q.content.length}ch)... `);
      try {
        const formatted = await callClaude(q.content);
        q.content = formatted;
        processed++;
        console.log(`✓ (${formatted.length}ch)`);
      } catch (e) {
        console.log(`✗ ${(e as Error).message}`);
      }
      // Rate limit pause
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  fs.writeFileSync(SIM_FILE, JSON.stringify(sims, null, 2), "utf8");
  console.log(`\n✅ עודכנו ${processed}/${total} שאלות ← ${SIM_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
