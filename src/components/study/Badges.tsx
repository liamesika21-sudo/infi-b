import type { ExamImportance } from "@/lib/calculus2/types";

export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    pct >= 70 ? "badge badge-green" : pct >= 45 ? "badge badge-amber" : "badge badge-muted";
  return <span className={cls}>{pct}%</span>;
}

export function ExamRelevanceBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    critical: "badge badge-red",
    high: "badge badge-navy",
    medium: "badge badge-navy-light",
    low: "badge badge-muted",
    unknown: "badge badge-muted",
  };
  const labels: Record<string, string> = {
    critical: "קריטי",
    high: "גבוה",
    medium: "בינוני",
    low: "נמוך",
    unknown: "לא ידוע",
  };
  return <span className={map[level] ?? "badge badge-muted"}>{labels[level] ?? level}</span>;
}

export function PriorityBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    critical: "badge badge-red",
    high: "badge badge-navy",
    medium: "badge badge-amber",
    low: "badge badge-muted",
  };
  const labels: Record<string, string> = {
    critical: "⚠ קריטי",
    high: "גבוה",
    medium: "בינוני",
    low: "נמוך",
  };
  return <span className={map[level] ?? "badge badge-muted"}>{labels[level] ?? level}</span>;
}

export function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    hard: "badge badge-red",
    exam_hard: "badge badge-red",
    medium: "badge badge-amber",
    easy: "badge badge-green",
    mixed: "badge badge-purple",
    unknown: "badge badge-muted",
  };
  const labels: Record<string, string> = {
    hard: "קשה",
    exam_hard: "קשה (מבחן)",
    medium: "בינוני",
    easy: "קל",
    mixed: "מעורב",
    unknown: "לא ידוע",
  };
  return <span className={map[level] ?? "badge badge-muted"}>{labels[level] ?? level}</span>;
}

export function SourceBadge({ sourceType }: { sourceType: string }) {
  const map: Record<string, string> = {
    lecture: "badge badge-navy-light",
    recitation: "badge badge-cyan",
    homework: "badge badge-gold",
    past_exam: "badge badge-purple",
    summary: "badge badge-green",
    simulation: "badge badge-amber",
    mixed: "badge badge-muted",
  };
  const labels: Record<string, string> = {
    lecture: "הרצאה",
    recitation: "תרגול",
    homework: "מטלה",
    past_exam: "מבחן עבר",
    lecture_example: "הרצאה",
    summary: "סיכום",
    simulation: "סימולציה",
    mixed: "מעורב",
  };
  return <span className={map[sourceType] ?? "badge badge-muted"}>{labels[sourceType] ?? sourceType}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "badge badge-green",
    missing: "badge badge-red",
    multiple: "badge badge-cyan",
    needs_ocr: "badge badge-amber",
    success: "badge badge-green",
    failed: "badge badge-red",
  };
  const labels: Record<string, string> = {
    available: "זמין",
    missing: "חסר",
    multiple: "כפול",
    needs_ocr: "צריך OCR",
    success: "✓",
    failed: "✗",
  };
  return <span className={map[status] ?? "badge badge-muted"}>{labels[status] ?? status}</span>;
}

export function ImportanceBadge({ importance }: { importance: ExamImportance | string }) {
  return <ExamRelevanceBadge level={importance} />;
}
