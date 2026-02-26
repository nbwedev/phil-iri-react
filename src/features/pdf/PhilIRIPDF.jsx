// ─────────────────────────────────────────────────────────────────────────────
// PhilIRIPDF.jsx
//
// PDF document components built with @react-pdf/renderer.
//
// Two forms are generated:
//   Form3A — Passage Rating Sheet (one per passage result)
//   Form4   — Individual Pupil's Reading Profile Summary
//
// IMPORTANT: @react-pdf/renderer uses its own layout engine.
// It is NOT HTML/CSS. Use only the components from the library:
//   Document, Page, View, Text, StyleSheet
//
// Rules for this file:
//   - No Tailwind classes (they don't work here)
//   - No regular React components (no buttons, no divs)
//   - Styles are defined with StyleSheet.create() at the bottom
//   - All measurements are in points (pt) by default
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import {
  Document, Page, View, Text, StyleSheet, Font
} from '@react-pdf/renderer'
import { MISCUE_TYPES, WPM_BENCHMARKS } from '../../constants/philIRI.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  } catch { return iso }
}

function levelColor(level) {
  if (level === 'Independent')   return '#16a34a'
  if (level === 'Instructional') return '#ca8a04'
  if (level === 'Frustration')   return '#dc2626'
  return '#6b7280'
}

function levelBg(level) {
  if (level === 'Independent')   return '#dcfce7'
  if (level === 'Instructional') return '#fef9c3'
  if (level === 'Frustration')   return '#fee2e2'
  return '#f3f4f6'
}

// Count miscues by type from a miscues array
function countMiscuesByType(miscues) {
  const counts = {}
  MISCUE_TYPES.forEach(t => { counts[t.id] = 0 })
  miscues?.forEach(m => {
    if (m.type && counts[m.type] !== undefined) counts[m.type]++
  })
  return counts
}

// ── Form 3A: Passage Rating Sheet ────────────────────────────────────────────

export function Form3ADocument({ student, assessment, passageResult }) {
  const miscueCounts = countMiscuesByType(passageResult?.miscues ?? [])

  return (
    <Document title={'Form 3A - ' + (student?.lastName ?? '') + ', ' + (student?.firstName ?? '')}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <Text style={styles.formLabel}>Republic of the Philippines</Text>
          <Text style={styles.formLabel}>Department of Education</Text>
          <Text style={styles.formTitle}>PHIL-IRI FORM 3A</Text>
          <Text style={styles.formSubtitle}>Graded Passage Rating Sheet</Text>
        </View>

        {/* ── Student info row ── */}
        <View style={styles.infoGrid}>
          <InfoField label="Name of Pupil" value={student?.lastName + ', ' + student?.firstName} flex={2} />
          <InfoField label="Grade" value={fmt(student?.gradeLevel)} />
          <InfoField label="Section" value={fmt(student?.section)} />
        </View>
        <View style={styles.infoGrid}>
          <InfoField label="LRN" value={fmt(student?.lrn)} flex={2} />
          <InfoField label="School Year" value={fmt(assessment?.schoolYear, new Date().getFullYear() + '–' + (new Date().getFullYear() + 1))} />
          <InfoField label="Date" value={fmtDate(passageResult?.completedAt)} />
        </View>
        <View style={styles.infoGrid}>
          <InfoField label="Language" value={fmt(passageResult?.language)} />
          <InfoField label="Passage Grade Level" value={'Grade ' + fmt(passageResult?.gradeLevel)} />
          <InfoField label="Passage Set" value={fmt(passageResult?.passageSet)} />
          <InfoField label="Stage" value={assessment?.stage === 'pretest' ? 'Pre-test' : 'Post-test'} />
        </View>

        {/* ── Reading metrics ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>READING PERFORMANCE</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricBox label="Total Words" value={fmt(passageResult?.totalWords)} />
          <MetricBox label="Miscue Count" value={fmt(passageResult?.miscueCount, '0')} />
          <MetricBox label="Word Accuracy" value={fmt(passageResult?.wordAccuracyPct) + '%'} />
          <MetricBox label="WPM" value={fmt(passageResult?.wpm)} />
        </View>

        <View style={styles.metricsGrid}>
          <MetricBox
            label="Correct Answers"
            value={fmt(passageResult?.correctCompCount) + ' / ' + fmt(passageResult?.totalQuestions)}
          />
          <MetricBox label="Comprehension" value={fmt(passageResult?.comprehensionPct) + '%'} />
          <MetricBox
            label="Word Accuracy Level"
            value={fmt(passageResult?.wordAccuracyLevel)}
            color={levelColor(passageResult?.wordAccuracyLevel)}
            bg={levelBg(passageResult?.wordAccuracyLevel)}
          />
          <MetricBox
            label="Comprehension Level"
            value={fmt(passageResult?.comprehensionLevel)}
            color={levelColor(passageResult?.comprehensionLevel)}
            bg={levelBg(passageResult?.comprehensionLevel)}
          />
        </View>

        {/* ── Final reading level ── */}
        <View style={[styles.levelBanner, { backgroundColor: levelBg(passageResult?.readingLevel), borderColor: levelColor(passageResult?.readingLevel) }]}>
          <Text style={styles.levelBannerLabel}>FINAL READING LEVEL</Text>
          <Text style={[styles.levelBannerValue, { color: levelColor(passageResult?.readingLevel) }]}>
            {fmt(passageResult?.readingLevel, 'Not determined')}
          </Text>
        </View>

        {/* ── WPM benchmark note ── */}
        {passageResult?.gradeLevel && WPM_BENCHMARKS[passageResult.gradeLevel] && (
          <Text style={styles.benchmarkNote}>
            Grade {passageResult.gradeLevel} WPM benchmark:{' '}
            {WPM_BENCHMARKS[passageResult.gradeLevel].min}–{WPM_BENCHMARKS[passageResult.gradeLevel].max} WPM
            {passageResult.wpm ? ' (student: ' + passageResult.wpm + ' WPM)' : ''}
          </Text>
        )}

        {/* ── Miscue inventory ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MISCUE INVENTORY</Text>
        </View>

        <View style={styles.miscueTable}>
          {/* Header row */}
          <View style={[styles.miscueRow, styles.miscueHeaderRow]}>
            <Text style={[styles.miscueCell, styles.miscueHeaderCell, { flex: 2 }]}>Miscue Type</Text>
            <Text style={[styles.miscueCell, styles.miscueHeaderCell]}>Code</Text>
            <Text style={[styles.miscueCell, styles.miscueHeaderCell]}>Count</Text>
            <Text style={[styles.miscueCell, styles.miscueHeaderCell, { flex: 2 }]}>Words Affected</Text>
          </View>

          {/* Data rows */}
          {MISCUE_TYPES.map((type, i) => {
            const count = miscueCounts[type.id] ?? 0
            const words = (passageResult?.miscues ?? [])
              .filter(m => m.type === type.id)
              .map(m => m.word)
              .join(', ')

            return (
              <View key={type.id} style={[styles.miscueRow, i % 2 === 0 ? styles.miscueRowEven : styles.miscueRowOdd]}>
                <Text style={[styles.miscueCell, { flex: 2 }]}>{type.label}</Text>
                <Text style={[styles.miscueCell, styles.miscueCellCenter]}>{type.shortLabel}</Text>
                <Text style={[styles.miscueCell, styles.miscueCellCenter]}>{count || '—'}</Text>
                <Text style={[styles.miscueCell, { flex: 2, fontSize: 7 }]}>{words || '—'}</Text>
              </View>
            )
          })}

          {/* Total row */}
          <View style={[styles.miscueRow, styles.miscueTotalRow]}>
            <Text style={[styles.miscueCell, { flex: 2 }, styles.miscueTotalCell]}>TOTAL MISCUES</Text>
            <Text style={[styles.miscueCell, styles.miscueCellCenter]}></Text>
            <Text style={[styles.miscueCell, styles.miscueCellCenter, styles.miscueTotalCell]}>
              {fmt(passageResult?.miscueCount, '0')}
            </Text>
            <Text style={[styles.miscueCell, { flex: 2 }]}></Text>
          </View>
        </View>

        {/* ── Comprehension questions ── */}
        {passageResult?.comprehensionAnswers && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>COMPREHENSION RESPONSES</Text>
            </View>
            <View style={styles.compTable}>
              <View style={[styles.miscueRow, styles.miscueHeaderRow]}>
                <Text style={[styles.miscueCell, styles.miscueHeaderCell]}>Q#</Text>
                <Text style={[styles.miscueCell, styles.miscueHeaderCell]}>Response</Text>
              </View>
              {Object.entries(passageResult.comprehensionAnswers).map(([qId, answer], i) => (
                <View key={qId} style={[styles.miscueRow, i % 2 === 0 ? styles.miscueRowEven : styles.miscueRowOdd]}>
                  <Text style={styles.miscueCell}>{i + 1}</Text>
                  <Text style={[styles.miscueCell,
                    answer === true  ? { color: '#16a34a', fontWeight: 'bold' } :
                    answer === false ? { color: '#dc2626', fontWeight: 'bold' } :
                    { color: '#9ca3af' }
                  ]}>
                    {answer === true ? 'Correct' : answer === false ? 'Incorrect' : 'Not answered'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Signature block ── */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine2} />
              <Text style={styles.signatureLabel}>Teacher's Signature over Printed Name</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine2} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Phil-IRI 2018 · Form 3A · Generated {fmtDate(new Date().toISOString())}
        </Text>

      </Page>
    </Document>
  )
}

// ── Form 4: Individual Pupil's Reading Profile ────────────────────────────────

export function Form4Document({ student, assessment, gstResults, passageResults }) {
  const filGST = gstResults.find(r => r.language === 'Filipino')
  const engGST = gstResults.find(r => r.language === 'English')

  const filPassage = passageResults.find(r => r.language === 'Filipino')
  const engPassage = passageResults.find(r => r.language === 'English')

  return (
    <Document title={'Form 4 - ' + (student?.lastName ?? '') + ', ' + (student?.firstName ?? '')}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <Text style={styles.formLabel}>Republic of the Philippines</Text>
          <Text style={styles.formLabel}>Department of Education</Text>
          <Text style={styles.formTitle}>PHIL-IRI FORM 4</Text>
          <Text style={styles.formSubtitle}>Individual Pupil's Phil-IRI Reading Profile</Text>
        </View>

        {/* ── Student info ── */}
        <View style={styles.infoGrid}>
          <InfoField label="Name of Pupil" value={(student?.lastName ?? '') + ', ' + (student?.firstName ?? '')} flex={3} />
          <InfoField label="Grade" value={fmt(student?.gradeLevel)} />
        </View>
        <View style={styles.infoGrid}>
          <InfoField label="LRN" value={fmt(student?.lrn)} flex={2} />
          <InfoField label="Section" value={fmt(student?.section)} />
          <InfoField label="School Year" value={fmt(assessment?.schoolYear, new Date().getFullYear() + '–' + (new Date().getFullYear() + 1))} />
        </View>
        <View style={styles.infoGrid}>
          <InfoField label="Stage" value={assessment?.stage === 'pretest' ? 'Pre-test' : 'Post-test'} />
          <InfoField label="Date Administered" value={fmtDate(assessment?.completedAt)} />
          <InfoField label="Final Reading Level" value={fmt(assessment?.finalLevel)} />
        </View>

        {/* ── GST Summary ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GROUP SCREENING TEST (GST) RESULTS</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricBox
            label="Filipino GST Score"
            value={filGST ? filGST.score + ' / 20' : 'Not administered'}
            sub={filGST ? (filGST.triggersIndividual ? 'Requires individual testing' : 'Passed') : ''}
          />
          <MetricBox
            label="English GST Score"
            value={engGST ? engGST.score + ' / 20' : 'Not administered'}
            sub={engGST ? (engGST.triggersIndividual ? 'Requires individual testing' : 'Passed') : ''}
          />
        </View>

        {/* ── Passage summary table ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GRADED PASSAGE RESULTS</Text>
        </View>

        <View style={styles.passageTable}>
          {/* Header */}
          <View style={[styles.miscueRow, styles.miscueHeaderRow]}>
            <Text style={[styles.passageCell, styles.miscueHeaderCell, { flex: 2 }]}>Language</Text>
            <Text style={[styles.passageCell, styles.miscueHeaderCell]}>Grade</Text>
            <Text style={[styles.passageCell, styles.miscueHeaderCell]}>Accuracy</Text>
            <Text style={[styles.passageCell, styles.miscueHeaderCell]}>Comp.</Text>
            <Text style={[styles.passageCell, styles.miscueHeaderCell]}>WPM</Text>
            <Text style={[styles.passageCell, styles.miscueHeaderCell, { flex: 2 }]}>Level</Text>
          </View>

          {/* Filipino row */}
          <PassageRow language="Filipino" result={filPassage} />
          {/* English row */}
          <PassageRow language="English"  result={engPassage} />
        </View>

        {/* ── Reading level legend ── */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>READING LEVEL CRITERIA (Table 7)</Text>
          <View style={styles.legendRow}>
            <LegendItem
              level="Independent"
              waRange="97–100%"
              compRange="80–100%"
              color="#16a34a"
              bg="#dcfce7"
            />
            <LegendItem
              level="Instructional"
              waRange="90–96%"
              compRange="59–79%"
              color="#ca8a04"
              bg="#fef9c3"
            />
            <LegendItem
              level="Frustration"
              waRange="≤89%"
              compRange="≤58%"
              color="#dc2626"
              bg="#fee2e2"
            />
          </View>
        </View>

        {/* ── Teacher observations ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TEACHER'S OBSERVATIONS</Text>
        </View>
        <View style={styles.observationBox}>
          <Text style={styles.observationPrompt}>Strengths:</Text>
          <View style={styles.writingLines}>
            {[0,1,2].map(i => <View key={i} style={styles.writingLine} />)}
          </View>
          <Text style={[styles.observationPrompt, { marginTop: 8 }]}>Areas for Improvement:</Text>
          <View style={styles.writingLines}>
            {[0,1,2].map(i => <View key={i} style={styles.writingLine} />)}
          </View>
          <Text style={[styles.observationPrompt, { marginTop: 8 }]}>Recommended Interventions:</Text>
          <View style={styles.writingLines}>
            {[0,1,2].map(i => <View key={i} style={styles.writingLine} />)}
          </View>
        </View>

        {/* ── Signature block ── */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine2} />
              <Text style={styles.signatureLabel}>Prepared by (Teacher)</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine2} />
              <Text style={styles.signatureLabel}>Noted by (School Head)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Phil-IRI 2018 · Form 4 · Generated {fmtDate(new Date().toISOString())}
        </Text>

      </Page>
    </Document>
  )
}

// ── Reusable PDF sub-components ───────────────────────────────────────────────

function InfoField({ label, value, flex = 1 }) {
  return (
    <View style={[styles.infoField, { flex }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  )
}

function MetricBox({ label, value, sub, color, bg }) {
  return (
    <View style={[styles.metricBox, bg ? { backgroundColor: bg } : {}]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : {}]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  )
}

function PassageRow({ language, result }) {
  const isEven = language === 'Filipino'
  return (
    <View style={[styles.miscueRow, isEven ? styles.miscueRowEven : styles.miscueRowOdd]}>
      <Text style={[styles.passageCell, { flex: 2 }]}>{language}</Text>
      <Text style={styles.passageCell}>{result ? 'Grade ' + result.gradeLevel : '—'}</Text>
      <Text style={styles.passageCell}>{result ? result.wordAccuracyPct + '%' : '—'}</Text>
      <Text style={styles.passageCell}>{result ? result.comprehensionPct + '%' : '—'}</Text>
      <Text style={styles.passageCell}>{result ? result.wpm + '' : '—'}</Text>
      <Text style={[styles.passageCell, { flex: 2, color: levelColor(result?.readingLevel), fontWeight: 'bold' }]}>
        {result ? result.readingLevel : 'Not administered'}
      </Text>
    </View>
  )
}

function LegendItem({ level, waRange, compRange, color, bg }) {
  return (
    <View style={[styles.legendItem, { backgroundColor: bg, borderColor: color }]}>
      <Text style={[styles.legendLevel, { color }]}>{level}</Text>
      <Text style={styles.legendRange}>Word Accuracy: {waRange}</Text>
      <Text style={styles.legendRange}>Comprehension: {compRange}</Text>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 36,
    color: '#1f2937',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e40af',
    paddingBottom: 8,
  },
  formLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textAlign: 'center',
    marginTop: 2,
  },
  formSubtitle: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  infoField: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  sectionHeader: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 6.5,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 1,
  },
  levelBanner: {
    borderWidth: 1.5,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  levelBannerLabel: {
    fontSize: 7,
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 2,
  },
  levelBannerValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  benchmarkNote: {
    fontSize: 7.5,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  miscueTable: {
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  passageTable: {
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  compTable: {
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miscueRow: {
    flexDirection: 'row',
  },
  miscueHeaderRow: {
    backgroundColor: '#374151',
  },
  miscueRowEven: {
    backgroundColor: '#ffffff',
  },
  miscueRowOdd: {
    backgroundColor: '#f9fafb',
  },
  miscueTotalRow: {
    backgroundColor: '#f3f4f6',
    borderTopWidth: 0.5,
    borderTopColor: '#d1d5db',
  },
  miscueCell: {
    flex: 1,
    fontSize: 8,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: '#e5e7eb',
    color: '#374151',
  },
  miscueHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
  },
  miscueCellCenter: {
    textAlign: 'center',
  },
  miscueTotalCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  passageCell: {
    flex: 1,
    fontSize: 8,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: '#e5e7eb',
    color: '#374151',
  },
  legend: {
    marginTop: 8,
    marginBottom: 6,
  },
  legendTitle: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 6,
  },
  legendItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 6,
  },
  legendLevel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  legendRange: {
    fontSize: 7,
    color: '#374151',
  },
  observationBox: {
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  observationPrompt: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 3,
  },
  writingLines: {
    gap: 8,
  },
  writingLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    height: 12,
  },
  signatureBlock: {
    marginTop: 12,
    marginBottom: 8,
  },
  signatureLine: {
    flexDirection: 'row',
    gap: 20,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine2: {
    borderBottomWidth: 0.75,
    borderBottomColor: '#374151',
    marginBottom: 3,
    height: 20,
  },
  signatureLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 7,
    color: '#d1d5db',
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 4,
  },
})
