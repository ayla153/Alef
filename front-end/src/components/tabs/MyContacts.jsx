import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Legacy route — redirects to unified عروضي وتواصلي hub. */
export default function MyContacts() {
  const navigate = useNavigate();
  const { leadId } = useParams();

  useEffect(() => {
    if (leadId) {
      navigate(`/dashboard/offers?leadId=${leadId}`, { replace: true });
    } else {
      navigate('/dashboard/offers', { replace: true });
    }
  }, [leadId, navigate]);

  return null;
}
