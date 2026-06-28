/** Mark that the tutor just logged in — Dashboard will trim history on mount. */
export const TUTOR_FRESH_LOGIN_KEY = 'tutorFreshLogin';

export function markTutorFreshLogin() {
  sessionStorage.setItem(TUTOR_FRESH_LOGIN_KEY, '1');
}

export function consumeTutorFreshLogin() {
  if (sessionStorage.getItem(TUTOR_FRESH_LOGIN_KEY) !== '1') return false;
  sessionStorage.removeItem(TUTOR_FRESH_LOGIN_KEY);
  return true;
}

/** Replace current history entry so login/landing are not the immediate predecessor. */
export function seedDashboardAsCurrentEntry(path = '/dashboard/home') {
  window.history.replaceState({ dashboardRoot: true }, '', path);
}
