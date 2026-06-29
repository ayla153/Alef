import apiClient from './axiosClient';

// جلب قائمة المعلمين — يتطلب تسجيل دخول (طالب، معلم، أو أدمن)
export const getPublicTutors = ({ page = 1, page_size = 100, subject_ids, stages } = {}) =>
  apiClient.get('/tutors/', { params: { page, page_size, subject_ids, stages } });

// أفضل المعلمين — عام، لا يتطلب تسجيل دخول
export const getTopTutors = ({ limit = 10 } = {}) =>
  apiClient.get('/tutors/top', { params: { limit } });

// ملف معلم عام — لا يتطلب تسجيل دخول
export const getPublicTutorById = (tutorId) =>
  apiClient.get(`/tutors/${tutorId}`);
