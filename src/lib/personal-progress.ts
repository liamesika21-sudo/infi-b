import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

const PROGRESS_FILE_PATH = path.join(process.cwd(), "data", "personal-progress.json");

export type PersonalProgressStatus =
  | "not_started"
  | "learning"
  | "needs_review"
  | "confident"
  | "mastered";

export type PersonalProgressRecord = {
  topicId: string;
  status: PersonalProgressStatus;
  notes?: string;
  targetDate?: string;
  updatedAt: string;
};

type PersonalProgressFile = {
  users: Record<string, Record<string, PersonalProgressRecord>>;
};

type RedisConfig = {
  url: string;
  token: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function shouldUseRedisStore(): boolean {
  return Boolean(getRedisConfig()) || process.env.VERCEL === "1";
}

function getProgressKey(email: string): string {
  return `progress:user:${normalizeEmail(email)}`;
}

function isProgressStatus(status: unknown): status is PersonalProgressStatus {
  return (
    status === "not_started" ||
    status === "learning" ||
    status === "needs_review" ||
    status === "confident" ||
    status === "mastered"
  );
}

function normalizeRecord(record: Partial<PersonalProgressRecord>): PersonalProgressRecord | null {
  if (typeof record.topicId !== "string" || !record.topicId.trim()) return null;

  return {
    topicId: record.topicId.trim(),
    status: isProgressStatus(record.status) ? record.status : "not_started",
    notes: typeof record.notes === "string" && record.notes.trim() ? record.notes.trim() : undefined,
    targetDate:
      typeof record.targetDate === "string" && record.targetDate.trim()
        ? record.targetDate.trim()
        : undefined,
    updatedAt:
      typeof record.updatedAt === "string" && record.updatedAt.trim()
        ? record.updatedAt
        : new Date().toISOString(),
  };
}

async function readProgressFile(): Promise<PersonalProgressFile> {
  try {
    const raw = await readFile(PROGRESS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersonalProgressFile>;
    const users: PersonalProgressFile["users"] = {};

    if (parsed.users && typeof parsed.users === "object") {
      for (const [email, recordsByTopic] of Object.entries(parsed.users)) {
        if (!recordsByTopic || typeof recordsByTopic !== "object") continue;

        users[normalizeEmail(email)] = Object.fromEntries(
          Object.entries(recordsByTopic)
            .map(([topicId, record]) => {
              const normalizedRecord = normalizeRecord({
                ...(record as Partial<PersonalProgressRecord>),
                topicId,
              });
              return normalizedRecord ? [topicId, normalizedRecord] : null;
            })
            .filter((entry): entry is [string, PersonalProgressRecord] => Boolean(entry))
        );
      }
    }

    return { users };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { users: {} };
  }
}

async function writeProgressFile(progressFile: PersonalProgressFile): Promise<void> {
  await mkdir(path.dirname(PROGRESS_FILE_PATH), { recursive: true });
  const tempPath = `${PROGRESS_FILE_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(progressFile, null, 2)}\n`, "utf8");
  await rename(tempPath, PROGRESS_FILE_PATH);
}

async function getRedisProgress(email: string): Promise<Record<string, PersonalProgressRecord>> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const response = await fetch(`${redis.url}/get/${encodeURIComponent(getProgressKey(email))}`, {
    headers: { Authorization: `Bearer ${redis.token}` },
  });

  if (!response.ok) {
    throw new Error(`Redis GET failed with ${response.status}`);
  }

  const data = (await response.json()) as { result?: string | null };
  if (!data.result) return {};

  const parsed = JSON.parse(data.result) as unknown;
  if (!parsed || typeof parsed !== "object") return {};

  return Object.fromEntries(
    Object.entries(parsed as Record<string, Partial<PersonalProgressRecord>>)
      .map(([topicId, record]) => {
        const normalizedRecord = normalizeRecord({ ...record, topicId });
        return normalizedRecord ? [topicId, normalizedRecord] : null;
      })
      .filter((entry): entry is [string, PersonalProgressRecord] => Boolean(entry))
  );
}

async function setRedisProgress(
  email: string,
  recordsByTopic: Record<string, PersonalProgressRecord>
): Promise<void> {
  const redis = getRedisConfig();
  if (!redis) {
    throw new Error(
      "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel."
    );
  }

  const value = encodeURIComponent(JSON.stringify(recordsByTopic));
  const response = await fetch(
    `${redis.url}/set/${encodeURIComponent(getProgressKey(email))}/${value}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Redis SET failed with ${response.status}`);
  }
}

export async function getPersonalProgress(
  email: string
): Promise<Record<string, PersonalProgressRecord>> {
  const normalizedEmail = normalizeEmail(email);

  if (shouldUseRedisStore()) {
    return getRedisProgress(normalizedEmail);
  }

  const progressFile = await readProgressFile();
  return progressFile.users[normalizedEmail] ?? {};
}

export async function updatePersonalProgress(
  email: string,
  update: {
    topicId: string;
    status?: PersonalProgressStatus;
    notes?: string;
    targetDate?: string;
  }
): Promise<PersonalProgressRecord> {
  const normalizedEmail = normalizeEmail(email);
  const topicId = update.topicId.trim();
  if (!topicId) throw new Error("invalid_topic");

  const recordsByTopic = await getPersonalProgress(normalizedEmail);
  const existingRecord = recordsByTopic[topicId];
  const nextRecord: PersonalProgressRecord = {
    topicId,
    status: update.status ?? existingRecord?.status ?? "not_started",
    notes:
      typeof update.notes === "string"
        ? update.notes.trim() || undefined
        : existingRecord?.notes,
    targetDate:
      typeof update.targetDate === "string"
        ? update.targetDate.trim() || undefined
        : existingRecord?.targetDate,
    updatedAt: new Date().toISOString(),
  };

  recordsByTopic[topicId] = nextRecord;

  if (shouldUseRedisStore()) {
    await setRedisProgress(normalizedEmail, recordsByTopic);
    return nextRecord;
  }

  const progressFile = await readProgressFile();
  progressFile.users[normalizedEmail] = recordsByTopic;
  await writeProgressFile(progressFile);

  return nextRecord;
}

export function isPersonalProgressStatus(status: unknown): status is PersonalProgressStatus {
  return isProgressStatus(status);
}
