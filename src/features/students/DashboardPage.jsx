import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, ClipboardList, ChevronRight, BookOpen } from "lucide-react";
import { useStudents } from "../../hooks/useStudents.js";
import { useAssessments } from "../../hooks/useAssessments.js";

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    students,
    loading: studentsLoading,
    refresh: refreshStudents,
  } = useStudents();
  const {
    assessments,
    loading: assessmentsLoading,
    refresh: refreshAssessments,
  } = useAssessments();

  // Every time this route becomes active (including navigating back to it),
  // re-read storage so counts reflect any deletions done on other tabs.
  useEffect(() => {
    refreshStudents();
    refreshAssessments();
  }, [location.key]); // location.key changes on every navigation event

  const completedAssessments = assessments.filter((a) => a.completedAt);

  if (studentsLoading || assessmentsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <div className="bg-gradient-to-br from-brand-800 to-brand-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-brand-200" />
          <span className="text-brand-200 text-xs font-medium uppercase tracking-wider">
            Phil-IRI 2018
          </span>
        </div>
        <h1 className="text-xl font-bold">Reading Assessment</h1>
        <p className="text-brand-200 text-sm mt-1">
          {students.length === 0
            ? "Add students to get started."
            : `${students.length} student${students.length !== 1 ? "s" : ""} registered.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Users}
          label="Students"
          value={students.length}
          color="text-brand-700 bg-brand-50"
          onClick={() => navigate("/students")}
        />
        <StatCard
          icon={ClipboardList}
          label="Assessments"
          value={completedAssessments.length}
          color="text-emerald-700 bg-emerald-50"
          onClick={() => navigate("/students")}
        />
      </div>

      <button
        onClick={() => navigate("/students")}
        className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-4 hover:border-brand-200 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-brand-700" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">
              Manage Students
            </p>
            <p className="text-xs text-gray-400">
              Add students and start assessments
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" />
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </button>
  );
}
