import { getAuthRole, isAuthenticated } from '../api/authStorage';

/** الصفحة الرئيسية بعد تسجيل الدخول حسب الدور */
export function getHomePathForRole(role) {
  if (role === 'tutor') return '/dashboard/home';
  if (role === 'admin') return '/admin';
  return '/home';
}

/** صفحة الدخول حسب الدور — بدون تغيير أسماء الـ URLs */
export function getLoginPathForRole(role) {
  if (role === 'tutor') return '/tutor/login';
  if (role === 'admin') return '/admin/login';
  return '/login';
}

/** أثناء جلسة نشطة (قبل مسح التوكن) */
export function getLoginPathForCurrentUser() {
  if (!isAuthenticated()) return getLoginPathFromLocation();
  return getLoginPathForRole(getAuthRole());
}

/** بعد 401 — التوكن ممسوح؛ نخمّن من المسار الحالي */
export function getLoginPathFromLocation() {
  const path = window.location.pathname;
  if (path.startsWith('/dashboard') || path.startsWith('/create-account') || path.startsWith('/teacher/register')) {
    return '/tutor/login';
  }
  if (path.startsWith('/admin')) return '/admin/login';
  return '/login';
}

/** ملف معلم: طالب مسجّل → /tutor/:id · غير ذلك → /teacher-profile/:id */
export function getTeacherProfilePath(teacherId) {
  if (isAuthenticated() && getAuthRole() === 'student') {
    return `/tutor/${teacherId}`;
  }
  return `/teacher-profile/${teacherId}`;
}
