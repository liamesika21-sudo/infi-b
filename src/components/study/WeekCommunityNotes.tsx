"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, Trash2, Tag, User, X } from "lucide-react";
import { MathContent } from "@/components/study/MathContent";

/* Public, per-week community notes. Any logged-in user can post a note —
   optionally tagged to a homework / recitation question, theorem or definition
   from the week — publicly, with their name or anonymously. */

type TagType = "homework" | "homework-question" | "recitation" | "theorem" | "definition" | "general";

export interface TagTarget {
  type: TagType;
  label: string;
  anchor?: string;
}

interface PublicNote {
  id: string;
  weekNumber: number;
  body: string;
  authorName: string;
  anonymous: boolean;
  tag?: { type: TagType; label: string; anchor?: string };
  createdAt: string;
  isMine: boolean;
}

const GROUP_LABEL: Record<TagType, string> = {
  homework: "מטלה",
  "homework-question": "שאלה במטלה",
  recitation: "שאלה בתרגול",
  theorem: "משפט מההרצאה",
  definition: "הגדרה מההרצאה",
  general: "כללי",
};

const GROUP_ORDER: TagType[] = ["homework", "homework-question", "recitation", "theorem", "definition", "general"];

export function WeekCommunityNotes({
  weekNumber,
  tagTargets,
}: {
  weekNumber: number;
  tagTargets: TagTarget[];
}) {
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // form state
  const [body, setBody] = useState("");
  const [tagIdx, setTagIdx] = useState<string>(""); // index into tagTargets, or "" = none
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/community-notes?week=${weekNumber}`);
        const data = await res.json();
        if (active && data.ok) setNotes(data.notes as PublicNote[]);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [weekNumber]);

  async function submit() {
    if (!body.trim()) {
      setError("צריך לכתוב תוכן להערה");
      return;
    }
    setSubmitting(true);
    setError(null);
    const target = tagIdx !== "" ? tagTargets[Number(tagIdx)] : undefined;
    try {
      const res = await fetch("/api/community-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber,
          body: body.trim(),
          anonymous,
          authorName: anonymous ? undefined : name.trim() || undefined,
          tag: target ? { type: target.type, label: target.label, anchor: target.anchor } : undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "שגיאה בפרסום ההערה");
        return;
      }
      setNotes((prev) => [data.note as PublicNote, ...prev]);
      setBody("");
      setTagIdx("");
      setOpen(false);
    } catch {
      setError("שגיאת רשת — נסי שוב");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    const prev = notes;
    setNotes((n) => n.filter((x) => x.id !== id)); // optimistic
    try {
      const res = await fetch(`/api/community-notes?week=${weekNumber}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) setNotes(prev); // revert
    } catch {
      setNotes(prev);
    }
  }

  return (
    <section id="community-notes" className="mb-8 scroll-mt-24">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "var(--text-muted)" }}>
            הערות קהילה
          </p>
          <h2 className="text-xl font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            מה הסטודנטים שמו לב אליו
          </h2>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-mid))" }}
        >
          {open ? <X className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
          {open ? "סגירה" : "הוספת הערה"}
        </button>
      </div>

      {/* ── Add form ── */}
      {open && (
        <div className="mb-4 rounded-xl border p-4" style={{ borderColor: "var(--navy-border)", background: "var(--navy-light)" }}>
          <label className="mb-1.5 block text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            ההערה שלך (אפשר לכתוב מתמטיקה עם $...$)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            dir="rtl"
            placeholder="משהו שעלה בתרגיל, טריק, נקודה שחשוב לשים אליה לב..."
            className="w-full resize-y rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "#fff", color: "var(--text-primary)" }}
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* Tag selector */}
            <div>
              <label className="mb-1 block text-xs font-black" style={{ color: "var(--text-secondary)" }}>
                קישור לתרגיל / משפט (אופציונלי)
              </label>
              <select
                value={tagIdx}
                onChange={(e) => setTagIdx(e.target.value)}
                dir="rtl"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", background: "#fff", color: "var(--text-primary)" }}
              >
                <option value="">— ללא תיוג —</option>
                {GROUP_ORDER.map((group) => {
                  const items = tagTargets
                    .map((t, i) => ({ t, i }))
                    .filter(({ t }) => t.type === group);
                  if (items.length === 0) return null;
                  return (
                    <optgroup key={group} label={GROUP_LABEL[group]}>
                      {items.map(({ t, i }) => (
                        <option key={i} value={i}>
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Identity */}
            <div>
              <label className="mb-1 block text-xs font-black" style={{ color: "var(--text-secondary)" }}>
                שם להצגה
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={anonymous}
                dir="rtl"
                placeholder={anonymous ? "אנונימי" : "השם שלך (אופציונלי)"}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                style={{ borderColor: "var(--border)", background: "#fff", color: "var(--text-primary)" }}
              />
              <label className="mt-2 flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                לפרסם באופן אנונימי
              </label>
            </div>
          </div>

          {error && <p className="mt-2 text-xs font-bold" style={{ color: "var(--red-mid)" }}>{error}</p>}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-black text-white transition disabled:opacity-60"
              style={{ background: "var(--navy)" }}
            >
              {submitting ? "מפרסם..." : "פרסום לכולם"}
            </button>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              ההערה תופיע כאן לכל מי שלומד את השבוע.
            </p>
          </div>
        </div>
      )}

      {/* ── Notes list ── */}
      {loading ? (
        <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>טוען הערות...</p>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-6 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            עדיין אין הערות לשבוע זה. היי הראשונה לשתף משהו שעזר לך! 💡
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={() => remove(note.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function NoteCard({ note, onDelete }: { note: PublicNote; onDelete: () => void }) {
  return (
    <article className="rounded-xl border bg-white p-4" style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {note.tag &&
          (note.tag.anchor ? (
            <a
              href={`#${note.tag.anchor}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition hover:opacity-80"
              style={{ background: "var(--teal-light)", color: "var(--teal)", border: "1px solid var(--teal-border)" }}
            >
              <Tag className="h-3 w-3" />
              {note.tag.label}
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold"
              style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              <Tag className="h-3 w-3" />
              {note.tag.label}
            </span>
          ))}
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <User className="h-3 w-3" />
          {note.authorName}
        </span>
        <span className="text-xs" style={{ color: "var(--border-strong)" }}>·</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(note.createdAt)}</span>
        {note.isMine && (
          <button
            onClick={onDelete}
            className="mr-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold transition hover:bg-[var(--red-light)]"
            style={{ color: "var(--red-mid)" }}
            aria-label="מחיקת ההערה שלי"
          >
            <Trash2 className="h-3 w-3" />
            מחיקה
          </button>
        )}
      </div>
      <MathContent text={note.body} className="text-sm leading-7" />
    </article>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "numeric", year: "2-digit" });
  } catch {
    return "";
  }
}
