export const hebrewPastExams = [
  {
    filename: "Simulation_calculus2_2025_heb.pdf",
    title: "סימולציה 2025",
    year: "2025",
    moed: "סימולציה",
  },
  {
    filename: "MoedB_calculus2_2025_heb.pdf",
    title: "מועד ב׳ 2025",
    year: "2025",
    moed: "מועד ב׳",
  },
  {
    filename: "MoedA_calculus2_2024_heb.pdf",
    title: "מועד א׳ 2024",
    year: "2024",
    moed: "מועד א׳",
  },
  {
    filename: "MoedB_calculus2_2024_heb.pdf",
    title: "מועד ב׳ 2024",
    year: "2024",
    moed: "מועד ב׳",
  },
  {
    filename: "MoedA_2023_heb.pdf",
    title: "מועד א׳ 2023",
    year: "2023",
    moed: "מועד א׳",
  },
  {
    filename: "MoedB_2023_heb.pdf",
    title: "מועד ב׳ 2023",
    year: "2023",
    moed: "מועד ב׳",
  },
  {
    filename: "MoedA_2022_heb.pdf",
    title: "מועד א׳ 2022",
    year: "2022",
    moed: "מועד א׳",
  },
  {
    filename: "MoedB_2022_heb.pdf",
    title: "מועד ב׳ 2022",
    year: "2022",
    moed: "מועד ב׳",
  },
] as const;

export const hebrewPastExamFilenames: ReadonlySet<string> = new Set(hebrewPastExams.map((exam) => exam.filename));

export function getHebrewPastExamHref(filename: string) {
  return `/api/past-exams-hebrew/${encodeURIComponent(filename)}`;
}
