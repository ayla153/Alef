
// src/api/tutorLeads.js
import api from './api';

/** Tutor private inbox — private leads addressed to this tutor */
export const getTutorInbox = () => api.get('/leads/tutor/inbox');

/** Tutor public offers — track every offer this tutor submitted */
export const getTutorOffers = () => api.get('/leads/tutor/offers');

/** Browse open public leads matching tutor's subjects */
export const browsePubicLeads = () => api.get('/leads/browse');

/** Full public lead detail for tutor (peer offers, no student identity) */
export const browsePublicLeadDetail = (leadId) => api.get(`/leads/browse/${leadId}`);

/** Submit an offer on a public lead */
export const submitOffer = (leadId, payload) =>
  api.post(`/leads/${leadId}/offers`, payload);

/** Accept a private lead contact */
export const acceptPrivateContact = (leadId, payload = null) =>
  api.post(`/leads/${leadId}/accept-contact`, payload);