import {
  addAllowedEmail,
  removeAllowedEmail,
  validateCookieForRequest,
  isAdminEmail,
} from "@/lib/simple-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await validateCookieForRequest(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdminEmail(auth.email))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { action?: string; email?: string };
  const { action, email } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (action !== "add" && action !== "remove") {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "add") {
    await addAllowedEmail(email);
  } else {
    await removeAllowedEmail(email);
  }

  return Response.json({ ok: true });
}
