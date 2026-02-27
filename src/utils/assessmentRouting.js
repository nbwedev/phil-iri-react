// ─────────────────────────────────────────────────────────────────────────────
// assessmentRouting.js
//
// Single source of truth for "where does this assessment go next?"
//
// Logic:
//   Only consider languages that have a GST result on record.
//   A missing GST for a language = that language was never administered = skip it.
//
//   For each language that HAS a GST result (Filipino first, then English):
//     1. GST score ≥ 14 → passed, no passage needed → skip
//     2. Passage already done for this language → skip
//     3. Otherwise → go to passage for this language
//
//   If nothing left to do → go to student page
// ─────────────────────────────────────────────────────────────────────────────

import { LANGUAGES, GST } from "../constants/philIRI.js";
import {
  getGSTResultsForAssessment,
  getPassageResultsForAssessment,
} from "./storage.js";

export function resolveAssessmentRoute(studentId, assessmentId) {
  const gstResults = getGSTResultsForAssessment(assessmentId);
  const passageResults = getPassageResultsForAssessment(assessmentId);

  const languagesDone = new Set(passageResults.map((r) => r.language));

  for (const lang of [LANGUAGES.FILIPINO, LANGUAGES.ENGLISH]) {
    const gst = gstResults.find((r) => r.language === lang);

    // No GST for this language — it was never administered, skip entirely
    if (!gst) continue;

    // GST passed — no passage needed
    if (gst.score >= GST.INDIVIDUAL_TESTING_CUTOFF) continue;

    // GST triggered but passage already done — skip
    if (languagesDone.has(lang)) continue;

    // GST triggered and passage not yet done → go here
    return (
      `/students/${studentId}/passage` +
      `?assessmentId=${assessmentId}` +
      `&language=${lang}`
    );
  }

  // Nothing left to do
  return `/students/${studentId}`;
}
