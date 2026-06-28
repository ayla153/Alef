import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthRole } from '../api/authStorage';
import { getLoginPathForRole } from '../utils/authRedirect';

export default function GuestRoute({ children }) {
  if (isAuthenticated()) {
    const role = getAuthRole();
    if (role === 'tutor') return <Navigate to="/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}