// ─────────────────────────────────────────────────────────────────────────────
// useStudent.js  (singular — one student, by ID)
//
// Different from useStudents (plural) which returns the whole list.
// This hook is used by detail pages that need one specific student.
//
// Why a separate hook?
// The detail page only cares about one student. Loading all 35 students
// to find one is wasteful and makes the component logic messier.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { getStudents } from "../utils/storage.js";

export function useStudent(studentId) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const all = getStudents();
    const found = all.find((s) => s.id === studentId);

    if (found) {
      setStudent(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, [studentId]);

  return {
    student, // the student object, or null
    loading, // true while looking up
    notFound, // true if ID doesn't match any student
  };
}
