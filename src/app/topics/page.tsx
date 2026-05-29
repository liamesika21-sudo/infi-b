import { EmptyState } from "@/components/Cards";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";

export default async function TopicsPage() {
  const [generatedData, analysis] = await Promise.all([readGeneratedData(), readAnalysisData()]);
  const priorityByTopic = new Map(analysis.examPriorityMap?.topics.map((topic) => [topic.topicId, topic]) ?? []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Topic Map</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">מפת נושאים</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
          הנושאים כאן מזוהים מטקסט שחולץ בפועל מהחומרים. זה עדיין זיהוי היוריסטי, לא מבנה סופי של הקורס.
        </p>
      </section>

      {!generatedData.hasGeneratedData ? (
        <EmptyState
          title="עדיין אין נושאים מעובדים"
          body="הריצי npm run process:calculus2 כדי לחלץ טקסט וליצור topic-map.json."
        />
      ) : generatedData.topicMap.length === 0 ? (
        <EmptyState
          title="לא זוהו נושאים מהטקסט שחולץ"
          body="בדקי את /dev/extraction. ייתכן שה-PDFים דורשים OCR או שהמילים אינן מזוהות טוב בחילוץ."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generatedData.topicMap.map((topic) => (
            <article key={topic.topicId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">{topic.title}</h2>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {Math.round(topic.confidence * 100)}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">שבועות</p>
                  <p className="mt-1 font-mono text-slate-950">
                    {topic.detectedInWeeks.length > 0 ? topic.detectedInWeeks.join(", ") : "לא שויך"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">קבצי מקור</p>
                  <p className="mt-1 font-mono text-slate-950">{topic.detectedInFiles.length}</p>
                </div>
              </div>
              {priorityByTopic.has(topic.topicId) ? (
                <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-white">
                  <p className="text-xs font-semibold text-slate-300">עדיפות מבחן</p>
                  <p className="mt-1 text-sm font-semibold">
                    {priorityByTopic.get(topic.topicId)?.priorityLevel} · {priorityByTopic.get(topic.topicId)?.priorityScore}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">
                    {priorityByTopic.get(topic.topicId)?.recommendedAction}
                  </p>
                </div>
              ) : null}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">מילות זיהוי</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topic.aliases.slice(0, 5).map((alias) => (
                    <span key={alias} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
              {topic.sourceSnippets?.[0] ? (
                <p className="mt-4 line-clamp-4 rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">
                  {topic.sourceSnippets[0]}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
