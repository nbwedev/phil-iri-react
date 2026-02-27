// ─────────────────────────────────────────────────────────────────────────────
// AddStudentForm.jsx
//
// Adds a new student AND captures their GST scores in one step.
//
// Flow:
//   1. Enter name, grade, section, LRN (same as before)
//   2. After grade is picked, GST score fields appear for eligible languages:
//      Filipino: Grade 3+    English: Grade 4+
//   3. On submit → onAdd({ studentData, gstScores }) is called
//      gstScores = { Filipino: number|null, English: number|null }
//
// The parent (StudentListPage) decides what to do with the GST scores —
// it creates the assessment record, saves GST results, and navigates to
// the graded passage if any score is below the cutoff.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { UserPlus, X, ClipboardCheck, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { GST } from "../../constants/philIRI.js";

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const EMPTY_FORM = {
  lastName: "",
  firstName: "",
  lrn: "",
  gradeLevel: "",
  section: "",
  gstFilipino: "", // raw string from input; empty = not administered
  gstEnglish: "",
};

export default function AddStudentForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const grade = Number(form.gradeLevel);
  const showFilipino = grade >= Math.min(...GST.FILIPINO_GRADES);
  const showEnglish = grade >= Math.min(...GST.ENGLISH_GRADES);
  const showGSTSection = grade >= 1 && form.gradeLevel !== "";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // Clear GST scores if grade changes to ineligible level
    if (name === "gradeLevel") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        gstFilipino: "",
        gstEnglish: "",
      }));
      setErrors((prev) => ({ ...prev, gstFilipino: "", gstEnglish: "" }));
    }
  }

  function validate() {
    const e = {};

    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.gradeLevel) e.gradeLevel = "Grade level is required.";

    if (form.lrn && !/^\d{12}$/.test(form.lrn)) {
      e.lrn = "LRN must be exactly 12 digits.";
    }

    // GST score validation — only if a value was entered
    if (showFilipino && form.gstFilipino !== "") {
      const n = Number(form.gstFilipino);
      if (!Number.isInteger(n) || n < 0 || n > GST.TOTAL_ITEMS) {
        e.gstFilipino = `Score must be 0–${GST.TOTAL_ITEMS}.`;
      }
    }
    if (showEnglish && form.gstEnglish !== "") {
      const n = Number(form.gstEnglish);
      if (!Number.isInteger(n) || n < 0 || n > GST.TOTAL_ITEMS) {
        e.gstEnglish = `Score must be 0–${GST.TOTAL_ITEMS}.`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onAdd({
      studentData: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        lrn: form.lrn.trim(),
        gradeLevel: Number(form.gradeLevel),
        section: form.section.trim(),
      },
      gstScores: {
        Filipino:
          showFilipino && form.gstFilipino !== ""
            ? Number(form.gstFilipino)
            : null,
        English:
          showEnglish && form.gstEnglish !== ""
            ? Number(form.gstEnglish)
            : null,
      },
    });

    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-brand-50">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-700" />
          <h2 className="text-base font-semibold text-brand-900">
            Add New Student
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-h-tap min-w-tap flex items-center justify-center"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Last Name" required error={errors.lastName}>
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
          <Field label="First Name" required error={errors.firstName}>
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

        {/* Grade + Section */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Grade Level" required error={errors.gradeLevel}>
            <select
              name="gradeLevel"
              value={form.gradeLevel}
              onChange={handleChange}
              className={inputClass(errors.gradeLevel)}
            >
              <option value="">Select grade</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
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

        {/* LRN */}
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

        {/* ── GST Scores ── */}
        {showGSTSection && (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <ClipboardCheck className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">GST Scores</p>
              <span className="text-xs text-gray-400 ml-auto">
                optional — enter if already administered
              </span>
            </div>

            <div className="p-4 space-y-3">
              {!showFilipino && !showEnglish && (
                <p className="text-xs text-gray-400 text-center py-2">
                  GST is administered starting Grade{" "}
                  {Math.min(...GST.FILIPINO_GRADES)}. No GST for Grade {grade}.
                </p>
              )}

              {showFilipino && (
                <GSTScoreField
                  label="Filipino GST"
                  name="gstFilipino"
                  value={form.gstFilipino}
                  onChange={handleChange}
                  error={errors.gstFilipino}
                  cutoff={GST.INDIVIDUAL_TESTING_CUTOFF}
                  total={GST.TOTAL_ITEMS}
                />
              )}

              {showEnglish && (
                <GSTScoreField
                  label="English GST"
                  name="gstEnglish"
                  value={form.gstEnglish}
                  onChange={handleChange}
                  error={errors.gstEnglish}
                  cutoff={GST.INDIVIDUAL_TESTING_CUTOFF}
                  total={GST.TOTAL_ITEMS}
                />
              )}

              {/* Warn if any entered score is below cutoff */}
              {((showFilipino &&
                form.gstFilipino !== "" &&
                Number(form.gstFilipino) < GST.INDIVIDUAL_TESTING_CUTOFF) ||
                (showEnglish &&
                  form.gstEnglish !== "" &&
                  Number(form.gstEnglish) < GST.INDIVIDUAL_TESTING_CUTOFF)) && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Score below {GST.INDIVIDUAL_TESTING_CUTOFF} — graded passage
                    testing will start immediately after saving.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
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
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

// ── GST Score field with live below-cutoff highlight ─────────────────────────

function GSTScoreField({ label, name, value, onChange, error, cutoff, total }) {
  const parsed = value !== "" ? Number(value) : null;
  const isBelowCut = parsed !== null && !isNaN(parsed) && parsed < cutoff;
  const isAboveCut = parsed !== null && !isNaN(parsed) && parsed >= cutoff;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-32 shrink-0">{label}</span>
      <div className="flex-1 relative">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={0}
          max={total}
          inputMode="numeric"
          placeholder={`0–${total}`}
          className={cn(
            "w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold",
            "focus:outline-none focus:ring-2 transition-colors",
            error
              ? "border-red-300 focus:ring-red-200"
              : isBelowCut
                ? "border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-200"
                : isAboveCut
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-200"
                  : "border-gray-200 focus:ring-brand-100 focus:border-brand-400",
          )}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium w-20 text-right shrink-0",
          isBelowCut
            ? "text-amber-600"
            : isAboveCut
              ? "text-emerald-600"
              : "text-gray-400",
        )}
      >
        {isBelowCut ? "→ Passage" : isAboveCut ? "✓ Passed" : `out of ${total}`}
      </span>
      {error && <p className="text-xs text-red-600 absolute mt-8">{error}</p>}
    </div>
  );
}

// ── Shared field + input helpers ─────────────────────────────────────────────

function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden>
            *
          </span>
        )}
        {hint && (
          <span className="text-gray-400 font-normal ml-1 text-xs">
            ({hint})
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error) {
  return cn(
    "w-full px-3 py-2.5 rounded-xl border text-sm bg-white",
    "focus:outline-none focus:ring-2 transition-colors min-h-tap",
    error
      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
      : "border-gray-200 focus:ring-brand-100 focus:border-brand-400",
  );
}
