import React, { useState, useEffect } from "react";
import "../../styles/sstyle/notification.css";
import Header from "../../components/Header";
import api from "../../api/api.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setError(null);
        const { data } = await api.get("/notifications/");
        // الباك بيرجع is_read، نحوّلها لـ unread عشان تتوافق مع منطق الـ UI
        const mapped = data.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          desc: n.body,
          time: formatTime(n.created_at),
          unread: !n.is_read,
          status: getStatusLabel(n.type),
          dismissed: false,
        }));
        setNotifications(mapped);
      } catch (err) {
        setError(err.response?.data?.detail || "فشل تحميل الإشعارات");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const dismissNotification = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, dismissed: true, unread: false } : n
        )
      );
    } catch (err) {
      console.error("فشل تحديث الإشعار", err);
    }
  };

  return (
    <>
      <Header activeTab="notifications" />

      <main className="notifications-page__content-area">
        <section className="notifications-page__intro">
          <h1 className="notifications-page__main-heading">الإشعارات</h1>
        </section>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            جارٍ تحميل الإشعارات...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
            {error}
          </p>
        ) : notifications.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            لا توجد إشعارات بعد.
          </p>
        ) : (
          <div className="notifications-page__stack">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notifications-page__card
                ${notif.unread ? "is-unread" : ""} 
                ${notif.dismissed ? "is-old" : ""}`}
              >
                {notif.unread && !notif.dismissed && (
                  <div className="notifications-page__unread-glow"></div>
                )}

                <div
                  className={`notifications-page__icon-bg ${getBgClass(
                    notif.type
                  )}`}
                >
                  <span className="material-symbols-outlined notifications-page__icon-size-lg">
                    {getIcon(notif.type)}
                  </span>
                </div>

                <div className="notifications-page__body">
                  <div className="notifications-page__top">
                    {isActionType(notif.type) ? (
                      <>
                        <h3 className="notifications-page__title text-primary">
                          {notif.title}
                        </h3>
                        <span className="notifications-page__badge notifications-page__badge-blue">
                          {notif.time}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="notifications-page__title-group">
                          <h3 className="notifications-page__title">
                            {notif.title}
                          </h3>
                          {notif.status && (
                            <span
                              className={`notifications-page__badge ${getBadgeClass(
                                notif.type
                              )}`}
                            >
                              {notif.status}
                            </span>
                          )}
                        </div>
                        <span className="notifications-page__timestamp">
                          {notif.time}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="notifications-page__desc">{notif.desc}</p>

                  {isActionType(notif.type) && (
                    <div className="notifications-page__btns">
                      <button className="notifications-page__btn notifications-page__btn--filled">
                        عرض الطلب
                      </button>
                      <button
                        className="notifications-page__btn notifications-page__btn--ghost"
                        onClick={() => dismissNotification(notif.id)}
                        disabled={notif.dismissed}
                      >
                        {notif.dismissed ? "تم التجاهل" : "تجاهل"}
                      </button>
                    </div>
                  )}

                  {isSuccessType(notif.type) && (
                    <button className="notifications-page__link-action">
                      عرض التفاصيل
                      <span className="material-symbols-outlined">
                        arrow_back
                      </span>
                    </button>
                  )}

                  {isRejectedType(notif.type) && (
                    <button className="notifications-page__link-action">
                      البحث عن بديل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ===== Helpers =====

function formatTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} أيام`;
}

function getStatusLabel(type) {
  switch (type) {
    case "offer_accepted":
    case "private_lead_accepted":
    case "tutor_verified":
    case "public_lead_closed_matched":
      return "تم القبول";
    case "offer_rejected":
    case "private_lead_rejected":
    case "tutor_verification_rejected":
    case "public_lead_closed_no_match":
      return "تم الرفض";
    case "public_lead_expired":
      return "منتهي";
    case "public_lead_slots_full":
      return "اكتمل";
    case "new_offer_received":
      return "عرض جديد";
    case "new_tutor_pending":
      return "قيد المراجعة";
    default:
      return null;
  }
}

// أنواع تحتاج action buttons (عرض + تجاهل)
function isActionType(type) {
  return [
    "public_lead_created",
    "public_lead_slots_full",
    "offer_slot_opened",
    "private_lead_received",
    "new_offer_received",
    "new_tutor_pending",
  ].includes(type);
}

// أنواع تحتاج زر "عرض التفاصيل"
function isSuccessType(type) {
  return [
    "offer_accepted",
    "private_lead_accepted",
    "public_lead_closed_matched",
    "tutor_verified",
  ].includes(type);
}

// أنواع تحتاج زر "البحث عن بديل"
function isRejectedType(type) {
  return [
    "offer_rejected",
    "private_lead_rejected",
    "tutor_verification_rejected",
    "public_lead_closed_no_match",
    "public_lead_expired",
  ].includes(type);
}

function getIcon(type) {
  switch (type) {
    case "public_lead_created":         return "campaign";
    case "public_lead_slots_full":      return "inbox";
    case "public_lead_expired":         return "timer_off";
    case "public_lead_closed_matched":  return "handshake";
    case "public_lead_closed_no_match": return "do_not_disturb";
    case "new_offer_received":          return "mail";
    case "offer_accepted":              return "check_circle";
    case "offer_rejected":              return "cancel";
    case "offer_slot_opened":           return "lock_open";
    case "private_lead_received":       return "person_pin";
    case "private_lead_accepted":       return "contact_phone";
    case "private_lead_rejected":       return "person_off";
    case "new_tutor_pending":           return "pending";
    case "tutor_verified":              return "verified";
    case "tutor_verification_rejected": return "gpp_bad";
    default:                            return "notifications";
  }
}

function getBgClass(type) {
  switch (type) {
    case "public_lead_created":
    case "public_lead_slots_full":
    case "new_offer_received":
    case "private_lead_received":
    case "offer_slot_opened":
      return "notifications-page__bg-primary-soft";

    case "offer_accepted":
    case "public_lead_closed_matched":
    case "private_lead_accepted":
    case "tutor_verified":
      return "notifications-page__bg-success-soft";

    case "public_lead_expired":
    case "new_tutor_pending":
      return "notifications-page__bg-warning-soft";

    case "offer_rejected":
    case "public_lead_closed_no_match":
    case "private_lead_rejected":
    case "tutor_verification_rejected":
      return "notifications-page__bg-danger-soft";

    default:
      return "notifications-page__bg-blue-dim";
  }
}

function getBadgeClass(type) {
  switch (type) {
    case "offer_accepted":
    case "public_lead_closed_matched":
    case "private_lead_accepted":
    case "tutor_verified":
      return "notifications-page__badge-green";

    case "public_lead_slots_full":
    case "public_lead_expired":
    case "new_tutor_pending":
      return "notifications-page__badge-orange";

    case "offer_rejected":
    case "public_lead_closed_no_match":
    case "private_lead_rejected":
    case "tutor_verification_rejected":
      return "notifications-page__badge-red";

    default:
      return "notifications-page__badge-blue";
  }
}