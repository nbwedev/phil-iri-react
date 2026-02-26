// ─────────────────────────────────────────────────────────────────────────────
// calculateReadingLevel.test.js
//
// Run with: npx vitest
//
// These tests are the single most important tests in the project.
// A bug here affects a child's educational diagnosis.
// Never delete or skip these tests.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  calculateReadingLevel,
  calculateWordAccuracyPct,
  calculateComprehensionPct,
  calculateWPM,
  gstTriggersIndividual,
} from './calculateReadingLevel.js'

// ── calculateReadingLevel ────────────────────────────────────────────────────

describe('calculateReadingLevel', () => {

  // Happy path — clear Independent
  it('returns Independent when both criteria are clearly met', () => {
    const result = calculateReadingLevel(99, 90)
    expect(result.level).toBe('Independent')
  })

  // Happy path — clear Instructional
  it('returns Instructional when both criteria are in instructional range', () => {
    const result = calculateReadingLevel(93, 70)
    expect(result.level).toBe('Instructional')
  })

  // Happy path — clear Frustration
  it('returns Frustration when both criteria are below threshold', () => {
    const result = calculateReadingLevel(80, 40)
    expect(result.level).toBe('Frustration')
  })

  // ── Exact boundary values (the dangerous ones) ───────────────────────────

  it('returns Independent at exactly 97% word accuracy and 80% comprehension', () => {
    expect(calculateReadingLevel(97, 80).level).toBe('Independent')
  })

  it('returns Instructional at exactly 96% word accuracy (one below Independent)', () => {
    expect(calculateReadingLevel(96, 80).level).toBe('Instructional')
  })

  it('returns Instructional at exactly 90% word accuracy', () => {
    expect(calculateReadingLevel(90, 70).level).toBe('Instructional')
  })

  it('returns Frustration at exactly 89% word accuracy (one below Instructional)', () => {
    expect(calculateReadingLevel(89, 70).level).toBe('Frustration')
  })

  it('returns Independent at exactly 80% comprehension', () => {
    expect(calculateReadingLevel(97, 80).level).toBe('Independent')
  })

  it('returns Instructional at exactly 79% comprehension (one below Independent)', () => {
    expect(calculateReadingLevel(97, 79).level).toBe('Instructional')
  })

  it('returns Instructional at exactly 59% comprehension', () => {
    expect(calculateReadingLevel(97, 59).level).toBe('Instructional')
  })

  it('returns Frustration at exactly 58% comprehension (one below Instructional)', () => {
    expect(calculateReadingLevel(97, 58).level).toBe('Frustration')
  })

  // ── Disagreement cases (lower level wins) ────────────────────────────────

  it('returns Instructional when word accuracy is Independent but comprehension is Instructional', () => {
    // Word accuracy 97% = Independent, comprehension 70% = Instructional
    // Lower level (Instructional) wins
    const result = calculateReadingLevel(97, 70)
    expect(result.level).toBe('Instructional')
    expect(result.wordAccuracyLevel).toBe('Independent')
    expect(result.comprehensionLevel).toBe('Instructional')
  })

  it('returns Frustration when word accuracy is Instructional but comprehension is Frustration', () => {
    const result = calculateReadingLevel(93, 50)
    expect(result.level).toBe('Frustration')
  })

  it('returns Frustration when word accuracy is Independent but comprehension is Frustration', () => {
    const result = calculateReadingLevel(98, 40)
    expect(result.level).toBe('Frustration')
  })

  it('returns Instructional when word accuracy is Frustration but comprehension is Independent', () => {
    // Uncommon but possible — lower level (Frustration) wins
    const result = calculateReadingLevel(85, 90)
    expect(result.level).toBe('Frustration')
  })

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('returns Frustration at 0% word accuracy', () => {
    expect(calculateReadingLevel(0, 0).level).toBe('Frustration')
  })

  it('returns Independent at 100% word accuracy and 100% comprehension', () => {
    expect(calculateReadingLevel(100, 100).level).toBe('Independent')
  })

  // ── Return shape ──────────────────────────────────────────────────────────

  it('always returns an object with level, wordAccuracyLevel, and comprehensionLevel', () => {
    const result = calculateReadingLevel(95, 75)
    expect(result).toHaveProperty('level')
    expect(result).toHaveProperty('wordAccuracyLevel')
    expect(result).toHaveProperty('comprehensionLevel')
  })
})

// ── calculateWordAccuracyPct ──────────────────────────────────────────────────

describe('calculateWordAccuracyPct', () => {

  it('returns 100 when there are zero miscues', () => {
    expect(calculateWordAccuracyPct(100, 0)).toBe(100)
  })

  it('calculates correctly with known values', () => {
    // 124 words, 4 miscues → 120/124 = 96.8%
    expect(calculateWordAccuracyPct(124, 4)).toBe(96.8)
  })

  it('returns 0 when all words are miscues', () => {
    expect(calculateWordAccuracyPct(50, 50)).toBe(0)
  })

  it('returns 0 when totalWords is 0 (prevents division by zero)', () => {
    expect(calculateWordAccuracyPct(0, 0)).toBe(0)
  })

  it('rounds to 1 decimal place', () => {
    // 10 words, 1 miscue → 9/10 = 90.0
    expect(calculateWordAccuracyPct(10, 1)).toBe(90)
  })
})

// ── calculateComprehensionPct ─────────────────────────────────────────────────

describe('calculateComprehensionPct', () => {

  it('returns 100 when all answers are correct', () => {
    expect(calculateComprehensionPct(5, 5)).toBe(100)
  })

  it('returns 80 for 4 out of 5 correct', () => {
    expect(calculateComprehensionPct(4, 5)).toBe(80)
  })

  it('returns 60 for 3 out of 5 correct', () => {
    expect(calculateComprehensionPct(3, 5)).toBe(60)
  })

  it('returns 0 when no answers are correct', () => {
    expect(calculateComprehensionPct(0, 5)).toBe(0)
  })

  it('returns 0 when total is 0 (prevents division by zero)', () => {
    expect(calculateComprehensionPct(0, 0)).toBe(0)
  })
})

// ── calculateWPM ──────────────────────────────────────────────────────────────

describe('calculateWPM', () => {

  it('calculates WPM correctly for a 1-minute reading', () => {
    expect(calculateWPM(100, 60000)).toBe(100)
  })

  it('calculates WPM correctly for a 90-second reading', () => {
    // 120 words in 90 seconds = 80 WPM
    expect(calculateWPM(120, 90000)).toBe(80)
  })

  it('returns 0 when reading time is 0 (prevents division by zero)', () => {
    expect(calculateWPM(100, 0)).toBe(0)
  })

  it('rounds to nearest whole number', () => {
    // 100 words in 65 seconds = 92.3... → 92
    expect(calculateWPM(100, 65000)).toBe(92)
  })
})

// ── gstTriggersIndividual ─────────────────────────────────────────────────────

describe('gstTriggersIndividual', () => {

  it('returns true for score of 13 (below cutoff of 14)', () => {
    expect(gstTriggersIndividual(13)).toBe(true)
  })

  it('returns false for score of 14 (at cutoff)', () => {
    expect(gstTriggersIndividual(14)).toBe(false)
  })

  it('returns false for score of 20 (perfect)', () => {
    expect(gstTriggersIndividual(20)).toBe(false)
  })

  it('returns true for score of 0', () => {
    expect(gstTriggersIndividual(0)).toBe(true)
  })

  it('returns true for score of 1', () => {
    expect(gstTriggersIndividual(1)).toBe(true)
  })
})
