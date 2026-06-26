import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminDashboard.css';
import logo from '../../assets/Alef-logo.jpg';
import { FaClipboardList, FaUserCheck, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { logoutSession } from '../../api/sessionManager';

export default function AdminHeader({ activeTab, setActiveTab = () => {} }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutSession();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="logoAndtitle">
        <img className="Alef-logo" src={logo} alt="logo" />
        لوحة تحكم الأدمن
      </div>
      <div className="admin-tabs">
        <button
          className={activeTab === 'requests' ? 'active-tab' : ''}
          onClick={() => setActiveTab('requests')}
        >
          <FaClipboardList /> إدارة الطلبات
        </button>
        <button
          className={activeTab === 'teachers' ? 'active-tab' : ''}
          onClick={() => setActiveTab('teachers')}
        >
          <FaUserCheck /> الأساتذة المقبولين
        </button>
        <button
          className={activeTab === 'subjects-stages' ? 'active-tab' : ''}
          onClick={() => setActiveTab('subjects-stages')}
        >
          <FaCog /> المواد والمراحل
        </button>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> تسجيل الخروج
      </button>
    </header>
  );
}