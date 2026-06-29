// src/components/OfferModalNew.jsx
import { useState } from 'react';
import {
  FaTimes,
  FaPaperPlane,
  FaMoneyBillWave,
  FaFileAlt,
  FaBook,
  FaChalkboard,
  FaClock,
  FaUserGraduate,
  FaTag,
  FaClipboardList,
} from 'react-icons/fa';
import '../styles/OfferModalNew.css';

export default function OfferModalNew({ lead, onClose, onSubmit }) {
  const [fee, setFee] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tuitionLabel = (type) => {
    const map = {
      online: 'أونلاين',
      offline: 'حضوري',
      both: 'أونلاين وحضوري',
    };
    return map[type] || 'غير محدد';
  };

  const handleSubmit = async () => {
    // جميع الحقول مطلوبة حسب الباك إند (OfferIn)
    if (!fee || !note || !message) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(lead.post_requirements_id, {
        proposed_fee: Number(fee),
        first_session_note: note,
        message,
      });
      // سيتم الإغلاق والتحديث من خارج المودال
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مجدداً');
      setLoading(false);
    }
  };

  return (
    <div className="offer-modal-overlay" onClick={onClose}>
      <div className="offer-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* ─── رأس المودال ─── */}
        <div className="offer-modal-header">
          <h2>
            <FaPaperPlane className="header-icon" /> تقديم عرض جديد
          </h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        {/* ─── تفاصيل الطلب ─── */}
        <div className="offer-lead-card">
          <div className="lead-title-row">
            <FaClipboardList className="info-icon" />
            <span className="lead-title">{lead.title}</span>
          </div>
          {lead.description && (
            <div className="offer-lead-description">
              <span className="description-label">تفاصيل الطلب:</span>
              <p className="description-body">{lead.description}</p>
            </div>
          )}
          <div className="lead-details-grid">
            <div className="detail-item">
              <FaBook className="detail-icon" />
              <span className="detail-label">المادة:</span>
              <span className="detail-value">{lead.subjectTitle || 'غير محدد'}</span>
            </div>
            {lead.levelTitle && (
              <div className="detail-item">
                <FaUserGraduate className="detail-icon" />
                <span className="detail-label">المستوى:</span>
                <span className="detail-value">{lead.levelTitle}</span>
              </div>
            )}
            <div className="detail-item">
              <FaMoneyBillWave className="detail-icon" />
              <span className="detail-label">الميزانية المتوقعة:</span>
              <span className="detail-value">
                {lead.min_expected_fee?.toLocaleString()} – {lead.max_expected_fee?.toLocaleString()} ل.س
              </span>
            </div>
            <div className="detail-item">
              <FaChalkboard className="detail-icon" />
              <span className="detail-label">طريقة التدريس:</span>
              <span className="detail-value">{tuitionLabel(lead.tution_type)}</span>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon" />
              <span className="detail-label">عدد الحصص:</span>
              <span className="detail-value">{lead.weekly_classes} حصة/أسبوع</span>
            </div>
            <div className="detail-item">
              <FaTag className="detail-icon" />
              <span className="detail-label">نوع المساعدة:</span>
              <span className="detail-value">{lead.help_type}</span>
            </div>
          </div>
          {lead.description && (
            <div className="offer-lead-description">
              <span className="offer-lead-description-label">تفاصيل الطلب</span>
              <p className="offer-lead-description-text">{lead.description}</p>
            </div>
          )}
        </div>

        <hr className="modal-divider" />

        {/* ─── حقول النموذج ─── */}
        <div className="offer-form">
          <div className="form-group">
            <label>
              <FaMoneyBillWave className="field-icon" /> الأجر المقترح (ل.س) <span className="required-star">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="مثال: 150000"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>
              <FaFileAlt className="field-icon" /> ملاحظة الحصة الأولى <span className="required-star">*</span>
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="ماذا ستغطي في الحصة الأولى؟"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>
              <FaPaperPlane className="field-icon" /> رسالة إلى الطالب <span className="required-star">*</span>
            </label>
            <textarea
              rows="3"
              maxLength={500}
              placeholder="اكتب رسالة ترحيب أو توضيح..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>

        {/* ─── أزرار الإجراء ─── */}
        <div className="offer-modal-actions">
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            <FaPaperPlane /> {loading ? 'جارٍ الإرسال...' : 'إرسال العرض'}
          </button>
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}