import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthRole } from '../api/authStorage';

export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    return <Navigate to="/selection" replace />;
  }

  if (role && getAuthRole() !== role) {
    const userRole = getAuthRole();
    if (userRole === 'tutor') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}