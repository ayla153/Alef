import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthRole } from '../api/authStorage';

export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    // Send guests to landing — not /selection — so Back from selection
    // does not loop through dashboard/home and trap them on selection.
    return <Navigate to="/" replace />;
  }

  const userRole = getAuthRole();

  if (role && userRole !== role) {
    if (userRole === 'tutor') return <Navigate to="/dashboard/home" replace />;
    if (userRole === 'student') return <Navigate to="/home" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}