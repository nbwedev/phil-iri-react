// ─────────────────────────────────────────────────────────────────────────────
// StudentDetailPage.jsx
//
// The hub for one student. Shows:
//   - Student info header (name, grade, LRN)
//   - Assessment history (list of past sessions)
//   - Action buttons to start a new Pre-test or Post-test
//
// URL: /students/:studentId
// The :studentId comes from React Router and is read with useParams()
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ClipboardPlus,
  GraduationCap,
  Hash,
  ClipboardList,
} from "lucide-react";
import { useStudent } from "../../hooks/useStudent.js";
import { useAssessments } from "../../hooks/useAssessments.js";
import AssessmentCard from "./AssessmentCard.jsx";
import { ASSESSMENT_STAGES } from "../../constants/philIRI.js";
import { cn } from "../../utils/cn.js";

export default function StudentDetailPage() {
  // useParams() reads the :studentId value out of the URL
  const { studentId } = useParams();
  const navigate = useNavigate();

  // Load this specific student
  const { student, loading: studentLoading, notFound } = useStudent(studentId);

  // Load all assessments for this student
  const {
    assessments,
    loading: assessmentsLoading,
    add: addAssessment,
  } = useAssessments(studentId);

  // ── Loading state ──
  if (studentLoading || assessmentsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found state ──
  // Handles direct URL access with a bad ID
  if (notFound || !student) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 text-sm">Student not found.</p>
        <button
          onClick={() => navigate("/students")}
          className="mt-4 text-brand-600 text-sm hover:underline"
        >
          Back to students
        </button>
      </div>
    );
  }

  // ── Derived values ──
  const displayName = `${student.firstName} ${student.lastName}`;
  const initials =
    `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  const hasAssessments = assessments.length > 0;

  // Check if there's already an in-progress assessment
  // We only allow one in-progress session at a time
  const inProgress = assessments.find((a) => !a.completedAt);

  // Sort assessments newest first for display
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // ── Start a new assessment session ──
  function handleStartAssessment(stage) {
    // Create the assessment record in storage first,
    // then navigate to the GST screen with the new ID
    const newAssessment = addAssessment({
      studentId,
      stage,
      completedAt: null,
      finalLevel: null,
      languages: [],
    });
    navigate(`/students/${studentId}/gst?assessmentId=${newAssessment.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      {/* ── Back button ── */}
      <button
        onClick={() => navigate("/students")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors -ml-1 min-h-tap"
      >
        <ArrowLeft className="w-4 h-4" />
        All Students
      </button>

      {/* ── Student header card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <InfoPill
                icon={GraduationCap}
                label={`Grade ${student.gradeLevel}`}
              />
              {student.section && (
                <InfoPill icon={BookOpen} label={student.section} />
              )}
              {student.lrn && <InfoPill icon={Hash} label={student.lrn} mono />}
            </div>
          </div>
        </div>
      </div>

      {/* ── Start assessment actions ── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          New Assessment
        </h2>

        {inProgress ? (
          // There's already one in progress — show a resume prompt instead
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ClipboardList className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Assessment in progress
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Complete or discard the current session before starting a new
                one.
              </p>
            </div>
          </div>
        ) : (
          // No in-progress session — show start buttons
          <div className="grid grid-cols-2 gap-3">
            <AssessmentStartButton
              label="Pre-test"
              description="Beginning of school year"
              color="bg-brand-700 hover:bg-brand-800"
              onClick={() => handleStartAssessment(ASSESSMENT_STAGES.PRETEST)}
            />
            <AssessmentStartButton
              label="Post-test"
              description="After intervention"
              color="bg-emerald-700 hover:bg-emerald-800"
              onClick={() => handleStartAssessment(ASSESSMENT_STAGES.POSTTEST)}
            />
          </div>
        )}
      </div>

      {/* ── Assessment history ── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Assessment History
          {hasAssessments && (
            <span className="ml-2 text-gray-300 normal-case font-normal">
              ({assessments.length})
            </span>
          )}
        </h2>

        {!hasAssessments ? (
          <EmptyAssessments />
        ) : (
          <div className="space-y-2">
            {sortedAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                studentId={studentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function InfoPill({ icon: Icon, label, mono = false }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <span className={cn(mono && "font-mono")}>{label}</span>
    </span>
  );
}

function AssessmentStartButton({ label, description, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 px-4 py-3.5 rounded-2xl text-white",
        "active:scale-95 transition-all shadow-sm min-h-tap w-full",
        color,
      )}
    >
      <div className="flex items-center gap-1.5">
        <ClipboardPlus className="w-4 h-4" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-xs opacity-75">{description}</span>
    </button>
  );
}

function EmptyAssessments() {
  return (
    <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-2xl">
      <ClipboardList className="w-7 h-7 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-400">No assessments yet</p>
      <p className="text-xs text-gray-300 mt-0.5">Start a Pre-test above</p>
    </div>
  );
}
