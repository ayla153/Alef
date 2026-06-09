import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import TeachersSection from "../../components/TeachersSection";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";

import "../../styles/sstyle/HomePage.css";

const statusMap = {
  open: { icon: "hourglass_top", status: "قيد المعالجة", type: "pending" },
  closed_shortlist: {
    icon: "check_circle",
    status: "تم القبول",
    type: "accepted",
  },
  closed_matched: { icon: "task_alt", status: "مكتمل", type: "completed" },
  closed_empty: { icon: "cancel", status: "تم الرفض", type: "rejected" },
  closed_expired: { icon: "cancel", status: "منتهي", type: "rejected" },
};

const HomePage = () => {
  const [teachers, setTeachers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tutorsPromise = api.get("/tutors/");
        const leadsPromise = api.get("/leads/me");
        const favsPromise = api.get("/favorites/my-favorites");

        const [tutorsRes, leadsRes, favsRes] = await Promise.allSettled([
          tutorsPromise,
          leadsPromise,
          favsPromise,
        ]);

        const tutorsData =
          tutorsRes.status === "fulfilled" ? tutorsRes.value.data : [];

        const leadsData =
          leadsRes.status === "fulfilled" ? leadsRes.value.data : [];

        const favsData =
          favsRes.status === "fulfilled" ? favsRes.value.data : [];

        setTeachers(
          tutorsData.map((t) => ({
            id: t.tutor_id,
            name: `${t.first_name} ${t.last_name}`,
            rating: t.reviews?.length
              ? (
                  t.reviews.reduce((s, r) => s + r.number_of_stars, 0) /
                  t.reviews.length
                ).toFixed(1)
              : 0,
            subject: t.tutor_subjects?.[0]?.subject_name || "غير محدد",
            experience: t.total_experience_years || 0,
            modes:
              t.tution_type === "both"
                ? ["online", "offline"]
                : [t.tution_type],
            price: 0,
            image:
              t.tutor_photo ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.first_name}`,
          })),
        );

        setFavCount(favsData.length);
        setPendingCount(
          leadsData.filter((l) => l.lead_status === "open").length,
        );
        setAcceptedCount(
          leadsData.filter(
            (l) =>
              l.lead_status === "closed_shortlist" ||
              l.lead_status === "closed_matched",
          ).length,
        );
      } catch (err) {
        console.error("General error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleFav = (added) => {
    setFavCount((prev) => (added ? prev + 1 : prev - 1));
  };

  if (loading)
    return (
      <div className="page-container">
        <Header />
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          جاري التحميل...
        </p>
      </div>
    );

  return (
    <>
      <div className="page-container fade-in">
        <Header />
        <div className="homePage">
          <div className="home-container">
            <div className="home-pageHeader">
              <h1>أهلاً بك ! 👋</h1>
              <p>استكشف أفضل المدرسين وابدأ رحلتك التعليمية اليوم.</p>
            </div>

            <div className="home-statsContainer">
              <StatCard
                number={favCount}
                label="مدرسون محفوظون"
                icon="bookmark"
                bg="blue"
              />
              <StatCard
                number={pendingCount}
                label="طلبات معلقة"
                icon="hourglass_top"
                bg="orange"
              />
              <StatCard
                number={acceptedCount}
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
