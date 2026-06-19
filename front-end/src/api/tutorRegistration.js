// src/api/tutorRegistration.js
import apiClient from './axiosClient';

// ===== الخطوة 1: البيانات الشخصية الأساسية =====
export const registerTutorStep1 = (payload) =>
  apiClient.post('/auth/tutor/register/step-1', payload);

// ===== الخطوة 2: المواد والمستويات =====
export const registerTutorStep2 = (payload) =>
  apiClient.post('/auth/tutor/register/step-2', payload);

// ===== الخطوة 3: طريقة التدريس + الخبرة + الأسعار =====
export const registerTutorStep3 = (payload) =>
  apiClient.post('/auth/tutor/register/step-3', payload);

// ===== الخطوة 4: النبذة + الشهادات =====
export const registerTutorStep4 = (payload) =>
  apiClient.post('/auth/tutor/register/step-4', payload);

// ===== جلب قائمة المواد =====
export const getSubjects = () => apiClient.get('/subjects/');

// ===== جلب قائمة المستويات الدراسية =====
export const getLevels = () => apiClient.get('/levels/');