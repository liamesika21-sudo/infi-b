import { validateCookieForRequest } from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return Response.json({ error: "לא מחובר" }, { status: 401 });
  }

  let text: string;
  try {
    const body = (await request.json()) as { text?: unknown };
    if (typeof body.text !== "string" || !body.text.trim()) throw new Error("invalid");
    text = body.text;
  } catch {
    return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "מפתח API חסר" }, { status: 500 });
  }

  const systemPrompt = `You are a math translator. Translate English text to Hebrew while preserving ALL LaTeX/KaTeX math expressions exactly as-is.

Rules:
- Translate ONLY the natural language English words to Hebrew
- Keep every LaTeX delimiter and math content completely unchanged: \\(...\\), \\[...\\], $...$, $$...$$
- Keep all LaTeX commands unchanged inside math delimiters
- Put a single space before and after each inline math expression \\(...\\) or $...$
- Put a newline before and after each display math expression \\[...\\] or $$...$$
- Do NOT add any explanation or commentary — output only the translated text
- The output should be in RTL Hebrew with math inline`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "שגיאה בתרגום" }, { status: 500 });
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const translated = data.content?.find((c) => c.type === "text")?.text ?? "";
  return Response.json({ translated });
}
