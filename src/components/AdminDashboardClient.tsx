"use client";

import { useMemo, useState, type ReactNode, type TdHTMLAttributes } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Search,
  ShieldCheck,
  UserCheck,
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

type UserFilter = "all" | "allowed" | "not_allowed" | "risk" | "active" | "no_login";
type PlanFilter = "all" | "basic" | "pro";
type PaymentFilter = "all" | "pending" | "manual_pending" | "payment_link_opened";

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
  return user.deviceCount > 1 || user.devices.some((device) => device.status === "blocked");
}

function paymentStatusLabel(status?: RegistrationRequest["paymentStatus"]): string {
  switch (status) {
    case "manual_pending":
      return "הוראות ידני";
    case "payment_link_opened":
      return "פתח דף תשלום";
    default:
      return "ללא רכישה";
  }
}

function paymentStatusClass(status?: RegistrationRequest["paymentStatus"]): string {
  switch (status) {
    case "manual_pending":
      return "badge-amber";
    case "payment_link_opened":
      return "badge-green";
    default:
      return "badge-red";
  }
}

function methodLabel(method?: PaymentMethod): string {
  switch (method) {
    case "bit":
      return "Bit";
    case "paybox":
      return "PayBox";
    case "credit":
      return "אשראי";
    default:
      return "-";
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

export function AdminDashboardClient({
  snapshot,
  mentorLogs,
}: {
  snapshot: AuthAdminSnapshot;
  mentorLogs: MentorLogEntry[];
}) {
  const [registrationQuery, setRegistrationQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [userFilter, setUserFilter] = useState<UserFilter>("all");

  const latestPaymentByEmail = useMemo(() => {
    const map = new Map<string, PaymentActionRecord>();
    for (const action of snapshot.paymentActions) {
      if (!map.has(action.email)) map.set(action.email, action);
    }
    return map;
  }, [snapshot.paymentActions]);

  const sessionsByEmail = useMemo(() => {
    const map = new Map<
      string,
      { totalDurationMs: number; pageViews: number; sessionCount: number; lastSeenAt: string; lastPath?: string }
    >();

    for (const session of snapshot.activitySessions) {
      const current = map.get(session.email) ?? {
        totalDurationMs: 0,
        pageViews: 0,
        sessionCount: 0,
        lastSeenAt: "",
        lastPath: undefined,
      };
      map.set(session.email, {
        totalDurationMs: current.totalDurationMs + session.durationMs,
        pageViews: current.pageViews + session.pageViews,
        sessionCount: current.sessionCount + 1,
        lastSeenAt: session.lastSeenAt > current.lastSeenAt ? session.lastSeenAt : current.lastSeenAt,
        lastPath: session.lastSeenAt > current.lastSeenAt ? session.lastPath : current.lastPath,
      });
    }

    return map;
  }, [snapshot.activitySessions]);

  const chatCountByEmail = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of mentorLogs) {
      map.set(log.email, (map.get(log.email) ?? 0) + 1);
    }
    return map;
  }, [mentorLogs]);

  const filteredRegistrations = useMemo(() => {
    const query = registrationQuery.trim().toLowerCase();
    return snapshot.registrationRequests.filter((request) => {
      const latestPayment = latestPaymentByEmail.get(request.email);
      const status = request.paymentStatus ?? "pending";
      const matchesQuery =
        !query ||
        request.email.toLowerCase().includes(query) ||
        request.phone.includes(query) ||
        request.ip?.includes(query);
      const matchesPlan = planFilter === "all" || request.plan === planFilter;
      const matchesPayment = paymentFilter === "all" || status === paymentFilter;
      return matchesQuery && matchesPlan && matchesPayment && (!latestPayment || latestPayment.email === request.email);
    });
  }, [latestPaymentByEmail, paymentFilter, planFilter, registrationQuery, snapshot.registrationRequests]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    return snapshot.users.filter((user) => {
      const sessionStats = sessionsByEmail.get(user.email);
      const matchesQuery =
        !query ||
        user.email.toLowerCase().includes(query) ||
        user.devices.some((device) => device.ip?.includes(query) || device.userAgent?.toLowerCase().includes(query));

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

  const pendingRegistrations = snapshot.registrationRequests.filter(
    (request) => (request.paymentStatus ?? "pending") === "pending"
  ).length;
  const totalSessionDuration = snapshot.activitySessions.reduce((sum, session) => sum + session.durationMs, 0);
  const totalLogins = snapshot.users.reduce((sum, user) => sum + user.loginCount, 0);
  const riskUsers = snapshot.users.filter(hasMultiDeviceAttempt).length;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" style={{ color: "var(--green-mid)" }} aria-hidden="true" />
              <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
                Admin
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-black">ניהול Infi</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              הרשמות, פעולות תשלום, כניסות, מכשירים, IP, פעילות סשנים וצ׳אטים של סטודנטים.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[680px]">
            <Metric label="בקשות הרשמה" value={snapshot.registrationRequests.length} />
            <Metric label="ללא רכישה" value={pendingRegistrations} tone="warning" />
            <Metric label="פעולות תשלום" value={snapshot.paymentActions.length} tone="success" />
            <Metric label="צ׳אטים" value={mentorLogs.length} tone="info" />
            <Metric label="משתמשים" value={snapshot.users.length} />
            <Metric label="כניסות" value={totalLogins} />
            <Metric label="ריבוי מכשירים" value={riskUsers} tone="warning" />
            <Metric label="משך סשנים" value={formatDuration(totalSessionDuration)} tone="info" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <SectionTitle icon={<ClipboardList className="h-5 w-5" />} title="הרשמות ורכישות" count={filteredRegistrations.length} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_210px]">
          <SearchInput value={registrationQuery} onChange={setRegistrationQuery} placeholder="חיפוש מייל, טלפון או IP" />
          <Select value={planFilter} onChange={(value) => setPlanFilter(value as PlanFilter)}>
            <option value="all">כל המסלולים</option>
            <option value="basic">Basic 19₪</option>
            <option value="pro">Pro 49₪</option>
          </Select>
          <Select value={paymentFilter} onChange={(value) => setPaymentFilter(value as PaymentFilter)}>
            <option value="all">כל סטטוסי התשלום</option>
            <option value="pending">מילאו ולא רכשו</option>
            <option value="manual_pending">הוראות ידני</option>
            <option value="payment_link_opened">פתחו לינק תשלום</option>
          </Select>
        </div>
        <ResponsiveTable minWidth="1120px">
          <thead>
            <tr>
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
              return (
                <tr key={`${request.email}-${request.createdAt}`} className="align-top">
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
                    <span className="line-clamp-2 block max-w-[300px] text-xs" dir="ltr" title={request.userAgent}>
                      {request.userAgent ?? "-"}
                    </span>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </ResponsiveTable>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <SectionTitle icon={<UserCheck className="h-5 w-5" />} title="משתמשים, מכשירים ופעילות" count={filteredUsers.length} />
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_230px]">
          <SearchInput value={userQuery} onChange={setUserQuery} placeholder="חיפוש מייל, IP או מכשיר" />
          <Select value={userFilter} onChange={(value) => setUserFilter(value as UserFilter)}>
            <option value="all">כל המשתמשים</option>
            <option value="allowed">מורשים</option>
            <option value="not_allowed">לא מורשים</option>
            <option value="risk">ריבוי מכשירים</option>
            <option value="active">עם פעילות סשן</option>
            <option value="no_login">לא נכנסו</option>
          </Select>
        </div>
        <ResponsiveTable minWidth="1180px">
          <thead>
            <tr>
              <TableHead>מייל</TableHead>
              <TableHead>הרשאה</TableHead>
              <TableHead>כניסות</TableHead>
              <TableHead>מכשירים</TableHead>
              <TableHead>סשנים</TableHead>
              <TableHead>משך פעילות</TableHead>
              <TableHead>עמוד אחרון</TableHead>
              <TableHead>צ׳אטים</TableHead>
              <TableHead>IP אחרון</TableHead>
              <TableHead>User-Agent</TableHead>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const latestDevice = user.devices.slice().sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];
              const sessionStats = sessionsByEmail.get(user.email);
              return (
                <tr key={user.email} className="align-top">
                  <TableCell>
                    <div className="break-all font-bold" dir="ltr">{user.email}</div>
                    {hasMultiDeviceAttempt(user) && (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold" style={{ color: "var(--red-mid)" }}>
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        ריבוי מכשירים
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`badge ${user.isAllowed ? "badge-green" : "badge-red"}`}>
                      {user.isAllowed ? "מורשה" : "לא מורשה"}
                    </span>
                  </TableCell>
                  <TableCell>{user.loginCount}</TableCell>
                  <TableCell>
                    {user.deviceCount}
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {user.activeDeviceCount} פעילים
                    </div>
                  </TableCell>
                  <TableCell>{sessionStats?.sessionCount ?? 0}</TableCell>
                  <TableCell>{formatDuration(sessionStats?.totalDurationMs ?? 0)}</TableCell>
                  <TableCell dir="ltr">{sessionStats?.lastPath ?? "-"}</TableCell>
                  <TableCell>{chatCountByEmail.get(user.email) ?? 0}</TableCell>
                  <TableCell dir="ltr">{latestDevice?.ip ?? "-"}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 block max-w-[300px] text-xs" dir="ltr" title={latestDevice?.userAgent}>
                      {latestDevice?.userAgent ?? "-"}
                    </span>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </ResponsiveTable>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActivityTable sessions={snapshot.activitySessions} />
        <PaymentActionsTable actions={snapshot.paymentActions} />
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <SectionTitle icon={<MessageSquare className="h-5 w-5" />} title="צ׳אטים של סטודנטים" count={mentorLogs.length} />
        {mentorLogs.length === 0 ? (
          <EmptyState>אין שיחות עדיין.</EmptyState>
        ) : (
          <div className="mt-4 divide-y" style={{ borderColor: "var(--border)" }}>
            {mentorLogs.map((log, index) => (
              <details key={`${log.email}-${log.ts}-${index}`} className="group py-3">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold" style={{ color: "var(--navy-mid)" }} dir="ltr">{log.email}</span>
                      <span style={{ color: "var(--text-muted)" }}>{formatDate(log.ts)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm" style={{ color: "var(--text-primary)" }}>{log.q}</p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>פתח</span>
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

function ActivityTable({ sessions }: { sessions: StudentSessionRecord[] }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<Activity className="h-5 w-5" />} title="סשנים אחרונים" count={sessions.length} />
      {sessions.length === 0 ? (
        <EmptyState>אין פעילות סשנים עדיין.</EmptyState>
      ) : (
        <ResponsiveTable minWidth="760px">
          <thead>
            <tr>
              <TableHead>מייל</TableHead>
              <TableHead>משך</TableHead>
              <TableHead>צפיות</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>עמוד אחרון</TableHead>
              <TableHead>IP</TableHead>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 80).map((session) => (
              <tr key={`${session.email}-${session.sessionId}`} className="align-top">
                <TableCell>
                  <div className="font-bold" dir="ltr">{session.email}</div>
                  <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }} dir="ltr">
                    {shortValue(session.sessionId)}
                  </div>
                </TableCell>
                <TableCell>{formatDuration(session.durationMs)}</TableCell>
                <TableCell>{session.pageViews}</TableCell>
                <TableCell>
                  <span className={`badge ${session.status === "active" ? "badge-green" : "badge-muted"}`}>
                    {session.status === "active" ? "פעיל" : "הסתיים"}
                  </span>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
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

function PaymentActionsTable({ actions }: { actions: PaymentActionRecord[] }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <SectionTitle icon={<CreditCard className="h-5 w-5" />} title="פעולות תשלום אחרונות" count={actions.length} />
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
            {actions.slice(0, 80).map((action) => (
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
    tone === "warning"
      ? "var(--amber-light)"
      : tone === "info"
        ? "var(--teal-light)"
        : tone === "success"
          ? "var(--green-light)"
          : "var(--navy-light)";
  const borderColor =
    tone === "warning"
      ? "var(--amber-border)"
      : tone === "info"
        ? "var(--teal-border)"
        : tone === "success"
          ? "var(--green-border)"
          : "var(--navy-border)";
  const color =
    tone === "warning"
      ? "var(--amber)"
      : tone === "info"
        ? "var(--teal)"
        : tone === "success"
          ? "var(--green)"
          : "var(--navy-mid)";

  return (
    <div className="rounded-lg border px-4 py-3" style={{ background, borderColor }}>
      <p className="font-mono text-2xl font-black" style={{ color }} dir="ltr">
        {value}
      </p>
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
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-lg border bg-white px-3" style={{ borderColor: "var(--border)" }}>
      <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
    <th className="border-b px-3 py-2 text-right text-xs font-black" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
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
    <div className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
      {children}
    </div>
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
