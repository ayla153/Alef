import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/notifications';
import { NOTIFICATION_RECEIVED_EVENT } from './useNotificationSocket';

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
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
  }, []);

  return { unreadCount, refreshUnread, setUnreadCount };
}
