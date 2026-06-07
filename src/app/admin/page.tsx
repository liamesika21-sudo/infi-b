import { cookies } from "next/headers";
import { UserX } from "lucide-react";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import {
  AUTH_COOKIE_NAME,
  getAuthAdminSnapshot,
  isAdminEmail,
  readAuthCookieValue,
} from "@/lib/simple-auth";
import { getMentorLogs } from "@/lib/mentor-credits";

export const runtime = "nodejs";

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
            צריך להתחבר עם מייל אדמין כדי לראות את מסך הניהול.
          </p>
        </section>
      </div>
    );
  }

  const [snapshot, mentorLogs] = await Promise.all([
    getAuthAdminSnapshot(),
    getMentorLogs(),
  ]);

  return <AdminDashboardClient snapshot={snapshot} mentorLogs={mentorLogs} />;
}
