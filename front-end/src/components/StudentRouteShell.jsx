import { useEffect } from 'react';
import { useStudentAppBackGuard } from '../hooks/useStudentAppBackGuard';
import { consumeStudentFreshLogin, seedDashboardAsCurrentEntry } from '../utils/dashboardHistory';

export default function StudentRouteShell({ children }) {
  useStudentAppBackGuard();

  useEffect(() => {
    if (consumeStudentFreshLogin()) {
      seedDashboardAsCurrentEntry('/home');
    }
  }, []);

  return children;
}
