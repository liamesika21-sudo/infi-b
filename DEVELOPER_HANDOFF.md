# Developer Handoff — Course Exam Prep Platform

> Generic replication guide.  
> Replace every `[PLACEHOLDER]` below with the values relevant to your course.

---

## What This System Is

An AI-powered exam preparation platform for university students studying a specific course. The platform:

1. **Ingests** raw academic PDFs (lectures, recitations, homework, past exams, summaries)
2. **Processes** them through a 3-stage AI pipeline that extracts definitions, theorems, formulas, questions, and insights
3. **Serves** everything through a rich Hebrew-language study interface with KaTeX math rendering

The original deployment is for Calculus 2 (אינפי ב׳) at Reichman University, moed alef 2026. This guide explains how to replicate the same architecture for a different course.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) — **non-standard version, see note below** |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Math rendering | KaTeX |
| Icons | lucide-react |
| AI pipeline | Anthropic Claude API (claude-haiku for mentor, claude-sonnet for analysis) |
| Database / cache | Redis — Upstash (mentor credits, conversation logs, personal progress) |
| Authentication | Cookie-based email allowlist (no passwords) |
| Deployment | Vercel |
| PDF extraction | pdf-parse |
| Layout | RTL Hebrew (`dir="rtl"`) throughout |

> **Next.js note:** This project uses a modified, non-standard version of Next.js. Before touching any framework-level code, read `node_modules/next/dist/docs/`. The most important difference: dynamic route params must be awaited — `const { id } = await params`.

---

## Repository Structure

```
/
├── docs/                          ← ALL SOURCE MATERIAL GOES HERE
│   ├── lecture/                   ← Lecture PDFs (one per week)
│   ├── recitation/                ← Recitation PDFs
│   │   └── script/                ← Clean Markdown transcripts (highest quality)
│   ├── hw/                        ← Homework solution PDFs
│   ├── past-exams/                ← Past exam PDFs with solutions
│   ├── past-exams-hebrew/         ← Past exams in Hebrew only (no solutions)
│   └── summerize/                 ← Professionally written lecture summaries
│
├── data/
│   └── generated/
│       └── [course-id]/           ← ALL pipeline output JSONs land here
│           ├── source-files.json
│           ├── extracted-text-index.json
│           ├── lecture-analysis.json
│           ├── recitation-analysis.json
│           ├── formula-bank.json
│           ├── theorem-bank.json
│           ├── question-bank.json
│           ├── simulation-exams.json
│           ├── max-insights.json
│           └── ... (20 total JSON files)
│
├── scripts/                       ← Pipeline scripts (run on the developer machine)
│   ├── process-[course-id].ts     ← Step 1: OCR + extract text
│   ├── analyze-[course-id].ts     ← Step 2: AI analysis
│   └── generate-extended-data.ts  ← Step 3: Cross-cutting synthesis
│
├── src/
│   ├── app/                       ← Next.js pages (App Router)
│   │   ├── layout.tsx             ← Root layout (AppShell)
│   │   ├── dashboard/
│   │   ├── weeks/[weekNumber]/
│   │   ├── formulas/
│   │   ├── practice/
│   │   ├── simulations/
│   │   ├── past-exams/
│   │   ├── quick-review/
│   │   ├── intuition-map/
│   │   ├── instructor-notes/
│   │   ├── mentor/
│   │   ├── admin/
│   │   └── api/
│   │       ├── auth/
│   │       ├── mentor/
│   │       ├── progress/
│   │       └── past-exams-hebrew/
│   │
│   ├── components/                ← React components
│   │   ├── AppShell.tsx           ← Nav header (edit nav items here)
│   │   ├── AuthGate.tsx           ← Login gate
│   │   ├── Dashboard.tsx
│   │   └── study/                 ← Shared study UI components
│   │       ├── MathContent.tsx    ← KaTeX inline rendering
│   │       ├── WeekRichContent.tsx
│   │       ├── StudyCallout.tsx
│   │       └── Badges.tsx
│   │
│   └── lib/
│       ├── simple-auth.ts         ← All auth logic
│       ├── mentor-credits.ts      ← Redis credit tracking
│       ├── personal-progress.ts   ← Redis progress tracking
│       └── [course-id]/           ← Course-specific logic
│           ├── analysis-types.ts  ← All data interfaces (do not modify lightly)
│           ├── types.ts           ← ExamImportance, SourceType
│           ├── config.ts          ← Course metadata (name, weeks, etc.)
│           ├── analysis-reader.ts ← Reads all JSONs at runtime
│           ├── generated-data.ts  ← readGeneratedData()
│           ├── pipeline.ts        ← scanDocsFolder()
│           ├── content-parser.ts  ← PDF text extraction + topic detection
│           ├── prompts.ts         ← All AI prompts (the most critical file)
│           ├── ai-analysis.ts     ← Claude API wrapper
│           ├── agents.ts          ← Multi-agent orchestration
│           ├── week-rich-content.ts   ← MANUAL: KaTeX content per week
│           ├── definitions-data.ts    ← MANUAL: definitions library
│           ├── intuition-map.ts       ← MANUAL: per-week intuitions
│           ├── study-guides.ts        ← MANUAL: study guides
│           ├── mentor-system-prompt.ts ← Builds AI mentor prompt
│           └── past-exams-hebrew.ts   ← Allowlist of Hebrew exam PDFs
│
└── data/
    └── auth-users.json            ← User allowlist + admin/pro designations
```

---

## The Data Pipeline (3 Steps)

This is the core of the system. Run these once when you first set up the course, then again whenever you add new source material.

### Step 1 — Extract text from PDFs

```bash
npm run process:[course-id]
```

**What it does:**
- Calls `scanDocsFolder()` which walks the `docs/` directory and classifies every file by type (lecture/recitation/homework/past_exam/summary) and week number based on filename patterns
- Extracts text from each PDF using `pdf-parse`
- Writes to `data/generated/[course-id]/`:
  - `source-files.json` — index of all source files with metadata
  - `extracted-text-index.json` — raw extracted text per file
  - `week-map.json` — week structure with material availability
  - `topic-map.json` — topics detected heuristically from text
  - `processing-summary.json` — stats and run metadata

**OCR quality varies:** Handwritten lecture PDFs tend to have poor OCR. Clean Markdown transcripts of recitations (placed in `docs/recitation/script/`) bypass OCR entirely and are the highest-quality input. If lecture PDFs are handwritten, consider getting typed transcripts.

**Check extraction quality** at `/dev/extraction` before running Step 2.

### Step 2 — AI analysis

```bash
npm run analyze:[course-id]
```

**What it does:**
- Reads `extracted-text-index.json`
- Sends each document to Claude (configured in `src/lib/[course-id]/prompts.ts`) for analysis
- For lectures: extracts definitions, theorems, formulas, proof patterns, examples
- For recitations: extracts questions, solution techniques, common mistakes, conclusions
- For past exams: extracts questions, topics, frequency patterns
- Synthesizes cross-cutting views: formula-bank, theorem-bank, question-bank, exam-priority-map, max-insights

**This is the expensive step** — it makes many API calls to Claude. With 20-30 source files expect 15-30 minutes and a few dollars in API costs. Results are cached as JSON, so you only rerun when source material changes.

**Check analysis quality** at `/dev/analysis` after running.

### Step 3 — Generate simulations

```bash
npm run generate:simulations
```

Generates `simulation-exams.json` from the analyzed question bank. Usually included in Step 2 but can be run separately.

---

## Adapting for a New Course

### 1. Course configuration — `src/lib/[course-id]/config.ts`

```typescript
export const course = {
  courseId: "[course-id]",         // e.g. "linear-algebra", "probability"
  nameHe: "[שם הקורס בעברית]",
  nameEn: "[Course Name]",
  mode: "moed-a-exam-prep",        // or "semester-prep", "quiz-prep"
  targetScoreLabel: "90+",
  totalWeeks: [N],                 // total weeks in the course
  availableWeeks: [N],             // weeks with actual material
  sourceRoot: "docs",
};
```

### 2. Source material — `docs/`

Place your PDFs in the correct folders. The pipeline classifies files by their **folder** and **filename patterns**:

| Folder | Expected filename pattern | Week extraction |
|--------|--------------------------|-----------------|
| `docs/lecture/` | Contains "Lecture N" or "lecture_N" | Extracted from filename |
| `docs/recitation/` | Contains "Recitation N" or "recitation_N" | Extracted from filename |
| `docs/recitation/script/` | Any `.md` or `.txt` files | Parsed as clean transcripts |
| `docs/hw/` | Contains "Exercise N" or "hw_N" | Extracted from filename |
| `docs/past-exams/` | Any PDF | Not week-specific |
| `docs/past-exams-hebrew/` | Hebrew exam PDFs without solutions | Not week-specific |
| `docs/summerize/` | Any PDF | Not week-specific |

**Pro tip:** The best input quality is clean Markdown transcripts of recitations. If you have recordings or notes, transcribe them into `.md` files and place them in `docs/recitation/script/`. The AI analysis of these is far more accurate than OCR'd PDFs.

### 3. AI prompts — `src/lib/[course-id]/prompts.ts`

This is the **most important file to adapt**. It contains the Claude prompts that analyze each type of document. Key prompts to update:

- `LECTURE_ANALYSIS_PROMPT` — instruct Claude about the specific theorem/definition formats of this course
- `RECITATION_ANALYSIS_PROMPT` — instruct Claude about the teaching style and what counts as a key insight
- `PAST_EXAM_ANALYSIS_PROMPT` — instruct Claude about this exam's format and typical question types
- `EXAM_PRIORITY_PROMPT` — instruct Claude about what topics are most likely to appear on exams

Replace all Calculus 2-specific references (L'Hôpital, integrals, series, etc.) with the relevant concepts for your course.

### 4. Nav items — `src/components/AppShell.tsx`

Update `NAV_ITEMS` array at the top of the file:

```typescript
const NAV_ITEMS = [
  { href: "/dashboard",     label: "דשבורד",    icon: LayoutDashboard, show: "always" },
  { href: "/weeks",         label: "שבועות",    icon: Calendar,        show: "always" },
  // ... add/remove items as needed
] as const;
```

The `show` field controls responsive visibility:
- `"always"` — always visible
- `"sm"` — hidden on mobile, visible from `sm` breakpoint up
- `"md"` — hidden until `md` breakpoint
- `"lg"` — hidden until `lg` breakpoint (use for admin)

### 5. Exam date — `src/components/AppShell.tsx`

```typescript
const EXAM_DATE = new Date("[YYYY-MM-DDT09:00:00]");
```

The countdown chip in the header counts down to this date automatically, changing color (green → orange → red) as the exam approaches.

### 6. Manual content — `src/lib/[course-id]/week-rich-content.ts`

This is where **human-quality content lives**. The AI pipeline extracts structure, but this file contains hand-crafted definitions, theorems, methods, and worked examples per week — written word-for-word to match the lecturer's exact formulations.

Each week entry follows this TypeScript interface:

```typescript
interface WeekRichContent {
  weekNumber: number;
  mainGoal: string;           // one-sentence goal (Hebrew, with KaTeX $...$)
  guidingPrinciple: string;   // the key insight to take home
  buildOn?: string;           // what this week depends on
  sections: RichSection[];
  decisionTree?: DecisionNode; // optional: decision tree for choosing a method
}

interface RichSection {
  title: string;
  tag: "הגדרה" | "משפט" | "כלל" | "מסקנה" | "הערה" | "דוגמה" | "שיטה" | "אזהרה";
  formal: string;             // the formal statement — supports $...$ and $$...$$ KaTeX
  whyItExists?: string;       // why was this introduced?
  intuition?: string;         // human-language explanation
  whenToUse?: string;         // when exactly to apply this
  notes?: string[];           // edge cases, subtleties
  warning?: string;           // common trap
  example?: string;           // short worked example
}
```

**Important — KaTeX in TypeScript template literals:** All LaTeX backslashes must be doubled inside TypeScript strings. Write `\\frac`, `\\infty`, `\\sum`, `\\int`, `\\to`, `\\geq`, `\\leq`, `\\neq`, `\\in`, `\\xi` etc. Single `\f` would be parsed as a hex escape and cause a `TS1125` compiler error.

### 7. Definitions library — `src/lib/[course-id]/definitions-data.ts`

Hand-written definitions organized by category. Each definition has:
- `formal` — the exact formal definition
- `intuition` — plain language explanation
- `whenToUse` — when exactly to apply it
- `example` — a worked example
- `commonMistake` — the most frequent error students make
- `category` — for filtering (define your own category set)

### 8. Intuition map — `src/lib/[course-id]/intuition-map.ts`

Hand-written per-week "mental model" — what's the core intuition before the formalism. These appear on the `/intuition-map` page which is a visual map of the course.

### 9. Instructor notes — `data/generated/[course-id]/max-insights.json`

This JSON is **generated by the AI pipeline** from recitation transcripts, but it can also be seeded manually. The structure:

```typescript
interface MaxInsightsData {
  intuitions: {
    topic: string;
    title: string;
    text: string;
    maxQuote?: string;   // exact quote from the instructor
  }[];
  counterExamples: {
    topic: string;
    claim: string;
    verdict: string;
    maxQuote?: string;
  }[];
  weeklyInsights: {
    week: number;
    topic: string;
    keyInsights: string[];
    examTip?: string;
    dangerZone?: string;
  }[];
}
```

Replace "max" with the name of your course instructor throughout — in `mentor-system-prompt.ts`, in `instructor-notes/page.tsx` display labels, and in the nav item label.

### 10. Mentor system prompt — `src/lib/[course-id]/mentor-system-prompt.ts`

Update the system prompt to:
- Specify the correct course name and university
- List the correct topics (replace Calculus 2 topics)
- Update the formal definitions section with this course's key theorems
- Adjust the "course-only" rule to name the topics of your course

---

## Authentication Setup

### User allowlist — `data/auth-users.json`

```json
{
  "allowedEmails": [
    "student@example.com"
  ],
  "adminEmails": [
    "admin@example.com"
  ],
  "proEmails": [
    "paying-student@example.com"
  ],
  "registrationRequests": []
}
```

- **allowedEmails** — everyone who can log in
- **adminEmails** — can see the `/admin` page (user management, conversation logs)
- **proEmails** — can access the AI mentor chat

No passwords. Login is email-only — users enter their email, and if it's in the allowlist they get a session cookie. If not, they see the registration form.

### Environment variables (Vercel)

```
ANTHROPIC_API_KEY         ← Claude API key (production only)
UPSTASH_REDIS_REST_URL    ← Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN  ← Upstash Redis token
PRO_EMAILS                ← Optional: comma-separated emails, overrides auth-users.json
ADMIN_EMAIL               ← Optional: single admin email, overrides auth-users.json
```

Add to Vercel: `vercel link` then `vercel env add VARIABLE_NAME production`

---

## Pages — What Each Page Does and What It Needs

| Page | URL | What it needs | Content source |
|------|-----|---------------|----------------|
| Dashboard | `/dashboard` | lecture-summaries.json, week-map.json | AI pipeline |
| Week grid | `/weeks` | week-map.json | AI pipeline |
| Week detail | `/weeks/[N]` | week-rich-content.ts ← **PRIMARY**, AI JSONs | Manual + AI |
| Formulas | `/formulas` | formula-bank.json | AI pipeline |
| Theorems | `/theorems` | theorem-bank.json | AI pipeline |
| Definitions | `/definitions` | definitions-data.ts | **Manual only** |
| Practice | `/practice` | question-bank.json | AI pipeline |
| Simulations | `/simulations` | simulation-exams.json | AI pipeline |
| Past exams | `/past-exams` | past-exam-analysis.json, past-exam-aggregate.json | AI pipeline |
| Homework review | `/homework-review` | homework-priority-map.json | AI pipeline |
| Quick review | `/quick-review` | exam-priority-map.json, theorem-bank.json | AI pipeline |
| Intuition map | `/intuition-map` | intuition-map.ts | **Manual only** |
| Instructor notes | `/instructor-notes` | max-insights.json | AI pipeline (seedable manually) |
| Proof patterns | `/proof-patterns` | proof-pattern-bank.json | AI pipeline |
| Proof guide | `/proof-guide` | — | **Manual only** |
| Progress | `/progress` | exam-priority-map.json + Redis | AI pipeline + Redis |
| Topics | `/topics` | topic-map.json | AI pipeline |
| Mentor | `/mentor` | Anthropic API + Redis + mentor-system-prompt.ts | Live AI |
| Admin | `/admin` | auth data + Redis logs | System data |
| Dev/QA | `/dev/analysis`, `/dev/extraction` | All JSONs | Pipeline output |

**Pages that are useful from day one (no manual content needed):**  
`/dashboard` `/weeks` `/formulas` `/practice` `/simulations` `/past-exams` `/quick-review` — all driven entirely by the AI pipeline output.

**Pages that need manual content to be valuable:**  
`/weeks/[N]` (rich content), `/definitions`, `/intuition-map`, `/proof-guide`, `/instructor-notes`

---

## Launch Checklist

### Before first deploy:

- [ ] Clone the repo
- [ ] `npm install`
- [ ] Update `src/lib/[course-id]/config.ts` — course name, week count, exam date
- [ ] Update `src/components/AppShell.tsx` — nav items, exam date
- [ ] Update `data/auth-users.json` — your email in `adminEmails` and `allowedEmails`
- [ ] Place source PDFs in `docs/` subdirectories
- [ ] Optionally: place clean Markdown transcripts in `docs/recitation/script/`
- [ ] Set environment variables locally in `.env.local`:
  ```
  ANTHROPIC_API_KEY=sk-ant-...
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...
  ```
- [ ] Run pipeline: `npm run process:[course-id]`
- [ ] Check OCR quality at `http://localhost:3000/dev/extraction`
- [ ] Run analysis: `npm run analyze:[course-id]`
- [ ] Check analysis at `http://localhost:3000/dev/analysis`
- [ ] `npm run dev` — verify all pages load without errors

### Before production deploy:

- [ ] Add `ANTHROPIC_API_KEY` to Vercel (production environment only)
- [ ] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel
- [ ] Add student emails to `data/auth-users.json` → `allowedEmails`
- [ ] Add paying students to `proEmails` for mentor access
- [ ] `vercel deploy`

### Content quality checklist (ongoing):

- [ ] `/weeks/[1..N]` — at least `mainGoal` and `guidingPrinciple` per week
- [ ] `/weeks/[1..N]` — at least 3-5 `sections` with `formal` content per week
- [ ] `/definitions` — all course-critical definitions written manually
- [ ] `/intuition-map` — one intuition paragraph per week
- [ ] `/instructor-notes` — seeded with key instructor insights if AI pipeline missed them
- [ ] Mentor system prompt updated with course-specific topics and formulations

---

## Key Engineering Decisions to Know

### No passwords
Authentication is email-only. Users enter their email; if it's in the allowlist they get a session cookie valid for 30 days. This makes it simple to manage a closed group of students.

### AI pipeline is offline, not real-time
The pipeline runs on the developer's machine (not on Vercel) and outputs static JSON files that the app reads at runtime. This keeps Vercel costs zero and response times fast. Only the mentor chat and personal progress hit external services at request time.

### KaTeX is server-rendered where possible
Most math rendering happens server-side (Next.js Server Components) using `katex.renderToString()`. Only the mentor chat uses client-side KaTeX because the content is dynamic. This keeps math rendering fast and avoids layout shift.

### Double backslashes in TypeScript template literals
Any LaTeX math written in TypeScript strings must use `\\` for backslashes (not single `\`). Single `\x` is interpreted as a hex escape by the TypeScript compiler. If you see `TS1125: Hexadecimal digit expected`, this is why. Example: write `\\frac{1}{2}`, not `\frac{1}{2}`.

### Redis usage (Upstash)
Three types of Redis data:
1. `mentor:usage:{email}` — atomic INCR counter for mentor credits
2. `mentor:logs` — LPUSH list (capped at 500) of conversation logs, viewable in admin panel
3. `progress:{email}` — JSON hash of topic mastery status per student

Upstash is used (not self-hosted Redis) because it works on Vercel's serverless functions with HTTP-based requests.

### Responsive nav — no overflow scroll
The nav never scrolls. Instead, items have a `show` breakpoint: items marked `"md"` are hidden on small screens. On mobile, only 3-4 nav items are visible; the rest appear as the screen grows. This is intentional — don't add `overflow-x-auto` back.

---

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `TS1125: Hexadecimal digit expected` | Single `\` in LaTeX in a TS string | Double all backslashes: `\\frac`, `\\infty` |
| Pages return 404 after adding a new API route | Old dev server running | Kill old `next dev` process and restart |
| `vercel env add` fails with `--yes` flag | The flag doesn't exist | Use stdin: `echo "value" \| vercel env add KEY production` |
| PDF text is garbled/empty | Handwritten PDF, OCR failed | Use a typed Markdown transcript instead |
| AI analysis produces wrong topic names | Prompts are Calculus 2-specific | Update `prompts.ts` with your course's terminology |
| Admin nav item shows for all users | `isAdmin` check timing issue | Default is `false`; it's set only after `/api/auth/status` resolves — this is correct |
| Mentor returns "המנטור זמין למנויי פרו" | Email not in proEmails | Add email to `data/auth-users.json` → `proEmails` |
| Math renders as raw `$...latex...$` text | KaTeX not rendering | Check the component — server components use `katex.renderToString()`, client components use `renderMathToHtml()` |

---

## Contact / Handoff Notes

- Original developer: liamesika
- Platform is live at: https://infi.mentora-edu.com
- The Calculus 2 version is the reference implementation — compare against it when in doubt
- All the "hard" content (week-rich-content.ts, definitions-data.ts, mentor-system-prompt.ts) was written specifically for the Calculus 2 course at Reichman University. For a new course, these files need to be rewritten from scratch based on that course's actual material.
