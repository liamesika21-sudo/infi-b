import type { ReactNode } from "react";
import { BookOpen, ChevronDown, FileQuestion, FlaskConical } from "lucide-react";
import type { QuestionItem } from "@/lib/calculus2/analysis-types";
import { QuestionBlockClient } from "@/components/QuestionBlockClient";

interface SourceGroup {
  id: string;
  anchorId: string;
  label: string;
  sublabel: string;
  type: "recitation" | "homework" | "past_exam";
  sortKey: number;
  questions: QuestionItem[];
}

const RECITATION_TOPICS: Record<number, string> = {
  1: "לופיטל ודרבו",
  2: "סדרות",
  3: "אינטגרלים לא מסוימים",
  4: "אינטגרלים מסוימים",
  5: "אינטגרלים לא אמיתיים",
  6: "טורים בסיסיים",
  7: "מבחני התכנסות",
  8: "התכנסות מוחלטת",
  9: "טורי חזקות",
  10: "מקלורן וטיילור",
};

const HOMEWORK_TOPICS: Record<number, string> = {
  1: "גבולות",
  2: "סדרות ונגזרות",
  3: "אינטגרלים לא מסוימים",
  4: "אינטגרלים מסוימים",
  5: "אינטגרלים לא אמיתיים",
  6: "טורים",
  7: "טורי חזקות",
};

const TYPE_SECTIONS: Array<{ type: SourceGroup["type"]; title: string }> = [
  { type: "recitation", title: "תרגולים" },
  { type: "homework", title: "מטלות" },
  { type: "past_exam", title: "מבחני עבר" },
];

const TYPE_ICON: Record<SourceGroup["type"], ReactNode> = {
  recitation: <FlaskConical className="h-4 w-4" />,
  homework: <BookOpen className="h-4 w-4" />,
  past_exam: <FileQuestion className="h-4 w-4" />,
};

const TYPE_TONE: Record<SourceGroup["type"], { color: string; bg: string; border: string }> = {
  recitation: { color: "var(--teal)", bg: "var(--teal-light)", border: "var(--teal-border)" },
  homework: { color: "var(--gold)", bg: "var(--gold-light)", border: "var(--gold-border)" },
  past_exam: { color: "var(--purple)", bg: "var(--purple-light)", border: "var(--purple-border)" },
};

function parseSourceGroup(fileId: string): Omit<SourceGroup, "id" | "anchorId" | "questions"> | null {
  const recitationMatch =
    fileId.match(/recitation-recitation-(\d+)-/i) ??
    fileId.match(/recitation-script-.*?(?:recitation-|תרגול-)(\d+)/i);

  if (recitationMatch) {
    const n = Number.parseInt(recitationMatch[1], 10);
    return {
      type: "recitation",
      label: `תרגול ${n}`,
      sublabel: RECITATION_TOPICS[n] ?? "",
      sortKey: n,
    };
  }

  const homeworkMatch = fileId.match(/hw-exercise-(\d+)-/i);
  if (homeworkMatch) {
    const n = Number.parseInt(homeworkMatch[1], 10);
    return {
      type: "homework",
      label: `מטלה ${n}`,
      sublabel: HOMEWORK_TOPICS[n] ?? "",
      sortKey: 100 + n,
    };
  }

  if (fileId.startsWith("past-exams-")) {
    const year = fileId.match(/(\d{4})/)?.[1] ?? "";
    const isA = /moeda|moed-a|term-a/i.test(fileId);
    const isB = /moedb|moed-b|term-b/i.test(fileId);
    const isSimulation = /simulation/i.test(fileId);
    const isFormula = /formula/i.test(fileId);
    const isTheoremList = /theorem.*list|list.*theorem/i.test(fileId);
    const isExcluded = /excluded|not.*material/i.test(fileId);

    if (isExcluded) {
      return { type: "past_exam", label: "שאלות שאינן בחומר", sublabel: "", sortKey: 230 };
    }
    if (isFormula) {
      return { type: "past_exam", label: "גיליון נוסחאות", sublabel: year, sortKey: 220 };
    }
    if (isTheoremList) {
      return { type: "past_exam", label: "רשימת משפטים", sublabel: year, sortKey: 221 };
    }
    if (isSimulation) {
      return { type: "past_exam", label: `סימולציה ${year}`, sublabel: "", sortKey: 200 };
    }
    if (isA) {
      return { type: "past_exam", label: `מועד א׳ ${year}`, sublabel: "", sortKey: 150 + (2026 - Number.parseInt(year || "2026", 10)) };
    }
    if (isB) {
      return { type: "past_exam", label: `מועד ב׳ ${year}`, sublabel: "", sortKey: 175 + (2026 - Number.parseInt(year || "2026", 10)) };
    }

    return {
      type: "past_exam",
      label: fileId.replace("past-exams-", "").replace(/-/g, " "),
      sublabel: "",
      sortKey: 199,
    };
  }

  return null;
}

function buildGroups(questions: QuestionItem[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();

  for (const question of questions) {
    const meta = parseSourceGroup(question.sourceFileId);
    if (!meta) continue;

    const existing = groups.get(question.sourceFileId);
    if (existing) {
      existing.questions.push(question);
      continue;
    }

    groups.set(question.sourceFileId, {
      id: question.sourceFileId,
      anchorId: "",
      ...meta,
      questions: [question],
    });
  }

  return Array.from(groups.values())
    .sort((a, b) => a.sortKey - b.sortKey || a.label.localeCompare(b.label, "he"))
    .map((group, index) => ({
      ...group,
      anchorId: `practice-group-${index + 1}`,
    }));
}

export function PracticePageClient({ questions }: { questions: QuestionItem[] }) {
  const groups = buildGroups(questions);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <PracticeSidebar groups={groups} />

      <main className="min-w-0 space-y-8">
        {TYPE_SECTIONS.map(({ type, title }) => {
          const sectionGroups = groups.filter((group) => group.type === type);
          if (!sectionGroups.length) return null;

          return (
            <section key={type} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--border)" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: TYPE_TONE[type].bg, color: TYPE_TONE[type].color }}>
                  {TYPE_ICON[type]}
                </span>
                <h2 className="text-xl font-extrabold">{title}</h2>
              </div>

              {sectionGroups.map((group, index) => (
                <PracticeGroup key={group.id} group={group} defaultOpen={type === "recitation" ? index < 2 : index === 0} />
              ))}
            </section>
          );
        })}
      </main>
    </div>
  );
}

function PracticeSidebar({ groups }: { groups: SourceGroup[] }) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
          <FlaskConical className="h-4 w-4" />
          ניווט תרגול
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:max-h-[calc(100dvh-8rem)] lg:space-y-3 lg:overflow-y-auto lg:pb-0">
          {TYPE_SECTIONS.map(({ type, title }) => {
            const sectionGroups = groups.filter((group) => group.type === type);
            if (!sectionGroups.length) return null;

            return (
              <div key={type} className="contents lg:block">
                <p className="hidden px-2 pb-1 text-[10px] font-black uppercase tracking-widest lg:block" style={{ color: "var(--text-muted)" }}>
                  {title}
                </p>
                <div className="flex gap-2 lg:block lg:space-y-1">
                  {sectionGroups.map((group) => (
                    <a
                      key={group.id}
                      href={`#${group.anchorId}`}
                      className="flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-bold transition hover:bg-[var(--navy-light)] lg:w-full"
                      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    >
                      <span>{group.label}</span>
                      <span className="rounded-full px-1.5 text-[10px] font-black" style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                        {group.questions.length}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function PracticeGroup({ group, defaultOpen }: { group: SourceGroup; defaultOpen: boolean }) {
  const tone = TYPE_TONE[group.type];

  return (
    <details
      id={group.anchorId}
      open={defaultOpen}
      className="group scroll-mt-24 rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: tone.bg, color: tone.color }}>
            {TYPE_ICON[group.type]}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="text-xl font-extrabold">{group.label}</h3>
              {group.sublabel && (
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  {group.sublabel}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {group.questions.length} שאלות, מסודרות לפי סדר המקור
            </p>
          </div>
        </div>

        <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" style={{ color: "var(--text-muted)" }} />
      </summary>

      <div className="divide-y border-t" style={{ borderColor: "var(--border)" }}>
        {group.questions.map((question, index) => (
          <QuestionBlockClient key={question.id} question={question} index={index} />
        ))}
      </div>
    </details>
  );
}
