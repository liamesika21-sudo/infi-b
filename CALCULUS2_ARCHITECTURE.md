# Calculus 2 / Infi B Exam Prep Architecture

## Goal

Dedicated Hebrew-first Moed A preparation system for `אינפי ב׳`, target score `90+`.

## Current Source Inventory

The app scans `docs/` locally at render time and classifies files by folder and filename heuristics:

- `docs/lecture`: lectures 1-9
- `docs/recitation`: recitations/tutorials, including missing and duplicate weeks when present
- `docs/hw`: homework solution files
- `docs/summerize`: summaries
- `docs/past-exams`: past exams, formula sheets, theorem lists and scope warnings

## Core Rule

The week model explicitly separates:

- `Lecture N`: new material for week `N`
- `Recitation N`: usually practices `Lecture N-1`
- `Homework N`: aligned with the week/homework sequence

The UI must never collapse these into one assumed topic without analysis.

## Main Modules

- `src/lib/calculus2/types.ts`: strict data model
- `src/lib/calculus2/config.ts`: course identity and route map
- `src/lib/calculus2/mapping.ts`: week/lecture/recitation/homework alignment
- `src/lib/calculus2/file-classification.ts`: local filename classifier
- `src/lib/calculus2/content-parser.ts`: PDF extraction adapter boundary
- `src/lib/calculus2/agents.ts`: internal agent definitions
- `src/lib/calculus2/pipeline.ts`: typed pipeline skeleton
- `src/lib/calculus2/scoring.ts`: progress and question priority scoring
- `src/lib/calculus2/prompts.ts`: mentor and content-generation rules

## Pipeline

1. scan docs folder
2. classify source file
3. extract text from PDF
4. run lecture analysis
5. run recitation analysis
6. run homework analysis
7. run summary integration
8. run past exam analysis
9. build week map
10. build topic map
11. build formula bank
12. build theorem bank
13. build proof pattern bank
14. build question bank
15. build exam plan
16. build mentor knowledge base
17. initialize progress tracking

PDF extraction is intentionally isolated in `content-parser.ts`; the first implementation can use `pdf-parse`, `unpdf`, OCR, or a separate processing script.
