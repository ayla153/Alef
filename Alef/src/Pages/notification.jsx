import React, { useState } from "react";
import "../styles/notification.css";
import Header from "../components/Header";

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

      <main className="content-area">
        <section className="page-intro">
          <h1 className="main-heading">الإشعارات</h1>
        </section>

        <div className="notifications-stack">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-card 
              ${notif.unread ? "is-unread" : ""} 
              ${notif.old || notif.dismissed ? "is-old" : ""}`}
            >
              {notif.unread && !notif.dismissed && (
                <div className="unread-glow"></div>
              )}

              <div className={`card-icon-bg ${getBgClass(notif.type)}`}>
                <span className="material-symbols-outlined icon-size-lg">
                  {getIcon(notif.type)}
                </span>
              </div>

              <div className="card-body">
                <div className="card-top">
                  {notif.type === "match" ? (
                    <>
                      <h3 className="card-title text-primary">
                        {notif.title}
                      </h3>
                      <span className="badge badge-blue">
                        {notif.time}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="title-group">
                        <h3 className="card-title">{notif.title}</h3>
                        {notif.status && (
                          <span
                            className={`badge ${getBadgeClass(
                              notif.type
                            )}`}
                          >
                            {notif.status}
                          </span>
                        )}
                      </div>
                      <span className="timestamp">{notif.time}</span>
                    </>
                  )}
                </div>

                <p className="card-desc">{notif.desc}</p>

                {/* الأزرار الخاصة */}
                {notif.type === "match" && (
                  <div className="card-btns">
                    <button className="btn btn-filled">
                      عرض المدرسين
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={() => dismissNotification(notif.id)}
                      disabled={notif.dismissed}
                    >
                      {notif.dismissed ? "تم التجاهل" : "تجاهل"}
                    </button>
                  </div>
                )}

                {notif.type === "accepted" && (
                  <button className="link-action">
                    تفاصيل الطلب
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </button>
                )}

                {notif.type === "rejected" && (
                  <button className="link-action">
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
      return "bg-primary-soft";
    case "accepted":
      return "bg-success-soft";
    case "pending":
      return "bg-warning-soft";
    case "rejected":
      return "bg-danger-soft";
    case "welcome":
      return "bg-blue-dim";
    default:
      return "";
  }
}

function getBadgeClass(type) {
  switch (type) {
    case "accepted":
      return "badge-green";
    case "pending":
      return "badge-orange";
    case "rejected":
      return "badge-red";
    default:
      return "";
  }
}