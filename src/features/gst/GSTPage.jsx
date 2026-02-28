// ─────────────────────────────────────────────────────────────────────────────
// GSTPage.jsx
//
// Group Screening Test administration screen.
//
// Flow:
//   1. Teacher selects language (Filipino or English)
//   2. Teacher marks each of 20 items correct or incorrect
//   3. App auto-scores and shows result
//   4. If score < 14: prompt to proceed to graded passage
//   5. If score >= 14: student passes, no individual testing needed
//
// URL: /students/:studentId/gst?assessmentId=xxx
// assessmentId comes from the URL query string
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronRight,
  AlertTriangle,
  Award,
  RotateCcw,
} from "lucide-react";
import { useStudent } from "../../hooks/useStudent.js";
import { useGST } from "./useGST.js";
import { GST, LANGUAGES } from "../../constants/philIRI.js";
import { resolveAssessmentRoute } from "../../utils/assessmentRouting.js";
import { updateAssessment } from "../../utils/storage.js";
import { cn } from "../../utils/cn.js";

// Single place that decides where to go after GST work is done.
// If all required passage testing is complete → mark assessment done and go home.
// If another language still needs its passage → go there automatically.
function handleDone(navigate, studentId, assessmentId) {
  const next = resolveAssessmentRoute(studentId, assessmentId);
  if (next === `/students/${studentId}`) {
    updateAssessment(assessmentId, { completedAt: new Date().toISOString() });
  }
  navigate(next);
}

export default function GSTPage() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");

  const { student, loading } = useStudent(studentId);
  const [language, setLanguage] = useState(null);

  const gst = useGST(assessmentId, language);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assessmentId) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No assessment session found.{" "}
        <button
          onClick={() => navigate("/students/" + studentId)}
          className="text-brand-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // Step 1 — pick a language
  if (!language) {
    return (
      <LanguageSelect
        student={student}
        studentId={studentId}
        gradeLevel={student?.gradeLevel}
        onSelect={setLanguage}
        onBack={() => navigate("/students/" + studentId)}
      />
    );
  }

  // Step 3 — result screen after submit
  if (gst.submitted) {
    return (
      <GSTResult
        student={student}
        language={language}
        score={gst.score}
        triggersIndividual={gst.triggersIndividual}
        studentId={studentId}
        assessmentId={assessmentId}
        onReset={gst.reset}
        onSwitchLanguage={() => setLanguage(null)}
        onProceed={() =>
          navigate(
            "/students/" +
              studentId +
              "/passage?assessmentId=" +
              assessmentId +
              "&language=" +
              language,
          )
        }
        onDone={() => handleDone(navigate, studentId, assessmentId)}
      />
    );
  }

  // Step 2 — active 20-item form
  return (
    <GSTForm
      student={student}
      language={language}
      gst={gst}
      onBack={() => setLanguage(null)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Language Selection
// ─────────────────────────────────────────────────────────────────────────────

function LanguageSelect({ student, studentId, gradeLevel, onSelect, onBack }) {
  const canDoFilipino = gradeLevel >= Math.min(...GST.FILIPINO_GRADES);
  const canDoEnglish = gradeLevel >= Math.min(...GST.ENGLISH_GRADES);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors -ml-1 min-h-tap"
      >
        <ArrowLeft className="w-4 h-4" />
        {student ? student.firstName + " " + student.lastName : "Back"}
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Group Screening Test
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select the language to administer. {GST.TOTAL_ITEMS} items total.
        </p>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
        <p className="text-sm font-medium text-brand-800 mb-1">
          How to administer
        </p>
        <p className="text-xs text-brand-600 leading-relaxed">
          Mark each answer correct or incorrect as the student responds. A score
          below {GST.INDIVIDUAL_TESTING_CUTOFF} out of {GST.TOTAL_ITEMS}{" "}
          triggers individual graded passage testing.
        </p>
      </div>

      <div className="space-y-3">
        <LanguageButton
          label="Filipino"
          description={"Grades " + GST.FILIPINO_GRADES.join(", ")}
          available={canDoFilipino}
          gradeLevel={gradeLevel}
          minGrade={Math.min(...GST.FILIPINO_GRADES)}
          onClick={() => onSelect(LANGUAGES.FILIPINO)}
        />
        <LanguageButton
          label="English"
          description={"Grades " + GST.ENGLISH_GRADES.join(", ")}
          available={canDoEnglish}
          gradeLevel={gradeLevel}
          minGrade={Math.min(...GST.ENGLISH_GRADES)}
          onClick={() => onSelect(LANGUAGES.ENGLISH)}
        />
      </div>
    </div>
  );
}

function LanguageButton({
  label,
  description,
  available,
  gradeLevel,
  minGrade,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={cn(
        "w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all",
        available
          ? "bg-white border-gray-100 hover:border-brand-300 hover:shadow-sm active:scale-[0.99]"
          : "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed",
      )}
    >
      <div>
        <p
          className={cn(
            "font-semibold",
            available ? "text-gray-900" : "text-gray-400",
          )}
        >
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {available
            ? description
            : "Requires Grade " +
              minGrade +
              " (student is Grade " +
              gradeLevel +
              ")"}
        </p>
      </div>
      {available && <ChevronRight className="w-4 h-4 text-gray-300" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: 20-item answer form
// ─────────────────────────────────────────────────────────────────────────────

function GSTForm({ student, language, gst, onBack }) {
  const progressPct = Math.round((gst.answeredCount / GST.TOTAL_ITEMS) * 100);
  const remaining = GST.TOTAL_ITEMS - gst.answeredCount;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-h-tap min-w-tap flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900">
            GST — {language}
          </h1>
          {student && (
            <p className="text-xs text-gray-500 truncate">
              {student.firstName} {student.lastName}
            </p>
          )}
        </div>

        {/* Live score */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-1.5 text-center shrink-0">
          <p className="text-xs text-brand-500 leading-none">Score</p>
          <p className="text-lg font-bold text-brand-700 leading-tight">
            {gst.score}
          </p>
          <p className="text-xs text-brand-400 leading-none">
            / {GST.TOTAL_ITEMS}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>
            {gst.answeredCount} of {GST.TOTAL_ITEMS} answered
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: progressPct + "%" }}
          />
        </div>
      </div>

      {/* Instruction hint */}
      <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
        Tap to mark correct (green) or incorrect (red). Tap again to cycle or
        clear.
      </p>

      {/* 4-column item grid */}
      <div className="grid grid-cols-4 gap-2">
        {gst.answers.map((answer, index) => (
          <ItemButton
            key={index}
            number={index + 1}
            answer={answer}
            onClick={() => gst.toggleAnswer(index)}
          />
        ))}
      </div>

      {/* Cutoff warning — shows when score is at risk */}
      {gst.answeredCount >= 10 && gst.score < GST.INDIVIDUAL_TESTING_CUTOFF && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            Current score ({gst.score}) is below the cutoff (
            {GST.INDIVIDUAL_TESTING_CUTOFF}). Individual passage testing will be
            required.
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="pb-4">
        {remaining > 0 && (
          <p className="text-xs text-center text-gray-400 mb-3">
            {remaining} item{remaining !== 1 ? "s" : ""} remaining
          </p>
        )}
        <button
          onClick={gst.submit}
          disabled={!gst.canSubmit}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            gst.canSubmit
              ? "bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm"
              : "bg-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          {gst.canSubmit
            ? "Submit GST"
            : "Answer all " + GST.TOTAL_ITEMS + " items to submit"}
        </button>
      </div>
    </div>
  );
}

function ItemButton({ number, answer, onClick }) {
  const isCorrect = answer === true;
  const isIncorrect = answer === false;
  const isBlank = answer === null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 py-3 gap-1",
        "active:scale-95 transition-all min-h-tap",
        isCorrect && "bg-emerald-50 border-emerald-300",
        isIncorrect && "bg-red-50    border-red-300",
        isBlank && "bg-white     border-gray-200 hover:border-gray-300",
      )}
    >
      <span
        className={cn(
          "text-xs font-semibold leading-none",
          isCorrect && "text-emerald-600",
          isIncorrect && "text-red-500",
          isBlank && "text-gray-400",
        )}
      >
        {number}
      </span>
      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      {isIncorrect && <XCircle className="w-5 h-5 text-red-400" />}
      {isBlank && <Circle className="w-5 h-5 text-gray-200" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Result screen
// ─────────────────────────────────────────────────────────────────────────────

function GSTResult({
  student,
  language,
  score,
  triggersIndividual,
  studentId,
  assessmentId,
  onReset,
  onSwitchLanguage,
  onProceed,
  onDone,
}) {
  const passed = !triggersIndividual;
  const pct = Math.round((score / GST.TOTAL_ITEMS) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">GST Result</h1>

      {/* Score card */}
      <div
        className={cn(
          "rounded-2xl p-6 text-center border-2",
          passed
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200",
        )}
      >
        {passed ? (
          <Award className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-amber-500  mx-auto mb-3" />
        )}
        <p className="text-sm text-gray-500 mb-1">{language} GST</p>
        <p
          className={cn(
            "text-5xl font-black mb-1",
            passed ? "text-emerald-600" : "text-amber-600",
          )}
        >
          {score}
          <span className="text-2xl font-normal text-gray-300">
            {" "}
            / {GST.TOTAL_ITEMS}
          </span>
        </p>
        <p className="text-sm text-gray-400">{pct}% correct</p>

        <div
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm font-medium",
            passed
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          )}
        >
          {passed
            ? "Score \u2265 " +
              GST.INDIVIDUAL_TESTING_CUTOFF +
              " \u2014 No individual testing required"
            : "Score < " +
              GST.INDIVIDUAL_TESTING_CUTOFF +
              " \u2014 Proceed to individual graded passage"}
        </div>
      </div>

      {student && (
        <p className="text-center text-sm text-gray-500">
          {student.firstName} {student.lastName} \u00b7 Grade{" "}
          {student.gradeLevel}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {triggersIndividual && (
          <button
            onClick={onProceed}
            className="w-full flex items-center justify-between px-5 py-4 bg-brand-700 text-white rounded-2xl font-semibold text-sm hover:bg-brand-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>Proceed to Graded Passage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onSwitchLanguage}
          className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          <span>Administer other language</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Re-administer this language
        </button>

        <button
          onClick={onDone}
          className="w-full px-5 py-3 text-brand-600 text-sm font-medium hover:text-brand-800 transition-colors"
        >
          Done \u2014 back to student
        </button>
      </div>
    </div>
  );
}
