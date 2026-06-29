import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seedDashboardAsCurrentEntry } from '../utils/dashboardHistory';

const SNAP_BACK_PATHS = [
  '/',
  '/selection',
  '/login',
  '/tutor/login',
  '/register',
  '/teacher/register',
  '/forgot-password',
  '/reset-password',
  '/otp',
];

function shouldSnapBack(path) {
  if (SNAP_BACK_PATHS.includes(path)) return true;
  if (path.startsWith('/create-account')) return true;
  return false;
}

/**
 * If Back leaves the student app to landing/login, snap back to /home.
 */
export function useStudentAppBackGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const onPopState = () => {
      window.setTimeout(() => {
        const path = window.location.pathname;
        if (shouldSnapBack(path)) {
          seedDashboardAsCurrentEntry('/home');
          navigate('/home', { replace: true });
        }
      }, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);
}
