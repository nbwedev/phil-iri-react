import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Users, BookOpenCheck } from "lucide-react";
import { useStudents } from "../../hooks/useStudents.js";
import AddStudentForm from "./AddStudentForm.jsx";
import StudentCard from "./StudentCard.jsx";
import { addAssessment, saveGSTResult } from "../../utils/storage.js";
import { ASSESSMENT_STAGES, GST, LANGUAGES } from "../../constants/philIRI.js";

export default function StudentListPage() {
  const navigate = useNavigate();
  const { students, loading, add, remove } = useStudents();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.lrn?.includes(q),
    );
  }, [students, searchQuery]);

  const byGrade = useMemo(() => {
    const groups = {};
    filteredStudents.forEach((s) => {
      const key = `Grade ${s.gradeLevel}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.entries(groups).sort(
      (a, b) =>
        parseInt(a[0].replace("Grade ", "")) -
        parseInt(b[0].replace("Grade ", "")),
    );
  }, [filteredStudents]);

  function handleAddStudent({ studentData, gstScores }) {
    // 1. Save the student
    const student = add(studentData);

    // 2. If any GST score was entered, create an assessment + save GST results
    const hasFilipino = gstScores.Filipino !== null;
    const hasEnglish = gstScores.English !== null;

    if (!hasFilipino && !hasEnglish) {
      // No GST entered — just close the form
      setShowForm(false);
      return;
    }

    // Create the assessment record
    const assessment = addAssessment({
      studentId: student.id,
      stage: ASSESSMENT_STAGES.PRETEST,
      completedAt: null,
      finalLevel: null,
      languages: [],
    });

    const assessmentId = assessment.id;

    // Save a GST result for each entered score
    // Build answers array: all true for correct count, rest false
    function buildAnswers(score) {
      return Array(GST.TOTAL_ITEMS)
        .fill(null)
        .map((_, i) => i < score);
    }

    if (hasFilipino) {
      const score = gstScores.Filipino;
      saveGSTResult({
        assessmentId,
        language: LANGUAGES.FILIPINO,
        answers: buildAnswers(score),
        score,
        totalItems: GST.TOTAL_ITEMS,
        triggersIndividual: score < GST.INDIVIDUAL_TESTING_CUTOFF,
        submittedAt: new Date().toISOString(),
      });
    }

    if (hasEnglish) {
      const score = gstScores.English;
      saveGSTResult({
        assessmentId,
        language: LANGUAGES.ENGLISH,
        answers: buildAnswers(score),
        score,
        totalItems: GST.TOTAL_ITEMS,
        triggersIndividual: score < GST.INDIVIDUAL_TESTING_CUTOFF,
        submittedAt: new Date().toISOString(),
      });
    }

    setShowForm(false);

    // 3. If any score triggers individual testing, go straight to passage
    // Priority: Filipino first if both trigger
    if (hasFilipino && gstScores.Filipino < GST.INDIVIDUAL_TESTING_CUTOFF) {
      navigate(
        `/students/${student.id}/passage` +
          `?assessmentId=${assessmentId}` +
          `&language=${LANGUAGES.FILIPINO}`,
      );
      return;
    }

    if (hasEnglish && gstScores.English < GST.INDIVIDUAL_TESTING_CUTOFF) {
      navigate(
        `/students/${student.id}/passage` +
          `?assessmentId=${assessmentId}` +
          `&language=${LANGUAGES.ENGLISH}`,
      );
      return;
    }

    // All GST scores passed — nothing more to do
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {students.length === 0
              ? "No students yet"
              : `${students.length} student${students.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-xl hover:bg-brand-800 active:scale-95 transition-all min-h-tap shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {showForm && (
        <AddStudentForm
          onAdd={handleAddStudent}
          onCancel={() => setShowForm(false)}
        />
      )}

      {students.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or LRN…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 transition-colors min-h-tap"
          />
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No students match "{searchQuery}"</p>
          <button
            onClick={() => setSearch("")}
            className="text-brand-600 text-sm mt-1 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {byGrade.map(([gradeLabel, gradeStudents]) => (
            <div key={gradeLabel}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {gradeLabel}
                </span>
                <span className="text-xs text-gray-300">
                  ({gradeStudents.length})
                </span>
              </div>
              <div className="space-y-2">
                {gradeStudents
                  .sort((a, b) => a.lastName.localeCompare(b.lastName))
                  .map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onDelete={remove}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">
        No students yet
      </h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
        Add your students to begin administering Phil-IRI assessments.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-3 bg-brand-700 text-white text-sm font-medium rounded-xl hover:bg-brand-800 active:scale-95 transition-all shadow-sm min-h-tap"
      >
        <UserPlus className="w-4 h-4" />
        Add First Student
      </button>
      <div className="mt-8 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-left max-w-xs mx-auto">
        <BookOpenCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Tip:</strong> Enter GST scores while adding students to jump
          straight to graded passage testing when needed.
        </p>
      </div>
    </div>
  );
}
