import apiClient from './axiosClient';

export const login = (email, password) =>
  apiClient.post('/auth/login', { email, password });
