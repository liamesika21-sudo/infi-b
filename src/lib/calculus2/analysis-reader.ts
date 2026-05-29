import fs from "node:fs/promises";
import path from "node:path";
import { GENERATED_DIR } from "./generated-data";
import type {
  ExamPlanV1,
  ExamPriorityMap,
  FormulaItem,
  HomeworkAnalysis,
  HomeworkPriorityEntry,
  LectureAnalysis,
  LectureSummary,
  MaxInsightsData,
  MentorKnowledgeBase,
  PastExamAggregate,
  PastExamAnalysis,
  ProofPatternItem,
  QuestionItem,
  RecitationAnalysis,
  RecitationSummary,
  SimulationExamData,
  SummaryAnalysis,
  TheoremItem,
} from "./analysis-types";

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(GENERATED_DIR, filename), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function readAnalysisData() {
  const [
    lectureAnalysis,
    recitationAnalysis,
    homeworkAnalysis,
    summaryAnalysis,
    pastExamAnalysis,
    pastExamAggregate,
    formulaBank,
    theoremBank,
    proofPatternBank,
    questionBank,
    examPriorityMap,
    examPlan,
    mentorKnowledgeBase,
    recitationSummaries,
    lectureSummaries,
    homeworkPriorityMap,
    simulationExams,
    maxInsights,
  ] = await Promise.all([
    readJson<LectureAnalysis[]>("lecture-analysis.json", []),
    readJson<RecitationAnalysis[]>("recitation-analysis.json", []),
    readJson<HomeworkAnalysis[]>("homework-analysis.json", []),
    readJson<SummaryAnalysis[]>("summary-analysis.json", []),
    readJson<PastExamAnalysis[]>("past-exam-analysis.json", []),
    readJson<PastExamAggregate | null>("past-exam-aggregate.json", null),
    readJson<FormulaItem[]>("formula-bank.json", []),
    readJson<TheoremItem[]>("theorem-bank.json", []),
    readJson<ProofPatternItem[]>("proof-pattern-bank.json", []),
    readJson<QuestionItem[]>("question-bank.json", []),
    readJson<ExamPriorityMap | null>("exam-priority-map.json", null),
    readJson<ExamPlanV1 | null>("exam-plan.json", null),
    readJson<MentorKnowledgeBase | null>("mentor-knowledge-base.json", null),
    readJson<RecitationSummary[]>("recitation-summaries.json", []),
    readJson<LectureSummary[]>("lecture-summaries.json", []),
    readJson<HomeworkPriorityEntry[]>("homework-priority-map.json", []),
    readJson<SimulationExamData[]>("simulation-exams.json", []),
    readJson<MaxInsightsData | null>("max-insights.json", null),
  ]);

  return {
    hasAnalysis:
      lectureAnalysis.length > 0 ||
      recitationAnalysis.length > 0 ||
      homeworkAnalysis.length > 0 ||
      summaryAnalysis.length > 0 ||
      pastExamAnalysis.length > 0,
    lectureAnalysis,
    recitationAnalysis,
    homeworkAnalysis,
    summaryAnalysis,
    pastExamAnalysis,
    pastExamAggregate,
    formulaBank,
    theoremBank,
    proofPatternBank,
    questionBank,
    examPriorityMap,
    examPlan,
    mentorKnowledgeBase,
    recitationSummaries,
    lectureSummaries,
    homeworkPriorityMap,
    simulationExams,
    maxInsights,
  };
}

