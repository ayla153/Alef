// src/api/notifications.js
import api from './api';

/** List all notifications for the logged-in user */
export const getNotifications = () => api.get('/notifications/');

/** Get unread notification count */
export const getUnreadCount = () => api.get('/notifications/unread-count');

/** Mark a single notification as read */
export const markNotificationRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

/** Mark all notifications as read */
export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all');