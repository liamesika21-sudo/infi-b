"use client";

import { useState } from "react";
import { MathContent } from "./MathContent";
import type { DecisionNode } from "@/lib/calculus2/week-rich-content";

const COLOR_MAP = {
  green: { bg: "var(--green-light)", border: "var(--green-border)", text: "var(--green)" },
  red:   { bg: "var(--red-light)",   border: "var(--red-border)",   text: "var(--red-mid)" },
  amber: { bg: "var(--amber-light)", border: "var(--amber-border)", text: "var(--amber-mid)" },
};

export function DecisionTree({ root }: { root: DecisionNode }) {
  return (
    <div dir="rtl" className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <TreeNode node={root} depth={0} />
      </div>
    </div>
  );
}

function TreeNode({ node, depth }: { node: DecisionNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);

  const hasChildren = node.yes?.next || node.no?.next;

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Question box */}
      <button
        onClick={() => hasChildren && setExpanded((e) => !e)}
        className="rounded-xl border px-5 py-3 text-sm font-bold text-center transition"
        style={{
          borderColor: "var(--navy-border)",
          background: depth === 0 ? "var(--navy)" : "var(--navy-light)",
          color: depth === 0 ? "#fff" : "var(--navy-mid)",
          minWidth: "220px",
          maxWidth: "340px",
          cursor: hasChildren ? "pointer" : "default",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <MathContent text={node.question} className="text-sm" />
        {node.info && (
          <p
            className="mt-1 text-xs font-normal"
            style={{ color: depth === 0 ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
          >
            {node.info}
          </p>
        )}
      </button>

      {/* Branches */}
      {expanded && (
        <div className="flex flex-col sm:flex-row items-start gap-6 mt-0 relative">
          {/* Vertical line down */}
          <div
            className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-px"
            style={{ height: "24px", background: "var(--border-strong)" }}
          />

          {/* YES branch */}
          {node.yes && (
            <BranchColumn
              branch={node.yes}
              label="כן ✓"
              labelColor="var(--green)"
              side="yes"
            />
          )}

          {/* NO branch */}
          {node.no && (
            <BranchColumn
              branch={node.no}
              label="לא ✗"
              labelColor="var(--red-mid)"
              side="no"
            />
          )}
        </div>
      )}
    </div>
  );
}

function BranchColumn({
  branch,
  label,
  labelColor,
}: {
  branch: { label: string; next?: DecisionNode; conclusion?: string; conclusionColor?: "green" | "red" | "amber" };
  label: string;
  labelColor: string;
  side: "yes" | "no";
}) {
  const colors = branch.conclusionColor ? COLOR_MAP[branch.conclusionColor] : null;

  return (
    <div className="flex flex-col items-center gap-2 mt-6 min-w-[200px]">
      {/* Arrow + label */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-5" style={{ background: "var(--border-strong)" }} />
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-black"
          style={{ background: "var(--bg-subtle)", color: labelColor, border: `1px solid ${labelColor}` }}
        >
          {label}
        </span>
        <div className="w-px h-2" style={{ background: "var(--border-strong)" }} />
        {/* Branch label */}
        <p className="text-xs text-center font-semibold" style={{ color: "var(--text-secondary)" }}>
          <MathContent text={branch.label} className="text-xs" />
        </p>
        <div className="w-px h-3" style={{ background: "var(--border-strong)" }} />
        <span style={{ color: "var(--border-strong)", fontSize: "1rem" }}>↓</span>
      </div>

      {/* Conclusion leaf */}
      {branch.conclusion && colors && (
        <div
          className="rounded-xl border px-4 py-2.5 text-sm font-black text-center"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            color: colors.text,
            minWidth: "160px",
          }}
        >
          {branch.conclusion}
        </div>
      )}

      {/* Recurse */}
      {branch.next && <TreeNode node={branch.next} depth={1} />}
    </div>
  );
}
