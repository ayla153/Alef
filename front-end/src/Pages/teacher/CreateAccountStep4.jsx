import '../../styles/CreateAccountStep4.css'
import logo from '../../assets/Alef-logo.jpg';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimesCircle, FaArrowRight , FaLightbulb , FaFileAlt } from "react-icons/fa";
import { useState, useRef } from 'react';
import CertificatesUpload from '../../components/common/CertificatesUpload'

export default function CreateAccountStep4(){
    const navigate = useNavigate();
    const [bio, setBio] = useState('');
    const [validationError, setValidationError] = useState('');
    const certificatesRef = useRef();

    const validateForm = () => {
        // التحقق من رفع شهادة واحدة على الأقل
        const filesCount = certificatesRef.current?.getFilesCount() || 0;
        if (filesCount === 0) {
            setValidationError('يرجى رفع شهادة واحدة على الأقل قبل المتابعة.');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigate('/dashboard');
        }
    };

    return(
        <div>
            <div className='page-container2'>
                <header className="steponeheader">
                    <div className="logoAndtitle">
                        <img className="Alef-logo" src={logo} alt="logo" />
                        إنشاء حساب مُعلّم - منصَّة ألِف
                    </div>
                </header>
                <div className='content'>
                    <div className="titleforstep1">
                        <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
                        <p className="welcom">اكتب نبذة عنك و ادخل شهاداتك</p>
                        <div className="progress-bar-wrapper">
                            <p className="personalinfo">الخطوةُ 4 من 4 : التفاصيل المهنية </p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className='step4content'>
                        <div className='stp4tc'>
                            <div className='stp4Title'>اللمسات الأخيرة</div>
                            <div className='stp4Subtitle'>نبذة عنك والشهادات الموثقة تساعدك على التميز أمام الطلاب.</div>
                        </div>

                        <div className='advicesforCV'>
                            <div className='titleforadvices'> <FaLightbulb className="bulb-icon" /> كتابة نبذة مميزة</div>
                            <div className='advices'>
                                <div className='adivceTitle'>نتائج ملموسة للطلاب</div>
                                <div> ساعدت طالباً من مستوى ضعيف إلى امتياز خلال 3 أشهر فقط. </div>
                                <div> رفعت مستوى طلابي 30% زيادة خلال شهر</div>
                            </div>

                            <div className='advices'>
                                <div className='adivceTitle'>تخصيص الخطط الدراسية</div>
                                <div> أعدّ خططاً دراسية فردية لكل طالب حسب مستواه وأهدافه.</div>
                                <div> أستخدم أساليب تقييم تشخيصية لتحديد نقاط الضعف ومن ثم علاجها.</div>
                                <div> أدمج وسائل تعليمية متنوعة (فيديوهات، ألعاب، تطبيقات) لتناسب أنماط التعلم المختلفة.</div>
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

                        <CertificatesUpload ref={certificatesRef} />

                        {/* عرض رسالة الخطأ إن وجدت */}
                        {validationError && <div className="validation-error">{validationError}</div>}

                        <div className="tutorbuttons">
                            <button className="movetostep2" onClick={handleNext}>
                                <FaArrowRight className="btn-icon" /> متابعة للخطوة التالية
                            </button>
                            <button className="cancele" onClick={() => navigate('/create-account/step3')}>
                                <FaArrowLeft className="btn-icon" />
                            </button>
                        </div>
                        <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>تسجيل الدخول</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}