"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Sparkles, Lock, BookOpenCheck } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import weekSummariesRaw from "@/../data/generated/calculus2/week-chat-summaries.json";

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MentorStatus {
  isPro: boolean;
  used: number;
  limit: number;
  email?: string;
}

interface WeekSummary {
  week: number;
  title: string;
  message: string;
}

const WEEK_SUMMARIES = weekSummariesRaw as WeekSummary[];

// ── Math rendering ─────────────────────────────────────────────────────────

function renderMathToHtml(text: string): string {
  // Replace $$...$$ first, then $...$
  let result = text;

  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${math}$$`;
    }
  });

  result = result.replace(/\$([^$\n]+?)\$/g, (_, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });

  return result;
}

function formatMessageHtml(content: string): string {
  const lines = content.split("\n");
  const parts: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw;

    if (line.trim() === "") {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push("<br/>");
      continue;
    }

    // Bold: **text**
    const processed = renderMathToHtml(
      line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^#{1,3} (.+)$/, "<strong>$1</strong>")
    );

    if (line.startsWith("- ") || line.startsWith("• ")) {
      if (!inList) { parts.push('<ul style="margin: 4px 0; padding-right: 16px;">'); inList = true; }
      parts.push(`<li>${processed.replace(/^[•\-] /, "")}</li>`);
    } else {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push(`<span>${processed}</span><br/>`);
    }
  }

  if (inList) parts.push("</ul>");
  return parts.join("");
}

// ── Starter questions ──────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  "הסבר את מבחן ד'אלמבר (מנה) ומתי משתמשים בו",
  "מה ההבדל בין התכנסות מוחלטת לבתנאי?",
  "איך מחשבים רדיוס התכנסות של טור חזקות?",
  "הסבר את משפט לופיטל עם דוגמה",
  "מה זה טור מקלורן ואיך בונים אותו?",
  "איך מוכיחים שסדרה רקורסיבית מתכנסת?",
  "מה הטעות הכי נפוצה באינטגרלים לא אמיתיים?",
  "בני לי שאלת בחינה על טורי חזקות",
];

// ── Pro gate ───────────────────────────────────────────────────────────────

const PRO_FEATURES = [
  { icon: "🧠", title: "הסבר קצר ומדויק", desc: "הסברים אינטואיטיביים, טיפים לבחינה ונקודות הדגש מהתרגולים" },
  { icon: "📐", title: "ניסוח פורמלי כשצריך", desc: "הגדרות והוכחות בניסוח המדויק של הקורס" },
  { icon: "✏️", title: "שאלות בסגנון בחינה", desc: "תרגול שאלות לפי הדפוסים שמופיעים במבחנים" },
  { icon: "🎯", title: "ממוקד בחומר בלבד", desc: "עונה רק על נושאי הקורס — גבולות, סדרות, אינטגרלים, טורים" },
];

function ProGate() {
  return (
    <div className="mx-auto max-w-lg py-12 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: "rgba(7,22,42,0.08)", border: "1px solid var(--border)" }}
        >
          <Lock className="h-9 w-9" style={{ color: "var(--navy-mid)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            מנטור AI — תוכנית פרו
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            צ׳אט AI שמכיר את ההרצאות והתרגולים — שואל, מסביר, מדריך ובונה
            שאלות בסגנון הבחינה. מוגבל ל-150 הודעות לכיסוי עלויות.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {PRO_FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border p-4 space-y-1.5"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
          >
            <span className="text-xl">{f.icon}</span>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{f.title}</p>
            <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl border p-6 text-center space-y-4"
        style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            שדרג תכנית
          </p>
          <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            ₪38 <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>חד פעמי</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>כולל גישה מלאה לפלטפורמה + מנטור AI</p>
        </div>
        <a
          href="https://wa.me/972505730440?text=%D7%90%D7%A0%D7%99%20%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%A9%D7%93%D7%A8%D7%92%20%D7%9C%D7%A4%D7%A8%D7%95%20%D7%9E%D7%A0%D7%98%D7%95%D7%A8%20AI"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl py-3 text-sm font-bold text-white text-center transition hover:opacity-90"
          style={{ background: "var(--navy-mid)" }}
        >
          שדרג עכשיו — צור קשר
        </a>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          יש לך כבר גישה? בדוק שנכנסת עם האימייל הנכון
        </p>
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
        style={
          isUser
            ? { background: "var(--navy-mid)", color: "#fff" }
            : { background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
        }
      >
        {isUser ? "אני" : "M"}
      </div>

      {/* Bubble */}
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "max-w-[80%]" : "max-w-[92%]"}`}
        style={
          isUser
            ? { background: "var(--navy-mid)", color: "#fff" }
            : {
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }
        }
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: formatMessageHtml(msg.content) }}
            style={{ direction: "rtl" }}
          />
        )}
        {isStreaming && (
          <span
            className="inline-block w-1.5 h-4 rounded-sm animate-pulse ml-0.5"
            style={{ background: "var(--navy-mid)", verticalAlign: "middle" }}
          />
        )}
      </div>
    </div>
  );
}

// ── Chat persistence ───────────────────────────────────────────────────────

const CHAT_STORAGE_KEY = "infi-mentor-chat-v1";

function loadStoredMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Message[];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

// ── Main chat UI ───────────────────────────────────────────────────────────

function ChatInterface({ status }: { status: MentorStatus }) {
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [creditsUsed, setCreditsUsed] = useState(status.used);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Persist messages on every change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      if (creditsUsed >= status.limit) {
        setError("הגעת למגבלת השימוש במנטור. לפרטים צור קשר.");
        return;
      }

      setError(null);
      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/mentor/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "שגיאה לא צפויה");
        }

        // Update credit count from header
        const newUsed = res.headers.get("X-Credits-Used");
        if (newUsed) setCreditsUsed(parseInt(newUsed, 10));

        // Stream the response
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingContent(accumulated);
        }

        // Finalize
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
        setStreamingContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בלתי צפויה");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, creditsUsed, status.limit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const showStarters = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)", minHeight: "500px" }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between rounded-t-2xl px-5 py-3.5"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--navy-mid)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              מנטור אינפי ב׳
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              מבוסס על חומר הקורס
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              saveMessages([]);
            }}
            className="text-[11px] font-bold transition hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            נקה שיחה
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ border: "1px solid var(--border)", borderTop: "none", borderBottom: "none" }}
      >
        {/* Starter questions */}
        {showStarters && (
          <div className="py-4 space-y-5">
            {/* Week summaries */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <BookOpenCheck className="h-4 w-4 shrink-0" style={{ color: "var(--teal)" }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  סיכום שבועי — מה חזרתי, מה חשוב, מה לשיעורי בית
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEEK_SUMMARIES.map((w) => (
                  <button
                    key={w.week}
                    type="button"
                    onClick={() => void sendMessage(w.message)}
                    className="rounded-xl border px-3 py-2 text-right text-xs font-bold transition hover:opacity-80"
                    style={{
                      borderColor: "var(--teal-border)",
                      background: "var(--teal-light)",
                      color: "var(--teal)",
                    }}
                  >
                    שבוע {w.week}
                    <span
                      className="block text-[10px] font-normal mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {w.title.length > 22 ? w.title.slice(0, 22) + "…" : w.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: "var(--border)" }} />

            {/* Quick question starters */}
            <div>
              <p
                className="text-sm font-semibold mb-3 text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                שאל אותי כל דבר על חומר הקורס
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="rounded-xl border px-3 py-2.5 text-right text-sm transition hover:opacity-80 cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg-subtle)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message history */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {/* Streaming response */}
        {isLoading && streamingContent && (
          <MessageBubble
            msg={{ role: "assistant", content: streamingContent }}
            isStreaming
          />
        )}

        {/* Loading indicator (before first chunk) */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              M
            </div>
            <div
              className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full animate-bounce"
                  style={{
                    background: "var(--text-muted)",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "rgba(220,38,38,0.08)",
              borderColor: "rgba(220,38,38,0.25)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="shrink-0 flex items-end gap-2.5 rounded-b-2xl px-4 py-3"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderTop: "1px solid var(--border)",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="שאל שאלה על חומר הקורס... (Enter לשליחה, Shift+Enter לשורה חדשה)"
          rows={1}
          disabled={isLoading || creditsUsed >= status.limit}
          className="flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition"
          style={{
            background: "var(--bg-page)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            direction: "rtl",
            minHeight: "42px",
            maxHeight: "160px",
          }}
        />
        <button
          onClick={() => void sendMessage(input)}
          disabled={!input.trim() || isLoading || creditsUsed >= status.limit}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition disabled:opacity-40"
          style={{ background: "var(--navy-mid)", color: "#fff" }}
        >
          <Send className="h-4 w-4" style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>

    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MentorPage() {
  const [status, setStatus] = useState<MentorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mentor/status")
      .then((r) => r.json())
      .then((data: { isPro?: boolean; used?: number; limit?: number; email?: string }) => {
        setStatus({
          isPro: data.isPro ?? false,
          used: data.used ?? 0,
          limit: data.limit ?? 150,
          email: data.email,
        });
      })
      .catch(() => {
        setStatus({ isPro: false, used: 0, limit: 150 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-2 w-2 rounded-full animate-bounce"
              style={{ background: "var(--text-muted)", animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!status?.isPro) {
    return <ProGate />;
  }

  return <ChatInterface status={status} />;
}
