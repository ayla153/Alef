const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** randomuser.me portraits — adults only; index derived from tutor_id for stable variety */
const PORTRAIT_MIN = 11;
const PORTRAIT_MAX = 94;

function portraitIndex(tutorId) {
  const id = Math.abs(Number(tutorId) || 0);
  return PORTRAIT_MIN + (id % (PORTRAIT_MAX - PORTRAIT_MIN + 1));
}

export function normalizeTutorGender(gender) {
  if (!gender) return null;
  const value = String(gender).toLowerCase();
  if (value === 'male' || value === 'female') return value;
  return null;
}

/** Placeholder portrait matched to gender (men/women folders are adult stock photos). */
export function getTutorPlaceholderPhoto({ gender, tutorId } = {}) {
  const index = portraitIndex(tutorId);
  const normalized = normalizeTutorGender(gender);

  if (normalized === 'female') {
    return `https://randomuser.me/api/portraits/women/${index}.jpg`;
  }
  if (normalized === 'male') {
    return `https://randomuser.me/api/portraits/men/${index}.jpg`;
  }

  const bucket = (Number(tutorId) || 0) % 2 === 0 ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${bucket}/${index}.jpg`;
}

/** Uploaded photo URL, or gender-aware placeholder when missing. */
export function resolveTutorPhotoUrl(photo, { gender, tutorId } = {}) {
  if (photo) {
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('data:')
    ) {
      return photo;
    }
    if (photo.startsWith('/')) return `${API_BASE}${photo}`;
    return `${API_BASE}/${photo}`;
  }
  return getTutorPlaceholderPhoto({ gender, tutorId });
}
