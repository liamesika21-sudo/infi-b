# infi-test-b — System Documentation

> Calculus 2 (אינפי ב׳) exam-prep platform for Hebrew-speaking students.  
> Target: מועד א׳ · 01.07.2026 · יעד 90+

---

## Table of Contents

1. [Overview](#overview)
2. [Source Materials](#source-materials)
3. [Data Pipeline](#data-pipeline)
4. [Generated Data Files](#generated-data-files)
5. [TypeScript Types](#typescript-types)
6. [Application Routes](#application-routes)
7. [Key Components](#key-components)
8. [Manual / Rich Content](#manual--rich-content)
9. [Instructor Insights (Max)](#instructor-insights-max)
10. [Architecture Notes](#architecture-notes)

---

## Overview

This is a Next.js App Router project (custom/modified version — see `AGENTS.md`). The platform:

- Ingests raw academic PDFs (lectures, recitations, homework, past exams, summaries)
- Runs a 3-stage AI pipeline to extract and synthesize knowledge
- Serves that knowledge through a rich study interface

Tech stack: Next.js · TypeScript · Tailwind CSS · KaTeX (LaTeX math) · lucide-react icons · RTL (Hebrew)

---

## Source Materials

All source documents live under `docs/`:

### `docs/lecture/` — 9 PDFs
Scanned lecture notes, quality varies (OCR reliability: low–medium):

| File | Lecture |
|------|---------|
| `Lecture 1 group 1 calculus 2 2026.pdf` | Lecture 1 |
| `Lecture 2 group 1 calculus 2 2026.pdf` | Lecture 2 |
| `Lecture 3 group 2 calculus 2 2026 .pdf` | Lecture 3 |
| `Lecture 4 group 1 calculus 2 2026.pdf` | Lecture 4 |
| `Lecture 5 group 2 calculus 2 2026.pdf` | Lecture 5 |
| `Lecture 6 group 2 calculus 2 2026.pdf` | Lecture 6 |
| `Lecture 7 group 2 calculus 2 2026.pdf` | Lecture 7 |
| `Lecture 8 group  1 calculus 2 2026.pdf` | Lecture 8 |
| `Lecture 9 group 2 calculus 2 2026.pdf` | Lecture 9 |

### `docs/recitation/` — 9 PDFs + 8 clean Markdown transcripts

PDFs: `Recitation 1-Hebrew (1).pdf` through `Recitation_9-Hebrew.pdf`

Clean Markdown transcripts (in `recitation/script/`) — **high quality, best source for AI analysis**:

| File | Content |
|------|---------|
| `recitation1_transcript_clean_copy.md` | Recitation 1 |
| `recitation2_sequences_heine.md` | Recitation 2 — sequences, Heine theorem |
| `recitation3_transcript_clean_copy.md` | Recitation 3 |
| `recitation_clean_markdown4.md` | Recitation 4 |
| `recitation5_improper_integrals.md` | Recitation 5 — improper integrals |
| `recitation6_series.md` | Recitation 6 — series |
| `recitation7_transcript_clean_copy.md` | Recitation 7 |
| `recitation8_transcript_clean_copy.md` | Recitation 8 |

### `docs/hw/` — 7 PDFs
Homework exercise solutions:

`Exercise 1 solution.pdf` … `Exercise 7 solution.pdf`

### `docs/past-exams/` — 12 PDFs
Past Moed A & B exams with solutions (2022–2025), plus formula sheets and theorem lists:

- `MoedA_2022_eng_solution.pdf` … `MoedA_calculus2_2025 solution.pdf`
- `MoedB_2022_solutions.pdf` … `MoedB_calculus2_2025_solutions.pdf`
- `Simulation_calculus2_2025_solutions.pdf`
- `formula_sheets_2025.pdf`
- `list_of_theorems_quiz1.pdf`, `list of theorems quiz 2 2026.pdf`
- `Exam questions that are not in the marerial for our exam.pdf`

### `docs/summerize/` — Lecture summary PDFs + `sum-lecture/`
7 professionally written lecture summaries (PDF):

`סיכום אינפי 2 הרצאה 1.pdf` … `סיכום אינפי 2 הרצאה 7.pdf`

---

## Data Pipeline

Three npm scripts form the pipeline. Run them in order when source material changes.

```
npm run process:calculus2     # Step 1 — OCR/extract raw text from PDFs
npm run analyze:calculus2     # Step 2 — AI analysis + generate extended data
npm run generate:simulations  # Step 3 — Generate simulation exams (subset of step 2)
```

### Step 1 — `scripts/process-calculus2.ts`
- Reads all PDFs from `docs/`
- Extracts text (OCR)
- Writes `data/generated/calculus2/processing-summary.json` and `source-files.json`
- Also creates `extracted-text-index.json` mapping file IDs → raw text

### Step 2 — `scripts/analyze-calculus2.ts` + `scripts/generate-extended-data.ts`
- Calls Claude AI (via `src/lib/calculus2/ai-analysis.ts`) on extracted text
- Produces all the major analysis JSONs (lecture, recitation, homework, past exams)
- `generate-extended-data.ts` synthesizes cross-cutting views (formulas, theorems, topic-map, week-map, mentor KB, etc.)

### Step 3 — `scripts/generate-extended-data.ts`
- Generates `simulation-exams.json` from the analyzed question bank

**Key library modules** (`src/lib/calculus2/`):

| File | Purpose |
|------|---------|
| `analysis-types.ts` | All TypeScript interfaces for the data schema |
| `types.ts` | Shared primitive types (ExamImportance, SourceType, etc.) |
| `analysis-reader.ts` | Reads generated JSON files, provides typed access |
| `generated-data.ts` | Central data loader used by pages |
| `config.ts` | Pipeline configuration (paths, model settings) |
| `prompts.ts` | AI prompts for each analysis stage |
| `ai-analysis.ts` | Claude API wrapper |
| `agents.ts` | Multi-agent orchestration |
| `week-rich-content.ts` | Manual pedagogical content for weeks 7–9 |
| `week-summaries.ts` | Summary text per week |
| `study-guides.ts` | Generated study guide helpers |
| `intuition-map.ts` | Data for the intuition map page |
| `definitions-data.ts` | Definitions page data |
| `content-parser.ts` | Markdown/math parsing utilities |
| `mapping.ts` | Maps between IDs and display items |
| `scoring.ts` | Exam-readiness scoring logic |
| `index.ts` | Barrel export |

---

## Generated Data Files

All in `data/generated/calculus2/`. These are the files the app reads at runtime.

| File | Description |
|------|-------------|
| `source-files.json` | Index of all source PDFs with file IDs |
| `extracted-text-index.json` | Raw extracted text keyed by source file ID |
| `processing-summary.json` | Pipeline run metadata and file stats |
| `lecture-analysis.json` | Per-lecture analysis: definitions, theorems, formulas, proof patterns, examples |
| `lecture-summaries.json` | Condensed per-lecture summaries (9 entries, see below) |
| `recitation-analysis.json` | Per-recitation analysis: questions, solution patterns, techniques, common mistakes |
| `recitation-summaries.json` | Condensed recitation summaries |
| `summary-analysis.json` | Analysis of the provided lecture summary PDFs |
| `homework-analysis.json` | Per-exercise analysis |
| `homework-priority-map.json` | Homework questions ranked by exam relevance |
| `past-exam-analysis.json` | Per past-exam question/solution analysis |
| `past-exam-aggregate.json` | Aggregated topic frequency and pattern data across all past exams |
| `formula-bank.json` | All formulas with LaTeX, conditions, exam importance |
| `theorem-bank.json` | All theorems with statements, assumptions, proof requirements |
| `proof-pattern-bank.json` | Proof technique patterns (e.g. "comparison test strategy") |
| `question-bank.json` | All practice questions from all sources |
| `topic-map.json` | Hierarchy of course topics with relationships |
| `week-map.json` | Per-week structure (13 weeks) |
| `exam-priority-map.json` | Topics and formulas ranked by exam probability |
| `exam-plan.json` | Study plan recommendations |
| `simulation-exams.json` | AI-generated simulation exam sets |
| `mentor-knowledge-base.json` | Mentor chat knowledge base (formulas + theorems + exam plan) |
| `max-insights.json` | Instructor (Max) insights: intuitions, counter-examples, weekly insights |

### `lecture-summaries.json` — 9 entries

| # | Week | Title |
|---|------|-------|
| 1 | 1 | גבולות — כלל לופיטל ומשפט דרבו |
| 2 | 2 | סדרות — הגדרה, גבולות, מונוטוניות |
| 3 | 3 | נגזרות — מסדר גבוה, MVT, ופיתוח טיילור |
| 4 | 4 | אינטגרל מסוים — הגדרה, תכונות, ומשפט היסודי |
| 5 | 5 | אינטגרלים לא מסוימים — שיטות חישוב |
| 6 | 6 | טורים — הגדרה ומבחני התכנסות בסיסיים |
| 7 | 7 | טורים — מבחן מנה, שורש, ולייבניץ |
| 8 | 8 | טורי חזקות — הגדרה, רדיוס, תחום התכנסות |
| 9 | 9 | טורי טיילור ומקלורן |

Each entry has: `lectureNumber`, `weekNumber`, `title`, `mainTopics[]`, `keyDefinitions[]`, `keyTheorems[]`, `keyFormulas[]`, `examNotes[]`.

---

## TypeScript Types

All types in `src/lib/calculus2/analysis-types.ts`:

```typescript
TheoryItem          // definition / concept / remark
TheoremItem         // theorem with statement, assumptions, proof requirements
FormulaItem         // formula with LaTeX, conditions, exam importance
ProofPatternItem    // proof technique with step-by-step guide
ExampleItem         // worked example with source reference
QuestionItem        // practice question from any source
LectureAnalysis     // full analysis of a single lecture
RecitationAnalysis  // full analysis of a single recitation
LectureSummary      // condensed lecture summary (used in Dashboard table)
MaxInsight          // single instructor insight with topic/intuition/rule
MaxCounterExample   // counter-example from recitation
MaxInsightsData     // root type for max-insights.json
SimulationQuestion  // AI-generated exam question
SimulationExamData  // full simulation exam
MentorKnowledgeBase // everything the mentor chat agent needs
```

Shared primitive types (`types.ts`):

```typescript
ExamImportance: "low" | "medium" | "high" | "critical" | "unknown"
SourceType:     "lecture" | "recitation" | "homework" | "past_exam" | "summary"
```

---

## Application Routes

The app uses Next.js App Router. All pages live under `src/app/`.

| URL | File | Description |
|-----|------|-------------|
| `/` | `page.tsx` | Root redirect → `/dashboard` |
| `/dashboard` | `dashboard/page.tsx` | Main dashboard: lecture overview table + 14 module cards |
| `/weeks` | `weeks/page.tsx` | Week grid — all 13 weeks overview |
| `/weeks/[weekNumber]` | `weeks/[weekNumber]/page.tsx` | Individual week page with rich content + WeekNavBar |
| `/topics` | `topics/page.tsx` | Topic map browser |
| `/definitions` | `definitions/page.tsx` | All course definitions |
| `/formulas` | `formulas/page.tsx` | Formula bank with LaTeX rendering |
| `/theorems` | `theorems/page.tsx` | Theorem list |
| `/proof-patterns` | `proof-patterns/page.tsx` | Proof technique patterns |
| `/proof-guide` | `proof-guide/page.tsx` | Guided proof writing |
| `/practice` | `practice/page.tsx` | Practice question browser |
| `/simulations` | `simulations/page.tsx` | Simulation exam list |
| `/past-exams` | `past-exams/page.tsx` | Past exam archive |
| `/homework-review` | `homework-review/page.tsx` | Homework exercise review |
| `/quick-review` | `quick-review/page.tsx` | Flash-card style quick review |
| `/progress` | `progress/page.tsx` | Study progress tracker |
| `/intuition-map` | `intuition-map/page.tsx` | Visual intuition map |
| `/instructor-notes` | `instructor-notes/page.tsx` | Max's insights from recitations (math-normalized) |
| `/mentor` | `mentor/page.tsx` | AI mentor chat |
| `/dev` | `dev/page.tsx` | Development/debug utilities |
| `/admin` | `admin/page.tsx` | Admin panel |
| `/api/...` | `api/` | API routes for mentor chat, etc. |

### Layout hierarchy

```
src/app/layout.tsx                    ← Root layout (AppShell, auth)
  src/app/weeks/[weekNumber]/layout.tsx  ← Week sub-layout (adds WeekNavBar)
```

---

## Key Components

### Navigation — `src/components/AppShell.tsx`
- Sticky header with logo, scrollable nav, exam countdown
- Nav items: דשבורד · שבועות (with dropdown: מסקנות מתרגולים) · אינטואיציה · נוסחאות · תרגול · סימולציות · מבחני עבר · חזרה · מנטור · הערות מקס · אדמין
- `NavDropdown` component: CSS group-hover dropdown for "שבועות" → shows sub-items

### Week Navigation — `src/components/study/WeekNavBar.tsx`
- Client component, sticky at `top: 52px` (below app header), `z-30`
- Shows week chips 1–13, active week highlighted in navy
- Prev/Next buttons on sides
- Rendered by `src/app/weeks/[weekNumber]/layout.tsx`

### Math Rendering — `src/components/study/MathContent.tsx`
- Renders lines with mixed Hebrew text and `$...$` LaTeX math
- `renderInlineLine` splits line on `$` delimiters → KaTeX for math parts
- `renderBoldText` handles `**...**` → `<strong>` within text parts

### Markdown Parsing — `parseMarkdownBlocks` / `MarkdownBlock`
- Parses markdown into typed blocks: `paragraph`, `table`, `heading`, `list`, `code`
- Table block renders as `SummaryTable` with KaTeX cell support
- Used for `formal` field in `RichSectionCard` and week 9 summary

### Week Content — `src/components/study/WeekRichContent.tsx`
- `RichSectionCard`: renders a content section with title, intuition, formal (via `parseMarkdownBlocks`), examples, common mistakes
- `WeekRichContent`: assembles all sections for a week

### Dashboard — `src/components/Dashboard.tsx`
- `LectureOverviewTable`: table of all 9 lectures with week link, title, topics, definitions (green chips), theorems (navy chips)
- 14 module cards in a responsive grid (quick-access to all major routes)

### Instructor Notes — `src/app/instructor-notes/page.tsx`
- `normalizeMaxMath(text)`: 2-phase normalizer
  - Phase 1: specific `replaceAll` patterns (e.g. `→` → `\to`)
  - Phase 2: `applyOutsideMath` splits by existing `$...$` blocks, then `fixUnicode` converts unicode math chars (∑ ∫ ≤ ≥ ₙ ² β …) to LaTeX, handling Hebrew word boundaries
- Renders all `MaxInsight`, `MaxCounterExample`, and `weeklyInsights` with KaTeX

---

## Manual / Rich Content

`src/lib/calculus2/week-rich-content.ts` contains hand-crafted pedagogical content for weeks where the AI extraction is insufficient. This is the **highest-quality** content in the system.

### Week 7 — טורים: מבחן מנה, שורש, לייבניץ
Sections:
- טור אי-שלילי
- מבחן ההשוואה הגבולי
- מבחן האינטגרל
- מבחן השורש (קושי)
- מבחן המנה (ד'אלמבר)
- הטור ה-p הרמוני
- מתי להשתמש באיזה מבחן?

### Week 8 — התכנסות מוחלטת, מותנית ולייבניץ
Sections:
- התכנסות מוחלטת
- התכנסות מותנית
- מבחן לייבניץ
- אסטרטגיית הפתרון לטורים עם סימנות
- הסכומים החלקיים $S_{2N}$ ו-$S_{2N-1}$ בלייבניץ

### Week 9 — טורי חזקות וטיילור
Sections:
- טבלת מבחנים — זיהוי מהיר (rendered as markdown pipe-table via `parseMarkdownBlocks`)
- מה ההבדל בין מוחלטת, מותנית, מתבדרת?
- אזהרה: $L = 1$ במנה ובשורש
- Also loads `fullSummaryMarkdown` from external file `week-9-summary.md`

Each `WeekRichContent` object has:
```typescript
{
  weekNumber: number;
  goal: string;           // one-sentence week goal
  buildsOn?: string;      // prerequisite weeks
  sections: RichSection[];
  fullSummaryMarkdown?: string;
}
```

Each `RichSection` has: `title`, `intuition?`, `formal`, `examples?[]`, `commonMistakes?[]`

---

## Instructor Insights (Max)

`data/generated/calculus2/max-insights.json` — insights from the course instructor extracted from recitation transcripts.

Populated via `MaxInsightsData`:

| Field | Count | Description |
|-------|-------|-------------|
| `intuitions` | 9 | Mathematical intuitions and teaching rules from Max |
| `counterExamples` | 8 | Counter-examples shown in recitation |
| `weeklyInsights` | 9 | Per-recitation key insights, exam tips, danger zones |
| `commonMistakesFromMax` | 0+ | Common mistakes explicitly noted by Max |
| `examCriticalNotes` | 0+ | Critical exam notes |

`MaxInsight` fields: `id`, `week`, `recitation`, `topic`, `title`, `insight`, `whyItMatters?`, `examTip?`, `redFlag?`, `orderOfGrowth?`, `mustMemorize?[]`, `key?`, `rule?`

`MaxCounterExample` fields: `id`, `recitation`, `week`, `topic`, `title`, `claim`, `verdict`, `maxQuote?`, `counterexampleConstruction?`, `formalCounterexample?`, `whyItWorks?`, and several alternate field names for flexibility.

Displayed at `/instructor-notes` with normalized LaTeX math rendering.

---

## Architecture Notes

### Data quality tiers (best → worst)
1. **Recitation Markdown transcripts** (`docs/recitation/script/*.md`) — manually cleaned, highest fidelity
2. **Instructor summary PDFs** (`docs/summerize/`) — curated summaries
3. **Recitation PDFs** — scanned but structured
4. **Homework PDFs** — solution sets
5. **Lecture PDFs** — OCR quality is poor (handwritten notes), use with caution

### Math rendering
- All math is rendered via **KaTeX** (fast, server-compatible)
- Hebrew and math coexist in RTL layout — Hebrew in `dir="rtl"`, math spans `dir="ltr"` internally
- The `MathContent` component handles inline mixed text+math
- The `normalizeMaxMath` function in `/instructor-notes` upgrades unicode symbols (∑ ∫ ≤ ≥ ₙ ² β) to LaTeX before rendering

### Authentication
- `AuthGate` component in `AppShell` — controls access
- User data: `data/auth-users.json`
- Auth logic: `src/lib/simple-auth.ts`

### Next.js version
This project uses a **modified/non-standard version** of Next.js. See `node_modules/next/dist/docs/` and `AGENTS.md` before changing any framework-level code. Async params (`await params`) is required for dynamic segments.
