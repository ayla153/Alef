import { useNavigate } from "react-router-dom";
import "../../styles/Header.css";
import logo from "../../assets/logo_noBG.png";
import {
  FaHome,
  FaChalkboardTeacher,
  FaQuestionCircle,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";

export default function Header({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  // دالة موحدة للتعامل مع النقر على أزرار التبويبات
  const handleTabClick = (tabName, path) => {
    if (setActiveTab && typeof setActiveTab === "function") {
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
      </div>
      <div className="landinPageHeaderTabs">
        <button
          className={activeTab === "home" ? "active-tab" : ""}
          onClick={() => handleTabClick("home", "/")}
        >
          <FaHome className="tab-icon" /> الصفحة الرئيسيّة
        </button>
        <button
          className={activeTab === "howItWorks" ? "active-tab" : ""}
          onClick={() => handleTabClick("howItWorks", "/how-it-works")}
        >
          <FaQuestionCircle className="tab-icon" /> كيف نعمل
        </button>
        <button
          className={activeTab === "teachers" ? "active-tab" : ""}
          onClick={() => handleTabClick("teachers", "/teachers")}
        >
          <FaChalkboardTeacher className="tab-icon" /> الأساتذة
        </button>
      </div>
      
        <div className="account-buttons">
          <button
            onClick={() =>
              navigate("/selection", { state: { mode: "register" }, replace: true })
            }
          >
            <FaUserPlus className="btn-icon" /> إنشاء حساب
          </button>
          <button
            onClick={() =>
              navigate("/selection", { state: { mode: "login" }, replace: true })
            }
            className="signupbtn"
          >
            <FaSignInAlt className="btn-icon" /> تسجيل الدخول
          </button>
        </div>
    </header>
  );
}
