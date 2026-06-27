// src/api/tutorProfile.js
import api from './api';

/** GET /tutors/me — بيانات المعلّم الحالي من التوكن */
export const getMyProfile = () => api.get('/tutors/me');

/** PATCH /tutors/me — تعديل بيانات المعلّم الحالي (لا يحتاج tutor_id) */
export const updateMyProfile = (data) => api.patch('/tutors/me', data);

/** POST /tutors/{tutor_id}/photo — رفع صورة */
export const uploadTutorPhoto = (tutorId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tutors/${tutorId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** POST /tutors/{tutor_id}/video — رفع فيديو */
export const uploadTutorVideo = (tutorId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tutors/${tutorId}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ─── للتوافق مع الكود القديم اللي بستخدم updateTutor(id, data) ────────────
// بنتجاهل الـ id ونستخدم /me مباشرة
export const updateTutor = (_tutorId, data) => updateMyProfile(data);