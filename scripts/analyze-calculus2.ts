import fs from "node:fs/promises";
import path from "node:path";
import { calculus2Course } from "../src/lib/calculus2/config";
import { GENERATED_DIR } from "../src/lib/calculus2/generated-data";
import type {
  ExamPlanV1,
  ExamPriorityMap,
  FormulaItem,
  HomeworkAnalysis,
  LectureAnalysis,
  MentorKnowledgeBase,
  PastExamAggregate,
  PastExamAnalysis,
  ProofPatternItem,
  QuestionItem,
  RecitationAnalysis,
  SourceSnippet,
  SummaryAnalysis,
  TheoremItem,
  TheoryItem,
} from "../src/lib/calculus2/analysis-types";
import type { CourseWeek, DetectedTopic, ExtractedTextRecord, SourceFile } from "../src/lib/calculus2/types";

const MARKERS = {
  definition: ["הגדרה", "Definition"],
  theorem: ["משפט", "Theorem", "טענה", "Proposition", "למה", "Lemma", "מסקנה", "Corollary"],
  proof: ["הוכחה", "Proof", "נוכיח", "נראה כי", "show that", "prove"],
  example: ["דוגמה", "Example"],
  remark: ["הערה", "Remark", "שימו לב", "Note"],
  formula: ["נוסחה", "formula", "lim", "∑", "∫", "π", "√", "∞"],
  exam: ["exam", "Moed", "מועד", "בחינה", "points", "נקודות"],
  mistake: ["טעות", "mistake", "לא נכון", "אסור", "careful", "שימו לב"],
};

type Loaded = {
  sourceFiles: SourceFile[];
  extracted: ExtractedTextRecord[];
  weekMap: CourseWeek[];
  topicMap: DetectedTopic[];
};

async function readJson<T>(filename: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(GENERATED_DIR, filename), "utf8")) as T;
}

async function writeJson(filename: string, data: unknown): Promise<string> {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const outputPath = path.join(GENERATED_DIR, filename);
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return outputPath;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").replace(/[\u0000-\u001f]/g, " ").trim();
}

function splitText(text: string): string[] {
  return text
    .split(/\n{2,}|--\s*\d+\s+of\s+\d+\s*--/i)
    .map(clean)
    .filter((block) => block.length >= 40);
}

function sourceSnippet(record: ExtractedTextRecord, text: string): SourceSnippet {
  const index = record.extractedText.indexOf(text.slice(0, Math.min(30, text.length)));
  return {
    sourceFileId: record.sourceFileId,
    filename: record.filename,
    text: text.slice(0, 900),
    startOffset: index >= 0 ? index : undefined,
    endOffset: index >= 0 ? index + text.length : undefined,
  };
}

function includesAny(text: string, markers: string[]): boolean {
  const lower = text.toLowerCase();
  return markers.some((marker) => lower.includes(marker.toLowerCase()));
}

function topicsForFile(record: ExtractedTextRecord, topicMap: DetectedTopic[]): string[] {
  return topicMap
    .filter((topic) => topic.detectedInFiles.includes(record.sourceFileId))
    .map((topic) => topic.topicId);
}

function topicTitlesForFile(record: ExtractedTextRecord, topicMap: DetectedTopic[]): string[] {
  return topicMap
    .filter((topic) => topic.detectedInFiles.includes(record.sourceFileId))
    .map((topic) => topic.title);
}

function confidenceFrom(record: ExtractedTextRecord, itemCount: number): number {
  if (record.status === "needs_ocr") return 0.1;
  if (record.status === "failed") return 0.05;
  return Math.min(0.9, 0.35 + Math.min(record.extractedText.length / 12000, 0.35) + Math.min(itemCount * 0.04, 0.2));
}

function extractDefinitions(record: ExtractedTextRecord, topicIds: string[], prefix: string): TheoryItem[] {
  return splitText(record.extractedText)
    .filter((block) => includesAny(block, MARKERS.definition))
    .slice(0, 18)
    .map((block, index) => ({
      id: `${prefix}-definition-${index + 1}`,
      title: titleFromBlock(block, "הגדרה"),
      kind: "definition",
      content: block.slice(0, 1200),
      topicIds,
      sourceSnippets: [sourceSnippet(record, block)],
      confidence: 0.72,
    }));
}

function extractTheorems(record: ExtractedTextRecord, topicIds: string[], prefix: string): TheoremItem[] {
  return splitText(record.extractedText)
    .filter((block) => includesAny(block, MARKERS.theorem))
    .slice(0, 24)
    .map((block, index) => ({
      id: `${prefix}-theorem-${index + 1}`,
      title: titleFromBlock(block, "משפט"),
      statement: block.slice(0, 1500),
      topicIds,
      sourceFileIds: [record.sourceFileId],
      sourceSnippets: [sourceSnippet(record, block)],
      proofRequired: includesAny(block, MARKERS.proof),
      examImportance: includesAny(block, MARKERS.exam) ? "high" : "medium",
      confidence: 0.68,
    }));
}

function extractFormulas(record: ExtractedTextRecord, topicIds: string[], prefix: string): FormulaItem[] {
  const lines = record.extractedText
    .split("\n")
    .map(clean)
    .filter((line) => line.length >= 8 && line.length <= 260);
  const formulaLines = lines.filter((line) => /[∑∫√∞π]|\\sum|\\int|lim|sin|cos|ln|𝑥|𝑛|𝑎|𝑓|≤|≥|=/.test(line)).slice(0, 60);

  return formulaLines.map((line, index) => ({
    id: `${prefix}-formula-${index + 1}`,
    title: `נוסחה/ביטוי ${index + 1}`,
    plainText: line,
    topicIds,
    sourceFileIds: [record.sourceFileId],
    sourceSnippets: [sourceSnippet(record, line)],
    examImportance: includesAny(line, MARKERS.exam) ? "high" : "medium",
    confidence: /[∑∫√∞π]|lim|=/.test(line) ? 0.58 : 0.38,
  }));
}

function extractProofPatterns(record: ExtractedTextRecord, topicIds: string[], prefix: string): ProofPatternItem[] {
  const blocks = splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.proof)).slice(0, 18);
  return blocks.map((block, index) => ({
    id: `${prefix}-proof-pattern-${index + 1}`,
    title: titleFromBlock(block, "תבנית הוכחה"),
    patternType: detectPatternType(block),
    steps: inferProofSteps(block),
    topicIds,
    sourceFileIds: [record.sourceFileId],
    relatedQuestionIds: [],
    commonMistakes: includesAny(block, MARKERS.mistake) ? [block.slice(0, 220)] : [],
    examImportance: includesAny(block, MARKERS.exam) ? "high" : "medium",
    confidence: 0.52,
  }));
}

function extractExamples(record: ExtractedTextRecord, topicIds: string[], prefix: string): QuestionItem[] {
  return splitText(record.extractedText)
    .filter((block) => includesAny(block, MARKERS.example) || /^Example\s+\d+/i.test(block))
    .slice(0, 18)
    .map((block, index) => ({
      id: `${prefix}-example-question-${index + 1}`,
      sourceType: "lecture_example",
      sourceFileId: record.sourceFileId,
      questionNumber: String(index + 1),
      content: block.slice(0, 1600),
      topicIds,
      difficulty: estimateQuestionDifficulty(block),
      examRelevance: "medium",
      sourceSnippet: sourceSnippet(record, block),
      confidence: 0.55,
    }));
}

function extractQuestions(record: ExtractedTextRecord, sourceType: QuestionItem["sourceType"], topicIds: string[], prefix: string): QuestionItem[] {
  const blocks = splitText(record.extractedText);
  const candidates = blocks.filter((block) =>
    /(^|\s)(\d+\.|\(\w\)|[א-ת]\)|Question|Exercise|Compute|Prove|Determine|הוכח|חשבו|מצא|קבע)/i.test(block),
  );
  return candidates.slice(0, 40).map((block, index) => ({
    id: `${prefix}-question-${index + 1}`,
    sourceType,
    sourceFileId: record.sourceFileId,
    questionNumber: inferQuestionNumber(block) ?? String(index + 1),
    content: block.slice(0, 1800),
    topicIds,
    difficulty: estimateQuestionDifficulty(block),
    examRelevance: sourceType === "past_exam" ? "high" : sourceType === "homework" ? "medium" : "medium",
    sourceSnippet: sourceSnippet(record, block),
    confidence: 0.56,
  }));
}

function titleFromBlock(block: string, fallback: string): string {
  const first = block.split(/[.!?\n]/)[0]?.trim() ?? fallback;
  return first.length > 90 ? `${first.slice(0, 87)}...` : first || fallback;
}

function inferQuestionNumber(block: string): string | undefined {
  return block.match(/(?:Question|Exercise)?\s*(\d+(?:\.\d+)?|\([a-z]\)|\([א-ת]\))/i)?.[1];
}

function estimateQuestionDifficulty(block: string): QuestionItem["difficulty"] {
  const lower = block.toLowerCase();
  const hardSignals = ["prove", "הוכח", "if and only if", "uniform", "absolutely", "improper", "taylor"];
  const mediumSignals = ["determine", "compute", "converge", "מתכנס", "חשב", "מצא"];
  if (hardSignals.some((signal) => lower.includes(signal))) return "hard";
  if (mediumSignals.some((signal) => lower.includes(signal))) return "medium";
  return "unknown";
}

function detectPatternType(block: string): string {
  const lower = block.toLowerCase();
  if (lower.includes("comparison") || lower.includes("השווא")) return "comparison";
  if (lower.includes("induction") || lower.includes("אינדוק")) return "induction";
  if (lower.includes("limit") || lower.includes("גבול")) return "limit";
  if (lower.includes("taylor")) return "taylor-expansion";
  if (lower.includes("definition") || lower.includes("הגדרה")) return "definition-unfolding";
  return "proof-from-markers";
}

function inferProofSteps(block: string): string[] {
  const steps = ["Identify the relevant assumptions from the source statement."];
  if (/definition|הגדרה/i.test(block)) steps.push("Unfold the formal definition.");
  if (/comparison|השווא/i.test(block)) steps.push("Compare to a known convergent/divergent object.");
  if (/limit|גבול|lim/i.test(block)) steps.push("Reduce the claim to a limit statement.");
  if (/there exists|קיים|∃/i.test(block)) steps.push("Construct or justify the required existence statement.");
  steps.push("Close the argument using the cited theorem or criterion.");
  return steps;
}

function techniqueHints(text: string): string[] {
  const hints: Array<[string, string[]]> = [
    ["מבחן המנה", ["ratio test", "מבחן המנה"]],
    ["מבחן השורש", ["root test", "מבחן השורש"]],
    ["מבחן ההשוואה", ["comparison", "השווא"]],
    ["אינטגרל לא אמיתי", ["improper integral", "אינטגרל לא אמיתי"]],
    ["טיילור", ["taylor", "טיילור"]],
    ["גבול", ["limit", "lim", "גבול"]],
    ["התכנסות בהחלט", ["absolute convergence", "בהחלט"]],
  ];
  const lower = text.toLowerCase();
  return hints.filter(([, aliases]) => aliases.some((alias) => lower.includes(alias.toLowerCase()))).map(([title]) => title);
}

function topSnippets(record: ExtractedTextRecord): SourceSnippet[] {
  return splitText(record.extractedText)
    .slice(0, 4)
    .map((block) => sourceSnippet(record, block));
}

function analyzeLecture(file: SourceFile, record: ExtractedTextRecord, topicMap: DetectedTopic[]): LectureAnalysis {
  const topicIds = topicsForFile(record, topicMap);
  const definitions = extractDefinitions(record, topicIds, file.id);
  const theorems = extractTheorems(record, topicIds, file.id);
  const formulas = extractFormulas(record, topicIds, file.id);
  const proofPatterns = extractProofPatterns(record, topicIds, file.id);
  const examples = extractExamples(record, topicIds, file.id).map((q, index) => ({
    id: `${file.id}-example-${index + 1}`,
    content: q.content,
    topicIds: q.topicIds,
    sourceSnippet: q.sourceSnippet,
    confidence: q.confidence,
  }));
  const remarks = splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.remark)).slice(0, 8);
  return {
    lectureNumber: file.lectureNumber ?? file.weekNumber ?? 0,
    weekNumber: file.weekNumber ?? file.lectureNumber ?? 0,
    sourceFileId: file.id,
    filename: file.filename,
    extractionStatus: record.status,
    title: file.filename.replace(/\.pdf$/i, ""),
    detectedTopics: topicTitlesForFile(record, topicMap),
    definitions,
    theorems,
    formulas,
    proofPatterns,
    examples,
    remarks,
    importantForExam: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.exam)).slice(0, 8),
    sourceSnippets: topSnippets(record),
    confidence: confidenceFrom(record, definitions.length + theorems.length + formulas.length + proofPatterns.length),
  };
}

function analyzeRecitation(
  file: SourceFile,
  record: ExtractedTextRecord,
  topicMap: DetectedTopic[],
  lectureByNumber: Map<number, LectureAnalysis>,
): RecitationAnalysis {
  const topicIds = topicsForFile(record, topicMap);
  const questions = extractQuestions(record, "recitation", topicIds, file.id);
  const practicedLectureNumber = file.practicedLectureNumber ?? null;
  const linkedLecture = practicedLectureNumber ? lectureByNumber.get(practicedLectureNumber) : undefined;
  const practicedTopics = topicTitlesForFile(record, topicMap);
  const overlap = linkedLecture ? practicedTopics.filter((topic) => linkedLecture.detectedTopics.includes(topic)) : [];
  const mappingNeedsReview = Boolean(linkedLecture && practicedTopics.length > 0 && overlap.length === 0);
  return {
    recitationNumber: file.recitationNumber ?? file.weekNumber ?? 0,
    weekNumber: file.weekNumber ?? file.recitationNumber ?? 0,
    practicedLectureNumber,
    sourceFileId: file.id,
    filename: file.filename,
    practicedTopics,
    questions,
    solutionPatterns: extractProofPatterns(record, topicIds, file.id),
    techniques: techniqueHints(record.extractedText),
    commonMistakes: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.mistake)).slice(0, 8),
    linkedLectureNumber: practicedLectureNumber,
    topicOverlapWithLinkedLecture: overlap,
    mappingNeedsReview,
    examRelevanceNotes: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.exam)).slice(0, 6),
    sourceSnippets: topSnippets(record),
    confidence: confidenceFrom(record, questions.length),
  };
}

function analyzeHomework(file: SourceFile, record: ExtractedTextRecord, topicMap: DetectedTopic[]): HomeworkAnalysis {
  const topicIds = topicsForFile(record, topicMap);
  const questions = extractQuestions(record, "homework", topicIds, file.id);
  const techniques = techniqueHints(record.extractedText);
  return {
    homeworkNumber: file.homeworkNumber ?? file.weekNumber ?? 0,
    weekNumber: file.weekNumber ?? file.homeworkNumber ?? 0,
    sourceFileId: file.id,
    filename: file.filename,
    topics: topicTitlesForFile(record, topicMap),
    questions,
    requiredTheorems: extractTheorems(record, topicIds, file.id).map((item) => item.title),
    requiredFormulas: extractFormulas(record, topicIds, file.id).slice(0, 12).map((item) => item.plainText ?? item.title),
    requiredTechniques: techniques,
    examSimilarityHints: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.exam)).slice(0, 8),
    mustReviewBeforeExam: questions.length >= 4 || techniques.length >= 2,
    difficultyEstimate: questions.some((q) => q.difficulty === "hard") ? "mixed" : "medium",
    sourceSnippets: topSnippets(record),
    confidence: confidenceFrom(record, questions.length),
  };
}

function analyzeSummary(file: SourceFile, record: ExtractedTextRecord, topicMap: DetectedTopic[]): SummaryAnalysis {
  const topicIds = topicsForFile(record, topicMap);
  return {
    sourceFileId: file.id,
    filename: file.filename,
    relatedWeeks: file.weekNumber ? [file.weekNumber] : [],
    detectedTopics: topicTitlesForFile(record, topicMap),
    definitions: extractDefinitions(record, topicIds, file.id),
    theorems: extractTheorems(record, topicIds, file.id),
    formulas: extractFormulas(record, topicIds, file.id).slice(0, 30),
    condensedExplanations: splitText(record.extractedText).filter((block) => block.length > 120 && !includesAny(block, MARKERS.proof)).slice(0, 12),
    examTips: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.exam)).slice(0, 8),
    commonMistakes: splitText(record.extractedText).filter((block) => includesAny(block, MARKERS.mistake)).slice(0, 8),
    sourceSnippets: topSnippets(record),
    confidence: confidenceFrom(record, topicIds.length),
  };
}

function analyzePastExam(file: SourceFile, record: ExtractedTextRecord, topicMap: DetectedTopic[]): PastExamAnalysis {
  const topicIds = topicsForFile(record, topicMap);
  const questions = extractQuestions(record, "past_exam", topicIds, file.id);
  return {
    sourceFileId: file.id,
    filename: file.filename,
    examYear: file.examYear,
    moed: file.moed === "a" ? "A" : file.moed === "b" ? "B" : "unknown",
    questions,
    detectedTopics: topicTitlesForFile(record, topicMap),
    repeatedPatterns: techniqueHints(record.extractedText),
    requiredTheorems: extractTheorems(record, topicIds, file.id).map((item) => item.title),
    requiredFormulas: extractFormulas(record, topicIds, file.id).slice(0, 15).map((item) => item.plainText ?? item.title),
    proofPatterns: extractProofPatterns(record, topicIds, file.id).map((item) => item.patternType),
    difficultyEstimate: questions.some((q) => q.difficulty === "hard") ? "mixed" : "medium",
    sourceSnippets: topSnippets(record),
    confidence: confidenceFrom(record, questions.length),
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return [...map.values()];
}

function aggregatePastExams(pastExams: PastExamAnalysis[], topicMap: DetectedTopic[]): PastExamAggregate {
  const frequency = new Map<string, { topicId: string; title: string; count: number; files: Set<string> }>();
  for (const exam of pastExams) {
    for (const title of exam.detectedTopics) {
      const topic = topicMap.find((candidate) => candidate.title === title);
      if (!topic) continue;
      const current = frequency.get(topic.topicId) ?? { topicId: topic.topicId, title: topic.title, count: 0, files: new Set<string>() };
      current.count += 1;
      current.files.add(exam.sourceFileId);
      frequency.set(topic.topicId, current);
    }
  }
  const topicFrequency = [...frequency.values()]
    .map((item) => ({ ...item, files: [...item.files].sort() }))
    .sort((a, b) => b.count - a.count);
  return {
    topicFrequency,
    theoremFrequency: [],
    formulaFrequency: [],
    proofPatternFrequency: [],
    highPriorityTopics: topicFrequency.slice(0, 6).map((item) => item.topicId),
    mustPracticeQuestions: pastExams.flatMap((exam) => exam.questions.slice(0, 3).map((q) => q.id)),
    likelyMoedATopics: topicFrequency.slice(0, 8).map((item) => item.title),
    dangerZones: topicFrequency.filter((item) => item.count >= 3).map((item) => item.title),
  };
}

function buildExamPriorityMap(
  topicMap: DetectedTopic[],
  lectureAnalysis: LectureAnalysis[],
  recitationAnalysis: RecitationAnalysis[],
  homeworkAnalysis: HomeworkAnalysis[],
  pastExamAggregate: PastExamAggregate,
): ExamPriorityMap {
  const examFreq = new Map(pastExamAggregate.topicFrequency.map((item) => [item.topicId, item.count]));
  return {
    generatedAt: new Date().toISOString(),
    topics: topicMap
      .map((topic) => {
        const appearedInPastExams = examFreq.get(topic.topicId) ?? 0;
        const appearedInHomework = homeworkAnalysis.filter((item) => item.topics.includes(topic.title)).length;
        const appearedInRecitations = recitationAnalysis.filter((item) => item.practicedTopics.includes(topic.title)).length;
        const appearedInLectures = lectureAnalysis.filter((item) => item.detectedTopics.includes(topic.title)).length;
        const priorityScore = Math.min(
          100,
          appearedInPastExams * 12 + appearedInHomework * 7 + appearedInRecitations * 5 + appearedInLectures * 4 + Math.round(topic.confidence * 15),
        );
        const priorityLevel: ExamPriorityMap["topics"][number]["priorityLevel"] =
          priorityScore >= 75 ? "critical" : priorityScore >= 55 ? "high" : priorityScore >= 30 ? "medium" : "low";
        const reasons = [
          appearedInPastExams ? `הופיע בקבצי מבחן ${appearedInPastExams} פעמים` : "",
          appearedInHomework ? `מופיע במטלות ${appearedInHomework} פעמים` : "",
          appearedInRecitations ? `מודגש בתרגולים ${appearedInRecitations} פעמים` : "",
          appearedInLectures ? `נלמד בהרצאות ${appearedInLectures} פעמים` : "",
        ].filter(Boolean);
        return {
          topicId: topic.topicId,
          title: topic.title,
          priorityScore,
          priorityLevel,
          reasons,
          appearedInPastExams,
          appearedInHomework,
          appearedInRecitations,
          appearedInLectures,
          recommendedAction:
            priorityLevel === "critical"
              ? "לפתור שאלות מבחן ומטלות בנושא לפני כל נושא אחר."
              : priorityLevel === "high"
                ? "לחזור על משפטים ונוסחאות ואז לתרגל."
                : "להשאיר לחזרה מסודרת אחרי הנושאים הקריטיים.",
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore),
  };
}

function buildExamPlan(
  priorityMap: ExamPriorityMap,
  formulaBank: FormulaItem[],
  theoremBank: TheoremItem[],
  proofPatternBank: ProofPatternItem[],
  extracted: ExtractedTextRecord[],
): ExamPlanV1 {
  const critical = priorityMap.topics.filter((topic) => topic.priorityLevel === "critical");
  const high = priorityMap.topics.filter((topic) => topic.priorityLevel === "high");
  return {
    generatedAt: new Date().toISOString(),
    learnFirst: critical.slice(0, 5).map((topic) => topic.title),
    reviewDaily: [...critical.slice(0, 3).map((topic) => topic.title), ...theoremBank.slice(0, 3).map((item) => item.title)],
    memorize: [...formulaBank.slice(0, 8).map((item) => item.title), ...theoremBank.filter((item) => item.proofRequired).slice(0, 5).map((item) => item.title)],
    solvePractice: [...critical, ...high].slice(0, 8).map((topic) => topic.title),
    proofPractice: proofPatternBank.slice(0, 8).map((item) => item.title),
    leaveForLater: priorityMap.topics.filter((topic) => topic.priorityLevel === "low").slice(0, 8).map((topic) => topic.title),
    cannotSkip: critical.map((topic) => topic.title),
    blockedByOcrOrMissingData: extracted.filter((record) => record.status !== "success").map((record) => `${record.filename}: ${record.status}`),
    sourceBasis: ["extracted-text-index.json", "topic-map.json", "lecture-analysis.json", "past-exam-analysis.json", "exam-priority-map.json"],
  };
}

async function main() {
  const loaded: Loaded = {
    sourceFiles: await readJson<SourceFile[]>("source-files.json"),
    extracted: await readJson<ExtractedTextRecord[]>("extracted-text-index.json"),
    weekMap: await readJson<CourseWeek[]>("week-map.json"),
    topicMap: await readJson<DetectedTopic[]>("topic-map.json"),
  };
  const recordsByFileId = new Map(loaded.extracted.map((record) => [record.sourceFileId, record]));
  const filesByType = (type: SourceFile["sourceType"]) => loaded.sourceFiles.filter((file) => file.sourceType === type);

  const lectureAnalysis = filesByType("lecture").map((file) => analyzeLecture(file, recordsByFileId.get(file.id)!, loaded.topicMap));
  const lectureByNumber = new Map(lectureAnalysis.map((lecture) => [lecture.lectureNumber, lecture]));
  const recitationAnalysis = filesByType("recitation").map((file) =>
    analyzeRecitation(file, recordsByFileId.get(file.id)!, loaded.topicMap, lectureByNumber),
  );
  const homeworkAnalysis = filesByType("homework").map((file) => analyzeHomework(file, recordsByFileId.get(file.id)!, loaded.topicMap));
  const summaryAnalysis = filesByType("summary").map((file) => analyzeSummary(file, recordsByFileId.get(file.id)!, loaded.topicMap));
  const pastExamFiles = loaded.sourceFiles.filter((file) =>
    ["past_exam", "formula_sheet", "theorem_list", "excluded_exam_material"].includes(file.sourceType),
  );
  const pastExamAnalysis = pastExamFiles.map((file) => analyzePastExam(file, recordsByFileId.get(file.id)!, loaded.topicMap));

  const formulaBank = uniqueById([
    ...lectureAnalysis.flatMap((item) => item.formulas),
    ...summaryAnalysis.flatMap((item) => item.formulas),
    ...pastExamAnalysis.flatMap((exam) =>
      exam.requiredFormulas.map((formula, index) => ({
        id: `${exam.sourceFileId}-exam-formula-${index + 1}`,
        title: `ביטוי מבחן ${index + 1}`,
        plainText: formula,
        topicIds: loaded.topicMap.filter((topic) => exam.detectedTopics.includes(topic.title)).map((topic) => topic.topicId),
        sourceFileIds: [exam.sourceFileId],
        sourceSnippets: exam.sourceSnippets.slice(0, 1),
        examImportance: "high" as const,
        confidence: 0.45,
      })),
    ),
  ]).filter((item) => item.confidence >= 0.35);
  const theoremBank = uniqueById([
    ...lectureAnalysis.flatMap((item) => item.theorems),
    ...summaryAnalysis.flatMap((item) => item.theorems),
  ]);
  const proofPatternBank = uniqueById([
    ...lectureAnalysis.flatMap((item) => item.proofPatterns),
    ...recitationAnalysis.flatMap((item) => item.solutionPatterns),
  ]);
  const questionBank = uniqueById([
    ...lectureAnalysis.flatMap((item) =>
      item.examples.map<QuestionItem>((example) => ({
        id: example.id,
        sourceType: "lecture_example",
        sourceFileId: example.sourceSnippet.sourceFileId,
        content: example.content,
        topicIds: example.topicIds,
        difficulty: "unknown",
        examRelevance: "medium",
        sourceSnippet: example.sourceSnippet,
        confidence: example.confidence,
      })),
    ),
    ...recitationAnalysis.flatMap((item) => item.questions),
    ...homeworkAnalysis.flatMap((item) => item.questions),
    ...pastExamAnalysis.flatMap((item) => item.questions),
  ]);
  const pastExamAggregate = aggregatePastExams(pastExamAnalysis, loaded.topicMap);
  const examPriorityMap = buildExamPriorityMap(loaded.topicMap, lectureAnalysis, recitationAnalysis, homeworkAnalysis, pastExamAggregate);
  const examPlan = buildExamPlan(examPriorityMap, formulaBank, theoremBank, proofPatternBank, loaded.extracted);
  const mentorKnowledgeBase: MentorKnowledgeBase = {
    generatedAt: new Date().toISOString(),
    courseIdentity: { courseId: "calculus2", nameHe: calculus2Course.nameHe, targetScore: "90+" },
    weekMapSummary: loaded.weekMap.map((week) => ({
      weekNumber: week.weekNumber,
      lectureNumber: week.lectureNumber,
      recitationNumber: week.recitationNumber,
      practicedLectureNumber: week.practicedLectureNumber,
      topicCoverage: week.topicCoverage,
    })),
    topicMapSummary: loaded.topicMap.map((topic) => ({
      topicId: topic.topicId,
      title: topic.title,
      weeks: topic.detectedInWeeks,
      confidence: topic.confidence,
    })),
    formulas: formulaBank.slice(0, 80),
    theorems: theoremBank.slice(0, 80),
    proofPatterns: proofPatternBank.slice(0, 80),
    questionBankSummary: questionBank.map((question) => ({
      id: question.id,
      sourceType: question.sourceType,
      topicIds: question.topicIds,
      confidence: question.confidence,
    })),
    examPriorityMap,
    examPlan,
    warnings: loaded.extracted.filter((record) => record.status !== "success").map((record) => `${record.filename}: ${record.status}`),
  };

  const outputs = await Promise.all([
    writeJson("lecture-analysis.json", lectureAnalysis),
    writeJson("recitation-analysis.json", recitationAnalysis),
    writeJson("homework-analysis.json", homeworkAnalysis),
    writeJson("summary-analysis.json", summaryAnalysis),
    writeJson("past-exam-analysis.json", pastExamAnalysis),
    writeJson("past-exam-aggregate.json", pastExamAggregate),
    writeJson("formula-bank.json", formulaBank),
    writeJson("theorem-bank.json", theoremBank),
    writeJson("proof-pattern-bank.json", proofPatternBank),
    writeJson("question-bank.json", questionBank),
    writeJson("exam-priority-map.json", examPriorityMap),
    writeJson("exam-plan.json", examPlan),
    writeJson("mentor-knowledge-base.json", mentorKnowledgeBase),
  ]);

  console.log("\nCalculus 2 analysis report");
  console.log("--------------------------");
  console.log(`Lectures analyzed: ${lectureAnalysis.length}`);
  console.log(`Recitations analyzed: ${recitationAnalysis.length}`);
  console.log(`Homework files analyzed: ${homeworkAnalysis.length}`);
  console.log(`Summaries analyzed: ${summaryAnalysis.length}`);
  console.log(`Past exam/reference files analyzed: ${pastExamAnalysis.length}`);
  console.log(`Formulas detected: ${formulaBank.length}`);
  console.log(`Theorems detected: ${theoremBank.length}`);
  console.log(`Proof patterns detected: ${proofPatternBank.length}`);
  console.log(`Questions detected: ${questionBank.length}`);
  console.log(`High-priority exam topics: ${examPriorityMap.topics.filter((topic) => ["high", "critical"].includes(topic.priorityLevel)).length}`);
  console.log("\nGenerated analysis files:");
  for (const output of outputs) console.log(`- ${path.relative(process.cwd(), output)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
