import React, { useState } from "react";
import "../../styles/sstyle/notification.css";
import Header from "../../components/Header";

const initialNotifications = [
  {
    id: 1,
    type: "match",
    unread: true,
    title: "تم العثور على مدرس متطابق!",
    desc: 'بناءً على طلبك لتعلم "اللغة الإنجليزية - مستوى تأسيسي"، وجدنا 3 مدرسين.',
    time: "الآن",
  },
  {
    id: 2,
    type: "accepted",
    title: "طلب درس الفيزياء",
    status: "تم القبول",
    desc: 'وافق الأستاذ "خالد عمر" على طلبك.',
    time: "منذ ساعتين",
  },
  {
    id: 3,
    type: "pending",
    title: "طلب درس الرياضيات",
    status: "قيد المراجعة",
    desc: "طلبك قيد المراجعة حالياً.",
    time: "أمس",
  },
  {
    id: 4,
    type: "rejected",
    title: "طلب درس الكيمياء",
    status: "تم الرفض",
    desc: "تم رفض الطلب.",
    time: "منذ يومين",
  },
  {
    id: 5,
    type: "welcome",
    old: true,
    title: "أهلاً بك في منصة أَلِفْ!",
    desc: "سعداء بانضمامك.",
    time: "منذ 5 أيام",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const dismissNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, dismissed: true, unread: false } : n
      )
    );
  };

  return (
    <>
      <Header activeTab="notifications" />

      <main className="notifications-page__content-area">
        <section className="notifications-page__intro">
          <h1 className="notifications-page__main-heading">الإشعارات</h1>
        </section>

        <div className="notifications-page__stack">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notifications-page__card
              ${notif.unread ? "is-unread" : ""} 
              ${notif.old || notif.dismissed ? "is-old" : ""}`}
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
                  {notif.type === "match" ? (
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

                {notif.type === "match" && (
                  <div className="notifications-page__btns">
                    <button className="notifications-page__btn notifications-page__btn--filled">
                      عرض المدرسين
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

                {notif.type === "accepted" && (
                  <button className="notifications-page__link-action">
                    تفاصيل الطلب
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </button>
                )}

                {notif.type === "rejected" && (
                  <button className="notifications-page__link-action">
                    البحث عن مدرس بديل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

// helpers

function getIcon(type) {
  switch (type) {
    case "match":
      return "person_search";
    case "accepted":
      return "check_circle";
    case "pending":
      return "hourglass_empty";
    case "rejected":
      return "cancel";
    case "welcome":
      return "school";
    default:
      return "notifications";
  }
}

function getBgClass(type) {
  switch (type) {
    case "match":
      return "notifications-page__bg-primary-soft";
    case "accepted":
      return "notifications-page__bg-success-soft";
    case "pending":
      return "notifications-page__bg-warning-soft";
    case "rejected":
      return "notifications-page__bg-danger-soft";
    case "welcome":
      return "notifications-page__bg-blue-dim";
    default:
      return "";
  }
}

function getBadgeClass(type) {
  switch (type) {
    case "accepted":
      return "notifications-page__badge-green";
    case "pending":
      return "notifications-page__badge-orange";
    case "rejected":
      return "notifications-page__badge-red";
    default:
      return "";
  }
}