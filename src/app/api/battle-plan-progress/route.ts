import { NextResponse } from "next/server";
import { validateCookieForRequest } from "@/lib/simple-auth";

export const runtime = "nodejs";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function redisKey(email: string) {
  return `battle-plan-checked:${email.trim().toLowerCase()}`;
}

export async function GET(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true, checked: [] });

  try {
    const res = await fetch(
      `${redis.url}/get/${encodeURIComponent(redisKey(auth.email))}`,
      { headers: { Authorization: `Bearer ${redis.token}` } }
    );
    if (!res.ok) return NextResponse.json({ ok: true, checked: [] });
    const data = (await res.json()) as { result?: string | null };
    if (!data.result) return NextResponse.json({ ok: true, checked: [] });
    const parsed = JSON.parse(data.result) as unknown;
    if (!Array.isArray(parsed)) return NextResponse.json({ ok: true, checked: [] });
    return NextResponse.json({ ok: true, checked: parsed });
  } catch {
    return NextResponse.json({ ok: true, checked: [] });
  }
}

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { checked?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!Array.isArray(body.checked)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const checked = (body.checked as unknown[]).filter((x): x is string => typeof x === "string");

  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true });

  try {
    const key = encodeURIComponent(redisKey(auth.email));
    const value = encodeURIComponent(JSON.stringify(checked));
    await fetch(`${redis.url}/set/${key}/${value}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
