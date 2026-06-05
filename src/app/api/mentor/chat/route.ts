import { NextResponse } from "next/server";
import { validateCookieForRequest, isProEmail } from "@/lib/simple-auth";
import { getMentorUsage, incrementMentorUsage, saveMentorLog, MENTOR_CREDIT_LIMIT } from "@/lib/mentor-credits";
import { buildMentorSystemPrompt } from "@/lib/calculus2/mentor-system-prompt";

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const isPro = await isProEmail(auth.email);
  if (!isPro) {
    return NextResponse.json({ error: "המנטור זמין למנויי פרו בלבד" }, { status: 403 });
  }

  const used = await getMentorUsage(auth.email);
  if (used >= MENTOR_CREDIT_LIMIT) {
    return NextResponse.json(
      { error: `נגמרו הקרדיטים (${MENTOR_CREDIT_LIMIT}/${MENTOR_CREDIT_LIMIT})` },
      { status: 429 }
    );
  }

  let messages: Message[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) throw new Error("invalid");
    messages = (body.messages as Message[]).slice(-12).filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
    );
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      throw new Error("invalid");
    }
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const [systemPrompt] = await Promise.all([
    buildMentorSystemPrompt(),
    incrementMentorUsage(auth.email),
  ]);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "מפתח API חסר" }, { status: 500 });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text().catch(() => "");
    console.error("Anthropic error", anthropicRes.status, err);
    return NextResponse.json({ error: "שגיאה בשרת AI" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const body = anthropicRes.body;
  if (!body) {
    return NextResponse.json({ error: "שגיאה בשרת AI" }, { status: 502 });
  }

  const userQuestion = messages[messages.length - 1].content;
  const userEmail = auth.email;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const event = JSON.parse(data) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta" &&
                event.delta.text
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
                fullResponse += event.delta.text;
              }
            } catch {}
          }
        }
      } finally {
        controller.close();
        // Save conversation log after stream completes
        if (fullResponse) {
          void saveMentorLog(userEmail, userQuestion, fullResponse);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Credits-Used": String(used + 1),
      "X-Credits-Limit": String(MENTOR_CREDIT_LIMIT),
    },
  });
}
