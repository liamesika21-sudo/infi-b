import katex from "katex";
import "katex/dist/katex.min.css";
import lectureKnowledgeRaw from "@/../data/generated/calculus2/lecture-knowledge.json";

/* ──────────────────────────────────────────────────────────────────────────
   Renders the official, word-for-word definitions and theorems extracted from
   the handwritten lectures (data/generated/calculus2/lecture-knowledge.json).
   Statements contain Hebrew prose with inline $...$ / display $$...$$ LaTeX.
   ────────────────────────────────────────────────────────────────────────── */

interface KItem {
  kind: "definition" | "theorem" | "corollary" | "lemma" | "note" | "example" | "exercise";
  label: string;
  number: string | null;
  name: string;
  statement_he: string;
  proof_he: string | null;
  topic: string;
}
interface Lecture {
  lecture: number;
  week: number;
  verified?: boolean;
  date: string | null;
  topics: string[];
  items: KItem[];
}

const LECTURES = lectureKnowledgeRaw as Lecture[];

const COLORS = {
  blue: "#1565c0",
  red: "#c0392b",
  green: "#2e7d32",
  navy: "#1a3a5c",
  border: "#e0d6c8",
};

function renderOne(math: string, display: boolean): string | null {
  try {
    return katex.renderToString(math.trim(), {
      displayMode: display,
      throwOnError: false,
      strict: false, // statements may legitimately contain Hebrew inside \text{...}
    });
  } catch {
    return null;
  }
}

/** Convert a statement (Hebrew + $...$/$$...$$) into safe HTML with KaTeX. */
function statementToHtml(text: string): string {
  let html = text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, m: string) => {
      const r = renderOne(m, true);
      return r
        ? `<div dir="ltr" style="text-align:center;margin:8px 0;overflow-x:auto">${r}</div>`
        : `$$${m}$$`;
    })
    .replace(/\$([^$\n]+?)\$/g, (_, m: string) => {
      const r = renderOne(m, false);
      return r
        ? `<span dir="ltr" style="display:inline-block;unicode-bidi:isolate;vertical-align:middle">${r}</span>`
        : `$${m}$`;
    });
  // Preserve line breaks from the original statement.
  html = html.replace(/\n/g, "<br/>");
  return html;
}

const KIND_STYLE: Record<KItem["kind"], { accent: string; bg: string }> = {
  definition: { accent: COLORS.red, bg: "#fef9f0" },
  theorem: { accent: COLORS.blue, bg: "#f0f4fe" },
  corollary: { accent: COLORS.blue, bg: "#f0f4fe" },
  lemma: { accent: COLORS.blue, bg: "#f0f4fe" },
  note: { accent: "#d97706", bg: "#fffbeb" },
  example: { accent: "#6a1b9a", bg: "#faf0fa" },
  exercise: { accent: "#6a1b9a", bg: "#faf0fa" },
};

function ItemBox({ item, showProof }: { item: KItem; showProof?: boolean }) {
  const { accent, bg } = KIND_STYLE[item.kind] ?? KIND_STYLE.theorem;
  return (
    <div
      style={{
        background: bg,
        borderRight: `4px solid ${accent}`,
        borderRadius: 8,
        padding: "14px 18px",
        margin: "12px 0",
      }}
    >
      <div style={{ color: accent, fontWeight: 700, marginBottom: 4 }}>
        {item.label}
        {item.name ? ` — ${item.name}` : ""}
      </div>
      <div
        style={{ lineHeight: 1.9 }}
        dangerouslySetInnerHTML={{ __html: statementToHtml(item.statement_he) }}
      />
      {showProof && item.proof_he && (
        <div
          style={{
            background: "#ecfdf5",
            borderRight: `3px solid ${COLORS.green}`,
            borderRadius: 6,
            padding: "10px 14px",
            marginTop: 10,
          }}
        >
          <div style={{ color: COLORS.green, fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>
            הוכחה
          </div>
          <div
            style={{ lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: statementToHtml(item.proof_he) }}
          />
        </div>
      )}
    </div>
  );
}

function LectureBadge({ lec }: { lec: Lecture }) {
  return (
    <div
      style={{
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "#fff",
        background: COLORS.navy,
        display: "inline-block",
        borderRadius: 999,
        padding: "2px 12px",
        marginBottom: 6,
      }}
    >
      הרצאה {lec.lecture}
      {lec.date ? ` · ${lec.date}` : ""}
      {lec.topics?.length ? ` — ${lec.topics.slice(0, 3).join(", ")}` : ""}
    </div>
  );
}

/**
 * Rich, in-order rendering used for verified lectures: every item (definition,
 * note, theorem + proof, example, exercise) shown exactly in lecture order.
 */
function LectureGroupFull({ lec }: { lec: Lecture }) {
  if (!lec.items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <LectureBadge lec={lec} />
      {lec.items.map((it, i) => (
        <ItemBox key={i} item={it} showProof />
      ))}
    </div>
  );
}

function LectureGroup({ lec, kinds }: { lec: Lecture; kinds: KItem["kind"][] }) {
  const items = lec.items.filter((it) => kinds.includes(it.kind));
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <LectureBadge lec={lec} />
      {items.map((it, i) => (
        <ItemBox key={i} item={it} showProof={lec.verified} />
      ))}
    </div>
  );
}

/** All definitions across every lecture, grouped by lecture, word-for-word. */
export function AllLectureDefinitions() {
  return (
    <div dir="rtl">
      {LECTURES.map((lec) => (
        <LectureGroup key={lec.lecture} lec={lec} kinds={["definition"]} />
      ))}
    </div>
  );
}

/** All theorems/corollaries/lemmas across every lecture, grouped by lecture. */
export function AllLectureTheorems() {
  return (
    <div dir="rtl">
      {LECTURES.map((lec) => (
        <LectureGroup key={lec.lecture} lec={lec} kinds={["theorem", "corollary", "lemma"]} />
      ))}
    </div>
  );
}

/**
 * Renders all definitions + theorems (word-for-word from the lectures) that
 * belong to a given site "week". A week may aggregate several lectures.
 */
export function LectureKnowledgeForWeek({ week }: { week: number }) {
  const lectures = LECTURES.filter((l) => l.week === week);
  if (!lectures.length) return null;

  const hasContent = lectures.some((l) =>
    l.items.some((it) => it.kind === "definition" || it.kind === "theorem" || it.kind === "corollary")
  );
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        style={{
          color: COLORS.navy,
          fontSize: "1.05rem",
          fontWeight: 700,
          marginBottom: 10,
          paddingRight: 10,
          borderRight: `3px solid ${COLORS.navy}`,
        }}
      >
        📖 הגדרות, משפטים והוכחות — מתוך ההרצאות (מלא, לפי מספור)
      </h3>
      {lectures.map((lec) =>
        lec.verified ? (
          <LectureGroupFull key={lec.lecture} lec={lec} />
        ) : (
          <LectureGroup
            key={lec.lecture}
            lec={lec}
            kinds={["definition", "theorem", "corollary", "lemma"]}
          />
        )
      )}
    </div>
  );
}
