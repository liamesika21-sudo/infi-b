import { WeekMap } from "@/components/WeekMap";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { scanDocsFolder } from "@/lib/calculus2/pipeline";

export default async function WeeksPage() {
  const generatedData = await readGeneratedData();
  const inventory = await scanDocsFolder();
  const weeks = generatedData.weekMap.length > 0 ? generatedData.weekMap : inventory.weeks;
  const files = generatedData.sourceFiles.length > 0 ? generatedData.sourceFiles : inventory.sourceFiles;
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Week Map</p>
        <h1 className="mt-3 text-3xl font-semibold">מפת 13 השבועות</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          המפה מציגה את ההפרדה בין שבוע, הרצאה, תרגול ומטלה. תרגול N מסומן כמתרגל בדרך כלל את הרצאה N-1, כדי לא לערבב בין חומר חדש לבין תרגול של חומר קודם.
        </p>
      </section>
      <WeekMap weeks={weeks} files={files} extractedTextIndex={generatedData.extractedTextIndex} />
    </div>
  );
}
