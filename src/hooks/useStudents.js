import { useState, useEffect, useCallback } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../utils/storage.js";

export function useStudents(classId = null) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const all = getStudents();
    setStudents(classId ? all.filter((s) => s.classId === classId) : all);
    setLoading(false);
  }, [classId, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const add = useCallback((studentData) => {
    const newStudent = addStudent(studentData);
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  }, []);

  const update = useCallback((id, updates) => {
    const updated = updateStudent(id, updates);
    if (updated)
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const remove = useCallback((id) => {
    deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { students, loading, refresh, add, update, remove };
}
