import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { ClipboardList, Monitor, Phone, ShieldCheck, Sparkles, Smartphone, UserCheck, UserX } from "lucide-react";
import {
  AUTH_COOKIE_NAME,
  getAuthAdminSnapshot,
  isAdminEmail,
  readAuthCookieValue,
  type AdminAuthUser,
  type AuthDeviceRecord,
  type RegistrationRequest,
} from "@/lib/simple-auth";

export const runtime = "nodejs";

function formatDate(value?: string): string {
  if (!value) return "עדיין לא נכנס";

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortDeviceId(deviceId: string): string {
  if (deviceId.length <= 18) return deviceId;
  return `${deviceId.slice(0, 8)}...${deviceId.slice(-6)}`;
}

function getStatusLabel(status: AuthDeviceRecord["status"]): string {
  switch (status) {
    case "fixed":
      return "קבוע";
    case "active":
      return "פעיל";
    case "pending":
      return "ממתין לאישור";
    case "blocked":
      return "נחסם";
  }
}

function getStatusClass(status: AuthDeviceRecord["status"]): string {
  switch (status) {
    case "fixed":
      return "badge-green";
    case "active":
      return "badge-navy-light";
    case "pending":
      return "badge-amber";
    case "blocked":
      return "badge-red";
  }
}

function hasMultiDeviceAttempt(user: AdminAuthUser): boolean {
  return user.deviceCount > 1 || user.devices.some((device) => device.status === "blocked");
}

function countRiskUsers(users: AdminAuthUser[]): number {
  return users.filter(hasMultiDeviceAttempt).length;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authCookie = readAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  const isAdmin = authCookie.ok && (await isAdminEmail(authCookie.email));

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-white p-8 text-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <UserX className="mx-auto h-10 w-10" style={{ color: "var(--red-mid)" }} aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-black">אין הרשאת אדמין</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            צריך להתחבר עם מייל אדמין כדי לראות את מסך הכניסות.
          </p>
        </section>
      </div>
    );
  }

  const snapshot = await getAuthAdminSnapshot();
  const totalLogins = snapshot.users.reduce((sum, user) => sum + user.loginCount, 0);
  const totalDevices = snapshot.users.reduce((sum, user) => sum + user.deviceCount, 0);
  const riskUsers = countRiskUsers(snapshot.users);
  const multiDeviceUsers = snapshot.users.filter(hasMultiDeviceAttempt);
  const proRegistrations = snapshot.registrationRequests.filter((request) => request.plan === "pro").length;

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
            <h1 className="mt-2 text-3xl font-black">בקרת כניסות</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              מעקב אחרי מיילים מורשים, מכשיר קבוע, ניסיונות כניסה חסומים וריבוי מכשירים.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:min-w-[640px]">
            <Metric label="מיילים מורשים" value={snapshot.allowedEmails.length} />
            <Metric label="כניסות" value={totalLogins} />
            <Metric label="מכשירים" value={totalDevices} />
            <Metric label="ריבוי מכשירים" value={riskUsers} tone="warning" />
            <Metric label="בקשות הרשמה" value={snapshot.registrationRequests.length} tone="info" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" style={{ color: "var(--teal)" }} aria-hidden="true" />
              <h2 className="text-xl font-black">בקשות הרשמה</h2>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              פרטים שהושארו מטופס ההרשמה: Basic ב-19₪, או Pro ב-49₪ כולל מנטור צ&apos;אט שמכיר הרצאות, תרגולים, תמלולים וסיכומים.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:min-w-[260px]">
            <MiniMetric label="סה״כ פניות" value={snapshot.registrationRequests.length} />
            <MiniMetric label="Pro" value={proRegistrations} />
          </div>
        </div>

        {snapshot.registrationRequests.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            עדיין אין בקשות הרשמה.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr style={{ color: "var(--text-secondary)" }}>
                  <TableHead>מייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>מסלול</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>נשלח</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>User-Agent</TableHead>
                </tr>
              </thead>
              <tbody>
                {snapshot.registrationRequests.map((request) => (
                  <RegistrationRow key={`${request.email}-${request.createdAt}`} request={request} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {multiDeviceUsers.length > 0 && (
        <section
          className="rounded-lg border p-5 shadow-sm"
          style={{ background: "var(--red-light)", borderColor: "var(--red-border)" }}
        >
          <h2 className="text-lg font-black" style={{ color: "var(--red-mid)" }}>
            משתמשים עם ניסיון כניסה ממספר מכשירים
          </h2>
          <div className="mt-3 grid gap-2">
            {multiDeviceUsers.map((user) => {
              const blockedCount = user.devices.filter((device) => device.status === "blocked").length;
              return (
                <a
                  key={user.email}
                  href={`#user-${encodeURIComponent(user.email)}`}
                  className="rounded-lg border bg-white px-4 py-3 text-sm font-bold transition hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: "var(--red-border)", color: "var(--text-primary)" }}
                >
                  <span dir="ltr">{user.email}</span>
                  <span className="mx-2" style={{ color: "var(--text-muted)" }}>·</span>
                  {user.deviceCount} מכשירים
                  {blockedCount > 0 && <> · {blockedCount} חסומים</>}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-4">
        {snapshot.users.map((user) => (
          <UserAccessCard key={user.email} user={user} />
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "info" }) {
  const background =
    tone === "warning" ? "var(--amber-light)" : tone === "info" ? "var(--teal-light)" : "var(--navy-light)";
  const borderColor =
    tone === "warning" ? "var(--amber-border)" : tone === "info" ? "var(--teal-border)" : "var(--navy-border)";
  const color = tone === "warning" ? "var(--amber)" : tone === "info" ? "var(--teal)" : "var(--navy-mid)";

  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        background,
        borderColor,
      }}
    >
      <p className="font-mono text-2xl font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
    </div>
  );
}

function RegistrationRow({ request }: { request: RegistrationRequest }) {
  return (
    <tr className="align-top">
      <TableCell>
        <span className="break-all font-bold" dir="ltr">
          {request.email}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 font-bold" dir="ltr">
          <Phone className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
          {request.phone}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {request.plan === "pro" ? (
            <span className="badge badge-purple">
              <Sparkles className="ml-1 h-3 w-3" aria-hidden="true" />
              Pro 49₪
            </span>
          ) : (
            <span className="badge badge-green">Basic 19₪</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-base font-black">{request.totalPriceIls}₪</span>
      </TableCell>
      <TableCell>{formatDate(request.createdAt)}</TableCell>
      <TableCell>
        <span dir="ltr">{request.ip ?? "-"}</span>
      </TableCell>
      <TableCell>
        <span className="line-clamp-2 block max-w-[260px] text-xs" dir="ltr" title={request.userAgent}>
          {request.userAgent ?? "-"}
        </span>
      </TableCell>
    </tr>
  );
}

function UserAccessCard({ user }: { user: AdminAuthUser }) {
  const hasFixedDevice = Boolean(user.fixedDeviceId);
  const hasManyDevices = hasMultiDeviceAttempt(user);
  const blockedDevices = user.devices.filter((device) => device.status === "blocked");

  return (
    <article id={`user-${encodeURIComponent(user.email)}`} className="scroll-mt-24 rounded-lg border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <UserCheck className="h-4 w-4" style={{ color: user.isAllowed ? "var(--green-mid)" : "var(--red-mid)" }} aria-hidden="true" />
            <h2 className="break-all text-lg font-black" dir="ltr">
              {user.email}
            </h2>
            <span className={`badge ${user.isAllowed ? "badge-green" : "badge-red"}`}>
              {user.isAllowed ? "מורשה" : "לא מורשה"}
            </span>
            {hasFixedDevice && <span className="badge badge-green">מכשיר קבוע</span>}
            {hasManyDevices && <span className="badge badge-red">ניסיון ממספר מכשירים</span>}
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            כניסה ראשונה: {formatDate(user.firstLoginAt)} · כניסה אחרונה: {formatDate(user.lastLoginAt)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]">
          <MiniMetric label="כניסות" value={user.loginCount} />
          <MiniMetric label="מכשירים" value={user.deviceCount} />
          <MiniMetric label="פעילים" value={user.activeDeviceCount} />
        </div>
      </div>

      {hasManyDevices && (
        <div
          className="mt-4 rounded-lg border px-4 py-3 text-sm font-semibold leading-7"
          style={{ background: "var(--red-light)", borderColor: "var(--red-border)", color: "var(--red-mid)" }}
        >
          נמצא ניסיון כניסה ממספר מכשירים עבור <span dir="ltr">{user.email}</span>.
          {blockedDevices.length > 0 && <> {blockedDevices.length} מכשיר/ים סומנו כחסומים.</>}
        </div>
      )}

      {user.devices.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          עדיין אין כניסות למייל הזה.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr style={{ color: "var(--text-secondary)" }}>
                <TableHead>מכשיר</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>כניסות</TableHead>
                <TableHead>נראה לראשונה</TableHead>
                <TableHead>נראה לאחרונה</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User-Agent</TableHead>
              </tr>
            </thead>
            <tbody>
              {user.devices
                .slice()
                .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
                .map((device) => (
                  <tr key={device.id} className="align-top">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {device.userAgent?.toLowerCase().includes("mobile") ? (
                          <Smartphone className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                        ) : (
                          <Monitor className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                        )}
                        <span className="font-mono text-xs" dir="ltr" title={device.id}>
                          {shortDeviceId(device.id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`badge ${getStatusClass(device.status)}`}>{getStatusLabel(device.status)}</span>
                    </TableCell>
                    <TableCell>{device.loginCount}</TableCell>
                    <TableCell>{formatDate(device.firstSeenAt)}</TableCell>
                    <TableCell>{formatDate(device.lastSeenAt)}</TableCell>
                    <TableCell>
                      <span dir="ltr">{device.ip ?? "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2 block max-w-[260px] text-xs" dir="ltr" title={device.userAgent}>
                        {device.userAgent ?? "-"}
                      </span>
                    </TableCell>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
      <p className="font-mono text-lg font-black">{value}</p>
      <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="border-b px-3 py-2 text-right text-xs font-black" style={{ borderColor: "var(--border)" }}>
      {children}
    </th>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return (
    <td className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
      {children}
    </td>
  );
}
