// src/pages/tutor/Requests.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import RequestCard from '../../components/RequestCard';
import OfferModalNew from '../../components/OfferModalNew';
import AcceptContactModal from '../../components/AcceptContactModal';
import '../../styles/Requests.css';
import { browsePubicLeads, getTutorInbox, submitOffer, acceptPrivateContact } from '../../api/tutorLeads';
import { getSubjects, getLevels } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import { filterAndSortLeads } from '../../utils/requestFilters';

let subjectsCache = null;
let levelsCache = null;

function mapPublicLead(lead) {
  return { ...lead, isPrivate: false };
}

function mapPrivateLead(lead) {
  return { ...lead, isPrivate: true };
}

const DEFAULT_FILTERS = {
  filterType: 'all',
  subjectId: '',
  levelId: '',
  budgetMin: '',
  budgetMax: '',
  availableOnly: false,
  sortBy: 'newest',
};

export default function Requests({ initialFilter = null, onFilterApplied }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { leadId: leadIdParam } = useParams();
  const focusLeadId = leadIdParam ? Number(leadIdParam) : null;

  const [publicLeads, setPublicLeads] = useState([]);
  const [privateLeads, setPrivateLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedOfferLead, setSelectedOfferLead] = useState(null);
  const [selectedContactLead, setSelectedContactLead] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});
  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);

  const isMounted = useRef(true);
  const hasAppliedFilter = useRef(false);
  const hasAppliedFocus = useRef(false);

  useEffect(() => {
    if (focusLeadId && !hasAppliedFocus.current) {
      setFilters(DEFAULT_FILTERS);
      hasAppliedFocus.current = true;
    }
    if (!focusLeadId) {
      hasAppliedFocus.current = false;
    }
  }, [focusLeadId]);

  useEffect(() => {
    const filterFromRoute = location.state?.filter;
    const filter = initialFilter || filterFromRoute;
    if (filter && !hasAppliedFilter.current) {
      setFilters((prev) => ({ ...prev, filterType: filter }));
      hasAppliedFilter.current = true;
      onFilterApplied?.();
    }
  }, [location.state, initialFilter, onFilterApplied]);

  const fetchCatalog = useCallback(async () => {
    try {
      if (!subjectsCache) {
        const subjectsRes = await getSubjects();
        const map = {};
        subjectsRes.data.forEach((sub) => {
          map[sub.subject_id] = sub.subject_title;
        });
        subjectsCache = map;
        setSubjectsList(subjectsRes.data);
      } else {
        setSubjectsList(
          Object.entries(subjectsCache).map(([id, title]) => ({
            subject_id: Number(id),
            subject_title: title,
          }))
        );
      }
      setSubjectsMap(subjectsCache);

      if (!levelsCache) {
        const levelsRes = await getLevels();
        const map = {};
        levelsRes.data.forEach((level) => {
          map[level.level_id] = level.level_title;
        });
        levelsCache = map;
        setLevelsList(levelsRes.data);
      } else {
        setLevelsList(
          Object.entries(levelsCache).map(([id, title]) => ({
            level_id: Number(id),
            level_title: title,
          }))
        );
      }
      setLevelsMap(levelsCache);
    } catch (err) {
      console.warn('فشل جلب المواد/المستويات:', err);
    }
  }, []);

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

  useEffect(() => {
    let ignore = false;
    isMounted.current = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      await fetchCatalog();
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

  const enrichLead = useCallback(
    (lead) => ({
      ...lead,
      subjectTitle: subjectsMap[lead.subject_id] || null,
      levelTitle: levelsMap[lead.level_id] || null,
    }),
    [subjectsMap, levelsMap]
  );

  const enrichedPublic = useMemo(
    () => publicLeads.map(enrichLead),
    [publicLeads, enrichLead]
  );
  const enrichedPrivate = useMemo(
    () => privateLeads.map(enrichLead),
    [privateLeads, enrichLead]
  );

  const mergedLeads = useMemo(() => {
    const list = [
      ...(filters.filterType !== 'private' ? enrichedPublic : []),
      ...(filters.filterType !== 'public' ? enrichedPrivate : []),
    ];
    return filterAndSortLeads(list, filters);
  }, [enrichedPublic, enrichedPrivate, filters]);

  const allLoadedLeads = useMemo(
    () => [...enrichedPublic, ...enrichedPrivate],
    [enrichedPublic, enrichedPrivate]
  );

  const focusedLead = focusLeadId
    ? allLoadedLeads.find((l) => l.post_requirements_id === focusLeadId)
    : null;

  useEffect(() => {
    if (!focusLeadId || isLoading) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(`lead-card-${focusLeadId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [focusLeadId, isLoading, mergedLeads.length]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const findLeadById = (leadId) =>
    [...enrichedPublic, ...enrichedPrivate].find(
      (l) => l.post_requirements_id === leadId
    );

  const handleOpenOfferModal = (leadId) => {
    const lead = findLeadById(leadId);
    if (lead) setSelectedOfferLead(lead);
  };

  const handleOpenContactModal = (leadId) => {
    const lead = findLeadById(leadId);
    if (lead) setSelectedContactLead(lead);
  };

  const refreshLeads = async () => {
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

  const handleAcceptContact = async (leadId, data) => {
    try {
      await acceptPrivateContact(leadId, data);
      setSelectedContactLead(null);
      await refreshLeads();
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const handleSubmitOffer = async (leadId, data) => {
    try {
      await submitOffer(leadId, data);
      setSelectedOfferLead(null);
      await refreshLeads();
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const activeFilterCount = [
    filters.filterType !== 'all',
    filters.subjectId,
    filters.levelId,
    filters.budgetMin,
    filters.budgetMax,
    filters.availableOnly,
    filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="filters-panel">
          <div className="filters-row filters-row-primary">
            <select
              value={filters.filterType}
              onChange={(e) => updateFilter('filterType', e.target.value)}
              aria-label="نوع الطلب"
            >
              <option value="all">جميع الطلبات</option>
              <option value="public">طلبات عامة</option>
              <option value="private">طلبات خاصة بي</option>
            </select>

            <select
              value={filters.subjectId}
              onChange={(e) => updateFilter('subjectId', e.target.value)}
              aria-label="المادة"
            >
              <option value="">كل المواد</option>
              {subjectsList.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_title}
                </option>
              ))}
            </select>

            <select
              value={filters.levelId}
              onChange={(e) => updateFilter('levelId', e.target.value)}
              aria-label="المستوى"
            >
              <option value="">كل المستويات</option>
              {levelsList.map((level) => (
                <option key={level.level_id} value={level.level_id}>
                  {level.level_title}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              aria-label="الترتيب"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="slots_filling">الأقرب للامتلاء</option>
            </select>
          </div>

          <div className="filters-row filters-row-secondary">
            <div className="budget-filter">
              <label className="budget-label">الميزانية (ل.س)</label>
              <input
                type="number"
                min="0"
                placeholder="من"
                value={filters.budgetMin}
                onChange={(e) => updateFilter('budgetMin', e.target.value)}
                aria-label="الحد الأدنى للميزانية"
              />
              <span className="budget-sep">–</span>
              <input
                type="number"
                min="0"
                placeholder="إلى"
                value={filters.budgetMax}
                onChange={(e) => updateFilter('budgetMax', e.target.value)}
                aria-label="الحد الأعلى للميزانية"
              />
            </div>

            <label className="available-only-toggle">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => updateFilter('availableOnly', e.target.checked)}
              />
              <span>متاح فقط</span>
            </label>

            <button
              type="button"
              className="reset-btn"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
            >
              إعادة ضبط{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>

        {!isLoading && mergedLeads.length > 0 && (
          <p className="results-count">
            {mergedLeads.length} طلب
            {activeFilterCount > 0 ? ' (بعد التصفية)' : ''}
          </p>
        )}

        {!isLoading && focusLeadId && !focusedLead && (
          <p className="lead-focus-missing">
            الطلب #{focusLeadId} غير متاح حالياً (ربما أُغلق أو لا يطابق موادك).
            <button type="button" className="lead-focus-back" onClick={() => navigate('/dashboard/requests')}>
              عرض جميع الطلبات
            </button>
          </p>
        )}

        {focusLeadId && focusedLead && (
          <div className="lead-focus-banner">
            <span>تفاصيل الطلب #{focusLeadId}</span>
            <button type="button" className="lead-focus-back" onClick={() => navigate('/dashboard/requests')}>
              عرض الكل
            </button>
          </div>
        )}

        {isLoading && <p className="loading-text">جارِ تحميل الطلبات...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && (
          <div className="requests-grid">
            {mergedLeads.length > 0 ? (
              mergedLeads.map((lead) => (
                <div
                  key={`${lead.isPrivate ? 'priv' : 'pub'}-${lead.post_requirements_id}`}
                  id={`lead-card-${lead.post_requirements_id}`}
                  className={
                    focusLeadId === lead.post_requirements_id ? 'lead-card-wrap lead-card-focused' : 'lead-card-wrap'
                  }
                >
                  <RequestCard
                    request={lead}
                    onSubmitOffer={!lead.isPrivate ? handleOpenOfferModal : undefined}
                    onAcceptContact={lead.isPrivate ? handleOpenContactModal : undefined}
                  />
                </div>
              ))
            ) : (
              <p className="no-results">
                {activeFilterCount > 0
                  ? 'لا توجد طلبات تطابق الفلاتر المحددة.'
                  : 'لا توجد طلبات حالياً.'}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedOfferLead && (
        <OfferModalNew
          lead={selectedOfferLead}
          onClose={() => setSelectedOfferLead(null)}
          onSubmit={handleSubmitOffer}
        />
      )}

      {selectedContactLead && (
        <AcceptContactModal
          lead={selectedContactLead}
          onClose={() => setSelectedContactLead(null)}
          onSubmit={handleAcceptContact}
        />
      )}
    </div>
  );
}
