import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../api/authStorage';
import { isProtectedAppPath } from '../utils/guestAuthNavigation';

/**
 * Guests must not get stuck when Back lands on dashboard/home from old history.
 */
export function useGuestAuthHistoryGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const onPopState = () => {
      window.setTimeout(() => {
        if (isAuthenticated()) return;
        const path = window.location.pathname;
        if (isProtectedAppPath(path)) {
          navigate('/', { replace: true });
        }
      }, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);
}
