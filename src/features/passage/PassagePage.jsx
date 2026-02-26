// ─────────────────────────────────────────────────────────────────────────────
// PassagePage.jsx
//
// Graded passage administration screen — the most complex screen in the app.
//
// Four sequential steps:
//   1. Setup     — choose language + grade level, pick a passage
//   2. Reading   — display passage, tap words to mark miscues, run WPM timer
//   3. Questions — answer comprehension questions
//   4. Result    — show final reading level + all metrics
//
// URL: /students/:studentId/passage?assessmentId=xxx&language=Filipino
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Play, Square, Clock, BookOpen,
  ChevronRight, CheckCircle2, XCircle, RefreshCw,
  X, AlertCircle, Highlighter
} from 'lucide-react'
import { useStudent }     from '../../hooks/useStudent.js'
import { usePassage }     from './usePassage.js'
import { findPassage, getAvailableGrades } from './passages.js'
import { MISCUE_TYPES, LANGUAGES, WPM_BENCHMARKS } from '../../constants/philIRI.js'
import { cn } from '../../utils/cn.js'

// ─────────────────────────────────────────────────────────────────────────────
// Main page — controls which step is shown
// ─────────────────────────────────────────────────────────────────────────────

export default function PassagePage() {
  const { studentId }        = useParams()
  const [searchParams]       = useSearchParams()
  const navigate             = useNavigate()
  const assessmentId         = searchParams.get('assessmentId')
  const urlLanguage          = searchParams.get('language')

  const { student, loading } = useStudent(studentId)

  // Step 1 config state
  const [language,    setLanguage]    = useState(urlLanguage ?? null)
  const [gradeLevel,  setGradeLevel]  = useState(null)
  const [step,        setStep]        = useState('setup') // 'setup'|'reading'|'questions'|'result'

  // Resolve passage from config
  const passage = (language && gradeLevel)
    ? findPassage(language, gradeLevel)
    : null

  // The hook that runs everything
  const psg = usePassage(passage, assessmentId)

  function handleSetupComplete(lang, grade) {
    setLanguage(lang)
    setGradeLevel(grade)
    setStep('reading')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Result screen ──
  if (step === 'result' && psg.savedResult) {
    return (
      <PassageResult
        student={student}
        passage={passage}
        result={psg.savedResult}
        onDone={() => navigate('/students/' + studentId)}
        onViewStudent={() => navigate('/students/' + studentId)}
      />
    )
  }

  // ── Comprehension questions ──
  if (step === 'questions') {
    return (
      <ComprehensionStep
        passage={passage}
        psg={psg}
        onBack={() => setStep('reading')}
        onSubmit={() => {
          psg.submit()
          setStep('result')
        }}
      />
    )
  }

  // ── Active reading / miscue marking ──
  if (step === 'reading' && passage) {
    return (
      <ReadingStep
        student={student}
        passage={passage}
        psg={psg}
        onBack={() => setStep('setup')}
        onFinishReading={() => setStep('questions')}
      />
    )
  }

  // ── Setup ──
  return (
    <SetupStep
      student={student}
      studentId={studentId}
      initialLanguage={urlLanguage}
      onBack={() => navigate('/students/' + studentId)}
      onComplete={handleSetupComplete}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Setup — choose language and grade level
// ─────────────────────────────────────────────────────────────────────────────

function SetupStep({ student, studentId, initialLanguage, onBack, onComplete }) {
  const [language,   setLanguage]   = useState(initialLanguage ?? null)
  const [gradeLevel, setGradeLevel] = useState(null)

  const availableGrades = language ? getAvailableGrades(language) : []
  const canProceed      = language && gradeLevel &&
                          findPassage(language, gradeLevel) !== null

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 -ml-1 min-h-tap">
        <ArrowLeft className="w-4 h-4" />
        {student ? student.firstName + ' ' + student.lastName : 'Back'}
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Graded Passage</h1>
        <p className="text-sm text-gray-500 mt-1">Select language and starting grade level.</p>
      </div>

      {/* Language */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Language</p>
        <div className="grid grid-cols-2 gap-3">
          {[LANGUAGES.FILIPINO, LANGUAGES.ENGLISH].map(lang => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setGradeLevel(null) }}
              className={cn(
                'py-4 rounded-2xl border-2 font-semibold text-sm transition-all',
                language === lang
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Grade level — only shown after language picked */}
      {language && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Starting Grade</p>
          <div className="grid grid-cols-4 gap-2">
            {availableGrades.map(grade => (
              <button
                key={grade}
                onClick={() => setGradeLevel(grade)}
                className={cn(
                  'py-3 rounded-2xl border-2 font-semibold text-sm transition-all min-h-tap',
                  gradeLevel === grade
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
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

      {/* Passage preview */}
      {canProceed && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Passage</p>
          <p className="font-semibold text-gray-800">{findPassage(language, gradeLevel).title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {language} · Grade {gradeLevel} · {findPassage(language, gradeLevel).totalWords} words ·{' '}
            {findPassage(language, gradeLevel).questions.length} questions
          </p>
        </div>
      )}

      {language && gradeLevel && !findPassage(language, gradeLevel) && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No passage found for {language} Grade {gradeLevel} in sample data.
        </div>
      )}

      <button
        onClick={() => onComplete(language, gradeLevel)}
        disabled={!canProceed}
        className={cn(
          'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all',
          canProceed
            ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        )}
      >
        Begin Passage Administration
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Reading — word tokens + miscue toolbar + WPM timer
// ─────────────────────────────────────────────────────────────────────────────

function ReadingStep({ student, passage, psg, onBack, onFinishReading }) {
  const canFinish = psg.timerState === 'stopped'

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
          <h1 className="text-base font-bold text-gray-900 truncate">{passage.title}</h1>
          <p className="text-xs text-gray-500">
            {passage.language} · Grade {passage.gradeLevel} · {passage.totalWords} words
          </p>
        </div>

        {/* Miscue counter badge */}
        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-1.5 text-center shrink-0">
          <p className="text-xs text-red-400 leading-none">Miscues</p>
          <p className="text-lg font-bold text-red-600 leading-tight">{psg.miscueCount}</p>
        </div>
      </div>

      {/* WPM Timer */}
      <WPMTimer
        timerState={psg.timerState}
        elapsedMs={psg.elapsedMs}
        onStart={psg.startTimer}
        onStop={psg.stopTimer}
        onReset={psg.resetTimer}
      />

      {/* Accuracy live display */}
      {psg.miscueCount > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
          <span className="text-gray-500">Word Accuracy</span>
          <span className={cn(
            'font-semibold',
            psg.wordAccuracyPct >= 97 ? 'text-emerald-600' :
            psg.wordAccuracyPct >= 90 ? 'text-amber-600' : 'text-red-600'
          )}>
            {psg.wordAccuracyPct}%
          </span>
        </div>
      )}

      {/* Instruction */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
        <Highlighter className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Start timer when student begins reading. Tap any word to mark a miscue.
        </p>
      </div>

      {/* Passage text — word tokens */}
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

      {/* Miscue toolbar — only visible when a word is active */}
      {psg.activeIndex !== null && (
        <MiscueToolbar
          activeToken={psg.tokens[psg.activeIndex]}
          onApply={psg.applyMiscue}
          onSelfCorrection={psg.markSelfCorrection}
          onClear={() => { psg.clearMiscue(psg.activeIndex); psg.dismissToolbar() }}
          onDismiss={psg.dismissToolbar}
        />
      )}

      {/* Finish reading button */}
      <div className="pb-4">
        {!canFinish && psg.timerState === 'idle' && (
          <p className="text-xs text-center text-gray-400 mb-3">
            Start the timer to begin, stop it when the student finishes reading.
          </p>
        )}
        {!canFinish && psg.timerState === 'running' && (
          <p className="text-xs text-center text-amber-600 mb-3">
            Stop the timer before proceeding to comprehension questions.
          </p>
        )}
        <button
          onClick={onFinishReading}
          disabled={!canFinish}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all',
            canFinish
              ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
        >
          Proceed to Comprehension Questions
        </button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Comprehension questions
// ─────────────────────────────────────────────────────────────────────────────

function ComprehensionStep({ passage, psg, onBack, onSubmit }) {
  const allAnswered = psg.answeredCompCount === psg.totalQuestions

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 -ml-1 min-h-tap">
        <ArrowLeft className="w-4 h-4" />
        Back to passage
      </button>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Comprehension</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mark each answer correct or incorrect.
          {' '}{psg.answeredCompCount} of {psg.totalQuestions} answered.
        </p>
      </div>

      {/* WPM summary card */}
      {psg.wpm > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-brand-700">Reading speed</span>
          <span className="font-bold text-brand-800">{psg.wpm} WPM</span>
        </div>
      )}

      {/* Questions */}
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

      {/* Comprehension score preview */}
      {allAnswered && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Comprehension score</span>
          <span className={cn(
            'font-bold text-lg',
            psg.comprehensionPct >= 80 ? 'text-emerald-600' :
            psg.comprehensionPct >= 59 ? 'text-amber-600' : 'text-red-600'
          )}>
            {psg.comprehensionPct}%
          </span>
        </div>
      )}

      <div className="pb-4">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={cn(
            'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all',
            allAnswered
              ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.98] shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
        >
          {allAnswered ? 'Calculate Reading Level' : `Answer all ${psg.totalQuestions} questions to continue`}
        </button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Result
// ─────────────────────────────────────────────────────────────────────────────

function PassageResult({ student, passage, result, onDone }) {
  const levelColors = {
    Independent:   'bg-independent-light border-independent text-independent-dark',
    Instructional: 'bg-instructional-light border-instructional text-instructional-dark',
    Frustration:   'bg-frustration-light border-frustration text-frustration-dark',
  }

  const gradeWpm = WPM_BENCHMARKS[passage?.gradeLevel]

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      <h1 className="text-xl font-bold text-gray-900">Passage Result</h1>

      {/* Final level — big card */}
      <div className={cn(
        'rounded-2xl p-6 text-center border-2',
        levelColors[result.readingLevel] ?? 'bg-gray-50 border-gray-200 text-gray-700'
      )}>
        <p className="text-sm opacity-70 mb-1">{result.language} · Grade {result.gradeLevel}</p>
        <p className="text-4xl font-black mb-1">{result.readingLevel}</p>
        <p className="text-sm opacity-60">{passage?.title}</p>
      </div>

      {/* Student name */}
      {student && (
        <p className="text-center text-sm text-gray-500">
          {student.firstName} {student.lastName} · Grade {student.gradeLevel}
        </p>
      )}

      {/* Metrics breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
        <MetricRow
          label="Word Accuracy"
          value={result.wordAccuracyPct + '%'}
          sub={result.wordAccuracyLevel}
          subColor={levelColors[result.wordAccuracyLevel]}
        />
        <MetricRow
          label="Comprehension"
          value={result.comprehensionPct + '%'}
          sub={result.comprehensionLevel + ' (' + result.correctCompCount + '/' + result.totalQuestions + ' correct)'}
          subColor={levelColors[result.comprehensionLevel]}
        />
        <MetricRow
          label="Words Per Minute"
          value={result.wpm + ' WPM'}
          sub={gradeWpm ? 'Grade ' + passage.gradeLevel + ' benchmark: ' + gradeWpm.min + '–' + gradeWpm.max + ' WPM' : ''}
        />
        <MetricRow
          label="Miscues"
          value={result.miscueCount + ' error' + (result.miscueCount !== 1 ? 's' : '')}
          sub={result.miscues.length > 0
            ? result.miscues.slice(0, 3).map(m => m.word).join(', ') + (result.miscues.length > 3 ? '...' : '')
            : 'No miscues recorded'
          }
        />
      </div>

      {/* Miscue breakdown — only if there were miscues */}
      {result.miscues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Miscue Detail</p>
          <div className="flex flex-wrap gap-2">
            {groupMiscuesByType(result.miscues).map(({ type, count, style }) => (
              <span key={type} className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', style)}>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 pb-4">
        <button
          onClick={onDone}
          className="w-full py-3.5 bg-brand-700 text-white rounded-2xl font-semibold text-sm hover:bg-brand-800 active:scale-[0.98] transition-all shadow-sm"
        >
          Done — back to student
        </button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Word Token ────────────────────────────────────────────────────────────────

function WordToken({ token, isActive, onTap }) {
  const miscueType = MISCUE_TYPES.find(m => m.id === token.miscue)

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onTap() }}
      className={cn(
        'relative inline-flex flex-col items-center gap-0.5',
        'rounded-lg px-1 py-0.5 transition-all',
        'active:scale-95',
        isActive        && 'ring-2 ring-brand-400 ring-offset-1',
        token.miscue    && 'bg-red-50',
        token.selfCorrection && 'bg-blue-50',
        !token.miscue && !token.selfCorrection && !isActive && 'hover:bg-gray-100'
      )}
    >
      {/* Miscue badge above the word */}
      {token.miscue && (
        <span className={cn(
          'text-[9px] font-bold px-1 rounded leading-none',
          miscueType?.color ?? 'bg-red-100 text-red-700'
        )}>
          {miscueType?.shortLabel ?? '?'}
        </span>
      )}
      {token.selfCorrection && (
        <span className="text-[9px] font-bold px-1 rounded leading-none bg-blue-100 text-blue-700">
          SC
        </span>
      )}

      {/* The word itself */}
      <span className={cn(
        'text-base leading-snug',
        token.miscue         && 'text-red-700 line-through decoration-red-400',
        token.selfCorrection && 'text-blue-700',
        isActive             && 'font-semibold'
      )}>
        {token.word}
      </span>
    </button>
  )
}

// ── Miscue Toolbar ────────────────────────────────────────────────────────────

function MiscueToolbar({ activeToken, onApply, onSelfCorrection, onClear, onDismiss }) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

        {/* Toolbar header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            Marking:{' '}
            <span className="text-brand-700">"{activeToken.word}"</span>
          </p>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Miscue type buttons — 2 rows of 4 */}
        <div className="p-3 grid grid-cols-4 gap-2">
          {MISCUE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => onApply(type.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all active:scale-95',
                activeToken.miscue === type.id
                  ? type.color + ' border-current shadow-sm'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
              )}
            >
              <span className={cn(
                'text-xs font-bold',
                activeToken.miscue === type.id ? '' : 'text-gray-700'
              )}>
                {type.shortLabel}
              </span>
              <span className="text-[9px] leading-tight text-center opacity-70">
                {type.label.split('').slice(0, 8).join('')}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary actions */}
        <div className="flex gap-2 px-3 pb-3">
          <button
            onClick={onSelfCorrection}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
              activeToken.selfCorrection
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50'
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
  )
}

// ── WPM Timer ─────────────────────────────────────────────────────────────────

function WPMTimer({ timerState, elapsedMs, onStart, onStop, onReset }) {
  const seconds  = Math.floor(elapsedMs / 1000)
  const minutes  = Math.floor(seconds / 60)
  const secs     = seconds % 60
  const display  = String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0')

  return (
    <div className="flex items-center gap-3 bg-gray-900 rounded-2xl px-4 py-3">
      <Clock className="w-4 h-4 text-gray-400 shrink-0" />

      {/* Time display */}
      <span className="font-mono text-2xl font-bold text-white flex-1 tracking-wider">
        {display}
      </span>

      {/* Controls */}
      <div className="flex gap-2">
        {timerState === 'idle' && (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 active:scale-95 transition-all min-h-tap"
          >
            <Play className="w-4 h-4 fill-current" />
            Start
          </button>
        )}
        {timerState === 'running' && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 active:scale-95 transition-all min-h-tap"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop
          </button>
        )}
        {timerState === 'stopped' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-600 active:scale-95 transition-all min-h-tap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({ number, question, answer, onAnswer }) {
  const typeLabel = {
    literal:      'Literal',
    inferential:  'Inferential',
    critical:     'Critical',
  }

  return (
    <div className={cn(
      'bg-white border rounded-2xl p-4 transition-all',
      answer === true  && 'border-emerald-200 bg-emerald-50',
      answer === false && 'border-red-200 bg-red-50',
      answer === null  && 'border-gray-100'
    )}>
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

      {/* Correct / Incorrect buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onAnswer(true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 min-h-tap',
            answer === true
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Correct
        </button>
        <button
          onClick={() => onAnswer(false)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 min-h-tap',
            answer === false
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600'
          )}
        >
          <XCircle className="w-4 h-4" />
          Incorrect
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function MetricRow({ label, value, sub, subColor }) {
  return (
    <div className="flex items-start justify-between px-4 py-3.5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {sub && (
          <p className={cn(
            'text-xs mt-0.5',
            subColor ? 'font-medium px-1.5 py-0.5 rounded-md inline-block border' : 'text-gray-400'
          , subColor)}>
            {sub}
          </p>
        )}
      </div>
      <p className="font-bold text-gray-900 shrink-0">{value}</p>
    </div>
  )
}

function groupMiscuesByType(miscues) {
  const counts = {}
  miscues.forEach(m => {
    if (!m.type) return
    counts[m.type] = (counts[m.type] ?? 0) + 1
  })
  return Object.entries(counts).map(([type, count]) => ({
    type,
    count,
    style: MISCUE_TYPES.find(t => t.id === type)?.color ?? 'bg-gray-100 text-gray-700 border-gray-200',
  }))
}
