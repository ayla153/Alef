// src/components/tabs/Requests.jsx — public marketplace only
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicRequestCard from '../PublicRequestCard';
import PublicRequestDetail from '../PublicRequestDetail';
import OfferModalNew from '../OfferModalNew';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import { browsePubicLeads, browsePublicLeadDetail, submitOffer } from '../../api/tutorLeads';
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
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
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

  useEffect(() => {
    if (!focusLeadId) {
      setDetailLead(null);
      setDetailError('');
      return undefined;
    }

    let ignore = false;
    setDetailLoading(true);
    setDetailError('');

    browsePublicLeadDetail(focusLeadId)
      .then((res) => {
        if (!ignore) setDetailLead(res.data);
      })
      .catch((err) => {
        if (!ignore) setDetailError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setDetailLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [focusLeadId]);

  const enrichedLeads = useMemo(
    () => leads.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [leads, subjectsMap, levelsMap]
  );

  const enrichedDetailLead = useMemo(() => {
    if (!detailLead) return null;
    return enrichLeadWithCatalog(detailLead, subjectsMap, levelsMap);
  }, [detailLead, subjectsMap, levelsMap]);

  const visibleLeads = useMemo(
    () => filterAndSortLeads(enrichedLeads, filters),
    [enrichedLeads, filters]
  );

  const refreshLeads = async () => {
    const result = await fetchLeads();
    if (isMounted.current) {
      if (result.error) setError(result.error);
      else setLeads(result.items);
      setIsLoading(false);
    }
  };

  const refreshDetail = async (leadId) => {
    try {
      const res = await browsePublicLeadDetail(leadId);
      if (isMounted.current) setDetailLead(res.data);
    } catch (err) {
      if (isMounted.current) setDetailError(getErrorMessage(err));
    }
  };

  const handleViewDetails = (leadId) => {
    navigate(`/dashboard/requests/${leadId}`);
  };

  const handleOpenOfferModal = (leadId) => {
    const lead = enrichedDetailLead?.post_requirements_id === leadId
      ? enrichedDetailLead
      : enrichedLeads.find((l) => l.post_requirements_id === leadId);
    if (lead) setSelectedOfferLead(lead);
  };

  const handleSubmitOffer = async (leadId, data) => {
    try {
      await submitOffer(leadId, data);
      setSelectedOfferLead(null);
      await refreshLeads();
      if (focusLeadId) await refreshDetail(focusLeadId);
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

  if (focusLeadId) {
    return (
      <div className="page-container2">
        <div className="requests-tab-container">
          {detailError && <p className="error-text">{detailError}</p>}
          <PublicRequestDetail
            lead={enrichedDetailLead}
            isLoading={detailLoading}
            onBack={() => navigate('/dashboard/requests')}
            onSubmitOffer={handleOpenOfferModal}
          />
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

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="tab-page-header">
          <h2>الطلبات العامة</h2>
          <p>تصفّح الطلبات المفتوحة — اضغط على أي طلب لعرض التفاصيل الكاملة وتقديم عرض</p>
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

        {isLoading && <p className="loading-text">جارِ تحميل الطلبات...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && (
          <div className="requests-grid requests-grid-compact">
            {visibleLeads.length > 0 ? (
              visibleLeads.map((lead) => (
                <PublicRequestCard
                  key={lead.post_requirements_id}
                  request={lead}
                  onViewDetails={handleViewDetails}
                />
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
