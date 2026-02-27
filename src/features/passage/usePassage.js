// ─────────────────────────────────────────────────────────────────────────────
// usePassage.js
//
// Manages ALL state for one graded passage administration session.
//
// BUG FIXED vs original:
//   useState() lazy initialisers run only ONCE on mount.
//   If the teacher went back to setup and picked a different grade,
//   tokens and compAnswers stayed stale from the first passage.
//   Fix: useEffect watches `passage` and reinitialises when it changes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  calculateReadingLevel,
  calculateWordAccuracyPct,
  calculateComprehensionPct,
  calculateWPM,
} from "../../utils/calculateReadingLevel.js";
import { updateAssessment, savePassageResult } from "../../utils/storage.js";

// ── Tokenise passage text into word objects ───────────────────────────────────
// Each word becomes an object so miscue state can be attached to it.
// Punctuation stays attached (e.g. "running," is one token).
function tokenise(text) {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((word, index) => ({
      index,
      word,
      miscue: null, // miscueType id, or null if clean
      selfCorrection: false, // noted but NOT counted as an error
    }));
}

function buildCompAnswers(passage) {
  if (!passage) return {};
  return Object.fromEntries(passage.questions.map((q) => [q.id, null]));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePassage(passage, assessmentId) {
  // ── Core mutable state ────────────────────────────────────────────────────

  const [tokens, setTokens] = useState(() =>
    passage ? tokenise(passage.text) : [],
  );
  const [compAnswers, setCompAnswers] = useState(() =>
    buildCompAnswers(passage),
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [savedResult, setSavedResult] = useState(null);

  // ── Timer ─────────────────────────────────────────────────────────────────

  const [timerState, setTimerState] = useState("idle"); // 'idle' | 'running' | 'stopped'
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // ── REINITIALISE when passage changes ─────────────────────────────────────
  // This is the fix. When the teacher goes back and picks a different grade,
  // `passage` becomes a new object. This effect detects that and resets
  // all session state so the new passage starts clean.
  //
  // We track the passage id (not the object itself) to avoid unnecessary resets.
  const passageIdRef = useRef(null);
  useEffect(() => {
    if (!passage) return;
    if (passage.id === passageIdRef.current) return; // same passage, no reset needed

    passageIdRef.current = passage.id;
    setTokens(tokenise(passage.text));
    setCompAnswers(buildCompAnswers(passage));
    setActiveIndex(null);
    setSubmitted(false);
    setSavedResult(null);
    // Reset timer too
    clearInterval(intervalRef.current);
    setElapsedMs(0);
    setTimerState("idle");
    startTimeRef.current = null;
  }, [passage]);

  // ── Timer controls ────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (timerState !== "idle") return;
    startTimeRef.current = Date.now() - elapsedMs;
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
    setTimerState("running");
  }, [timerState, elapsedMs]);

  const stopTimer = useCallback(() => {
    if (timerState !== "running") return;
    clearInterval(intervalRef.current);
    setElapsedMs(Date.now() - startTimeRef.current);
    setTimerState("stopped");
  }, [timerState]);

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setElapsedMs(0);
    setTimerState("idle");
    startTimeRef.current = null;
  }, []);

  // ── Miscue actions ────────────────────────────────────────────────────────

  const tapWord = useCallback(
    (index) => {
      if (submitted) return;
      setActiveIndex((prev) => (prev === index ? null : index));
    },
    [submitted],
  );

  const applyMiscue = useCallback(
    (miscueTypeId) => {
      if (activeIndex === null || submitted) return;
      setTokens((prev) => {
        const next = [...prev];
        next[activeIndex] = {
          ...next[activeIndex],
          miscue:
            next[activeIndex].miscue === miscueTypeId ? null : miscueTypeId,
          selfCorrection: false,
        };
        return next;
      });
    },
    [activeIndex, submitted],
  );

  const markSelfCorrection = useCallback(() => {
    if (activeIndex === null || submitted) return;
    setTokens((prev) => {
      const next = [...prev];
      next[activeIndex] = {
        ...next[activeIndex],
        miscue: null,
        selfCorrection: !next[activeIndex].selfCorrection,
      };
      return next;
    });
  }, [activeIndex, submitted]);

  const clearMiscue = useCallback(
    (index) => {
      if (submitted) return;
      setTokens((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], miscue: null, selfCorrection: false };
        return next;
      });
    },
    [submitted],
  );

  const dismissToolbar = useCallback(() => setActiveIndex(null), []);

  // ── Comprehension ─────────────────────────────────────────────────────────

  const setCompAnswer = useCallback(
    (questionId, value) => {
      if (submitted) return;
      setCompAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId] === value ? null : value,
      }));
    },
    [submitted],
  );

  // ── Computed values ───────────────────────────────────────────────────────

  const miscueCount = useMemo(
    () => tokens.filter((t) => t.miscue !== null).length,
    [tokens],
  );

  const totalWords = passage?.totalWords ?? tokens.length;

  const wordAccuracyPct = useMemo(
    () => calculateWordAccuracyPct(totalWords, miscueCount),
    [totalWords, miscueCount],
  );

  const answeredCompCount = useMemo(
    () => Object.values(compAnswers).filter((v) => v !== null).length,
    [compAnswers],
  );

  const correctCompCount = useMemo(
    () => Object.values(compAnswers).filter((v) => v === true).length,
    [compAnswers],
  );

  const totalQuestions = passage?.questions.length ?? 0;

  const comprehensionPct = useMemo(
    () => calculateComprehensionPct(correctCompCount, totalQuestions),
    [correctCompCount, totalQuestions],
  );

  const wpm = useMemo(
    () => (timerState === "stopped" ? calculateWPM(totalWords, elapsedMs) : 0),
    [timerState, totalWords, elapsedMs],
  );

  const canCalculate =
    timerState === "stopped" && answeredCompCount === totalQuestions;

  const levelResult = useMemo(
    () =>
      canCalculate
        ? calculateReadingLevel(wordAccuracyPct, comprehensionPct)
        : null,
    [canCalculate, wordAccuracyPct, comprehensionPct],
  );

  // ── Submit / save ─────────────────────────────────────────────────────────

  const submit = useCallback(() => {
    if (!canCalculate || submitted || !passage || !levelResult) return null;

    const result = {
      assessmentId,
      passageId: passage.id,
      language: passage.language,
      gradeLevel: passage.gradeLevel,
      passageSet: passage.set,
      totalWords,
      readingTimeMs: elapsedMs,
      wpm,
      miscues: tokens
        .filter((t) => t.miscue || t.selfCorrection)
        .map((t) => ({
          wordIndex: t.index,
          word: t.word,
          type: t.miscue,
          selfCorrection: t.selfCorrection,
        })),
      miscueCount,
      wordAccuracyPct,
      comprehensionAnswers: compAnswers,
      correctCompCount,
      totalQuestions,
      comprehensionPct,
      readingLevel: levelResult.level,
      wordAccuracyLevel: levelResult.wordAccuracyLevel,
      comprehensionLevel: levelResult.comprehensionLevel,
      completedAt: new Date().toISOString(),
    };

    const saved = savePassageResult(result);

    // Update the assessment with this language's result.
    // Do NOT set completedAt here — the assessment may still have another
    // language (e.g. English) to test. completedAt is set by the routing
    // layer once all languages are done.
    updateAssessment(assessmentId, {
      finalLevel: levelResult.level,
      languages: [passage.language],
    });

    setSavedResult(saved);
    setSubmitted(true);
    return saved;
  }, [
    canCalculate,
    submitted,
    passage,
    assessmentId,
    levelResult,
    totalWords,
    elapsedMs,
    wpm,
    tokens,
    miscueCount,
    wordAccuracyPct,
    compAnswers,
    correctCompCount,
    totalQuestions,
    comprehensionPct,
  ]);

  return {
    tokens,
    activeIndex,
    timerState,
    elapsedMs,
    compAnswers,
    submitted,
    savedResult,
    miscueCount,
    wordAccuracyPct,
    answeredCompCount,
    comprehensionPct,
    wpm,
    levelResult,
    canCalculate,
    totalQuestions,
    startTimer,
    stopTimer,
    resetTimer,
    tapWord,
    applyMiscue,
    markSelfCorrection,
    clearMiscue,
    dismissToolbar,
    setCompAnswer,
    submit,
  };
}
