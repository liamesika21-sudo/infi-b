import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";

export default async function PastExamsPage() {
  const analysis = await readAnalysisData();
  const pastExamQuestions = analysis.questionBank.filter((question) => question.sourceType === "past_exam");
  const examBySourceFile = new Map(analysis.pastExamAnalysis.map((exam) => [exam.sourceFileId, exam]));
  const topicTitles = new Map<string, string>();
  for (const topic of analysis.examPriorityMap?.topics ?? []) topicTitles.set(topic.topicId, topic.title);
  for (const topic of analysis.pastExamAggregate?.topicFrequency ?? []) topicTitles.set(topic.topicId, topic.title);
  const groupedQuestions = groupPastExamQuestions(pastExamQuestions, topicTitles);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Past Exams"
        title="מבחני עבר"
        description="ניתוח מבחני עבר 2022–2025: נושאים חוזרים, תדירות ודפוסים. מבחני עבר: מועד א׳ ומועד ב׳."
      />

      {!analysis.pastExamAggregate ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            אין עדיין ניתוח מבחנים. הריצי npm run analyze:calculus2.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Topic frequency */}
            <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                נושאים בתדירות גבוהה
              </h2>
              <div className="space-y-2">
                {analysis.pastExamAggregate.topicFrequency.slice(0, 10).map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{topic.title}</span>
                    <span
                      className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white"
                      style={{ background: "var(--navy)" }}
                    >
                      {topic.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Likely Moed A */}
            <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                צפוי במועד א׳
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.pastExamAggregate.likelyMoedATopics.slice(0, 12).map((topic) => (
                  <span key={topic} className="badge badge-navy-light">{topic}</span>
                ))}
              </div>

              {analysis.pastExamAggregate.dangerZones.length > 0 && (
                <StudyCallout variant="warning" className="mt-4">
                  <strong>אזורי סיכון:</strong> {analysis.pastExamAggregate.dangerZones.join(" · ")}
                </StudyCallout>
              )}
            </section>
          </div>

          {/* Question references from past exams */}
          {pastExamQuestions.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                שאלות ממבחני עבר לפי נושא
              </h2>
              <p className="mb-4 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                מוצגים רק מספרי השאלות והמועד, בלי טקסט השאלה עצמו.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {groupedQuestions.map((group) => (
                  <article
                    key={group.topicId}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                        {group.title}
                      </h3>
                      <span className="badge badge-navy-light">{group.questions.length} שאלות</span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {group.questions.slice(0, 18).map((question) => {
                        const exam = examBySourceFile.get(question.sourceFileId);
                        return (
                          <div
                            key={question.id}
                            className="rounded-lg border px-3 py-2.5"
                            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                שאלה {question.questionNumber ?? "לא זוהתה"}
                              </span>
                              <span className="badge badge-muted">{question.examRelevance}</span>
                            </div>
                            <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                              {formatExamLabel(exam?.filename ?? question.sourceSnippet.filename, exam?.examYear, exam?.moed)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type PastExamQuestion = Awaited<ReturnType<typeof readAnalysisData>>["questionBank"][number];

function groupPastExamQuestions(questions: PastExamQuestion[], topicTitles: Map<string, string>) {
  const groups = new Map<string, { topicId: string; title: string; questions: PastExamQuestion[] }>();

  for (const question of questions) {
    const topicIds = question.topicIds.length > 0 ? question.topicIds : ["unclassified"];
    for (const topicId of topicIds) {
      const title = topicId === "unclassified" ? "לא מסווג עדיין" : topicTitles.get(topicId) ?? topicId;
      const group = groups.get(topicId) ?? { topicId, title, questions: [] };
      group.questions.push(question);
      groups.set(topicId, group);
    }
  }

  return [...groups.values()].sort((a, b) => b.questions.length - a.questions.length);
}

function formatExamLabel(filename: string, examYear?: number, moed?: "A" | "B" | "unknown") {
  const inferredYear = examYear ?? filename.match(/20\d{2}/)?.[0];
  const inferredMoed = moed && moed !== "unknown" ? `מועד ${moed === "A" ? "א׳" : "ב׳"}` : inferMoedFromFilename(filename);
  const parts = [inferredYear, inferredMoed].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : filename.replace(/\.pdf$/i, "");
}

function inferMoedFromFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (/(moed|term)[\s_-]*a|מועד\s*א/.test(lower)) return "מועד א׳";
  if (/(moed|term)[\s_-]*b|מועד\s*ב/.test(lower)) return "מועד ב׳";
  return null;
}
