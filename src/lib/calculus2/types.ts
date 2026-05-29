export const COURSE_ID = "calculus2" as const;

export type CourseId = typeof COURSE_ID;
export type CourseMode = "moed-a-exam-prep";
export type SourceType =
  | "lecture"
  | "recitation"
  | "homework"
  | "summary"
  | "past_exam"
  | "formula_sheet"
  | "theorem_list"
  | "excluded_exam_material"
  | "unknown";
export type ProcessingStatus = "unprocessed" | "classified" | "text_extracted" | "analyzed" | "failed";
export type MasteryStatus = "not_started" | "seen" | "understood" | "needs_review" | "weak" | "mastered";
export type ExamImportance = "unknown" | "low" | "medium" | "high" | "critical";
export type Difficulty = "unknown" | "easy" | "medium" | "hard" | "exam_hard";
export type QuestionKind = "proof" | "computation" | "conceptual" | "mixed" | "unknown";
export type AgentRunStatus = "not_run" | "running" | "succeeded" | "failed" | "needs_review";

export interface SourceReference {
  sourceFileId: string;
  sourceType: SourceType;
  filename: string;
  relativePath: string;
  pageStart?: number;
  pageEnd?: number;
  confidence: number;
}

export interface SourceFile {
  id: string;
  filename: string;
  relativePath: string;
  absolutePath: string;
  extension: string;
  sourceType: SourceType;
  status: ProcessingStatus;
  weekNumber?: number;
  lectureNumber?: number;
  recitationNumber?: number;
  practicedLectureNumber?: number | null;
  homeworkNumber?: number;
  examYear?: number;
  moed?: "a" | "b" | "simulation" | "unknown";
  detectedLabels: string[];
  classificationConfidence: number;
  warnings: string[];
}

export type ExtractionStatus = "success" | "failed" | "needs_ocr";

export interface ExtractedTextRecord {
  sourceFileId: string;
  filename: string;
  filePath: string;
  extractedText: string;
  pageCount?: number;
  status: ExtractionStatus;
  error?: string;
}

export interface DetectedTopic {
  topicId: string;
  title: string;
  aliases: string[];
  detectedInFiles: string[];
  detectedInWeeks: number[];
  confidence: number;
  sourceSnippets?: string[];
}

export interface Calculus2Course {
  courseId: CourseId;
  nameHe: string;
  nameEn: string;
  mode: CourseMode;
  targetScoreLabel: "90+";
  totalWeeks: number;
  availableWeeks: number;
  sourceRoot: string;
}

export interface WeekMaterialStatus {
  lecture: "available" | "missing";
  recitation: "available" | "missing" | "multiple";
  homework: "available" | "missing";
  summary: "available" | "missing";
}

export interface CourseWeek {
  id: string;
  weekNumber: number;
  lectureNumber: number;
  recitationNumber: number;
  practicedLectureNumber: number | null;
  homeworkNumber: number;
  materialStatus: WeekMaterialStatus;
  sourceFileIds: string[];
  lectureFileIds: string[];
  recitationFileIds: string[];
  homeworkFileIds: string[];
  summaryFileIds: string[];
  topicCoverage: string[];
  examRelevance: ExamImportance;
  masteryStatus: MasteryStatus;
}

export interface Lecture {
  id: string;
  lectureNumber: number;
  weekNumber: number;
  title: string;
  topics: string[];
  definitionIds: string[];
  theoremIds: string[];
  formulaIds: string[];
  proofPatternIds: string[];
  exampleIds: string[];
  sourceReferences: SourceReference[];
}

export interface Recitation {
  id: string;
  recitationNumber: number;
  calendarWeek: number;
  practicedLectureNumber: number | null;
  practicedTopics: string[];
  solvedQuestionIds: string[];
  proofPatternIds: string[];
  commonMistakes: string[];
  sourceReferences: SourceReference[];
}

export interface Homework {
  id: string;
  homeworkNumber: number;
  weekNumber: number;
  topics: string[];
  questionIds: string[];
  relatedLectureIds: string[];
  relatedRecitationIds: string[];
  examSimilarityScore?: number;
  mustReviewBeforeExam: boolean;
  sourceReferences: SourceReference[];
}

export interface Summary {
  id: string;
  title: string;
  weekNumbers: number[];
  topicIds: string[];
  contentSectionIds: string[];
  sourceReferences: SourceReference[];
}

export interface PastExam {
  id: string;
  year?: number;
  moed: "a" | "b" | "simulation" | "unknown";
  questionIds: string[];
  topicFrequency: Record<string, number>;
  theoremFrequency: Record<string, number>;
  formulaFrequency: Record<string, number>;
  proofPatternFrequency: Record<string, number>;
  sourceReferences: SourceReference[];
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  weekNumbers: number[];
  lectureIds: string[];
  recitationIds: string[];
  homeworkIds: string[];
  summaryIds: string[];
  examQuestionIds: string[];
  definitionIds: string[];
  theoremIds: string[];
  formulaIds: string[];
  proofPatternIds: string[];
  explanation?: string;
  commonMistakes: string[];
  examFrequency?: number;
  masteryStatus: MasteryStatus;
}

export interface Theorem {
  id: string;
  topicId?: string;
  title: string;
  statement: string;
  assumptions: string[];
  conclusion: string;
  proofIdea?: string;
  whenToUse: string[];
  commonTrap?: string;
  proofMustBeKnown: boolean;
  examImportance: ExamImportance;
  sourceReferences: SourceReference[];
  masteryStatus: MasteryStatus;
}

export interface Formula {
  id: string;
  topicId?: string;
  title: string;
  latex: string;
  conditions: string[];
  whenToUse: string[];
  example?: string;
  commonMistake?: string;
  examImportance: ExamImportance;
  sourceReferences: SourceReference[];
  masteryStatus: MasteryStatus;
}

export interface ProofPattern {
  id: string;
  name: string;
  whereItAppears: string[];
  steps: string[];
  commonVariations: string[];
  requiredTheoremIds: string[];
  exampleQuestionIds: string[];
  examFrequency?: number;
  mustKnowByHeart: boolean;
  commonMistakes: string[];
  masteryStatus: MasteryStatus;
}

export interface Question {
  id: string;
  sourceType: SourceType;
  sourceFileId: string;
  title: string;
  content: string;
  topicId?: string;
  subtopic?: string;
  difficulty: Difficulty;
  kind: QuestionKind;
  requiredTheoremIds: string[];
  requiredFormulaIds: string[];
  proofPatternIds: string[];
  similarHomeworkQuestionIds: string[];
  similarRecitationQuestionIds: string[];
  solutionAvailability: "none" | "outline" | "full";
  commonTraps: string[];
  examRelevance: ExamImportance;
  masteryStatus: MasteryStatus;
}

export interface ProgressItem {
  itemId: string;
  itemType:
    | "topic"
    | "theorem"
    | "formula"
    | "proof_pattern"
    | "homework_question"
    | "recitation_question"
    | "past_exam_question"
    | "mentor_session";
  status: MasteryStatus;
  confidenceLevel: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  attemptsCount: number;
  mistakesCount: number;
  notes?: string;
}

export interface ExamPlan {
  id: string;
  targetScoreLabel: "90+";
  readinessScore?: number;
  priorityTopicIds: string[];
  mustReviewItemIds: string[];
  practiceQuestionIds: string[];
  dailyTasks: Array<{
    date: string;
    title: string;
    itemIds: string[];
    estimatedMinutes: number;
  }>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  inputDescription: string;
  outputSchemaDescription: string;
  validationRules: string[];
  whenToRun: string;
}

export interface AgentOutput {
  id: string;
  agentId: string;
  status: AgentRunStatus;
  sourceFileIds: string[];
  outputPath?: string;
  validationErrors: string[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialInventory {
  sourceFiles: SourceFile[];
  weeks: CourseWeek[];
  countsByType: Record<SourceType, number>;
  warnings: string[];
}

export interface GeneratedCalculus2Data {
  sourceFiles: SourceFile[];
  extractedTextIndex: ExtractedTextRecord[];
  weekMap: CourseWeek[];
  topicMap: DetectedTopic[];
  generatedAt?: string;
}
