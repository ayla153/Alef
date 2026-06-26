import apiClient from './axiosClient';

// جلب قائمة المعلمين — يتطلب تسجيل دخول (طالب، معلم، أو أدمن)
export const getPublicTutors = ({ page = 1, page_size = 100, subject_ids, stages } = {}) =>
  apiClient.get('/tutors/', { params: { page, page_size, subject_ids, stages } });
