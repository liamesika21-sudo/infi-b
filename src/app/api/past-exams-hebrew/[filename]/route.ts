import { readFile } from "node:fs/promises";
import path from "node:path";

import { hebrewPastExamFilenames } from "@/lib/calculus2/past-exams-hebrew";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!hebrewPastExamFilenames.has(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "docs", "past-exams-hebrew", filename);
  const file = await readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
