export const MENTOR_CREDIT_LIMIT = 150;

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function usageKey(email: string): string {
  return `mentor:usage:${email.toLowerCase().trim()}`;
}

export async function getMentorUsage(email: string): Promise<number> {
  const redis = getRedisConfig();
  if (!redis) return 0;

  try {
    const res = await fetch(`${redis.url}/get/${encodeURIComponent(usageKey(email))}`, {
      headers: { Authorization: `Bearer ${redis.token}` },
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { result?: string | null };
    return data.result ? parseInt(data.result, 10) : 0;
  } catch {
    return 0;
  }
}

export async function incrementMentorUsage(email: string): Promise<number> {
  const redis = getRedisConfig();
  if (!redis) return 1;

  try {
    const res = await fetch(`${redis.url}/incr/${encodeURIComponent(usageKey(email))}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    });
    if (!res.ok) return 0;
    const data = (await res.json()) as { result?: number | null };
    return data.result ?? 0;
  } catch {
    return 0;
  }
}
