import defaultAvatar from '../assets/user-avatar.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** روابط seed/قديمة — نتجاهلها ونعرض صور الفرونت بدلها */
const LEGACY_PHOTO_PATTERN =
  /pravatar\.cc|randomuser\.me|via\.placeholder|ui-avatars\.com|\/tutor\.png$/i;

/** صور بالغين — معرّفة بالفرونت فقط (مو من قاعدة البيانات) */
const MALE_PORTRAITS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=256&h=256&fit=crop&crop=faces',
];

const FEMALE_PORTRAITS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
];

export function normalizeTutorGender(gender) {
  if (!gender) return null;
  const value = String(gender).toLowerCase();
  if (value === 'male' || value === 'female') return value;
  return null;
}

function portraitIndex(tutorId, poolLength) {
  const id = Math.abs(Number(tutorId) || 0);
  return id % poolLength;
}

/** صورة افتراضية حسب الجنس — ثابتة لكل tutor_id */
export function getTutorPlaceholderPhoto({ gender, tutorId } = {}) {
  const normalized = normalizeTutorGender(gender);

  if (normalized === 'female') {
    return FEMALE_PORTRAITS[portraitIndex(tutorId, FEMALE_PORTRAITS.length)];
  }
  if (normalized === 'male') {
    return MALE_PORTRAITS[portraitIndex(tutorId, MALE_PORTRAITS.length)];
  }

  const pool = (Number(tutorId) || 0) % 2 === 0 ? FEMALE_PORTRAITS : MALE_PORTRAITS;
  return pool[portraitIndex(tutorId, pool.length)] || defaultAvatar;
}

function isLegacyOrExternalPlaceholder(photo) {
  if (!photo) return true;
  return LEGACY_PHOTO_PATTERN.test(photo);
}

/** رفع حقيقي من المعلّم عبر المنصة فقط */
function isRealTutorUpload(photo) {
  if (!photo || typeof photo !== 'string') return false;
  const trimmed = photo.trim();
  if (!trimmed || isLegacyOrExternalPlaceholder(trimmed)) return false;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/uploads/tutors/photos/')) return true;
  return false;
}

function toAbsoluteUploadUrl(photo) {
  if (photo.startsWith('/')) return `${API_BASE}${photo}`;
  return `${API_BASE}/${photo}`;
}

/** صورة العرض: فرونت افتراضي، أو رفع حقيقي فقط */
export function resolveTutorPhotoUrl(photo, { gender, tutorId } = {}) {
  if (isRealTutorUpload(photo)) {
    return toAbsoluteUploadUrl(photo);
  }
  return getTutorPlaceholderPhoto({ gender, tutorId });
}
