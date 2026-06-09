import { useNavigate } from 'react-router-dom';
import '../../styles/tstyle/Header.css';
import logo from '../../assets/logo_noBG.png';
import { FaHome, FaChalkboardTeacher, FaQuestionCircle, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function Header({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  return (
    <header className="steponeheader lanP">
      
        <img className="header-logo" src={logo} alt="logo" />
      
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === 'home' ? 'active-tab' : ''}
          onClick={() => setActiveTab('home')}
        >
          <FaHome className="tab-icon" /> الصفحة الرئيسيّة
        </button>
        <button
          className={activeTab === 'teachers' ? 'active-tab' : ''}
          onClick={() => setActiveTab('teachers')}
        >
          <FaChalkboardTeacher className="tab-icon" /> الأساتذة
        </button>
        <button
          className={activeTab === 'howItWorks' ? 'active-tab' : ''}
          onClick={() => setActiveTab('howItWorks')}
        >
          <FaQuestionCircle className="tab-icon" /> كيف نعمل
        </button>
      </div>
      <div className="account-buttons">
        <button onClick={()=>{navigate('/selection')}}><FaUserPlus className="btn-icon" /> إنشاء حساب</button>
        <button onClick={() => navigate('/login')} to="/login" className="signupbtn"><FaSignInAlt className="btn-icon" /> تسجيل الدخول</button>
      </div>
    </header>
  );
}