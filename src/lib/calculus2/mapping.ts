import type { CourseWeek, SourceFile, WeekMaterialStatus } from "./types";

export function practicedLectureForRecitation(recitationNumber: number): number | null {
  return recitationNumber > 1 ? recitationNumber - 1 : null;
}

export function weekId(weekNumber: number): string {
  return `week-${weekNumber}`;
}

export function buildWeekSourceIds(weekNumber: number, files: SourceFile[]): string[] {
  return files
    .filter((file) => {
      if (file.sourceType === "lecture") return file.lectureNumber === weekNumber;
      if (file.sourceType === "recitation") return file.recitationNumber === weekNumber;
      if (file.sourceType === "homework") return file.homeworkNumber === weekNumber;
      if (file.sourceType === "summary") return file.weekNumber === weekNumber;
      return false;
    })
    .map((file) => file.id);
}

function idsForWeekAndType(weekNumber: number, files: SourceFile[], sourceType: SourceFile["sourceType"]): string[] {
  return files
    .filter((file) => {
      if (sourceType === "lecture") return file.sourceType === "lecture" && file.lectureNumber === weekNumber;
      if (sourceType === "recitation") return file.sourceType === "recitation" && file.recitationNumber === weekNumber;
      if (sourceType === "homework") return file.sourceType === "homework" && file.homeworkNumber === weekNumber;
      if (sourceType === "summary") return file.sourceType === "summary" && file.weekNumber === weekNumber;
      return false;
    })
    .map((file) => file.id);
}

export function getWeekMaterialStatus(weekNumber: number, files: SourceFile[]): WeekMaterialStatus {
  const lectureCount = files.filter((file) => file.sourceType === "lecture" && file.lectureNumber === weekNumber).length;
  const recitationCount = files.filter((file) => file.sourceType === "recitation" && file.recitationNumber === weekNumber).length;
  const homeworkCount = files.filter((file) => file.sourceType === "homework" && file.homeworkNumber === weekNumber).length;
  const summaryCount = files.filter((file) => file.sourceType === "summary" && file.weekNumber === weekNumber).length;

  return {
    lecture: lectureCount > 0 ? "available" : "missing",
    recitation: recitationCount > 1 ? "multiple" : recitationCount === 1 ? "available" : "missing",
    homework: homeworkCount > 0 ? "available" : "missing",
    summary: summaryCount > 0 ? "available" : "missing",
  };
}

export function buildWeekMap(totalWeeks: number, files: SourceFile[]): CourseWeek[] {
  return Array.from({ length: totalWeeks }, (_, index) => {
    const weekNumber = index + 1;
    return {
      id: weekId(weekNumber),
      weekNumber,
      lectureNumber: weekNumber,
      recitationNumber: weekNumber,
      practicedLectureNumber: practicedLectureForRecitation(weekNumber),
      homeworkNumber: weekNumber,
      materialStatus: getWeekMaterialStatus(weekNumber, files),
      sourceFileIds: buildWeekSourceIds(weekNumber, files),
      lectureFileIds: idsForWeekAndType(weekNumber, files, "lecture"),
      recitationFileIds: idsForWeekAndType(weekNumber, files, "recitation"),
      homeworkFileIds: idsForWeekAndType(weekNumber, files, "homework"),
      summaryFileIds: idsForWeekAndType(weekNumber, files, "summary"),
      topicCoverage: [],
      examRelevance: "unknown",
      masteryStatus: "not_started",
    };
  });
}
