// ─────────────────────────────────────────────────────────────────────────────
// useGST.js
//
// Manages all state and logic for one GST administration session.
//
// The GSTPage just calls this hook and gets back everything it needs:
//   - The current answers array
//   - Functions to toggle answers and submit
//   - The computed score and result
//
// This keeps all the GST logic OUT of the component.
// The component only handles display. The hook handles everything else.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from "react";
import { GST, LANGUAGES } from "../../constants/philIRI.js";
import {
  saveGSTResult,
  getGSTResultsForAssessment,
  updateAssessment,
} from "../../utils/storage.js";
import { gstTriggersIndividual } from "../../utils/calculateReadingLevel.js";

// Build the initial answers array: 20 items, all null (unanswered)
// null = unanswered, true = correct, false = incorrect
function buildInitialAnswers() {
  return Array(GST.TOTAL_ITEMS).fill(null);
}

export function useGST(assessmentId, language) {
  const [answers, setAnswers] = useState(() => {
    // On mount, check if there's a saved result for this assessment+language
    // This handles the "resume" case if a teacher navigated away mid-GST
    if (!assessmentId || !language) return buildInitialAnswers();
    const existing = getGSTResultsForAssessment(assessmentId).find(
      (r) => r.language === language,
    );
    return existing?.answers ?? buildInitialAnswers();
  });

  const [submitted, setSubmitted] = useState(() => {
    // Check if this language's GST was already submitted
    if (!assessmentId || !language) return false;
    const existing = getGSTResultsForAssessment(assessmentId).find(
      (r) => r.language === language,
    );
    return Boolean(existing?.submittedAt);
  });

  // ── Computed values ──────────────────────────────────────────────────────

  // How many items have been answered (not null)
  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers],
  );

  // Score = number of correct answers
  const score = useMemo(
    () => answers.filter((a) => a === true).length,
    [answers],
  );

  // Does this score trigger individual passage testing?
  const triggersIndividual = useMemo(
    () => gstTriggersIndividual(score),
    [score],
  );

  // Can the form be submitted?
  // All 20 items must be answered
  const canSubmit = answeredCount === GST.TOTAL_ITEMS && !submitted;

  // ── Actions ─────────────────────────────────────────────────────────────

  // Toggle one item: null → true → false → null (cycle)
  // This lets teachers quickly mark correct/incorrect with one tap
  const toggleAnswer = useCallback(
    (index) => {
      if (submitted) return; // locked after submission
      setAnswers((prev) => {
        const next = [...prev];
        if (next[index] === null) next[index] = true;
        else if (next[index] === true) next[index] = false;
        else next[index] = null;
        return next;
      });
    },
    [submitted],
  );

  // Mark an item explicitly correct or incorrect
  // Used by the Yes/No button variant
  const setAnswer = useCallback(
    (index, value) => {
      if (submitted) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [submitted],
  );

  // Submit and save
  const submit = useCallback(() => {
    if (!canSubmit) return null;

    const result = saveGSTResult({
      assessmentId,
      language,
      answers,
      score,
      totalItems: GST.TOTAL_ITEMS,
      triggersIndividual,
      submittedAt: new Date().toISOString(),
    });

    // Also update the parent assessment to record this language was GST'd
    updateAssessment(assessmentId, {
      [`gst_${language.toLowerCase()}_done`]: true,
      [`gst_${language.toLowerCase()}_score`]: score,
    });

    setSubmitted(true);
    return result;
  }, [canSubmit, assessmentId, language, answers, score, triggersIndividual]);

  // Reset — for re-testing (clears local state only, not saved result)
  const reset = useCallback(() => {
    setAnswers(buildInitialAnswers());
    setSubmitted(false);
  }, []);

  return {
    answers, // array of 20: null | true | false
    answeredCount, // 0–20
    score, // 0–20
    triggersIndividual, // boolean
    canSubmit, // boolean
    submitted, // boolean — locked after submit
    toggleAnswer, // fn(index) — cycles null→true→false→null
    setAnswer, // fn(index, bool) — set explicitly
    submit, // fn() → saved result object
    reset, // fn() — clears for re-test
  };
}
