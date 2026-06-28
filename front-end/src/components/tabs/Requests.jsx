// src/components/tabs/Requests.jsx — public marketplace only
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RequestCard from '../RequestCard';
import OfferModalNew from '../OfferModalNew';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import { browsePubicLeads, submitOffer } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';
import { filterAndSortLeads } from '../../utils/requestFilters';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';

const DEFAULT_FILTERS = {
  subjectId: '',
  levelId: '',
  budgetMin: '',
  budgetMax: '',
  availableOnly: false,
  sortBy: 'newest',
};

export default function Requests() {
  const navigate = useNavigate();
  const { leadId: leadIdParam } = useParams();
  const focusLeadId = leadIdParam ? Number(leadIdParam) : null;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedOfferLead, setSelectedOfferLead] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});
  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);

  const isMounted = useRef(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await browsePubicLeads();
      return {
        items: (res.data || []).map((lead) => ({ ...lead, isPrivate: false })),
        error: null,
      };
    } catch (err) {
      return { items: [], error: getErrorMessage(err) };
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    isMounted.current = true;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const catalog = await fetchTutorCatalog();
        if (ignore) return;
        setSubjectsMap(catalog.subjectsMap);
        setLevelsMap(catalog.levelsMap);
        setSubjectsList(catalog.subjectsList);
        setLevelsList(catalog.levelsList);

        const result = await fetchLeads();
        if (!ignore && isMounted.current) {
          if (result.error) setError(result.error);
          else setLeads(result.items);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      ignore = true;
      isMounted.current = false;
    };
  }, [fetchLeads]);

  const enrichedLeads = useMemo(
    () => leads.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [leads, subjectsMap, levelsMap]
  );

  const visibleLeads = useMemo(
    () => filterAndSortLeads(enrichedLeads, filters),
    [enrichedLeads, filters]
  );

  const focusedLead = focusLeadId
    ? enrichedLeads.find((l) => l.post_requirements_id === focusLeadId)
    : null;

  useEffect(() => {
    if (!focusLeadId || isLoading) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`lead-card-${focusLeadId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [focusLeadId, isLoading, visibleLeads.length]);

  const refreshLeads = async () => {
    const result = await fetchLeads();
    if (isMounted.current) {
      if (result.error) setError(result.error);
      else setLeads(result.items);
      setIsLoading(false);
    }
  };

  const handleOpenOfferModal = (leadId) => {
    const lead = enrichedLeads.find((l) => l.post_requirements_id === leadId);
    if (lead) setSelectedOfferLead(lead);
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

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = [
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
        <div className="tab-page-header">
          <h2>الطلبات العامة</h2>
          <p>تصفّح الطلبات المفتوحة وقدّم عروضك — بعد التقديم تتابعها من تبويب «عروضي»</p>
        </div>

        <div className="filters-panel">
          <div className="filters-row filters-row-primary">
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
              />
              <span className="budget-sep">–</span>
              <input
                type="number"
                min="0"
                placeholder="إلى"
                value={filters.budgetMax}
                onChange={(e) => updateFilter('budgetMax', e.target.value)}
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

        {!isLoading && visibleLeads.length > 0 && (
          <p className="results-count">
            {visibleLeads.length} طلب{activeFilterCount > 0 ? ' (بعد التصفية)' : ''}
          </p>
        )}

        {focusLeadId && !isLoading && !focusedLead && (
          <p className="lead-focus-missing">
            الطلب #{focusLeadId} غير متاح حالياً.
            <button type="button" className="lead-focus-back" onClick={() => navigate('/dashboard/requests')}>
              عرض الكل
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
            {visibleLeads.length > 0 ? (
              visibleLeads.map((lead) => (
                <div
                  key={lead.post_requirements_id}
                  id={`lead-card-${lead.post_requirements_id}`}
                  className={
                    focusLeadId === lead.post_requirements_id
                      ? 'lead-card-wrap lead-card-focused'
                      : 'lead-card-wrap'
                  }
                >
                  <RequestCard
                    request={lead}
                    onSubmitOffer={handleOpenOfferModal}
                  />
                </div>
              ))
            ) : (
              <p className="no-results">
                {activeFilterCount > 0
                  ? 'لا توجد طلبات تطابق الفلاتر.'
                  : 'لا توجد طلبات عامة متاحة حالياً.'}
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
    </div>
  );
}
