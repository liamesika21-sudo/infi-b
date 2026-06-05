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
6. [Application Routes — Full Page Directory](#application-routes--full-page-directory)
7. [API Routes](#api-routes)
8. [Key Library Modules](#key-library-modules)
9. [Key Components](#key-components)
10. [Manual / Rich Content](#manual--rich-content)
11. [Instructor Insights (Max)](#instructor-insights-max)
12. [Authentication & Access Control](#authentication--access-control)
13. [Architecture Notes](#architecture-notes)

---

## Overview

This is a Next.js App Router project (custom/modified version — see `AGENTS.md`). The platform:

- Ingests raw academic PDFs (lectures, recitations, homework, past exams, summaries)
- Runs a 3-stage AI pipeline to extract and synthesize knowledge
- Serves that knowledge through a rich study interface

**Tech stack:** Next.js · TypeScript · Tailwind CSS · KaTeX (LaTeX math) · lucide-react icons · RTL Hebrew · Redis (Upstash) · Anthropic Claude API

---

## Source Materials

All source documents live under `docs/`:

### `docs/lecture/` — 9 PDFs
Scanned lecture notes by Yosi (the lecturer). OCR reliability: low–medium (handwritten).

| File | Lecture |
|------|---------|
| `Lecture 1 group 1 calculus 2 2026.pdf` | גבולות, לופיטל, דרבו |
| `Lecture 2 group 1 calculus 2 2026.pdf` | סדרות, מונוטוניות, היינה |
| `Lecture 3 group 2 calculus 2 2026.pdf` | נגזרות מסדר גבוה, MVT, טיילור |
| `Lecture 4 group 1 calculus 2 2026.pdf` | אינטגרל מסוים, FTC, ניוטון-לייבניץ |
| `Lecture 5 group 2 calculus 2 2026.pdf` | אינטגרלים לא-אמיתיים |
| `Lecture 6 group 2 calculus 2 2026.pdf` | טורים, מבחני התכנסות בסיסיים |
| `Lecture 7 group 2 calculus 2 2026.pdf` | מבחן מנה, שורש, לייבניץ |
| `Lecture 8 group  1 calculus 2 2026.pdf` | טורי חזקות, רדיוס התכנסות |
| `Lecture 9 group 2 calculus 2 2026.pdf` | טורי טיילור ומקלורן |

### `docs/recitation/` — 9 PDFs + 10 clean Markdown transcripts

PDFs: `Recitation 1-Hebrew (1).pdf` through `Recitation_9-Hebrew.pdf`

Clean Markdown transcripts (in `recitation/script/`) — **highest quality source in the system:**

| File | Recitation | Content |
|------|------------|---------|
| `recitation1_transcript_clean_copy.md` | 1 | לופיטל, דרבו, צורות בלתי-קבועות |
| `recitation2_sequences_heine.md` | 2 | סדרות, היינה, רקורסיביות |
| `recitation3_transcript_clean_copy.md` | 3 | אינטגרל לא-מסוים, חלק-חלקים |
| `recitation_clean_markdown4.md` | 4 | FTC, ניוטון-לייבניץ, החלפת משתנה |
| `recitation5_improper_integrals.md` | 5 | אינטגרלים לא-אמיתיים, מבחן p |
| `recitation6_series.md` | 6 | טורים, גאומטרי, טלסקופי |
| `recitation7_transcript_clean_copy.md` | 7 | מנה, שורש, קושי |
| `recitation8_transcript_clean_copy.md` | 8 | לייבניץ, התכנסות מוחלטת/מותנית |
| `recitation-9-max.txt` | 9 | טורי חזקות, רדיוס התכנסות |
| `תרגול_10_תמלול_נקי.md` | 10 | טיילור, מקלורן, יישומים |

### `docs/hw/` — 7 PDFs
Homework exercise solutions: `Exercise 1 solution.pdf` … `Exercise 7 solution.pdf`

### `docs/past-exams/` — 12 PDFs
Past Moed A & B exams with solutions (2022–2025), formula sheets and theorem lists:
- `MoedA_2022_eng_solution.pdf` … `MoedA_calculus2_2025 solution.pdf`
- `MoedB_2022_solutions.pdf` … `MoedB_calculus2_2025_solutions.pdf`
- `Simulation_calculus2_2025_solutions.pdf`
- `formula_sheets_2025.pdf`
- `list_of_theorems_quiz1.pdf`, `list of theorems quiz 2 2026.pdf`
- `Exam questions that are not in the marerial for our exam.pdf`

### `docs/past-exams-hebrew/`
Past exams in Hebrew without solutions — served via the `/api/past-exams-hebrew/[filename]` route.

### `docs/summerize/` — Lecture summary PDFs + `sum-lecture/`
7 professionally written lecture summaries:
`סיכום אינפי 2 הרצאה 1.pdf` … `סיכום אינפי 2 הרצאה 7.pdf`

---

## Data Pipeline

Three npm scripts form the pipeline. Run them in order when source material changes.

```
npm run process:calculus2     # Step 1 — OCR/extract raw text from PDFs
npm run analyze:calculus2     # Step 2 — AI analysis + generate all JSONs
npm run generate:simulations  # Step 3 — Generate simulation exams
```

### Step 1 — `scripts/process-calculus2.ts`
Reads all PDFs → OCR → writes `processing-summary.json`, `source-files.json`, `extracted-text-index.json`

### Step 2 — `scripts/analyze-calculus2.ts` + `scripts/generate-extended-data.ts`
Calls Claude AI on extracted text → produces all analysis JSONs (lecture, recitation, homework, past exams, formulas, theorems, topic-map, week-map, mentor KB, max-insights)

### Step 3 — `scripts/generate-extended-data.ts`
Generates `simulation-exams.json` from the analyzed question bank

---

## Generated Data Files

All in `data/generated/calculus2/`. Read at runtime by the app.

| File | Description |
|------|-------------|
| `source-files.json` | Index of all source PDFs with file IDs and week mapping |
| `extracted-text-index.json` | Raw extracted text keyed by source file ID |
| `processing-summary.json` | Pipeline run metadata and file stats |
| `lecture-analysis.json` | Per-lecture: definitions, theorems, formulas, proof patterns, examples |
| `lecture-summaries.json` | Condensed per-lecture summaries (9 entries) |
| `recitation-analysis.json` | Per-recitation: questions, solution patterns, techniques, common mistakes |
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
| `week-map.json` | Per-week structure (13 weeks) with material availability status |
| `exam-priority-map.json` | Topics and formulas ranked by exam probability |
| `exam-plan.json` | Study plan recommendations |
| `simulation-exams.json` | AI-generated simulation exam sets |
| `mentor-knowledge-base.json` | Mentor chat knowledge base (formulas + theorems + exam plan) |
| `max-insights.json` | Max Mahlin's insights: intuitions, counter-examples, weekly insights |

### `lecture-summaries.json` — 9 entries

| # | Topic |
|---|-------|
| 1 | גבולות — כלל לופיטל ומשפט דרבו |
| 2 | סדרות — הגדרה, גבולות, מונוטוניות |
| 3 | נגזרות — מסדר גבוה, MVT, פיתוח טיילור |
| 4 | אינטגרל מסוים — הגדרה, תכונות, משפט היסודי |
| 5 | אינטגרלים לא-מסוימים — שיטות חישוב |
| 6 | טורים — הגדרה ומבחני התכנסות בסיסיים |
| 7 | טורים — מבחן מנה, שורש, לייבניץ |
| 8 | טורי חזקות — הגדרה, רדיוס, תחום התכנסות |
| 9 | טורי טיילור ומקלורן |

Each entry: `lectureNumber`, `weekNumber`, `title`, `mainTopics[]`, `keyDefinitions[]`, `keyTheorems[]`, `keyFormulas[]`, `examNotes[]`

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

`WeekRichContent` interface (`week-rich-content.ts`):
```typescript
WeekRichContent { weekNumber, mainGoal, guidingPrinciple, buildOn?, decisionTree?, fullSummaryMarkdown?, sections: RichSection[] }
RichSection     { title, tag: SectionTag, formal, whyItExists?, intuition?, whenToUse?, notes?, warning?, example? }
SectionTag:     "הגדרה" | "משפט" | "כלל" | "מסקנה" | "הערה" | "דוגמה" | "שיטה" | "אזהרה"
DecisionNode    { id, question, yes?, no?, info? }  // for week 8 convergence decision tree
```

---

## Application Routes — Full Page Directory

The app uses Next.js App Router. All pages under `src/app/`.

---

### `/` → redirect to `/dashboard`
**File:** `src/app/page.tsx`  
Instant redirect. No content.

---

### `/dashboard`
**File:** `src/app/dashboard/page.tsx` → renders `src/components/Dashboard.tsx`  
**Based on:** `lecture-summaries.json`, `week-map.json`, `source-files.json`, `scanDocsFolder()`  
**Idea:** The home base. Shows two things:
1. **LectureOverviewTable** — table of all 9 lectures: week link, title, key topics, definitions (green chips), theorems (navy chips). The fastest way to navigate to any week.
2. **14 module cards** — quick-access grid to every major section of the platform.

The dashboard is intentionally minimal: it aggregates all the AI analysis into a single at-a-glance view so the student knows what's available and can navigate quickly.

---

### `/weeks`
**File:** `src/app/weeks/page.tsx`  
**Based on:** `week-map.json`, `scanDocsFolder()`, `simulation-exams.json`  
**Idea:** Week grid overview — shows all 13 weeks as cards with availability status (lecture, recitation, homework — green if available, red if missing). Stats: available weeks, missing weeks, simulation count.

Explains the pedagogical offset: Recitation N typically practices Lecture N-1. This asymmetry is called out on every week card to avoid confusion.

---

### `/weeks/[weekNumber]`
**File:** `src/app/weeks/[weekNumber]/page.tsx`  
**Layout:** `src/app/weeks/[weekNumber]/layout.tsx` (adds sticky `WeekNavBar`)  
**Based on:**
- `week-rich-content.ts` — **PRIMARY** — hand-crafted content for weeks 1–10 (definitions, theorems, methods, warnings, examples, decision trees, all with KaTeX)
- `lecture-analysis.json` — AI-extracted key definitions and theorems per lecture
- `recitation-analysis.json` — Common mistakes, conclusions, must-practice items
- `question-bank.json` — Up to 8 practice questions from that week's recitation
- `homework-priority-map.json` — Ranked homework questions relevant to that week
- `study-guides.ts` — Optional study guide overlay per week

**Idea:** The deepest study page. For each week, it shows:
- **WeekRichContentPanel** — the manually-curated content (tagged sections: definition/theorem/method/warning/example) with full KaTeX math, intuition blocks, formal statements, when-to-use guidance, common traps
- AI-extracted key definitions and theorems (chips)
- Recitation conclusions and common mistakes
- Practice questions drawn from the recitation for that week
- Homework questions with exam-relevance ranking
- Optional study guide callout

This is where a student spends most of their study time.

---

### `/weeks/[weekNumber]/summary`
**File:** `src/app/weeks/[weekNumber]/summary/page.tsx`  
**Based on:** Lecture summary PDFs (via `summary-analysis.json`), plus hand-crafted lecture-specific content with KaTeX  
**Idea:** A focused summary page for a single lecture — styled like a "lecture notes" page. Uses its own KaTeX `K()` helper, `ThmBox`/`DefBox`/`NoteBox` styled components (colored borders matching the lecture-summary HTML format). The goal is a print-friendly, clean reference for each lecture's key theorems and proofs.

---

### `/formulas`
**File:** `src/app/formulas/page.tsx` → renders `src/components/FormulaCenterClient.tsx`  
**Based on:** `formula-bank.json` (AI-extracted from all source files)  
**Idea:** Interactive formula browser. Renders all extracted formulas with KaTeX, filterable by topic/importance. Formulas with low OCR confidence are hidden to prevent memorizing incorrect expressions. The `FormulaCenterClient` is a client component supporting search/filter.

---

### `/theorems`
**File:** `src/app/theorems/page.tsx`  
**Based on:** `theorem-bank.json` (AI-extracted), plus `src/app/theorems/TheoremsSidebar.tsx` for navigation  
**Idea:** Full theorem reference. Uses its own `ThmBox`/`DefBox`/`NoteBox` styled components (matching lecture2-summary.html design tokens). Hand-codes the major theorems (L'Hôpital, Darboux, FTC, etc.) with full KaTeX in the `formal` field. A TheoremsSidebar lets you jump to any theorem by name.

---

### `/definitions`
**File:** `src/app/definitions/page.tsx` → renders `src/components/DefinitionsClient.tsx`  
**Based on:** `src/lib/calculus2/definitions-data.ts` — **hand-written** definitions library with formal, intuition, whenToUse, example, commonMistake per definition  
**Idea:** The authoritative definitions page. Unlike the AI-extracted theorem-bank, these definitions are manually written to exactly match Yosi's formulations. Filterable by category (גבולות, סדרות, אינטגרלים, etc.). Includes `ConvergenceTables` — a static comparison table for convergence tests. Replaces the need to hunt through PDFs for a specific definition.

---

### `/practice`
**File:** `src/app/practice/page.tsx`  
**Based on:** `question-bank.json` (AI-extracted from recitations + homework + past exams + lecture examples)  
**Idea:** All practice questions from every source, organized by type:
- **תרגולים** — from recitation transcripts (highest quality)
- **מטלות** — from homework solution PDFs
- **מבחני עבר** — from 2022–2025 past exams
- **דוגמאות הרצאה** — from lecture notes

Shows up to 20 per category (the rest are accessible by running the full analysis). This is the breadth-first practice hub — for depth, use `/simulations`.

---

### `/simulations`
**File:** `src/app/simulations/page.tsx`  
**Based on:** `simulation-exams.json` (AI-generated from the question bank)  
**Idea:** Timed exam simulations. Each simulation is 4 questions drawn from a specific topic, with estimated duration. The goal is practicing under exam conditions — 90 minutes, 4 questions. Shows stats: how many are ready vs. pending review.

---

### `/simulations/[id]`
**File:** `src/app/simulations/[id]/page.tsx`  
**Based on:** A single `SimulationExamData` from `simulation-exams.json`  
**Idea:** The actual simulation exam experience. Shows one question at a time with a hint system. Students try themselves first, then reveal progressively (hint → direction → full solution). Tracks time.

---

### `/past-exams`
**File:** `src/app/past-exams/page.tsx`  
**Based on:** `past-exam-analysis.json`, `past-exam-aggregate.json`, `question-bank.json` (sourceType: past_exam), `src/lib/calculus2/past-exams-hebrew.ts`  
**Idea:** Past exam archive and analysis. Two components:
1. **Hebrew exam PDFs** — direct links to the Hebrew exams (via `/api/past-exams-hebrew/[filename]`), no solutions — for clean practice
2. **Topic frequency analysis** — which topics appear most across all past exams (2022–2025)
3. **Past exam questions** — grouped by topic, with exam-importance badges

This is the most exam-realistic preparation — questions that actually appeared on Reichman Calc 2 exams.

---

### `/quick-review`
**File:** `src/app/quick-review/page.tsx`  
**Based on:** `exam-priority-map.json` (critical/high topics), `theorem-bank.json`, `recitation-summaries.json`  
**Idea:** A pre-exam checklist and rapid review. Three sections:
1. **Checklist** — checkbox list of critical and high-priority topics; student ticks off what they know
2. **Key theorems** — the highest-importance theorems from the theorem bank with truncated statements
3. **Recitation conclusions** — key takeaways extracted from each recitation

Designed for the night before the exam — not for deep learning, but for confirming coverage and catching gaps.

---

### `/intuition-map`
**File:** `src/app/intuition-map/page.tsx` → renders `src/components/IntuitionMapClient.tsx`  
**Based on:** `src/lib/calculus2/intuition-map.ts` — hand-written per-week intuition summaries  
**Idea:** A visual "mental model" map. For each week, shows the core intuition (not the formal definition) in plain Hebrew. The purpose is to help students build the right mental picture before tackling formalism. The `IntuitionMapClient` is a client component with week selection and animated transitions.

---

### `/instructor-notes`
**File:** `src/app/instructor-notes/page.tsx`  
**Based on:** `max-insights.json` (generated from recitation transcripts by the AI pipeline)  
**Idea:** Max Mahlin's teaching notes — what he emphasized, repeated, and warned about across all 9 recitations. Organized per week, with three types of content:
- **Intuitions** — conceptual rules Max gave ("if you see this pattern, think that")
- **Counter-examples** — cases where the intuition breaks down
- **Weekly insights** — key exam tips and danger zones per week

Uses `normalizeMaxMath()` — a two-phase normalizer that:
1. Applies specific `replaceAll` patterns (→ to `\to`, etc.)
2. Applies `applyOutsideMath()` which splits on existing `$...$` blocks and applies `fixUnicode()` to convert unicode math chars (∑ ∫ ≤ ≥ ₙ ² β) to LaTeX, respecting Hebrew word boundaries

This page is effectively "what Max said you must know for the exam."

---

### `/mentor`
**File:** `src/app/mentor/page.tsx` (client component)  
**Based on:** Anthropic Claude API (`claude-haiku-4-5-20251001`) + `max-insights.json` + Redis credit tracking  
**Idea:** A pro-only AI tutor that behaves like Max and Yosi. Answers ONLY Calculus 2 course material questions. Two components:

**ProGate** — shown to non-pro users: lock icon, feature description cards (Max persona / Yosi formulations / exam questions / course-only), ₪38 CTA with WhatsApp link.

**ChatInterface** — shown to pro users:
- Streams responses from `/api/mentor/chat`
- Renders KaTeX math in responses via `renderMathToHtml()`
- 8 starter question chips
- Silently blocks (message: "הגעת למגבלת השימוש") when credits exhausted — no counter shown
- Conversation history (last 12 messages sent to API for context)

Pro users: defined in `data/auth-users.json` → `proEmails` array or `PRO_EMAILS` env var.

---

### `/progress`
**File:** `src/app/progress/page.tsx` → renders `src/components/PersonalProgressClient.tsx`  
**Based on:** `exam-priority-map.json` (topics list) + Redis (`/api/progress` GET/POST)  
**Idea:** Personal mastery tracker. Each topic from the exam priority map gets a status: לא התחלתי / בתהליך / שליטה טובה. Status is stored per-user in Redis (keyed by email). The `PersonalProgressClient` shows a kanban-style board: the student drags or clicks topics between columns. Stats show formula/theorem/question counts.

---

### `/topics`
**File:** `src/app/topics/page.tsx`  
**Based on:** `topic-map.json` (AI-extracted), `exam-priority-map.json`  
**Idea:** Browse all topics detected across all source files. Each topic card shows: which weeks it appears in, how many files, and its priority level (critical topics get a red border, high-priority get navy). This is a navigational tool — helps students understand course structure. Note: the AI heuristic detection isn't perfect; manual verification against source materials is always needed.

---

### `/homework-review`
**File:** `src/app/homework-review/page.tsx` → renders `src/components/HomeworkReviewClient.tsx`  
**Based on:** `homework-priority-map.json` (AI-ranked homework questions by exam relevance)  
**Idea:** Smart homework review — not all exercises equally. The AI ranks each homework question by how likely similar questions are to appear on the exam. Students see exercises organized by priority: critical → high → medium. The `HomeworkReviewClient` is interactive, allowing students to expand solutions and mark questions as done.

---

### `/proof-patterns`
**File:** `src/app/proof-patterns/page.tsx`  
**Based on:** `proof-pattern-bank.json` (AI-extracted from recitation transcripts)  
**Idea:** Proof technique patterns — recurring proof strategies extracted from recitations. Each pattern has: title, numbered steps, confidence score, exam importance badge. Examples: "comparison test strategy", "monotone bounded sequence convergence proof", "squeeze theorem application". Note that steps are heuristic — verify against source material.

---

### `/proof-guide`
**File:** `src/app/proof-guide/page.tsx`  
**Based on:** Hand-coded content with KaTeX  
**Idea:** A guided proof-writing reference. Uses `Step` components with: action (what you do), why (which theorem justifies it), conditions (what must hold), formalWrite (exact notation to use), trap (common mistake). Each step card color-coded by type. This teaches the structure of rigorous mathematical proofs in the course's style — not just what to prove, but how to write it formally.

---

### `/admin`
**File:** `src/app/admin/page.tsx`  
**Access:** Admin-only (checked via `isAdminEmail()`, hidden from nav for non-admins)  
**Based on:** `src/lib/simple-auth.ts` → `getAuthAdminSnapshot()`, `src/lib/mentor-credits.ts` → `getMentorLogs()`  
**Idea:** Platform operations dashboard. Three sections:
1. **Users table** — all allowed users with their devices (device ID, IP, last seen, status: fixed/active/pending/blocked). Flags users with multi-device attempts.
2. **Registration requests** — pending signups, with email/phone/plan info
3. **Mentor AI conversations** — last 500 chat logs, expandable `<details>` per conversation (email, timestamp, question preview → full Q+A on expand)

---

### `/dev/analysis`
**File:** `src/app/dev/analysis/page.tsx`  
**Access:** Development only (no auth gate, but not linked from nav)  
**Based on:** All analysis JSONs via `readAnalysisData()`  
**Idea:** Internal QA tool. Shows every generated JSON file in a collapsible `<pre>` block (max 520px height, scrollable). `exam-priority-map.json` is open by default. Used to verify pipeline output quality before connecting it to the UI.

---

### `/dev/extraction`
**File:** `src/app/dev/extraction/page.tsx`  
**Access:** Development only  
**Based on:** `extracted-text-index.json`, `source-files.json`  
**Idea:** Shows the first 1,000 characters of OCR-extracted text from each source PDF, with file metadata (source type, week, status). Used to check OCR quality before running the expensive AI analysis step.

---

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/login` | POST | — | Email login → sets session cookie |
| `/api/auth/register` | POST | — | Submit registration request (email, phone, plan) |
| `/api/auth/status` | GET | Cookie | Returns `{ ok, email, isAdmin }` — used by AppShell to show/hide admin nav |
| `/api/mentor/status` | GET | Cookie + Pro | Returns `{ ok, email, isPro, used, limit }` — used by mentor page on mount |
| `/api/mentor/chat` | POST | Cookie + Pro + Credits | Streams Anthropic SSE → `text/plain` stream. Increments Redis credit, logs conversation |
| `/api/past-exams-hebrew/[filename]` | GET | — | Serves Hebrew past exam PDFs from `docs/past-exams-hebrew/` via allow-list |
| `/api/progress` | GET/POST | Cookie | Get/update personal topic progress stored in Redis per user |

---

## Key Library Modules

All in `src/lib/calculus2/`:

| File | Purpose |
|------|---------|
| `analysis-types.ts` | All TypeScript interfaces for the data schema |
| `types.ts` | Shared primitive types (ExamImportance, SourceType) |
| `analysis-reader.ts` | Reads generated JSONs, provides typed access via `readAnalysisData()` |
| `generated-data.ts` | Central data loader `readGeneratedData()` — week-map, topic-map, source-files |
| `config.ts` | Pipeline configuration (paths, model settings) |
| `prompts.ts` | AI prompts for each analysis stage |
| `ai-analysis.ts` | Claude API wrapper |
| `agents.ts` | Multi-agent orchestration |
| `week-rich-content.ts` | **Hand-crafted** pedagogical content for all 10 weeks — KaTeX definitions, theorems, methods |
| `week-summaries.ts` | Summary text per week |
| `study-guides.ts` | Generated study guide helpers |
| `intuition-map.ts` | Hand-written per-week intuition summaries |
| `definitions-data.ts` | Hand-written definitions library with full pedagogical metadata |
| `mentor-system-prompt.ts` | Builds the AI mentor system prompt from max-insights.json |
| `past-exams-hebrew.ts` | Allow-list of Hebrew past exam filenames + display metadata |
| `content-parser.ts` | Markdown/math parsing utilities |
| `mapping.ts` | Maps between IDs and display items |
| `scoring.ts` | Exam-readiness scoring logic |
| `index.ts` | Barrel export |

Other key files:
| File | Purpose |
|------|---------|
| `src/lib/simple-auth.ts` | All auth logic: validate cookie, login, register, isAdmin, isPro, readAuthFile |
| `src/lib/mentor-credits.ts` | Redis: credit tracking (`mentor:usage:{email}`), conversation logs (`mentor:logs`) |
| `src/lib/personal-progress.ts` | Redis: per-user topic mastery status (`progress:{email}`) |

---

## Key Components

### Navigation — `src/components/AppShell.tsx`
Sticky header with logo, nav, and exam countdown. Nav items defined in `NAV_ITEMS` with responsive visibility (`show: "always" | "sm" | "md" | "lg"`). Admin item hidden for non-admins (fetches `/api/auth/status` on mount). No overflow scroll — items hidden by breakpoint instead.

`NavDropdown` — CSS group-hover dropdown for "שבועות" → links to "הערות מקס" (`/instructor-notes`).

### Week Navigation — `src/components/study/WeekNavBar.tsx`
Client component, sticky at `top: 52px`, `z-30`. Week chips 1–13 with prev/next buttons. Rendered by the week sub-layout.

### Math Rendering — `src/components/study/MathContent.tsx`
Renders lines with mixed Hebrew text and `$...$` LaTeX. `renderInlineLine()` splits on `$` → KaTeX for math parts. `renderBoldText()` handles `**...**` within text.

### Markdown Parser — `parseMarkdownBlocks` / `MarkdownBlock`
Parses markdown into typed blocks: `paragraph`, `table`, `heading`, `list`, `code`. Table blocks render as `SummaryTable` with KaTeX cell support. Used for the `formal` field in week rich content sections.

### Week Rich Content — `src/components/study/WeekRichContent.tsx`
`WeekRichContentPanel` — renders all sections for a week.
`RichSectionCard` — renders one section: tag badge (colored by type), title, formal statement (via `parseMarkdownBlocks`), intuition, when-to-use, notes, warning, example. Tag color tokens: הגדרה=green, משפט=navy, שיטה=navy, אזהרה=red, דוגמה=purple, כלל=amber, מסקנה=teal.

### Formula Center — `src/components/FormulaCenterClient.tsx`
Client component for the formula bank. Supports search + filter by importance. KaTeX rendering of all LaTeX.

### Dashboard — `src/components/Dashboard.tsx`
`LectureOverviewTable` — 9 lectures with definitions and theorem chips. 14 module navigation cards.

---

## Manual / Rich Content

`src/lib/calculus2/week-rich-content.ts` — hand-crafted pedagogical content for all 10 weeks. The **highest-quality content** in the system, written directly from recitation transcripts and Yosi's formulations.

### Week coverage

| Week | Topic | Key sections |
|------|-------|-------------|
| 1 | לופיטל + דרבו | כלל לופיטל, צורת $0·\infty$, טכניקת הלוגריתם, משפט דרבו, יישום דרבו |
| 2 | סדרות + היינה | מונוטוניות-חסימה, למת היינה, גבולות ידועים, סדרות רקורסיביות |
| 3 | אינטגרל לא-מסוים | טבלת אינטגרלים, המרה ליניארית, דפוס $f'/f$, חלק-חלקים, מחזורי |
| 4 | אינטגרל מסוים + FTC | FTC, ניוטון-לייבניץ, החלפת משתנה עם גבולות, סכומי רימן |
| 5 | אינטגרלים לא-אמיתיים | הגדרה via גבולות, שני גבולות נפרדים, מבחן $p$, מבחן השוואה |
| 6 | טורים בסיסיים | הגדרה via סכומים חלקיים, תנאי הכרחי, גאומטרי, טלסקופי |
| 7 | מבחן מנה + שורש | ד'אלמבר, קושי, לייבניץ, אסטרטגיית בחירת מבחן |
| 8 | התכנסות מוחלטת + עץ החלטה | LCT, מוחלטת vs. מותנית, `DecisionNode` tree for week 8 |
| 9 | טיילור + מקלורן | טבלת מקלורן, חישוב מקדמים, שגיאת טיילור |
| 10 | יישומי מקלורן | גזירה/אינטגרציה איבר-איבר, הצבה, $n·x^n$, יחידות מקלורן |

The `REGISTRY` object maps weekNumber → `WeekRichContent`. `getWeekRichContent(n)` returns null for weeks not yet written.

---

## Instructor Insights (Max)

`data/generated/calculus2/max-insights.json` — insights extracted from recitation transcripts by the AI pipeline.

| Field | Count | Description |
|-------|-------|-------------|
| `intuitions` | 9 | Mathematical intuitions and teaching rules from Max |
| `counterExamples` | 8 | Counter-examples shown in recitation |
| `weeklyInsights` | 9 | Per-recitation key insights, exam tips, danger zones |
| `commonMistakesFromMax` | 0+ | Common mistakes explicitly noted by Max |
| `examCriticalNotes` | 0+ | Critical exam notes |

`MaxInsight` fields: `id`, `week`, `recitation`, `topic`, `title`, `insight`, `whyItMatters?`, `examTip?`, `redFlag?`, `mustMemorize?[]`

`MaxCounterExample` fields: `id`, `recitation`, `week`, `topic`, `title`, `claim`, `verdict`, `maxQuote?`, `formalCounterexample?`, `whyItWorks?`

Displayed at `/instructor-notes` — requires `normalizeMaxMath()` to convert unicode math to LaTeX before KaTeX rendering.

---

## Authentication & Access Control

**File:** `src/lib/simple-auth.ts`  
**Data:** `data/auth-users.json`

### Auth levels
| Level | Check | Who |
|-------|-------|-----|
| Authenticated | email in `allowedEmails` | All approved users |
| Admin | email in `adminEmails` or `ADMIN_EMAIL` env var | liamesika21@gmail.com |
| Pro | email in `proEmails` or `PRO_EMAILS` env var | liamesika21@gmail.com, tomccohen@gmail.com |

### Auth flow
1. `AuthGate` component in `AppShell` — shows login form if no valid session cookie
2. Login: POST `/api/auth/login` → `loginWithEmail()` → sets `mentora-auth` cookie (JWT-style)
3. All protected pages validate cookie via `validateCookieForRequest()` in their API routes

### Mentor credits
- Stored in Redis: `mentor:usage:{email}` — atomic INCR per message
- Limit: 150 messages (`MENTOR_CREDIT_LIMIT`)
- Logs: `mentor:logs` — Redis LPUSH + LTRIM (cap 500 entries)
- Credit incremented BEFORE the API call (prevent bypass by timing out)

### Personal progress
- Stored in Redis: `progress:{email}` — JSON map of topicId → status
- Status values: `"לא התחלתי"` | `"בתהליך"` | `"שליטה טובה"`

---

## Architecture Notes

### Data quality tiers (best → worst)
1. **`week-rich-content.ts`** — manually written, word-for-word from course material
2. **Recitation Markdown transcripts** (`docs/recitation/script/*.md`) — manually cleaned
3. **`definitions-data.ts`** — manually written definitions library
4. **Instructor summary PDFs** (`docs/summerize/`) — curated summaries
5. **AI-analyzed JSONs** — good for structure, may have OCR noise
6. **Lecture PDFs** — handwritten, OCR is unreliable; treat with caution

### Math rendering
- All math rendered via **KaTeX** (fast, server-compatible)
- Hebrew in `dir="rtl"`, math spans `dir="ltr"` internally
- `MathContent` — inline mixed text+math (client component)
- `DisplayMath` — block-level centered math
- `K({ m, d? })` helper — server-side KaTeX in theorems/summary pages
- `renderMathToHtml()` — client-side KaTeX for mentor chat bubbles
- `normalizeMaxMath()` — upgrades unicode (∑ ∫ ≤ ≥ ₙ ²) to LaTeX for instructor-notes page
- **All LaTeX in TypeScript template literals must use double backslashes**: `\\xi`, `\\frac`, `\\infty`, etc. (single `\x` is a hex escape and causes `TS1125` errors)

### Next.js version note
This project uses a **modified/non-standard version** of Next.js. See `node_modules/next/dist/docs/` and `AGENTS.md` before changing any framework-level code. Async params (`await params`) is required for all dynamic segments.

### Deployment
- **Platform:** Vercel
- **Environment variables:** `ANTHROPIC_API_KEY` (production only), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `PRO_EMAILS` (optional), `ADMIN_EMAIL` (optional)
- Linked project: run `vercel link` before `vercel env add`
