import React from "react";

const StatCard = ({ number, label, icon, bg }) => {
  const bgClass = bg === "blue" ? "blueBg" : bg === "orange" ? "orangeBg" : "greenBg";
  return (
    <div className="statCard">
      <div className="cardTop">
        <div className={`iconBox ${bgClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="cardBottom">
        <span className="number">{number}</span>
        <span className="label">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;