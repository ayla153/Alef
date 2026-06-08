import React, { useMemo, useState } from "react";
import "../../styles/sstyle/MyLeads.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

/* 🎯 ألوان المواد حسب الاسم */
const subjectColors = {
  رياضيات: "blue",
  فيزياء: "purple",
  كيمياء: "green",
  أحياء: "emerald",
  إنجليزي: "orange",
  عربي: "red",
  تاريخ: "yellow",
  جغرافيا: "teal",
  معلوماتية: "indigo",
};

const getSubjectIcon = (title) => {
  if (title.includes("رياضيات")) return "calculate";
  if (title.includes("فيزياء")) return "biotech";
  if (title.includes("كيمياء")) return "science";
  if (title.includes("أحياء")) return "eco";
  if (title.includes("إنجليزي")) return "translate";
  if (title.includes("عربي")) return "menu_book";
  if (title.includes("تاريخ")) return "history_edu";
  if (title.includes("جغرافيا")) return "public";
  if (title.includes("معلوماتية")) return "computer";

  return "school";
};

/* 🎯 استخراج لون المادة من العنوان */
const getSubjectColor = (title) => {
  const match = Object.keys(subjectColors).find((key) => title.includes(key));

  return subjectColors[match] || "gray";
};

const INITIAL_LEADS = [
  {
    id: 1,
    title: "رياضيات - تفاضل وتكامل",
    type: "public",
    status: "open",
    level: "المرحلة الثانوية",
    price: "200 - 300 ل.س",
    offersCount: 3,
  },
  {
    id: 2,
    title: "معلوماتية",
    type: "public",
    status: "pending",
    level: "المرحلة الثانوية",
    price: "400 - 600 ل.س",
    offersCount: 0,
  },
  {
    id: 3,
    title: "لغة إنجليزية",
    type: "public",
    status: "closed_matched",
    level: "المرحلة المتوسطة",
    price: "150 ل.س",
    offersCount: 6,
  },
  {
    id: 4,
    title: "كيمياء حيوي",
    type: "private",
    status: "waiting_tutor",
    level: "المرحلة الجامعية",
    price: "300 - 450 ل.س",
    offersCount: 0,
    tutorName: "أحمد علي",
  },
];

/* 🎯 STATUS CONFIG */
const STATUS_CONFIG = {
  open: {
    statusText: "مفتوح",
    statusColor: "emerald",
    badgeText: "يقبل العروض",
    badgeType: "success",
    buttonText: "عرض التفاصيل",
    buttonClass: "btn-blue",
    canAction: true,
  },

  slots_full: {
    statusText: "العروض ممتلئة",
    statusColor: "amber",
    badgeText: "لا يمكن التقديم حالياً",
    badgeType: "warning",
    buttonText: "عرض التفاصيل",
    buttonClass: "btn-outline-gray",
    canAction: true,
  },

  closed_matched: {
    statusText: "تم الإغلاق",
    statusColor: "blue",
    badgeText: "تم اختيار معلم",
    badgeType: "success",
    buttonText: "عرض النتيجة",
    buttonClass: "btn-blue",
    canAction: true,
  },

  closed_no_match: {
    statusText: "تم الإغلاق",
    statusColor: "gray",
    badgeText: "لم يتم اختيار أحد",
    badgeType: "expired",
    buttonText: "عرض التفاصيل",
    buttonClass: "btn-outline-gray",
    canAction: true,
  },

  waiting_tutor: {
    statusText: "طلب خاص",
    statusColor: "purple",
    badgeText: "بانتظار رد المعلم",
    badgeType: "warning",
    buttonText: "متابعة الطلب",
    buttonClass: "btn-blue",
    canAction: true,
  },

  expired: {
    statusText: "انتهى الطلب",
    statusColor: "gray",
    badgeText: "انتهت الصلاحية",
    badgeType: "expired",
    buttonText: "أرشفة الطلب",
    buttonClass: "btn-outline-gray",
    canAction: false,
  },
};

export default function MyLeads() {
  const [filter, setFilter] = useState("all");
  const [leads, setLeads] = useState(INITIAL_LEADS);

  const navigate = useNavigate();

  /* 🔴 FIX 1: حماية config من undefined */
  const safeConfig = (status) => {
    return (
      STATUS_CONFIG[status] || {
        statusText: "غير معروف",
        statusColor: "gray",
        badgeText: "",
        badgeType: "warning",
        buttonText: "عرض التفاصيل",
        buttonClass: "btn-blue",
        canAction: true,
      }
    );
  };

  /* 🎯 فلترة */
  const filteredLeads = useMemo(() => {
    switch (filter) {
      case "active":
        return leads.filter((l) => ["open", "slots_full"].includes(l.status));

      case "waiting":
        return leads.filter((l) => ["waiting_tutor"].includes(l.status));

      case "closed":
        return leads.filter((l) =>
          ["closed_matched", "closed_no_match", "expired"].includes(l.status),
        );

      default:
        return leads;
    }
  }, [filter, leads]);

  const handleCreateLead = () => {
    console.log("Create Lead");
  };

  const handleViewDetails = (lead) => {
    navigate(`/lead/${lead.id}`, { state: lead });
  };

  const handleArchiveLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAction = (lead) => {
    const config = safeConfig(lead.status);

    if (config.canAction) {
      handleViewDetails(lead);
      return;
    }

    handleArchiveLead(lead.id);
  };

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case "warning":
        return "schedule";
      case "success":
        return "verified";
      case "expired":
        return "event_busy";
      default:
        return "info";
    }
  };

  return (
    <div className="app-container" dir="rtl">
      <Header />

      <main className="main-content">
        <div className="content-header">
          <div className="header-text">
            <h2>طلباتي التعليمية</h2>
            <p>تابع حالة طلبات الدروس الخاصة بك والعروض المستلمة</p>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/Create/Lead")}
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>إنشاء طلب جديد</span>
          </button>
        </div>

        {/* filters */}
        <div className="filters-section">
          <div className="tabs-container">
            <button
              className={`tab-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              الكل
            </button>

            <button
              className={`tab-btn ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              نشط
            </button>

            <button
              className={`tab-btn ${filter === "waiting" ? "active" : ""}`}
              onClick={() => setFilter("waiting")}
            >
              قيد الانتظار
            </button>

            <button
              className={`tab-btn ${filter === "closed" ? "active" : ""}`}
              onClick={() => setFilter("closed")}
            >
              منتهي
            </button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <h3>لا يوجد لديك طلبات حالياً</h3>
          </div>
        ) : (
          <div className="leads-container">
            {filteredLeads.map((lead) => {
              const config = safeConfig(lead.status);
              const subjectColor = getSubjectColor(lead.title);

              return (
                <div
                  key={lead.id}
                  className={`lead-card ${
                    !config.canAction ? "expired-card" : ""
                  }`}
                >
                  <div className="lead-right-side">
                    <div className={`subject-icon icon-${subjectColor}`}>
                      <span className="material-symbols-outlined">
                        {getSubjectIcon(lead.title)}
                      </span>
                    </div>

                    <div className="subject-details">
                      <div className="subject-title-row">
                        <h3>{lead.title}</h3>

                        <span
                          className={`status-badge status-${config.statusColor}`}
                        >
                          {config.statusText}
                        </span>
                      </div>

                      <div className="subject-meta">
                        <div className="meta-item">
                          <span className="material-symbols-outlined">
                            school
                          </span>
                          <span>{lead.level}</span>
                        </div>

                        <div className="meta-item price-item">
                          <span className="material-symbols-outlined">
                            payments
                          </span>
                          <span>{lead.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lead-left-side">
                    <div className="badges-row">
                      {config.badgeText && (
                        <div className={`info-badge badge-${config.badgeType}`}>
                          <span className="material-symbols-outlined">
                            {getBadgeIcon(config.badgeType)}
                          </span>
                          <span>{config.badgeText}</span>
                        </div>
                      )}

                      <div className="info-badge badge-primary-light">
                        <span className="material-symbols-outlined">
                          groups
                        </span>
                        <span>{lead.offersCount} عروض مستلمة</span>
                      </div>
                    </div>

                    <button
                      className={`action-btn ${config.buttonClass}`}
                      onClick={() => handleAction(lead)}
                    >
                      {config.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
