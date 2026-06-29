/**
 * Ensure browser Back from /selection returns to landing (/),
 * even when older history entries point at dashboard/home.
 */
export function seedLandingBeforeSelection() {
  window.history.replaceState({ guestLanding: true }, '', '/');
  window.history.pushState({ guestSelection: true }, '', '/selection');
}

export function isProtectedAppPath(path) {
  return (
    path.startsWith('/dashboard') ||
    path === '/home' ||
    path.startsWith('/admin')
  );
}
