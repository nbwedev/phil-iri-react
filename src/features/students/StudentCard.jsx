// ─────────────────────────────────────────────────────────────────────────────
// StudentCard.jsx
//
// Displays a single student in the list.
// Tapping it navigates to the student's detail page.
//
// Props:
//   student — student object from useStudents()
//   onDelete(id) — called when delete is confirmed
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Trash2, BookOpen, AlertTriangle } from 'lucide-react'

export default function StudentCard({ student, onDelete }) {
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const displayName = `${student.lastName}, ${student.firstName}`
  const initials    = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase()

  function handleCardClick() {
    if (confirmingDelete) return // don't navigate while confirming delete
    navigate(`/students/${student.id}`)
  }

  function handleDeleteClick(e) {
    e.stopPropagation() // prevent card navigation
    setConfirmingDelete(true)
  }

  function handleConfirmDelete(e) {
    e.stopPropagation()
    onDelete(student.id)
  }

  function handleCancelDelete(e) {
    e.stopPropagation()
    setConfirmingDelete(false)
  }

  // ── Delete confirmation inline (no modal needed) ──
  if (confirmingDelete) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-700 flex-1">
          Delete <strong>{displayName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCancelDelete}
            className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-h-tap"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-tap"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleCardClick}
      className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-200 hover:shadow-sm active:scale-[0.99] transition-all text-left group"
    >

      {/* ── Avatar ── */}
      <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm shrink-0">
        {initials}
      </div>

      {/* ── Student info ── */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">Grade {student.gradeLevel}</span>
          {student.section && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{student.section}</span>
            </>
          )}
        </div>
        {student.lrn && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{student.lrn}</p>
        )}
      </div>

      {/* ── Right side actions ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Delete button — only visible on hover (desktop) or always (touch) */}
        <button
          onClick={handleDeleteClick}
          className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 min-h-tap min-w-tap flex items-center justify-center"
          aria-label={`Delete ${displayName}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" />
      </div>

    </button>
  )
}
