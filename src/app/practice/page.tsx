import { EmptyState } from "@/components/Cards";
import { PageHeader, QuestionCard } from "@/components/AnalysisCards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";

export default async function PracticePage() {
  const analysis = await readAnalysisData();
  const questions = analysis.questionBank;
  const sourceCounts = {
    lecture: questions.filter((item) => item.sourceType === "lecture_example").length,
    recitation: questions.filter((item) => item.sourceType === "recitation").length,
    homework: questions.filter((item) => item.sourceType === "homework").length,
    pastExam: questions.filter((item) => item.sourceType === "past_exam").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice Center"
        title="מרכז תרגול"
        description="שאלות שחולצו מתרגולים, מטלות, דוגמאות הרצאה ומבחני עבר. הסיווג כרגע מבוסס טקסט ומקור, ללא המצאת פתרונות."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <PracticeStat label="דוגמאות הרצאה" value={sourceCounts.lecture} />
        <PracticeStat label="תרגולים" value={sourceCounts.recitation} />
        <PracticeStat label="מטלות" value={sourceCounts.homework} />
        <PracticeStat label="מבחני עבר" value={sourceCounts.pastExam} />
      </section>
      {questions.length === 0 ? (
        <EmptyState title="אין עדיין שאלות שחולצו" body="הריצי npm run analyze:calculus2 אחרי עיבוד החומרים." />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {questions.slice(0, 80).map((item) => (
            <QuestionCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}

function PracticeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
