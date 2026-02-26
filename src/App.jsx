import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import AppLayout from './components/layout/AppLayout.jsx'

// Pages — we'll build these one by one
// For now they're placeholders so the app compiles and routes work
import DashboardPage    from './features/students/DashboardPage.jsx'
import StudentListPage  from './features/students/StudentListPage.jsx'
import StudentDetailPage from './features/students/StudentDetailPage.jsx'
import GSTPage          from './features/gst/GSTPage.jsx'
import PassagePage      from './features/passage/PassagePage.jsx'
import ResultsPage      from './features/students/ResultsPage.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Route map (keep this comment updated as routes change):
//
//  /                     → redirect to /dashboard
//  /dashboard            → class overview, quick stats
//  /students             → full student list
//  /students/:id         → individual student record + assessment history
//  /students/:id/gst     → GST administration screen
//  /students/:id/passage → Graded passage administration screen
//  /students/:id/results → Assessment results + PDF export
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"                    element={<DashboardPage />} />
        <Route path="students"                     element={<StudentListPage />} />
        <Route path="students/:studentId"          element={<StudentDetailPage />} />
        <Route path="students/:studentId/gst"      element={<GSTPage />} />
        <Route path="students/:studentId/passage"  element={<PassagePage />} />
        <Route path="students/:studentId/results"  element={<ResultsPage />} />
      </Route>
    </Routes>
  )
}
