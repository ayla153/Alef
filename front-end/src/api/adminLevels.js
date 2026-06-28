import apiClient from './axiosClient';

export const getLevels = () => apiClient.get('/levels/');
export const createLevel = (payload) => apiClient.post('/levels/', payload);
export const updateLevel = (levelId, payload) => apiClient.patch(`/levels/${levelId}`, payload);
export const deleteLevel = (levelId) => apiClient.delete(`/levels/${levelId}`);
