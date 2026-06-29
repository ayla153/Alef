import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OfferHubListItem from '../OfferHubListItem';
import OfferHubDetailPanel from '../OfferHubDetailPanel';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import '../../styles/StudentContacts.css';
import { getTutorInbox, getTutorOffers } from '../../api/tutorLeads';
import { getMyProfile } from '../../api/tutorProfile';
import { getErrorMessage } from '../../utils/apiErrors';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';
import {
  HUB_FILTERS,
  buildOfferHubItems,
  filterHubItems,
  hubFilterCount,
  resolveHubSelectKey,
} from '../../utils/offerHub';

export default function MyOffers() {
  const navigate = useNavigate();
  const { selectKey: selectKeyParam } = useParams();
  const [searchParams] = useSearchParams();
  const leadIdParam = searchParams.get('leadId');
  const filterParam = searchParams.get('filter');

  const [offers, setOffers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [tutorPhone, setTutorPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState(filterParam || '');
  const [selectedKey, setSelectedKey] = useState(null);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [catalog, inboxRes, offersRes, profileRes] = await Promise.all([
          fetchTutorCatalog(),
          getTutorInbox(),
          getTutorOffers(),
          getMyProfile(),
        ]);
        if (ignore) return;
        setSubjectsMap(catalog.subjectsMap);
        setLevelsMap(catalog.levelsMap);
        setInbox(inboxRes.data || []);
        setOffers(offersRes.data || []);
        setTutorPhone(profileRes.data?.phone_number || '');
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

  useEffect(() => {
    if (filterParam) setOutcomeFilter(filterParam);
  }, [filterParam]);

  const enrichedInbox = useMemo(
    () => inbox.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [inbox, subjectsMap, levelsMap]
  );

  const allItems = useMemo(
    () => buildOfferHubItems(offers, enrichedInbox, subjectsMap, levelsMap),
    [offers, enrichedInbox, subjectsMap, levelsMap]
  );

  const visibleItems = useMemo(
    () => filterHubItems(allItems, outcomeFilter),
    [allItems, outcomeFilter]
  );

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedKey(null);
      return;
    }
    const resolved = resolveHubSelectKey(visibleItems, {
      selectKey: selectKeyParam,
      leadId: leadIdParam,
    });
    setSelectedKey(resolved);
  }, [visibleItems, selectKeyParam, leadIdParam]);

  const selectedItem = visibleItems.find((item) => item.key === selectedKey) || null;

  const handleSelectItem = (item) => {
    setSelectedKey(item.key);
    navigate(`/dashboard/offers/${item.key}`, { replace: true });
  };

  const handleFilterChange = (value) => {
    setOutcomeFilter(value);
    navigate('/dashboard/offers', { replace: true });
  };

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="tab-page-header">
          <h2>عروضي وتواصلي</h2>
          <p>
            تابع عروضك على الطلبات العامة، وعندما يختارك طالب أو توافق على طلب خاص — تظهر أرقامكم هنا
          </p>
        </div>

        <div className="filters-panel pr-filters-panel ohub-filters-panel">
          <div className="pr-filters-top ohub-filters-top">
            <div className="contacts-status-pills pr-status-pills">
              {HUB_FILTERS.map((f) => {
                const count = hubFilterCount(allItems, f.value);
                return (
                  <button
                    key={f.value || 'all'}
                    type="button"
                    className={`contacts-pill ${outcomeFilter === f.value ? 'active' : ''}`}
                    onClick={() => handleFilterChange(f.value)}
                  >
                    {f.label}
                    {count > 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading && <p className="loading-text">جارِ تحميل عروضك...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && !error && visibleItems.length === 0 && (
          <div className="contacts-empty ohub-empty">
            <strong>
              {outcomeFilter
                ? 'لا توجد عناصر بهذه الحالة.'
                : 'لم تقدّم أي عروض بعد'}
            </strong>
            <p>
              {outcomeFilter
                ? 'جرّبي فلتراً آخر أو تصفّحي الطلبات العامة.'
                : 'تصفّحي الطلبات العامة وقدّمي عرضك — وعندما يختارك طالب يظهر رقمه هنا.'}
            </p>
          </div>
        )}

        {!isLoading && visibleItems.length > 0 && (
          <div className="contacts-split-layout ohub-split-layout">
            <section className="contacts-split-detail">
              <OfferHubDetailPanel item={selectedItem} tutorPhone={tutorPhone} />
            </section>
            <aside className="contacts-split-list">
              <p className="contacts-split-list-title">
                {visibleItems.length} {outcomeFilter === 'contact_shared' ? 'جهة اتصال' : 'عرض'}
              </p>
              <div className="contacts-split-items">
                {visibleItems.map((item) => (
                  <OfferHubListItem
                    key={item.key}
                    item={item}
                    selected={selectedKey === item.key}
                    onClick={() => handleSelectItem(item)}
                  />
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
