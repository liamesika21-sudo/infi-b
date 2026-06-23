import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, isAdminEmail, readAuthCookieValue } from "@/lib/simple-auth";
import StudyPlanClient from "./StudyPlanClient";

export const runtime = "nodejs";

export default async function StudyPlanPage() {
  const jar = await cookies();
  const auth = readAuthCookieValue(jar.get(AUTH_COOKIE_NAME)?.value);
  if (!auth.ok || !(await isAdminEmail(auth.email))) redirect("/dashboard");

  return <StudyPlanClient />;
}
