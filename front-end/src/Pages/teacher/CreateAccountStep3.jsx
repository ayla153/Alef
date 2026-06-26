import '../../styles/CreateAccountStep3.css'
import logo from '../../assets/Alef-logo.jpg';
import { useState, useRef } from 'react';
import PriceCard from '../../components/PriceCard';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft , FaArrowRight , FaTimesCircle ,FaLaptop, FaUniversity, FaChalkboardTeacher ,FaUserGraduate , FaMoneyBillWave} from "react-icons/fa";
import { registerTutorStep3 } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';

export default function CreateAccountStep3(){
    const [selected, setSelected] = useState({
        online: false,
        offline: false,
    });
    const navigate = useNavigate();
    const [experienceYears, setExperienceYears] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // أخطاء الفاليديشن
    const [errors, setErrors] = useState({
        teachingMethod: '',
        experience: '',
        stages: ''
    });

    const priceCardRef = useRef();

    const handleSelect = (type) => {
        setSelected((prev) => ({ ...prev, [type]: !prev[type] }));
        if (errors.teachingMethod) setErrors(prev => ({ ...prev, teachingMethod: '' }));
    };

    const getTuitionType = () => {
        if (selected.online && selected.offline) return 'both';
        if (selected.online) return 'online';
        if (selected.offline) return 'offline';
        return null;
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { teachingMethod: '', experience: '', stages: '' };

        if (!selected.online && !selected.offline) {
            newErrors.teachingMethod = 'يرجى اختيار طريقة تدريس واحدة على الأقل (أونلاين أو حضوري).';
            isValid = false;
        }

        if (experienceYears === '' || isNaN(experienceYears) || Number(experienceYears) < 0) {
            newErrors.experience = 'يرجى إدخال عدد سنوات الخبرة (رقم صحيح 0 أو أكثر).';
            isValid = false;
        }

        const stagesValid = priceCardRef.current?.validateStages();
        if (!stagesValid) {
            newErrors.stages = 'يرجى اختيار مرحلة واحدة على الأقل وتعبئة السعر (يمكن أن يكون 0).';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = async () => {
        setGeneralError('');
        if (!validateForm()) return;

        const prices = priceCardRef.current?.getPrices?.() || {};

        setIsSubmitting(true);
        try {
            // 1. استدعاء API الخطوة 3
            const response = await registerTutorStep3({
                tution_type: getTuitionType(),
                total_experience_years: Number(experienceYears),
                price_stage_1: prices.price_stage_1 ?? null,
                price_stage_2: prices.price_stage_2 ?? null,
                price_stage_3: prices.price_stage_3 ?? null
            });

            // 2. 🔥 تخزين التوكن الجديد القادم من الباك إند (step: 4)
            if (response?.data?.registration_token) {
                localStorage.setItem('tutor_registration_token', response.data.registration_token);
                console.log('✅ تم تحديث توكن التسجيل (الخطوة 4)');
            } else {
                // في حال كان الهيكل مختلفاً
                if (response?.registration_token) {
                    localStorage.setItem('tutor_registration_token', response.registration_token);
                } else {
                    console.warn('⚠️ لم يتم العثور على registration_token في رد الخطوة 3', response);
                }
            }

            // 3. الانتقال للخطوة 4
            navigate('/create-account/step4');
        } catch (err) {
            setGeneralError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div className='page-container2 fade-in'>
            <header className="steponeheader">
               <Header/>
            </header>
            <div className='content'>
                <div className="titleforstep1">
                    <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
                    <p className="welcom">حدد أسعارك للمراحل التعليمية المختلفة و حدد طرق التدريس الخاصة بك.</p>
                    <div className="progress-bar-wrapper">
                        <p className="personalinfo">الخطوةُ 3 من 4 : تفاصيل الدرس </p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className='step3content stp3'>
                    {generalError && <div className="validation-error">{generalError}</div>}

                    {/* قسم طريقة التدريس */}
                    <div className="method-cards-container">
                        <div className="method-cards-title">
                            <FaChalkboardTeacher className="method-title-icon" />
                            طريقة التدريس
                        </div>
                        <div className="method-cards">
                            <div
                                className={`method-card ${selected.online ? "selected" : ""}`}
                                onClick={() => handleSelect("online")}
                            >
                                <div className="card-icon"><FaLaptop /></div>
                                <div className="card-content">
                                    <h3>دروس أونلاين</h3>
                                    <p>تدريس الطالب عن بعد عبر مكالمة فيديو</p>
                                </div>
                                <div className="card-checkbox">
                                    <input type="checkbox" checked={selected.online} readOnly />
                                </div>
                            </div>
                            <div
                                className={`method-card ${selected.offline ? "selected" : ""}`}
                                onClick={() => handleSelect("offline")}
                            >
                                <div className="card-icon"><FaUniversity /></div>
                                <div className="card-content">
                                    <h3>دروس حضورية</h3>
                                    <p>الدفع للطلاب أو استقبالهم في موقعك</p>
                                </div>
                                <div className="card-checkbox">
                                    <input type="checkbox" checked={selected.offline} readOnly />
                                </div>
                            </div>
                        </div>
                        {errors.teachingMethod && <div className="validation-error">{errors.teachingMethod}</div>}
                    </div>

                    {/* قسم الخبرة التعليمية */}
                    <div className='exp-wrapper'>
                        <div className="education-experience-title">
                            <FaUserGraduate className="exp-icon" />الخبرة التعليمية 
                        </div>
                        <div className="experience-section">
                            <label className="exp-label">أدخل عدد سنوات خبرتك منذ أن بدأت بالتدريس</label>
                            <div className="exp-input-wrapper">
                                <input 
                                    type="number" 
                                    className="exp-input" 
                                    placeholder="مثال: 5"
                                    value={experienceYears}
                                    onChange={(e) => {
                                        setExperienceYears(e.target.value);
                                        if (errors.experience) setErrors(prev => ({ ...prev, experience: '' }));
                                    }}
                                    min="0"
                                    step="1"
                                />
                            </div>
                            <p className="exp-hint">سيتم عرض هذا في ملفك الشخصي لبناء الثقة مع الطلاب</p>
                            {errors.experience && <div className="validation-error">{errors.experience}</div>}
                        </div>
                    </div>
                
                    {/* قسم المراحل والأسعار */}
                    <PriceCard ref={priceCardRef} onValidationChange={(isValid) => {
                        if (isValid && errors.stages) setErrors(prev => ({ ...prev, stages: '' }));
                    }} />
                    {errors.stages && <div className="validation-error stages-error">{errors.stages}</div>}
                    
                    <div className="tutorbuttons">
                        <button className="movetostep2" onClick={handleNext} disabled={isSubmitting} type="button">
                            <FaArrowRight className="btn-icon" /> {isSubmitting ? 'جارِ الإرسال...' : 'متابعة للخطوة التالية'}
                        </button>
                        <button className="cancele" onClick={()=>{navigate('/create-account/step2')}} disabled={isSubmitting} type="button"> 
                            <FaArrowLeft className="btn-icon"/> 
                        </button>
                    </div>
                    <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>تسجيل الدخول</a></p>
                </div>
            </div>
        </div>
    )
}
