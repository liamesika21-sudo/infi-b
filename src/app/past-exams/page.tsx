import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { getHebrewPastExamHref, hebrewPastExams } from "@/lib/calculus2/past-exams-hebrew";
import { StudyCallout } from "@/components/study/StudyCallout";
import { ExternalLink, FileText } from "lucide-react";
import { PastExamSidebar } from "@/components/PastExamSidebar";

export const dynamic = "force-dynamic";

export default async function PastExamsPage() {
  const analysis = await readAnalysisData();
  const pastExamQuestions = analysis.questionBank.filter((question) => question.sourceType === "past_exam");
  const examBySourceFile = new Map(analysis.pastExamAnalysis.map((exam) => [exam.sourceFileId, exam]));
  const topicTitles = new Map<string, string>();
  for (const topic of analysis.examPriorityMap?.topics ?? []) topicTitles.set(topic.topicId, topic.title);
  for (const topic of analysis.pastExamAggregate?.topicFrequency ?? []) topicTitles.set(topic.topicId, topic.title);
  const groupedQuestions = groupPastExamQuestions(pastExamQuestions, topicTitles);

  return (
    <div className="flex gap-6 items-start">

      {/* ── Sticky sidebar — desktop only ── */}
      <PastExamSidebar />

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1 space-y-6">

        {/* Page header */}
        <div className="pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Past Exams
          </p>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            מבחני עבר
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            ניתוח מבחני עבר 2022–2025: נושאים חוזרים, תדירות ודפוסים.
          </p>
        </div>

        {/* ── Mobile exam links ── */}
        <section className="lg:hidden">
          <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            מבחנים — PDF בעברית
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {hebrewPastExams.map((exam) => (
              <a
                key={exam.filename}
                href={getHebrewPastExamHref(exam.filename)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition hover:shadow-sm"
                style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" style={{ color: "var(--navy-mid)" }} />
                  {exam.title}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              </a>
            ))}
          </div>
        </section>

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
                  {analysis.pastExamAggregate.topicFrequency.slice(0, 10).map((topic, i) => (
                    <div
                      key={topic.topicId}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5"
                      style={{ background: i < 3 ? "var(--navy-light)" : "var(--bg-subtle)" }}
                    >
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {topic.title}
                      </span>
                      <span
                        className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white"
                        style={{ background: i < 3 ? "var(--navy)" : "var(--text-muted)" }}
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
                <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  מוצגים מספרי שאלות, מועד ושנה — ללא טקסט השאלה.
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {groupedQuestions.map((group) => (
                    <article
                      key={group.topicId}
                      className="rounded-xl border bg-white p-5 shadow-sm"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                          {group.title}
                        </h3>
                        <span className="badge badge-navy-light">{group.questions.length} שאלות</span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
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
                                  שאלה {question.questionNumber ?? "?"}
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
