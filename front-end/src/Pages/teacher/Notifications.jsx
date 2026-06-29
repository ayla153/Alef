import { useState, useEffect, useCallback } from 'react';
import {
  FaBell, FaCheckCircle, FaEnvelope, FaTrashAlt,
  FaUserPlus, FaClock, FaInbox, FaCheck,
} from 'react-icons/fa';
import '../../styles/Notifications.css';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notifications';
import { getErrorMessage } from '../../utils/apiErrors';
import {
  NOTIFICATION_RECEIVED_EVENT,
  NOTIFICATION_READ_EVENT,
  NOTIFICATION_READ_ALL_EVENT,
} from '../../hooks/useNotificationSocket';

// ─── NotificationType → أيقونة ───────────────────────────────────────────
const iconFor = (type) => {
  if (
    type === 'private_lead_received' ||
    type === 'new_offer_received'
  ) return <FaEnvelope />;

  if (
    type === 'offer_accepted' ||
    type === 'private_lead_accepted' ||
    type === 'tutor_verified'
  ) return <FaUserPlus />;

  return <FaBell />;
};

// ─── NotificationType → فئة CSS ──────────────────────────────────────────
const cssClass = (type) => {
  if (type?.startsWith('private_lead')) return 'private_request';
  if (type === 'offer_accepted' || type === 'offer_slot_opened') return 'offer_accepted';
  return 'system';
};

// ─── NotificationType → فلتر ─────────────────────────────────────────────
const FILTER_MAP = {
  private:  (n) => n.type?.startsWith('private_lead'),
  accepted: (n) => n.type === 'offer_accepted' || n.type === 'private_lead_accepted',
  system:   (n) =>
    !n.type?.startsWith('private_lead') &&
    n.type !== 'offer_accepted' &&
    n.type !== 'private_lead_accepted',
};

const ITEMS_PER_PAGE = 5;

export default function TutorNotifications({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState('all');
  const [currentPage, setCurrentPage]     = useState(1);

  // ─── جلب التنبيهات ─────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(fetchNotifications, 0);
    return () => clearTimeout(id);
  }, [fetchNotifications]);

  useEffect(() => {
    const onLive = (e) => {
      const n = e.detail;
      if (!n?.id) return;
      setNotifications((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev;
        return [{ ...n, is_read: false }, ...prev];
      });
    };
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, onLive);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, onLive);
  }, []);

  useEffect(() => {
    onRead?.();
  }, [onRead]);

  // ─── تحديد الكل كمقروء ─────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new CustomEvent(NOTIFICATION_READ_ALL_EVENT));
      onRead?.();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // ─── تحديد فردي كمقروء ────────────────────────────────────────────────
  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      window.dispatchEvent(new CustomEvent(NOTIFICATION_READ_EVENT));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // ─── حذف محلي (يُعلَّم كمقروء أولاً إن لم يكن) ───────────────────────
  const handleDelete = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        window.dispatchEvent(new CustomEvent(NOTIFICATION_READ_EVENT));
      } catch {
        /* still remove locally */
      }
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  // ─── تصفية ─────────────────────────────────────────────────────────────
  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter(FILTER_MAP[filter] || (() => true));

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const unreadTotal = notifications.filter((n) => !n.is_read).length;

  const changeFilter = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  return (
    <div className="page-container2">
      <div className="notifications-container">

        {/* ─── رأس الصفحة ─── */}
        <div className="notif-header">
          <div className="header-left">
            <FaBell className="header-icon" />
            <div>
              <h1>مركز التنبيهات</h1>
              {unreadTotal > 0 && (
                <span className="unread-summary-pill">{unreadTotal} غير مقروء</span>
              )}
            </div>
          </div>
          {unreadTotal > 0 && (
            <button type="button" className="mark-read-btn" onClick={handleMarkAllAsRead}>
              <FaCheckCircle /> تحديد الكل كمقروء
            </button>
          )}
        </div>

        {/* ─── تبويبات الفلتر ─── */}
        <div className="filter-tabs">
          {[
            { key: 'all',      label: 'الكل' },
            { key: 'private',  label: 'الطلبات الخاصة' },
            { key: 'accepted', label: 'العروض المقبولة' },
            { key: 'system',   label: 'النظام' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab ${filter === key ? 'active' : ''}`}
              onClick={() => changeFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── حالات التحميل والخطأ ─── */}
        {isLoading && <p className="loading-text">جارِ تحميل التنبيهات...</p>}
        {error     && <p className="error-text">{error}</p>}

        {/* ─── القائمة ─── */}
        {!isLoading && filtered.length === 0 && (
          <div className="empty-state">
            <FaInbox style={{ fontSize: '2rem', marginBottom: 8 }} />
            <p>لا توجد إشعارات</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="notif-list">
            {currentItems.map((notif) => (
              <div
                key={notif.id}
                className={`notif-card ${notif.is_read ? 'is-read' : 'is-unread'}`}
              >
                <div className={`notif-icon ${cssClass(notif.type)}`}>
                  {iconFor(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-title-row">
                    <h3>{notif.title}</h3>
                    {!notif.is_read && <span className="unread-dot" />}
                  </div>
                  <p className="notif-desc">{notif.body}</p>
                  <div className="notif-footer">
                    <span className="notif-time">
                      <FaClock />{' '}
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleString('ar')
                        : '—'}
                    </span>
                    <div className="notif-actions">
                      {!notif.is_read ? (
                        <button
                          type="button"
                          className="action-mark-read"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <FaCheck /> تم القراءة
                        </button>
                      ) : (
                        <span className="read-status-label">
                          <FaCheckCircle /> مقروء
                        </span>
                      )}
                      <button
                        type="button"
                        className="action-delete"
                        onClick={() => handleDelete(notif)}
                      >
                        <FaTrashAlt /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              السابق
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}