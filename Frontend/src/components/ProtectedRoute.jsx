import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../services/auth';

const ProtectedRoute = ({ children, roles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(getRole())) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
