import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import OfferCard from '../OfferCard';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import { getTutorOffers } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';

const OUTCOME_FILTERS = [
  { value: '', label: 'كل العروض' },
  { value: 'pending', label: 'معلّقة' },
  { value: 'contact_shared', label: 'تم التواصل' },
  { value: 'rejected', label: 'مرفوضة' },
  { value: 'lead_closed_empty', label: 'طلب أُغلق' },
  { value: 'lead_closed_expired', label: 'طلب منتهٍ' },
];

export default function MyOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [catalog, offersRes] = await Promise.all([
          fetchTutorCatalog(),
          getTutorOffers(),
        ]);
        if (ignore) return;
        setSubjectsMap(catalog.subjectsMap);
        setLevelsMap(catalog.levelsMap);
        setOffers(offersRes.data || []);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const enrichedOffers = useMemo(
    () =>
      offers.map((offer) => {
        const enriched = enrichLeadWithCatalog(
          {
            subject_id: offer.subject_id,
            level_id: offer.level_id,
          },
          subjectsMap,
          levelsMap
        );
        return {
          ...offer,
          subjectTitle: enriched.subjectTitle,
          levelTitle: enriched.levelTitle,
        };
      }),
    [offers, subjectsMap, levelsMap]
  );

  const visibleOffers = useMemo(() => {
    if (!outcomeFilter) return enrichedOffers;
    return enrichedOffers.filter((o) => o.outcome === outcomeFilter);
  }, [enrichedOffers, outcomeFilter]);

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="tab-page-header">
          <h2>عروضي</h2>
          <p>كل العروض التي قدّمتها على الطلبات العامة ومتابعة حالتها</p>
        </div>

        <div className="filters-panel">
          <div className="filters-row filters-row-primary">
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              aria-label="حالة العرض"
            >
              {OUTCOME_FILTERS.map((f) => (
                <option key={f.value || 'all'} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isLoading && visibleOffers.length > 0 && (
          <p className="results-count">{visibleOffers.length} عرض</p>
        )}

        {isLoading && <p className="loading-text">جارِ تحميل عروضك...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && (
          <div className="requests-grid">
            {visibleOffers.length > 0 ? (
              visibleOffers.map((offer) => (
                <OfferCard
                  key={offer.lead_application_id}
                  offer={offer}
                  onViewLead={(leadId) => navigate(`/dashboard/requests/${leadId}`)}
                />
              ))
            ) : (
              <p className="no-results">
                {outcomeFilter
                  ? 'لا توجد عروض بهذه الحالة.'
                  : 'لم تقدّم أي عروض بعد. تصفّح الطلبات العامة وقدّم عرضك.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
