import apiClient from './axiosClient';

export const loginStudent = (email, password) =>
  apiClient.post('/auth/student/login', { email, password });

export const loginTutor = (email, password) =>
  apiClient.post('/auth/tutor/login', { email, password });

export const loginAdmin = (email, password) =>
  apiClient.post('/auth/admin/login', { email, password });
