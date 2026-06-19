import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from './services/auth';
import { SearchProvider } from './context/SearchContext';

import Landing             from './pages/Landing';
import Login               from './pages/Login';
import Register            from './pages/Register';
import Dashboard           from './pages/Dashboard';
import IssueList           from './pages/IssueList';
import CreateIssue         from './pages/CreateIssue';
import IssueDetail         from './pages/IssueDetail';
import AssignIssue         from './pages/AssignIssue';
import UpdateStatus        from './pages/UpdateStatus';
import ManageUsers         from './pages/ManageUsers';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageAdmins        from './pages/ManageAdmins';
import Organizations       from './pages/Organizations';
import PublicPortal        from './pages/PublicPortal';
import TrackComplaint      from './pages/TrackComplaint';
import Applications        from './pages/Applications';
import OrgAudit            from './pages/OrgAudit';
import AdminOrgSettings    from './pages/AdminOrgSettings';
import ChangePassword      from './pages/ChangePassword';
import ProtectedRoute      from './components/ProtectedRoute';

const RoleRedirect = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role === 'SUPER_ADMIN') return <Navigate to="/superadmin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <SearchProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={isAuthenticated() ? <RoleRedirect /> : <Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public org portal — no auth required */}
        <Route path="/org/:slug"            element={<PublicPortal />} />
        <Route path="/track/:ticketNumber"  element={<TrackComplaint />} />

        {/* SUPER_ADMIN */}
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>
        } />
        <Route path="/superadmin/admins" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}><ManageAdmins /></ProtectedRoute>
        } />
        <Route path="/superadmin/applications" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}><Applications /></ProtectedRoute>
        } />
        <Route path="/superadmin/organizations" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}><Organizations /></ProtectedRoute>
        } />
        <Route path="/superadmin/audit/:orgId" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}><OrgAudit /></ProtectedRoute>
        } />

        {/* All authenticated roles */}
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
        <Route path="/admin/organization" element={
          <ProtectedRoute roles={['ADMIN']}><AdminOrgSettings /></ProtectedRoute>
        } />

        {/* STAFF + ADMIN */}
        <Route path="/issues/status" element={
          <ProtectedRoute roles={['STAFF', 'ADMIN']}><UpdateStatus /></ProtectedRoute>
        } />

        {/* All authenticated — change password */}
        <Route path="/profile/change-password" element={
          <ProtectedRoute><ChangePassword /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </SearchProvider>
);

export default App;
