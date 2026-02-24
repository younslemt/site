import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrganizations from './pages/admin/Organizations';
import AdminUsers from './pages/admin/Users';
import AdminSprints from './pages/admin/Sprints';
import AdminDocuments from './pages/admin/Documents';
import AdminDiagnostics from './pages/admin/Diagnostics';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import ClientDocuments from './pages/client/Documents';
import ClientDiagnostics from './pages/client/Diagnostics';
import ClientAchievements from './pages/client/Achievements';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="organizations" element={<AdminOrganizations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sprints" element={<AdminSprints />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="diagnostics" element={<AdminDiagnostics />} />
          </Route>

          {/* Client Routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['client']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="diagnostics" element={<ClientDiagnostics />} />
            <Route path="achievements" element={<ClientAchievements />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
