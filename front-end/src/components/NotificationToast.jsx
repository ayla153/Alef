import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { NOTIFICATION_RECEIVED_EVENT } from '../hooks/useNotificationSocket';
import '../styles/NotificationToast.css';

const AUTO_DISMISS_MS = 8000;
const MAX_VISIBLE = 3;

export default function NotificationToast({ onViewNotifications }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onReceived = (e) => {
      const n = e.detail;
      if (!n?.title) return;
      const item = {
        id: n.id ?? `tmp-${Date.now()}`,
        title: n.title,
        body: n.body,
        type: n.type,
      };
      setItems((prev) => [item, ...prev.filter((x) => x.id !== item.id)].slice(0, MAX_VISIBLE));
      window.setTimeout(() => dismiss(item.id), AUTO_DISMISS_MS);
    };
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, onReceived);
  }, [dismiss]);

  const handleOpen = (id) => {
    dismiss(id);
    onViewNotifications?.();
  };

  if (!items.length) return null;

  return (
    <div className="notification-toast-stack" aria-live="polite">
      {items.map((toast) => (
        <div key={toast.id} className="notification-toast" role="alert">
          <div className="notification-toast-badge">
            <span className="notification-toast-pulse" aria-hidden="true" />
            <FaBell />
            <span>إشعار جديد</span>
          </div>

          <button
            type="button"
            className="notification-toast-body"
            onClick={() => handleOpen(toast.id)}
          >
            <strong>{toast.title}</strong>
            {toast.body && <p>{toast.body}</p>}
            <span className="notification-toast-action">
              عرض الإشعارات <FaArrowLeft />
            </span>
          </button>

          <button
            type="button"
            className="notification-toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="إغلاق"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
}
