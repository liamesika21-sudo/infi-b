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
        <StudyCallout variant="warning">
          נוסחאות עם ביטחון נמוך או OCR לא קריא מסוננות מהתצוגה המרכזית כדי לא לשנן ביטויים שגויים.
        </StudyCallout>
      )}

      <FormulaCenterClient formulas={analysis.formulaBank} />
    </div>
  );
}
