import { readFile } from "node:fs/promises";
import path from "node:path";

import { homeworkStudyPageFilenames } from "@/lib/calculus2/homework-study-pages";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!homeworkStudyPageFilenames.has(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "docs", "hw-infi", filename);
  const file = await readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
