import apiClient from './axiosClient';

// جلب كل المعلمين (مع دعم Pagination والفلاتر الاختيارية)
// ملاحظة: لا يوجد فلتر "verified" بالباك إند، لذلك نجلب الجميع ونفلتر بالفرونت
export const getAllTutors = ({ page = 1, page_size = 100, subject_ids, stages } = {}) =>
  apiClient.get('/tutors/', {
    params: { page, page_size, subject_ids, stages }
  });

// جلب بيانات معلّم واحد بالتفصيل
export const getTutorById = (tutorId) => apiClient.get(`/tutors/${tutorId}`);

// حذف معلّم نهائياً (يُفضّل استخدام banTutor للحظر الناعم)
export const deleteTutor = (tutorId) => apiClient.delete(`/tutors/${tutorId}`);

// حظر حساب معلّم (soft delete — يختفي من الماركت بليس ويتوقف عن استقبال الطلبات)
export const banTutor = (tutorId) => apiClient.put(`/admins/tutors/${tutorId}/ban`);

// استرجاع حساب معلّم محظور
export const restoreTutor = (tutorId) => apiClient.put(`/admins/tutors/${tutorId}/restore`);

// توثيق/إلغاء توثيق معلّم (يُستخدم عادة في تبويب "المعلمين قيد المراجعة")
export const verifyTutor = (tutorId, verified) =>
  apiClient.put(`/admins/tutors/${tutorId}/verify`, null, {
    params: { verified }
  });

// تقرير نشاط المعلّم للأدمن (عروض، طلبات خاصة، مفضلة، تقييمات)
export const getTutorReport = (tutorId) =>
  apiClient.get(`/admins/tutors/${tutorId}/report`);
