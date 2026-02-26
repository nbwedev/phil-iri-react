// ─────────────────────────────────────────────────────────────────────────────
// AddStudentForm.jsx
//
// A controlled form for adding a new student.
//
// "Controlled form" means React state owns every input value.
// The form never reads from the DOM — it only reads from state.
// This is the standard React pattern for forms.
//
// Props:
//   onAdd(studentData) — called when form is submitted successfully
//   onCancel()         — called when user dismisses the form
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { cn } from '../../utils/cn.js'

// Grade levels Phil-IRI covers
const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

// The shape of a blank form — defined once so we can reset easily
const EMPTY_FORM = {
  lastName:   '',
  firstName:  '',
  lrn:        '',   // DepEd Learner Reference Number (12 digits)
  gradeLevel: '',
  section:    '',
}

export default function AddStudentForm({ onAdd, onCancel }) {
  // One state object for the whole form — simpler than one useState per field
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // Generic change handler — works for every input
  // "name" matches the key in EMPTY_FORM exactly
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear the error for this field as soon as the user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate before saving — returns true if form is valid
  function validate() {
    const newErrors = {}

    if (!form.firstName.trim())  newErrors.firstName  = 'First name is required.'
    if (!form.lastName.trim())   newErrors.lastName   = 'Last name is required.'
    if (!form.gradeLevel)        newErrors.gradeLevel = 'Grade level is required.'

    // LRN is optional but if provided must be exactly 12 digits
    if (form.lrn && !/^\d{12}$/.test(form.lrn)) {
      newErrors.lrn = 'LRN must be exactly 12 digits.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    onAdd({
      firstName:  form.firstName.trim(),
      lastName:   form.lastName.trim(),
      lrn:        form.lrn.trim(),
      gradeLevel: Number(form.gradeLevel),
      section:    form.section.trim(),
    })

    // Reset form after successful submit
    setForm(EMPTY_FORM)
    setErrors({})
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-brand-50">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-700" />
          <h2 className="text-base font-semibold text-brand-900">Add New Student</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-h-tap min-w-tap flex items-center justify-center"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Form body ── */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

        {/* Name row — side by side on wider screens, stacked on small */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Last Name"
            required
            error={errors.lastName}
          >
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="dela Cruz"
              className={inputClass(errors.lastName)}
              autoComplete="family-name"
            />
          </Field>

          <Field
            label="First Name"
            required
            error={errors.firstName}
          >
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Juan"
              className={inputClass(errors.firstName)}
              autoComplete="given-name"
            />
          </Field>
        </div>

        {/* Grade + Section row */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Grade Level"
            required
            error={errors.gradeLevel}
          >
            <select
              name="gradeLevel"
              value={form.gradeLevel}
              onChange={handleChange}
              className={inputClass(errors.gradeLevel)}
            >
              <option value="">Select grade</option>
              {GRADE_OPTIONS.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </Field>

          <Field label="Section" error={errors.section}>
            <input
              type="text"
              name="section"
              value={form.section}
              onChange={handleChange}
              placeholder="Sampaguita"
              className={inputClass(errors.section)}
            />
          </Field>
        </div>

        {/* LRN — full width, optional */}
        <Field
          label="Learner Reference Number (LRN)"
          hint="12-digit DepEd ID — optional"
          error={errors.lrn}
        >
          <input
            type="text"
            name="lrn"
            value={form.lrn}
            onChange={handleChange}
            placeholder="123456789012"
            maxLength={12}
            inputMode="numeric"
            className={inputClass(errors.lrn)}
          />
        </Field>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors min-h-tap"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 rounded-xl bg-brand-700 text-white font-medium text-sm hover:bg-brand-800 active:scale-95 transition-all min-h-tap"
          >
            Add Student
          </button>
        </div>

      </form>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────────────────────

// Field wraps a label + input + error message together
// Keeps the form JSX clean — no repeated label/error code
function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Returns the right Tailwind classes for an input based on error state
function inputClass(error) {
  return cn(
    'w-full px-3 py-2.5 rounded-xl border text-sm bg-white',
    'focus:outline-none focus:ring-2 transition-colors min-h-tap',
    error
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 focus:ring-brand-100 focus:border-brand-400'
  )
}
