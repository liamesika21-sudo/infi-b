import fs from "node:fs/promises";
import type { DetectedTopic, ExtractedTextRecord, SourceFile } from "./types";

type PdfParseModule = {
  PDFParse?: new (params: { data: Buffer }) => {
    getText: () => Promise<{ text: string; total?: number }>;
    destroy: () => Promise<void>;
  };
};

export async function extractTextFromFile(file: SourceFile): Promise<ExtractedTextRecord> {
  if (file.extension !== ".pdf") {
    return {
      sourceFileId: file.id,
      filename: file.filename,
      filePath: file.relativePath,
      extractedText: "",
      status: "failed",
      error: `Unsupported file extension: ${file.extension}`,
    };
  }

  try {
    const buffer = await fs.readFile(file.absolutePath);
    const mod = (await import("pdf-parse")) as PdfParseModule;
    if (!mod.PDFParse) throw new Error("pdf-parse did not expose PDFParse.");
    const parser = new mod.PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const extractedText = normalizeExtractedText(parsed.text ?? "");
    const status = extractedText.trim().length < 80 ? "needs_ocr" : "success";

    return {
      sourceFileId: file.id,
      filename: file.filename,
      filePath: file.relativePath,
      extractedText,
      pageCount: parsed.total,
      status,
      error: status === "needs_ocr" ? "Extracted text is empty or too short; OCR is likely required." : undefined,
    };
  } catch (error) {
    return {
      sourceFileId: file.id,
      filename: file.filename,
      filePath: file.relativePath,
      extractedText: "",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

const topicRules: Array<{ title: string; aliases: string[] }> = [
  { title: "סדרות", aliases: ["סדרה", "סדרות", "sequence", "sequences", "a_n", "an"] },
  { title: "טורים", aliases: ["טור", "טורים", "series", "sum", "סכום"] },
  { title: "טורי חזקות", aliases: ["טור חזקות", "טורי חזקות", "power series", "power-series"] },
  { title: "רדיוס התכנסות", aliases: ["רדיוס התכנסות", "radius of convergence", "convergence radius"] },
  { title: "מבחן המנה", aliases: ["מבחן המנה", "ratio test", "d'alembert", "d’alembert"] },
  { title: "מבחן השורש", aliases: ["מבחן השורש", "root test", "cauchy root"] },
  { title: "מבחן ההשוואה", aliases: ["מבחן ההשוואה", "comparison test", "limit comparison", "השוואה גבולית"] },
  { title: "התכנסות בהחלט", aliases: ["התכנסות בהחלט", "absolutely convergent", "absolute convergence"] },
  { title: "התכנסות בתנאי", aliases: ["התכנסות בתנאי", "conditional convergence", "conditionally convergent"] },
  { title: "טור טיילור", aliases: ["טור טיילור", "taylor series", "Taylor"] },
  { title: "פולינום טיילור", aliases: ["פולינום טיילור", "taylor polynomial", "Taylor polynomial"] },
  { title: "אינטגרלים לא אמיתיים", aliases: ["אינטגרל לא אמיתי", "אינטגרלים לא אמיתיים", "improper integral", "improper integrals"] },
  { title: "פונקציות", aliases: ["פונקציה", "פונקציות", "function", "functions"] },
  { title: "גבולות", aliases: ["גבול", "גבולות", "limit", "limits", "lim"] },
  { title: "רציפות", aliases: ["רציפות", "רציפה", "continuous", "continuity"] },
  { title: "נגזרות", aliases: ["נגזרת", "נגזרות", "derivative", "differentiable", "differentiation"] },
  { title: "התכנסות במידה שווה", aliases: ["התכנסות במידה שווה", "uniform convergence", "uniformly convergent"] },
  { title: "סדרות פונקציות", aliases: ["סדרת פונקציות", "סדרות פונקציות", "sequence of functions", "function sequences"] },
  { title: "טורי פונקציות", aliases: ["טור פונקציות", "טורי פונקציות", "series of functions", "function series"] },
];

export function detectTopicsFromExtractedRecords(records: ExtractedTextRecord[], files: SourceFile[]): DetectedTopic[] {
  const fileById = new Map(files.map((file) => [file.id, file]));

  return topicRules
    .map((rule) => {
      const detectedInFiles = new Set<string>();
      const detectedInWeeks = new Set<number>();
      const sourceSnippets: string[] = [];
      let hits = 0;

      for (const record of records) {
        if (record.status !== "success" || !record.extractedText.trim()) continue;
        const text = record.extractedText;
        const lowerText = text.toLowerCase();
        const matchedAlias = rule.aliases.find((alias) => lowerText.includes(alias.toLowerCase()));
        if (!matchedAlias) continue;

        const occurrences = countOccurrences(lowerText, matchedAlias.toLowerCase());
        hits += Math.max(1, occurrences);
        detectedInFiles.add(record.sourceFileId);
        const week = fileById.get(record.sourceFileId)?.weekNumber;
        if (week) detectedInWeeks.add(week);
        const snippet = snippetAround(text, matchedAlias);
        if (snippet && sourceSnippets.length < 5) sourceSnippets.push(snippet);
      }

      const fileCount = detectedInFiles.size;
      return {
        topicId: slugify(rule.title),
        title: rule.title,
        aliases: rule.aliases,
        detectedInFiles: [...detectedInFiles].sort(),
        detectedInWeeks: [...detectedInWeeks].sort((a, b) => a - b),
        confidence: fileCount === 0 ? 0 : Math.min(0.95, 0.35 + fileCount * 0.08 + Math.min(hits, 20) * 0.015),
        sourceSnippets,
      };
    })
    .filter((topic) => topic.detectedInFiles.length > 0)
    .sort((a, b) => b.confidence - a.confidence || a.title.localeCompare(b.title));
}

function countOccurrences(text: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = text.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}

function snippetAround(text: string, term: string): string | undefined {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return undefined;
  const start = Math.max(0, index - 140);
  const end = Math.min(text.length, index + term.length + 220);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u0591-\u05c7]/g, "")
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/^-|-$/g, "");
}
