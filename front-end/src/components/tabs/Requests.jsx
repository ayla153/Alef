import { useState, useEffect, useCallback } from 'react';
import RequestCard from '../RequestCard';
import '../../styles/Requests.css';
import { browsePubicLeads, getTutorInbox, submitOffer, acceptPrivateContact } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';

// ─── تحويل LeadBrowseCardOut → شكل RequestCard ───────────────────────────
function mapPublicLead(lead) {
  return {
    ...lead,
    isPrivate: false,
    subjectTitle: null,  // LeadBrowseCardOut لا يحمل عنوان المادة، فقط subject_id
    levelTitle: null,
  };
}

// ─── تحويل LeadOut (inbox) → شكل RequestCard ─────────────────────────────
function mapPrivateLead(lead) {
  return {
    ...lead,
    isPrivate: true,
    subjectTitle: null,
    levelTitle: null,
  };
}

// ─── Modal تقديم عرض بسيط ────────────────────────────────────────────────
function OfferModal({ leadId, onClose, onSuccess }) {
  const [form, setForm] = useState({ proposed_fee: '', first_session_note: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.proposed_fee || !form.first_session_note || !form.message) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitOffer(leadId, {
        proposed_fee: Number(form.proposed_fee),
        first_session_note: form.first_session_note,
        message: form.message,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>تقديم عرض</h3>
        {error && <p className="error-text">{error}</p>}
        <div className="modal-field">
          <label>الأجر المقترح (ل.س)</label>
          <input
            type="number"
            min="0"
            value={form.proposed_fee}
            onChange={(e) => setForm((p) => ({ ...p, proposed_fee: e.target.value }))}
          />
        </div>
        <div className="modal-field">
          <label>ملاحظة الحصة الأولى</label>
          <input
            type="text"
            maxLength={200}
            value={form.first_session_note}
            onChange={(e) => setForm((p) => ({ ...p, first_session_note: e.target.value }))}
          />
        </div>
        <div className="modal-field">
          <label>رسالة</label>
          <textarea
            maxLength={500}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          />
        </div>
        <div className="modal-actions">
          <button className="action-btn offer-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'جارِ الإرسال...' : 'إرسال العرض'}
          </button>
          <button className="action-btn cancel-btn-sm" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────────────────
export default function Requests() {
  const [publicLeads, setPublicLeads]   = useState([]);
  const [privateLeads, setPrivateLeads] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState('');

  const [filterType, setFilterType]     = useState('all'); // all | public | private
  const [offerModal, setOfferModal]     = useState(null);  // leadId | null

  // ─── جلب البيانات ───────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [browseRes, inboxRes] = await Promise.all([
        browsePubicLeads(),
        getTutorInbox(),
      ]);
      setPublicLeads((browseRes.data  || []).map(mapPublicLead));
      setPrivateLeads((inboxRes.data  || []).map(mapPrivateLead));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(fetchLeads, 0);
    return () => clearTimeout(id);
  }, [fetchLeads]);

  // ─── قبول تواصل خاص ────────────────────────────────────────────────────
  const handleAcceptContact = async (leadId) => {
    try {
      await acceptPrivateContact(leadId, null);
      await fetchLeads(); // تحديث القائمة بعد القبول
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // ─── تصفية ──────────────────────────────────────────────────────────────
  const visibleLeads = [
    ...(filterType !== 'private' ? publicLeads  : []),
    ...(filterType !== 'public'  ? privateLeads : []),
  ];

  return (
    <div className="page-container2">
      <div className="requests-tab-container">

        {/* شريط الفلاتر */}
        <div className="filters-bar">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">جميع الطلبات</option>
            <option value="public">طلبات عامة</option>
            <option value="private">طلبات خاصة بي</option>
          </select>
          <button className="reset-btn" onClick={() => setFilterType('all')}>إعادة ضبط</button>
        </div>

        {/* حالات التحميل والخطأ */}
        {isLoading && <p className="loading-text">جارِ تحميل الطلبات...</p>}
        {error    && <p className="error-text">{error}</p>}

        {/* شبكة البطاقات */}
        {!isLoading && (
          <div className="requests-grid">
            {visibleLeads.length > 0 ? (
              visibleLeads.map((lead) => (
                <RequestCard
                  key={`${lead.isPrivate ? 'priv' : 'pub'}-${lead.post_requirements_id}`}
                  request={lead}
                  onSubmitOffer={!lead.isPrivate ? (id) => setOfferModal(id) : undefined}
                  onAcceptContact={lead.isPrivate ? handleAcceptContact : undefined}
                />
              ))
            ) : (
              <p className="no-results">لا توجد طلبات حالياً.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal تقديم عرض */}
      {offerModal && (
        <OfferModal
          leadId={offerModal}
          onClose={() => setOfferModal(null)}
          onSuccess={() => {
            setOfferModal(null);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}