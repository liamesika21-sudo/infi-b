import type { ExamImportance, SourceType } from "./types";

export type AnalysisConfidence = number;
export type DifficultyEstimate = "easy" | "medium" | "hard" | "mixed" | "unknown";

export interface SourceSnippet {
  sourceFileId: string;
  filename: string;
  text: string;
  startOffset?: number;
  endOffset?: number;
}

export interface TheoryItem {
  id: string;
  title: string;
  kind: "definition" | "concept" | "remark";
  content: string;
  topicIds: string[];
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface TheoremItem {
  id: string;
  title: string;
  statement: string;
  assumptions?: string[];
  conclusion?: string;
  topicIds: string[];
  sourceFileIds: string[];
  sourceSnippets: SourceSnippet[];
  proofRequired?: boolean;
  whenToUse?: string[];
  examImportance: Exclude<ExamImportance, "unknown">;
  confidence: AnalysisConfidence;
}

export interface FormulaItem {
  id: string;
  title: string;
  latex?: string;
  plainText?: string;
  topicIds: string[];
  sourceFileIds: string[];
  sourceSnippets: SourceSnippet[];
  conditions?: string[];
  whenToUse?: string[];
  commonMistakes?: string[];
  examImportance: Exclude<ExamImportance, "unknown">;
  confidence: AnalysisConfidence;
}

export interface ProofPatternItem {
  id: string;
  title: string;
  patternType: string;
  steps: string[];
  topicIds: string[];
  sourceFileIds: string[];
  relatedQuestionIds: string[];
  commonMistakes?: string[];
  examImportance: Exclude<ExamImportance, "unknown">;
  confidence: AnalysisConfidence;
}

export interface ExampleItem {
  id: string;
  content: string;
  topicIds: string[];
  sourceSnippet: SourceSnippet;
  confidence: AnalysisConfidence;
}

export interface QuestionItem {
  id: string;
  sourceType: "recitation" | "homework" | "past_exam" | "lecture_example";
  sourceFileId: string;
  questionNumber?: string;
  content: string;
  contentHe?: string;
  topicIds: string[];
  requiredTheoremIds?: string[];
  requiredFormulaIds?: string[];
  requiredTechniqueIds?: string[];
  difficulty: "easy" | "medium" | "hard" | "unknown";
  examRelevance: Exclude<ExamImportance, "unknown">;
  sourceSnippet: SourceSnippet;
  confidence: AnalysisConfidence;
}

export interface LectureAnalysis {
  lectureNumber: number;
  weekNumber: number;
  sourceFileId: string;
  filename: string;
  extractionStatus: string;
  title?: string;
  detectedTopics: string[];
  definitions: TheoryItem[];
  theorems: TheoremItem[];
  formulas: FormulaItem[];
  proofPatterns: ProofPatternItem[];
  examples: ExampleItem[];
  remarks: string[];
  importantForExam: string[];
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface RecitationAnalysis {
  recitationNumber: number;
  weekNumber: number;
  practicedLectureNumber: number | null;
  sourceFileId: string;
  filename: string;
  practicedTopics: string[];
  questions: QuestionItem[];
  solutionPatterns: ProofPatternItem[];
  techniques: string[];
  commonMistakes: string[];
  linkedLectureNumber: number | null;
  topicOverlapWithLinkedLecture: string[];
  mappingNeedsReview: boolean;
  examRelevanceNotes: string[];
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface HomeworkAnalysis {
  homeworkNumber: number;
  weekNumber: number;
  sourceFileId: string;
  filename: string;
  topics: string[];
  questions: QuestionItem[];
  requiredTheorems: string[];
  requiredFormulas: string[];
  requiredTechniques: string[];
  examSimilarityHints: string[];
  mustReviewBeforeExam: boolean;
  difficultyEstimate: Exclude<DifficultyEstimate, "unknown">;
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface SummaryAnalysis {
  sourceFileId: string;
  filename: string;
  relatedWeeks: number[];
  detectedTopics: string[];
  definitions: TheoryItem[];
  theorems: TheoremItem[];
  formulas: FormulaItem[];
  condensedExplanations: string[];
  examTips: string[];
  commonMistakes: string[];
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface PastExamAnalysis {
  sourceFileId: string;
  filename: string;
  examYear?: number;
  moed?: "A" | "B" | "unknown";
  questions: QuestionItem[];
  detectedTopics: string[];
  repeatedPatterns: string[];
  requiredTheorems: string[];
  requiredFormulas: string[];
  proofPatterns: string[];
  difficultyEstimate: DifficultyEstimate;
  sourceSnippets: SourceSnippet[];
  confidence: AnalysisConfidence;
}

export interface PastExamAggregate {
  topicFrequency: Array<{ topicId: string; title: string; count: number; files: string[] }>;
  theoremFrequency: Array<{ theoremId: string; title: string; count: number }>;
  formulaFrequency: Array<{ formulaId: string; title: string; count: number }>;
  proofPatternFrequency: Array<{ patternId: string; title: string; count: number }>;
  highPriorityTopics: string[];
  mustPracticeQuestions: string[];
  likelyMoedATopics: string[];
  dangerZones: string[];
}

export interface ExamPriorityMap {
  generatedAt: string;
  topics: Array<{
    topicId: string;
    title: string;
    priorityScore: number;
    priorityLevel: "low" | "medium" | "high" | "critical";
    reasons: string[];
    appearedInPastExams: number;
    appearedInHomework: number;
    appearedInRecitations: number;
    appearedInLectures: number;
    recommendedAction: string;
  }>;
}

export interface ExamPlanV1 {
  generatedAt: string;
  learnFirst: string[];
  reviewDaily: string[];
  memorize: string[];
  solvePractice: string[];
  proofPractice: string[];
  leaveForLater: string[];
  cannotSkip: string[];
  blockedByOcrOrMissingData: string[];
  sourceBasis: string[];
}

export interface RecitationSummary {
  recitationNumber: number;
  weekNumber: number;
  sourceFileId: string;
  filename: string;
  practicesLecture: number | null;
  mainThemes: string[];
  whatWasPracticed: string;
  keyTechniques: string[];
  examRelevance: "low" | "medium" | "high" | "critical";
  questionCount: number;
  questionIds: string[];
  solutionPatternCount: number;
  mustPractice: string[];
  commonMistakes: string[];
  conclusions: string[];
  topicCoverage: string[];
  confidence: number;
  dataNote?: string;
}

export interface LectureSummary {
  lectureNumber: number;
  weekNumber: number;
  sourceFileId: string | null;
  filename: string | null;
  title: string;
  mainTopics: string[];
  keyDefinitions: string[];
  keyTheorems: string[];
  keyFormulas: string[];
  examNotes: string[];
  dataQuality: "good" | "partial" | "ocr_only";
  summarySourceFile: string | null;
  extractedTheorems: number;
  extractedFormulas: number;
  confidence: number;
  ocrWarning?: string;
}

export interface HomeworkQuestionPriority {
  questionId: string;
  questionNumber: number;
  homeworkNumber: number;
  weekNumber: number;
  topicIds: string[];
  difficulty: string;
  examSimilarity: "low" | "medium" | "high" | "critical";
  importanceLevel: "low" | "medium" | "high" | "critical";
  whyItMatters: string;
  requiredKnowledge: string[];
  recommendedAction: string;
  contentPreview: string;
  confidence: number;
}

export interface HomeworkPriorityEntry {
  homeworkNumber: number;
  weekNumber: number;
  sourceFileId: string;
  filename: string;
  mustReviewBeforeExam: boolean;
  overallPriority: "low" | "medium" | "high" | "critical";
  criticalQuestions: number;
  highPriorityQuestions: number;
  questions: HomeworkQuestionPriority[];
}

export interface MaxInsight {
  id: string;
  recitation?: number;
  week?: number;
  topic?: string;
  title?: string;
  text: string;
  maxQuote?: string;
  priority?: string;
  examImplication?: string;
  formalStatement?: string;
  technique?: string;
  classicExamQuestion?: string;
  redFlag?: string;
  orderOfGrowth?: string;
  mustMemorize?: string[];
  key?: string;
  rule?: string;
}

export interface MaxCounterExample {
  id: string;
  recitation: number;
  week: number;
  topic: string;
  title: string;
  claim: string;
  verdict: string;
  maxQuote?: string;
  counterexampleConstruction?: string;
  formalCounterexample?: string;
  whyItWorks?: string;
  counterexample?: string;
  explanation?: string;
  proof?: string;
  technique?: string;
  example?: Record<string, string>;
  badWriting?: string;
  correctApproach?: string;
  classicExample?: string;
  correctCalculation?: string;
  rule?: string;
  key?: string;
}

export interface MaxInsightsData {
  generatedAt: string;
  source: string;
  instructor: string;
  examCriticalNotes: MaxInsight[];
  intuitions: MaxInsight[];
  counterExamples: MaxCounterExample[];
  weeklyInsights: Array<{
    week: number;
    recitation: number;
    topic: string;
    keyInsights: string[];
    examTip?: string;
    classicExamQuestion?: string;
    dangerZone?: string;
    examCritical?: string;
    orderOfGrowth?: string;
    mustMemorize?: string[];
  }>;
  commonMistakesFromMax: Array<{
    id: string;
    week: number;
    mistake: string;
    maxSays: string;
  }>;
}

export interface SimulationQuestion {
  id: string;
  sourceBasis: "homework" | "recitation" | "past_exam" | "mixed";
  basedOnSourceIds: string[];
  topicIds: string[];
  content: string;
  requiredKnowledge: string[];
  difficulty: "easy" | "medium" | "hard";
  examRelevance: "medium" | "high" | "critical";
  hint?: string;
  solutionOutline?: string;
}

export interface SimulationExamData {
  id: string;
  title: string;
  estimatedDurationMinutes: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  targetTopics: string[];
  needsReview?: boolean;
  questions: SimulationQuestion[];
}

export interface MentorKnowledgeBase {
  generatedAt: string;
  courseIdentity: {
    courseId: "calculus2";
    nameHe: string;
    targetScore: "90+";
  };
  weekMapSummary: unknown[];
  topicMapSummary: unknown[];
  formulas: FormulaItem[];
  theorems: TheoremItem[];
  proofPatterns: ProofPatternItem[];
  questionBankSummary: Array<{ id: string; sourceType: SourceType | string; topicIds: string[]; confidence: number }>;
  examPriorityMap: ExamPriorityMap;
  examPlan: ExamPlanV1;
  warnings: string[];
}

