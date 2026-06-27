import { Navigate, useLocation } from 'react-router-dom';
import { getAuthRole, isAuthenticated } from '../api/authStorage';

export default function AdminRouteGuard({ children }) {
  const location = useLocation();
  const isAdmin = getAuthRole() === 'admin' && isAuthenticated();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
