import apiClient from './axiosClient';

export const getSubjects = () => apiClient.get('/subjects/');
export const createSubject = (payload) => apiClient.post('/subjects/', payload);
export const updateSubject = (subjectId, payload) => apiClient.patch(`/subjects/${subjectId}`, payload);
export const deleteSubject = (subjectId) => apiClient.delete(`/subjects/${subjectId}`);
