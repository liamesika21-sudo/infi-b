export type TheoremStatus = "known" | "review";
export type DifficultyRating = "easy" | "medium" | "hard";

export interface QuestionProgress {
  done: boolean;
  difficulty?: DifficultyRating;
}

export interface ProgressData {
  /** key: `w{week}-s{idx}` */
  theorems: Record<string, TheoremStatus>;
  /** key: `hw-{hwNum}-{questionId}` */
  questions: Record<string, QuestionProgress>;
  version: 1;
}

const STORAGE_KEY = "infi-progress-v1";

function empty(): ProgressData {
  return { theorems: {}, questions: {}, version: 1 };
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as ProgressData;
    if (parsed.version !== 1) return empty();
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function theoremKey(week: number, sectionIdx: number): string {
  return `w${week}-s${sectionIdx}`;
}

export function hwQuestionKey(hwNum: number, questionId: string): string {
  return `hw-${hwNum}-${questionId}`;
}

export interface ProgressStats {
  knownCount: number;
  reviewCount: number;
  totalMarkedTheorems: number;
  doneCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  totalMarkedQuestions: number;
  /** per week: how many sections are "known" */
  weekKnown: Record<number, number>;
}

export function computeStats(data: ProgressData): ProgressStats {
  const theoremVals = Object.values(data.theorems);
  const knownCount = theoremVals.filter(s => s === "known").length;
  const reviewCount = theoremVals.filter(s => s === "review").length;

  const weekKnown: Record<number, number> = {};
  for (const [key, status] of Object.entries(data.theorems)) {
    if (status !== "known") continue;
    const m = key.match(/^w(\d+)-/);
    if (!m) continue;
    const w = parseInt(m[1]);
    weekKnown[w] = (weekKnown[w] ?? 0) + 1;
  }

  const qVals = Object.values(data.questions);
  const doneVals = qVals.filter(q => q.done);

  return {
    knownCount,
    reviewCount,
    totalMarkedTheorems: theoremVals.length,
    doneCount: doneVals.length,
    easyCount: doneVals.filter(q => q.difficulty === "easy").length,
    mediumCount: doneVals.filter(q => q.difficulty === "medium").length,
    hardCount: doneVals.filter(q => q.difficulty === "hard").length,
    totalMarkedQuestions: qVals.length,
    weekKnown,
  };
}
