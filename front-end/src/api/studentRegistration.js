import apiClient from './axiosClient';

export const registerStudent = (payload) =>
  apiClient.post('/auth/student/register', payload);

export const sendStudentRegistrationOtp = () =>
  apiClient.post('/auth/student/register/send-otp');

export const confirmStudentRegistration = (otp) =>
  apiClient.post('/auth/student/register/confirm', { otp });

export const cancelStudentRegistration = () =>
  apiClient.post('/auth/student/register/cancel');
