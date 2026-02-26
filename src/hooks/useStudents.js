// ─────────────────────────────────────────────────────────────────────────────
// useStudents.js
//
// All student data access goes through this hook.
// Components call useStudents() — they never call storage.js directly.
//
// For a basics-level React developer:
// Think of this hook as a "manager" that handles all the storage details.
// Your component just asks: "give me the students" and "add this student."
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from '../utils/storage.js'

export function useStudents(classId = null) {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)

  // Load students from storage on mount, filtered by classId if provided
  useEffect(() => {
    const all = getStudents()
    const filtered = classId
      ? all.filter(s => s.classId === classId)
      : all
    setStudents(filtered)
    setLoading(false)
  }, [classId])

  // Add a student and update local state immediately
  const add = useCallback((studentData) => {
    const newStudent = addStudent(studentData)
    setStudents(prev => [...prev, newStudent])
    return newStudent
  }, [])

  // Update a student
  const update = useCallback((id, updates) => {
    const updated = updateStudent(id, updates)
    if (updated) {
      setStudents(prev => prev.map(s => s.id === id ? updated : s))
    }
    return updated
  }, [])

  // Delete a student
  const remove = useCallback((id) => {
    deleteStudent(id)
    setStudents(prev => prev.filter(s => s.id !== id))
  }, [])

  return {
    students,   // array of student objects
    loading,    // boolean — show a spinner while true
    add,        // fn(studentData) → newStudent
    update,     // fn(id, updates) → updatedStudent
    remove,     // fn(id) → void
  }
}
