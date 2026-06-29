import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaperPlane, FaInbox } from 'react-icons/fa';
import OfferHubSourceTabs from '../offerHub/OfferHubSourceTabs';
import ContactInboxList from '../offerHub/ContactInboxList';
import '../../styles/Requests.css';
import '../../styles/MyOffers.css';
import { getTutorInbox, getTutorOffers } from '../../api/tutorLeads';
import { getMyProfile } from '../../api/tutorProfile';
import { getErrorMessage } from '../../utils/apiErrors';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';
import {
  buildContactHubItems,
  computeHubStats,
} from '../../utils/offerHub';

export default function MyOffers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const leadIdParam = searchParams.get('leadId');
  const sourceParam = searchParams.get('source') || '';
  const focusLeadId = leadIdParam ? Number(leadIdParam) : null;

  const [offers, setOffers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [tutorPhone, setTutorPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceFilter, setSourceFilter] = useState(sourceParam);
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
    setSourceFilter(sourceParam);
  }, [sourceParam]);

  const enrichedInbox = useMemo(
    () => inbox.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [inbox, subjectsMap, levelsMap]
  );

  const allItems = useMemo(
    () => buildContactHubItems(offers, enrichedInbox, subjectsMap, levelsMap),
    [offers, enrichedInbox, subjectsMap, levelsMap]
  );

  const stats = useMemo(() => computeHubStats(allItems), [allItems]);

  const visibleItems = useMemo(() => {
    if (!sourceFilter) return allItems;
    return allItems.filter((item) => item.source === sourceFilter);
  }, [allItems, sourceFilter]);

  const privateItems = useMemo(
    () => visibleItems.filter((item) => item.source === 'private'),
    [visibleItems]
  );

  const publicItems = useMemo(
    () => visibleItems.filter((item) => item.source === 'public'),
    [visibleItems]
  );

  useEffect(() => {
    if (!focusLeadId || isLoading) return;
    const el = document.getElementById(`contact-${focusLeadId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusLeadId, isLoading, visibleItems.length]);

  const handleSourceChange = (value) => {
    setSourceFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('source', value);
    else next.delete('source');
    next.delete('leadId');
    next.delete('filter');
    setSearchParams(next, { replace: true });
  };

  const emptyMessage = () => {
    if (sourceFilter === 'private') return 'لا يوجد تواصل خاص بعد — عندما يقبل طالب رقمك يظهر هنا.';
    if (sourceFilter === 'public') return 'لا يوجد تواصل على عروض عامة بعد.';
    return 'لا يوجد تواصل بعد — عندما يتبادل الطلاب الأرقام معك يظهر هنا.';
  };

  return (
    <div className="page-container2 ohub-page-root inbox-page-root">
      <div className="requests-tab-container ohub-page inbox-page">
        <div className="ohub-hero inbox-hero">
          <div className="ohub-hero-top">
            <div className="tab-page-header">
              <h2><FaInbox className="inbox-hero-icon" /> صندوق التواصل</h2>
              <p>قائمة أفقية — كل تواصل مع رقم الطالب وتفاصيله مباشرة</p>
            </div>
            <button
              type="button"
              className="ohub-sent-link-btn"
              onClick={() => navigate('/dashboard/offers/sent')}
            >
              <FaPaperPlane /> عروضي المرسلة
            </button>
          </div>
          {!isLoading && allItems.length > 0 && (
            <OfferHubSourceTabs
              stats={stats}
              activeSource={sourceFilter}
              onChange={handleSourceChange}
            />
          )}
        </div>

        {isLoading && <p className="loading-text">جارِ تحميل صندوق التواصل...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && !error && allItems.length === 0 && (
          <div className="contacts-empty ohub-empty">
            <strong>صندوق التواصل فارغ</strong>
            <p>عندما يقبل طالب عرضك أو يشارك رقمه، يظهر هنا كبطاقة عرضية.</p>
            <button
              type="button"
              className="ohub-sent-link-btn"
              onClick={() => navigate('/dashboard/offers/sent')}
            >
              <FaPaperPlane /> شوف عروضك المرسلة
            </button>
          </div>
        )}

        {!isLoading && allItems.length > 0 && visibleItems.length === 0 && (
          <div className="contacts-empty ohub-empty">
            <strong>{emptyMessage()}</strong>
          </div>
        )}

        {!isLoading && visibleItems.length > 0 && (
          <div className="inbox-feed">
            {!sourceFilter && (
              <p className="inbox-feed-label">{visibleItems.length} تواصل</p>
            )}
            {(sourceFilter === 'private' || !sourceFilter) && (
              <ContactInboxList
                source="private"
                items={privateItems}
                tutorPhone={tutorPhone}
                focusLeadId={focusLeadId}
              />
            )}
            {(sourceFilter === 'public' || !sourceFilter) && (
              <ContactInboxList
                source="public"
                items={publicItems}
                tutorPhone={tutorPhone}
                focusLeadId={focusLeadId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
