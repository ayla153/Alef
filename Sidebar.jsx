import React from "react";

const Sidebar = ({ orders }) => {
  return (
    <aside className="sidebar">
      <div className="whiteBox lastOrders">
        <div className="boxHeader">
          <h3>آخر الطلبات</h3>
          <a href="#">عرض الكل</a>
        </div>

        {orders.map((order, i) => (
          <div key={i} className="orderItem">
            
            {/* الأيقونة */}
            <div className={`orderIcon ${order.type}Light`}>
              <span className="material-symbols-outlined">
                {order.icon}
              </span>
            </div>

            {/* المعلومات */}
            <div className="orderInfo">
              <h4>{order.title}</h4>
              <span className="date">{order.date}</span>

              {/* الحالة */}
              <span className={`${order.type}Text status`}>
                {order.status}
              </span>
            </div>

          </div>
        ))}
      </div>

      <div className="helpBox">
        <div className="helpIcon">🎧</div>
        <h4>هل تحتاج مساعدة؟</h4>
        <p>فريق الدعم متاح دائماً لمساعدتك.</p>
        <button className="supportBtn">تواصل معنا</button>
      </div>
    </aside>
  );
};

export default Sidebar;