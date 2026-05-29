import { BookOpen, Brain, ClipboardList, FileQuestion, Gauge, Layers3, ListChecks, Sigma, Sparkles, Target } from "lucide-react";
import { calculus2Course, moduleRoutes } from "@/lib/calculus2/config";
import type { GeneratedDataSnapshot, MaterialInventory } from "@/lib/calculus2";
import type { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { ModuleCard, StatCard } from "./Cards";
import { BiDiMathContent } from "./BiDiMathContent";

const moduleIcons = [Layers3, BookOpen, Sigma, ListChecks, Target, ClipboardList, FileQuestion, ClipboardList, Sparkles, Gauge, Brain];

export function Dashboard({
  inventory,
  generatedData,
  analysisData,
}: {
  inventory: MaterialInventory;
  generatedData: GeneratedDataSnapshot;
  analysisData: Awaited<ReturnType<typeof readAnalysisData>>;
}) {
  const availableLectureWeeks = new Set(
    inventory.sourceFiles.filter((file) => file.sourceType === "lecture" && file.weekNumber).map((file) => file.weekNumber),
  ).size;
  const successCount = generatedData.extractedTextIndex.filter((record) => record.status === "success").length;
  const failedCount = generatedData.extractedTextIndex.filter((record) => record.status === "failed").length;
  const needsOcrCount = generatedData.extractedTextIndex.filter((record) => record.status === "needs_ocr").length;
  const missingWeeks = inventory.weeks.filter((week) => week.materialStatus.lecture === "missing").length;

  return (
    <div className="space-y-8">
      {!generatedData.hasGeneratedData ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
          <h2 className="text-lg font-semibold">עדיין לא בוצע עיבוד חומרים</h2>
          <p className="mt-2 text-sm leading-7">
            הריצי <span dir="ltr" className="inline-block rounded-lg bg-white px-2 py-1 font-mono text-xs">npm run process:calculus2</span> כדי להתחיל חילוץ טקסט ויצירת JSON מקומי.
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">מועד א׳</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">יעד {calculus2Course.targetScoreLabel}</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">חומר מקומי נסרק</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{calculus2Course.nameHe}</h1>
        <BiDiMathContent
          className="mt-4 max-w-4xl text-base text-slate-600"
          text="מערכת הכנה ייעודית לאינפי ב׳. היא מתחילה ממיפוי אמין של החומרים, כולל ההיסט הפדגוגי: הרצאה \(N\) שייכת לשבוע \(N\), אבל תרגול \(N\) בדרך כלל מתרגל את הרצאה \(N-1\)."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="יעד ציון" value={calculus2Course.targetScoreLabel} helper="הכנה ממוקדת למועד א׳" />
        <StatCard label="שבועות בקורס" value={calculus2Course.totalWeeks} helper="כל השבועות גלויים במפת השבועות" />
        <StatCard label="שבועות זמינים" value={availableLectureWeeks} helper={`חסרים ${missingWeeks} שבועות הרצאה`} />
        <StatCard label="נושאים מזוהים" value={generatedData.topicMap.length} helper={generatedData.hasGeneratedData ? "מתוך טקסט שחולץ" : "ממתין לעיבוד"} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="נוסחאות שחולצו" value={analysisData.formulaBank.length} helper="מתוך הרצאות, סיכומים וחומרי בחינה" />
        <StatCard label="משפטים שחולצו" value={analysisData.theoremBank.length} helper="משפטים, טענות ולמות" />
        <StatCard label="שאלות שחולצו" value={analysisData.questionBank.length} helper="תרגולים, מטלות ומבחנים" />
        <StatCard
          label="נושאים בעדיפות גבוהה"
          value={analysisData.examPriorityMap?.topics.filter((topic) => ["high", "critical"].includes(topic.priorityLevel)).length ?? 0}
          helper={analysisData.hasAnalysis ? "לפי תדירות וחזרתיות" : "ממתין לניתוח"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">סטטוס חומרים</h2>
          <div className="mt-5 space-y-2">
            <StatusRow label="סך קבצי מקור" value={inventory.sourceFiles.length} />
            <StatusRow label="הרצאות" value={inventory.countsByType.lecture} />
            <StatusRow label="תרגולים" value={inventory.countsByType.recitation} />
            <StatusRow label="מטלות" value={inventory.countsByType.homework} />
            <StatusRow label="סיכומים" value={inventory.countsByType.summary} />
            <StatusRow label="מבחנים וחומרי בחינה" value={inventory.countsByType.past_exam + inventory.countsByType.formula_sheet + inventory.countsByType.theorem_list} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">הפעולה הבאה</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {!generatedData.hasGeneratedData
              ? "להריץ את פקודת העיבוד המקומית כדי ליצור source-files.json, extracted-text-index.json, week-map.json ו-topic-map.json."
              : !analysisData.hasAnalysis
                ? "להריץ npm run analyze:calculus2 כדי לבנות בנקי נוסחאות, משפטים, שאלות ועדיפות מבחן."
                : "לבדוק את /dev/analysis ואת נושאי העדיפות הגבוהים, ואז להתחיל לפתור שאלות מבחן ומטלות לפי הסדר."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SmallStatus label="חולץ בהצלחה" value={String(successCount)} />
            <SmallStatus label="צריך OCR" value={String(needsOcrCount)} />
            <SmallStatus label="נכשל" value={String(failedCount)} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">מודולים</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleRoutes.slice(1).map((route, index) => (
            <ModuleCard key={route.href} href={route.href} label={route.label} description={route.description} icon={moduleIcons[index] ?? BookOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="font-mono text-lg font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SmallStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
