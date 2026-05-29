import type { CourseWeek, ExtractedTextRecord, SourceFile } from "@/lib/calculus2/types";

export function WeekMap({
  weeks,
  files,
  extractedTextIndex = [],
}: {
  weeks: CourseWeek[];
  files: SourceFile[];
  extractedTextIndex?: ExtractedTextRecord[];
}) {
  const extractionByFile = new Map(extractedTextIndex.map((record) => [record.sourceFileId, record]));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {weeks.map((week) => {
        const weekFiles = files.filter((file) => week.sourceFileIds.includes(file.id));
        const extractionStatuses = weekFiles.map((file) => extractionByFile.get(file.id)?.status ?? "not_processed");
        return (
          <article key={week.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">שבוע {week.weekNumber}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  {week.materialStatus.lecture === "available" ? "חומר זמין לסריקה" : "ממתין לחומר"}
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${week.materialStatus.lecture === "available" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {week.materialStatus.lecture === "available" ? "זמין" : "חסר"}
              </span>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p>הרצאה {week.lectureNumber}: חומר חדש.</p>
              <p>
                תרגול {week.recitationNumber}:{" "}
                {week.practicedLectureNumber ? `מתרגל בדרך כלל את הרצאה ${week.practicedLectureNumber}` : "נדרש מיפוי ידני בתחילת הקורס"}.
              </p>
              <p>מטלה {week.homeworkNumber}: מיושרת למספור השבוע/מטלה.</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Badge label="הרצאה" value={week.materialStatus.lecture} />
              <Badge label="תרגול" value={week.materialStatus.recitation} />
              <Badge label="מטלה" value={week.materialStatus.homework} />
              <Badge label="סיכום" value={week.materialStatus.summary} />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <span className="font-semibold text-slate-700">סטטוס חילוץ: </span>
              {extractionStatuses.length > 0 ? extractionStatuses.join(", ") : "לא עובד"}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500">נושאים שזוהו</p>
              {week.topicCoverage.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {week.topicCoverage.slice(0, 8).map((topic) => (
                    <span key={topic} className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-800">
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">אין זיהוי נושאים לשבוע זה עדיין.</p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500">קבצים משויכים</p>
              {weekFiles.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                  {weekFiles.map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-2" title={file.filename}>
                      <span className="truncate">{file.filename}</span>
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {extractionByFile.get(file.id)?.status ?? "not_processed"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">אין קבצים משויכים לשבוע זה.</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  const available = value === "available" || value === "multiple";
  return (
    <div className={`rounded-xl px-3 py-2 ${available ? "bg-cyan-50 text-cyan-800" : "bg-slate-100 text-slate-500"}`}>
      <span className="block font-semibold">{label}</span>
      <span>{value === "multiple" ? "כמה קבצים" : value === "available" ? "זמין" : "חסר"}</span>
    </div>
  );
}
