import fs from "node:fs/promises";
import path from "node:path";
import { calculus2Course } from "./config";
import { extractTextFromFile } from "./content-parser";
import { classifySourceFile } from "./file-classification";
import { buildWeekMap } from "./mapping";
import type {
  AgentOutput,
  Formula,
  MaterialInventory,
  ProgressItem,
  ProofPattern,
  Question,
  SourceFile,
  Theorem,
  Topic,
} from "./types";

const DOCS_ROOT = path.join(process.cwd(), "docs");
const SUPPORTED_TEXT_EXTENSIONS = new Set([".md", ".txt"]);

async function walkFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) return walkFiles(fullPath);
      if (entry.isFile()) return [fullPath];
      return [];
    }),
  );
  return files.flat();
}

function isSupportedSourcePath(relativePath: string): boolean {
  const extension = path.extname(relativePath).toLowerCase();
  if (extension === ".pdf") return true;
  if (!SUPPORTED_TEXT_EXTENSIONS.has(extension)) return false;

  const normalized = relativePath.toLowerCase();
  if (!normalized.includes("docs/recitation/script/")) return false;

  // Keep the high-quality updated transcripts without importing every old script duplicate.
  return /(?:recitation|תרגול)[_\s-]*(?:9|10)/i.test(relativePath);
}

function isCleanRecitationTranscript(file: SourceFile): boolean {
  return (
    file.sourceType === "recitation" &&
    SUPPORTED_TEXT_EXTENSIONS.has(file.extension) &&
    file.relativePath.includes("docs/recitation/script/")
  );
}

export async function scanDocsFolder(rootDir = DOCS_ROOT): Promise<MaterialInventory> {
  const absoluteRoot = path.resolve(rootDir);
  const discovered = await walkFiles(absoluteRoot);
  const classifiedSourceFiles = discovered
    .filter((file) => !path.basename(file).startsWith("."))
    .filter((file) => isSupportedSourcePath(path.relative(process.cwd(), file)))
    .map((absolutePath) => {
      const relativePath = path.relative(process.cwd(), absolutePath);
      return classifySourceFile(relativePath, absolutePath);
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const transcriptRecitationNumbers = new Set(
    classifiedSourceFiles
      .filter(isCleanRecitationTranscript)
      .map((file) => file.recitationNumber)
      .filter((number): number is number => typeof number === "number"),
  );
  const sourceFiles = classifiedSourceFiles.filter(
    (file) =>
      !(
        file.sourceType === "recitation" &&
        file.extension === ".pdf" &&
        file.recitationNumber &&
        transcriptRecitationNumbers.has(file.recitationNumber)
      ),
  );

  const weeks = buildWeekMap(calculus2Course.totalWeeks, sourceFiles);
  const countsByType = sourceFiles.reduce<MaterialInventory["countsByType"]>(
    (counts, file) => {
      counts[file.sourceType] += 1;
      return counts;
    },
    {
      lecture: 0,
      recitation: 0,
      homework: 0,
      summary: 0,
      past_exam: 0,
      formula_sheet: 0,
      theorem_list: 0,
      excluded_exam_material: 0,
      unknown: 0,
    },
  );

  const warnings = sourceFiles.flatMap((file) => file.warnings.map((warning) => `${file.filename}: ${warning}`));
  for (const week of weeks) {
    if (week.weekNumber <= calculus2Course.availableWeeks && week.materialStatus.recitation === "missing") {
      warnings.push(`Week ${week.weekNumber}: recitation file is missing from docs.`);
    }
  }

  return { sourceFiles, weeks, countsByType, warnings };
}

export { classifySourceFile, extractTextFromFile };

export async function runLectureAnalysis(file: SourceFile): Promise<AgentOutput> {
  return agentNotRun("lecture-analysis", [file.id], "Text extraction and LLM adapter are not connected yet.");
}

export async function runRecitationAnalysis(file: SourceFile): Promise<AgentOutput> {
  return agentNotRun("recitation-analysis", [file.id], "Text extraction and LLM adapter are not connected yet.");
}

export async function runHomeworkAnalysis(file: SourceFile): Promise<AgentOutput> {
  return agentNotRun("homework-analysis", [file.id], "Text extraction and LLM adapter are not connected yet.");
}

export async function runSummaryIntegration(file: SourceFile): Promise<AgentOutput> {
  return agentNotRun("summary-integration", [file.id], "Text extraction and LLM adapter are not connected yet.");
}

export async function runPastExamAnalysis(file: SourceFile): Promise<AgentOutput> {
  return agentNotRun("past-exam-analysis", [file.id], "Text extraction and LLM adapter are not connected yet.");
}

export async function buildTopicMap(): Promise<Topic[]> {
  return [];
}

export async function buildFormulaBank(): Promise<Formula[]> {
  return [];
}

export async function buildTheoremBank(): Promise<Theorem[]> {
  return [];
}

export async function buildProofPatternBank(): Promise<ProofPattern[]> {
  return [];
}

export async function buildQuestionBank(): Promise<Question[]> {
  return [];
}

export async function buildExamPlan() {
  return {
    id: "exam-plan-initial",
    targetScoreLabel: "90+" as const,
    priorityTopicIds: [],
    mustReviewItemIds: [],
    practiceQuestionIds: [],
    dailyTasks: [],
  };
}

export async function buildMentorKnowledgeBase() {
  return {
    status: "not_ready" as const,
    reason: "Knowledge base requires extracted text and analyzed topic/exam maps.",
    sourcePriority: ["course summaries", "lectures", "recitations", "homework", "past exams"],
  };
}

export async function initializeProgressTracking(): Promise<ProgressItem[]> {
  return [];
}

function agentNotRun(agentId: string, sourceFileIds: string[], warning: string): AgentOutput {
  const now = new Date().toISOString();
  return {
    id: `${agentId}-${now}`,
    agentId,
    status: "not_run",
    sourceFileIds,
    validationErrors: [],
    warnings: [warning],
    createdAt: now,
    updatedAt: now,
  };
}
