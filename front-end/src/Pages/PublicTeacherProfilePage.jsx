import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublicTutorById } from '../api/publicTutors';
import { getErrorMessage } from '../utils/apiErrors';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TeacherProfile from '../components/TeacherProfile';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function resolvePhotoUrl(photo) {
  if (!photo) return 'https://via.placeholder.com/150';
  if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
    return photo;
  }
  if (photo.startsWith('/')) return `${API_BASE}${photo}`;
  return `${API_BASE}/${photo}`;
}

function mapTutorToTeacherData(tutor) {
  const reviews = tutor.reviews || [];
  const avgRating = reviews.length
    ? Number((reviews.reduce((sum, r) => sum + r.number_of_stars, 0) / reviews.length).toFixed(1))
    : 0;

  const subjects = (tutor.tutor_subjects || [])
    .map((ts) => ts.subject?.subject_title)
    .filter(Boolean);

  const prices = (tutor.tutor_subjects || [])
    .map((ts) => ts.price_per_hour)
    .filter((p) => typeof p === 'number');
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  const modes = [];
  if (tutor.tution_type === 'online' || tutor.tution_type === 'both') modes.push('online');
  if (tutor.tution_type === 'offline' || tutor.tution_type === 'both') modes.push('offline');

  return {
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    image: resolvePhotoUrl(tutor.tutor_photo),
    rating: avgRating,
    reviews: reviews.length,
    experience: tutor.total_experience_years ?? 0,
    bio: tutor.bio || '',
    subjects,
    onlinePrice: modes.includes('online') ? avgPrice : 0,
    offlinePrice: modes.includes('offline') ? avgPrice : 0,
  };
}

/** /teacher-profile/:id — ملف معلم عام من الرابط */
export default function PublicTeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getPublicTutorById(id);
        if (!cancelled) setTeacherData(mapTutorToTeacherData(data));
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="MainPage page-container2">
      <Header activeTab="teachers" />
      <div className="homePageContent">
        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</p>}
        {error && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-danger)' }}>
            {error}
            <br />
            <button type="button" onClick={() => navigate('/teachers')}>العودة للأساتذة</button>
          </p>
        )}
        {!loading && !error && teacherData && (
          <TeacherProfile teacherData={teacherData} />
        )}
      </div>
      <Footer />
    </div>
  );
}
