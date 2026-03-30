import "../styles/Header.css";

function Header({ activeTab, avatar }) {
  return (
    <header>
      <div className="container flex justify-between items-center">
        <div className="header-left flex items-center gap-4">
          <a href="#" className="logo">
            <img
              src="/src/assets/Logoo.jpg"
              alt="أَلِفْ"
              className="logo-img"
            />
          </a>

          <nav className="flex items-center gap-3">
            <a
              href="/"
              className={
                activeTab === "home"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">home</span> الصفحة
              الرئيسية
            </a>
            <a
              href="/tutors"
              className={
                activeTab === "tutors"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">rss_feed</span>{" "}
              الأساتذة
            </a>
            <a
              href="/create-order"
              className={
                activeTab === "create"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">add</span> إنشاء طلب
            </a>
            <a
              href="/orders"
              className={
                activeTab === "orders"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">list_alt</span>{" "}
              الطلبات
            </a>
            <a
              href="/favorites"
              className={
                activeTab === "favorites"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">favorite</span>{" "}
              المفضلة
            </a>
            <a
              href="/settings"
              className={
                activeTab === "settings"
                  ? "active flex items-center gap-1"
                  : "flex items-center gap-1"
              }
            >
              <span className="material-symbols-outlined">settings</span>{" "}
              الإعدادات
            </a>
          </nav>

          <div className="search-input relative">
            <input type="search" placeholder="ابحث عن مادة، أو مدرس..." />
            <span className="material-symbols-outlined">search</span>
          </div>
        </div>

        <div className="header-right flex items-center gap-3">
          <button className="icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <a href="#" className="profile">
            <img
              src={avatar || "/src/assets/user-avatar.jpg"}
              alt="الحساب الشخصي"
              className="avatar"
            />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
