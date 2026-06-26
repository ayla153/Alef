import apiClient from './axiosClient';

// تقييمات المعلّم الحالي
export const getMyReviews = () => apiClient.get('/reviews/my-reviews');
