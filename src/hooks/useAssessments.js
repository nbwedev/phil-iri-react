// ─────────────────────────────────────────────────────────────────────────────
// useAssessments.js
//
// Loads assessments from storage, optionally filtered by studentId.
//
// KEY BEHAVIOUR:
//   - When studentId is provided (e.g. StudentDetailPage), loads only that
//     student's assessments on mount. Stays in sync via local state mutations.
//
//   - When studentId is null (e.g. DashboardPage showing all assessments),
//     we use a `refresh` function + a `refreshKey` so the caller can trigger
//     a re-read from storage after events like student deletion.
//     DashboardPage calls refresh() whenever it becomes visible via the
//     `usePageFocus` pattern.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getAssessments,
  getAssessmentsForStudent,
  addAssessment,
  updateAssessment,
} from "../utils/storage.js";

export function useAssessments(studentId = null) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-read from storage whenever studentId or refreshKey changes
  useEffect(() => {
    const data = studentId
      ? getAssessmentsForStudent(studentId)
      : getAssessments();
    setAssessments(data);
    setLoading(false);
  }, [studentId, refreshKey]);

  // Call this to force a re-read from storage.
  // Used by DashboardPage after navigating back from StudentList.
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const add = useCallback((assessmentData) => {
    const newAssessment = addAssessment(assessmentData);
    setAssessments((prev) => [...prev, newAssessment]);
    return newAssessment;
  }, []);

  const update = useCallback((id, updates) => {
    const updated = updateAssessment(id, updates);
    if (updated) {
      setAssessments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
    return updated;
  }, []);

  return {
    assessments,
    loading,
    refresh,
    add,
    update,
  };
}
