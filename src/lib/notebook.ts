import { randomUUID } from "crypto";

export type NotebookEntryType = "card" | "note";

export type NotebookEntry = {
  id: string;
  type: NotebookEntryType;
  weekNumber: number; // 1–13, or 0 for "general"
  title?: string;
  content: string;
  source?: string; // e.g. "הגדרות", "תרגול"
  createdAt: string;
};

type RedisConfig = { url: string; token: string };

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function notebookKey(email: string): string {
  return `notebook:${email.trim().toLowerCase()}`;
}

export async function getNotebookEntries(email: string): Promise<NotebookEntry[]> {
  const redis = getRedisConfig();
  if (!redis) return [];

  try {
    const res = await fetch(
      `${redis.url}/get/${encodeURIComponent(notebookKey(email))}`,
      { headers: { Authorization: `Bearer ${redis.token}` } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: string | null };
    if (!data.result) return [];
    const parsed = JSON.parse(data.result) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNotebookEntry);
  } catch {
    return [];
  }
}

export async function addNotebookEntry(
  email: string,
  entry: Omit<NotebookEntry, "id" | "createdAt">
): Promise<NotebookEntry> {
  const redis = getRedisConfig();
  const newEntry: NotebookEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (!redis) return newEntry;

  const existing = await getNotebookEntries(email);
  existing.unshift(newEntry); // newest first
  const value = encodeURIComponent(JSON.stringify(existing));

  await fetch(
    `${redis.url}/set/${encodeURIComponent(notebookKey(email))}/${value}`,
    { method: "POST", headers: { Authorization: `Bearer ${redis.token}` } }
  );

  return newEntry;
}

export async function deleteNotebookEntry(email: string, id: string): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) return;

  const existing = await getNotebookEntries(email);
  const filtered = existing.filter((e) => e.id !== id);
  const value = encodeURIComponent(JSON.stringify(filtered));

  await fetch(
    `${redis.url}/set/${encodeURIComponent(notebookKey(email))}/${value}`,
    { method: "POST", headers: { Authorization: `Bearer ${redis.token}` } }
  );
}

function isNotebookEntry(v: unknown): v is NotebookEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.content === "string" &&
    typeof e.weekNumber === "number" &&
    typeof e.createdAt === "string"
  );
}
