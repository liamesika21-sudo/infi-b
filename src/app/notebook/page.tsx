import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, readAuthCookieValue } from "@/lib/simple-auth";
import { getNotebookEntries } from "@/lib/notebook";
import { NotebookClient } from "@/components/NotebookClient";

export const dynamic = "force-dynamic";

export default async function NotebookPage() {
  const cookieStore = await cookies();
  const auth = readAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth.ok) redirect("/");

  const entries = await getNotebookEntries(auth.email);

  return <NotebookClient initialEntries={entries} />;
}
