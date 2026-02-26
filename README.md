# Phil-IRI Digital Admin — MVP

A Progressive Web App for digital administration of the DepEd Phil-IRI 2018 reading assessment.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Run tests (do this before touching calculateReadingLevel.js)
npx vitest

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

## Project Map

```
src/
├── constants/
│   └── philIRI.js          ← ALL Phil-IRI spec numbers live here. Sacred file.
│
├── utils/
│   ├── calculateReadingLevel.js   ← Core calculator logic. Pure functions.
│   ├── calculateReadingLevel.test.js  ← Tests. Run before every change here.
│   ├── storage.js          ← All localStorage access. Never call localStorage directly.
│   └── cn.js               ← Tailwind class merging helper.
│
├── hooks/
│   ├── useStudents.js      ← Student data access hook
│   └── useAssessments.js   ← Assessment data access hook
│
├── features/
│   ├── students/           ← Dashboard, student list, detail, results
│   ├── gst/                ← GST administration screen
│   └── passage/            ← Graded passage administration screen
│
├── components/
│   └── layout/
│       └── AppLayout.jsx   ← Persistent shell (header + bottom nav)
│
├── App.jsx                 ← Route definitions
└── main.jsx                ← Entry point
```

## Build Order (recommended)

1. ✅ Scaffold + constants + calculator + tests ← YOU ARE HERE
2. Student list — add/view students
3. GST form — 20-item scoring
4. Passage viewer — word-by-word miscue marking
5. Results summary — auto-calculated level display
6. PDF export — Form 3/4 generation

## Key Rules

- Never hardcode Phil-IRI numbers. Use `src/constants/philIRI.js`.
- Never call `localStorage` directly. Use `src/utils/storage.js`.
- Never call storage from a component. Use hooks in `src/hooks/`.
- Run `npx vitest` before changing `calculateReadingLevel.js`.
- Commit after each working feature, not at end of day.
