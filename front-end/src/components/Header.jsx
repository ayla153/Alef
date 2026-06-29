import "../styles/sstyle/Header.css";
import { NavLink } from "react-router-dom";

function Header({ avatar }) {
  return (
    <header className="app-header">
      <div className="app-header__container">
        
        <div className="app-header__left">
          
          <NavLink to="/home" className="app-header__logo">
            <img
              src="/src/assets/Logoo.jpg"
              alt="أَلِفْ"
              className="app-header__logo-img"
            />
          </NavLink>

          <nav className="app-header__nav">
            <NavLink to="/home" className={({ isActive }) =>
              isActive ? "app-header__link is-active" : "app-header__link"
            }>
              <span className="material-symbols-outlined">home</span>
              الصفحة الرئيسية
            </NavLink>

            <NavLink to="/tutors" className={({ isActive }) =>
              isActive ? "app-header__link is-active" : "app-header__link"
            }>
              <span className="material-symbols-outlined">rss_feed</span>
              الأساتذة
            </NavLink>

            <NavLink to="/Create/Lead" className={({ isActive }) =>
              isActive ? "app-header__link is-active" : "app-header__link"
            }>
              <span className="material-symbols-outlined">add</span>
              إنشاء طلب
            </NavLink>

            <NavLink to="/MyLeads" className={({ isActive }) =>
              isActive ? "app-header__link is-active" : "app-header__link"
            }>
              <span className="material-symbols-outlined">list_alt</span>
              الطلبات
            </NavLink>

            <NavLink to="/favorites" className={({ isActive }) =>
              isActive ? "app-header__link is-active" : "app-header__link"
            }>
              <span className="material-symbols-outlined">bookmark</span>
              المفضلة
            </NavLink>
          </nav>

          {/* <div className="app-header__search">
            <input type="search" placeholder="ابحث عن مادة، أو مدرس..." />
            <span className="material-symbols-outlined">search</span>
          </div> */}

        </div>

        <div className="app-header__right">
          
          <NavLink to="/notifications" className={({ isActive }) =>
            isActive ? "app-header__icon-btn is-active" : "app-header__icon-btn"
          }>
            <span className="material-symbols-outlined">notifications</span>
          </NavLink>

          <NavLink to="/profile" className="app-header__profile">
            <img
              src={avatar || "/src/assets/user-avatar.jpg"}
              alt="الحساب الشخصي"
              className="app-header__avatar"
            />
          </NavLink>

        </div>

      </div>
    </header>
  );
}

export default Header;