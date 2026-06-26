import apiClient from './axiosClient';

// جلب بيانات المعلّم الحالي المسجّل دخوله
export const getMyProfile = () => apiClient.get('/tutors/me');

// تحديث البيانات الأساسية للمعلّم (الاسم، الهاتف، البريد، الخبرة، النبذة، طريقة التدريس)
// ⚠️ لا يشمل المواد ولا الأسعار ولا الشهادات — لا يوجد Endpoint بالباك إند لتحديثها بعد التسجيل
export const updateTutor = (tutorId, payload) => apiClient.patch(`/tutors/${tutorId}`, payload);

// رفع/تحديث صورة الملف الشخصي
export const uploadTutorPhoto = (tutorId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/tutors/${tutorId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
