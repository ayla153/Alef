import {
  FaArrowRight,
  FaBook,
  FaCalendarAlt,
  FaChalkboard,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaGlobe,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaRegFileAlt,
  FaTag,
  FaUserGraduate,
  FaVenusMars,
  FaBriefcase,
  FaUsers,
} from 'react-icons/fa';
import '../styles/PublicRequestDetail.css';
import {
  tuitionTypeAr,
  genderPrefAr,
  leadStatusAr,
  translateSubject,
  translateLevel,
  formatCurrency,
  formatDate,
} from '../utils/translations';

const statusInfo = (lead) => {
  if (!lead.accepting_applications) {
    return { label: 'الأماكن ممتلئة', cls: 'slots-full', icon: FaExclamationCircle };
  }
  if (lead.lead_status === 'open') {
    return { label: leadStatusAr.open, cls: 'open', icon: FaCheckCircle };
  }
  return {
    label: leadStatusAr[lead.lead_status] || lead.lead_status,
    cls: 'closed',
    icon: FaExclamationCircle,
  };
};

export default function PublicRequestDetail({
  lead,
  onBack,
  onSubmitOffer,
  isLoading,
}) {
  if (isLoading) {
    return <p className="prd-loading">جارِ تحميل تفاصيل الطلب...</p>;
  }

  if (!lead) return null;

  const {
    post_requirements_id,
    title,
    description,
    foundation_tution,
    tution_type,
    help_type,
    min_expected_fee,
    max_expected_fee,
    weekly_classes,
    created_at,
    preferred_gender,
    subjectTitle,
    levelTitle,
    accepting_applications,
    pending_offer_count,
    max_applications,
    lead_status,
    expired_at,
    peer_offers = [],
    has_my_offer,
  } = lead;

  const translatedSubject = subjectTitle ? translateSubject(subjectTitle) : 'غير محددة';
  const translatedLevel = levelTitle ? translateLevel(levelTitle) : '';
  const { label: statusLabel, cls: statusClass, icon: StatusIcon } = statusInfo(lead);
  const isOpen = lead_status === 'open' && accepting_applications && !has_my_offer;

  const budgetDisplay =
    min_expected_fee != null && max_expected_fee != null
      ? `${formatCurrency(min_expected_fee)} – ${formatCurrency(max_expected_fee)}`
      : 'غير محدد';

  const tuitionText = tuitionTypeAr[tution_type] || tution_type || 'غير محدد';
  const genderText = preferred_gender ? genderPrefAr[preferred_gender] || preferred_gender : null;

  return (
    <div className="public-request-detail">
      <button type="button" className="prd-back" onClick={onBack}>
        <FaArrowRight /> العودة للطلبات
      </button>

      <div className={`prd-header-card ${statusClass}`}>
        <div className="prd-header-top">
          <span className="prd-type"><FaGlobe /> طلب عام #{post_requirements_id}</span>
          <span className={`prd-status ${statusClass}`}>
            <StatusIcon /> {statusLabel}
          </span>
        </div>
        <h2>{title}</h2>
        <div className="prd-subject-row">
          <span><FaBook /> {translatedSubject}{translatedLevel ? ` — ${translatedLevel}` : ''}</span>
          {foundation_tution && (
            <span className="prd-foundation"><FaTag /> تأسيس</span>
          )}
        </div>
      </div>

      {description && (
        <section className="prd-section">
          <h3>تفاصيل الطلب</h3>
          <p className="prd-description">{description}</p>
        </section>
      )}

      <section className="prd-section prd-grid-section">
        <h3>معلومات الطلب</h3>
        <div className="prd-info-grid">
          <div className="prd-info-item">
            <FaChalkboard /> <span>طريقة التدريس</span>
            <strong>{tuitionText}</strong>
          </div>
          <div className="prd-info-item">
            <FaClock /> <span>عدد الحصص</span>
            <strong>{weekly_classes} حصة/أسبوع</strong>
          </div>
          <div className="prd-info-item">
            <FaRegFileAlt /> <span>نوع المساعدة</span>
            <strong>{help_type || 'غير محدد'}</strong>
          </div>
          {genderText && (
            <div className="prd-info-item">
              <FaVenusMars /> <span>الجنس المفضل</span>
              <strong>{genderText}</strong>
            </div>
          )}
          <div className="prd-info-item">
            <FaMoneyBillWave /> <span>الميزانية المتوقعة</span>
            <strong>{budgetDisplay}</strong>
          </div>
          <div className="prd-info-item">
            <FaBriefcase /> <span>العروض المقدمة</span>
            <strong>{pending_offer_count ?? 0} / {max_applications ?? '∞'}</strong>
          </div>
          <div className="prd-info-item">
            <FaCalendarAlt /> <span>تاريخ النشر</span>
            <strong>{formatDate(created_at)}</strong>
          </div>
          {expired_at && (
            <div className="prd-info-item">
              <FaHourglassHalf /> <span>ينتهي في</span>
              <strong>{formatDate(expired_at)}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="prd-section prd-peer-section">
        <h3>
          <FaUsers /> عروض الأساتذة الآخرين
          <span className="prd-peer-count">{peer_offers.length}</span>
        </h3>
        {peer_offers.length === 0 ? (
          <p className="prd-peer-empty">لا يوجد عروض من أساتذة آخرين على هذا الطلب بعد.</p>
        ) : (
          <ul className="prd-peer-list">
            {peer_offers.map((offer, idx) => (
              <li key={`${offer.tutor_first_name}-${idx}`} className="prd-peer-item">
                <div className="prd-peer-name">
                  <FaUserGraduate /> أ. {offer.tutor_first_name}
                </div>
                <p className="prd-peer-message">{offer.message}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="prd-peer-note">تُعرض الأسماء والرسائل فقط — بدون السعر.</p>
      </section>

      <div className="prd-actions">
        {has_my_offer && (
          <div className="prd-my-offer-badge">
            <FaCheckCircle /> قدّمت عرضاً على هذا الطلب — تابعه من «عروضي»
          </div>
        )}
        {isOpen && onSubmitOffer && (
          <button
            type="button"
            className="prd-offer-btn"
            onClick={() => onSubmitOffer(post_requirements_id)}
          >
            <FaMoneyBillWave /> تقديم عرض
          </button>
        )}
      </div>
    </div>
  );
}
