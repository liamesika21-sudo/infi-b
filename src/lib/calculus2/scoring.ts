import type { MasteryStatus, ProgressItem, Question } from "./types";

const masteryWeight: Record<MasteryStatus, number> = {
  not_started: 0,
  seen: 0.2,
  understood: 0.55,
  needs_review: 0.35,
  weak: 0.15,
  mastered: 1,
};

export function calculateProgressScore(items: ProgressItem[]): number | undefined {
  if (items.length === 0) return undefined;
  const score = items.reduce((sum, item) => {
    const confidence = Math.max(0, Math.min(1, item.confidenceLevel / 5));
    const penalty = Math.min(0.35, item.mistakesCount * 0.05);
    return sum + Math.max(0, masteryWeight[item.status] * 0.8 + confidence * 0.2 - penalty);
  }, 0);
  return Math.round((score / items.length) * 100);
}

export function scoreQuestionPriority(question: Question): number {
  const examWeight = question.sourceType === "past_exam" ? 30 : question.sourceType === "homework" ? 18 : 12;
  const importanceWeight = question.examRelevance === "critical" ? 35 : question.examRelevance === "high" ? 25 : question.examRelevance === "medium" ? 15 : 0;
  const proofWeight = question.kind === "proof" || question.kind === "mixed" ? 15 : 8;
  return Math.min(100, examWeight + importanceWeight + proofWeight);
}
