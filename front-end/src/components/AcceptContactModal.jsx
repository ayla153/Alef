import { useState } from 'react';
import {
  FaTimes,
  FaCheckCircle,
  FaMoneyBillWave,
  FaFileAlt,
  FaPaperPlane,
  FaBook,
  FaUserGraduate,
  FaClipboardList,
  FaExclamationTriangle,
} from 'react-icons/fa';
import '../styles/OfferModalNew.css';

export default function AcceptContactModal({ lead, onClose, onSubmit }) {
  const [fee, setFee] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {};
      if (fee !== '') payload.proposed_fee = Number(fee);
      if (note.trim()) payload.first_session_note = note.trim();
      if (message.trim()) payload.message = message.trim();
      await onSubmit(lead.post_requirements_id, Object.keys(payload).length ? payload : null);
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مجدداً');
      setLoading(false);
    }
  };

  return (
    <div className="offer-modal-overlay" onClick={onClose}>
      <div className="offer-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="offer-modal-header">
          <h2>
            <FaCheckCircle className="header-icon" style={{ color: '#10b981' }} /> تأكيد قبول التواصل
          </h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        <div className="accept-contact-warning">
          <FaExclamationTriangle className="warning-icon" />
          <p>
            هذا طلب خاص موجّه إليك
            {lead.student_name ? ` من ${lead.student_name}` : ''}.
            بالموافقة، سيتم مشاركة بيانات التواصل مع الطالب وإغلاق الطلب.
          </p>
        </div>

        <div className="offer-lead-card">
          <div className="lead-title-row">
            <FaClipboardList className="info-icon" />
            <span className="lead-title">{lead.title}</span>
          </div>
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
            {lead.min_expected_fee != null && lead.max_expected_fee != null && (
              <div className="detail-item">
                <FaMoneyBillWave className="detail-icon" />
                <span className="detail-label">الميزانية:</span>
                <span className="detail-value">
                  {lead.min_expected_fee.toLocaleString('ar-SA')} –{' '}
                  {lead.max_expected_fee.toLocaleString('ar-SA')} ل.س
                </span>
              </div>
            )}
          </div>
          {lead.description && (
            <div className="offer-lead-description">
              <span className="offer-lead-description-label">تفاصيل الطلب</span>
              <p className="offer-lead-description-text">{lead.description}</p>
            </div>
          )}
        </div>

        <hr className="modal-divider" />

        <div className="offer-form">
          <p className="optional-fields-hint">الحقول التالية اختيارية — يمكنك تركها فارغة:</p>
          <div className="form-group">
            <label>
              <FaMoneyBillWave className="field-icon" /> الأجر المقترح (ل.س)
            </label>
            <input
              type="number"
              min="0"
              placeholder={`مثال: ${lead.max_expected_fee?.toLocaleString('ar-SA') || '150000'}`}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>
              <FaFileAlt className="field-icon" /> ملاحظة الحصة الأولى
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
              <FaPaperPlane className="field-icon" /> رسالة إلى الطالب
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

        <div className="offer-modal-actions">
          <button
            className="submit-btn accept-contact-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            <FaCheckCircle /> {loading ? 'جارٍ التأكيد...' : 'نعم، أوافق على التواصل'}
          </button>
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            <FaTimes /> إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
