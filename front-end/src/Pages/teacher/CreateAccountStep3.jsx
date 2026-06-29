import '../../styles/CreateAccountStep3.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLaptop, FaUniversity, FaChalkboardTeacher ,FaUserGraduate} from "react-icons/fa";
import { registerTutorStep3 } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';
import TutorRegistrationActions from '../../components/TutorRegistrationActions';

export default function CreateAccountStep3(){
    const [selected, setSelected] = useState({
        online: false,
        offline: false,
    });
    const navigate = useNavigate();
    const [experienceYears, setExperienceYears] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const [errors, setErrors] = useState({
        teachingMethod: '',
        experience: '',
    });

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
        const newErrors = { teachingMethod: '', experience: '' };

        if (!selected.online && !selected.offline) {
            newErrors.teachingMethod = 'يرجى اختيار طريقة تدريس واحدة على الأقل (أونلاين أو حضوري).';
            isValid = false;
        }

        if (experienceYears === '' || isNaN(experienceYears) || Number(experienceYears) < 0) {
            newErrors.experience = 'يرجى إدخال عدد سنوات الخبرة (رقم صحيح 0 أو أكثر).';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = async () => {
        setGeneralError('');
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await registerTutorStep3({
                tution_type: getTuitionType(),
                total_experience_years: Number(experienceYears),
            });

            if (response?.data?.registration_token) {
                localStorage.setItem('tutor_registration_token', response.data.registration_token);
            } else if (response?.registration_token) {
                localStorage.setItem('tutor_registration_token', response.registration_token);
            }

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
                    <p className="welcom">حدّد طريقة التدريس وسنوات خبرتك الإجمالية.</p>
                    <div className="progress-bar-wrapper">
                        <p className="personalinfo">الخطوةُ 3 من 4 : تفاصيل الدرس </p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className='step3content stp3'>
                    {generalError && <div className="validation-error">{generalError}</div>}

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
                    
                    <TutorRegistrationActions
                        onPrimary={handleNext}
                        isSubmitting={isSubmitting}
                        backTo="/create-account/step2"
                    />
                    <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/tutor/login');}}>تسجيل الدخول</a></p>
                </div>
            </div>
        </div>
    )
}
