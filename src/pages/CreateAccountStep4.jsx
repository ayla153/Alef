import '../styles/CreateAccountStep4.css'
import logo from '../assets/Alef-logo.jpg';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimesCircle, FaArrowRight , FaLightbulb , FaFileAlt } from "react-icons/fa";
import { useState } from 'react';
import CertificatesUpload from '../components/CertificatesUpload'

export default function CreateAccountStep4(){
    const navigate = useNavigate();
    const [bio, setBio] = useState('');

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
                                <p className="welcom">اكتب سيرتك الذاتية و ادخل شهاداتك </p>
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
                                    <div className='stp4Subtitle'>السيرة الذاتية و الشهادات الموثقة تساعدك على التميز أمام الطلاب . </div>
                                </div>
                                
                                <div className='advicesforCV'>
                                    <div className='titleforadvices'> <FaLightbulb className="bulb-icon" /> كتابة سيرة ذاتية مميزة</div>
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
                                        <FaFileAlt className="cv-icon" /> السيرة الذاتية
                                    </div>
                                    <textarea
                                        className='CVinput'
                                        placeholder='أخبر الطلاب عن أسلوب تدريسك...'
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={5}
                                        />
                                </div>

                                <CertificatesUpload/>
                                <div className="tutorbuttons">
                                    <button className="movetostep2" onClick={()=>{navigate('/dashboard')}}><FaArrowRight className="btn-icon" /> متابعة للخطوة التالية</button>
                                    <button className="cancele" ><FaArrowLeft className="btn-icon"/></button>
                                </div>
                                <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#">تسجيل الدخول</a></p>

                            </div>
                        
                        
                        
                        
                        </div>
            
            </div>
        </div>
    )
}