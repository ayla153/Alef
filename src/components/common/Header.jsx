import '../../styles/Header.css';
import logo from '../../assets/Alef-logo.jpg';
import { FaHome, FaChalkboardTeacher, FaQuestionCircle, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="steponeheader lanP">
      <div className="logoAndtitle">
        <img className="Alef-logo" src={logo} alt="logo" />
        ألِف
      </div>
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
        <button><FaUserPlus className="btn-icon" /> إنشاء حساب</button>
        <button className="signupbtn"><FaSignInAlt className="btn-icon" /> تسجيل الدخول</button>
      </div>
    </header>
  );
}