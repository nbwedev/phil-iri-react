// ─────────────────────────────────────────────────────────────────────────────
// Phil-IRI 2018 Specification Constants
// Source: DepEd Phil-IRI 2018 Manual
//
// THIS FILE IS SACRED.
// Never hardcode these numbers anywhere else in the app.
// If DepEd updates the spec, you change it HERE and only here.
// ─────────────────────────────────────────────────────────────────────────────

// ── GST (Group Screening Test) ───────────────────────────────────────────────

export const GST = {
  TOTAL_ITEMS: 20,

  // Scores below this cutoff trigger individual graded passage testing
  INDIVIDUAL_TESTING_CUTOFF: 14,

  // Grade levels where GST is administered
  FILIPINO_GRADES: [3, 4, 5, 6],
  ENGLISH_GRADES: [4, 5, 6],
}

// ── Reading Level Thresholds ──────────────────────────────────────────────────
// Table 7 from the Phil-IRI 2018 manual
// Both word accuracy AND comprehension must meet the threshold for a level.
// When they disagree, the LOWER level takes precedence.

export const READING_LEVELS = {
  INDEPENDENT: 'Independent',
  INSTRUCTIONAL: 'Instructional',
  FRUSTRATION: 'Frustration',
}

export const WORD_ACCURACY_THRESHOLDS = {
  // 97% and above → Independent
  INDEPENDENT_MIN: 97,
  // 90–96% → Instructional
  INSTRUCTIONAL_MIN: 90,
  INSTRUCTIONAL_MAX: 96,
  // 89% and below → Frustration
  FRUSTRATION_MAX: 89,
}

export const COMPREHENSION_THRESHOLDS = {
  // 80–100% → Independent
  INDEPENDENT_MIN: 80,
  // 59–79% → Instructional
  INSTRUCTIONAL_MIN: 59,
  INSTRUCTIONAL_MAX: 79,
  // 58% and below → Frustration
  FRUSTRATION_MAX: 58,
}

// ── Miscue Types ──────────────────────────────────────────────────────────────
// 7 categories as defined in the Phil-IRI manual.
// Self-corrections are noted but NOT counted as errors.

export const MISCUE_TYPES = [
  {
    id: 'mispronunciation',
    label: 'Mispronunciation',
    shortLabel: 'MP',
    description: 'Word is pronounced incorrectly',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    id: 'omission',
    label: 'Omission',
    shortLabel: 'OM',
    description: 'Word is skipped entirely',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    id: 'substitution',
    label: 'Substitution',
    shortLabel: 'SB',
    description: 'A different word is read in place of the printed word',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    id: 'insertion',
    label: 'Insertion',
    shortLabel: 'IN',
    description: 'An extra word is added that is not in the text',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'repetition',
    label: 'Repetition',
    shortLabel: 'RP',
    description: 'A word or phrase is repeated',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'transposition',
    label: 'Transposition',
    shortLabel: 'TR',
    description: 'Word order is reversed or rearranged',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    id: 'reversal',
    label: 'Reversal',
    shortLabel: 'RV',
    description: 'Letters within a word are reversed (e.g., "was" → "saw")',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
]

// ── Passage Configuration ─────────────────────────────────────────────────────

export const PASSAGE_CONFIG = {
  SETS: ['A', 'B', 'C', 'D'],
  FILIPINO_GRADE_RANGE: { min: 1, max: 7 },
  ENGLISH_GRADE_RANGE:  { min: 2, max: 7 },
  TYPES: ['narrative', 'expository'],
  // Narrative passages: Grades 1–4; Expository: Grades 5–7
  NARRATIVE_MAX_GRADE: 4,
}

export const LANGUAGES = {
  FILIPINO: 'Filipino',
  ENGLISH: 'English',
}

export const ASSESSMENT_STAGES = {
  PRETEST:  'pretest',
  POSTTEST: 'posttest',
}

// ── WPM Benchmarks (reference only — for display context) ────────────────────
// These are general reading fluency benchmarks by grade level.
// Phil-IRI uses WPM as a supplementary data point, not a level determinant.

export const WPM_BENCHMARKS = {
  1: { min: 40,  max: 60  },
  2: { min: 70,  max: 90  },
  3: { min: 90,  max: 110 },
  4: { min: 100, max: 120 },
  5: { min: 110, max: 130 },
  6: { min: 120, max: 140 },
  7: { min: 130, max: 150 },
}

// ── Storage Keys ──────────────────────────────────────────────────────────────
// All localStorage keys in one place.
// Prevents typos scattering "students" vs "student" across the codebase.

export const STORAGE_KEYS = {
  STUDENTS:    'philiri_students',
  ASSESSMENTS: 'philiri_assessments',
  CLASSES:     'philiri_classes',
  APP_VERSION: 'philiri_version',
}

export const APP_VERSION = '0.1.0'
