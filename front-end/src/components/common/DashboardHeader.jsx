import "../../styles/tstyle/DashboardHeader.css";
import logo from "../../assets/logo_noBG.png";
import {
  FaUserCircle,
  FaBell,
  FaHome,
  FaChalkboardTeacher,
} from "react-icons/fa";

export default function DashboardHeader({ activeTab, setActiveTab }) {
  const handleProfile = () => {
    console.log("فتح الملف الشخصي");
  };

  const handleNotifications = () => {
    console.log("فتح الإشعارات");
  };

  return (
    <header className="steponeheader lanP">
      <div className="logoAndtitle">
        <img className="header-logo" src={logo} alt="logo" />
      </div>
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === "home" ? "active-tab" : ""}
          onClick={() => setActiveTab("home")}
        >
          <FaHome className="tab-icon" /> الصفحة الرئيسيّة
        </button>
        <button
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
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
}
