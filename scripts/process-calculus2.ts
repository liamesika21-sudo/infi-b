import fs from "node:fs/promises";
import path from "node:path";
import { detectTopicsFromExtractedRecords, extractTextFromFile } from "../src/lib/calculus2/content-parser";
import { GENERATED_DIR } from "../src/lib/calculus2/generated-data";
import { scanDocsFolder } from "../src/lib/calculus2/pipeline";
import type { ExtractedTextRecord } from "../src/lib/calculus2/types";

async function writeJson(filename: string, data: unknown): Promise<string> {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const outputPath = path.join(GENERATED_DIR, filename);
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return outputPath;
}

async function main() {
  const startedAt = Date.now();
  const inventory = await scanDocsFolder();
  const extractedRecords: ExtractedTextRecord[] = [];

  for (const file of inventory.sourceFiles) {
    process.stdout.write(`Extracting ${file.relativePath} ... `);
    const result = await extractTextFromFile(file);
    extractedRecords.push(result);
    console.log(result.status);
  }

  const topicMap = detectTopicsFromExtractedRecords(extractedRecords, inventory.sourceFiles);
  const weekMap = inventory.weeks.map((week) => ({
    ...week,
    topicCoverage: topicMap
      .filter((topic) => topic.detectedInWeeks.includes(week.weekNumber))
      .map((topic) => topic.title),
  }));
  const summary = {
    generatedAt: new Date().toISOString(),
    totalFilesScanned: inventory.sourceFiles.length,
    lecturesFound: inventory.countsByType.lecture,
    recitationsFound: inventory.countsByType.recitation,
    homeworkFilesFound: inventory.countsByType.homework,
    summariesFound: inventory.countsByType.summary,
    pastExamFilesFound:
      inventory.countsByType.past_exam +
      inventory.countsByType.formula_sheet +
      inventory.countsByType.theorem_list +
      inventory.countsByType.excluded_exam_material,
    extractionSuccesses: extractedRecords.filter((record) => record.status === "success").length,
    extractionFailures: extractedRecords.filter((record) => record.status === "failed").length,
    needsOcr: extractedRecords.filter((record) => record.status === "needs_ocr").length,
    detectedTopicsCount: topicMap.length,
    durationMs: Date.now() - startedAt,
  };

  const outputPaths = await Promise.all([
    writeJson("source-files.json", inventory.sourceFiles),
    writeJson("extracted-text-index.json", extractedRecords),
    writeJson("week-map.json", weekMap),
    writeJson("topic-map.json", topicMap),
    writeJson("processing-summary.json", summary),
    writeJson("formula-bank.json", []),
    writeJson("theorem-bank.json", []),
    writeJson("proof-pattern-bank.json", []),
    writeJson("question-bank.json", []),
    writeJson("past-exam-analysis.json", []),
    writeJson("exam-plan.json", {
      id: "exam-plan",
      targetScoreLabel: "90+",
      priorityTopicIds: [],
      mustReviewItemIds: [],
      practiceQuestionIds: [],
      dailyTasks: [],
    }),
    writeJson("mentor-knowledge-base.json", {
      status: "not_ready",
      reason: "AI analysis has not been run yet.",
    }),
  ]);

  console.log("\nCalculus 2 processing report");
  console.log("----------------------------");
  console.log(`Total files scanned: ${summary.totalFilesScanned}`);
  console.log(`Lectures found: ${summary.lecturesFound}`);
  console.log(`Recitations found: ${summary.recitationsFound}`);
  console.log(`Homework files found: ${summary.homeworkFilesFound}`);
  console.log(`Summaries found: ${summary.summariesFound}`);
  console.log(`Past exam / exam-reference files found: ${summary.pastExamFilesFound}`);
  console.log(`Extraction successes: ${summary.extractionSuccesses}`);
  console.log(`Extraction failures: ${summary.extractionFailures}`);
  console.log(`Files needing OCR: ${summary.needsOcr}`);
  console.log(`Detected topics: ${summary.detectedTopicsCount}`);
  console.log("\nGenerated output paths:");
  for (const outputPath of outputPaths) console.log(`- ${path.relative(process.cwd(), outputPath)}`);

  const ocrFiles = extractedRecords.filter((record) => record.status === "needs_ocr");
  const failedFiles = extractedRecords.filter((record) => record.status === "failed");
  if (ocrFiles.length > 0) {
    console.log("\nNeeds OCR:");
    for (const record of ocrFiles) console.log(`- ${record.filePath}: ${record.error}`);
  }
  if (failedFiles.length > 0) {
    console.log("\nFailed extraction:");
    for (const record of failedFiles) console.log(`- ${record.filePath}: ${record.error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
