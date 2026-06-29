import React from "react";
import "../../styles/sstyle/PublicLeadDetails.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../../api/api.js";
import { resolveTutorPhotoUrl } from "../../utils/tutorPhoto";

export default function PublicLeadDetails({ lead }) {
  const navigate = useNavigate();

  const [applicationsState, setApplicationsState] = React.useState(
    lead.applications || []
  );
  const [leadStatus, setLeadStatus] = React.useState(lead.lead_status);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showCloseModal, setShowCloseModal] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState(null);

  React.useEffect(() => {
    setApplicationsState(lead.applications || []);
    setLeadStatus(lead.lead_status);
  }, [lead]);

  if (!lead) return <div>لا توجد بيانات للعرض</div>;

  const isClosed = ["closed_shortlist", "closed_matched", "closed_empty", "closed_expired"].includes(leadStatus);
  const isPending = leadStatus === "open" && applicationsState.filter(a => a.application_status === "pending").length === 0;
  const pendingOfferCount = applicationsState.filter(
    (a) => a.application_status === "pending"
  ).length;
  const hasOffersToClose = pendingOfferCount > 0;

  // رفض عرض واحد — PATCH /leads/{id}/offers/{offer_id}/reject
  const handleRejectOffer = async (offerId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const { data: updated } = await api.patch(
        `/leads/${lead.post_requirements_id}/offers/${offerId}/reject`
      );
      setApplicationsState(updated.applications || []);
    } catch (err) {
      setActionError(err.response?.data?.detail || "فشل رفض العرض");
    } finally {
      setActionLoading(false);
    }
  };

  // إغلاق الطلب — POST /leads/{id}/close (بدون body للعام)
  // بيرجع LeadOut محدّث
  const handleCloseOrder = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const { data: updated } = await api.post(
        `/leads/${lead.post_requirements_id}/close`
      );
      // نحدّث الـ state بالبيانات الجديدة من الباك
      setLeadStatus(updated.lead_status);
      setApplicationsState(updated.applications || []);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.detail || "فشل إغلاق الطلب";
      // 409 = الطلب مغلق مسبقاً — نعامله كنجاح ونروح لطلباتي
      if (err.response?.status === 409) {
        navigate("/MyLeads");
        return;
      }
      setActionError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // إلغاء الطلب = إغلاق بدون عروض (غير مهتم) ثم navigate
  const handleCancelOrder = async () => {
    setShowCancelModal(false);
    try {
      await handleCloseOrder();
      // بعد الإغلاق الناجح نروح لطلباتي
      navigate("/MyLeads");
    } catch {
      // الخطأ بيظهر بـ actionError
    }
  };

  // حساب وقت الانتهاء
  const daysLeft = lead.expired_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(lead.expired_at) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="pld-app">
      <Header />

      <main className="pld-main-content">

        {/* رسالة الخطأ */}
        {actionError && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              margin: "0 0 16px",
              textAlign: "center",
              fontWeight: "bold",
            }}
            dir="rtl"
          >
            {actionError}
          </div>
        )}

        {/* HEADER CARD */}
        <section className="pld-card pld-header-card">
          <div className="pld-header-info">
            <div className="pld-badges-row">
              <span className="pld-badge-status pld-bg-special">طلب عام</span>

              {isPending ? (
                <span className="pod-badge pod-badge-pending">
                  <span className="material-symbols-outlined">pending</span>
                  بانتظار العروض
                </span>
              ) : isClosed ? (
                <span className="pld-badge-status pld-bg-gray">
                  <span className="material-symbols-outlined">lock</span>
                  {leadStatus === "closed_shortlist"
                    ? "مغلق — قائمة العروض"
                    : leadStatus === "closed_empty"
                    ? "مغلق — بدون عروض"
                    : leadStatus === "closed_expired"
                    ? "منتهي تلقائياً"
                    : "مغلق"}
                </span>
              ) : (
                <span className="pld-badge-status pld-bg-success">
                  <span className="material-symbols-outlined">check_circle</span>
                  مفتوح
                </span>
              )}
            </div>

            <span className="pod-order-id">
              رقم الطلب: #{lead.post_requirements_id}
            </span>
          </div>

          <div className="pod-header-title-zone">
            <h1 className="pld-main-title">{lead.title}</h1>
            <p className="pod-creation-date">
              تم الإنشاء في{" "}
              {new Date(lead.created_at).toLocaleDateString("ar-SA")}
            </p>
            {daysLeft !== null && !isClosed && (
              <p style={{ color: daysLeft <= 2 ? "#dc2626" : "#6b7280", fontSize: "13px" }}>
                ينتهي خلال {daysLeft} يوم
              </p>
            )}
          </div>

          <div className="pld-meta-row">
            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">payments</span>
              <span className="pod-spec-label">الميزانية المتوقعة</span>
              <span className="pod-spec-value">
                {lead.min_expected_fee} - {lead.max_expected_fee} <span className="pod-unit">ل.س/ساعة</span>
              </span>
            </div>

            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">
                {lead.tution_type === "online" ? "wifi" : lead.tution_type === "offline" ? "person_pin" : "devices"}
              </span>
              <span className="pod-spec-label">نوع التدريس</span>
              <span className="pod-spec-value">
                {lead.tution_type === "online"
                  ? "أونلاين"
                  : lead.tution_type === "offline"
                  ? "حضوري"
                  : "أونلاين وحضوري"}
              </span>
            </div>

            {lead.preferred_gender && (
              <div className="pod-spec-item">
                <span className="material-symbols-outlined pod-spec-icon">person</span>
                <span className="pod-spec-label">جنس المعلم المفضل</span>
                <span className="pod-spec-value">
                  {lead.preferred_gender === "male" ? "ذكر" : "أنثى"}
                </span>
              </div>
            )}

            {lead.help_type && (
              <div className="pod-spec-item">
                <span className="material-symbols-outlined pod-spec-icon">help_outline</span>
                <span className="pod-spec-label">نوع المساعدة</span>
                <span className="pod-spec-value">{lead.help_type}</span>
              </div>
            )}

            {lead.weekly_classes && (
              <div className="pod-spec-item">
                <span className="material-symbols-outlined pod-spec-icon">calendar_month</span>
                <span className="pod-spec-label">حصص أسبوعياً</span>
                <span className="pod-spec-value">{lead.weekly_classes}</span>
              </div>
            )}
          </div>
        </section>

        {/* حالة الانتظار */}
        {isPending ? (
          <section className="pld-card pld-search-status-card pod-waiting-section">
            <div className="pod-top-gradient-line"></div>
            <div className="pod-radar-container">
              <div className="pod-radar-pulse"></div>
              <div className="pod-radar-bg"></div>
              <div className="pod-radar-core">
                <span className="material-symbols-outlined pod-icon-radar">radar</span>
              </div>
            </div>
            <h2 className="pod-section-title">بانتظار عروض المعلمين</h2>
            <p className="pod-section-desc">
              طلبك متاح الآن للمعلمين. يمكنك استلام حتى {lead.max_applications} عروض خلال 10 أيام.
            </p>
            <div className="pod-loading-dots">
              <div className="pod-dot"></div>
              <div className="pod-dot"></div>
              <div className="pod-dot"></div>
            </div>
          </section>
        ) : (
          /* العروض */
          <section className="pld-card">
            <div className="pod-offers-header">
              <h2 className="pod-offers-title">عروض المعلمين</h2>
              <span className="pod-offers-count">
                {applicationsState.length} من {lead.max_applications}
              </span>
            </div>

            {!isClosed && (
              <div className="pod-phone-notice">
                <div className="pod-phone-notice-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="pod-phone-notice-body">
                  <p className="pod-phone-notice-title">أرقام المعلمين مخفية حالياً</p>
                  <p className="pod-phone-notice-text">
                    بعد مراجعة العروض، اضغط «إغلاق الطلب وكشف الأرقام» في أسفل الصفحة.
                    عند الإغلاق ستظهر أرقام جميع المعلمين الذين قدّموا عروضاً لتتواصل معهم مباشرة.
                  </p>
                </div>
              </div>
            )}

            <div className="pod-offers-list">
              {applicationsState.map((app) => (
                <div
                  key={app.lead_application_id}
                  className={`pod-teacher-card pod-offer-card ${
                    app.application_status === "rejected" ? "pod-offer-rejected" : ""
                  }`}
                >
                  <div className="pod-teacher-flex">
                    <div className="pod-teacher-avatar">
                      <img
                        src={resolveTutorPhotoUrl(null, { tutorId: app.tutor_id })}
                        alt={app.tutor_first_name || "معلم"}
                      />
                    </div>

                    <div className="pod-teacher-info">
                      <div className="pod-teacher-header-row">
                        <div>
                          <h3 className="pod-teacher-name">
                            {app.tutor_first_name || `معلم #${app.tutor_id}`}
                          </h3>
                          {app.application_status === "rejected" && (
                            <span className="pod-offer-status-rejected">تم رفض هذا العرض</span>
                          )}
                        </div>
                        <div className="pod-price-zone">
                          <span className="pod-price-label">السعر المقترح</span>
                          <div>
                            <span className="pod-price-value">{app.proposed_fee}</span>
                            <span className="pod-price-unit"> ل.س/ساعة</span>
                          </div>
                        </div>
                      </div>

                      {app.message && (
                        <div className="pod-offer-message">
                          <span className="material-symbols-outlined">chat_bubble</span>
                          <p>{app.message}</p>
                        </div>
                      )}

                      {app.first_session_note && (
                        <p className="pod-offer-session-note">
                          <span className="material-symbols-outlined">event</span>
                          الجلسة الأولى: {app.first_session_note}
                        </p>
                      )}

                      {app.tutor_phone_number ? (
                        <div className="pod-contact-zone">
                          <div className="pod-contact-method">
                            <div className="pod-contact-icon-bg">
                              <span className="material-symbols-outlined">call</span>
                            </div>
                            <div>
                              <p className="pod-contact-label">رقم التواصل</p>
                              <p className="pod-contact-number" dir="ltr">
                                {app.tutor_phone_number}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {app.application_status === "pending" && !isClosed && (
                        <div className="pod-action-buttons-row">
                          <button
                            className="pod-btn pod-btn-secondary"
                            onClick={() => navigate(`/tutor/${app.tutor_id}`)}
                          >
                            <span className="material-symbols-outlined">person</span>
                            عرض الملف الشخصي
                          </button>
                          <button
                            className="pod-btn pod-btn-danger"
                            disabled={actionLoading}
                            onClick={() => handleRejectOffer(app.lead_application_id)}
                          >
                            رفض العرض
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* معلومات إضافية */}
        <section className="pld-session-info-bar">
          <div className="pld-info-block">
            <div className="pld-block-icon">
              <span className="material-symbols-outlined">laptop_mac</span>
            </div>
            <div>
              <div className="pld-block-label">نوع الحصة</div>
              <div className="pld-block-value">
                {lead.tution_type === "online"
                  ? "أونلاين عبر المنصة"
                  : lead.tution_type === "offline"
                  ? "حضوري"
                  : "أونلاين وحضوري"}
              </div>
            </div>
          </div>

          <div className="pld-vertical-divider"></div>

          <div className="pld-info-block">
            <div className="pld-block-icon">
              <span className="material-symbols-outlined">update</span>
            </div>
            <div>
              <div className="pld-block-label">ينتهي في</div>
              <div className="pld-block-value">
                {lead.expired_at
                  ? new Date(lead.expired_at).toLocaleDateString("ar-SA")
                  : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* أزرار الإجراءات — تختفي بعد الإغلاق */}
        {!isClosed && (
          <section className="pld-card pld-contact-section">
            <div className="pld-footer-actions">
              <button
                className="pld-btn-secondary pld-text-danger"
                disabled={actionLoading}
                onClick={() => setShowCancelModal(true)}
              >
                <span className="material-symbols-outlined">cancel</span>
                {actionLoading ? "جاري الإلغاء..." : "إلغاء الطلب"}
              </button>

              {applicationsState.filter(a => a.application_status === "pending").length > 0 && (
                <button
                  className="pld-btn-secondary"
                  disabled={actionLoading}
                  onClick={handleCloseOrder}
                >
                  <span className="material-symbols-outlined">lock</span>
                  {actionLoading ? "جاري الإغلاق..." : "إغلاق الطلب وكشف الأرقام"}
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {showCancelModal && (
        <div className="pod-modal-overlay">
          <div className="pod-modal">
            <h3>تأكيد إلغاء الطلب</h3>
            <p>هل أنت متأكد؟ لا يمكن التراجع بعد الإلغاء.</p>
            <div className="pod-modal-actions">
              <button
                className="pod-btn pod-btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                تراجع
              </button>
              <button
                className="pod-btn pod-btn-danger"
                disabled={actionLoading}
                onClick={handleCancelOrder}
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}