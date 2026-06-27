/** حالة حساب المعلّم في لوحة الأدمن */
export function getAdminTutorStatus(tutor) {
  if (tutor.is_banned) return 'rejected';
  if (tutor.verified) return 'accepted';
  return 'pending';
}

export function isMarketplaceTutor(tutor) {
  return tutor.verified === true && tutor.is_banned !== true;
}
