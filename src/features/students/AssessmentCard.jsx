import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock, CheckCircle2, FileText } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { ASSESSMENT_STAGES } from "../../constants/philIRI.js";
import { resolveAssessmentRoute } from "../../utils/assessmentRouting.js";

const LEVEL_STYLES = {
  Independent: "bg-independent-light text-independent-dark border-independent",
  Instructional:
    "bg-instructional-light text-instructional-dark border-instructional",
  Frustration: "bg-frustration-light text-frustration-dark border-frustration",
};

export default function AssessmentCard({ assessment, studentId }) {
  const navigate = useNavigate();
  const isComplete = Boolean(assessment.completedAt);

  const destination = isComplete
    ? `/students/${studentId}/results?assessmentId=${assessment.id}`
    : resolveAssessmentRoute(studentId, assessment.id);

  const dateLabel = formatDate(
    isComplete ? assessment.completedAt : assessment.createdAt,
  );
  const stageLabel =
    assessment.stage === ASSESSMENT_STAGES.PRETEST ? "Pre-test" : "Post-test";

  return (
    <button
      onClick={() => navigate(destination)}
      className={cn(
        "w-full text-left bg-white border rounded-2xl p-4",
        "flex items-center gap-4",
        "hover:shadow-sm active:scale-[0.99] transition-all group",
        isComplete ? "border-gray-100" : "border-amber-200 bg-amber-50",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isComplete ? "bg-emerald-50" : "bg-amber-100",
        )}
      >
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : (
          <Clock className="w-5 h-5 text-amber-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">
            {stageLabel}
          </span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{dateLabel}</span>
        </div>

        {isComplete && assessment.finalLevel && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                LEVEL_STYLES[assessment.finalLevel] ??
                  "bg-gray-100 text-gray-600 border-gray-200",
              )}
            >
              {assessment.finalLevel}
            </span>
            {assessment.languages?.map((lang) => (
              <span
                key={lang}
                className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {!isComplete && (
          <p className="text-xs text-amber-600 mt-0.5">
            In progress — tap to continue
          </p>
        )}
      </div>

      <div className="shrink-0">
        {isComplete ? (
          <FileText className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
        )}
      </div>
    </button>
  );
}

function formatDate(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}
