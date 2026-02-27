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

    // No GST for this language — never administered, skip it
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
