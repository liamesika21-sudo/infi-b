import type {
  ExamPlanV1,
  FormulaItem,
  ProofPatternItem,
  QuestionItem,
  SourceSnippet,
  TheoremItem,
} from "@/lib/calculus2/analysis-types";

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{description}</p>
    </section>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const rounded = Math.round(value * 100);
  const tone =
    rounded >= 70
      ? "bg-emerald-50 text-emerald-700"
      : rounded >= 45
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{rounded}%</span>;
}

export function SourceSnippetBlock({ snippet }: { snippet?: SourceSnippet }) {
  if (!snippet) return null;
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{snippet.filename}</p>
      <p className="mt-2 line-clamp-5 text-xs leading-6 text-slate-600">{snippet.text}</p>
    </div>
  );
}

export function FormulaCard({ item }: { item: FormulaItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
        <ConfidenceBadge value={item.confidence} />
      </div>
      <p dir="ltr" className="mt-4 overflow-hidden rounded-2xl bg-slate-950 px-4 py-3 font-mono text-sm leading-7 text-white">
        {item.latex ?? item.plainText ?? "No extracted expression"}
      </p>
      <MetaRow label="חשיבות מבחן" value={item.examImportance} />
      <SourceSnippetBlock snippet={item.sourceSnippets[0]} />
    </article>
  );
}

export function TheoremCard({ item }: { item: TheoremItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
        <ConfidenceBadge value={item.confidence} />
      </div>
      <p className="mt-4 line-clamp-6 text-sm leading-7 text-slate-700">{item.statement}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <MetaRow label="חשיבות מבחן" value={item.examImportance} />
        <MetaRow label="דורש הוכחה" value={item.proofRequired ? "כן" : "לא זוהה"} />
      </div>
      <SourceSnippetBlock snippet={item.sourceSnippets[0]} />
    </article>
  );
}

export function ProofPatternCard({ item }: { item: ProofPatternItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
        <ConfidenceBadge value={item.confidence} />
      </div>
      <MetaRow label="סוג תבנית" value={item.patternType} />
      <ol className="mt-4 list-inside list-decimal space-y-2 text-sm leading-7 text-slate-700">
        {item.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}

export function QuestionCard({ item }: { item: QuestionItem }) {
  const sourceLabels = {
    recitation: "תרגול",
    homework: "מטלה",
    past_exam: "מבחן עבר",
    lecture_example: "דוגמת הרצאה",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{sourceLabels[item.sourceType]}</span>
        <ConfidenceBadge value={item.confidence} />
      </div>
      <p className="mt-4 line-clamp-7 text-sm leading-7 text-slate-700">{item.content}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <MetaRow label="קושי" value={item.difficulty} />
        <MetaRow label="חשיבות" value={item.examRelevance} />
        <MetaRow label="מספר" value={item.questionNumber ?? "לא זוהה"} />
      </div>
      <SourceSnippetBlock snippet={item.sourceSnippet} />
    </article>
  );
}

export function ExamPlanSection({ examPlan }: { examPlan: ExamPlanV1 | null }) {
  if (!examPlan) return null;
  const rows = [
    ["ללמוד קודם", examPlan.learnFirst],
    ["חזרה יומית", examPlan.reviewDaily],
    ["לשנן", examPlan.memorize],
    ["לפתור", examPlan.solvePractice],
    ["תרגול הוכחות", examPlan.proofPractice],
    ["אי אפשר לדלג", examPlan.cannotSkip],
  ] as const;
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, values]) => (
        <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">{label}</h2>
          {values.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {values.slice(0, 8).map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">אין מספיק מידע אמין עדיין.</p>
          )}
        </article>
      ))}
    </section>
  );
}

export function MetaRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
