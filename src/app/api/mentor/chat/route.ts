import { NextResponse } from "next/server";
import { validateCookieForRequest, isProEmail } from "@/lib/simple-auth";
import { getMentorCreditLimit, getMentorUsage, incrementMentorUsage, saveMentorLog } from "@/lib/mentor-credits";
import { buildMentorFallbackResponse } from "@/lib/calculus2/mentor-fallback";
import { buildMentorSystemPrompt } from "@/lib/calculus2/mentor-system-prompt";

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function cleanMentorText(text: string) {
  return text
    .replace(/\s*\((?:יוסי|מקס)\s+מדבר\)\s*/g, " ")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*(?:יוסי|מקס)\s+מדבר\s*\)?\s*:?\s*/gim, "")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*לפי\s+(?:יוסי|מקס)\s*\)?\s*:?\s*/gim, "")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*(?:יוסי|מקס)\s+אומר\s*\)?\s*:?\s*/gim, "")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*(?:יוסי|מקס)\s+מדבר\s*\)?\s*:?\s*$/gim, "")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*לפי\s+(?:יוסי|מקס)\s*\)?\s*:?\s*$/gim, "")
    .replace(/^\s*(?:#{1,6}\s*)?\(?\s*(?:יוסי|מקס)\s+אומר\s*\)?\s*:?\s*$/gim, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function creditLimitHeader(limit: number | null): string {
  return limit === null ? "unlimited" : String(limit);
}

function isAnthropicCreditExhausted(status: number, body: string): boolean {
  const normalized = body.toLowerCase();
  return (
    status === 402 ||
    normalized.includes("credit balance is too low") ||
    normalized.includes("purchase credits")
  );
}

async function fallbackResponse(messages: Message[], used: number, limit: number | null, userEmail: string) {
  const userQuestion = messages[messages.length - 1].content;
  const text = cleanMentorText(await buildMentorFallbackResponse(messages));

  void saveMentorLog(userEmail, userQuestion, text);

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Credits-Used": String(used),
      "X-Credits-Limit": creditLimitHeader(limit),
      "X-Mentor-Mode": "fallback",
    },
  });
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
  const creditLimit = getMentorCreditLimit(auth.email);
  if (creditLimit !== null && used >= creditLimit) {
    return NextResponse.json(
      { error: `נגמרו הקרדיטים (${creditLimit}/${creditLimit})` },
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

  const systemPrompt = await buildMentorSystemPrompt();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Anthropic API key is missing");
    return fallbackResponse(messages, used, creditLimit, auth.email);
  }

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 700,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });
  } catch (error) {
    console.error("Anthropic network error", error);
    return fallbackResponse(messages, used, creditLimit, auth.email);
  }

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text().catch(() => "");
    console.error("Anthropic error", anthropicRes.status, err);
    if (isAnthropicCreditExhausted(anthropicRes.status, err)) {
      if (creditLimit === null) {
        return fallbackResponse(messages, used, creditLimit, auth.email);
      }

      return NextResponse.json(
        { error: "חשבון הקרדיט נגמר", code: "external_credit_exhausted" },
        { status: 402 }
      );
    }
    return fallbackResponse(messages, used, creditLimit, auth.email);
  }

  const encoder = new TextEncoder();
  const body = anthropicRes.body;
  if (!body) {
    console.error("Anthropic response is missing a stream body");
    return fallbackResponse(messages, used, creditLimit, auth.email);
  }

  const newUsage = creditLimit === null ? used : await incrementMentorUsage(auth.email);
  const responseUsage = creditLimit === null ? used : newUsage || used + 1;
  const userQuestion = messages[messages.length - 1].content;
  const userEmail = auth.email;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";
      let pendingText = "";

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
                pendingText += event.delta.text;
                const safeLength = Math.max(0, pendingText.length - 120);
                if (safeLength > 0) {
                  const chunk = cleanMentorText(pendingText.slice(0, safeLength));
                  pendingText = pendingText.slice(safeLength);
                  if (chunk) {
                    controller.enqueue(encoder.encode(chunk));
                    fullResponse += chunk;
                  }
                }
              }
            } catch {}
          }
        }
        const finalChunk = cleanMentorText(pendingText);
        if (finalChunk) {
          controller.enqueue(encoder.encode(finalChunk));
          fullResponse += finalChunk;
        }
      } finally {
        controller.close();
        // Save conversation log after stream completes
        if (fullResponse) {
          void saveMentorLog(userEmail, userQuestion, cleanMentorText(fullResponse));
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Credits-Used": String(responseUsage),
      "X-Credits-Limit": creditLimitHeader(creditLimit),
      "X-Mentor-Mode": "ai",
    },
  });
}
