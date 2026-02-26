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

  useEffect(() => {
    const data = studentId
      ? getAssessmentsForStudent(studentId)
      : getAssessments();
    setAssessments(data);
    setLoading(false);
  }, [studentId]);

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
    add,
    update,
  };
}
