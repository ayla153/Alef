import React, { useState, useEffect } from "react";
import "../../styles/sstyle/PrivateLeadDetails.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../../api/api.js";
import { resolveTutorPhotoUrl } from "../../utils/tutorPhoto";

export default function PrivateLeadDetails({ lead }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadStatus, setLeadStatus] = useState(lead?.lead_status);
  const [actionLoading, setActionLoading] = useState(false);
  const [targetTutor, setTargetTutor] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("light");
  }, []);

  useEffect(() => {
    setLeadStatus(lead?.lead_status);
  }, [lead]);

  useEffect(() => {
    if (!lead?.target_tutor_id) return;
    const fetchTutor = async () => {
      try {
        const { data } = await api.get(`/tutors/${lead.target_tutor_id}`);
        setTargetTutor(data);
      } catch (err) {
        console.error("فشل جلب بيانات المعلم", err);
      }
    };
    fetchTutor();
  }, [lead?.target_tutor_id]);

  if (!lead) return null;

  const isAccepted = leadStatus === "closed_matched";
  const isPending = leadStatus === "open";
  const isExpired =
    leadStatus === "closed_empty" || leadStatus === "closed_expired";

  const tutorApp = lead.applications?.[0];
  const tutorPhone = tutorApp?.tutor_phone_number;

  const tutorProfileId = lead.target_tutor_id || tutorApp?.tutor_id;

  const goToTutorProfile = () => {
    if (tutorProfileId) navigate(`/tutor/${tutorProfileId}`);
  };

  const renderTutorCard = ({ showOfferDetails = false } = {}) => {
    const name = targetTutor
      ? `${targetTutor.first_name || ""} ${targetTutor.last_name || ""}`.trim()
      : tutorApp?.tutor_first_name || (tutorProfileId ? `معلم #${tutorProfileId}` : null);

    if (!name) return null;

    const photo = targetTutor
      ? resolveTutorPhotoUrl(targetTutor.tutor_photo, {
          gender: targetTutor.gender,
          tutorId: targetTutor.tutor_id,
        })
      : resolveTutorPhotoUrl(null, { tutorId: tutorProfileId });

    return (
      <section
        className={`pld-card pld-teacher-card ${tutorProfileId ? "pld-teacher-card-clickable" : ""}`}
        role={tutorProfileId ? "button" : undefined}
        tabIndex={tutorProfileId ? 0 : undefined}
        onClick={tutorProfileId ? goToTutorProfile : undefined}
        onKeyDown={
          tutorProfileId
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToTutorProfile();
                }
              }
            : undefined
        }
      >
        <div className="pld-teacher-avatar-wrapper">
          <div className="pld-teacher-avatar">
            <img src={photo} alt={name} />
          </div>
        </div>
        <div className="pld-teacher-details">
          <h3 className="pld-teacher-name">{name}</h3>
          {showOfferDetails && tutorApp?.proposed_fee && (
            <p className="pld-teacher-headline">
              السعر المقترح: {tutorApp.proposed_fee} ل.س/ساعة
            </p>
          )}
          {!showOfferDetails && targetTutor?.total_experience_years != null && (
            <p className="pld-teacher-headline">
              خبرة {targetTutor.total_experience_years} سنة
            </p>
          )}
          {(showOfferDetails ? tutorApp?.message : targetTutor?.bio) && (
            <p className="pld-teacher-bio">
              {showOfferDetails ? tutorApp.message : targetTutor.bio}
            </p>
          )}
          {tutorProfileId && (
            <span className="pld-view-profile-hint">
              <span className="material-symbols-outlined">open_in_new</span>
              عرض الملف الشخصي للمعلم
            </span>
          )}
        </div>
      </section>
    );
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleCloseLead = async (matched) => {
    try {
      setActionLoading(true);
      const { data } = await api.post(
        `/leads/${lead.post_requirements_id}/close`,
        { matched },
      );
      setLeadStatus(data.lead_status);
    } catch (err) {
      const msg = err.response?.data?.detail || "فشل إغلاق الطلب";
      alert(typeof msg === "string" ? msg : "فشل إغلاق الطلب");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLead = async () => {
    await handleCloseLead(false);
    setIsModalOpen(false);
    setTimeout(() => navigate("/MyLeads"), 500);
  };

  return (
    <div className="pld-app min-h-screen">
      <Header />

      <main className="pld-main-content">
        {/* CASE 1: closed_matched */}
        {isAccepted && (
          <>
            <section className="pld-card pld-header-card">
              <div className="pld-header-info">
                <div className="pld-badges-row">
                  <span className="pld-badge-status pld-bg-special">
                    طلب خاص
                  </span>
                  <span className="pld-badge-status pld-bg-success">
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    تم قبول الطلب
                  </span>
                </div>
                <h2 className="pld-main-title">{lead.title}</h2>
                <div className="pld-meta-row">
                  <div className="pld-meta-item">
                    <span className="material-symbols-outlined">payments</span>
                    <span>
                      {lead.min_expected_fee} - {lead.max_expected_fee} ل.س /
                      ساعة
                    </span>
                  </div>
                  <div className="pld-meta-item pld-highlight-meta">
                    <span className="material-symbols-outlined">
                      {lead.tution_type === "online" ? "wifi" : "person_pin"}
                    </span>
                    <span>
                      {lead.tution_type === "online"
                        ? "أونلاين"
                        : lead.tution_type === "offline"
                          ? "حضوري"
                          : "أونلاين وحضوري"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pld-budget-box">
                <div className="pld-budget-label">الميزانية المتوقعة</div>
                <div className="pld-budget-amount">
                  {lead.min_expected_fee} - {lead.max_expected_fee}{" "}
                  <span className="pld-currency">ل.س</span>
                </div>
              </div>
            </section>

            {renderTutorCard({ showOfferDetails: true })}

            <section className="pld-session-info-bar">
              <div className="pld-info-block">
                <div className="pld-block-icon">
                  <span className="material-symbols-outlined">videocam</span>
                </div>
                <div>
                  <div className="pld-block-label">نوع الحصة</div>
                  <div className="pld-block-value">
                    {lead.tution_type === "online"
                      ? "أونلاين"
                      : lead.tution_type === "offline"
                        ? "حضوري"
                        : "أونلاين وحضوري"}
                  </div>
                </div>
              </div>
              <div className="pld-vertical-divider"></div>
              <div className="pld-info-block">
                <div className="pld-block-icon">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                  <div className="pld-block-label">تاريخ الإغلاق</div>
                  <div className="pld-block-value">
                    {lead.closed_at
                      ? new Date(lead.closed_at).toLocaleDateString("ar-SA")
                      : "—"}
                  </div>
                </div>
              </div>
            </section>

            <section className="pld-card pld-contact-section">
              <div className="pld-contact-header">
                <h3>معلومات التواصل</h3>
                <p>يمكنك التواصل مع المعلم مباشرة بعد قبول الطلب.</p>
              </div>
              {tutorPhone ? (
                <>
                  <div className="pld-phone-box">
                    <div className="pld-phone-label">رقم هاتف المعلم</div>
                    <div className="pld-phone-number" dir="ltr">
                      {tutorPhone}
                    </div>
                  </div>
                  <div className="pld-action-buttons-group">
                    <a
                      href={`tel:${tutorPhone}`}
                      className="pld-btn-direct-call"
                    >
                      <span className="material-symbols-outlined">call</span>
                      <span>اتصال مباشر</span>
                    </a>

                    <a
                      href={`https://wa.me/${tutorPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="pld-btn-whatsapp"
                    >
                      <span className="material-symbols-outlined">chat</span>
                      <span>واتساب المعلم</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="pld-phone-box">
                  <div className="pld-phone-label">رقم هاتف المعلم</div>
                  <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                    بانتظار موافقة المعلّم لكشف رقم التواصل
                  </div>
                </div>
              )}
              <hr className="pld-section-divider" />
              <div className="pld-footer-actions">
                <button
                  className="pld-btn-secondary"
                  disabled={actionLoading}
                  onClick={() => handleCloseLead(true)}
                >
                  <span className="material-symbols-outlined">lock</span>
                  <span>تم الاختيار</span>
                </button>
                <span className="pld-inline-divider">|</span>
                <button
                  className="pld-btn-secondary pld-text-danger"
                  disabled={actionLoading}
                  onClick={toggleModal}
                >
                  <span className="material-symbols-outlined">close</span>
                  <span>اغلاق</span>
                </button>
              </div>
            </section>
          </>
        )}

        {/* CASE 2: open — بانتظار رد المعلم */}
        {isPending && (
          <>
            <section className="pld-card pld-header-card">
              <div className="pld-header-info">
                <div className="pld-badges-row">
                  <span className="pld-badge-status pld-bg-special">
                    طلب خاص
                  </span>
                  <span className="pld-badge-status pld-status-pending">
                    <span className="material-symbols-outlined">schedule</span>
                    قيد الانتظار
                  </span>
                </div>
                <h2 className="pld-main-title">{lead.title}</h2>
                <div className="pld-meta-row">
                  <div className="pld-meta-item">
                    <span className="material-symbols-outlined">payments</span>
                    <span>
                      {lead.min_expected_fee} - {lead.max_expected_fee} ل.س /
                      ساعة
                    </span>
                  </div>
                  <div className="pld-meta-item pld-highlight-meta">
                    <span className="material-symbols-outlined">
                      {lead.tution_type === "online" ? "wifi" : "person_pin"}
                    </span>
                    <span>
                      {lead.tution_type === "online"
                        ? "أونلاين"
                        : lead.tution_type === "offline"
                          ? "حضوري"
                          : "أونلاين وحضوري"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pld-budget-box">
                <div className="pld-budget-label">الميزانية المتوقعة</div>
                <div className="pld-budget-amount">
                  {lead.min_expected_fee} - {lead.max_expected_fee}{" "}
                  <span className="pld-currency">ل.س</span>
                </div>
              </div>
            </section>

            {renderTutorCard()}

            <section className="pld-card pld-search-status-card">
              <div className="pld-search-icon-wrapper">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <h3 className="pld-search-title">في انتظار قبول المعلم</h3>
              <p className="pld-search-description">
                لقد تم إرسال طلبك للمعلم، سيتم إشعارك فور قبوله وبدء التواصل.
              </p>
            </section>

            <section className="pld-session-info-bar">
              <div className="pld-info-block">
                <span className="material-symbols-outlined">videocam</span>
                <span>
                  {lead.tution_type === "online"
                    ? "أونلاين"
                    : lead.tution_type === "offline"
                      ? "حضوري"
                      : "أونلاين وحضوري"}
                </span>
              </div>
              <div className="pld-info-block">
                <span className="material-symbols-outlined">history</span>
                <span>
                  ينتهي في{" "}
                  {lead.expired_at
                    ? new Date(lead.expired_at).toLocaleDateString("ar-SA")
                    : "—"}
                </span>
              </div>
            </section>

            <section className="pld-card pld-lead-actions-section">
              <div className="pld-action-block pld-action-danger">
                <div className="pld-action-block-content">
                  <div className="pld-action-icon pld-action-icon-danger">
                    <span className="material-symbols-outlined">delete_outline</span>
                  </div>
                  <div>
                    <h3 className="pld-action-title">إلغاء الطلب</h3>
                    <p className="pld-action-desc">
                      إذا لم تعد بحاجة لهذا الطلب. سيتوقف إرساله للمعلم ولن يتمكن من الرد عليه.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="pld-btn-danger-outline"
                  disabled={actionLoading}
                  onClick={toggleModal}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  {actionLoading ? "جاري الإلغاء..." : "إلغاء الطلب نهائياً"}
                </button>
              </div>
            </section>
          </>
        )}

        {/* CASE 3: closed_empty / closed_expired */}
        {isExpired && (
          <section
            className="pld-card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "3rem", color: "#9ca3af" }}
            >
              event_busy
            </span>
            <h2 style={{ marginTop: "1rem" }}>
              {leadStatus === "closed_expired"
                ? "انتهى الطلب تلقائياً"
                : "تم إغلاق الطلب"}
            </h2>
            <p style={{ color: "#6b7280" }}>
              {leadStatus === "closed_expired"
                ? "انتهت مدة الطلب دون موافقة المعلم"
                : "تم إغلاق الطلب بدون اختيار معلم"}
            </p>
            <button
              className="pld-btn-secondary"
              style={{ marginTop: "1.5rem" }}
              onClick={() => navigate("/MyLeads")}
            >
              العودة لطلباتي
            </button>
          </section>
        )}
      </main>

      {/* Modal الإلغاء */}
      {isModalOpen && (
        <div className="pld-modal-overlay">
          <div className="pld-modal-backdrop" onClick={toggleModal} />
          <div
            className="pld-modal-card"
            style={{ position: "relative", zIndex: 101 }}
          >
            <div className="pld-modal-body">
              <div className="pld-modal-icon-danger">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h2>تأكيد إلغاء الطلب</h2>
              <p>
                سيتم إلغاء الطلب نهائياً ولن يتمكن المعلم من الرد عليه. لا يمكن التراجع بعد الإلغاء.
              </p>
              <div className="pld-modal-actions-grid">
                <button className="pld-modal-btn-cancel" onClick={toggleModal}>
                  تراجع
                </button>
                <button
                  className="pld-modal-btn-confirm"
                  disabled={actionLoading}
                  onClick={handleCancelLead}
                >
                  تأكيد الإلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
