// src/api/tutorSubjects.js
import api from './api';

/** جلب مواد المدرس الحالي */
export const getMyTutorSubjects = () => api.get('/tutor-subjects/me');

/** إضافة مادة جديدة للمدرس الحالي */
export const createMyTutorSubject = (payload) => api.post('/tutor-subjects/me', payload);

/** تعديل مادة موجودة */
export const updateMyTutorSubject = (tutorSubjectId, payload) =>
  api.patch(`/tutor-subjects/${tutorSubjectId}`, payload);

/** حذف مادة */
export const deleteMyTutorSubject = (tutorSubjectId) =>
  api.delete(`/tutor-subjects/${tutorSubjectId}`);
