import { useState, useEffect } from "react";
import BesTutors from "../BesTutors";
import "../../styles/TeacherTab.css";
import {  
  FaStar, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaLaptop, 
  FaUsers, 
  FaFilter, 
  FaBookmark 
} from "react-icons/fa";
import { getPublicTutors, getTopTutors } from "../../api/publicTutors";
import { isAuthenticated } from "../../api/authStorage";
import { isMarketplaceTutor } from "../../utils/adminTutorStatus";
import { getErrorMessage } from "../../utils/apiErrors";

function mapTutorToCard(tutor) {
  const reviews = tutor.reviews || [];
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.number_of_stars, 0) / reviews.length).toFixed(1))
    : 0;

  const subjectsList = (tutor.tutor_subjects || []).map((ts) => ts.subject?.subject_title).filter(Boolean);

  const prices = (tutor.tutor_subjects || []).map((ts) => ts.price_per_hour).filter((p) => typeof p === 'number');
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

  const modes = [];
  if (tutor.tution_type === 'online' || tutor.tution_type === 'both') modes.push('online');
  if (tutor.tution_type === 'offline' || tutor.tution_type === 'both') modes.push('offline');

  const levels = [];
  (tutor.tutor_subjects || []).forEach((ts) => {
    if (ts.foundation && !levels.includes('تأسيس')) levels.push('تأسيس');
    if (ts.elementory_stage && !levels.includes('ابتدائية')) levels.push('ابتدائية');
    if (ts.middle_stage && !levels.includes('إعدادية')) levels.push('إعدادية');
    if (ts.high_stage && !levels.includes('ثانوية')) levels.push('ثانوية');
  });

  return {
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    image: tutor.tutor_photo || 'https://randomuser.me/api/portraits/lego/1.jpg',
    stage: tutor.bio ? tutor.bio.slice(0, 40) : 'مدرّس/ة',
    rating: avgRating,
    reviews: reviews.length,
    experience: tutor.total_experience_years ?? 0,
    subjects: subjectsList,
    levels,
    modes,
    onlinePrice: modes.includes('online') ? avgPrice : 0,
    offlinePrice: modes.includes('offline') ? avgPrice : 0,
  };
}

export default function TeachersTab({ setSelectedTeacher, setActiveTab, onViewProfile }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedExperience, setSelectedExperience] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedMode, setSelectedMode] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const levelList = ["تأسيس", "ابتدائية", "إعدادية", "ثانوية"];

  const fetchTeachers = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isAuthenticated()) {
        const response = await getPublicTutors({ page: 1, page_size: 100 });
        const verifiedOnly = response.data.filter((t) => t.verified === true);
        setTeachers(verifiedOnly.map(mapTutorToCard));
      } else {
        const { data } = await getTopTutors({ limit: 50 });
        const items = data?.items ?? [];
        setTeachers(
          items.map((item) => ({
            id: item.tutor_id,
            name: `${item.first_name} ${item.last_name}`,
            image: item.tutor_photo || 'https://randomuser.me/api/portraits/lego/1.jpg',
            stage: `${item.total_experience_years ?? 0} سنوات خبرة`,
            rating: item.average_rating ?? 0,
            reviews: item.reviews_count ?? 0,
            experience: item.total_experience_years ?? 0,
            subjects: [],
            levels: [],
            modes: [],
            onlinePrice: 0,
            offlinePrice: 0,
          })),
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => fetchTeachers(), 0);
    return () => clearTimeout(id);
  }, []);

  const subjectList = Array.from(new Set(teachers.flatMap((t) => t.subjects))).sort();

  const filteredTeachers = teachers.filter((teacher) => {
    if (selectedSubject && !teacher.subjects.includes(selectedSubject)) return false;
    if (selectedRating > 0 && teacher.rating < selectedRating) return false;
    if (selectedExperience === 1 && teacher.experience >= 3) return false;
    if (selectedExperience === 2 && (teacher.experience < 3 || teacher.experience > 5)) return false;
    if (selectedExperience === 3 && teacher.experience <= 5) return false;
    if (selectedLevel && !teacher.levels.includes(selectedLevel)) return false;
    if (selectedMode === "online" && !teacher.modes.includes("online")) return false;
    if (selectedMode === "offline" && !teacher.modes.includes("offline")) return false;
    return true;
  });

  const handleViewProfile = (teacher) => {
    if (onViewProfile) {
      onViewProfile(teacher);
      return;
    }
    if (setSelectedTeacher && setActiveTab) {
      setSelectedTeacher(teacher);
      setActiveTab('profile');
    }
  };

  return (
    <div className="teachers_tab fade-in">
      <div className="hero-section">
        <h1 className="TtabTitle">الأساتذة</h1>
        <p className="TtabsubTitle">ابحث عن معلم مناسب لاحتياجاتك من بين نخبة من أفضل المعلمين</p>
      </div>

      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <FaBookmark className="filter-icon" />
            <select
              className="filter-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">جميع المواد</option>
              {subjectList.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FaStar className="filter-icon" />
            <select
              className="filter-select"
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
            >
              <option value={0}>جميع التقييمات</option>
              <option value={4.5}>4.5 نجوم فأكثر</option>
              <option value={4}>4 نجوم فأكثر</option>
              <option value={3.5}>3.5 نجوم فأكثر</option>
            </select>
          </div>

          <div className="filter-group">
            <FaChalkboardTeacher className="filter-icon" />
            <select
              className="filter-select"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(Number(e.target.value))}
            >
              <option value={0}>جميع سنوات الخبرة</option>
              <option value={1}>أقل من 3 سنوات</option>
              <option value={2}>3 - 5 سنوات</option>
              <option value={3}>أكثر من 5 سنوات</option>
            </select>
          </div>

          <div className="filter-group">
            <FaUserGraduate className="filter-icon" />
            <select
              className="filter-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">جميع المراحل</option>
              {levelList.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            {selectedMode === "online" ? <FaLaptop className="filter-icon" /> : <FaUsers className="filter-icon" />}
            <select
              className="filter-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="">جميع (أونلاين / حضوري)</option>
              <option value="online">أونلاين فقط</option>
              <option value="offline">حضوري فقط</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="results-count">
        <FaFilter /> {isLoading ? '...' : filteredTeachers.length} أستاذ/ة متاح(ة)
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>جارِ تحميل قائمة الأساتذة...</p>
      ) : (
        <div className="bestTutorsContainer">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              showFavorite={false}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}