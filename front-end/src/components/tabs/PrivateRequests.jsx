import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrivateRequestCard from '../PrivateRequestCard';
import RecentContactsSidebar from '../RecentContactsSidebar';
import AcceptContactModal from '../AcceptContactModal';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import '../../styles/StudentContacts.css';
import { getTutorInbox, acceptPrivateContact } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';
import { filterAndSortLeads } from '../../utils/requestFilters';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';
import { buildTutorContacts } from '../../utils/tutorContacts';

const DEFAULT_FILTERS = {
  subjectId: '',
  levelId: '',
  budgetMin: '',
  budgetMax: '',
  sortBy: 'newest',
};

const STATUS_TABS = [
  { value: 'open', label: 'بانتظار ردك' },
  { value: 'all', label: 'الكل' },
];

export default function PrivateRequests() {
  const navigate = useNavigate();
  const { leadId: leadIdParam } = useParams();
  const focusLeadId = leadIdParam ? Number(leadIdParam) : null;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [statusTab, setStatusTab] = useState('open');
  const [selectedContactLead, setSelectedContactLead] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});
  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);

  const isMounted = useRef(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await getTutorInbox();
      return {
        items: (res.data || []).map((lead) => ({ ...lead, isPrivate: true })),
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

  const visibleLeads = useMemo(() => {
    const filtered = filterAndSortLeads(enrichedLeads, filters);
    if (statusTab === 'open') {
      return filtered.filter((l) => l.lead_status === 'open');
    }
    return filtered;
  }, [enrichedLeads, filters, statusTab]);

  const privateContacts = useMemo(
    () => buildTutorContacts(
      enrichedLeads.filter((l) => l.lead_status === 'closed_matched'),
      [],
      subjectsMap,
      levelsMap
    ),
    [enrichedLeads, subjectsMap, levelsMap]
  );

  const openCount = useMemo(
    () => enrichedLeads.filter((l) => l.lead_status === 'open').length,
    [enrichedLeads]
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

  const handleOpenContactModal = (leadId) => {
    const lead = enrichedLeads.find((l) => l.post_requirements_id === leadId);
    if (lead) setSelectedContactLead(lead);
  };

  const handleAcceptContact = async (leadId, data) => {
    try {
      await acceptPrivateContact(leadId, data);
      setSelectedContactLead(null);
      await refreshLeads();
      navigate(`/dashboard/private-requests/contacts/${leadId}`);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const goToFullContacts = (leadId) => {
    navigate(leadId
      ? `/dashboard/private-requests/contacts/${leadId}`
      : '/dashboard/private-requests/contacts');
  };

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="tab-page-header">
          <h2>صندوق رسائلك الخاصة</h2>
          <p>طلاب اختاروك شخصياً — رد على الجديد من هنا، والأرقام على يسار الصفحة</p>
        </div>

        <div className="pr-page-layout">
          <div className="pr-main-column">
            <div className="contacts-status-pills">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`contacts-pill ${statusTab === tab.value ? 'active' : ''}`}
                  onClick={() => setStatusTab(tab.value)}
                >
                  {tab.label}
                  {tab.value === 'open' && openCount > 0 && ` (${openCount})`}
                </button>
              ))}
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
                </select>
              </div>
            </div>

            {focusLeadId && !isLoading && !focusedLead && (
              <p className="lead-focus-missing">
                الطلب #{focusLeadId} غير موجود في طلباتك الخاصة.
                <button
                  type="button"
                  className="lead-focus-back"
                  onClick={() => navigate('/dashboard/private-requests')}
                >
                  عرض الكل
                </button>
              </p>
            )}

            {focusLeadId && focusedLead && (
              <div className="lead-focus-banner">
                <span>تفاصيل الطلب الخاص #{focusLeadId}</span>
                <button
                  type="button"
                  className="lead-focus-back"
                  onClick={() => navigate('/dashboard/private-requests')}
                >
                  عرض الكل
                </button>
              </div>
            )}

            {isLoading && <p className="loading-text">جارِ تحميل الطلبات...</p>}
            {error && <p className="error-text">{error}</p>}

            {!isLoading && (
              <div className="private-requests-list">
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
                      <PrivateRequestCard
                        request={lead}
                        onAcceptContact={handleOpenContactModal}
                        onGoToContacts={
                          lead.lead_status === 'closed_matched'
                            ? () => goToFullContacts(lead.post_requirements_id)
                            : undefined
                        }
                      />
                    </div>
                  ))
                ) : (
                  <p className="no-results">
                    {statusTab === 'open'
                      ? 'لا توجد رسائل جديدة بانتظار ردك.'
                      : 'لا توجد رسائل خاصة موجهة إليك حالياً.'}
                  </p>
                )}
              </div>
            )}
          </div>

          <RecentContactsSidebar
            contacts={privateContacts}
            onViewAll={() => goToFullContacts()}
            onSelectContact={(c) => goToFullContacts(c.leadId)}
          />
        </div>
      </div>

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
