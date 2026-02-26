// ─────────────────────────────────────────────────────────────────────────────
// useResults.js
//
// Loads and assembles all data for a completed assessment session:
//   - The assessment record
//   - GST results (Filipino + English)
//   - Passage results
//   - The student record
//
// ResultsPage calls this hook and gets a single clean object to render
// and pass to the PDF generator.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { getStudents, getAssessments, getGSTResultsForAssessment, getPassageResultsForAssessment } from '../utils/storage.js'

export function useResults(studentId, assessmentId) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!studentId || !assessmentId) {
      setError('Missing studentId or assessmentId')
      setLoading(false)
      return
    }

    try {
      const student    = getStudents().find(s => s.id === studentId) ?? null
      const assessment = getAssessments().find(a => a.id === assessmentId) ?? null
      const gstResults = getGSTResultsForAssessment(assessmentId)
      const passageResults = getPassageResultsForAssessment(assessmentId)

      if (!student)    { setError('Student not found');    setLoading(false); return }
      if (!assessment) { setError('Assessment not found'); setLoading(false); return }

      setData({ student, assessment, gstResults, passageResults })
    } catch (e) {
      setError('Failed to load results: ' + e.message)
    }

    setLoading(false)
  }, [studentId, assessmentId])

  return { data, loading, error }
}
