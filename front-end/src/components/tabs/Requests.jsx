// src/pages/tutor/Requests.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import RequestCard from '../../components/RequestCard';
import OfferModalNew from '../../components/OfferModalNew';
import '../../styles/Requests.css';
import { browsePubicLeads, getTutorInbox, submitOffer, acceptPrivateContact } from '../../api/tutorLeads';
import { getErrorMessage } from '../../utils/apiErrors';

function mapPublicLead(lead) {
  return { ...lead, isPrivate: false, subjectTitle: null, levelTitle: null };
}

function mapPrivateLead(lead) {
  return { ...lead, isPrivate: true, subjectTitle: null, levelTitle: null };
}

export default function Requests() {
  const [publicLeads, setPublicLeads] = useState([]);
  const [privateLeads, setPrivateLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  const isMounted = useRef(true);

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
  }, [fetchLeads]);

  const handleOpenOfferModal = (leadId) => {
    const allLeads = [...publicLeads, ...privateLeads];
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
    ...(filterType !== 'private' ? publicLeads : []),
    ...(filterType !== 'public' ? privateLeads : []),
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