"use client";

import { getHebrewPastExamHref, hebrewPastExams } from "@/lib/calculus2/past-exams-hebrew";
import { ExternalLink, FileText } from "lucide-react";

export function PastExamSidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col gap-1 shrink-0 sticky self-start"
      style={{ width: 192, top: 68 }}
    >
      <p
        className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        מועדים — PDF
      </p>

      {hebrewPastExams.map((exam) => {
        const moedA = exam.moed === "מועד א׳";
        const isSimulation = exam.moed === "סימולציה";

        return (
          <a
            key={exam.filename}
            href={getHebrewPastExamHref(exam.filename)}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
            style={{
              color: moedA ? "var(--navy-mid)" : isSimulation ? "var(--teal)" : "var(--text-secondary)",
              background: moedA
                ? "var(--navy-light)"
                : isSimulation
                  ? "var(--teal-light, rgba(0,105,92,0.08))"
                  : "var(--bg-subtle)",
              border: `1px solid ${moedA ? "var(--navy-border)" : "var(--border)"}`,
            }}
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate">{exam.title}</span>
            </span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
        );
      })}

      <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />
      <p className="px-2 text-[10px] leading-5" style={{ color: "var(--text-muted)" }}>
        ללא פתרונות · עברית בלבד
      </p>
    </aside>
  );
}
