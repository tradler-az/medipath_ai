import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

