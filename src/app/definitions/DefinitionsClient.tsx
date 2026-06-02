"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, ChevronDown, ChevronUp, X } from "lucide-react";
import { MathContent } from "@/components/study/MathContent";
import {
  DEFINITIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type DefinitionCategory,
  type DefinitionEntry,
} from "@/lib/calculus2/definitions-data";

export function DefinitionsClient() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DefinitionCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["all", ...Object.keys(CATEGORY_LABELS)] as ("all" | DefinitionCategory)[],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEFINITIONS.filter((def) => {
      const categoryMatch = selectedCategory === "all" || def.category === selectedCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      return (
        def.termHe.toLowerCase().includes(q) ||
        def.term.toLowerCase().includes(q) ||
        def.formal.toLowerCase().includes(q) ||
        def.intuitive.toLowerCase().includes(q) ||
        def.whenUsed.toLowerCase().includes(q)
      );
    });
  }, [query, selectedCategory]);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
          style={{ right: "1rem", color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="חיפוש הגדרה... (עברית / אנגלית)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border px-5 py-3.5 pr-12 text-sm outline-none transition focus:ring-2"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            direction: "rtl",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute top-1/2 -translate-y-1/2 left-3"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const colors = cat !== "all" ? CATEGORY_COLORS[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full px-4 py-1.5 text-xs font-bold transition"
              style={
                isActive
                  ? {
                      background: colors ? colors.text : "var(--navy-mid)",
                      color: "#fff",
                      border: "1.5px solid transparent",
                    }
                  : {
                      background: colors ? colors.bg : "var(--bg-subtle)",
                      color: colors ? colors.text : "var(--text-secondary)",
                      border: `1.5px solid ${colors ? colors.border : "var(--border)"}`,
                    }
              }
            >
              {cat === "all" ? `הכל (${DEFINITIONS.length})` : CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          נמצאו {filtered.length} הגדרות
        </p>
      )}

      {/* Definitions list */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed p-10 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            לא נמצאו הגדרות לחיפוש הנוכחי.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((def) => (
            <DefinitionCard
              key={def.id}
              def={def}
              expanded={expandedId === def.id}
              onToggle={() => toggle(def.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DefinitionCard({
  def,
  expanded,
  onToggle,
}: {
  def: DefinitionEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = CATEGORY_COLORS[def.category];

  return (
    <article className="definition-card">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-right definition-card-header flex items-start justify-between gap-3"
        style={{ cursor: "pointer" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="definition-tag"
              style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
            >
              {CATEGORY_LABELS[def.category]}
            </span>
            {def.weekNumbers.map((w) => (
              <span
                key={w}
                className="definition-tag"
                style={{
                  background: "var(--bg-inset)",
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                }}
              >
                שבוע {w}
              </span>
            ))}
          </div>
          <h3
            className="text-base font-black"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
          >
            {def.termHe}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {def.term}
          </p>
        </div>
        <span className="shrink-0 mt-1" style={{ color: "var(--text-muted)" }}>
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {/* Body — expanded */}
      {expanded && (
        <div className="definition-card-body space-y-4">
          {/* Intuitive */}
          <Section label="הסבר אינטואיטיבי" color={colors.text}>
            <MathContent text={def.intuitive} className="text-sm" />
          </Section>

          {/* Formal */}
          <Section label="הגדרה פורמלית" color="var(--navy-mid)">
            <div
              className="rounded-xl border px-4 py-3 mt-1"
              style={{
                borderColor: "var(--navy-border)",
                background: "var(--navy-light)",
              }}
            >
              <MathContent text={def.formal} className="text-sm" />
            </div>
          </Section>

          {/* When used */}
          <Section label="מתי משתמשים?" color="var(--teal)">
            <MathContent text={def.whenUsed} className="text-sm" />
          </Section>

          {/* Example */}
          <Section label="דוגמה" color="var(--green)">
            <div
              className="rounded-xl border px-4 py-3 mt-1"
              style={{
                borderColor: "var(--green-border)",
                background: "var(--green-light)",
              }}
            >
              <MathContent text={def.example} className="text-sm" />
            </div>
          </Section>

          {/* Common mistake */}
          {def.commonMistake && (
            <Section label="טעות נפוצה" color="var(--red-mid)">
              <div
                className="rounded-xl border-r-4 px-4 py-3 mt-1"
                style={{
                  borderColor: "var(--red-mid)",
                  background: "var(--red-light)",
                }}
              >
                <MathContent text={def.commonMistake} className="text-sm" />
              </div>
            </Section>
          )}

          {/* Related */}
          {def.relatedIds.length > 0 && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                קשורים
              </p>
              <div className="flex flex-wrap gap-1.5">
                {def.relatedIds.map((relId) => {
                  const related = DEFINITIONS.find((d) => d.id === relId);
                  if (!related) return null;
                  return (
                    <span
                      key={relId}
                      className="rounded-full px-3 py-1 text-xs font-semibold cursor-default"
                      style={{
                        background: "var(--bg-subtle)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {related.termHe}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source weeks link */}
          {def.recitationNumbers.length > 0 && (
            <p className="text-xs pt-1 border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
              <BookOpen className="inline h-3.5 w-3.5 ml-1" />
              מופיע בתרגולים: {def.recitationNumbers.map((r) => `תרגול ${r}`).join(", ")}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Section({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-xs font-black uppercase tracking-widest mb-1"
        style={{ color }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
