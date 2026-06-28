// src/pages/tutor/Requests.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import RequestCard from '../../components/RequestCard';
import OfferModalNew from '../../components/OfferModalNew';
import '../../styles/Requests.css';
import { browsePubicLeads, getTutorInbox, submitOffer, acceptPrivateContact } from '../../api/tutorLeads';
import { getSubjects, getLevels } from '../../api/tutorRegistration'; // ✅ تم إضافة getLevels
import { getErrorMessage } from '../../utils/apiErrors';

// تخزين مؤقت للمواد والمستويات
let subjectsCache = null;
let levelsCache = null;

function mapPublicLead(lead) {
  return { ...lead, isPrivate: false };
}

function mapPrivateLead(lead) {
  return { ...lead, isPrivate: true };
}

export default function Requests() {
  const location = useLocation();

  const [publicLeads, setPublicLeads] = useState([]);
  const [privateLeads, setPrivateLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});

  const isMounted = useRef(true);
  const hasAppliedFilter = useRef(false);

  // ─── قراءة الفلتر من الـ state ──────────────────────────────────────────
  useEffect(() => {
    if (location.state?.filter && !hasAppliedFilter.current) {
      setFilterType(location.state.filter);
      hasAppliedFilter.current = true;
    }
  }, [location.state]);

  // ─── جلب المواد والمستويات ──────────────────────────────────────────────
  const fetchCatalog = useCallback(async () => {
    try {
      // جلب المواد
      if (!subjectsCache) {
        const subjectsRes = await getSubjects();
        const map = {};
        subjectsRes.data.forEach((sub) => {
          map[sub.subject_id] = sub.subject_title;
        });
        subjectsCache = map;
      }
      setSubjectsMap(subjectsCache);

      // جلب المستويات
      if (!levelsCache) {
        const levelsRes = await getLevels(); // ✅ الآن getLevels معرف
        const map = {};
        levelsRes.data.forEach((level) => {
          map[level.level_id] = level.level_title;
        });
        levelsCache = map;
      }
      setLevelsMap(levelsCache);
    } catch (err) {
      console.warn('فشل جلب المواد/المستويات:', err);
    }
  }, []);

  // ─── جلب الطلبات ──────────────────────────────────────────────────────────
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

  // ─── تحميل البيانات ──────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    isMounted.current = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      // جلب المواد والمستويات أولاً
      await fetchCatalog();

      // ثم جلب الطلبات
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
  }, [fetchLeads, fetchCatalog]);

  // ─── إثراء البيانات بأسماء المواد والمستويات ──────────────────────────
  const enrichLead = (lead) => {
    // جلب اسم المادة من الخريطة باستخدام subject_id
    const subjectName = subjectsMap[lead.subject_id] || null;
    // جلب اسم المستوى من الخريطة باستخدام level_id
    const levelName = levelsMap[lead.level_id] || null;

    return {
      ...lead,
      subjectTitle: subjectName,
      levelTitle: levelName,
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