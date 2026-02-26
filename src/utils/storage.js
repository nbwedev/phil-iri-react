// ─────────────────────────────────────────────────────────────────────────────
// storage.js
//
// All localStorage read/write goes through here.
// Components and hooks NEVER call localStorage directly.
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_KEYS, APP_VERSION } from "../constants/philIRI.js";

// ── Generic helpers ───────────────────────────────────────────────────────────

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[storage] Failed to save "${key}":`, error);
    return false;
  }
}

function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`[storage] Failed to load "${key}":`, error);
    return fallback;
  }
}

// ── Students ──────────────────────────────────────────────────────────────────

export function getStudents() {
  return load(STORAGE_KEYS.STUDENTS, []);
}

export function saveStudents(students) {
  return save(STORAGE_KEYS.STUDENTS, students);
}

export function addStudent(student) {
  const students = getStudents();
  const newStudent = {
    ...student,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function updateStudent(id, updates) {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;
  students[index] = {
    ...students[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveStudents(students);
  return students[index];
}

export function deleteStudent(id) {
  // Remove the student record
  saveStudents(getStudents().filter((s) => s.id !== id));

  // Remove all assessments belonging to this student,
  // and cascade-delete their GST + passage results too
  const studentAssessments = getAssessments().filter((a) => a.studentId === id);
  const assessmentIds = new Set(studentAssessments.map((a) => a.id));

  saveAssessments(getAssessments().filter((a) => a.studentId !== id));
  save(
    "philiri_gst_results",
    getGSTResults().filter((r) => !assessmentIds.has(r.assessmentId)),
  );
  save(
    "philiri_passage_results",
    getPassageResults().filter((r) => !assessmentIds.has(r.assessmentId)),
  );
}

// ── Assessments ───────────────────────────────────────────────────────────────

export function getAssessments() {
  return load(STORAGE_KEYS.ASSESSMENTS, []);
}

export function saveAssessments(assessments) {
  return save(STORAGE_KEYS.ASSESSMENTS, assessments);
}

export function getAssessmentsForStudent(studentId) {
  return getAssessments().filter((a) => a.studentId === studentId);
}

export function addAssessment(assessment) {
  const assessments = getAssessments();
  const newAssessment = {
    ...assessment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  assessments.push(newAssessment);
  saveAssessments(assessments);
  return newAssessment;
}

export function updateAssessment(id, updates) {
  const assessments = getAssessments();
  const index = assessments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  assessments[index] = {
    ...assessments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveAssessments(assessments);
  return assessments[index];
}

// ── GST Results ───────────────────────────────────────────────────────────────

export function getGSTResults() {
  return load("philiri_gst_results", []);
}

export function getGSTResultsForAssessment(assessmentId) {
  return getGSTResults().filter((r) => r.assessmentId === assessmentId);
}

export function saveGSTResult(result) {
  const results = getGSTResults();
  const existingIndex = results.findIndex(
    (r) =>
      r.assessmentId === result.assessmentId && r.language === result.language,
  );
  const newResult = {
    ...result,
    id: result.id ?? crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    results[existingIndex] = newResult;
  } else {
    results.push(newResult);
  }
  save("philiri_gst_results", results);
  return newResult;
}

// ── Passage Results ───────────────────────────────────────────────────────────

export function getPassageResults() {
  return load("philiri_passage_results", []);
}

export function getPassageResultsForAssessment(assessmentId) {
  return getPassageResults().filter((r) => r.assessmentId === assessmentId);
}

export function savePassageResult(result) {
  const results = getPassageResults();
  const newResult = {
    ...result,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  results.push(newResult);
  save("philiri_passage_results", results);
  return newResult;
}

// ── Classes ───────────────────────────────────────────────────────────────────

export function getClasses() {
  return load(STORAGE_KEYS.CLASSES, []);
}

export function saveClasses(classes) {
  return save(STORAGE_KEYS.CLASSES, classes);
}

export function addClass(classData) {
  const classes = getClasses();
  const newClass = {
    ...classData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
}

// ── App version check ─────────────────────────────────────────────────────────

export function checkAppVersion() {
  const storedVersion = load(STORAGE_KEYS.APP_VERSION, null);
  if (storedVersion !== APP_VERSION) {
    save(STORAGE_KEYS.APP_VERSION, APP_VERSION);
  }
}
