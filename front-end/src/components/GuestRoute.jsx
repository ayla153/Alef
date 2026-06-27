import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthRole } from '../api/authStorage';

export default function GuestRoute({ children }) {
  if (isAuthenticated()) {
    const role = getAuthRole();
    if (role === 'tutor') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}