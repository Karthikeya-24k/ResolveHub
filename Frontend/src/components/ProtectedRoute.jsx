import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../services/auth';

const ProtectedRoute = ({ children, roles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (roles && !roles.includes(role)) {
    return <Navigate to={role === 'SUPER_ADMIN' ? '/superadmin/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

export default ProtectedRoute;
