import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthRole } from '../api/authStorage';
import { useGuestAuthHistoryGuard } from '../hooks/useGuestAuthHistoryGuard';

export default function GuestRoute({ children }) {
  useGuestAuthHistoryGuard();

  if (isAuthenticated()) {
    const role = getAuthRole();
    if (role === 'tutor') return <Navigate to="/dashboard/home" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}