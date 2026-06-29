import React, { useMemo, useState, useEffect } from "react";
import "../../styles/sstyle/MyLeads.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../../api/api.js";

const SUBJECT_TRANSLATION = {
  Mathematics: "رياضيات",
  Physics: "فيزياء",
  Chemistry: "كيمياء",
  Biology: "أحياء",
  English: "لغة إنجليزية",
  Arabic: "لغة عربية",
  History: "تاريخ",
  Geography: "جغرافيا",
  ComputerScience: "معلوماتية",
};

const translateTitle = (title = "") => {
  const match = Object.keys(SUBJECT_TRANSLATION).find((key) =>
    title.includes(key)
  );
  return match ? title.replace(match, SUBJECT_TRANSLATION[match]) : title;
};

const subjectColors = {
  رياضيات: "blue",
  فيزياء: "purple",
  كيمياء: "green",
  أحياء: "emerald",
  "لغة إنجليزية": "orange",
  "لغة عربية": "red",
  تاريخ: "yellow",
  جغرافيا: "teal",
  معلوماتية: "indigo",
};

const getSubjectIcon = (title = "") => {
  if (title.includes("رياضيات")) return "calculate";
  if (title.includes("فيزياء")) return "biotech";
  if (title.includes("كيمياء")) return "science";
  if (title.includes("أحياء")) return "eco";
  if (title.includes("إنجليزية")) return "translate";
  if (title.includes("عربية")) return "menu_book";
  if (title.includes("تاريخ")) return "history_edu";
  if (title.includes("جغرافيا")) return "public";
  if (title.includes("معلوماتية")) return "computer";
  return "school";
};

const getSubjectColor = (title = "") => {
  const match = Object.keys(subjectColors).find((key) => title.includes(key));
  return subjectColors[match] || "gray";
};

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
  waiting_tutor_response: {
    statusText: "بانتظار رد المعلم",
    statusColor: "amber",
    badgeText: "لم يستجب المعلم بعد",
    badgeType: "warning",
    buttonText: "عرض التفاصيل",
    buttonClass: "btn-outline-gray",
    canAction: true,
  },
  closed_shortlist: {
    statusText: "مغلق — قائمة العروض",
    statusColor: "blue",
    badgeText: "تم اختيار معلمين",
    badgeType: "success",
    buttonText: "عرض النتيجة",
    buttonClass: "btn-blue",
    canAction: true,
  },
  closed_matched: {
    statusText: "مغلق — تم الاختيار",
    statusColor: "blue",
    badgeText: "تم اختيار معلم",
    badgeType: "success",
    buttonText: "عرض النتيجة",
    buttonClass: "btn-blue",
    canAction: true,
  },
  closed_empty: {
    statusText: "ملغي",
    statusColor: "gray",
    badgeText: "تم إلغاء الطلب",
    badgeType: "expired",
    buttonText: "عرض التفاصيل",
    buttonClass: "btn-outline-gray",
    canAction: true,
  },
  closed_expired: {
    statusText: "منتهي",
    statusColor: "gray",
    badgeText: "انتهت الصلاحية",
    badgeType: "expired",
    buttonText: "أرشفة الطلب",
    buttonClass: "btn-outline-gray",
    canAction: false,
  },
};

const DIMMED_STATUSES = ["closed_empty", "closed_expired"];

export default function MyLeads() {
  const [filter, setFilter] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await api.get("/leads/me");
        setLeads(data);
      } catch (err) {
        setError(err.response?.data?.detail || "فشل في جلب الطلبات");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const safeConfig = (lead) => {
    const isPrivate = lead.target_tutor_id != null;

    let statusKey = lead.lead_status;

    if (lead.lead_status === "open") {
      if (isPrivate) {
        statusKey = "waiting_tutor_response";
      } else if (!lead.accepting_applications) {
        statusKey = "slots_full";
      }
    }

    return (
      STATUS_CONFIG[statusKey] || {
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

  const isDimmed = (lead) => DIMMED_STATUSES.includes(lead.lead_status);

  const filteredLeads = useMemo(() => {
    switch (filter) {
      case "active":
        return leads.filter((l) => l.lead_status === "open");
      case "waiting":
        return leads.filter(
          (l) => l.lead_status === "open" && l.target_tutor_id != null
        );
      case "closed":
        return leads.filter((l) =>
          ["closed_shortlist", "closed_matched", "closed_empty", "closed_expired"].includes(
            l.lead_status
          )
        );
      default:
        return leads;
    }
  }, [filter, leads]);

  const handleViewDetails = (lead) => {
    navigate(`/lead/${lead.post_requirements_id}`, { state: lead });
  };

  const handleArchiveLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.post_requirements_id !== id));
  };

  const handleAction = (lead) => {
    const config = safeConfig(lead);
    if (config.canAction) {
      handleViewDetails(lead);
    } else {
      handleArchiveLead(lead.post_requirements_id);
    }
  };

  if (loading) {
    return (
      <div className="app-container" dir="rtl">
        <Header />
        <main className="main-content">
          <div style={{ textAlign: "center", padding: "4rem" }}>
            جاري التحميل...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" dir="rtl">
        <Header />
        <main className="main-content">
          <div style={{ textAlign: "center", padding: "4rem", color: "red" }}>
            {error}
          </div>
        </main>
      </div>
    );
  }

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

        <div className="filters-section">
          <div className="tabs-container">
            {[
              { key: "all", label: "الكل" },
              { key: "active", label: "نشط" },
              { key: "waiting", label: "قيد الانتظار" },
              { key: "closed", label: "منتهي" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <h3>لا يوجد لديك طلبات حالياً</h3>
          </div>
        ) : (
          <div className="leads-container">
            {filteredLeads.map((lead) => {
              const translatedTitle = translateTitle(lead.title);
              const config = safeConfig(lead);
              const subjectColor = getSubjectColor(translatedTitle);
              const dimmed = isDimmed(lead);
              const isPrivate = lead.target_tutor_id != null;

              const sessionLabel =
                lead.tution_type === "online"
                  ? "أونلاين"
                  : lead.tution_type === "offline"
                    ? "حضوري"
                    : "أونلاين وحضوري";

              const statusVariant =
                lead.lead_status === "open" ? "open" : dimmed ? "expired" : config.statusColor;

              return (
                <div
                  key={lead.post_requirements_id}
                  className={`lead-card lead-card--${statusVariant} ${dimmed ? "expired-card" : ""}`}
                >
                  <div className="lead-right-side">
                    <div className={`subject-icon icon-${subjectColor}`}>
                      <span className="material-symbols-outlined">
                        {getSubjectIcon(translatedTitle)}
                      </span>
                    </div>

                    <div className="subject-details">
                      <div className="subject-title-row">
                        <h3>{translatedTitle}</h3>
                        <span className={`lead-status-indicator lead-status-${config.statusColor}`}>
                          <span className="lead-status-dot" aria-hidden="true" />
                          <span className="lead-status-text">{config.statusText}</span>
                        </span>
                      </div>

                      <p className="lead-card-summary">
                        <span className={`lead-type-dot ${isPrivate ? "lead-type-private" : "lead-type-public"}`} />
                        {isPrivate ? "طلب خاص" : "طلب عام"}
                        <span className="lead-summary-sep">·</span>
                        {lead.min_expected_fee}–{lead.max_expected_fee} ل.س/ساعة
                        <span className="lead-summary-sep">·</span>
                        {sessionLabel}
                      </p>

                      {isPrivate && (
                        <button
                          type="button"
                          className="lead-tutor-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tutor/${lead.target_tutor_id}`);
                          }}
                        >
                          <span className="material-symbols-outlined">person</span>
                          عرض ملف المعلم
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lead-left-side">
                    {!isPrivate && lead.pending_offer_count > 0 && (
                      <div className="lead-offers-stat" title="عروض مستلمة">
                        <span className="material-symbols-outlined">inbox</span>
                        <span className="lead-offers-count">{lead.pending_offer_count}</span>
                        <span className="lead-offers-label">عرض</span>
                      </div>
                    )}
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