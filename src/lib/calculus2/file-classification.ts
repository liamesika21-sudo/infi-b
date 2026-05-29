import path from "node:path";
import { practicedLectureForRecitation } from "./mapping";
import type { SourceFile, SourceType } from "./types";

const numberPatterns = [
  /(?:lecture|הרצאה)\s*_?-?\s*(\d{1,2})/i,
  /(?:recitation|tutorial|תרגול)\s*_?-?\s*(\d{1,2})/i,
  /(?:exercise|homework|hw|מטלה|שיעורי\s*בית)\s*_?-?\s*(\d{1,2})/i,
  /week\s*_?-?\s*(\d{1,2})/i,
  /שבוע\s*_?-?\s*(\d{1,2})/i,
];

function firstNumber(input: string): number | undefined {
  for (const pattern of numberPatterns) {
    const match = input.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  const loose = input.match(/(?:^|[^\d])(\d{1,2})(?:[^\d]|$)/);
  return loose?.[1] ? Number(loose[1]) : undefined;
}

function examYear(input: string): number | undefined {
  const match = input.match(/20\d{2}/);
  return match ? Number(match[0]) : undefined;
}

function sourceTypeFromPath(relativePath: string, filename: string): SourceType {
  const normalized = `${relativePath} ${filename}`.toLowerCase();
  if (/formula|נוסח/.test(normalized)) return "formula_sheet";
  if (/theorem|משפט/.test(normalized)) return "theorem_list";
  if (/summary|summar|summerize|סיכום/.test(normalized)) return "summary";
  if (/not in|excluded|not.*material|לא.*חומר|marerial/.test(normalized)) return "excluded_exam_material";
  if (/past-exams|moed|מועד|exam|בחינה|simulation|סימולציה/.test(normalized)) return "past_exam";
  if (/lecture|הרצאה/.test(normalized)) return "lecture";
  if (/recitation|tutorial|תרגול/.test(normalized)) return "recitation";
  if (/homework|exercise|hw|מטלה|שיעורי/.test(normalized)) return "homework";
  return "unknown";
}

function moedFromName(input: string): SourceFile["moed"] {
  const normalized = input.toLowerCase();
  if (/simulation|סימולציה/.test(normalized)) return "simulation";
  if (/moed\s*a|moeda|מועד\s*א|_a\b|[^a-z]a[^a-z]/.test(normalized)) return "a";
  if (/moed\s*b|moedb|מועד\s*ב|_b\b|[^a-z]b[^a-z]/.test(normalized)) return "b";
  return "unknown";
}

function labelsFor(type: SourceType): string[] {
  switch (type) {
    case "lecture":
      return ["lecture", "week-aligned"];
    case "recitation":
      return ["recitation", "offset-practice"];
    case "homework":
      return ["homework", "week-aligned"];
    case "past_exam":
      return ["past-exam", "exam-strategy"];
    case "formula_sheet":
      return ["formula-sheet", "exam-reference"];
    case "theorem_list":
      return ["theorem-list", "memorization"];
    case "summary":
      return ["summary", "study-material"];
    case "excluded_exam_material":
      return ["excluded-material", "scope-warning"];
    default:
      return ["unknown"];
  }
}

export function classifySourceFile(relativePath: string, absolutePath: string): SourceFile {
  const filename = path.basename(relativePath);
  const extension = path.extname(filename).toLowerCase();
  const sourceType = sourceTypeFromPath(relativePath, filename);
  const detectedNumber = firstNumber(filename);
  const id = relativePath
    .replace(/^docs\//, "")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/^-|-$/g, "");

  const sourceFile: SourceFile = {
    id,
    filename,
    relativePath,
    absolutePath,
    extension,
    sourceType,
    status: "classified",
    detectedLabels: labelsFor(sourceType),
    classificationConfidence: sourceType === "unknown" ? 0.2 : 0.85,
    warnings: [],
  };

  if (sourceType === "lecture" && detectedNumber) {
    sourceFile.lectureNumber = detectedNumber;
    sourceFile.weekNumber = detectedNumber;
  }

  if (sourceType === "recitation" && detectedNumber) {
    sourceFile.recitationNumber = detectedNumber;
    sourceFile.weekNumber = detectedNumber;
    sourceFile.practicedLectureNumber = practicedLectureForRecitation(detectedNumber);
    if (sourceFile.practicedLectureNumber === null) {
      sourceFile.warnings.push("Recitation 1 has no automatic previous lecture mapping.");
    }
  }

  if (sourceType === "homework" && detectedNumber) {
    sourceFile.homeworkNumber = detectedNumber;
    sourceFile.weekNumber = detectedNumber;
  }

  if (sourceType === "summary" && detectedNumber) {
    sourceFile.weekNumber = detectedNumber;
  }

  if (sourceType === "past_exam") {
    sourceFile.examYear = examYear(filename);
    sourceFile.moed = moedFromName(filename);
  }

  if (sourceType === "unknown") {
    sourceFile.warnings.push("Filename heuristics could not classify this file.");
  }

  return sourceFile;
}
