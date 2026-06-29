import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/notifications';
import {
  NOTIFICATION_RECEIVED_EVENT,
  NOTIFICATION_READ_EVENT,
  NOTIFICATION_READ_ALL_EVENT,
} from './useNotificationSocket';

export default function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch {
      /* silent — badge is optional */
    }
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    const onReceived = () => {
      setUnreadCount((c) => c + 1);
    };
    const onRead = () => {
      setUnreadCount((c) => Math.max(0, c - 1));
    };
    const onReadAll = () => {
      setUnreadCount(0);
    };

    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
    window.addEventListener(NOTIFICATION_READ_EVENT, onRead);
    window.addEventListener(NOTIFICATION_READ_ALL_EVENT, onReadAll);
    return () => {
      window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
      window.removeEventListener(NOTIFICATION_READ_EVENT, onRead);
      window.removeEventListener(NOTIFICATION_READ_ALL_EVENT, onReadAll);
    };
  }, []);

  return { unreadCount, refreshUnread, setUnreadCount };
}
