/**
 * Reformat question-bank.json content with Claude.
 * Cleans OCR-damaged Hebrew/English calculus text and adds proper KaTeX delimiters.
 *
 * Run: npx tsx scripts/reformat-question-bank.ts
 * Resume from a checkpoint: the script skips questions already containing $ signs.
 */

import fs from "fs";
import path from "path";

const QB_FILE = path.resolve(
  __dirname,
  "../data/generated/calculus2/question-bank.json"
);

const SYSTEM_PROMPT = `אתה עוזר מתמטי שמנקה ומסדר מחדש טקסט מחדו"א ב' (Calculus II) שחולץ מ-PDF באמצעות OCR.

הטקסט מגיע מסביבה עברית (RTL) ולכן הוא לעיתים קרובות הפוך, מגורם, או לא סדור. המשימה שלך:

1. **הוסף סוגריים KaTeX נכונים** סביב כל ביטוי מתמטי:
   - מתמטיקה אינליין: $...$
   - משוואות עצמאיות בשורה נפרדת: $$...$$

2. **תקן OCR נפוץ של הטקסט**:
   - "6 =" → "≠" (מיסתפורמציה OCR של ≠)
   - "? ∞" ,"0 0" ,"∞ ∞" → $\frac{0}{0}$ / $\frac{\infty}{\infty}$
   - אותיות מתמטיות Unicode כמו 𝑥 𝑓 𝑔 𝑛 𝑘 𝑎 𝑏 𝐿 𝑅 → ASCII רגיל בתוך LaTeX: $x$, $f$, $g$ וכו'
   - תווי PDF פרטיים כמו     → אלה הם סוגרים של פונקציה חלקית (piecewise), תמחק אותם ותכתוב את הפונקציה בסינטקס LaTeX

3. **סדר שורות ורווחים**:
   - לפני כל שאלה מספרית חדשה (1., 2., .1, .2, א., ב.) — שורה חדשה
   - לפני "פתרון:" / "Solution:" — שורה חדשה ריקה
   - לפני "• " (bullets) — שורה חדשה
   - לפני כל "תזכורת:" / "הגדרה:" / "משפט:" / "הערה:" — שורה חדשה ריקה
   - בין חלקי שאלה (a), (b), (c) — שורות חדשות

4. **המרות LaTeX נפוצות**:
   - lim x→a / lim_{x→a} → $\lim_{x \to a}$
   - lim x→x+ 0 → $\lim_{x \to x_0^+}$
   - lim x→x- 0 → $\lim_{x \to x_0^-}$
   - lim x→0+ → $\lim_{x \to 0^+}$
   - ∑ n=k אין/∞ → $\sum_{n=k}^{\infty}$
   - ∫ab → $\int_a^b$
   - f′(x) / f '(x) → $f'(x)$
   - f(x)/g(x) כשמפורד בטקסט → $\frac{f(x)}{g(x)}$
   - an+1/an → $\frac{a_{n+1}}{a_n}$
   - √x / √(x) → $\sqrt{x}$
   - x0, x_0 → $x_0$
   - R (בהקשר מתמטי) → $\mathbb{R}$, N → $\mathbb{N}$, Q → $\mathbb{Q}$
   - ∈ → $\in$, ⊆ → $\subseteq$, ∀ → $\forall$, ∃ → $\exists$
   - ∞ → $\infty$
   - ≤ → $\leq$, ≥ → $\geq$, ≠ → $\neq$

5. **שמור על כל הטקסט העברי המקורי** — אל תוסיף תוכן ואל תמחק תוכן, רק סדר ועצב.

6. **לפקודות שמות**:
   - sin, cos, tan, ln, log, exp, arctan, arcsin, arccos → $\sin$, $\cos$ וכו' בתוך LaTeX
   - AOL, L'H = כינויים ל-L'Hopital — שמור אותם כטקסט רגיל

החזר רק את הטקסט המעוצב מחדש, ללא הסבר, ללא \`\`\` קוד.`;

interface QuestionItem {
  id: string;
  sourceType: string;
  sourceFileId: string;
  questionNumber?: string;
  content: string;
  [key: string]: unknown;
}

function loadEnv() {
  const dotenvPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(dotenvPath)) return;
  for (const line of fs.readFileSync(dotenvPath, "utf8").split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    }
  }
}

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

function needsFormatting(content: string): boolean {
  // Skip if already has LaTeX delimiters
  return !content.includes("$") && !content.includes("\\(") && !content.includes("\\[");
}

async function main() {
  loadEnv();

  const questions: QuestionItem[] = JSON.parse(fs.readFileSync(QB_FILE, "utf8"));

  const toProcess = questions.filter((q) => needsFormatting(q.content));
  console.log(`\n📚 שאלות לעיבוד: ${toProcess.length}/${questions.length}`);

  if (toProcess.length === 0) {
    console.log("✅ הכל כבר מעוצב, אין מה לעשות.");
    return;
  }

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!needsFormatting(q.content)) {
      process.stdout.write(`  [${i + 1}/${questions.length}] ${q.id.slice(0, 40)} — דלג\n`);
      continue;
    }

    process.stdout.write(`  [${i + 1}/${questions.length}] ${q.id.slice(0, 50)}... `);

    try {
      const formatted = await callClaude(q.content);
      q.content = formatted;
      processed++;
      console.log(`✓ (${q.content.length}ch)`);
    } catch (e) {
      failed++;
      console.log(`✗ ${(e as Error).message}`);
    }

    // Save checkpoint every 10 questions
    if ((processed + failed) % 10 === 0) {
      fs.writeFileSync(QB_FILE, JSON.stringify(questions, null, 2), "utf8");
      console.log(`  💾 שמירת checkpoint`);
    }

    // Rate limit: 400ms between calls
    await new Promise((r) => setTimeout(r, 400));
  }

  fs.writeFileSync(QB_FILE, JSON.stringify(questions, null, 2), "utf8");
  console.log(`\n✅ עודכנו ${processed}/${toProcess.length} שאלות (${failed} כשלו) ← ${QB_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
