import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import { abortTutorRegistration } from '../utils/tutorRegistrationFlow';
import '../styles/TutorRegistrationActions.css';

export default function TutorRegistrationActions({
  onPrimary,
  primaryLabel = 'متابعة للخطوة التالية',
  isSubmitting = false,
  backTo = null,
  backLabel = 'رجوع',
  showCancel = true,
  cancelRedirectTo = '/',
}) {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const busy = isSubmitting || isCancelling;

  const handleCancel = async () => {
    const confirmed = window.confirm(
      'هل تريد إلغاء التسجيل؟ سيتم حذف البيانات المؤقتة ولن يُنشأ حساب.'
    );
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await abortTutorRegistration();
      navigate(cancelRedirectTo);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="reg-actions">
      <button
        type="button"
        className="reg-actions__primary"
        onClick={onPrimary}
        disabled={busy}
      >
        <FaArrowRight aria-hidden />
        {isSubmitting ? 'جارِ الإرسال...' : primaryLabel}
      </button>

      {(backTo || showCancel) && (
        <div className="reg-actions__secondary">
          {backTo && (
            <button
              type="button"
              className="reg-actions__back"
              onClick={() => navigate(backTo)}
              disabled={busy}
            >
              <FaArrowLeft aria-hidden />
              {backLabel}
            </button>
          )}
          {showCancel && (
            <button
              type="button"
              className="reg-actions__cancel"
              onClick={handleCancel}
              disabled={busy}
            >
              <FaTimes aria-hidden />
              {isCancelling ? 'جارِ الإلغاء...' : 'إلغاء التسجيل'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
