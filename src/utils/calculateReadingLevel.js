// ─────────────────────────────────────────────────────────────────────────────
// calculateReadingLevel.js
//
// Pure utility function. No React. No side effects. No imports from components.
// Input:  wordAccuracyPct (number), comprehensionPct (number)
// Output: 'Independent' | 'Instructional' | 'Frustration'
//
// Rule: When word accuracy and comprehension indicate DIFFERENT levels,
// the LOWER level wins. A student is only Independent if BOTH criteria
// meet the Independent threshold.
// ─────────────────────────────────────────────────────────────────────────────

import {
  READING_LEVELS,
  WORD_ACCURACY_THRESHOLDS as WA,
  COMPREHENSION_THRESHOLDS as CP,
} from '../constants/philIRI.js'

const { INDEPENDENT, INSTRUCTIONAL, FRUSTRATION } = READING_LEVELS

/**
 * Determines reading level from word accuracy percentage.
 * @param {number} pct - Word accuracy as a percentage (0–100)
 * @returns {'Independent'|'Instructional'|'Frustration'}
 */
function levelFromWordAccuracy(pct) {
  if (pct >= WA.INDEPENDENT_MIN)  return INDEPENDENT
  if (pct >= WA.INSTRUCTIONAL_MIN) return INSTRUCTIONAL
  return FRUSTRATION
}

/**
 * Determines reading level from comprehension percentage.
 * @param {number} pct - Comprehension as a percentage (0–100)
 * @returns {'Independent'|'Instructional'|'Frustration'}
 */
function levelFromComprehension(pct) {
  if (pct >= CP.INDEPENDENT_MIN)  return INDEPENDENT
  if (pct >= CP.INSTRUCTIONAL_MIN) return INSTRUCTIONAL
  return FRUSTRATION
}

/**
 * Returns the lower of two reading levels.
 * Priority order (lowest to highest): Frustration < Instructional < Independent
 */
function lowerLevel(levelA, levelB) {
  const priority = {
    [FRUSTRATION]:   0,
    [INSTRUCTIONAL]: 1,
    [INDEPENDENT]:   2,
  }
  return priority[levelA] <= priority[levelB] ? levelA : levelB
}

/**
 * Calculates the final Phil-IRI reading level.
 *
 * @param {number} wordAccuracyPct  - e.g. 96.8
 * @param {number} comprehensionPct - e.g. 80
 * @returns {{ level: string, wordAccuracyLevel: string, comprehensionLevel: string }}
 */
export function calculateReadingLevel(wordAccuracyPct, comprehensionPct) {
  const wordAccuracyLevel  = levelFromWordAccuracy(wordAccuracyPct)
  const comprehensionLevel = levelFromComprehension(comprehensionPct)
  const level              = lowerLevel(wordAccuracyLevel, comprehensionLevel)

  return {
    level,               // final verdict
    wordAccuracyLevel,   // for display / breakdown
    comprehensionLevel,  // for display / breakdown
  }
}

/**
 * Calculates word accuracy percentage from raw counts.
 *
 * @param {number} totalWords  - Total words in the passage
 * @param {number} miscueCount - Number of errors (self-corrections excluded)
 * @returns {number} Rounded to 1 decimal place
 */
export function calculateWordAccuracyPct(totalWords, miscueCount) {
  if (totalWords <= 0) return 0
  const correct = totalWords - miscueCount
  return Math.round((correct / totalWords) * 1000) / 10
}

/**
 * Calculates comprehension percentage from raw score.
 *
 * @param {number} correct - Number of correct answers
 * @param {number} total   - Total number of questions
 * @returns {number} Rounded to nearest whole number
 */
export function calculateComprehensionPct(correct, total) {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Calculates Words Per Minute from passage length and reading time.
 *
 * @param {number} totalWords    - Total words in the passage
 * @param {number} readingTimeMs - Time taken in milliseconds
 * @returns {number} WPM rounded to nearest whole number
 */
export function calculateWPM(totalWords, readingTimeMs) {
  if (readingTimeMs <= 0) return 0
  const minutes = readingTimeMs / 60000
  return Math.round(totalWords / minutes)
}

/**
 * Checks if a GST score triggers individual passage testing.
 *
 * @param {number} score - Raw GST score (0–20)
 * @returns {boolean}
 */
export function gstTriggersIndividual(score) {
  // Import inline to keep this file self-contained for testing
  return score < 14
}
