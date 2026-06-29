import '../../styles/CreateAccountStep4.css';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaFileAlt } from "react-icons/fa";
import { useState } from 'react';
import { registerTutorStep4 } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';
import TutorRegistrationActions from '../../components/TutorRegistrationActions';

export default function CreateAccountStep4() {
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    setGeneralError('');
    setIsSubmitting(true);
    try {
      await registerTutorStep4({
        bio: bio.trim() || null,
        tutor_photo_url: null,
        tutor_video_url: null,
        certificate_url: null, // الشهادة غير مطلوبة
      });

      localStorage.setItem('registration_type', 'tutor');
      // يمكن حفظ البريد الإلكتروني إذا ورد من الرد
      // لكن لا يوجد response.data?.email هنا لأن الـ API لا تعيده حالياً
      // يمكن الاحتفاظ به لو كان موجوداً
      navigate('/otp');
    } catch (err) {
      setGeneralError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className='page-container2'>
        <header className="steponeheader">
          <Header />
        </header>
        <div className='content'>
          <div className="titleforstep1">
            <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
            <p className="welcom">اكتب نبذة عنك</p>
            <div className="progress-bar-wrapper">
              <p className="personalinfo">الخطوةُ 4 من 4 : التفاصيل المهنية</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className='step4content'>
            <div className='stp4tc'>
              <div className='stp4Title'>اللمسات الأخيرة</div>
              <div className='stp4Subtitle'>نبذة عنك تساعدك على التميز أمام الطلاب.</div>
            </div>

            <div className='advicesforCV'>
              <div className='titleforadvices'><FaLightbulb className="bulb-icon" /> كتابة نبذة مميزة</div>
              <div className='advices'>
                <div className='adivceTitle'>نتائج ملموسة للطلاب</div>
                <div>ساعدت طالباً من مستوى ضعيف إلى امتياز خلال 3 أشهر فقط.</div>
                <div>رفعت مستوى طلابي 30% زيادة خلال شهر</div>
              </div>
              <div className='advices'>
                <div className='adivceTitle'>تخصيص الخطط الدراسية</div>
                <div>أعدّ خططاً دراسية فردية لكل طالب حسب مستواه وأهدافه.</div>
                <div>أستخدم أساليب تقييم تشخيصية لتحديد نقاط الضعف ومن ثم علاجها.</div>
                <div>أدمج وسائل تعليمية متنوعة (فيديوهات، ألعاب، تطبيقات) لتناسب أنماط التعلم المختلفة.</div>
              </div>
            </div>

            <div className='CVcontainer'>
              <div className='titleCV'>
                <FaFileAlt className="cv-icon" /> نبذة عنك
              </div>
              <textarea
                className='CVinput'
                placeholder='اكتب نبذة عن أسلوب تدريسك وخبراتك...'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
              />
            </div>

            {generalError && <div className="validation-error">{generalError}</div>}

            <TutorRegistrationActions
              onPrimary={handleNext}
              primaryLabel="متابعة للتحقق"
              isSubmitting={isSubmitting}
              backTo="/create-account/step3"
            />

            <p className="haveaccount">
              لديك حساب بالفعل ؟{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/selection', { state: { mode: 'login' } }); }}>
                تسجيل الدخول
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}