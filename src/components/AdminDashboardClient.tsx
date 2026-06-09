"use client";

import {
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type TdHTMLAttributes,
} from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart,
  ChevronDown,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import type {
  AdminAuthUser,
  AuthAdminSnapshot,
  PaymentActionRecord,
  PaymentMethod,
  RegistrationRequest,
  StudentSessionRecord,
} from "@/lib/simple-auth";
import type { MentorLogEntry } from "@/lib/mentor-credits";

type AdminTab = "overview" | "users" | "chats" | "sessions" | "registrations" | "payments";
type UserFilter = "all" | "allowed" | "not_allowed" | "risk" | "active" | "no_login";
type PlanFilter = "all" | "basic" | "pro";
type PaymentFilter = "all" | "pending" | "manual_pending" | "payment_link_opened";

// ─── Utilities ─────────────────────────────────────────────────────────────────

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.round(durationMs / 60_000));
  if (totalMinutes < 60) return `${totalMinutes} דק׳`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ש׳${minutes ? ` ${minutes} דק׳` : ""}`;
}

function shortValue(value?: string, start = 9, end = 5): string {
  if (!value) return "-";
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function hasMultiDeviceAttempt(user: AdminAuthUser): boolean {
  return user.deviceCount > 1 || user.devices.some((d) => d.status === "blocked");
}

function paymentStatusLabel(status?: RegistrationRequest["paymentStatus"]): string {
  switch (status) {
    case "manual_pending": return "הוראות ידני";
    case "payment_link_opened": return "פתח דף תשלום";
    default: return "ללא רכישה";
  }
}

function paymentStatusClass(status?: RegistrationRequest["paymentStatus"]): string {
  switch (status) {
    case "manual_pending": return "badge-amber";
    case "payment_link_opened": return "badge-green";
    default: return "badge-red";
  }
}

function methodLabel(method?: PaymentMethod): string {
  switch (method) {
    case "bit": return "Bit";
    case "paybox": return "PayBox";
    case "credit": return "אשראי";
    default: return "-";
  }
}

function paymentActionLabel(action: PaymentActionRecord["action"]): string {
  return action === "payment_link_opened" ? "פתח לינק תשלום" : "ראה הוראות ידני";
}

function getDeviceLabel(userAgent?: string): string {
  if (!userAgent) return "-";
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("android") || ua.includes("mobile")) return "Mobile";
  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";
  if (ua.includes("mac")) return "Mac";
  if (ua.includes("windows")) return "Windows";
  return "Desktop";
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminDashboardClient({
  snapshot,
  mentorLogs,
}: {
  snapshot: AuthAdminSnapshot;
  mentorLogs: MentorLogEntry[];
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [registrationQuery, setRegistrationQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [userFilter, setUserFilter] = useState<UserFilter>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const router = useRouter();

  const adminAction = useCallback(async (action: "add" | "remove", email: string) => {
    const key = `${action}:${email}`;
    setLoadingKey(key);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        alert(err.error ?? "שגיאה");
        return;
      }
      router.refresh();
    } finally {
      setLoadingKey(null);
    }
  }, [router]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const latestPaymentByEmail = useMemo(() => {
    const map = new Map<string, PaymentActionRecord>();
    for (const action of snapshot.paymentActions) {
      if (!map.has(action.email)) map.set(action.email, action);
    }
    return map;
  }, [snapshot.paymentActions]);

  const sessionsByEmail = useMemo(() => {
    const map = new Map<string, {
      totalDurationMs: number;
      pageViews: number;
      sessionCount: number;
      lastSeenAt: string;
      lastPath?: string;
    }>();
    for (const session of snapshot.activitySessions) {
      const cur = map.get(session.email) ?? {
        totalDurationMs: 0, pageViews: 0, sessionCount: 0, lastSeenAt: "", lastPath: undefined,
      };
      map.set(session.email, {
        totalDurationMs: cur.totalDurationMs + session.durationMs,
        pageViews: cur.pageViews + session.pageViews,
        sessionCount: cur.sessionCount + 1,
        lastSeenAt: session.lastSeenAt > cur.lastSeenAt ? session.lastSeenAt : cur.lastSeenAt,
        lastPath: session.lastSeenAt > cur.lastSeenAt ? session.lastPath : cur.lastPath,
      });
    }
    return map;
  }, [snapshot.activitySessions]);

  const chatsByEmail = useMemo(() => {
    const map = new Map<string, MentorLogEntry[]>();
    for (const log of mentorLogs) {
      const list = map.get(log.email) ?? [];
      list.push(log);
      map.set(log.email, list);
    }
    return map;
  }, [mentorLogs]);

  const chatCountByEmail = useMemo(() => {
    const map = new Map<string, number>();
    for (const [email, logs] of chatsByEmail) {
      map.set(email, logs.length);
    }
    return map;
  }, [chatsByEmail]);

  const dailyActivity = useMemo(() => {
    const days: { date: string; label: string; sessions: number; chats: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short" }).format(d);
      days.push({ date: dateStr, label, sessions: 0, chats: 0 });
    }
    for (const session of snapshot.activitySessions) {
      const dateStr = session.lastSeenAt.slice(0, 10);
      const day = days.find((d) => d.date === dateStr);
      if (day) day.sessions++;
    }
    for (const log of mentorLogs) {
      const dateStr = log.ts.slice(0, 10);
      const day = days.find((d) => d.date === dateStr);
      if (day) day.chats++;
    }
    return days;
  }, [snapshot.activitySessions, mentorLogs]);

  const activeThisWeek = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return new Set(
      snapshot.activitySessions
        .filter((s) => new Date(s.lastSeenAt) > cutoff)
        .map((s) => s.email)
    ).size;
  }, [snapshot.activitySessions]);

  const topUsersByTime = useMemo(() =>
    Array.from(sessionsByEmail.entries())
      .sort((a, b) => b[1].totalDurationMs - a[1].totalDurationMs)
      .slice(0, 5)
      .map(([email, stats]) => ({ email, ...stats })),
    [sessionsByEmail]);

  const topUsersByChats = useMemo(() =>
    Array.from(chatCountByEmail.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => ({ email, count })),
    [chatCountByEmail]);

  const filteredRegistrations = useMemo(() => {
    const query = registrationQuery.trim().toLowerCase();
    return snapshot.registrationRequests.filter((request) => {
      const latestPayment = latestPaymentByEmail.get(request.email);
      const status = request.paymentStatus ?? "pending";
      const matchesQuery = !query || request.email.toLowerCase().includes(query) || request.phone.includes(query) || request.ip?.includes(query);
      const matchesPlan = planFilter === "all" || request.plan === planFilter;
      const matchesPayment = paymentFilter === "all" || status === paymentFilter;
      return matchesQuery && matchesPlan && matchesPayment && (!latestPayment || latestPayment.email === request.email);
    });
  }, [latestPaymentByEmail, paymentFilter, planFilter, registrationQuery, snapshot.registrationRequests]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    return snapshot.users.filter((user) => {
      const sessionStats = sessionsByEmail.get(user.email);
      const matchesQuery = !query || user.email.toLowerCase().includes(query) || user.devices.some((d) => d.ip?.includes(query) || d.userAgent?.toLowerCase().includes(query));
      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "allowed" && user.isAllowed) ||
        (userFilter === "not_allowed" && !user.isAllowed) ||
        (userFilter === "risk" && hasMultiDeviceAttempt(user)) ||
        (userFilter === "active" && Boolean(sessionStats?.lastSeenAt)) ||
        (userFilter === "no_login" && user.loginCount === 0);
      return matchesQuery && matchesFilter;
    });
  }, [sessionsByEmail, snapshot.users, userFilter, userQuery]);

  const filteredChats = useMemo(() => {
    const query = chatQuery.trim().toLowerCase();
    if (!query) return mentorLogs;
    return mentorLogs.filter(
      (log) => log.email.toLowerCase().includes(query) || log.q.toLowerCase().includes(query)
    );
  }, [chatQuery, mentorLogs]);

  const pendingRegistrations = snapshot.registrationRequests.filter(
    (r) => (r.paymentStatus ?? "pending") === "pending"
  ).length;
  const totalSessionDuration = snapshot.activitySessions.reduce((sum, s) => sum + s.durationMs, 0);
  const totalLogins = snapshot.users.reduce((sum, u) => sum + u.loginCount, 0);
  const riskUsers = snapshot.users.filter(hasMultiDeviceAttempt).length;

  const tabs: { id: AdminTab; label: string; icon: ReactNode; count?: number }[] = [
    { id: "overview",       label: "סקירה",    icon: <TrendingUp   className="h-4 w-4" /> },
    { id: "users",          label: "משתמשים",  icon: <Users        className="h-4 w-4" />, count: snapshot.users.length },
    { id: "chats",          label: "צ׳אטים",   icon: <MessageSquare className="h-4 w-4" />, count: mentorLogs.length },
    { id: "sessions",       label: "סשנים",    icon: <Activity     className="h-4 w-4" />, count: snapshot.activitySessions.length },
    { id: "registrations",  label: "הרשמות",   icon: <ClipboardList className="h-4 w-4" />, count: snapshot.registrationRequests.length },
    { id: "payments",       label: "תשלומים",  icon: <CreditCard   className="h-4 w-4" />, count: snapshot.paymentActions.length },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" style={{ color: "var(--green-mid)" }} aria-hidden="true" />
              <span className="text-sm font-bold" style={{ color: "var(--green)" }}>Admin</span>
            </div>
            <h1 className="mt-2 text-3xl font-black">ניהול Infi</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              מעקב מלא: כניסות, סשנים, משך פעילות וצ׳אטים.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-175">
            <Metric label="בקשות הרשמה"  value={snapshot.registrationRequests.length} />
            <Metric label="ללא רכישה"    value={pendingRegistrations} tone="warning" />
            <Metric label="פעולות תשלום" value={snapshot.paymentActions.length} tone="success" />
            <Metric label="צ׳אטים"       value={mentorLogs.length} tone="info" />
            <Metric label="משתמשים"      value={snapshot.users.length} />
            <Metric label="כניסות סה״כ"  value={totalLogins} />
            <Metric label="פעילים השבוע" value={activeThisWeek} tone="success" />
            <Metric label="משך סשנים"    value={formatDuration(totalSessionDuration)} tone="info" />
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border bg-white p-1.5 shadow-sm"
        style={{ borderColor: "var(--border)" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition"
              style={{
                background: isActive ? "var(--navy-light)" : "transparent",
                color: isActive ? "var(--navy-mid)" : "var(--text-secondary)",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[11px] font-black"
                  style={{
                    background: isActive ? "var(--navy-border)" : "var(--bg-subtle)",
                    color: isActive ? "var(--navy-mid)" : "var(--text-muted)",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab
          dailyActivity={dailyActivity}
          topUsersByTime={topUsersByTime}
          topUsersByChats={topUsersByChats}
          recentSessions={snapshot.activitySessions.slice(0, 6)}
          recentChats={mentorLogs.slice(0, 6)}
          riskUsers={riskUsers}
        />
      )}
      {activeTab === "users" && (
        <UsersSection
          snapshot={snapshot}
          filteredUsers={filteredUsers}
          sessionsByEmail={sessionsByEmail}
          chatsByEmail={chatsByEmail}
          chatCountByEmail={chatCountByEmail}
          userQuery={userQuery}
          setUserQuery={setUserQuery}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          loadingKey={loadingKey}
          adminAction={adminAction}
          expandedUser={expandedUser}
          setExpandedUser={setExpandedUser}
          allSessions={snapshot.activitySessions}
        />
      )}
      {activeTab === "chats" && (
        <ChatsSection
          mentorLogs={filteredChats}
          chatQuery={chatQuery}
          setChatQuery={setChatQuery}
          chatCountByEmail={chatCountByEmail}
        />
      )}
      {activeTab === "sessions" && (
        <SessionsSection sessions={snapshot.activitySessions} />
      )}
      {activeTab === "registrations" && (
        <RegistrationsSection
          snapshot={snapshot}
          filteredRegistrations={filteredRegistrations}
          latestPaymentByEmail={latestPaymentByEmail}
          registrationQuery={registrationQuery}
          setRegistrationQuery={setRegistrationQuery}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          loadingKey={loadingKey}
          adminAction={adminAction}
        />
      )}
      {activeTab === "payments" && (
        <PaymentActionsSection actions={snapshot.paymentActions} />
      )}
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  dailyActivity,
  topUsersByTime,
  topUsersByChats,
  recentSessions,
  recentChats,
}: {
  dailyActivity: { date: string; label: string; sessions: number; chats: number }[];
  topUsersByTime: { email: string; totalDurationMs: number; sessionCount: number }[];
  topUsersByChats: { email: string; count: number }[];
  recentSessions: StudentSessionRecord[];
  recentChats: MentorLogEntry[];
  riskUsers: number;
}) {
  const maxSessions  = Math.max(...dailyActivity.map((d) => d.sessions), 1);
  const maxChats     = Math.max(...dailyActivity.map((d) => d.chats), 1);
  const maxDuration  = Math.max(...topUsersByTime.map((u) => u.totalDurationMs), 1);
  const maxChatCount = Math.max(...topUsersByChats.map((u) => u.count), 1);

  return (
    <div className="space-y-4">
      {/* Activity chart */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <SectionTitle icon={<BarChart className="h-5 w-5" />} title="פעילות 14 ימים אחרונים" count={dailyActivity.length} />
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              סשנים ביום
            </p>
            <div className="space-y-1.5">
              {dailyActivity.map((day) => (
                <div key={`s-${day.date}`} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-right text-[11px]" style={{ color: "var(--text-muted)" }} dir="ltr">
                    {day.label}
                  </span>
                  <div className="flex-1 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "16px" }}>
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(day.sessions / maxSessions) * 100}%`,
                        background: "var(--navy-mid)",
                        minWidth: day.sessions > 0 ? "6px" : "0",
                      }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs font-black" style={{ color: "var(--navy-mid)" }}>
                    {day.sessions || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              צ׳אטים ביום
            </p>
            <div className="space-y-1.5">
              {dailyActivity.map((day) => (
                <div key={`c-${day.date}`} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-right text-[11px]" style={{ color: "var(--text-muted)" }} dir="ltr">
                    {day.label}
                  </span>
                  <div className="flex-1 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "16px" }}>
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(day.chats / maxChats) * 100}%`,
                        background: "var(--teal)",
                        minWidth: day.chats > 0 ? "6px" : "0",
                      }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs font-black" style={{ color: "var(--teal)" }}>
                    {day.chats || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <SectionTitle icon={<Activity className="h-5 w-5" />} title="פעילים ביותר (זמן)" count={topUsersByTime.length} />
          <div className="mt-4 space-y-3">
            {topUsersByTime.length === 0 ? (
              <EmptyState>אין נתוני סשנים עדיין.</EmptyState>
            ) : (
              topUsersByTime.map((user, i) => (
                <div key={user.email}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-xs font-black" style={{ color: "var(--text-muted)" }}>
                      #{i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold" dir="ltr">{user.email}</span>
                    <span className="shrink-0 font-mono text-xs font-black" style={{ color: "var(--navy-mid)" }}>
                      {formatDuration(user.totalDurationMs)}
                    </span>
                  </div>
                  <div className="mt-1 ms-7 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "6px" }}>
                    <div
                      className="h-full rounded"
                      style={{ width: `${(user.totalDurationMs / maxDuration) * 100}%`, background: "var(--navy-mid)" }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <SectionTitle icon={<MessageSquare className="h-5 w-5" />} title="שולחים ביותר צ׳אטים" count={topUsersByChats.length} />
          <div className="mt-4 space-y-3">
            {topUsersByChats.length === 0 ? (
              <EmptyState>אין צ׳אטים עדיין.</EmptyState>
            ) : (
              topUsersByChats.map((user, i) => (
                <div key={user.email}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-xs font-black" style={{ color: "var(--text-muted)" }}>
                      #{i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold" dir="ltr">{user.email}</span>
                    <span className="shrink-0 font-mono text-xs font-black" style={{ color: "var(--teal)" }}>
                      {user.count} צ׳
                    </span>
                  </div>
                  <div className="mt-1 ms-7 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "6px" }}>
                    <div
                      className="h-full rounded"
                      style={{ width: `${(user.count / maxChatCount) * 100}%`, background: "var(--teal)" }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <SectionTitle icon={<Activity className="h-5 w-5" />} title="סשנים אחרונים" count={recentSessions.length} />
          <div className="mt-3 space-y-2">
            {recentSessions.length === 0 ? (
              <EmptyState>אין סשנים עדיין.</EmptyState>
            ) : (
              recentSessions.map((s) => (
                <div
                  key={`${s.email}-${s.sessionId}`}
                  className="flex items-center gap-2 rounded-lg p-2.5"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  <span className={`badge ${s.status === "active" ? "badge-green" : "badge-muted"}`}>
                    {s.status === "active" ? "פעיל" : "הסתיים"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-bold" dir="ltr">{s.email}</span>
                  <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDuration(s.durationMs)}
                  </span>
                  <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(s.lastSeenAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <SectionTitle icon={<MessageSquare className="h-5 w-5" />} title="צ׳אטים אחרונים" count={recentChats.length} />
          <div className="mt-3 space-y-2">
            {recentChats.length === 0 ? (
              <EmptyState>אין צ׳אטים עדיין.</EmptyState>
            ) : (
              recentChats.map((log, i) => (
                <div
                  key={`${log.email}-${log.ts}-${i}`}
                  className="rounded-lg p-2.5"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" dir="ltr">{log.email}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(log.ts)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-secondary)" }}>{log.q}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Users Section ─────────────────────────────────────────────────────────────

function UsersSection({
  snapshot,
  filteredUsers,
  sessionsByEmail,
  chatsByEmail,
  chatCountByEmail,
  userQuery,
  setUserQuery,
  userFilter,
  setUserFilter,
  loadingKey,
  adminAction,
  expandedUser,
  setExpandedUser,
  allSessions,
}: {
  snapshot: AuthAdminSnapshot;
  filteredUsers: AdminAuthUser[];
  sessionsByEmail: Map<string, { totalDurationMs: number; pageViews: number; sessionCount: number; lastSeenAt: string; lastPath?: string }>;
  chatsByEmail: Map<string, MentorLogEntry[]>;
  chatCountByEmail: Map<string, number>;
  userQuery: string;
  setUserQuery: (v: string) => void;
  userFilter: UserFilter;
  setUserFilter: (v: UserFilter) => void;
  loadingKey: string | null;
  adminAction: (action: "add" | "remove", email: string) => Promise<void>;
  expandedUser: string | null;
  setExpandedUser: (email: string | null) => void;
  allSessions: StudentSessionRecord[];
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<UserCheck className="h-5 w-5" />} title="משתמשים, מכשירים ופעילות" count={filteredUsers.length} />
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_230px]">
        <SearchInput value={userQuery} onChange={setUserQuery} placeholder="חיפוש מייל, IP או מכשיר" />
        <Select value={userFilter} onChange={(v) => setUserFilter(v as UserFilter)}>
          <option value="all">כל המשתמשים</option>
          <option value="allowed">מורשים</option>
          <option value="not_allowed">לא מורשים</option>
          <option value="risk">ריבוי מכשירים</option>
          <option value="active">עם פעילות סשן</option>
          <option value="no_login">לא נכנסו</option>
        </Select>
      </div>

      <div className="mt-4 space-y-2">
        {filteredUsers.length === 0 && <EmptyState>אין משתמשים תואמים.</EmptyState>}
        {filteredUsers.map((user) => {
          const latestDevice = user.devices
            .slice()
            .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];
          const sessionStats = sessionsByEmail.get(user.email);
          const chatCount    = chatCountByEmail.get(user.email) ?? 0;
          const isExpanded   = expandedUser === user.email;
          const addKey       = `add:${user.email}`;
          const removeKey    = `remove:${user.email}`;

          return (
            <div key={user.email} className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
              {/* Collapsed row */}
              <div
                className="flex cursor-pointer items-center gap-3 p-3 transition-colors"
                style={{ background: isExpanded ? "var(--navy-light)" : "white" }}
                onClick={() => setExpandedUser(isExpanded ? null : user.email)}
              >
                <ChevronDown
                  className="h-4 w-4 shrink-0 transition-transform duration-200"
                  style={{
                    color: "var(--text-muted)",
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all text-sm font-bold" dir="ltr">{user.email}</span>
                    {hasMultiDeviceAttempt(user) && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--red-mid)" }}>
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        ריבוי מכשירים
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{user.loginCount} כניסות</span>
                    <span>{sessionStats?.sessionCount ?? 0} סשנים</span>
                    <span>{formatDuration(sessionStats?.totalDurationMs ?? 0)}</span>
                    <span>{chatCount} צ׳אטים</span>
                    {sessionStats?.lastSeenAt && (
                      <span>נראה {formatDate(sessionStats.lastSeenAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <span className={`badge ${user.isAllowed ? "badge-green" : "badge-red"}`}>
                    {user.isAllowed ? "מורשה" : "לא מורשה"}
                  </span>
                  {latestDevice && (
                    <span className="badge badge-muted">{getDeviceLabel(latestDevice.userAgent)}</span>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {!user.isAllowed ? (
                    <ActionButton
                      icon={<UserPlus className="h-3 w-3" />}
                      label="אשר"
                      tone="green"
                      loading={loadingKey === addKey}
                      onClick={() => adminAction("add", user.email)}
                    />
                  ) : (
                    <ActionButton
                      icon={<UserMinus className="h-3 w-3" />}
                      label="הסר"
                      tone="red"
                      loading={loadingKey === removeKey}
                      onClick={() => adminAction("remove", user.email)}
                    />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <UserDetail
                  user={user}
                  sessions={allSessions.filter((s) => s.email === user.email)}
                  chats={chatsByEmail.get(user.email) ?? []}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UserDetail({
  user,
  sessions,
  chats,
}: {
  user: AdminAuthUser;
  sessions: StudentSessionRecord[];
  chats: MentorLogEntry[];
}) {
  return (
    <div className="border-t p-4" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Devices */}
        <div>
          <p className="mb-2 text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            מכשירים ({user.devices.length})
          </p>
          <div className="space-y-1.5">
            {user.devices.map((device) => (
              <div key={device.id} className="rounded-lg p-2 text-xs" style={{ background: "white", border: "1px solid var(--border)" }}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className={`badge text-[10px] ${device.status === "active" ? "badge-green" : device.status === "blocked" ? "badge-red" : "badge-muted"}`}>
                    {device.status}
                  </span>
                  <span className="font-bold">{getDeviceLabel(device.userAgent)}</span>
                </div>
                <div dir="ltr" style={{ color: "var(--text-muted)" }}>{device.ip ?? "-"}</div>
                <div style={{ color: "var(--text-muted)" }}>{formatDate(device.lastSeenAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div>
          <p className="mb-2 text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            סשנים ({sessions.length})
          </p>
          <div className="max-h-52 space-y-1.5 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>אין סשנים</p>
            ) : (
              sessions.map((s) => (
                <div key={`${s.email}-${s.sessionId}`} className="rounded-lg p-2 text-xs" style={{ background: "white", border: "1px solid var(--border)" }}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={`badge text-[10px] ${s.status === "active" ? "badge-green" : "badge-muted"}`}>
                      {s.status === "active" ? "פעיל" : "הסתיים"}
                    </span>
                    <span className="font-bold">{formatDuration(s.durationMs)}</span>
                    <span style={{ color: "var(--text-muted)" }}>{s.pageViews} עמודים</span>
                  </div>
                  <div dir="ltr" style={{ color: "var(--text-muted)" }}>{s.lastPath ?? "-"}</div>
                  <div style={{ color: "var(--text-muted)" }}>{formatDate(s.lastSeenAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chats */}
        <div>
          <p className="mb-2 text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            צ׳אטים ({chats.length})
          </p>
          <div className="max-h-52 space-y-1.5 overflow-y-auto">
            {chats.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>אין צ׳אטים</p>
            ) : (
              chats.map((log, i) => (
                <details
                  key={`${log.ts}-${i}`}
                  className="rounded-lg p-2 text-xs"
                  style={{ background: "white", border: "1px solid var(--border)" }}
                >
                  <summary className="cursor-pointer truncate font-bold">{log.q}</summary>
                  <div className="mt-2 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{log.a}</div>
                  <div className="mt-1" style={{ color: "var(--text-muted)" }}>{formatDate(log.ts)}</div>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chats Section ─────────────────────────────────────────────────────────────

function ChatsSection({
  mentorLogs,
  chatQuery,
  setChatQuery,
  chatCountByEmail,
}: {
  mentorLogs: MentorLogEntry[];
  chatQuery: string;
  setChatQuery: (v: string) => void;
  chatCountByEmail: Map<string, number>;
}) {
  const topChatters = Array.from(chatCountByEmail.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxCount = Math.max(...topChatters.map((u) => u[1]), 1);

  return (
    <div className="space-y-4">
      {/* Per-user stats */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <SectionTitle icon={<BarChart className="h-5 w-5" />} title="צ׳אטים לפי משתמש" count={topChatters.length} />
        <div className="mt-4 space-y-2">
          {topChatters.length === 0 ? (
            <EmptyState>אין צ׳אטים עדיין.</EmptyState>
          ) : (
            topChatters.map(([email, count]) => (
              <div key={email} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-right text-xs font-black" style={{ color: "var(--teal)" }}>
                  {count}
                </span>
                <div className="relative flex-1 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "22px" }}>
                  <div
                    className="absolute inset-y-0 right-0 flex items-center rounded px-2"
                    style={{ width: `${Math.max((count / maxCount) * 100, 25)}%`, background: "var(--teal-light)" }}
                  >
                    <span className="truncate text-xs font-bold" style={{ color: "var(--teal)" }} dir="ltr">
                      {email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs font-bold underline"
                  style={{ color: "var(--navy-mid)" }}
                  onClick={() => setChatQuery(chatQuery === email ? "" : email)}
                >
                  {chatQuery === email ? "נקה" : "סנן"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Chat log */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<MessageSquare className="h-5 w-5" />} title="כל הצ׳אטים" count={mentorLogs.length} />
          {chatQuery && (
            <button
              type="button"
              onClick={() => setChatQuery("")}
              className="text-xs font-bold"
              style={{ color: "var(--red-mid)" }}
            >
              ✕ נקה פילטר: {chatQuery}
            </button>
          )}
        </div>
        <div className="mt-3">
          <SearchInput value={chatQuery} onChange={setChatQuery} placeholder="חיפוש לפי מייל או תוכן שאלה" />
        </div>
        {mentorLogs.length === 0 ? (
          <EmptyState>אין שיחות תואמות.</EmptyState>
        ) : (
          <div className="mt-4 divide-y" style={{ borderColor: "var(--border)" }}>
            {mentorLogs.map((log, index) => (
              <details key={`${log.email}-${log.ts}-${index}`} className="group py-3">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold" style={{ color: "var(--navy-mid)" }} dir="ltr">
                        {log.email}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{formatDate(log.ts)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm" style={{ color: "var(--text-primary)" }}>
                      {log.q}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>פתח ▾</span>
                </summary>
                <div className="mt-3 grid gap-2 text-sm">
                  <ChatBlock title="שאלה">{log.q}</ChatBlock>
                  <ChatBlock title="תשובה">{log.a}</ChatBlock>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Sessions Section ──────────────────────────────────────────────────────────

function SessionsSection({ sessions }: { sessions: StudentSessionRecord[] }) {
  const maxDuration = Math.max(...sessions.map((s) => s.durationMs), 1);

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<Activity className="h-5 w-5" />} title="כל הסשנים" count={sessions.length} />
      {sessions.length === 0 ? (
        <EmptyState>אין פעילות סשנים עדיין.</EmptyState>
      ) : (
        <ResponsiveTable minWidth="780px">
          <thead>
            <tr>
              <TableHead>מייל</TableHead>
              <TableHead>משך</TableHead>
              <TableHead>התחלה</TableHead>
              <TableHead>צפיות</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>עמוד אחרון</TableHead>
              <TableHead>IP</TableHead>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 100).map((session) => (
              <tr key={`${session.email}-${session.sessionId}`} className="align-top">
                <TableCell>
                  <div className="text-xs font-bold" dir="ltr">{session.email}</div>
                  <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }} dir="ltr">
                    {shortValue(session.sessionId)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{formatDuration(session.durationMs)}</div>
                  <div className="mt-1 overflow-hidden rounded" style={{ background: "var(--bg-subtle)", height: "4px", width: "60px" }}>
                    <div
                      className="h-full rounded"
                      style={{ width: `${(session.durationMs / maxDuration) * 100}%`, background: "var(--navy-mid)" }}
                    />
                  </div>
                </TableCell>
                <TableCell>{formatDate(session.firstSeenAt)}</TableCell>
                <TableCell>{session.pageViews}</TableCell>
                <TableCell>
                  <span className={`badge ${session.status === "active" ? "badge-green" : "badge-muted"}`}>
                    {session.status === "active" ? "פעיל" : "הסתיים"}
                  </span>
                  <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(session.lastSeenAt)}
                  </div>
                </TableCell>
                <TableCell dir="ltr">{session.lastPath ?? "-"}</TableCell>
                <TableCell dir="ltr">{session.ip ?? "-"}</TableCell>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      )}
    </section>
  );
}

// ─── Registrations Section ─────────────────────────────────────────────────────

function RegistrationsSection({
  snapshot,
  filteredRegistrations,
  latestPaymentByEmail,
  registrationQuery,
  setRegistrationQuery,
  planFilter,
  setPlanFilter,
  paymentFilter,
  setPaymentFilter,
  loadingKey,
  adminAction,
}: {
  snapshot: AuthAdminSnapshot;
  filteredRegistrations: RegistrationRequest[];
  latestPaymentByEmail: Map<string, PaymentActionRecord>;
  registrationQuery: string;
  setRegistrationQuery: (v: string) => void;
  planFilter: PlanFilter;
  setPlanFilter: (v: PlanFilter) => void;
  paymentFilter: PaymentFilter;
  setPaymentFilter: (v: PaymentFilter) => void;
  loadingKey: string | null;
  adminAction: (action: "add" | "remove", email: string) => Promise<void>;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<ClipboardList className="h-5 w-5" />} title="הרשמות ורכישות" count={filteredRegistrations.length} />
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_210px]">
        <SearchInput value={registrationQuery} onChange={setRegistrationQuery} placeholder="חיפוש מייל, טלפון או IP" />
        <Select value={planFilter} onChange={(v) => setPlanFilter(v as PlanFilter)}>
          <option value="all">כל המסלולים</option>
          <option value="basic">Basic 19₪</option>
          <option value="pro">Pro 49₪</option>
        </Select>
        <Select value={paymentFilter} onChange={(v) => setPaymentFilter(v as PaymentFilter)}>
          <option value="all">כל סטטוסי התשלום</option>
          <option value="pending">מילאו ולא רכשו</option>
          <option value="manual_pending">הוראות ידני</option>
          <option value="payment_link_opened">פתחו לינק תשלום</option>
        </Select>
      </div>
      <ResponsiveTable minWidth="1120px">
        <thead>
          <tr>
            <TableHead>פעולות</TableHead>
            <TableHead>סטודנט</TableHead>
            <TableHead>מסלול</TableHead>
            <TableHead>סטטוס רכישה</TableHead>
            <TableHead>פעולה אחרונה</TableHead>
            <TableHead>נשלח</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>מכשיר</TableHead>
            <TableHead>User-Agent</TableHead>
          </tr>
        </thead>
        <tbody>
          {filteredRegistrations.map((request) => {
            const latestPayment = latestPaymentByEmail.get(request.email);
            const isAllowed     = snapshot.allowedEmails.includes(request.email);
            const addKey        = `add:${request.email}`;
            const removeKey     = `remove:${request.email}`;
            return (
              <tr key={`${request.email}-${request.createdAt}`} className="align-top">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {isAllowed ? (
                      <span className="badge badge-green">מורשה ✓</span>
                    ) : (
                      <ActionButton
                        icon={<UserPlus className="h-3 w-3" />}
                        label="אשר"
                        tone="green"
                        loading={loadingKey === addKey}
                        onClick={() => adminAction("add", request.email)}
                      />
                    )}
                    {isAllowed && (
                      <ActionButton
                        icon={<UserMinus className="h-3 w-3" />}
                        label="הסר"
                        tone="red"
                        loading={loadingKey === removeKey}
                        onClick={() => adminAction("remove", request.email)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold" dir="ltr">{request.email}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }} dir="ltr">{request.phone}</div>
                </TableCell>
                <TableCell>
                  <span className={`badge ${request.plan === "pro" ? "badge-purple" : "badge-green"}`}>
                    {request.plan === "pro" ? "Pro" : "Basic"} · {request.totalPriceIls}₪
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`badge ${paymentStatusClass(request.paymentStatus)}`}>
                    {paymentStatusLabel(request.paymentStatus)}
                  </span>
                </TableCell>
                <TableCell>
                  {latestPayment ? (
                    <div>
                      <div className="font-bold">{paymentActionLabel(latestPayment.action)}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {methodLabel(latestPayment.method)} · {formatDate(latestPayment.createdAt)}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>אין</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell dir="ltr">{request.ip ?? "-"}</TableCell>
                <TableCell>{getDeviceLabel(request.userAgent)}</TableCell>
                <TableCell>
                  <span className="line-clamp-2 block max-w-75 text-xs" dir="ltr" title={request.userAgent}>
                    {request.userAgent ?? "-"}
                  </span>
                </TableCell>
              </tr>
            );
          })}
        </tbody>
      </ResponsiveTable>
    </section>
  );
}

// ─── Payments Section ──────────────────────────────────────────────────────────

function PaymentActionsSection({ actions }: { actions: PaymentActionRecord[] }) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<CreditCard className="h-5 w-5" />} title="פעולות תשלום" count={actions.length} />
      {actions.length === 0 ? (
        <EmptyState>אין פעולות תשלום עדיין.</EmptyState>
      ) : (
        <ResponsiveTable minWidth="760px">
          <thead>
            <tr>
              <TableHead>מייל</TableHead>
              <TableHead>פעולה</TableHead>
              <TableHead>סכום</TableHead>
              <TableHead>זמן</TableHead>
              <TableHead>IP</TableHead>
            </tr>
          </thead>
          <tbody>
            {actions.slice(0, 100).map((action) => (
              <tr key={action.id} className="align-top">
                <TableCell>
                  <div className="font-bold" dir="ltr">{action.email}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }} dir="ltr">
                    {action.phone ?? "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{paymentActionLabel(action.action)}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{methodLabel(action.method)}</div>
                </TableCell>
                <TableCell>{action.amountIls}₪</TableCell>
                <TableCell>{formatDate(action.createdAt)}</TableCell>
                <TableCell dir="ltr">{action.ip ?? "-"}</TableCell>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      )}
    </section>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, count }: { icon: ReactNode; title: string; count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span style={{ color: "var(--navy-mid)" }}>{icon}</span>
      <h2 className="text-xl font-black">{title}</h2>
      <span className="badge badge-muted">{count}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "warning" | "info" | "success";
}) {
  const background =
    tone === "warning" ? "var(--amber-light)"  :
    tone === "info"    ? "var(--teal-light)"   :
    tone === "success" ? "var(--green-light)"  :
                         "var(--navy-light)";
  const borderColor =
    tone === "warning" ? "var(--amber-border)" :
    tone === "info"    ? "var(--teal-border)"  :
    tone === "success" ? "var(--green-border)" :
                         "var(--navy-border)";
  const color =
    tone === "warning" ? "var(--amber)"    :
    tone === "info"    ? "var(--teal)"     :
    tone === "success" ? "var(--green)"    :
                         "var(--navy-mid)";
  return (
    <div className="rounded-xl border px-4 py-3" style={{ background, borderColor }}>
      <p className="font-mono text-2xl font-black" style={{ color }} dir="ltr">{value}</p>
      <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-lg border bg-white px-3" style={{ borderColor: "var(--border)" }}>
      <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-10 w-full bg-transparent text-sm font-semibold outline-none"
      />
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 rounded-lg border bg-white px-3 text-sm font-bold outline-none"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
    >
      {children}
    </select>
  );
}

function ResponsiveTable({ minWidth, children }: { minWidth: string; children: ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th
      className="border-b px-3 py-2 text-right text-xs font-black"
      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
    >
      {children}
    </th>
  );
}

function TableCell({ children, ...props }: { children: ReactNode } & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={`border-b px-3 py-3 ${props.className ?? ""}`}
      style={{ borderColor: "var(--border)", ...props.style }}
    >
      {children}
    </td>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  tone,
  loading,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tone: "green" | "red";
  loading: boolean;
  onClick: () => void;
}) {
  const styles =
    tone === "green"
      ? { bg: "var(--green-light)", color: "var(--green)", border: "var(--green-border)" }
      : { bg: "var(--red-light)",   color: "var(--red-mid)", border: "var(--red-border)" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black transition hover:opacity-80 disabled:opacity-50"
      style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}
    >
      {loading ? "..." : icon}
      {label}
    </button>
  );
}

function ChatBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-subtle)" }}>
      <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{title}</p>
      <p className="mt-1 whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{children}</p>
    </div>
  );
}
