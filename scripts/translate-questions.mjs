// Translates English questions in question-bank.json and saves contentHe field.
// Run: node scripts/translate-questions.mjs

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const BANK_PATH = join(__dir, "../data/generated/calculus2/question-bank.json");

const SYSTEM = `You are a math translator. Translate the English text to Hebrew while preserving ALL LaTeX/KaTeX math exactly as-is.

Rules:
- Translate ONLY the natural language English words to Hebrew
- Keep every LaTeX delimiter and math content completely unchanged: \\(...\\), \\[...\\], $...$, $$...$$
- Put a single space before and after each inline math expression
- Put a newline before and after each display math \\[...\\] or $$...$$
- Do NOT add explanation — output only the translated text`;

async function translate(text, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.find((c) => c.type === "text")?.text ?? "";
}

// Strip LaTeX commands before checking language ratio
function stripLatex(text) {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+?\$/g, " ")
    .replace(/\\\[[\s\S]*?\\\]/g, " ")
    .replace(/\\\([\s\S]*?\\\)/g, " ")
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ");
}

function isEnglish(text) {
  const plain = stripLatex(text);
  const heb = (plain.match(/[א-ת]/g) ?? []).length;
  const eng = (plain.match(/[a-zA-Z]/g) ?? []).length;
  return eng > heb;
}

function needsTranslation(q) {
  if (q.contentHe) {
    // Re-translate if contentHe is still mostly English (failed last time)
    return isEnglish(q.contentHe);
  }
  return isEnglish(q.content);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY env var");
    process.exit(1);
  }

  const questions = JSON.parse(await readFile(BANK_PATH, "utf8"));
  const toTranslate = questions.filter(needsTranslation);

  console.log(`Translating ${toTranslate.length} questions...`);

  let done = 0;
  for (const q of toTranslate) {
    try {
      q.contentHe = await translate(q.content, apiKey);
      done++;
      process.stdout.write(`\r${done}/${toTranslate.length}`);
    } catch (err) {
      console.error(`\nFailed: ${q.id}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  await writeFile(BANK_PATH, JSON.stringify(questions, null, 2) + "\n", "utf8");
  console.log(`\nDone. Saved ${done} translations.`);
}

main().catch(console.error);
