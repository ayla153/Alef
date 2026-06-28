import '../../styles/DashboardHeader.css';
import logo from '../../assets/Alef-logo.jpg';
import {
  FaUserCircle,
  FaBell,
  FaHome,
  FaGlobe,
  FaLock,
  FaPaperPlane,
  FaChalkboardTeacher,
} from 'react-icons/fa';

export default function DashboardHeader({ activeTab, setActiveTab }) {
  return (
    <header className="steponeheader lanP dashboard-nav-header">
      <div className="logoAndtitle">
        <img className="Alef-logo" src={logo} alt="logo" />
        ألِف
      </div>
      <div className="landinPageHeaderTabs dashboard-nav-tabs">
        <button
          className={activeTab === 'home' ? 'active-tab' : ''}
          onClick={() => setActiveTab('home')}
        >
          <FaHome className="tab-icon" /> الرئيسية
        </button>
        <button
          className={activeTab === 'publicRequests' ? 'active-tab' : ''}
          onClick={() => setActiveTab('publicRequests')}
        >
          <FaGlobe className="tab-icon" /> طلبات عامة
        </button>
        <button
          className={activeTab === 'privateRequests' ? 'active-tab' : ''}
          onClick={() => setActiveTab('privateRequests')}
        >
          <FaLock className="tab-icon" /> طلبات خاصة
        </button>
        <button
          className={activeTab === 'myOffers' ? 'active-tab' : ''}
          onClick={() => setActiveTab('myOffers')}
        >
          <FaPaperPlane className="tab-icon" /> عروضي
        </button>
        <button
          className={activeTab === 'teachers' ? 'active-tab' : ''}
          onClick={() => setActiveTab('teachers')}
        >
          <FaChalkboardTeacher className="tab-icon" /> الأساتذة
        </button>
      </div>
      <div className="user-actions">
        <button className="icon-btn" onClick={() => setActiveTab('Notifications')} aria-label="الإشعارات">
          <FaBell />
        </button>
        <button className="icon-btn" onClick={() => setActiveTab('profile')} aria-label="الملف الشخصي">
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
}
