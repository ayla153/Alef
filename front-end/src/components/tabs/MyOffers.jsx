import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import OfferHubSourceTabs from '../offerHub/OfferHubSourceTabs';
import OfferHubPreviewSection from '../offerHub/OfferHubPreviewSection';
import OfferHubDetailPanel from '../offerHub/OfferHubDetailPanel';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import { getTutorInbox, getTutorOffers } from '../../api/tutorLeads';
import { getMyProfile } from '../../api/tutorProfile';
import { getErrorMessage } from '../../utils/apiErrors';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';
import {
  HUB_FILTERS,
  buildOfferHubItems,
  filterHubItems,
  computeHubStats,
  resolveFocusKey,
} from '../../utils/offerHub';

export default function MyOffers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const leadIdParam = searchParams.get('leadId');
  const filterParam = searchParams.get('filter') || '';
  const sourceParam = searchParams.get('source') || '';

  const [offers, setOffers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [tutorPhone, setTutorPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState(filterParam);
  const [sourceFilter, setSourceFilter] = useState(sourceParam);
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
    if (sourceParam) setSourceFilter(sourceParam);
  }, [filterParam, sourceParam]);

  const enrichedInbox = useMemo(
    () => inbox.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [inbox, subjectsMap, levelsMap]
  );

  const allItems = useMemo(
    () => buildOfferHubItems(offers, enrichedInbox, subjectsMap, levelsMap),
    [offers, enrichedInbox, subjectsMap, levelsMap]
  );

  const stats = useMemo(() => computeHubStats(allItems), [allItems]);

  const visibleItems = useMemo(
    () => filterHubItems(allItems, outcomeFilter, sourceFilter),
    [allItems, outcomeFilter, sourceFilter]
  );

  const privateItems = useMemo(
    () => visibleItems.filter((item) => item.source === 'private'),
    [visibleItems]
  );

  const publicItems = useMemo(
    () => visibleItems.filter((item) => item.source === 'public'),
    [visibleItems]
  );

  const focusKey = useMemo(
    () => resolveFocusKey(allItems, { leadId: leadIdParam }),
    [allItems, leadIdParam]
  );

  const activeKey = selectedKey || focusKey;
  const selectedItem = visibleItems.find((i) => i.key === activeKey)
    || allItems.find((i) => i.key === activeKey)
    || null;

  useEffect(() => {
    if (focusKey && !selectedKey) setSelectedKey(focusKey);
  }, [focusKey, selectedKey]);

  const syncParams = (nextSource, nextOutcome) => {
    const next = new URLSearchParams(searchParams);
    if (nextSource) next.set('source', nextSource);
    else next.delete('source');
    if (nextOutcome) next.set('filter', nextOutcome);
    else next.delete('filter');
    next.delete('leadId');
    setSearchParams(next, { replace: true });
  };

  const handleSourceChange = (value) => {
    setSourceFilter(value);
    setSelectedKey(null);
    syncParams(value, outcomeFilter);
  };

  const handleOutcomeChange = (value) => {
    setOutcomeFilter(value);
    setSelectedKey(null);
    syncParams(sourceFilter, value);
  };

  const emptyMessage = () => {
    if (sourceFilter === 'private') return 'لا توجد طلبات خاصة في هذا القسم بعد.';
    if (sourceFilter === 'public') return 'لم تقدّم عروضاً على الطلبات العامة بعد.';
    if (outcomeFilter) return 'لا توجد عناصر بهذه الحالة.';
    return 'صندوقك فارغ — قدّم عروضاً أو وافق على طلبات خاصة.';
  };

  return (
    <div className="page-container2 ohub-page-root">
      <div className="requests-tab-container ohub-page">
        <div className="ohub-hero">
          <div className="tab-page-header">
            <h2>صندوق العروض والتواصل</h2>
            <p>طلبات خاصة وعروض عامة — معاينة سريعة ثم التفاصيل الكاملة</p>
          </div>
          {!isLoading && allItems.length > 0 && (
            <OfferHubSourceTabs
              stats={stats}
              activeSource={sourceFilter}
              onChange={handleSourceChange}
            />
          )}
        </div>

        {!isLoading && allItems.length > 0 && (
          <div className="ohub-outcome-pills">
            {HUB_FILTERS.map((f) => (
              <button
                key={f.value || 'all'}
                type="button"
                className={`contacts-pill ${outcomeFilter === f.value ? 'active' : ''}`}
                onClick={() => handleOutcomeChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && <p className="loading-text">جارِ تحميل الصندوق...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && !error && allItems.length === 0 && (
          <div className="contacts-empty ohub-empty">
            <strong>صندوقك فارغ</strong>
            <p>تصفّح الطلبات العامة أو رد على طلبات خاصة من صندوق رسائلك.</p>
          </div>
        )}

        {!isLoading && allItems.length > 0 && visibleItems.length === 0 && (
          <div className="contacts-empty ohub-empty">
            <strong>{emptyMessage()}</strong>
          </div>
        )}

        {!isLoading && visibleItems.length > 0 && (
          <div className="ohub-workspace">
            <section className="ohub-preview-grid-wrap">
              {!sourceFilter && (
                <p className="ohub-grid-label">
                  {visibleItems.length} عنصر · قسمين منفصلين للخاص والعام
                </p>
              )}
              {sourceFilter === 'private' && (
                <OfferHubPreviewSection
                  source="private"
                  items={privateItems}
                  activeKey={activeKey}
                  onOpenDetails={(i) => setSelectedKey(i.key)}
                />
              )}
              {sourceFilter === 'public' && (
                <OfferHubPreviewSection
                  source="public"
                  items={publicItems}
                  activeKey={activeKey}
                  onOpenDetails={(i) => setSelectedKey(i.key)}
                />
              )}
              {!sourceFilter && (
                <>
                  <OfferHubPreviewSection
                    source="private"
                    items={privateItems}
                    activeKey={activeKey}
                    onOpenDetails={(i) => setSelectedKey(i.key)}
                  />
                  <OfferHubPreviewSection
                    source="public"
                    items={publicItems}
                    activeKey={activeKey}
                    onOpenDetails={(i) => setSelectedKey(i.key)}
                  />
                </>
              )}
            </section>

            <aside className="ohub-detail-aside">
              <OfferHubDetailPanel
                item={selectedItem}
                tutorPhone={tutorPhone}
                onClose={() => setSelectedKey(null)}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
