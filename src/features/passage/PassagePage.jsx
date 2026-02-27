// ─────────────────────────────────────────────────────────────────────────────
// PassagePage.jsx
//
// Graded passage administration — reading, miscue marking, comprehension,
// and the retry loop.
//
// RETRY LOOP:
//   After each passage result, if the student is NOT at Independent level,
//   the teacher is prompted to try one grade lower.
//   This continues until Independent is reached or no lower passage exists.
//   All attempts save separate PassageResult records under the same assessmentId.
//
// URL: /students/:studentId/passage?assessmentId=xxx&language=Filipino
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Square,
  Clock,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  AlertCircle,
  Highlighter,
  TrendingDown,
  Trophy,
} from "lucide-react";
import { useStudent } from "../../hooks/useStudent.js";
import { usePassage } from "./usePassage.js";
import { findPassage, getAvailableGrades } from "./passages.js";
import {
  MISCUE_TYPES,
  LANGUAGES,
  WPM_BENCHMARKS,
  READING_LEVELS,
} from "../../constants/philIRI.js";
import { resolveAssessmentRoute } from "../../utils/assessmentRouting.js";
import { updateAssessment } from "../../utils/storage.js";
import { cn } from "../../utils/cn.js";

// ─────────────────────────────────────────────────────────────────────────────
// Main page — controls which step is shown
// ─────────────────────────────────────────────────────────────────────────────

export default function PassagePage() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");
  const urlLanguage = searchParams.get("language");

  const { student, loading } = useStudent(studentId);

  // Current passage config (can change as the retry loop goes lower)
  const [language, setLanguage] = useState(urlLanguage ?? null);
  const [gradeLevel, setGradeLevel] = useState(null);
  const [step, setStep] = useState("setup");

  // History of all attempts in this session (for display on final result)
  const [attemptHistory, setAttemptHistory] = useState([]);

  const passage =
    language && gradeLevel ? findPassage(language, gradeLevel) : null;

  const psg = usePassage(passage, assessmentId);

  function handleSetupComplete(lang, grade) {
    setLanguage(lang);
    setGradeLevel(grade);
    setStep("reading");
  }

  function handleSubmitAndShowResult() {
    const saved = psg.submit();
    if (saved) {
      setAttemptHistory((prev) => [...prev, saved]);
    }
    setStep("result");
  }

  // Called from PassageResult when teacher wants to try one grade lower
  function handleRetryLower() {
    const nextGrade = gradeLevel - 1;
    setGradeLevel(nextGrade);
    setStep("reading");
    // usePassage will reinitialise via its useEffect when passage.id changes
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Result screen ──
  if (step === "result" && psg.savedResult) {
    const latestResult = psg.savedResult;
    const isIndependent =
      latestResult.readingLevel === READING_LEVELS.INDEPENDENT;
    const lowerGrade = gradeLevel - 1;
    const lowerPassage = findPassage(language, lowerGrade);
    const canRetry = !isIndependent && lowerPassage !== null && lowerGrade >= 1;

    return (
      <PassageResult
        student={student}
        passage={passage}
        result={latestResult}
        attemptHistory={attemptHistory}
        isIndependent={isIndependent}
        canRetry={canRetry}
        lowerGrade={lowerGrade}
        onRetry={handleRetryLower}
        onDone={() => {
          const nextRoute = resolveAssessmentRoute(studentId, assessmentId);
          const isDone = nextRoute === `/students/${studentId}`;
          if (isDone) {
            // All languages tested — mark the assessment complete so the
            // student page stops showing "Assessment in progress"
            updateAssessment(assessmentId, {
              completedAt: new Date().toISOString(),
            });
          }
          navigate(nextRoute);
        }}
      />
    );
  }

  // ── Comprehension questions ──
  if (step === "questions") {
    return (
      <ComprehensionStep
        passage={passage}
        psg={psg}
        onBack={() => setStep("reading")}
        onSubmit={handleSubmitAndShowResult}
      />
    );
  }

  // ── Active reading / miscue marking ──
  if (step === "reading" && passage) {
    return (
      <ReadingStep
        student={student}
        passage={passage}
        psg={psg}
        attemptNumber={attemptHistory.length + 1}
        onBack={() => setStep(attemptHistory.length > 0 ? "result" : "setup")}
        onFinishReading={() => setStep("questions")}
      />
    );
  }

  // ── Setup ──
  return (
    <SetupStep
      student={student}
      studentId={studentId}
      initialLanguage={urlLanguage}
      onBack={() => navigate("/students/" + studentId)}
      onComplete={handleSetupComplete}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Setup — choose language and grade level
// ─────────────────────────────────────────────────────────────────────────────

function SetupStep({
  student,
  studentId,
  initialLanguage,
  onBack,
  onComplete,
}) {
  const [language, setLanguage] = useState(initialLanguage ?? null);
  const [gradeLevel, setGradeLevel] = useState(null);

  const availableGrades = language ? getAvailableGrades(language) : [];
  const canProceed =
    language && gradeLevel && findPassage(language, gradeLevel) !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 -ml-1 min-h-tap"
      >
        <ArrowLeft className="w-4 h-4" />
        {student ? student.firstName + " " + student.lastName : "Back"}
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Graded Passage</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select language and starting grade level.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Language
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[LANGUAGES.FILIPINO, LANGUAGES.ENGLISH].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setGradeLevel(null);
              }}
              className={cn(
                "py-4 rounded-2xl border-2 font-semibold text-sm transition-all",
                language === lang
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {language && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Starting Grade
          </p>
          <div className="grid grid-cols-4 gap-2">
            {availableGrades.map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeLevel(grade)}
                className={cn(
                  "py-3 rounded-2xl border-2 font-semibold text-sm transition-all min-h-tap",
                  gradeLevel === grade
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
                )}
              >
                Gr {grade}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Phil-IRI starts 2–3 grades below the student's actual grade.
          </p>
        </div>
      )}

      {canProceed && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Passage
          </p>
          <p className="font-semibold text-gray-800">
            {findPassage(language, gradeLevel).title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {language} · Grade {gradeLevel} ·{" "}
            {findPassage(language, gradeLevel).totalWords} words ·{" "}
            {findPassage(language, gradeLevel).questions.length} questions
          </p>
        </div>
      )}

      {language && gradeLevel && !findPassage(language, gradeLevel) && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No passage found for {language} Grade {gradeLevel}.
        </div>
      )}

      <button
        onClick={() => onComplete(language, gradeLevel)}
        disabled={!canProceed}
        className={cn(
          "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
          canProceed
            ? "bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm"
            : "bg-gray-100 text-gray-300 cursor-not-allowed",
        )}
      >
        Begin Passage Administration
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Reading — word tokens + miscue toolbar + WPM timer
// ─────────────────────────────────────────────────────────────────────────────

function ReadingStep({
  student,
  passage,
  psg,
  attemptNumber,
  onBack,
  onFinishReading,
}) {
  const canFinish = psg.timerState === "stopped";

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-h-tap min-w-tap flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">
            {passage.title}
          </h1>
          <p className="text-xs text-gray-500">
            {passage.language} · Grade {passage.gradeLevel} ·{" "}
            {passage.totalWords} words
            {attemptNumber > 1 && (
              <span className="ml-2 text-amber-600 font-medium">
                Attempt {attemptNumber}
              </span>
            )}
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-1.5 text-center shrink-0">
          <p className="text-xs text-red-400 leading-none">Miscues</p>
          <p className="text-lg font-bold text-red-600 leading-tight">
            {psg.miscueCount}
          </p>
        </div>
      </div>

      <WPMTimer
        timerState={psg.timerState}
        elapsedMs={psg.elapsedMs}
        onStart={psg.startTimer}
        onStop={psg.stopTimer}
        onReset={psg.resetTimer}
      />

      {psg.miscueCount > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
          <span className="text-gray-500">Word Accuracy</span>
          <span
            className={cn(
              "font-semibold",
              psg.wordAccuracyPct >= 97
                ? "text-emerald-600"
                : psg.wordAccuracyPct >= 90
                  ? "text-amber-600"
                  : "text-red-600",
            )}
          >
            {psg.wordAccuracyPct}%
          </span>
        </div>
      )}

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
        <Highlighter className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Start timer when student begins reading. Tap any word to mark a
          miscue.
        </p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl p-5 leading-loose text-base"
        onClick={psg.dismissToolbar}
      >
        <div className="flex flex-wrap gap-x-1.5 gap-y-2">
          {psg.tokens.map((token) => (
            <WordToken
              key={token.index}
              token={token}
              isActive={psg.activeIndex === token.index}
              onTap={() => psg.tapWord(token.index)}
            />
          ))}
        </div>
      </div>

      {psg.activeIndex !== null && (
        <MiscueToolbar
          activeToken={psg.tokens[psg.activeIndex]}
          onApply={psg.applyMiscue}
          onSelfCorrection={psg.markSelfCorrection}
          onClear={() => {
            psg.clearMiscue(psg.activeIndex);
            psg.dismissToolbar();
          }}
          onDismiss={psg.dismissToolbar}
        />
      )}

      <div className="pb-4">
        {!canFinish && psg.timerState === "idle" && (
          <p className="text-xs text-center text-gray-400 mb-3">
            Start the timer to begin, stop it when the student finishes reading.
          </p>
        )}
        {!canFinish && psg.timerState === "running" && (
          <p className="text-xs text-center text-amber-600 mb-3">
            Stop the timer before proceeding to comprehension questions.
          </p>
        )}
        <button
          onClick={onFinishReading}
          disabled={!canFinish}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            canFinish
              ? "bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm"
              : "bg-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          Proceed to Comprehension Questions
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Comprehension questions
// ─────────────────────────────────────────────────────────────────────────────

function ComprehensionStep({ passage, psg, onBack, onSubmit }) {
  const allAnswered = psg.answeredCompCount === psg.totalQuestions;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 -ml-1 min-h-tap"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to passage
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Comprehension</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mark each answer correct or incorrect. {psg.answeredCompCount} of{" "}
          {psg.totalQuestions} answered.
        </p>
      </div>

      {psg.wpm > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-brand-700">Reading speed</span>
          <span className="font-bold text-brand-800">{psg.wpm} WPM</span>
        </div>
      )}

      <div className="space-y-3">
        {passage.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            number={i + 1}
            question={q}
            answer={psg.compAnswers[q.id]}
            onAnswer={(val) => psg.setCompAnswer(q.id, val)}
          />
        ))}
      </div>

      {allAnswered && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Comprehension score</span>
          <span
            className={cn(
              "font-bold text-lg",
              psg.comprehensionPct >= 80
                ? "text-emerald-600"
                : psg.comprehensionPct >= 59
                  ? "text-amber-600"
                  : "text-red-600",
            )}
          >
            {psg.comprehensionPct}%
          </span>
        </div>
      )}

      <div className="pb-4">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            allAnswered
              ? "bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm"
              : "bg-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          {allAnswered
            ? "Calculate Reading Level"
            : `Answer all ${psg.totalQuestions} questions to continue`}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Result — with retry loop logic
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_STYLES = {
  Independent: "bg-emerald-50 border-emerald-200 text-emerald-900",
  Instructional: "bg-amber-50 border-amber-200 text-amber-900",
  Frustration: "bg-red-50 border-red-200 text-red-900",
};

const LEVEL_BADGE = {
  Independent: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Instructional: "bg-amber-100 text-amber-800 border-amber-300",
  Frustration: "bg-red-100 text-red-800 border-red-300",
};

function PassageResult({
  student,
  passage,
  result,
  attemptHistory,
  isIndependent,
  canRetry,
  lowerGrade,
  onRetry,
  onDone,
}) {
  const gradeWpm = WPM_BENCHMARKS[passage?.gradeLevel];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      {/* ── Attempt history breadcrumb (shown after >1 attempt) ── */}
      {attemptHistory.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {attemptHistory.map((attempt, i) => (
            <div
              key={attempt.id ?? i}
              className="flex items-center gap-2 shrink-0"
            >
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full border",
                  LEVEL_BADGE[attempt.readingLevel] ??
                    "bg-gray-100 text-gray-700 border-gray-200",
                )}
              >
                Gr {attempt.gradeLevel}: {attempt.readingLevel}
              </span>
              {i < attemptHistory.length - 1 && (
                <TrendingDown className="w-3 h-3 text-gray-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Final level card ── */}
      <div
        className={cn(
          "rounded-2xl p-6 text-center border-2",
          LEVEL_STYLES[result.readingLevel] ??
            "bg-gray-50 border-gray-200 text-gray-700",
        )}
      >
        {isIndependent && (
          <Trophy className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        )}
        <p className="text-sm opacity-60 mb-1">
          {result.language} · Grade {result.gradeLevel}
        </p>
        <p className="text-4xl font-black mb-1">{result.readingLevel}</p>
        <p className="text-sm opacity-60">{passage?.title}</p>
      </div>

      {/* ── Student info ── */}
      {student && (
        <p className="text-center text-sm text-gray-500">
          {student.firstName} {student.lastName} · Grade {student.gradeLevel}
        </p>
      )}

      {/* ── Metrics ── */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
        <MetricRow
          label="Word Accuracy"
          value={result.wordAccuracyPct + "%"}
          sub={result.wordAccuracyLevel}
          subColor={LEVEL_BADGE[result.wordAccuracyLevel]}
        />
        <MetricRow
          label="Comprehension"
          value={result.comprehensionPct + "%"}
          sub={
            result.comprehensionLevel +
            " (" +
            result.correctCompCount +
            "/" +
            result.totalQuestions +
            ")"
          }
          subColor={LEVEL_BADGE[result.comprehensionLevel]}
        />
        <MetricRow
          label="Words Per Minute"
          value={result.wpm + " WPM"}
          sub={
            gradeWpm
              ? "Grade " +
                result.gradeLevel +
                " benchmark: " +
                gradeWpm.min +
                "–" +
                gradeWpm.max +
                " WPM"
              : ""
          }
        />
        <MetricRow
          label="Miscues"
          value={
            result.miscueCount +
            " error" +
            (result.miscueCount !== 1 ? "s" : "")
          }
          sub={
            result.miscues.length > 0
              ? result.miscues
                  .slice(0, 3)
                  .map((m) => m.word)
                  .join(", ") + (result.miscues.length > 3 ? "…" : "")
              : "No miscues recorded"
          }
        />
      </div>

      {/* ── Miscue breakdown ── */}
      {result.miscues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Miscue Detail
          </p>
          <div className="flex flex-wrap gap-2">
            {groupMiscuesByType(result.miscues).map(
              ({ type, count, style }) => (
                <span
                  key={type}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border",
                    style,
                  )}
                >
                  {type}: {count}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="space-y-2 pb-4">
        {/* RETRY: only if not independent AND a lower passage exists */}
        {canRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-between px-5 py-4 bg-brand-700 text-white rounded-2xl font-semibold text-sm hover:bg-brand-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="text-left">
              <p>Try Grade {lowerGrade} Passage</p>
              <p className="text-xs font-normal opacity-75 mt-0.5">
                Student did not reach Independent — test one grade lower
              </p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        )}

        {/* INDEPENDENT reached — congratulatory message */}
        {isIndependent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm font-semibold text-emerald-800">
              Independent level reached at Grade {result.gradeLevel}!
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Assessment complete. No further passage testing needed.
            </p>
          </div>
        )}

        {/* No lower passage available but not independent */}
        {!canRetry && !isIndependent && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm text-gray-600">
              No lower passage available for {result.language}.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Lowest tested level recorded as the reading level.
            </p>
          </div>
        )}

        <button
          onClick={onDone}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm transition-all",
            isIndependent
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.98]",
          )}
        >
          Done — back to student
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function WordToken({ token, isActive, onTap }) {
  const miscueType = MISCUE_TYPES.find((m) => m.id === token.miscue);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className={cn(
        "relative inline-flex flex-col items-center gap-0.5",
        "rounded-lg px-1 py-0.5 transition-all active:scale-95",
        isActive && "ring-2 ring-brand-400 ring-offset-1",
        token.miscue && "bg-red-50",
        token.selfCorrection && "bg-blue-50",
        !token.miscue &&
          !token.selfCorrection &&
          !isActive &&
          "hover:bg-gray-100",
      )}
    >
      {token.miscue && (
        <span
          className={cn(
            "text-[9px] font-bold px-1 rounded leading-none",
            miscueType?.color ?? "bg-red-100 text-red-700",
          )}
        >
          {miscueType?.shortLabel ?? "?"}
        </span>
      )}
      {token.selfCorrection && (
        <span className="text-[9px] font-bold px-1 rounded leading-none bg-blue-100 text-blue-700">
          SC
        </span>
      )}
      <span
        className={cn(
          "text-base leading-snug",
          token.miscue && "text-red-700 line-through decoration-red-400",
          token.selfCorrection && "text-blue-700",
          isActive && "font-semibold",
        )}
      >
        {token.word}
      </span>
    </button>
  );
}

function MiscueToolbar({
  activeToken,
  onApply,
  onSelfCorrection,
  onClear,
  onDismiss,
}) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            Marking:{" "}
            <span className="text-brand-700">"{activeToken.word}"</span>
          </p>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-3 grid grid-cols-4 gap-2">
          {MISCUE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onApply(type.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all active:scale-95",
                activeToken.miscue === type.id
                  ? type.color + " border-current shadow-sm"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600",
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold",
                  activeToken.miscue === type.id ? "" : "text-gray-700",
                )}
              >
                {type.shortLabel}
              </span>
              <span className="text-[9px] leading-tight text-center opacity-70">
                {type.label.split("").slice(0, 8).join("")}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-3 pb-3">
          <button
            onClick={onSelfCorrection}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all",
              activeToken.selfCorrection
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50",
            )}
          >
            Self-Correction (SC)
          </button>
          <button
            onClick={onClear}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function WPMTimer({ timerState, elapsedMs, onStart, onStop, onReset }) {
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display =
    String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 bg-gray-900 rounded-2xl px-4 py-3">
      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="font-mono text-2xl font-bold text-white flex-1 tracking-wider">
        {display}
      </span>
      <div className="flex gap-2">
        {timerState === "idle" && (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 active:scale-95 transition-all min-h-tap"
          >
            <Play className="w-4 h-4 fill-current" />
            Start
          </button>
        )}
        {timerState === "running" && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 active:scale-95 transition-all min-h-tap"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop
          </button>
        )}
        {timerState === "stopped" && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-600 active:scale-95 transition-all min-h-tap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ number, question, answer, onAnswer }) {
  const typeLabel = {
    literal: "Literal",
    inferential: "Inferential",
    critical: "Critical",
  };
  return (
    <div
      className={cn(
        "bg-white border rounded-2xl p-4 transition-all",
        answer === true && "border-emerald-200 bg-emerald-50",
        answer === false && "border-red-200 bg-red-50",
        answer === null && "border-gray-100",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-lg w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-snug">{question.text}</p>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1 block">
            {typeLabel[question.type] ?? question.type}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onAnswer(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 min-h-tap",
            answer === true
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600",
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Correct
        </button>
        <button
          onClick={() => onAnswer(false)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 min-h-tap",
            answer === false
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600",
          )}
        >
          <XCircle className="w-4 h-4" />
          Incorrect
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value, sub, subColor }) {
  return (
    <div className="flex items-start justify-between px-4 py-3.5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {sub && (
          <p
            className={cn(
              "text-xs mt-0.5",
              subColor
                ? "font-medium px-1.5 py-0.5 rounded-md inline-block border"
                : "text-gray-400",
              subColor,
            )}
          >
            {sub}
          </p>
        )}
      </div>
      <p className="font-bold text-gray-900 shrink-0">{value}</p>
    </div>
  );
}

function groupMiscuesByType(miscues) {
  const counts = {};
  miscues.forEach((m) => {
    if (!m.type) return;
    counts[m.type] = (counts[m.type] ?? 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({
    type,
    count,
    style:
      MISCUE_TYPES.find((t) => t.id === type)?.color ??
      "bg-gray-100 text-gray-700 border-gray-200",
  }));
}
