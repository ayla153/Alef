import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import '../../styles/Header.css';
import logo from '../../assets/Alef-logo.jpg';
=======
import '../../styles/tstyle/Header.css';
import logo from '../../assets/logo_noBG.png';
>>>>>>> 8041f6f5 (new name)
import { FaHome, FaChalkboardTeacher, FaQuestionCircle, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function Header({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
<<<<<<< HEAD

  // دالة موحدة للتعامل مع النقر على أزرار التبويبات
  const handleTabClick = (tabName, path) => {
    if (setActiveTab && typeof setActiveTab === 'function') {
      // إذا كان الهيدر داخل صفحة بها `setActiveTab` (مثل LandingPage)، نغير التبويب فقط
      setActiveTab(tabName);
    } else {
      // إذا كان الهيدر في صفحة أخرى (مثل CreateAccount)، ننتقل إلى الرابط مباشرة
      navigate(path);
    }
  };

  return (
    <header className="steponeheader lanP">
      <div className="logoAndtitle">
        <img className="Alef-logo" src={logo} alt="logo" />
        ألِف
      </div>
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === 'home' ? 'active-tab' : ''}
          onClick={() => handleTabClick('home', '/')}
=======
  return (
    <header className="steponeheader lanP">
      
        <img className="header-logo" src={logo} alt="logo" />
      
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === 'home' ? 'active-tab' : ''}
          onClick={() => setActiveTab('home')}
>>>>>>> 8041f6f5 (new name)
        >
          <FaHome className="tab-icon" /> الصفحة الرئيسيّة
        </button>
        <button
          className={activeTab === 'teachers' ? 'active-tab' : ''}
<<<<<<< HEAD
          onClick={() => handleTabClick('teachers', '/teachers')}
=======
          onClick={() => setActiveTab('teachers')}
>>>>>>> 8041f6f5 (new name)
        >
          <FaChalkboardTeacher className="tab-icon" /> الأساتذة
        </button>
        <button
          className={activeTab === 'howItWorks' ? 'active-tab' : ''}
<<<<<<< HEAD
          onClick={() => handleTabClick('howItWorks', '/how-it-works')}
=======
          onClick={() => setActiveTab('howItWorks')}
>>>>>>> 8041f6f5 (new name)
        >
          <FaQuestionCircle className="tab-icon" /> كيف نعمل
        </button>
      </div>
      <div className="account-buttons">
<<<<<<< HEAD
        <button onClick={() => navigate('/create-account/step1')}>
          <FaUserPlus className="btn-icon" /> إنشاء حساب
        </button>
        <button onClick={() => navigate('/login')} className="signupbtn">
          <FaSignInAlt className="btn-icon" /> تسجيل الدخول
        </button>
=======
        <button onClick={()=>{navigate('/selection')}}><FaUserPlus className="btn-icon" /> إنشاء حساب</button>
        <button onClick={() => navigate('/login')} to="/login" className="signupbtn"><FaSignInAlt className="btn-icon" /> تسجيل الدخول</button>
>>>>>>> 8041f6f5 (new name)
      </div>
    </header>
  );
}