import React from "react";

const Sidebar = ({ orders }) => {
  return (
    <aside className="sidebar">
      <div className="whiteBox lastOrders">
        <div className="boxHeader">
          <h3>آخر الطلبات</h3>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "1rem" }}>
            لا يوجد طلبات بعد
          </p>
        ) : (
          orders.map((order, i) => (
            <div key={i} className="orderItem">
              <div className={`orderIcon ${order.type}Light`}>
                <span className="material-symbols-outlined">
                  {order.icon}
                </span>
              </div>
              <div className="orderInfo">
                <h4>{order.subject}</h4>
                <span className="date">{order.date}</span>
                <span className={`${order.type}Text status`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
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