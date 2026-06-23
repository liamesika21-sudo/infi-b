import { randomUUID } from "crypto";

/* Public, per-week community notes. Any logged-in user can post a note tied to
   a week — optionally tagged to a homework assignment, a specific homework /
   recitation question, or a theorem / definition from that week's lecture.
   Shared across all users (server-persisted), unlike the private notebook. */

export type CommunityNoteTagType =
  | "homework"
  | "homework-question"
  | "recitation"
  | "theorem"
  | "definition"
  | "general";

export type CommunityNoteTag = {
  type: CommunityNoteTagType;
  label: string;
  /** in-page anchor id to scroll to when the tag is clicked */
  anchor?: string;
};

export type CommunityNote = {
  id: string;
  weekNumber: number;
  body: string;
  /** display name; "אנונימי" when posted anonymously */
  authorName: string;
  anonymous: boolean;
  /** server-only — used for ownership/moderation, never sent to the client */
  authorEmail: string;
  tag?: CommunityNoteTag;
  createdAt: string;
};

/** Shape returned to the client — author email stripped, ownership flag added. */
export type PublicCommunityNote = Omit<CommunityNote, "authorEmail"> & {
  isMine: boolean;
};

const TAG_TYPES: ReadonlySet<string> = new Set<CommunityNoteTagType>([
  "homework",
  "homework-question",
  "recitation",
  "theorem",
  "definition",
  "general",
]);

export const MAX_NOTE_LENGTH = 2000;

type RedisConfig = { url: string; token: string };

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function weekKey(weekNumber: number): string {
  return `community:notes:week:${weekNumber}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function readWeekNotes(weekNumber: number): Promise<CommunityNote[]> {
  const redis = getRedisConfig();
  if (!redis) return [];
  try {
    const res = await fetch(`${redis.url}/get/${encodeURIComponent(weekKey(weekNumber))}`, {
      headers: { Authorization: `Bearer ${redis.token}` },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: string | null };
    if (!data.result) return [];
    const parsed = JSON.parse(data.result) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCommunityNote);
  } catch {
    return [];
  }
}

async function writeWeekNotes(weekNumber: number, notes: CommunityNote[]): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) return;
  const value = encodeURIComponent(JSON.stringify(notes));
  await fetch(`${redis.url}/set/${encodeURIComponent(weekKey(weekNumber))}/${value}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redis.token}` },
  });
}

function toPublic(note: CommunityNote, viewerEmail: string): PublicCommunityNote {
  const { authorEmail, ...rest } = note;
  return { ...rest, isMine: normalizeEmail(authorEmail) === normalizeEmail(viewerEmail) };
}

export async function getWeekNotes(
  weekNumber: number,
  viewerEmail: string
): Promise<PublicCommunityNote[]> {
  const notes = await readWeekNotes(weekNumber);
  return notes.map((n) => toPublic(n, viewerEmail));
}

export async function addWeekNote(input: {
  weekNumber: number;
  body: string;
  authorEmail: string;
  authorName?: string;
  anonymous: boolean;
  tag?: CommunityNoteTag;
}): Promise<PublicCommunityNote> {
  const fallbackName = normalizeEmail(input.authorEmail).split("@")[0] || "סטודנט/ית";
  const displayName = input.anonymous
    ? "אנונימי"
    : (input.authorName?.trim() || fallbackName).slice(0, 40);

  const note: CommunityNote = {
    id: randomUUID(),
    weekNumber: input.weekNumber,
    body: input.body.trim().slice(0, MAX_NOTE_LENGTH),
    authorName: displayName,
    anonymous: input.anonymous,
    authorEmail: normalizeEmail(input.authorEmail),
    tag: sanitizeTag(input.tag),
    createdAt: new Date().toISOString(),
  };

  const existing = await readWeekNotes(input.weekNumber);
  existing.unshift(note); // newest first
  await writeWeekNotes(input.weekNumber, existing);

  return toPublic(note, input.authorEmail);
}

/** Returns true if a note was deleted (requester is the author or an admin). */
export async function deleteWeekNote(
  weekNumber: number,
  id: string,
  requesterEmail: string,
  isAdmin: boolean
): Promise<boolean> {
  const existing = await readWeekNotes(weekNumber);
  const note = existing.find((n) => n.id === id);
  if (!note) return false;
  if (!isAdmin && normalizeEmail(note.authorEmail) !== normalizeEmail(requesterEmail)) {
    return false;
  }
  await writeWeekNotes(weekNumber, existing.filter((n) => n.id !== id));
  return true;
}

function sanitizeTag(tag: CommunityNoteTag | undefined): CommunityNoteTag | undefined {
  if (!tag || typeof tag !== "object") return undefined;
  if (!TAG_TYPES.has(tag.type)) return undefined;
  if (typeof tag.label !== "string" || !tag.label.trim()) return undefined;
  const out: CommunityNoteTag = { type: tag.type, label: tag.label.trim().slice(0, 120) };
  if (typeof tag.anchor === "string" && tag.anchor.trim()) {
    out.anchor = tag.anchor.trim().slice(0, 60);
  }
  return out;
}

function isCommunityNote(v: unknown): v is CommunityNote {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.body === "string" &&
    typeof e.weekNumber === "number" &&
    typeof e.authorEmail === "string" &&
    typeof e.createdAt === "string"
  );
}
