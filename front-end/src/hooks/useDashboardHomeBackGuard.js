import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { seedDashboardAsCurrentEntry } from '../utils/dashboardHistory';

function isDashboardHome(pathname) {
  return (
    pathname.endsWith('/dashboard/home') ||
    pathname === '/dashboard' ||
    pathname === '/dashboard/'
  );
}

/**
 * On dashboard home, trap browser Back so it cannot leave the app (e.g. Google).
 * Internal tab back-navigation within /dashboard/* still works.
 */
export function useDashboardHomeBackGuard() {
  const { pathname } = useLocation();
  const isHome = isDashboardHome(pathname);

  useEffect(() => {
    if (!isHome) return undefined;

    window.history.pushState({ dashboardHomeGuard: true }, '', window.location.href);

    const onPopState = () => {
      window.history.pushState({ dashboardHomeGuard: true }, '', window.location.href);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isHome, pathname]);
}

/**
 * If Back leaves /dashboard to another in-app route (landing, login), snap back to home.
 */
export function useDashboardInternalBackGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const onPopState = () => {
      window.setTimeout(() => {
        const path = window.location.pathname;
        if (path && !path.startsWith('/dashboard')) {
          seedDashboardAsCurrentEntry('/dashboard/home');
          navigate('/dashboard/home', { replace: true });
        }
      }, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);
}
