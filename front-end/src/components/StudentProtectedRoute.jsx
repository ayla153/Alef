import ProtectedRoute from './ProtectedRoute';
import StudentRouteShell from './StudentRouteShell';

export default function StudentProtectedRoute({ children }) {
  return (
    <ProtectedRoute role="student">
      <StudentRouteShell>{children}</StudentRouteShell>
    </ProtectedRoute>
  );
}
