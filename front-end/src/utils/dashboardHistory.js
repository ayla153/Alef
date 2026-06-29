/** Mark that the tutor just logged in — Dashboard will trim history on mount. */
export const TUTOR_FRESH_LOGIN_KEY = 'tutorFreshLogin';

/** Mark that the student just logged in — Home will trim history on mount. */
export const STUDENT_FRESH_LOGIN_KEY = 'studentFreshLogin';

export function markTutorFreshLogin() {
  sessionStorage.setItem(TUTOR_FRESH_LOGIN_KEY, '1');
}

export function markStudentFreshLogin() {
  sessionStorage.setItem(STUDENT_FRESH_LOGIN_KEY, '1');
}

export function consumeTutorFreshLogin() {
  if (sessionStorage.getItem(TUTOR_FRESH_LOGIN_KEY) !== '1') return false;
  sessionStorage.removeItem(TUTOR_FRESH_LOGIN_KEY);
  return true;
}

export function consumeStudentFreshLogin() {
  if (sessionStorage.getItem(STUDENT_FRESH_LOGIN_KEY) !== '1') return false;
  sessionStorage.removeItem(STUDENT_FRESH_LOGIN_KEY);
  return true;
}

/** Replace current history entry so login/landing are not the immediate predecessor. */
export function seedDashboardAsCurrentEntry(path = '/dashboard/home') {
  window.history.replaceState({ dashboardRoot: true }, '', path);
}
