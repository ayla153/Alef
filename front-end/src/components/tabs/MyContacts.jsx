import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import ContactSidebarItem from '../ContactSidebarItem';
import ContactLeadDetailPanel from '../ContactLeadDetailPanel';
import '../../styles/Requests.css';
import '../../styles/StudentContacts.css';
import { getTutorInbox, getTutorOffers } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';
import { fetchTutorCatalog, enrichLeadWithCatalog } from '../../utils/tutorCatalog';
import { buildTutorContacts } from '../../utils/tutorContacts';

const SOURCE_FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'private', label: 'طلبات خاصة' },
  { value: 'public', label: 'طلبات عامة' },
];

export default function MyContacts() {
  const navigate = useNavigate();
  const { leadId: leadIdParam } = useParams();
  const focusLeadId = leadIdParam ? Number(leadIdParam) : null;

  const [inbox, setInbox] = useState([]);
  const [offers, setOffers] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [levelsMap, setLevelsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [catalog, inboxRes, offersRes] = await Promise.all([
          fetchTutorCatalog(),
          getTutorInbox(),
          getTutorOffers(),
        ]);
        if (ignore) return;
        setSubjectsMap(catalog.subjectsMap);
        setLevelsMap(catalog.levelsMap);
        setInbox(inboxRes.data || []);
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

  const enrichedInbox = useMemo(
    () => inbox.map((lead) => enrichLeadWithCatalog(lead, subjectsMap, levelsMap)),
    [inbox, subjectsMap, levelsMap]
  );

  const allContacts = useMemo(
    () => buildTutorContacts(inbox, offers, subjectsMap, levelsMap),
    [inbox, offers, subjectsMap, levelsMap]
  );

  const visibleContacts = useMemo(() => {
    if (!sourceFilter) return allContacts;
    return allContacts.filter((c) => c.source === sourceFilter);
  }, [allContacts, sourceFilter]);

  useEffect(() => {
    if (!visibleContacts.length) {
      setSelectedKey(null);
      return;
    }
    if (focusLeadId) {
      const match = visibleContacts.find((c) => c.leadId === focusLeadId);
      if (match) {
        setSelectedKey(match.key);
        return;
      }
    }
    setSelectedKey((prev) => {
      if (prev && visibleContacts.some((c) => c.key === prev)) return prev;
      return visibleContacts[0].key;
    });
  }, [visibleContacts, focusLeadId]);

  const selectedContact = visibleContacts.find((c) => c.key === selectedKey) || null;

  const selectedPrivateLead = selectedContact?.source === 'private'
    ? enrichedInbox.find((l) => l.post_requirements_id === selectedContact.leadId)
    : null;

  const selectedPublicOffer = selectedContact?.source === 'public'
    ? offers.find((o) => o.post_requirements_id === selectedContact.leadId)
    : null;

  const handleSelectContact = (contact) => {
    setSelectedKey(contact.key);
    navigate(`/dashboard/private-requests/contacts/${contact.leadId}`, { replace: true });
  };

  return (
    <div className="page-container2">
      <div className="requests-tab-container">
        <div className="tab-page-header contacts-full-header">
          <div>
            <h2>تواصلي الكامل</h2>
            <p>كل أرقام الطلاب — اختر اسماً لعرض تفاصيل الطلب بجانب القائمة</p>
          </div>
          <button
            type="button"
            className="contacts-back-btn"
            onClick={() => navigate('/dashboard/private-requests')}
          >
            <FaArrowRight /> العودة للطلبات الخاصة
          </button>
        </div>

        <div className="contacts-status-pills">
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              className={`contacts-pill ${sourceFilter === f.value ? 'active' : ''}`}
              onClick={() => setSourceFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="loading-text">جارِ التحميل...</p>}
        {error && <p className="error-text">{error}</p>}

        {!isLoading && !error && visibleContacts.length === 0 && (
          <div className="contacts-empty">
            <strong>لا توجد أرقام بعد</strong>
            <p>عندما توافق على طلب خاص أو يختارك طالب من العروض العامة، يظهر رقمه هنا.</p>
          </div>
        )}

        {!isLoading && visibleContacts.length > 0 && (
          <div className="contacts-split-layout">
            <section className="contacts-split-detail">
              <ContactLeadDetailPanel
                contact={selectedContact}
                privateLead={selectedPrivateLead}
                publicOffer={selectedPublicOffer}
              />
            </section>
            <aside className="contacts-split-list">
              <p className="contacts-split-list-title">
                {visibleContacts.length} جهة اتصال
              </p>
              <div className="contacts-split-items">
                {visibleContacts.map((contact) => (
                  <ContactSidebarItem
                    key={contact.key}
                    contact={contact}
                    selected={selectedKey === contact.key}
                    onClick={() => handleSelectContact(contact)}
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
