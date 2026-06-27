import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import TeachersSection from "../../components/TeachersSection";
import Sidebar from "../../components/Sidebar";
import api from "../../api/api";
import { getAuthRole } from "../../api/authStorage";
import { getPublicTutors } from "../../api/publicTutors";
import { isMarketplaceTutor } from "../../utils/adminTutorStatus";

import "../../styles/sstyle/HomePage.css";

const subjectArabicNames = {
  Mathematics: "رياضيات",
  Physics: "فيزياء",
  Chemistry: "كيمياء",
  Biology: "أحياء",
  English: "لغة إنجليزية",
  Arabic: "لغة عربية",
  History: "تاريخ",
  Geography: "جغرافيا",
  ComputerScience: "معلوماتية",
};

const getSubjectArabicName = (englishName) => {
  if (!englishName) return "غير محدد";
  return subjectArabicNames[englishName] || englishName;
};

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#e5e7eb"/>
      <circle cx="60" cy="45" r="22" fill="#9ca3af"/>
      <path d="M20 110 C20 80 100 80 100 110" fill="#9ca3af"/>
    </svg>
  `);

const statusMap = {
  open: { icon: "hourglass_top", status: "قيد المعالجة", type: "pending" },
  closed_shortlist: { icon: "check_circle", status: "تم القبول", type: "accepted" },
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
        const role = getAuthRole();
        const tutorsPromise = getPublicTutors({ page: 1, page_size: 100 });
        const leadsPromise =
          role === "student" ? api.get("/leads/me") : Promise.resolve({ data: [] });
        const favsPromise =
          role === "student"
            ? api.get("/favorites/my-favorites")
            : Promise.resolve({ data: [] });
        const recentRequestsPromise =
          role === "student"
            ? api.get("/students/me/recent-requests")
            : Promise.resolve({ data: { items: [] } });

        const [tutorsRes, leadsRes, favsRes, recentRes] = await Promise.allSettled([
          tutorsPromise,
          leadsPromise,
          favsPromise,
          recentRequestsPromise,
        ]);

        const tutorsData =
          tutorsRes.status === "fulfilled"
            ? (tutorsRes.value.data || []).filter(isMarketplaceTutor)
            : [];

        const leadsData =
          leadsRes.status === "fulfilled" ? leadsRes.value.data : [];

        const favsData =
          favsRes.status === "fulfilled" ? favsRes.value.data : [];

        const recentData =
          recentRes.status === "fulfilled"
            ? recentRes.value.data?.items || []
            : [];

        setOrders(
          recentData.map((item) => ({
            title: item.title,
            date: new Date(item.created_at).toLocaleDateString("ar-EG"),
            ...(statusMap[item.lead_status] || {
              icon: "help",
              status: item.lead_status,
              type: "pending",
            }),
          }))
        );

        const favMap = {};
        favsData.forEach((fav) => {
          favMap[fav.tutor_id] = fav.favorite_id;
        });

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
            subject: getSubjectArabicName(
              t.tutor_subjects?.[0]?.subject?.subject_title,
            ),
            experience: t.total_experience_years || 0,
            modes:
              t.tution_type === "both"
                ? ["online", "offline"]
                : [t.tution_type],
            price: t.tutor_subjects?.[0]?.price_per_hour || 0,
            image: t.tutor_photo || DEFAULT_AVATAR,
            isFavorite: favMap[t.tutor_id] !== undefined,
            favoriteId: favMap[t.tutor_id] ?? null,
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

  const handleFavoriteChange = (tutorId, isFav, favoriteId) => {
    setFavCount((prev) => (isFav ? prev + 1 : prev - 1));
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === tutorId
          ? { ...t, isFavorite: isFav, favoriteId: isFav ? favoriteId : null }
          : t,
      ),
    );
  };

  if (loading)
    return (
      <div>
        <Header />
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          جاري التحميل...
        </p>
      </div>
    );

  return (
    <>
      <div className="fade-in">
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
                    onFavoriteChange: (isFav, favoriteId) =>
                      handleFavoriteChange(t.id, isFav, favoriteId),
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