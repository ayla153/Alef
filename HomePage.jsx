import React, { useState } from "react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TeachersSection from "../components/TeachersSection";
import Sidebar from "../components/Sidebar";

import "../styles/HomePage.css";

const orders = [
  {
    icon: "hourglass_top",
    title: "مدرس كيمياء",
    date: "منذ يومين",
    status: "قيد المعالجة",
    type: "pending",
  },
  {
    icon: "check_circle",
    title: "مدرس رياضيات",
    date: "منذ 3 أيام",
    status: "تم القبول",
    type: "accepted",
  },
  {
    icon: "cancel",
    title: "مدرس فيزياء",
    date: "منذ أسبوع",
    status: "تم الرفض",
    type: "rejected",
  },
  {
    icon: "task_alt",
    title: "مدرس إنجليزي",
    date: "منذ أسبوعين",
    status: "مكتمل",
    type: "completed",
  },
];

const teachers = [
  {
    name: "هدى الطبال",
    rating: 4.9,
    subject: "لغة إنجليزية",
    experience: 5,
    modes: ["online", "offline"],
    price: 150,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "هدى الطبال",
    rating: 4.7,
    subject: "رياضيات",
    experience: 8,
    modes: ["offline"],
    price: 200,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
  },
];

const HomePage = () => {
  const [savedCount, setSavedCount] = useState(0);

  const handleToggleFav = (added) => {
    setSavedCount((prev) => (added ? prev + 1 : prev - 1));
  };

  return (
    <>
    <div className="page-container">
      <Header activeTab="home" />
      <div className="homePage">
        <div className="container">
          <div className="pageHeader">
            <h1>أهلاً بك ! 👋</h1>
            <p>استكشف أفضل المدرسين وابدأ رحلتك التعليمية اليوم.</p>
          </div>

          <div className="statsContainer">
            <StatCard
              number={savedCount}
              label="مدرسون محفوظون"
              icon="bookmark"
              bg="blue"
            />
            <StatCard
              number={0}
              label="طلبات معلقة"
              icon="hourglass_top"
              bg="orange"
            />
            <StatCard
              number={0}
              label="طلبات مقبولة"
              icon="check_circle"
              bg="green"
            />
          </div>

          <div className="dashboardGrid">
            <section className="mainColumn">
              <TeachersSection
                teachers={teachers.map((t) => ({
                  ...t,
                  onToggleFav: handleToggleFav,
                }))}
              />
            </section>

            <Sidebar orders={orders} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default HomePage;
