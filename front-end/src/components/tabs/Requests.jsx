// src/pages/tutor/Requests.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import RequestCard from '../../components/RequestCard';
import OfferModalNew from '../../components/OfferModalNew';
import '../../styles/Requests.css';
import { browsePubicLeads, getTutorInbox, submitOffer, acceptPrivateContact } from '../../api/tutorLeads';
import { getSubjects } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';

// تخزين المواد محلياً
let subjectsCache = null;

function mapPublicLead(lead) {
  return { ...lead, isPrivate: false };
}

function mapPrivateLead(lead) {
  return { ...lead, isPrivate: true };
}

export default function Requests() {
  const [publicLeads, setPublicLeads] = useState([]);
  const [privateLeads, setPrivateLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});

  const isMounted = useRef(true);

  // ─── جلب المواد من الباك إند ──────────────────────────────
  const fetchSubjects = useCallback(async () => {
    if (subjectsCache) {
      setSubjectsMap(subjectsCache);
      return;
    }
    try {
      const res = await getSubjects();
      const map = {};
      res.data.forEach((sub) => {
        map[sub.subject_id] = sub.subject_title;
      });
      subjectsCache = map;
      setSubjectsMap(map);
      console.log('📚 المواد التي تم جلبها:', map); // للتحقق
    } catch (err) {
      console.warn('فشل جلب المواد:', err);
    }
  }, []);

  // ─── جلب الطلبات ──────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const [browseRes, inboxRes] = await Promise.all([
        browsePubicLeads(),
        getTutorInbox(),
      ]);
      return {
        public: (browseRes.data || []).map(mapPublicLead),
        private: (inboxRes.data || []).map(mapPrivateLead),
        error: null,
      };
    } catch (err) {
      return { public: [], private: [], error: getErrorMessage(err) };
    }
  }, []);

  // ─── تحميل البيانات ──────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    isMounted.current = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      await fetchSubjects();

      const result = await fetchLeads();

      if (!ignore && isMounted.current) {
        if (result.error) {
          setError(result.error);
        } else {
          setPublicLeads(result.public);
          setPrivateLeads(result.private);
        }
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      ignore = true;
      isMounted.current = false;
    };
  }, [fetchLeads, fetchSubjects]);

  // ─── إثراء البيانات بأسماء المواد ──────────────────────
  const enrichLead = (lead) => {
    // 🔥 التحقق من وجود subject_id واستخدامه للحصول على الاسم
    const subjectTitle = lead.subject_id && subjectsMap[lead.subject_id] 
      ? subjectsMap[lead.subject_id] 
      : null;
    
    // 🔥 إذا كان هناك subjectTitle من الباك إند مباشرة، نستخدمه
    const finalSubjectTitle = subjectTitle || lead.subjectTitle || null;

    console.log('🔍 إثراء الطلب:', {
      id: lead.post_requirements_id,
      subject_id: lead.subject_id,
      subjectTitle_from_map: subjectTitle,
      subjectTitle_from_lead: lead.subjectTitle,
      final_subjectTitle: finalSubjectTitle,
    });

    return {
      ...lead,
      subjectTitle: finalSubjectTitle,
      levelTitle: lead.levelTitle || null,
    };
  };

  const enrichedPublic = publicLeads.map(enrichLead);
  const enrichedPrivate = privateLeads.map(enrichLead);

  const handleOpenOfferModal = (leadId) => {
    const allLeads = [...enrichedPublic, ...enrichedPrivate];
    const lead = allLeads.find((l) => l.post_requirements_id === leadId);
    if (lead) setSelectedLead(lead);
  };

  const handleSubmitOffer = async (leadId, data) => {
    await submitOffer(leadId, data);
    setSelectedLead(null);
    const result = await fetchLeads();
    if (isMounted.current) {
      if (result.error) {
        setError(result.error);
      } else {
        setPublicLeads(result.public);
        setPrivateLeads(result.private);
      }
      setIsLoading(false);
    }
  };

  const handleAcceptContact = async (leadId) => {
    try {
      await acceptPrivateContact(leadId, null);
      const result = await fetchLeads();
      if (isMounted.current) {
        if (result.error) {
          setError(result.error);
        } else {
          setPublicLeads(result.public);
          setPrivateLeads(result.private);
        }
        setIsLoading(false);
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const visibleLeads = [
    ...(filterType !== 'private' ? enrichedPublic : []),
    ...(filterType !== 'public' ? enrichedPrivate : []),
  ];

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="filters-bar">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">جميع الطلبات</option>
            <option value="public">طلبات عامة</option>
            <option value="private">طلبات خاصة بي</option>
          </select>
          <button className="reset-btn" onClick={() => setFilterType('all')}>
            إعادة ضبط
          </button>
        </div>

        {isLoading && <p className="loading-text">جارِ تحميل الطلبات...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && (
          <div className="requests-grid">
            {visibleLeads.length > 0 ? (
              visibleLeads.map((lead) => (
                <RequestCard
                  key={`${lead.isPrivate ? 'priv' : 'pub'}-${lead.post_requirements_id}`}
                  request={lead}
                  onSubmitOffer={!lead.isPrivate ? handleOpenOfferModal : undefined}
                  onAcceptContact={lead.isPrivate ? handleAcceptContact : undefined}
                />
              ))
            ) : (
              <p className="no-results">لا توجد طلبات حالياً.</p>
            )}
          </div>
        )}
      </div>

      {selectedLead && (
        <OfferModalNew
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSubmit={handleSubmitOffer}
        />
      )}
    </div>
  );
}