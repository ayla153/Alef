import React from "react";
import "../../styles/sstyle/PublicLeadDetails.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function PublicOrderDetails({ lead }) {
  if (!lead) {
    return <div>لا توجد بيانات للعرض</div>;
  }
  const navigate = useNavigate();
  const [acceptedOfferId, setAcceptedOfferId] = React.useState(null);
  const [offersState, setOffersState] = React.useState(lead.offers || []);
  const [orderStatus, setOrderStatus] = React.useState(lead.status);
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  const isPending = lead.status === "pending";
  const isClosed = orderStatus === "closed";

  const offers = offersState;

  const isFull = offersState.length >= 5;

  React.useEffect(() => {
    setOffersState(lead.offers || []);
  }, [lead]);

  const summary = lead.summary || {
    receivedCount: offers.length,
    totalExpected: offers.length,
  };

  console.log("STATUS =", lead.status);
  console.log("OFFERS =", lead.offers);

  const handleRejectOffer = (offerId) => {
    setOffersState((prev) => prev.filter((offer) => offer.id !== offerId));
  };

  const handleCloseOrder = () => {
    setOrderStatus("closed");
  };

  const handleCancelOrder = () => {
    setOrderStatus("cancelled");
    setShowCancelModal(false);

    // 👇 هون مكانها
    setTimeout(() => {
      navigate("/MyLeads");
    }, 500);
  };

  return (
    <div className="pld-app">
      <Header />

      <main className="pld-main-content">
        <section className="pld-card pld-header-card">
          <div className="pld-header-info">
            <div className="pld-badges-row">
              <span className="pld-badge-status pld-bg-special">طلب عام</span>

              {isPending ? (
                <span className="pod-badge pod-badge-pending">
                  <span className="material-symbols-outlined">pending</span>
                  قيد الانتظار
                </span>
              ) : (
                <span className="pld-badge-status pld-bg-success">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  مفتوح
                </span>
              )}
            </div>
            <span className="pod-order-id">رقم الطلب: #{lead.id}</span>
          </div>

          <div className="pod-header-title-zone">
            <h1 className="pld-main-title">{lead.subject}</h1>
            <p className="pod-creation-date">تم الإنشاء في {lead.createdAt}</p>
          </div>

          <div className="pld-meta-row">
            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">
                payments
              </span>
              <span className="pod-spec-label">الميزانية المتوقعة</span>
              <span className="pod-spec-value">
                {lead.budget} <span className="pod-unit">/ساعة</span>
              </span>
            </div>

            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">
                school
              </span>
              <span className="pod-spec-label">المستوى الدراسي</span>
              <span className="pod-spec-value">{lead.level}</span>
            </div>

            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">
                schedule
              </span>
              <span className="pod-spec-label">توقيت الحصة</span>
              <span className="pod-spec-value">{lead.timing}</span>
            </div>

            <div className="pod-spec-item">
              <span className="material-symbols-outlined pod-spec-icon">
                timer
              </span>
              <span className="pod-spec-label">المدة</span>
              <span className="pod-spec-value">{lead.duration}</span>
            </div>
          </div>
        </section>

        {isPending ? (
          <section className="pld-card pld-search-status-card pod-waiting-section">
            <div className="pod-top-gradient-line"></div>
            <div className="pod-radar-container">
              <div className="pod-radar-pulse"></div>
              <div className="pod-radar-bg"></div>
              <div className="pod-radar-core">
                <span className="material-symbols-outlined pod-icon-radar">
                  radar
                </span>
              </div>
              <div className="pod-sub-icon pod-icon-search">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <div className="pod-sub-icon pod-icon-check">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>

            <h2 className="pod-section-title">بانتظار عروض المعلمين</h2>
            <p className="pod-section-desc">
              طلبك متاح الآن للمعلمين المتميزين على المنصة. ستتلقى إشعارات فور
              تقديم أحد المعلمين عرضاً لطلبك.
            </p>

            <div className="pod-loading-dots">
              <div className="pod-dot"></div>
              <div className="pod-dot"></div>
              <div className="pod-dot"></div>
            </div>
          </section>
        ) : (
          <section className="pld-card">
            <div className="pod-offers-header">
              <h2 className="pod-offers-title">عروض المعلمين</h2>
              <span className="pod-offers-count">
                {offers.length} من {summary.totalExpected}
              </span>
            </div>
            {!isClosed && (
              <div className="pod-warning-message">
                ⚠️ لا يمكن قبول أي عرض إلا بعد إغلاق الطلب من قِبل الطالب
              </div>
            )}

            <div className="pod-offers-list">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`pld-card ${
                    acceptedOfferId === offer.id ? "pod-accepted" : ""
                  }`}
                >
                  <div className="pod-teacher-flex">
                    <div className="pod-teacher-avatar">
                      <img src={offer.avatar} alt={offer.name} />
                    </div>

                    <div className="pod-teacher-info">
                      <div className="pod-teacher-header-row">
                        <div>
                          <h3 className="pod-teacher-name">{offer.name}</h3>

                          {acceptedOfferId === offer.id && (
                            <span className="pod-accepted-badge">
                              <span className="material-symbols-outlined">
                                check_circle
                              </span>
                              تم القبول
                            </span>
                          )}

                          <div className="pod-rating-row">
                            <span className="material-symbols-outlined pod-star-icon">
                              star
                            </span>
                            <span className="pod-rating-score">
                              {offer.rating}
                            </span>
                            <span className="pod-rating-count">
                              ({offer.reviewsCount} تقييم)
                            </span>
                          </div>
                        </div>

                        <div className="pod-price-zone">
                          <span className="pod-price-value">{offer.price}</span>
                          <span className="pod-price-unit">/ساعة</span>
                        </div>
                      </div>

                      <p className="pod-teacher-bio">{offer.bio}</p>

                      {acceptedOfferId === offer.id ? (
                        <div className="pod-contact-zone">
                          <div className="pod-contact-method">
                            <div className="pod-contact-icon-bg">
                              <span className="material-symbols-outlined">
                                call
                              </span>
                            </div>
                            <div>
                              <p className="pod-contact-label">رقم التواصل</p>
                              <p className="pod-contact-number" dir="ltr">
                                {offer.contact?.phone}
                              </p>
                            </div>
                          </div>

                          <div className="pod-contact-actions">
                            <button className="pod-btn pod-btn-secondary">
                              عرض الملف الشخصي
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pod-action-buttons-row">
                          <button
                            className="pod-btn pod-btn-primary"
                            disabled={!isClosed}
                            title={!isClosed ? "يجب إغلاق الطلب أولاً" : ""}
                            onClick={() => setAcceptedOfferId(offer.id)}
                          >
                            قبول العرض
                          </button>

                          <button
                            className="pod-btn pod-btn-danger"
                            onClick={() => handleRejectOffer(offer.id)}
                          >
                            رفض العرض
                          </button>

                          <button className="pod-btn pod-btn-secondary">
                            عرض الملف الشخصي
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

        <section className="pld-session-info-bar">
          <div className="pld-info-block">
            <div className="pld-block-icon">
              <span className="material-symbols-outlined">laptop_mac</span>
            </div>

            <div>
              <div className="pld-block-label">نوع الحصة ونظامها</div>
              <div className="pld-block-value">{lead.typeAndSystem}</div>
            </div>
          </div>

          <div className="pld-vertical-divider"></div>

          <div className="pld-info-block">
            <div className="pld-block-icon">
              <span className="material-symbols-outlined">update</span>
            </div>

            <div>
              <div className="pld-block-label">تاريخ الاستجابة المتوقع</div>
              <div className="pld-block-value">{lead.expectedResponseTime}</div>
            </div>
          </div>
        </section>

        <section className="pld-card pld-contact-section">
          <div className="pld-footer-actions">
            <button
              className="pld-btn-secondary pld-text-danger"
              onClick={() => setShowCancelModal(true)}
            >
              <span className="material-symbols-outlined">cancel</span>
              إلغاء الطلب
            </button>

            <button className="pld-btn-secondary">
              <span className="material-symbols-outlined">edit</span>
              تعديل الطلب
            </button>

            {orderStatus !== "pending" && (
              <button className="pld-btn-secondary" onClick={handleCloseOrder}>
                <span className="material-symbols-outlined">lock</span>
                إغلاق الطلب
              </button>
            )}
          </div>
        </section>
      </main>

      {showCancelModal && (
        <div className="pod-modal-overlay">
          <div className="pod-modal">
            <h3>تأكيد إلغاء الطلب</h3>

            <p>
              هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ لا يمكن التراجع بعد
              الإلغاء.
            </p>

            <div className="pod-modal-actions">
              <button
                className="pod-btn pod-btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                تراجع
              </button>

              <button
                className="pod-btn pod-btn-danger"
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
