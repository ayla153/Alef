import { useEffect, useRef } from 'react';
import { getAccessToken } from '../api/authStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function wsUrl(token) {
  const base = BASE_URL.replace(/^http/, 'ws');
  return `${base}/ws/notifications?token=${encodeURIComponent(token)}`;
}

export const NOTIFICATION_RECEIVED_EVENT = 'notification:received';

/** Opens /ws/notifications while the user is logged in; dispatches NOTIFICATION_RECEIVED_EVENT. */
export default function useNotificationSocket(enabled = true) {
  const wsRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const token = getAccessToken();
      if (!token) return;

      const ws = new WebSocket(wsUrl(token));
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          window.dispatchEvent(
            new CustomEvent(NOTIFICATION_RECEIVED_EVENT, { detail: payload })
          );
        } catch {
          /* ignore malformed payloads */
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!cancelled) {
          retryRef.current = window.setTimeout(connect, 4000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    const onTokensSaved = () => {
      wsRef.current?.close();
      window.clearTimeout(retryRef.current);
      connect();
    };

    const onLoggedOut = () => {
      wsRef.current?.close();
      window.clearTimeout(retryRef.current);
    };

    window.addEventListener('auth:tokens-saved', onTokensSaved);
    window.addEventListener('auth:logged-out', onLoggedOut);

    return () => {
      cancelled = true;
      window.clearTimeout(retryRef.current);
      wsRef.current?.close();
      window.removeEventListener('auth:tokens-saved', onTokensSaved);
      window.removeEventListener('auth:logged-out', onLoggedOut);
    };
  }, [enabled]);
}
