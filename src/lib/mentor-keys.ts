/* Per-user personal API keys for the mentor chat.

   A user with a personal key gets mentor access and their requests are billed
   to THEIR key — not the system key — and may run against a different provider
   (e.g. Google Gemini) than the default Anthropic backend. Everyone else keeps
   using the system process.env.ANTHROPIC_API_KEY on Anthropic. Keys live in the
   live Redis store (never in git), keyed by email. */

export type MentorProvider = "anthropic" | "gemini";

export interface PersonalMentorKey {
  provider: MentorProvider;
  key: string;
}

type RedisConfig = { url: string; token: string };

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function keyFor(email: string): string {
  return `mentor:apikey:${email.trim().toLowerCase()}`;
}

/** Returns the user's personal mentor key + provider, or null if none. */
export async function getPersonalMentorKey(email: string): Promise<PersonalMentorKey | null> {
  const redis = getRedisConfig();
  if (!redis) return null;
  try {
    const res = await fetch(`${redis.url}/get/${encodeURIComponent(keyFor(email))}`, {
      headers: { Authorization: `Bearer ${redis.token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    const raw = data.result?.trim();
    if (!raw) return null;

    // Current format: JSON { provider, key }. Legacy format: bare key string (= anthropic).
    try {
      const parsed = JSON.parse(raw) as Partial<PersonalMentorKey>;
      if (parsed && typeof parsed.key === "string" && parsed.key.trim()) {
        const provider: MentorProvider = parsed.provider === "gemini" ? "gemini" : "anthropic";
        return { provider, key: parsed.key.trim() };
      }
    } catch {
      /* not JSON — fall through to legacy */
    }
    return { provider: "anthropic", key: raw };
  } catch {
    return null;
  }
}

export async function hasPersonalMentorKey(email: string): Promise<boolean> {
  return (await getPersonalMentorKey(email)) !== null;
}

/** Provision (or overwrite) a user's personal mentor key + provider. */
export async function setPersonalMentorKey(
  email: string,
  apiKey: string,
  provider: MentorProvider = "anthropic"
): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) throw new Error("Redis not configured");
  const payload = JSON.stringify({ provider, key: apiKey.trim() });
  const value = encodeURIComponent(payload);
  const res = await fetch(`${redis.url}/set/${encodeURIComponent(keyFor(email))}/${value}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redis.token}` },
  });
  if (!res.ok) throw new Error(`Redis SET failed with ${res.status}`);
}

/** Remove a user's personal mentor key (they fall back to default access rules). */
export async function deletePersonalMentorKey(email: string): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) return;
  await fetch(`${redis.url}/del/${encodeURIComponent(keyFor(email))}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redis.token}` },
  });
}
