import { EmptyState } from "@/components/Cards";
import { readGeneratedData } from "@/lib/calculus2/generated-data";

export default async function ExtractionPreviewPage() {
  const generatedData = await readGeneratedData();
  const fileById = new Map(generatedData.sourceFiles.map((file) => [file.id, file]));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Developer Preview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">בדיקת חילוץ טקסט</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          מסך פנימי לבדיקת איכות החילוץ לפני שמריצים ניתוח AI. מוצגים 1,000 התווים הראשונים מכל קובץ.
        </p>
      </section>

      {!generatedData.hasGeneratedData ? (
        <EmptyState
          title="אין תוצאות חילוץ"
          body="הריצי npm run process:calculus2 כדי ליצור extracted-text-index.json."
        />
      ) : (
        <section className="space-y-4">
          {generatedData.extractedTextIndex.map((record) => {
            const file = fileById.get(record.sourceFileId);
            return (
              <article key={record.sourceFileId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{record.filename}</h2>
                    <p className="mt-1 text-xs text-slate-500" dir="ltr">
                      {record.filePath}
                    </p>
                  </div>
                  <span className={statusClass(record.status)}>{record.status}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
                  <Info label="סוג מקור" value={file?.sourceType ?? "unknown"} />
                  <Info label="שבוע" value={file?.weekNumber ? String(file.weekNumber) : "—"} />
                  <Info label="עמודים" value={record.pageCount ? String(record.pageCount) : "—"} />
                  <Info label="אורך טקסט" value={String(record.extractedText.length)} />
                </div>
                {record.error ? (
                  <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm leading-6 text-rose-800">{record.error}</p>
                ) : null}
                <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-left text-xs leading-6 text-slate-100" dir="auto">
                  {record.extractedText.slice(0, 1000) || "No extracted text."}
                </pre>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-slate-950">{value}</p>
    </div>
  );
}

function statusClass(status: string): string {
  if (status === "success") return "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700";
  if (status === "needs_ocr") return "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700";
  return "rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700";
}
