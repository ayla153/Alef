// src/Pages/teacher/TutorProfile.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaUser, FaUserTag, FaPhone, FaEnvelope, FaSave, FaUndo, FaEdit,
  FaChalkboardTeacher, FaUserGraduate, FaMoneyBillWave, FaFileAlt,
  FaLaptop, FaUniversity, FaCamera, FaPlus, FaTrashAlt, FaBook,
  FaSpinner,
} from 'react-icons/fa';
import '../../styles/TutorProfile.css';
import { getMyProfile, updateMyProfile, uploadTutorPhoto } from '../../api/tutorProfile';
import {
  getMyTutorSubjects,
  createMyTutorSubject,
  updateMyTutorSubject,
  deleteMyTutorSubject,
} from '../../api/tutorSubjects';
import { getSubjects, getLevels } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import LogoutButton from '../../components/LogoutButton';

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=مستخدم&background=3b82f6&color=fff&size=200';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

const addTimestamp = (url) => {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
};

// ─── تحويل بيانات الملف الشخصي ──────────────────────────────────────────────
function mapTutorToProfile(tutor) {
  return {
    profileImage: tutor.tutor_photo || null,
    firstname: tutor.first_name || '',
    lastname: tutor.last_name || '',
    phone: tutor.phone_number || '',
    email: tutor.email || '',
    totalYearsExperience: tutor.total_experience_years ?? 0,
    teachingMethods: {
      online: tutor.tution_type === 'online' || tutor.tution_type === 'both',
      offline: tutor.tution_type === 'offline' || tutor.tution_type === 'both',
    },
    bio: tutor.bio || '',
  };
}

export default function TutorProfile({ profileIntent = null, onIntentConsumed }) {
  const location = useLocation();

  // ─── بيانات الملف الشخصي ────────────────────────────────────────────────
  const [tutorId, setTutorId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(DEFAULT_AVATAR);

  // ─── بيانات المواد (من API مستقل) ───────────────────────────────────────
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [subjectsCatalog, setSubjectsCatalog] = useState([]);
  const [levelsCatalog, setLevelsCatalog] = useState([]);

  // ─── نموذج إضافة مادة جديدة ─────────────────────────────────────────────
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newLevelId, setNewLevelId] = useState('');
  const [newPricePerHour, setNewPricePerHour] = useState(0);
  const [newExperienceYears, setNewExperienceYears] = useState(0);
  const [newFoundation, setNewFoundation] = useState(false);
  const [newElementoryStage, setNewElementoryStage] = useState(false);
  const [newMiddleStage, setNewMiddleStage] = useState(false);
  const [newHighStage, setNewHighStage] = useState(false);

  // ─── حالة UI ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subjectActionLoading, setSubjectActionLoading] = useState(null);

  const fileInputRef = useRef(null);
  const appliedIntentRef = useRef(null);

  // ─── جلب كل البيانات عند التحميل ────────────────────────────────────────
  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [profileRes, subjectsRes, catalogRes, levelsRes] = await Promise.all([
        getMyProfile(),
        getMyTutorSubjects(),
        getSubjects(),
        getLevels(),
      ]);

      const mapped = mapTutorToProfile(profileRes.data);

      const intent = location.state || profileIntent;
      if (intent) {
        window.history.replaceState({}, document.title);
        onIntentConsumed?.();
      }

      setTutorId(profileRes.data.tutor_id);
      setProfileData(mapped);
      setOriginalData(JSON.parse(JSON.stringify(mapped)));
      setTutorSubjects(subjectsRes.data || []);
      setSubjectsCatalog(catalogRes.data || []);
      setLevelsCatalog(levelsRes.data || []);

      const imgUrl = profileRes.data.tutor_photo;
      if (imgUrl) {
        setProfileImagePreview(addTimestamp(getFullImageUrl(imgUrl)));
      } else {
        setProfileImagePreview(DEFAULT_AVATAR);
      }
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(fetchAll, 0);
    return () => clearTimeout(id);
  }, []);

  // ─── intent ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profileIntent || !profileData) return;
    if (appliedIntentRef.current === profileIntent) return;
    appliedIntentRef.current = profileIntent;
    onIntentConsumed?.();
  }, [profileIntent, profileData, onIntentConsumed]);

  // ─── hasChanges ──────────────────────────────────────────────────────────
  const hasChanges = useMemo(() => {
    if (!profileData || !originalData) return false;
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  }, [profileData, originalData]);

  useEffect(() => {
    const handler = (e) => {
      if (isEditing && hasChanges) {
        e.preventDefault();
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges, isEditing]);

  // ─── التحقق ──────────────────────────────────────────────────────────────
  const runValidation = () => {
    const e = {
      firstname: !profileData.firstname.trim() ? 'الاسم الأول مطلوب' : profileData.firstname.trim().length > 50 ? 'الاسم الأول يجب ألا يتجاوز 50 حرفاً' : '',
      lastname: !profileData.lastname.trim() ? 'الاسم الأخير مطلوب' : profileData.lastname.trim().length > 50 ? 'الاسم الأخير يجب ألا يتجاوز 50 حرفاً' : '',
      phone: !profileData.phone.trim() ? 'رقم الهاتف مطلوب' : '',
      email: !profileData.email.trim() ? 'البريد الإلكتروني مطلوب' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email) ? 'البريد الإلكتروني غير صالح' : '',
      totalYearsExperience: isNaN(parseInt(profileData.totalYearsExperience)) || parseInt(profileData.totalYearsExperience) < 0 ? 'سنوات الخبرة يجب أن تكون رقماً غير سالب' : '',
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const deriveTuitionType = () => {
    const { online, offline } = profileData.teachingMethods;
    if (online && offline) return 'both';
    if (online) return 'online';
    if (offline) return 'offline';
    return null;
  };

  // ─── حفظ الملف الشخصي ────────────────────────────────────────────────────
  const handleSave = async () => {
    setShowValidation(true);
    setSaveError('');
    if (!runValidation()) return;

    setIsSaving(true);
    try {
      await updateMyProfile({
        first_name: profileData.firstname.trim(),
        last_name: profileData.lastname.trim(),
        email: profileData.email.trim(),
        phone_number: profileData.phone.trim(),
        bio: profileData.bio || null,
        total_experience_years: Number(profileData.totalYearsExperience),
        tution_type: deriveTuitionType(),
      });
      // تحديث originalData بعد حفظ البروفايل
      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      // الخروج من وضع التعديل
      setIsEditing(false);
      setShowValidation(false);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── تعديل مادة موجودة (تحديث local state) ──────────────────────────────
  const handleUpdateSubjectField = async (tutorSubjectId, field, value) => {
    setTutorSubjects((prev) =>
      prev.map((s) => (s.tutor_subject_id === tutorSubjectId ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSubject = async (sub) => {
    setSubjectActionLoading(sub.tutor_subject_id);
    setSaveError('');
    try {
      await updateMyTutorSubject(sub.tutor_subject_id, {
        subject_id: sub.subject_id,
        level_id: sub.level_id,
        foundation: sub.foundation,
        elementory_stage: sub.elementory_stage,
        middle_stage: sub.middle_stage,
        high_stage: sub.high_stage,
        experience_years: sub.experience_years,
        price_per_hour: sub.price_per_hour,
      });
      alert('تم حفظ المادة بنجاح!');
    } catch (err) {
      setSaveError(getErrorMessage(err));
      const res = await getMyTutorSubjects();
      setTutorSubjects(res.data || []);
    } finally {
      setSubjectActionLoading(null);
    }
  };

  const handleDeleteSubject = async (tutorSubjectId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    setSubjectActionLoading(tutorSubjectId);
    setSaveError('');
    try {
      await deleteMyTutorSubject(tutorSubjectId);
      setTutorSubjects((prev) => prev.filter((s) => s.tutor_subject_id !== tutorSubjectId));
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSubjectActionLoading(null);
    }
  };

  // ─── إضافة مادة جديدة ────────────────────────────────────────────────────
  const resetNewSubjectForm = () => {
    setNewSubjectId('');
    setNewLevelId('');
    setNewPricePerHour(0);
    setNewExperienceYears(0);
    setNewFoundation(false);
    setNewElementoryStage(false);
    setNewMiddleStage(false);
    setNewHighStage(false);
  };

  const handleAddSubject = async () => {
    if (!newSubjectId || !newLevelId) {
      alert('الرجاء اختيار المادة والمستوى');
      return;
    }
    if (!newPricePerHour || newPricePerHour <= 0) {
      alert('الرجاء إدخال سعر صحيح أكبر من صفر');
      return;
    }

    setSubjectActionLoading('new');
    setSaveError('');
    try {
      const res = await createMyTutorSubject({
        subject_id: Number(newSubjectId),
        level_id: Number(newLevelId),
        price_per_hour: Number(newPricePerHour),
        experience_years: Number(newExperienceYears) || 0,
        foundation: newFoundation,
        elementory_stage: newElementoryStage,
        middle_stage: newMiddleStage,
        high_stage: newHighStage,
      });
      setTutorSubjects((prev) => [...prev, res.data]);
      resetNewSubjectForm();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSubjectActionLoading(null);
    }
  };

  // ─── صورة ────────────────────────────────────────────────────────────────
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    setSaveError('');
    uploadTutorPhoto(tutorId, file)
      .then((res) => {
        const url = res.data?.tutor_photo;
        if (url) {
          const finalUrl = addTimestamp(getFullImageUrl(url));
          setProfileImagePreview(finalUrl);
          setProfileData((p) => ({ ...p, profileImage: finalUrl }));
          setOriginalData((p) => ({ ...p, profileImage: finalUrl }));
        }
      })
      .catch((err) => setSaveError(`فشل رفع الصورة: ${getErrorMessage(err)}`))
      .finally(() => setIsUploadingPhoto(false));
  };

  // ─── مساعدات UI ──────────────────────────────────────────────────────────
  const handleStartEdit = () => {
    // عند بدء التعديل، نأخذ نسخة من البيانات الحالية
    setProfileData(JSON.parse(JSON.stringify(originalData)));
    const img = originalData.profileImage ? getFullImageUrl(originalData.profileImage) : null;
    setProfileImagePreview(img ? addTimestamp(img) : DEFAULT_AVATAR);
    setErrors({});
    setShowValidation(false);
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm('هل أنت متأكد من تجاهل التغييرات؟')) return;
    // العودة للبيانات الأصلية
    setProfileData(JSON.parse(JSON.stringify(originalData)));
    const img = originalData.profileImage ? getFullImageUrl(originalData.profileImage) : null;
    setProfileImagePreview(img ? addTimestamp(img) : DEFAULT_AVATAR);
    setErrors({});
    setShowValidation(false);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) =>
    setProfileData((prev) => ({ ...prev, [field]: value }));

  const handleTeachingMethodChange = (type) =>
    setProfileData((prev) => ({
      ...prev,
      teachingMethods: { ...prev.teachingMethods, [type]: !prev.teachingMethods[type] },
    }));

  const teachingMethodsLabel = () => {
    if (!profileData) return '—';
    const m = [];
    if (profileData.teachingMethods.online) m.push('أونلاين');
    if (profileData.teachingMethods.offline) m.push('حضوري');
    return m.length ? m.join('، ') : '—';
  };

  const getSubjectName = (subjectId) =>
    subjectsCatalog.find((s) => s.subject_id === subjectId)?.subject_title || `#${subjectId}`;

  const getLevelName = (levelId) =>
    levelsCatalog.find((l) => l.level_id === levelId)?.level_title || `#${levelId}`;

  // ─── حالات التحميل ───────────────────────────────────────────────────────
  if (isLoading) return <div className="page-container2"><p>جارِ تحميل الملف الشخصي...</p></div>;
  if (loadError || !profileData) return <div className="page-container2"><p className="error-text">{loadError || 'تعذّر تحميل البيانات'}</p></div>;

  return (
    <div className="page-container2">
      <div className="profile-full-wrapper">

        {/* ─── رأس الصفحة ─── */}
        <div className="profile-header-row">
          <div className="profile-header">
            <h1>الملف الشخصي</h1>
            <p>{isEditing ? 'عدّل بياناتك ثم احفظ التغييرات' : 'عرض بياناتك كما تظهر للطلاب'}</p>
          </div>
          {!isEditing && (
            <button type="button" className="profile-edit-trigger" onClick={handleStartEdit}>
              <FaEdit /> تعديل البيانات
            </button>
          )}
        </div>

        {saveError && <p className="error-text save-error-banner">{saveError}</p>}

        {isEditing && (
          <div className="profile-edit-toolbar">
            <span className="profile-edit-toolbar-label">وضع التعديل</span>
            <div className="profile-edit-toolbar-actions">
              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <FaSave /> {isSaving ? 'جارِ الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <FaUndo /> إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="profile-grid">
          {/* ─── Sidebar ─── */}
          <div className="profile-sidebar">
            <div className="profile-avatar-container">
              <img
                src={profileImagePreview}
                alt="صورة الأستاذ"
                className="profile-avatar"
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              {isEditing && (
                <>
                  <button
                    className="upload-photo-btn"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploadingPhoto}
                  >
                    <FaCamera /> {isUploadingPhoto ? 'جارِ الرفع...' : 'تغيير الصورة'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </>
              )}
            </div>
            <div className="quick-stats">
              <div className="stat"><FaBook /> {tutorSubjects.length} مواد</div>
              <div className="stat"><FaUserGraduate /> {profileData.totalYearsExperience} سنوات خبرة</div>
            </div>
          </div>

          {/* ─── Main ─── */}
          <div className="profile-main">

            {/* المعلومات الشخصية */}
            <div className="profile-card">
              <div className="card-title"><FaUser /> المعلومات الشخصية</div>
              <div className="two-columns">
                {[
                  { label: 'الاسم الأول', field: 'firstname', type: 'text', icon: <FaUserTag />, err: errors.firstname },
                  { label: 'الاسم الأخير', field: 'lastname', type: 'text', icon: <FaUserTag />, err: errors.lastname },
                  { label: 'رقم الهاتف', field: 'phone', type: 'tel', icon: <FaPhone />, err: errors.phone },
                  { label: 'البريد الإلكتروني', field: 'email', type: 'email', icon: <FaEnvelope />, err: errors.email },
                ].map(({ label, field, type, icon, err }) => (
                  <div className="input-group" key={field}>
                    <label>{icon} {label}</label>
                    {isEditing ? (
                      <>
                        <input
                          type={type}
                          value={profileData[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                        />
                        {showValidation && err && <span className="error-text">{err}</span>}
                      </>
                    ) : (
                      <div className="profile-view-value">{profileData[field]}</div>
                    )}
                  </div>
                ))}

                <div className="input-group full-width">
                  <label><FaUserGraduate /> سنوات الخبرة الإجمالية</label>
                  {isEditing ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        value={profileData.totalYearsExperience}
                        onChange={(e) => handleInputChange('totalYearsExperience', parseInt(e.target.value) || 0)}
                      />
                      {showValidation && errors.totalYearsExperience && (
                        <span className="error-text">{errors.totalYearsExperience}</span>
                      )}
                    </>
                  ) : (
                    <div className="profile-view-value">{profileData.totalYearsExperience} سنوات</div>
                  )}
                </div>

                <div className="input-group full-width checkbox-group">
                  <label>طرق التدريس:</label>
                  {isEditing ? (
                    <div className="checkbox-options">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={profileData.teachingMethods.online}
                          onChange={() => handleTeachingMethodChange('online')}
                        />
                        <FaLaptop /> أونلاين
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={profileData.teachingMethods.offline}
                          onChange={() => handleTeachingMethodChange('offline')}
                        />
                        <FaUniversity /> حضوري
                      </label>
                    </div>
                  ) : (
                    <div className="profile-view-value">{teachingMethodsLabel()}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── المواد والأسعار (عرض / تعديل حسب isEditing) ─── */}
            <div className="profile-card">
              <div className="card-title"><FaChalkboardTeacher /> المواد والأسعار</div>

              {tutorSubjects.length === 0 && (
                <p className="hint">لا توجد مواد مسجّلة بعد.</p>
              )}

              {tutorSubjects.map((sub) => {
                const isThisSaving = subjectActionLoading === sub.tutor_subject_id;

                return (
                  <div key={sub.tutor_subject_id} className="subject-api-row">
                    {/* عنوان المادة */}
                    <div className="subject-api-header">
                      <span className="subject-api-name">
                        <FaBook className="subject-api-icon" />
                        {getSubjectName(sub.subject_id)} — {getLevelName(sub.level_id)}
                      </span>
                      {isEditing && (
                        <div className="subject-api-actions">
                          <button
                            className="subject-save-btn"
                            onClick={() => handleSaveSubject(sub)}
                            disabled={isThisSaving}
                            title="حفظ التعديلات"
                          >
                            {isThisSaving ? <FaSpinner className="spin" /> : <FaSave />}
                            {isThisSaving ? ' جارِ الحفظ...' : ' حفظ'}
                          </button>
                          <button
                            className="delete-subject-btn"
                            onClick={() => handleDeleteSubject(sub.tutor_subject_id)}
                            disabled={isThisSaving}
                            title="حذف المادة"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      // وضع التعديل: حقول الإدخال
                      <>
                        <div className="subject-api-fields">
                          <div className="subject-field">
                            <label><FaMoneyBillWave /> السعر / ساعة (ل.س)</label>
                            <input
                              type="number"
                              min="0"
                              value={sub.price_per_hour}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'price_per_hour', parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="subject-field">
                            <label><FaUserGraduate /> سنوات الخبرة</label>
                            <input
                              type="number"
                              min="0"
                              value={sub.experience_years}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'experience_years', parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </div>

                        <div className="subject-stages">
                          <span className="stages-label">المراحل:</span>
                          <label className="stage-checkbox">
                            <input
                              type="checkbox"
                              checked={sub.foundation}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'foundation', e.target.checked)
                              }
                            />
                            تأسيس
                          </label>
                          <label className="stage-checkbox">
                            <input
                              type="checkbox"
                              checked={sub.elementory_stage}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'elementory_stage', e.target.checked)
                              }
                            />
                            ابتدائي
                          </label>
                          <label className="stage-checkbox">
                            <input
                              type="checkbox"
                              checked={sub.middle_stage}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'middle_stage', e.target.checked)
                              }
                            />
                            متوسط
                          </label>
                          <label className="stage-checkbox">
                            <input
                              type="checkbox"
                              checked={sub.high_stage}
                              onChange={(e) =>
                                handleUpdateSubjectField(sub.tutor_subject_id, 'high_stage', e.target.checked)
                              }
                            />
                            ثانوي
                          </label>
                        </div>
                      </>
                    ) : (
                      // وضع العرض: عرض المعلومات كنص
                      <>
                        <div className="subject-view-info">
                          <span className="view-info-item">
                            <FaMoneyBillWave className="view-info-icon" /> {sub.price_per_hour} ل.س/ساعة
                          </span>
                          <span className="view-info-item">
                            <FaUserGraduate className="view-info-icon" /> {sub.experience_years} سنوات خبرة
                          </span>
                          <span className="view-info-item">
                            المراحل: {[
                              sub.foundation && 'تأسيس',
                              sub.elementory_stage && 'ابتدائي',
                              sub.middle_stage && 'متوسط',
                              sub.high_stage && 'ثانوي',
                            ].filter(Boolean).join('، ') || 'غير محدد'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* ─── نموذج إضافة مادة جديدة (يظهر فقط في وضع التعديل) ─── */}
              {isEditing && (
                <div className="add-subject-api-form">
                  <div className="add-subject-api-title">
                    <FaPlus /> إضافة مادة جديدة
                  </div>

                  <div className="add-subject-api-grid">
                    <div className="subject-field">
                      <label>المادة <span className="required-star">*</span></label>
                      <select
                        value={newSubjectId}
                        onChange={(e) => setNewSubjectId(e.target.value)}
                      >
                        <option value="">-- اختر مادة --</option>
                        {subjectsCatalog.map((s) => (
                          <option key={s.subject_id} value={s.subject_id}>
                            {s.subject_title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="subject-field">
                      <label>المستوى <span className="required-star">*</span></label>
                      <select
                        value={newLevelId}
                        onChange={(e) => setNewLevelId(e.target.value)}
                      >
                        <option value="">-- اختر مستوى --</option>
                        {levelsCatalog.map((l) => (
                          <option key={l.level_id} value={l.level_id}>
                            {l.level_title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="subject-field">
                      <label><FaMoneyBillWave /> السعر / ساعة (ل.س) <span className="required-star">*</span></label>
                      <input
                        type="number"
                        min="0"
                        value={newPricePerHour}
                        onChange={(e) => setNewPricePerHour(e.target.value)}
                        placeholder="مثال: 5000"
                      />
                    </div>

                    <div className="subject-field">
                      <label><FaUserGraduate /> سنوات الخبرة</label>
                      <input
                        type="number"
                        min="0"
                        value={newExperienceYears}
                        onChange={(e) => setNewExperienceYears(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="subject-stages">
                    <span className="stages-label">المراحل:</span>
                    {[
                      { label: 'تأسيس', val: newFoundation, setter: setNewFoundation },
                      { label: 'ابتدائي', val: newElementoryStage, setter: setNewElementoryStage },
                      { label: 'متوسط', val: newMiddleStage, setter: setNewMiddleStage },
                      { label: 'ثانوي', val: newHighStage, setter: setNewHighStage },
                    ].map(({ label, val, setter }) => (
                      <label key={label} className="stage-checkbox">
                        <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} />
                        {label}
                      </label>
                    ))}
                  </div>

                  <button
                    className="add-subject-api-btn"
                    onClick={handleAddSubject}
                    disabled={subjectActionLoading === 'new'}
                  >
                    {subjectActionLoading === 'new' ? (
                      <><FaSpinner className="spin" /> جارِ الإضافة...</>
                    ) : (
                      <><FaPlus /> إضافة المادة</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* النبذة */}
            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> نبذة عنك</div>
              {isEditing ? (
                <textarea
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bio-textarea"
                />
              ) : (
                <p className="profile-view-bio">{profileData.bio || 'لا توجد نبذة بعد.'}</p>
              )}
            </div>

          </div>
        </div>

        {!isEditing && (
          <div className="profile-logout-footer">
            <LogoutButton variant="square" />
          </div>
        )}
      </div>
    </div>
  );
}