import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import PublicLeadDetails from "./PublicLeadDetails";
import PrivateLeadDetails from "./PrivateLeadDetails";

// 🔥 Mock API (استبدلها لاحقاً بـ backend)
const MOCK_LEADS = [
  // =====================================
  // PUBLIC LEAD 1
  // =====================================
  {
    id: 1,
    type: "public",
    status: "open",

    subject: "اللغة الإنجليزية",
    createdAt: "12 أكتوبر 2023",
    budget: "150 ر.س",
    level: "المستوى المتوسط",
    timing: "الأحد، 8:00 مساءً",
    duration: "ساعتان",
    typeAndSystem: "أونلاين (عن بُعد) - عبر المنصة",
    expectedResponseTime: "خلال ساعتين",

    summary: {
      receivedCount: 3,
      totalExpected: 5,
    },

    offers: [
      {
        id: 1,
        name: "أحمد محمد",
        avatar: "https://i.pravatar.cc/300?img=12",
        rating: 4.8,
        reviewsCount: 120,
        price: "140 ل.س",
        bio: "متخصص في تدريس اللغة الإنجليزية للمستوى المتوسط.",
        contact: {
          phone: "+966501234567",
        },
      },
      {
        id: 2,
        name: "سارة علي",
        avatar: "https://i.pravatar.cc/300?img=5",
        rating: 4.9,
        reviewsCount: 85,
        price: "150 ل.س",
        bio: "خبرة 5 سنوات في المحادثة والاختبارات الدولية.",
        contact: {
          phone: "+966509876543",
        },
      },
      {
        id: 3,
        name: "محمد خالد",
        avatar: "https://i.pravatar.cc/300?img=15",
        rating: 4.7,
        reviewsCount: 60,
        price: "130 ل.س",
        bio: "مدرس لغة إنجليزية للمناهج الدولية.",
        contact: {
          phone: "+966530000000",
        },
      },
    ],
  },

  // =====================================
  // PUBLIC LEAD 2
  // =====================================
  {
    id: 2,
    type: "public",
    status: "pending",

    subject: "الرياضيات",
    createdAt: "15 أكتوبر 2023",
    budget: "200 ل.س",
    level: "الثانوية العامة",
    timing: "الثلاثاء 6 مساءً",
    duration: "ساعة ونصف",
    typeAndSystem: "حضوري",
    expectedResponseTime: "خلال 24 ساعة",

    summary: {
      receivedCount: 0,
      totalExpected: 4,
    },

    offers: [],
  },

  // =====================================
  // PRIVATE LEAD 1
  // =====================================
  {
    id: 3,
    type: "private",
    status: "accepted",

    title: "مدرس رياضيات خاص",
    level: "ثانوي",
    budget: "250",
    currency: "ل.س",
    sessionTime: "الأحد 7 مساءً",

    phone: "+966501112233",

    teacher: {
      name: "أحمد خالد",
      image: "https://i.pravatar.cc/300?img=20",
      rating: 4.9,
      headline: "مدرس رياضيات بخبرة 8 سنوات",
      bio: "متخصص في الرياضيات والتحضير لاختبارات القدرات والتحصيلي.",
    },

    tags: ["رياضيات", "قدرات", "ثانوي", "أونلاين"],

    session: {
      type: "أونلاين",
      responseTime: "منذ ساعة",
    },
  },

  // =====================================
  // PRIVATE LEAD 2
  // =====================================
  {
    id: 4,
    type: "private",
    status: "pending",

    title: "مدرس فيزياء خاص",
    level: "الصف الحادي عشر",
    budget: "180",
    currency: "ر.س",
    sessionTime: "الخميس 5 مساءً",

    phone: null,

    teacher: {
      name: "خالد عبدالله",
      image: "https://i.pravatar.cc/300?img=22",
      rating: 4.8,
      headline: "مدرس فيزياء وكيمياء",
      bio: "خبرة طويلة في تدريس الفيزياء للمراحل الثانوية.",
    },

    tags: ["فيزياء", "ثانوي", "حضوري"],

    session: {
      type: "حضوري",
      responseTime: "بانتظار رد المعلم",
    },
  },
];

const enrichLead = (lead) => {
  return {
    ...lead,

    createdAt: "12 أكتوبر 2023",
    budget: lead.price?.split(" ")[0] || "200",
    currency: "ر.س",
    timing: "الأحد 8:00 مساءً",
    duration: "ساعتان",

    session: {
      type: "أونلاين عبر المنصة",
      responseTime: "خلال ساعتين",
    },

    teacher: {
      name: lead.tutorName || "أحمد علي",
      image: "https://i.pravatar.cc/150?img=5",
      rating: 4.7,
      headline: "مدرس متخصص",
      bio: "شرح مبسط وتمارين تطبيقية",
    },

    offers: [
      {
        id: 1,
        name: "سارة علي",
        avatar: "https://i.pravatar.cc/150?img=2",
        rating: 4.9,
        reviewsCount: 80,
        price: "250 ر.س",
        bio: "خبرة قوية في التدريس",
        contact: { phone: "0500000000" },
      },
      {
        id: 2,
        name: "أحمد محمد",
        avatar: "https://i.pravatar.cc/150?img=1",
        rating: 4.8,
        reviewsCount: 120,
        price: "270 ر.س",
        bio: "مدرس ممتاز",
        contact: { phone: "0501111111" },
      },
    ],
  };
};

export default function LeadDetailsContainer() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    const found = MOCK_LEADS.find((l) => l.id === Number(id));

    console.log("Route ID:", id);
    console.log("Found Lead:", found);

    if (!found) {
      setLead(null);
      return;
    }

    if (found.type === "public") {
      setLead({
        ...found,
        offers: found.offers || [],
      });
    } else {
      setLead(found);
    }
  }, [id]);

  if (!lead) return <div>جاري التحميل أو لا يوجد بيانات</div>;

  console.log("Lead State:", lead);

  return lead.type === "public" ? (
    <PublicLeadDetails lead={lead} />
  ) : (
    <PrivateLeadDetails lead={lead} />
  );
}
