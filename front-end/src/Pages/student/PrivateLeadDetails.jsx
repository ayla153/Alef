import React, { useState, useEffect } from "react";
import "../../styles/sstyle/PrivateLeadDetails.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function PrivateLeadDetails({ lead }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // fallback safety
  if (!lead) return null;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("light");
  }, []);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleCancelLead = () => {
    // هنا لاحقاً تربط API delete أو update status
    setIsModalOpen(false);
    console.log("Lead cancelled");

    // مثال UI فقط:
    navigate("/MyLeads");
  };

  return (
    <div className="pld-app min-h-screen">
      <Header />

      <main className="pld-main-content">
        {/* ========================= */}
        {/* CASE 1: ACCEPTED */}
        {/* ========================= */}
        {lead.status === "accepted" && (
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
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span>{lead.level}</span>
                  </div>

                  <div className="pld-meta-item pld-highlight-meta">
                    <span className="material-symbols-outlined">
                      calendar_today
                    </span>
                    <span>{lead.sessionTime}</span>
                  </div>
                </div>
              </div>

              <div className="pld-budget-box">
                <div className="pld-budget-label">الميزانية المتوقعة</div>

                <div className="pld-budget-amount">
                  {lead.budget}{" "}
                  <span className="pld-currency">{lead.currency}</span>
                </div>
              </div>
            </section>

            <section className="pld-card pld-teacher-card">
              <div className="pld-teacher-avatar-wrapper">
                <div className="pld-teacher-avatar">
                  <img src={lead.teacher.image} alt={lead.teacher.name} />
                </div>

                <div className="pld-rating-tag">
                  <span className="material-symbols-outlined">star</span>
                  <span>{lead.teacher.rating}</span>
                </div>
              </div>

              <div className="pld-teacher-details">
                <h3 className="pld-teacher-name">{lead.teacher.name}</h3>

                <p className="pld-teacher-headline">{lead.teacher.headline}</p>

                <p className="pld-teacher-bio">{lead.teacher.bio}</p>

                <div className="pld-tags-container">
                  {lead.tags.map((tag) => (
                    <span key={tag} className="pld-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="pld-session-info-bar">
              <div className="pld-info-block">
                <div className="pld-block-icon">
                  <span className="material-symbols-outlined">videocam</span>
                </div>

                <div>
                  <div className="pld-block-label">نوع الحصة ونظامها</div>
                  <div className="pld-block-value">{lead.session.type}</div>
                </div>
              </div>

              <div className="pld-vertical-divider"></div>

              <div className="pld-info-block">
                <div className="pld-block-icon">
                  <span className="material-symbols-outlined">history</span>
                </div>

                <div>
                  <div className="pld-block-label">تاريخ الاستجابة</div>
                  <div className="pld-block-value">
                    {lead.session.responseTime}
                  </div>
                </div>
              </div>
            </section>

            <section className="pld-card pld-contact-section">
              <div className="pld-contact-header">
                <h3>معلومات التواصل</h3>
                <p>يمكنك التواصل مع المعلم مباشرة بعد قبول الطلب.</p>
              </div>

              <div className="pld-phone-box">
                <div className="pld-phone-label">رقم هاتف المعلم</div>
                <div className="pld-phone-number">{lead.phone}</div>
              </div>

              <div className="pld-action-buttons-group">
                <button className="pld-btn-direct-call">
                  <span className="material-symbols-outlined">call</span>
                  <span>اتصال مباشر</span>
                </button>

                <button className="pld-btn-whatsapp">
                  <span className="material-symbols-outlined">chat</span>
                  <span>واتساب المعلم</span>
                </button>
              </div>

              <hr className="pld-section-divider" />

              <div className="pld-footer-actions">
                <button
                  className="pld-btn-secondary"
                  onClick={() => console.log("Close order logic here")}
                >
                  <span className="material-symbols-outlined">lock</span>
                  <span>إغلاق الطلب</span>
                </button>

                <span className="pld-inline-divider">|</span>
              </div>
            </section>
          </>
        )}

        {/* ========================= */}
        {/* CASE 2: PENDING */}
        {/* ========================= */}
        {lead.status === "pending" && (
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
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span>{lead.level}</span>
                  </div>

                  <div className="pld-meta-item pld-highlight-meta">
                    <span className="material-symbols-outlined">
                      calendar_today
                    </span>
                    <span>{lead.sessionTime}</span>
                  </div>
                </div>
              </div>

              <div className="pld-budget-box">
                <div className="pld-budget-label">الميزانية المتوقعة</div>

                <div className="pld-budget-amount">
                  {lead.budget}{" "}
                  <span className="pld-currency">{lead.currency}</span>
                </div>
              </div>
            </section>

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
                <span>{lead.session.type}</span>
              </div>

              <div className="pld-info-block">
                <span className="material-symbols-outlined">history</span>
                <span>{lead.session.responseTime}</span>
              </div>
            </section>

            <section className="pld-card pld-contact-section">
              <div className="pld-footer-actions">
                <button
                  className="pld-btn-secondary pld-text-danger"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  إلغاء الطلب
                </button>

                <button className="pld-btn-secondary">
                  <span className="material-symbols-outlined">edit</span>
                  تعديل الطلب
                </button>
              </div>
            </section>
          </>
        )}

        {/* ========================= */}
        {/* CASE 3: EXPIRED */}
        {/* ========================= */}
        {lead.status === "expired" && (
          <section className="pld-card">
            <h2>انتهى الطلب</h2>
            <p>لم يعد هذا الطلب نشط.</p>
          </section>
        )}
      </main>

      {isModalOpen && (
        <div className="pld-modal-overlay">
          <div className="pld-modal-backdrop" onClick={toggleModal} />

          <div className="pld-modal-card">
            <div className="pld-modal-body">
              <div className="pld-modal-icon-danger">
                <span className="material-symbols-outlined">warning</span>
              </div>

              <h2>تأكيد إلغاء الطلب</h2>

              <p>هل أنت متأكد أنك تريد إلغاء هذا الطلب؟</p>

              <div className="pld-modal-actions-grid">
                <button className="pld-modal-btn-cancel" onClick={toggleModal}>
                  تراجع
                </button>

                <button
                  className="pld-modal-btn-confirm"
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
