import '../styles/CreateAccountStep3.css'
import logo from '../assets/Alef-logo.jpg';
import { useState, useRef } from 'react';
import PriceCard from '../components/PriceCard';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft , FaArrowRight , FaTimesCircle ,FaLaptop, FaUniversity, FaChalkboardTeacher ,FaUserGraduate , FaMoneyBillWave} from "react-icons/fa";

export default function CreateAccountStep3(){
    const [selected, setSelected] = useState({
        online: false,
        offline: false,
    });
    const navigate = useNavigate();
    const [experienceYears, setExperienceYears] = useState('');
    
    // أخطاء الفاليديشن
    const [errors, setErrors] = useState({
        teachingMethod: '',
        experience: '',
        stages: ''
    });

    const priceCardRef = useRef();

    const handleSelect = (type) => {
        setSelected((prev) => ({ ...prev, [type]: !prev[type] }));
        // مسح خطأ طريقة التدريس عند التحديد
        if (errors.teachingMethod) setErrors(prev => ({ ...prev, teachingMethod: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { teachingMethod: '', experience: '', stages: '' };

        // 1. التحقق من طريقة التدريس
        if (!selected.online && !selected.offline) {
            newErrors.teachingMethod = 'يرجى اختيار طريقة تدريس واحدة على الأقل (أونلاين أو حضوري).';
            isValid = false;
        }

        // 2. التحقق من سنوات الخبرة
        if (experienceYears === '' || isNaN(experienceYears) || Number(experienceYears) < 0) {
            newErrors.experience = 'يرجى إدخال عدد سنوات الخبرة (رقم صحيح 0 أو أكثر).';
            isValid = false;
        }

        // 3. التحقق من المراحل والأسعار (استدعاء دالة من PriceCard)
        const stagesValid = priceCardRef.current?.validateStages();
        if (!stagesValid) {
            newErrors.stages = 'يرجى اختيار مرحلة واحدة على الأقل وتعبئة السعر (يمكن أن يكون 0).';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigate('/create-account/step4');
        }
    };

    return(
        <div className='page-container2 fade-in'>
            <header className="steponeheader">
                <div className="logoAndtitle">
                    <img className="Alef-logo" src={logo} alt="logo" />
                    إنشاء حساب مُعلّم - منصَّة ألِف
                </div>
            </header>
            <div className='content'>
                <div className="titleforstep1">
                    <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
                    <p className="welcom">حدد أسعارك للمراحل التعليمية المختلفة و حدد طرق التدريس الخاصة بك.</p>
                    <div className="progress-bar-wrapper">
                        <p className="personalinfo">الخطوةُ 3 من 4 : تفاصيل الدرس </p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className='step3content stp3'>
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
                        <button className="movetostep2" onClick={handleNext}>
                            <FaArrowRight className="btn-icon" /> متابعة للخطوة التالية
                        </button>
                        <button className="cancele" onClick={()=>{navigate('/create-account/step2')}}> 
                            <FaArrowLeft className="btn-icon"/> 
                        </button>
                    </div>
                    <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>تسجيل الدخول</a></p>
                </div>
            </div>
        </div>
    )
}