import "../styles/Header.css";
import { NavLink } from "react-router-dom";

function Header({ avatar }) {
  return (
    <header>
      <div className="container flex justify-between items-center">
        <div className="header-left flex items-center gap-4">
          <NavLink to="/" className="logo">
            <img
              src="/src/assets/Logoo.jpg"
              alt="أَلِفْ"
              className="logo-img"
            />
          </NavLink>

          <nav className="flex items-center gap-3">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">home</span>
              الصفحة الرئيسية
            </NavLink>

            <NavLink
              to="/tutors"
              className={({ isActive }) =>
                isActive
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">rss_feed</span>
              الأساتذة
            </NavLink>

            <NavLink
              to="/create-order"
              className={({ isActive }) =>
                isActive
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">add</span>
              إنشاء طلب
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">list_alt</span>
              الطلبات
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">favorite</span>
              المفضلة
            </NavLink>
          </nav>

          <div className="search-input relative">
            <input type="search" placeholder="ابحث عن مادة، أو مدرس..." />
            <span className="material-symbols-outlined">search</span>
          </div>
        </div>

        <div className="header-right flex items-center gap-3">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? "icon-btn active" : "icon-btn"
            }
          >
            <span className="material-symbols-outlined">notifications</span>
          </NavLink>

          <NavLink to="/profile" className="profile">
            <img
              src={avatar || "/src/assets/user-avatar.jpg"}
              alt="الحساب الشخصي"
              className="avatar"
            />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Header;
