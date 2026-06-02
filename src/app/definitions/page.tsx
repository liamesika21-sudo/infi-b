import { DEFINITIONS, CATEGORY_LABELS } from "@/lib/calculus2/definitions-data";
import { DefinitionsClient } from "./DefinitionsClient";

export default function DefinitionsPage() {
  const categoryCount = Object.fromEntries(
    Object.keys(CATEGORY_LABELS).map((cat) => [
      cat,
      DEFINITIONS.filter((d) => d.category === cat).length,
    ]),
  );

  return (
    <div className="space-y-8">
      {/* Hero — minimal text-only */}
      <div className="pb-7 border-b" style={{ borderColor: "var(--border)" }}>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Definitions Bank
        </p>
        <h1
          className="text-4xl font-black mb-3"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: "1.15" }}
        >
          מאגר הגדרות
        </h1>
        <p className="text-base max-w-2xl" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
          כל הגדרות הקורס עם הגדרה פורמלית, הסבר אינטואיטיבי, מתי להשתמש, דוגמה וטעות נפוצה.
          מחליף את הצורך לחפש בתרגולי PDF.
        </p>

        {/* Category chips */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <span
              key={cat}
              className="rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {label} ({categoryCount[cat]})
            </span>
          ))}
        </div>
      </div>

      {/* Client search + list */}
      <DefinitionsClient />
    </div>
  );
}
