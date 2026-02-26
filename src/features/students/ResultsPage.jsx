// ─────────────────────────────────────────────────────────────────────────────
// ResultsPage.jsx
//
// Assessment results screen — the final destination in the workflow.
//
// Shows:
//   - Final reading level (large, colour-coded)
//   - GST results for each language
//   - Passage result breakdown (accuracy, comprehension, WPM, miscues)
//   - Two PDF download buttons: Form 3A and Form 4
//
// URL: /students/:studentId/results?assessmentId=xxx
//
// PDF generation happens entirely in the browser via @react-pdf/renderer.
// No server required. File never leaves the device.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import {
  ArrowLeft, Download, FileText,
  CheckCircle2, XCircle, BookOpen, Clock
} from 'lucide-react'
import { useResults }     from '../../hooks/useResults.js'
import { Form3ADocument, Form4Document } from '../pdf/PhilIRIPDF.jsx'
import { MISCUE_TYPES, WPM_BENCHMARKS }  from '../../constants/philIRI.js'
import { cn } from '../../utils/cn.js'

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { studentId }    = useParams()
  const [searchParams]   = useSearchParams()
  const navigate         = useNavigate()
  const assessmentId     = searchParams.get('assessmentId')

  const { data, loading, error } = useResults(studentId, assessmentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 text-sm">{error ?? 'Results not found.'}</p>
        <button
          onClick={() => navigate('/students/' + studentId)}
          className="mt-4 text-brand-600 text-sm hover:underline"
        >
          Back to student
        </button>
      </div>
    )
  }

  const { student, assessment, gstResults, passageResults } = data
  const passageResult = passageResults[0] ?? null // primary passage result

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate('/students/' + studentId)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 -ml-1 min-h-tap"
      >
        <ArrowLeft className="w-4 h-4" />
        {student.firstName} {student.lastName}
      </button>

      {/* ── Final level ── */}
      <LevelCard
        level={assessment.finalLevel}
        student={student}
        stage={assessment.stage}
        date={assessment.completedAt}
      />

      {/* ── GST results ── */}
      {gstResults.length > 0 && (
        <Section title="Group Screening Test">
          <div className="space-y-2">
            {gstResults.map(gst => (
              <GSTResultRow key={gst.id} result={gst} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Passage results ── */}
      {passageResults.length > 0 && (
        <Section title="Graded Passage">
          <div className="space-y-4">
            {passageResults.map(pr => (
              <PassageResultCard key={pr.id} result={pr} />
            ))}
          </div>
        </Section>
      )}

      {/* ── PDF Export ── */}
      <Section title="Export">
        <div className="space-y-2">
          {passageResult && (
            <PDFDownloadButton
              label="Download Form 3A"
              description="Passage Rating Sheet"
              filename={'Form3A_' + student.lastName + '_' + student.firstName + '.pdf'}
              buildDoc={() => (
                <Form3ADocument
                  student={student}
                  assessment={assessment}
                  passageResult={passageResult}
                />
              )}
            />
          )}
          <PDFDownloadButton
            label="Download Form 4"
            description="Individual Reading Profile"
            filename={'Form4_' + student.lastName + '_' + student.firstName + '.pdf'}
            buildDoc={() => (
              <Form4Document
                student={student}
                assessment={assessment}
                gstResults={gstResults}
                passageResults={passageResults}
              />
            )}
          />
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          PDFs are generated on your device. No data is sent to any server.
        </p>
      </Section>

      {/* ── Done ── */}
      <div className="pb-4">
        <button
          onClick={() => navigate('/students/' + studentId)}
          className="w-full py-3.5 bg-brand-700 text-white rounded-2xl font-semibold text-sm hover:bg-brand-800 active:scale-[0.98] transition-all shadow-sm"
        >
          Back to Student
        </button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Level card ────────────────────────────────────────────────────────────────

function LevelCard({ level, student, stage, date }) {
  const colors = {
    Independent:   'bg-independent-light border-independent text-independent-dark',
    Instructional: 'bg-instructional-light border-instructional text-instructional-dark',
    Frustration:   'bg-frustration-light border-frustration text-frustration-dark',
  }

  const stageLabel = stage === 'pretest' ? 'Pre-test' : 'Post-test'

  return (
    <div className={cn(
      'rounded-2xl p-6 text-center border-2',
      colors[level] ?? 'bg-gray-50 border-gray-200 text-gray-700'
    )}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">
        {stageLabel} · Final Reading Level
      </p>
      <p className="text-4xl font-black mb-1">
        {level ?? 'Incomplete'}
      </p>
      <p className="text-sm opacity-60">
        {student.firstName} {student.lastName} · Grade {student.gradeLevel}
      </p>
      {date && (
        <p className="text-xs opacity-40 mt-1">
          {new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  )
}

// ── GST result row ────────────────────────────────────────────────────────────

function GSTResultRow({ result }) {
  const passed   = !result.triggersIndividual
  const pct      = Math.round((result.score / result.totalItems) * 100)

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4">
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        passed ? 'bg-emerald-50' : 'bg-amber-50'
      )}>
        {passed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <BookOpen     className="w-5 h-5 text-amber-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{result.language}</p>
        <p className="text-xs text-gray-400">
          {passed ? 'Passed — no individual testing needed' : 'Individual passage testing required'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-gray-900">{result.score}<span className="text-sm font-normal text-gray-400">/{result.totalItems}</span></p>
        <p className="text-xs text-gray-400">{pct}%</p>
      </div>
    </div>
  )
}

// ── Passage result card ───────────────────────────────────────────────────────

function PassageResultCard({ result }) {
  const levelColors = {
    Independent:   'bg-independent-light text-independent-dark border-independent',
    Instructional: 'bg-instructional-light text-instructional-dark border-instructional',
    Frustration:   'bg-frustration-light text-frustration-dark border-frustration',
  }

  const gradeWpm    = WPM_BENCHMARKS[result.gradeLevel]
  const miscueCounts = {}
  MISCUE_TYPES.forEach(t => { miscueCounts[t.id] = 0 })
  result.miscues?.forEach(m => {
    if (m.type) miscueCounts[m.type] = (miscueCounts[m.type] ?? 0) + 1
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">{result.language}</p>
          <p className="text-xs text-gray-400">Grade {result.gradeLevel} Passage · Set {result.passageSet}</p>
        </div>
        <span className={cn(
          'text-xs font-bold px-2.5 py-1 rounded-full border',
          levelColors[result.readingLevel] ?? 'bg-gray-100 text-gray-600 border-gray-200'
        )}>
          {result.readingLevel}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
        <MetricCell label="Word Accuracy" value={result.wordAccuracyPct + '%'} sub={result.wordAccuracyLevel} />
        <MetricCell label="Comprehension" value={result.comprehensionPct + '%'} sub={result.correctCompCount + '/' + result.totalQuestions + ' correct · ' + result.comprehensionLevel} />
        <MetricCell
          label="Words Per Minute"
          value={result.wpm + ' WPM'}
          sub={gradeWpm ? 'Benchmark: ' + gradeWpm.min + '–' + gradeWpm.max : undefined}
        />
        <MetricCell
          label="Miscues"
          value={result.miscueCount + ' error' + (result.miscueCount !== 1 ? 's' : '')}
          sub={result.miscueCount > 0 ? 'See breakdown below' : 'No miscues recorded'}
        />
      </div>

      {/* Miscue breakdown — only shown if there were errors */}
      {result.miscueCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Miscue Breakdown</p>
          <div className="flex flex-wrap gap-1.5">
            {MISCUE_TYPES.filter(t => miscueCounts[t.id] > 0).map(t => (
              <span
                key={t.id}
                className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', t.color)}
              >
                {t.shortLabel}: {miscueCounts[t.id]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reading time */}
      {result.readingTimeMs > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          Reading time: {Math.floor(result.readingTimeMs / 60000)}m {Math.floor((result.readingTimeMs % 60000) / 1000)}s
        </div>
      )}

    </div>
  )
}

// ── PDF download button ───────────────────────────────────────────────────────
// Generates the PDF on demand (not on page load) to avoid blocking the UI.
// Uses the @react-pdf/renderer `pdf()` function to get a blob, then
// creates a temporary <a> element to trigger the browser download.

function PDFDownloadButton({ label, description, filename, buildDoc }) {
  const [generating, setGenerating] = useState(false)
  const [error,       setError]       = useState(null)

  async function handleDownload() {
    setGenerating(true)
    setError(null)
    try {
      // Build the PDF document
      const doc     = buildDoc()
      // Generate blob — this is the CPU-intensive step
      const blob    = await pdf(doc).toBlob()
      // Create a temporary URL and trigger download
      const url     = URL.createObjectURL(blob)
      const anchor  = document.createElement('a')
      anchor.href   = url
      anchor.download = filename
      anchor.click()
      // Clean up
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('[PDF] Generation failed:', e)
      setError('PDF generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={generating}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-4 bg-white border rounded-2xl text-left',
          'hover:border-brand-300 hover:shadow-sm active:scale-[0.99] transition-all',
          generating ? 'opacity-70 cursor-wait border-gray-100' : 'border-gray-100'
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          {generating
            ? <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            : <FileText className="w-5 h-5 text-brand-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{generating ? 'Generating PDF…' : description}</p>
        </div>
        {!generating && <Download className="w-4 h-4 text-gray-300 shrink-0" />}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 px-2">{error}</p>
      )}
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

function MetricCell({ label, value, sub }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
