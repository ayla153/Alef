// src/Pages/teacher/TutorProfile.jsx
// ✅ تم حذف قسم الشهادات بالكامل
// ✅ إصلاح رابط الصورة بإضافة BASE_URL إذا كان الرابط نسبياً
// ✅ إضافة timestamp و onError لتجنب مشاكل العرض

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  FaUser, FaUserTag, FaPhone, FaEnvelope, FaSave, FaUndo, FaEdit,
  FaChalkboardTeacher, FaUserGraduate, FaMoneyBillWave, FaFileAlt,
  FaLaptop, FaUniversity, FaCamera, FaPlus, FaTrashAlt,
  FaBook
} from 'react-icons/fa';
import '../../styles/TutorProfile.css';
import { getMyProfile, updateMyProfile, uploadTutorPhoto } from '../../api/tutorProfile';
import { getErrorMessage } from '../../utils/apiErrors';
import LogoutButton from '../../components/LogoutButton';

// رابط صورة افتراضية (يعمل دائماً)
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=مستخدم&background=3b82f6&color=fff&size=200';

// قاعدة URL الخاصة بالباك إند (خذها من متغير البيئة أو استخدم القيمة الافتراضية)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// دالة لتحويل الرابط إلى رابط مطلق
const getFullImageUrl = (url) => {
  if (!url) return null;
  // إذا كان الرابط يبدأ بـ http أو https، فهو مطلق
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // إذا كان يبدأ بـ /، أضف BASE_URL
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  // إذا كان مساراً نسبياً، أضف / قبل الرابط ثم BASE_URL
  return `${BASE_URL}/${url}`;
};

// دالة لإضافة timestamp لتجنب Cache
const addTimestamp = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

const availableSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'التربية الاسلامية',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية',
];

function mapTutorToProfile(tutor) {
  return {
    profileImage: tutor.tutor_photo || null,
    firstname: tutor.first_name || '',
    lastname: tutor.last_name || '',
    phone: tutor.phone_number || '',
    email: tutor.email || '',
    totalYearsExperience: tutor.total_experience_years ?? 0,
    teachingMethods: {
      online:  tutor.tution_type === 'online'  || tutor.tution_type === 'both',
      offline: tutor.tution_type === 'offline' || tutor.tution_type === 'both',
    },
    subjects: (tutor.tutor_subjects || []).map((ts) => ({
      name: ts.subject?.subject_title || '—',
      years: ts.experience_years,
    })),
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 0 },
      { stage: 'المرحلة المتوسطة',  price: 0 },
      { stage: 'المرحلة الثانوية',  price: 0 },
    ],
    bio: tutor.bio || '',
  };
}

export default function TutorProfile() {
  const [tutorId, setTutorId]                     = useState(null);
  const [profileData, setProfileData]             = useState(null);
  const [originalData, setOriginalData]           = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(DEFAULT_AVATAR);
  const [errors, setErrors]           = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [loadError, setLoadError]     = useState('');
  const [saveError, setSaveError]     = useState('');
  const [isSaving, setIsSaving]       = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const fileInputRef       = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectYears, setNewSubjectYears] = useState(0);

  // ─── جلب البيانات ────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const res    = await getMyProfile();
      const mapped = mapTutorToProfile(res.data);
      setTutorId(res.data.tutor_id);
      setProfileData(mapped);
      setOriginalData(mapped);
      if (mapped.profileImage) {
        const fullUrl = getFullImageUrl(mapped.profileImage);
        setProfileImagePreview(addTimestamp(fullUrl));
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
    const id = setTimeout(fetchProfile, 0);
    return () => clearTimeout(id);
  }, []);

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

  // ─── تحقق ────────────────────────────────────────────────────────────────
  const validateFirstname = (v) => {
    if (!v.trim()) return 'الاسم الأول مطلوب';
    if (v.trim().length > 50) return 'الاسم الأول يجب ألا يتجاوز 50 حرفاً';
    return '';
  };
  const validateLastname = (v) => {
    if (!v.trim()) return 'الاسم الأخير مطلوب';
    if (v.trim().length > 50) return 'الاسم الأخير يجب ألا يتجاوز 50 حرفاً';
    return '';
  };
  const validatePhone = (v) => {
    if (!v.trim()) return 'رقم الهاتف مطلوب';
    return '';
  };
  const validateEmail = (v) => {
    if (!v.trim()) return 'البريد الإلكتروني مطلوب';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'البريد الإلكتروني غير صالح';
    return '';
  };
  const validateTotalExperience = (v) => {
    const n = parseInt(v);
    if (isNaN(n) || n < 0) return 'سنوات الخبرة يجب أن تكون رقماً غير سالب';
    return '';
  };

  const runValidation = () => {
    const e = {
      firstname:           validateFirstname(profileData.firstname),
      lastname:            validateLastname(profileData.lastname),
      phone:               validatePhone(profileData.phone),
      email:               validateEmail(profileData.email),
      totalYearsExperience: validateTotalExperience(profileData.totalYearsExperience),
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const deriveTuitionType = () => {
    const { online, offline } = profileData.teachingMethods;
    if (online && offline) return 'both';
    if (online)  return 'online';
    if (offline) return 'offline';
    return null;
  };

  // ─── حفظ ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setShowValidation(true);
    setSaveError('');
    if (!runValidation()) return;

    setIsSaving(true);
    try {
      await updateMyProfile({
        first_name:            profileData.firstname.trim(),
        last_name:             profileData.lastname.trim(),
        email:                 profileData.email.trim(),
        phone_number:          profileData.phone.trim(),
        bio:                   profileData.bio || null,
        total_experience_years: Number(profileData.totalYearsExperience),
        tution_type:           deriveTuitionType(),
      });

      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      setIsEditing(false);
      setShowValidation(false);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── تحكم واجهة ──────────────────────────────────────────────────────────
  const handleStartEdit = () => {
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

  // ─── صورة ────────────────────────────────────────────────────────────────
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // عرض معاينة مؤقتة (بيانات مرفوعة محلياً)
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    setSaveError('');
    uploadTutorPhoto(tutorId, file)
      .then((res) => {
        const url = res.data?.tutor_photo;
        if (url) {
          const fullUrl = getFullImageUrl(url);
          const finalUrl = addTimestamp(fullUrl);
          setProfileImagePreview(finalUrl);
          setProfileData((p) => ({ ...p, profileImage: finalUrl }));
          setOriginalData((p) => ({ ...p, profileImage: finalUrl }));
        }
      })
      .catch((err) => setSaveError(`فشل رفع الصورة: ${getErrorMessage(err)}`))
      .finally(() => setIsUploadingPhoto(false));
  };

  // ─── مواد ─────────────────────────────────────────────────────────────────
  const handleSubjectChange = (idx, field, value) => {
    const updated = [...profileData.subjects];
    updated[idx][field] = field === 'years' ? parseInt(value) || 0 : value;
    setProfileData((p) => ({ ...p, subjects: updated }));
  };

  const addSubject = () => {
    if (!selectedSubject) { alert('الرجاء اختيار مادة'); return; }
    if (profileData.subjects.some((s) => s.name === selectedSubject)) { alert('هذه المادة مضافة بالفعل'); return; }
    setProfileData((p) => ({ ...p, subjects: [...p.subjects, { name: selectedSubject, years: newSubjectYears || 0 }] }));
    setSelectedSubject('');
    setNewSubjectYears(0);
  };

  const removeSubject = (idx) => {
    const updated = [...profileData.subjects];
    updated.splice(idx, 1);
    setProfileData((p) => ({ ...p, subjects: updated }));
  };

  // ─── أسعار ─────────────────────────────────────────────────────────────────
  const handleStagePriceChange = (idx, price) => {
    const updated = [...profileData.stagesPrices];
    updated[idx].price = parseInt(price) || 0;
    setProfileData((p) => ({ ...p, stagesPrices: updated }));
  };

  const teachingMethodsLabel = () => {
    const m = [];
    if (profileData.teachingMethods.online)  m.push('أونلاين');
    if (profileData.teachingMethods.offline) m.push('حضوري');
    return m.length ? m.join('، ') : '—';
  };

  // ─── حالات التحميل ───────────────────────────────────────────────────────
  if (isLoading)          return <div className="page-container2"><p>جارِ تحميل الملف الشخصي...</p></div>;
  if (loadError || !profileData) return <div className="page-container2"><p className="error-text">{loadError || 'تعذّر تحميل البيانات'}</p></div>;

  return (
    <div className="page-container2">
      <div className="profile-full-wrapper">

        <div className="profile-header">
          <h1>الملف الشخصي</h1>
          <p>{isEditing ? 'عدّل بياناتك ثم احفظ التغييرات' : 'عرض بياناتك كما تظهر للطلاب'}</p>
        </div>

        {saveError && <p className="error-text">{saveError}</p>}

        <div className="action-buttons top-buttons">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave} disabled={!hasChanges || isSaving}>
                <FaSave /> {isSaving ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button className="cancel-btn" onClick={handleCancel} disabled={isSaving}>
                <FaUndo /> إلغاء التعديل
              </button>
            </>
          ) : (
            <>
              <button type="button" className="edit-profile-btn" onClick={handleStartEdit}>
                <FaEdit /> تعديل الملف الشخصي
              </button>
              <LogoutButton variant="compact" />
            </>
          )}
        </div>

        <div className="profile-grid">
          {/* ─── Sidebar ─── */}
          <div className="profile-sidebar">
            <div className="profile-avatar-container">
              <img
                src={profileImagePreview}
                alt="صورة الأستاذ"
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
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
              <div className="stat"><FaBook />         {profileData.subjects.length} مواد</div>
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
                  { label: 'الاسم الأول',        field: 'firstname', type: 'text',  icon: <FaUserTag />,  err: errors.firstname },
                  { label: 'الاسم الأخير',        field: 'lastname',  type: 'text',  icon: <FaUserTag />,  err: errors.lastname  },
                  { label: 'رقم الهاتف',          field: 'phone',     type: 'tel',   icon: <FaPhone />,    err: errors.phone     },
                  { label: 'البريد الإلكتروني',   field: 'email',     type: 'email', icon: <FaEnvelope />, err: errors.email     },
                ].map(({ label, field, type, icon, err }) => (
                  <div className="input-group" key={field}>
                    <label>{icon} {label}</label>
                    {isEditing ? (
                      <>
                        <input type={type} value={profileData[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
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
                      <input type="number" min="0" max="70" value={profileData.totalYearsExperience}
                        onChange={(e) => handleInputChange('totalYearsExperience', parseInt(e.target.value) || 0)} />
                      {showValidation && errors.totalYearsExperience && <span className="error-text">{errors.totalYearsExperience}</span>}
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
                        <input type="checkbox" checked={profileData.teachingMethods.online}  onChange={() => handleTeachingMethodChange('online')}  />
                        <FaLaptop /> أونلاين
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={profileData.teachingMethods.offline} onChange={() => handleTeachingMethodChange('offline')} />
                        <FaUniversity /> حضوري
                      </label>
                    </div>
                  ) : (
                    <div className="profile-view-value">{teachingMethodsLabel()}</div>
                  )}
                </div>
              </div>
            </div>

            {/* المواد */}
            <div className="profile-card">
              <div className="card-title"><FaChalkboardTeacher /> المواد التي أدرسها</div>
              {isEditing && <p className="hint">⚠️ تعديل المواد هنا لن يُحفظ على السيرفر — لا يوجد endpoint لتحديثها بعد التسجيل.</p>}
              {profileData.subjects.length === 0 && <p className="hint">لا توجد مواد مسجّلة بعد.</p>}
              {profileData.subjects.map((sub, idx) => (
                <div key={idx} className="subject-row">
                  <span className="subject-name-display">{sub.name}</span>
                  {isEditing ? (
                    <>
                      <div className="subject-years">
                        <label>سنوات الخبرة:</label>
                        <input type="number" min="0" value={sub.years} onChange={(e) => handleSubjectChange(idx, 'years', e.target.value)} />
                      </div>
                      <button type="button" className="delete-subject-btn" onClick={() => removeSubject(idx)}><FaTrashAlt /></button>
                    </>
                  ) : (
                    <span className="profile-view-inline">{sub.years} سنوات خبرة</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="add-subject-row">
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="new-subject-select">
                    <option value="">-- اختر مادة --</option>
                    {availableSubjects.filter((s) => !profileData.subjects.some((ex) => ex.name === s)).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="subject-years">
                    <label>سنوات الخبرة:</label>
                    <input type="number" min="0" value={newSubjectYears} onChange={(e) => setNewSubjectYears(e.target.value)} />
                  </div>
                  <button type="button" className="add-subject-btn" onClick={addSubject}><FaPlus /> إضافة مادة</button>
                </div>
              )}
            </div>

            {/* الأسعار (عرض فقط) */}
            <div className="profile-card">
              <div className="card-title"><FaMoneyBillWave /> الأسعار حسب المرحلة</div>
              {isEditing && <p className="hint">⚠️ السعر مرتبط بكل مادة في الباك إند — هذا القسم للعرض فقط ولن يُحفظ.</p>}
              {profileData.stagesPrices.map((stage, idx) => (
                <div key={idx} className="price-row">
                  <span className="stage-name">{stage.stage}</span>
                  {isEditing ? (
                    <div className="price-input">
                      <input type="number" min="0" value={stage.price} onChange={(e) => handleStagePriceChange(idx, e.target.value)} />
                      <span className="currency">ل.س / شهر</span>
                    </div>
                  ) : (
                    <span className="profile-view-inline">{stage.price > 0 ? `${stage.price} ل.س / شهر` : '—'}</span>
                  )}
                </div>
              ))}
            </div>

            {/* النبذة */}
            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> نبذة عنك</div>
              {isEditing ? (
                <textarea rows="4" value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="bio-textarea" />
              ) : (
                <p className="profile-view-bio">{profileData.bio || 'لا توجد نبذة بعد.'}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}