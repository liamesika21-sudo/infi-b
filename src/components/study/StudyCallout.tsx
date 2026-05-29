import type { ReactNode } from "react";
import { AlertCircle, BookOpen, CheckCircle, Info, Lightbulb, Star, XCircle, Zap } from "lucide-react";

type CalloutVariant = "info" | "success" | "warning" | "error" | "theorem" | "definition" | "tip" | "exam";

interface VariantConfig {
  cls: string;
  iconColor: string;
  icon: ReactNode;
  label?: string;
}

const CONFIGS: Record<CalloutVariant, VariantConfig> = {
  info: {
    cls: "study-callout-base study-callout-blue",
    iconColor: "var(--navy-mid)",
    icon: <Info className="h-4 w-4 shrink-0" />,
  },
  success: {
    cls: "study-callout-base study-callout-green",
    iconColor: "var(--green-mid)",
    icon: <CheckCircle className="h-4 w-4 shrink-0" />,
  },
  warning: {
    cls: "study-callout-base study-callout-amber",
    iconColor: "var(--amber-mid)",
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    label: "שימי לב",
  },
  error: {
    cls: "study-callout-base study-callout-red",
    iconColor: "var(--red-mid)",
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    label: "טעות נפוצה",
  },
  theorem: {
    cls: "study-callout-base study-callout-blue",
    iconColor: "var(--navy-mid)",
    icon: <BookOpen className="h-4 w-4 shrink-0" />,
    label: "משפט",
  },
  definition: {
    cls: "study-callout-base study-callout-green",
    iconColor: "var(--green-mid)",
    icon: <Lightbulb className="h-4 w-4 shrink-0" />,
    label: "הגדרה",
  },
  tip: {
    cls: "study-callout-base study-callout-amber",
    iconColor: "var(--amber-mid)",
    icon: <Star className="h-4 w-4 shrink-0" />,
    label: "טיפ",
  },
  exam: {
    cls: "study-callout-base study-callout-red",
    iconColor: "var(--red-mid)",
    icon: <Zap className="h-4 w-4 shrink-0" />,
    label: "חשוב למבחן",
  },
};

export function StudyCallout({
  variant = "info",
  title,
  children,
  className = "",
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const cfg = CONFIGS[variant];
  const displayTitle = title ?? cfg.label;

  return (
    <div className={`${cfg.cls} ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0" style={{ color: cfg.iconColor }}>
          {cfg.icon}
        </span>
        <div className="min-w-0 flex-1">
          {displayTitle && (
            <p
              className="mb-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: cfg.iconColor, opacity: 0.85 }}
            >
              {displayTitle}
            </p>
          )}
          <div className="text-sm leading-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
      {label && (
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      )}
      <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
    </div>
  );
}
