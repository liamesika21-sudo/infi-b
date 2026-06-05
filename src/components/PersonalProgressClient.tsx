"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  RotateCcw,
  Search,
  Target,
} from "lucide-react";
import type { PersonalProgressRecord, PersonalProgressStatus } from "@/lib/personal-progress";

const DEVICE_ID_STORAGE_KEY = "infi_device_id";
let fallbackDeviceId = "";

type ProgressTopic = {
  topicId: string;
  title: string;
  priorityScore: number;
  priorityLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  appearedInPastExams: number;
  appearedInHomework: number;
  appearedInRecitations: number;
  appearedInLectures: number;
};

type ProgressResponse = {
  ok?: boolean;
  email?: string;
  records?: Record<string, PersonalProgressRecord>;
  reason?: string;
  message?: string;
};

const STATUS_OPTIONS: Array<{
  value: PersonalProgressStatus;
  label: string;
  shortLabel: string;
  color: string;
  background: string;
  border: string;
  icon: typeof Circle;
}> = [
  {
    value: "not_started",
    label: "עוד לא התחלתי",
    shortLabel: "לא התחלתי",
    color: "var(--text-muted)",
    background: "var(--bg-subtle)",
    border: "var(--border)",
    icon: Circle,
  },
  {
    value: "learning",
    label: "בתהליך למידה",
    shortLabel: "בלמידה",
    color: "var(--navy-mid)",
    background: "var(--navy-light)",
    border: "var(--navy-border)",
    icon: Clock3,
  },
  {
    value: "needs_review",
    label: "צריך עוד עבודה",
    shortLabel: "לחזור",
    color: "var(--amber)",
    background: "var(--amber-light)",
    border: "var(--amber-border)",
    icon: RotateCcw,
  },
  {
    value: "confident",
    label: "שליטה טובה",
    shortLabel: "טוב",
    color: "var(--green)",
    background: "var(--green-light)",
    border: "var(--green-border)",
    icon: CheckCircle2,
  },
  {
    value: "mastered",
    label: "שולטת לגמרי",
    shortLabel: "שלטתי",
    color: "var(--purple)",
    background: "var(--purple-light)",
    border: "var(--purple-border)",
    icon: Target,
  },
];

const STATUS_BY_VALUE = new Map(STATUS_OPTIONS.map((status) => [status.value, status]));

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateDeviceId(): string {
  try {
    const existingDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existingDeviceId) return existingDeviceId;

    const deviceId = createDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  } catch {
    fallbackDeviceId ||= createDeviceId();
    return fallbackDeviceId;
  }
}

export function PersonalProgressClient({ topics }: { topics: ProgressTopic[] }) {
  const [email, setEmail] = useState("");
  const [records, setRecords] = useState<Record<string, PersonalProgressRecord>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PersonalProgressStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [savingTopicId, setSavingTopicId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      try {
        const response = await fetch("/api/progress", {
          headers: { "x-infi-device-id": getOrCreateDeviceId() },
        });
        const data = (await response.json()) as ProgressResponse;
        if (!isMounted) return;

        if (!response.ok || !data.ok) {
          setMessage(data.message ?? "לא הצלחתי לטעון את המעקב האישי.");
          return;
        }

        setEmail(data.email ?? "");
        setRecords(data.records ?? {});
      } catch {
        if (isMounted) {
          setMessage("שגיאת תקשורת בטעינת המעקב.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const enrichedTopics = useMemo(
    () =>
      topics.map((topic) => ({
        ...topic,
        record: records[topic.topicId],
        status: records[topic.topicId]?.status ?? "not_started",
      })),
    [records, topics]
  );

  const stats = useMemo(() => {
    const total = enrichedTopics.length;
    const mastered = enrichedTopics.filter((topic) => topic.status === "mastered").length;
    const confident = enrichedTopics.filter((topic) => topic.status === "confident").length;
    const needsReview = enrichedTopics.filter((topic) => topic.status === "needs_review").length;
    const touched = enrichedTopics.filter((topic) => topic.status !== "not_started").length;
    const readinessScore = total > 0 ? Math.round(((mastered + confident * 0.75) / total) * 100) : 0;

    return { total, mastered, confident, needsReview, touched, readinessScore };
  }, [enrichedTopics]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrichedTopics.filter((topic) => {
      const matchesQuery =
        !normalizedQuery ||
        topic.title.toLowerCase().includes(normalizedQuery) ||
        topic.recommendedAction.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || topic.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [enrichedTopics, query, statusFilter]);

  async function saveProgress(
    topicId: string,
    update: {
      status?: PersonalProgressStatus;
      notes?: string;
      targetDate?: string;
    }
  ) {
    const existingRecord = records[topicId];
    const nextRecord: PersonalProgressRecord = {
      topicId,
      status: update.status ?? existingRecord?.status ?? "not_started",
      notes: update.notes ?? existingRecord?.notes,
      targetDate: update.targetDate ?? existingRecord?.targetDate,
      updatedAt: new Date().toISOString(),
    };

    setSavingTopicId(topicId);
    setMessage("");
    setRecords((current) => ({ ...current, [topicId]: nextRecord }));

    try {
      const response = await fetch("/api/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-infi-device-id": getOrCreateDeviceId(),
        },
        body: JSON.stringify({ topicId, ...update }),
      });
      const data = (await response.json()) as { ok?: boolean; record?: PersonalProgressRecord; message?: string };

      if (!response.ok || !data.ok || !data.record) {
        throw new Error(data.message ?? "שמירה נכשלה");
      }

      setRecords((current) => ({ ...current, [topicId]: data.record! }));
    } catch (error) {
      setMessage((error as Error).message || "שגיאה בשמירת המעקב.");
      if (existingRecord) {
        setRecords((current) => ({ ...current, [topicId]: existingRecord }));
      } else {
        setRecords((current) => {
          const nextRecords = { ...current };
          delete nextRecords[topicId];
          return nextRecords;
        });
      }
    } finally {
      setSavingTopicId("");
    }
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          אין עדיין מפת עדיפות. הריצי ניתוח חומרים כדי להפעיל מעקב אישי.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
              מעקב אישי
            </p>
            <h2 className="mt-1 text-2xl font-black">לוח שליטה אישי למבחן</h2>
            <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              כל שינוי נשמר למשתמש המחובר{email ? <>: <span dir="ltr">{email}</span></> : ""}. סמני מצב לכל נושא,
              הוסיפי הערה קצרה ותאריך חזרה.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
            <Metric label="מוכנות" value={`${stats.readinessScore}%`} tone="green" />
            <Metric label="טופלו" value={`${stats.touched}/${stats.total}`} />
            <Metric label="שלטתי" value={stats.mastered} tone="purple" />
            <Metric label="לחזרה" value={stats.needsReview} tone="amber" />
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: "var(--bg-inset)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${stats.readinessScore}%`, background: "var(--green-mid)" }}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-h-11 items-center gap-2 rounded-lg border bg-white px-3 lg:min-w-[360px]" style={{ borderColor: "var(--border)" }}>
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              className="min-h-10 w-full bg-transparent text-sm outline-none"
              placeholder="חיפוש נושא או פעולה מומלצת"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              הכל
            </FilterButton>
            {STATUS_OPTIONS.map((status) => (
              <FilterButton
                key={status.value}
                active={statusFilter === status.value}
                onClick={() => setStatusFilter(status.value)}
              >
                {status.shortLabel}
              </FilterButton>
            ))}
          </div>
        </div>

        {(message || isLoading) && (
          <div
            className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
            style={{
              background: message ? "var(--red-light)" : "var(--navy-light)",
              borderColor: message ? "var(--red-border)" : "var(--navy-border)",
              color: message ? "var(--red-mid)" : "var(--navy-mid)",
            }}
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "טוען מעקב אישי..." : message}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        {filteredTopics.map((topic) => (
          <TopicProgressCard
            key={topic.topicId}
            topic={topic}
            saving={savingTopicId === topic.topicId}
            onStatusChange={(status) => saveProgress(topic.topicId, { status })}
            onNotesBlur={(notes) => saveProgress(topic.topicId, { notes })}
            onTargetDateChange={(targetDate) => saveProgress(topic.topicId, { targetDate })}
          />
        ))}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  tone?: "navy" | "green" | "purple" | "amber";
}) {
  const colors = {
    navy: ["var(--navy-light)", "var(--navy-border)", "var(--navy-mid)"],
    green: ["var(--green-light)", "var(--green-border)", "var(--green)"],
    purple: ["var(--purple-light)", "var(--purple-border)", "var(--purple)"],
    amber: ["var(--amber-light)", "var(--amber-border)", "var(--amber)"],
  }[tone];

  return (
    <div className="rounded-lg border px-3 py-2 text-center" style={{ background: colors[0], borderColor: colors[1] }}>
      <p className="font-mono text-xl font-black" style={{ color: colors[2] }}>
        {value}
      </p>
      <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-10 shrink-0 rounded-lg border px-3 text-sm font-black transition"
      style={{
        background: active ? "var(--navy)" : "white",
        borderColor: active ? "var(--navy)" : "var(--border)",
        color: active ? "white" : "var(--text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

function TopicProgressCard({
  topic,
  saving,
  onStatusChange,
  onNotesBlur,
  onTargetDateChange,
}: {
  topic: ProgressTopic & {
    record?: PersonalProgressRecord;
    status: PersonalProgressStatus;
  };
  saving: boolean;
  onStatusChange: (status: PersonalProgressStatus) => void;
  onNotesBlur: (notes: string) => void;
  onTargetDateChange: (targetDate: string) => void;
}) {
  const status = STATUS_BY_VALUE.get(topic.status) ?? STATUS_OPTIONS[0];
  const StatusIcon = status.icon;

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-black"
              style={{ background: status.background, borderColor: status.border, color: status.color }}
            >
              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {status.label}
            </span>
            <span className={`badge ${topic.priorityLevel === "critical" ? "badge-red" : topic.priorityLevel === "high" ? "badge-navy-light" : "badge-muted"}`}>
              {topic.priorityLevel === "critical" ? "קריטי" : topic.priorityLevel === "high" ? "גבוה" : "רגיל"}
            </span>
            {saving && (
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                שומר...
              </span>
            )}
          </div>

          <h3 className="mt-2 text-lg font-black leading-7">{topic.title}</h3>
          <p className="mt-1 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            {topic.recommendedAction}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            <span>ציון עדיפות: {topic.priorityScore}</span>
            <span>מבחנים: {topic.appearedInPastExams}</span>
            <span>מטלות: {topic.appearedInHomework}</span>
            <span>תרגולים: {topic.appearedInRecitations}</span>
          </div>
        </div>

        <div className="grid gap-3 xl:w-[460px]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                className="min-h-10 rounded-lg border px-2 text-xs font-black transition"
                style={{
                  background: topic.status === option.value ? option.background : "white",
                  borderColor: topic.status === option.value ? option.border : "var(--border)",
                  color: topic.status === option.value ? option.color : "var(--text-secondary)",
                }}
              >
                {option.shortLabel}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
            <textarea
              key={`${topic.topicId}-${topic.record?.updatedAt ?? "empty"}`}
              defaultValue={topic.record?.notes ?? ""}
              onBlur={(event) => onNotesBlur(event.target.value)}
              className="min-h-20 resize-none rounded-lg border bg-white px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)" }}
              placeholder="הערה אישית: איפה נתקעתי, מה לפתור שוב, איזה משפט לזכור"
            />
            <label className="grid content-start gap-2 text-sm font-bold">
              <span className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                חזרה הבאה
              </span>
              <input
                type="date"
                value={topic.record?.targetDate ?? ""}
                onChange={(event) => onTargetDateChange(event.target.value)}
                className="min-h-10 rounded-lg border bg-white px-3 text-sm outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
