import fs from "node:fs/promises";
import path from "node:path";
import type { CourseWeek, DetectedTopic, ExtractedTextRecord, SourceFile } from "./types";

export const GENERATED_DIR = path.join(process.cwd(), "data", "generated", "calculus2");

export interface ProcessingSummary {
  generatedAt: string;
  totalFilesScanned: number;
  extractionSuccesses: number;
  extractionFailures: number;
  needsOcr: number;
  detectedTopicsCount: number;
}

export interface GeneratedDataSnapshot {
  hasGeneratedData: boolean;
  sourceFiles: SourceFile[];
  extractedTextIndex: ExtractedTextRecord[];
  weekMap: CourseWeek[];
  topicMap: DetectedTopic[];
  processingSummary?: ProcessingSummary;
}

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(GENERATED_DIR, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function readGeneratedData(): Promise<GeneratedDataSnapshot> {
  const [sourceFiles, extractedTextIndex, weekMap, topicMap, processingSummary] = await Promise.all([
    readJson<SourceFile[]>("source-files.json", []),
    readJson<ExtractedTextRecord[]>("extracted-text-index.json", []),
    readJson<CourseWeek[]>("week-map.json", []),
    readJson<DetectedTopic[]>("topic-map.json", []),
    readJson<ProcessingSummary | undefined>("processing-summary.json", undefined),
  ]);

  return {
    hasGeneratedData: sourceFiles.length > 0 || extractedTextIndex.length > 0 || weekMap.length > 0,
    sourceFiles,
    extractedTextIndex,
    weekMap,
    topicMap,
    processingSummary,
  };
}

