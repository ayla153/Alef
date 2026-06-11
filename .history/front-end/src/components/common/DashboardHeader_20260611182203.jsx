import '../../styles/DashboardHeader.css';
import logo from '../../assets/Alef-logo.jpg';
import { FaUserCircle, FaBell, FaHome, FaChalkboardTeacher } from 'react-icons/fa';
export default function DashboardHeader({ activeTab, setActiveTab }) {

  const handleProfile = () => {
    setActiveTab('profile')
  };

  const handleNotifications = () => {
    setActiveTab('Notifications')
  };

  return (
    <header className="steponeheader lanP">
      <div className="logoAndtitle">
<<<<<<< HEAD
        <img className="Alef-logo" src={logo} alt="logo" />
        ألِف
      </div>
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === 'home' ? 'active-tab' : ''}
          onClick={() => setActiveTab('home')}
=======
        <img className="header-logo" src={logo} alt="logo" />
      </div>
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === "home" ? "active-tab" : ""}
          onClick={() => setActiveTab("home")}
>>>>>>> 8041f6f5 (new name)
        >
          <FaHome className="tab-icon" /> الصفحة الرئيسيّة
        </button>
        <button
<<<<<<< HEAD
          className={activeTab === 'requets' ? 'active-tab' : ''}
          onClick={() => setActiveTab('requets')}
        >
          <FaChalkboardTeacher className="tab-icon" /> الطلبات
        </button>
        <button
          className={activeTab === 'teachers' ? 'active-tab' : ''}
          onClick={() => setActiveTab('teachers')}
        >
          <FaChalkboardTeacher className="tab-icon" /> الأساتذة
        </button>
      </div>
      <div className="user-actions">
        <button className="icon-btn" onClick={handleNotifications} aria-label="الإشعارات">
          <FaBell />
        </button>
        <button className="icon-btn" onClick={handleProfile} aria-label="الملف الشخصي">
=======
          className={activeTab === "teachers" ? "active-tab" : ""}
          onClick={() => setActiveTab("teachers")}
        >
          <FaChalkboardTeacher className="tab-icon" /> الطلبات
        </button>
      </div>
      <div className="user-actions">
        <button
          className="icon-btn"
          onClick={handleNotifications}
          aria-label="الإشعارات"
        >
          <FaBell />
        </button>
        <button
          className="icon-btn"
          onClick={handleProfile}
          aria-label="الملف الشخصي"
        >
>>>>>>> 8041f6f5 (new name)
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8041f6f5 (new name)
