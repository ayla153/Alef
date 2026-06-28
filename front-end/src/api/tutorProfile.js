// src/api/tutorProfile.js

import api from './api';

/** GET /tutors/me */
export const getMyProfile = () => api.get('/tutors/me');

/** PATCH /tutors/me — تعديل بيانات المعلّم الحالي بدون tutor_id */
export const updateMyProfile = (data) => api.patch('/tutors/me', data);

/** للتوافق مع الكود القديم — يتجاهل tutorId ويستخدم /me */
export const updateTutor = (_tutorId, data) => updateMyProfile(data);

/** POST /tutors/{tutor_id}/photo */
export const uploadTutorPhoto = (tutorId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tutors/${tutorId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** POST /tutors/{tutor_id}/video */
export const uploadTutorVideo = (tutorId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tutors/${tutorId}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** GET /tutors/me/stats — إحصائيات لوحة التحكم */
export const getMyStats = () => api.get('/tutors/me/stats');

/** GET /tutors/me/recent-requests — آخر الطلبات */
export const getMyRecentRequests = () => api.get('/tutors/me/recent-requests');

/** GET /tutors/me/recent-activity — النشاط الأخير */
export const getMyRecentActivity = () => api.get('/tutors/me/recent-activity');