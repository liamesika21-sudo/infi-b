import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { StudyCallout } from "@/components/study/StudyCallout";
import { FormulaCenterClient } from "@/components/FormulaCenterClient";

export default async function FormulasPage() {
  const analysis = await readAnalysisData();

  return (
    <div className="space-y-6">
      {analysis.formulaBank.length === 0 ? (
        <StudyCallout variant="warning">
          אין עדיין נוסחאות שחולצו. הריצי npm run analyze:calculus2.
        </StudyCallout>
      ) : (
        <StudyCallout variant="tip">
          הרשימה הראשית היא נוסחאות ליבה מסודרות לשינון ותרגול. החילוץ האוטומטי מהמקורות מופיע בסוף העמוד כארכיון לבדיקה בלבד.
        </StudyCallout>
      )}

      <FormulaCenterClient formulas={analysis.formulaBank} />
    </div>
  );
}
