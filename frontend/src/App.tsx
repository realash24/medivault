import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import ProblemsPage from '@/pages/ProblemsPage'
import MedicationsPage from '@/pages/MedicationsPage'
import ReactionsPage from '@/pages/ReactionsPage'
import VitalsPage from '@/pages/VitalsPage'
import PathologyPage from '@/pages/PathologyPage'
import ImmunisationsPage from '@/pages/ImmunisationsPage'
import EncountersPage from '@/pages/EncountersPage'
import DocumentsPage from '@/pages/DocumentsPage'
import CalendarPage from '@/pages/CalendarPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/reactions" element={<ReactionsPage />} />
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/pathology" element={<PathologyPage />} />
        <Route path="/immunisations" element={<ImmunisationsPage />} />
        <Route path="/encounters" element={<EncountersPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
