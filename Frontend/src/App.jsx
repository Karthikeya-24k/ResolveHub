import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import IssueList    from './pages/IssueList';
import CreateIssue  from './pages/CreateIssue';
import IssueDetail  from './pages/IssueDetail';
import AssignIssue  from './pages/AssignIssue';
import UpdateStatus from './pages/UpdateStatus';
import ManageUsers  from './pages/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Authenticated — all roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/issues" element={
        <ProtectedRoute><IssueList /></ProtectedRoute>
      } />
      <Route path="/issues/:id" element={
        <ProtectedRoute><IssueDetail /></ProtectedRoute>
      } />

      {/* USER + ADMIN */}
      <Route path="/issues/create" element={
        <ProtectedRoute roles={['USER', 'ADMIN']}><CreateIssue /></ProtectedRoute>
      } />

      {/* ADMIN only */}
      <Route path="/issues/assign" element={
        <ProtectedRoute roles={['ADMIN']}><AssignIssue /></ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>
      } />

      {/* STAFF only */}
      <Route path="/issues/status" element={
        <ProtectedRoute roles={['STAFF', 'ADMIN']}><UpdateStatus /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
