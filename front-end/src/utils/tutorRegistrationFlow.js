import { cancelTutorRegistration } from '../api/tutorRegistration';
import { clearRegistrationTokens } from '../api/authStorage';

/**
 * يلغي جلسة تسجيل المعلم المعلّقة على الباك إند (إن وُجد توكن) ويمسح التوكن محلياً.
 */
export async function abortTutorRegistration() {
  const token = localStorage.getItem('tutor_registration_token');

  if (token) {
    try {
      await cancelTutorRegistration();
    } catch {
      // الجلسة قد تكون منتهية — نكمل مسح التوكن محلياً
    }
  }

  clearRegistrationTokens();
}
