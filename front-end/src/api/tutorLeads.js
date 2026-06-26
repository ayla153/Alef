import apiClient from './axiosClient';

// صندوق الطلبات الخاصة المرسلة مباشرة لهذا المعلّم
export const getTutorInbox = () => apiClient.get('/leads/tutor/inbox');

// كل العروض العامة التي قدّمها هذا المعلّم على طلبات السوق المفتوح
export const getTutorOffers = () => apiClient.get('/leads/tutor/offers');

// تصفّح الطلبات العامة المفتوحة المطابقة لمواد هذا المعلّم
export const getBrowseLeads = () => apiClient.get('/leads/browse');

// تقديم عرض على طلب عام
export const submitOffer = (leadId, payload) => apiClient.post(`/leads/${leadId}/offers`, payload);

// قبول طلب خاص (موافقة على التواصل)
export const acceptPrivateContact = (leadId, payload) => apiClient.post(`/leads/${leadId}/accept-contact`, payload);
