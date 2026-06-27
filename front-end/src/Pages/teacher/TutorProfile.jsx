import { useState, useRef, useEffect, useMemo } from 'react';
import {
  FaUser, FaUserTag, FaPhone, FaEnvelope, FaSave, FaUndo, FaEdit,
  FaChalkboardTeacher, FaUserGraduate, FaMoneyBillWave, FaFileAlt,
  FaLaptop, FaUniversity, FaCamera, FaPlus, FaTrashAlt,
  FaBook, FaCheckCircle
} from 'react-icons/fa';
import '../../styles/TutorProfile.css';
import { getMyProfile, updateTutor, uploadTutorPhoto } from '../../api/tutorProfile';
import { getErrorMessage } from '../../utils/apiErrors';
import LogoutButton from '../../components/LogoutButton';

const availableSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'التربية الاسلامية',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية'
];

// تحويل بيانات المعلّم القادمة من الباك إند (TutorOut) إلى شكل الواجهة
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
      offline: tutor.tution_type === 'offline' || tutor.tution_type === 'both'
    },
    subjects: (tutor.tutor_subjects || []).map((ts) => ({
      name: ts.subject?.subject_title || '—',
      years: ts.experience_years
    })),
    // ⚠️ الباك إند لا يخزّن "سعر موحّد لكل مرحلة"، بل سعر لكل مادة (price_per_hour ضمن tutor_subjects).
    // نعرض هنا قيماً تقريبية لعرضها فقط؛ التعديل عليها هنا لن يُحفظ بالسيرفر (راجع الملاحظة أسفل الكارد).
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 0 },
      { stage: 'المرحلة المتوسطة', price: 0 },
      { stage: 'المرحلة الثانوية', price: 0 }
    ],
    bio: tutor.bio || '',
    // ⚠️ الباك إند الحالي لا يرجّع رابط الشهادات ضمن بيانات المعلّم
    certificates: []
  };
}

export default function TutorProfile() {
  const [tutorId, setTutorId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    'https://randomuser.me/api/portraits/men/32.jpg'
  );
  const [errors, setErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const fileCertificateRef = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectYears, setNewSubjectYears] = useState(0);

  const fetchProfile = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await getMyProfile();
      const mapped = mapTutorToProfile(response.data);
      setTutorId(response.data.tutor_id);
      setProfileData(mapped);
      setOriginalData(mapped);
      if (mapped.profileImage) setProfileImagePreview(mapped.profileImage);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // حساب وجود تغييرات باستخدام useMemo (لا يسبب تحذيرات ESLint)
  const hasChanges = useMemo(() => {
    if (!profileData || !originalData) return false;
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  }, [profileData, originalData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing && hasChanges) {
        e.preventDefault();
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, isEditing]);

  const validateFirstname = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'الاسم الأول مطلوب';
    if (trimmed.length > 20) return 'الاسم الأول يجب ألا يتجاوز 20 حرفاً';
    return '';
  };

  const validateLastname = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'الاسم الأخير مطلوب';
    if (trimmed.length > 20) return 'الاسم الأخير يجب ألا يتجاوز 20 حرفاً';
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+9639\d{8}$/;
    if (!phone.trim()) return 'رقم الهاتف مطلوب';
    if (!phoneRegex.test(phone)) return 'رقم الهاتف يجب أن يكون بصيغة +9639XXXXXXXX';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'البريد الإلكتروني مطلوب';
    if (!emailRegex.test(email)) return 'البريد الإلكتروني غير صالح (مثال: name@domain.com)';
    if (email.length > 40) return 'البريد الإلكتروني يجب ألا يتجاوز 40 حرفاً';
    return '';
  };

  const validateTotalExperience = (years) => {
    const num = parseInt(years);
    if (isNaN(num) || num < 0) return 'سنوات الخبرة يجب أن تكون رقماً غير سالب';
    return '';
  };

  const validateStagePrice = (price) => {
    const num = parseInt(price);
    if (isNaN(num) || num < 0) return 'السعر يجب أن يكون رقماً غير سالب';
    return '';
  };

  const validateSubjectYears = (years) => {
    const num = parseInt(years);
    if (isNaN(num) || num < 0) return 'سنوات الخبرة يجب أن تكون رقماً غير سالب';
    return '';
  };

  const runValidation = () => {
    const newErrors = {};
    newErrors.firstname = validateFirstname(profileData.firstname);
    newErrors.lastname = validateLastname(profileData.lastname);
    newErrors.phone = validatePhone(profileData.phone);
    newErrors.email = validateEmail(profileData.email);
    newErrors.totalYearsExperience = validateTotalExperience(profileData.totalYearsExperience);
    profileData.subjects.forEach((sub, idx) => {
      const err = validateSubjectYears(sub.years);
      if (err) newErrors[`subject_${idx}`] = err;
    });
    profileData.stagesPrices.forEach((stage, idx) => {
      const err = validateStagePrice(stage.price);
      if (err) newErrors[`stage_${idx}`] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // يحوّل اختيار (أونلاين/حضوري) إلى قيمة tution_type التي يفهمها الباك إند
  const deriveTuitionType = () => {
    const { online, offline } = profileData.teachingMethods;
    if (online && offline) return 'both';
    if (online) return 'online';
    if (offline) return 'offline';
    return null;
  };

  const handleSave = async () => {
    setShowValidation(true);
    setSaveError('');
    if (!runValidation()) return;

    setIsSaving(true);
    try {
      // ✅ نرسل فقط الحقول التي يدعمها الباك إند فعلياً (UpdateTutorRequest)
      // المواد/الأسعار/الشهادات لا يدعمها الباك إند بعد التسجيل، لذلك لا تُرسل هنا
      await updateTutor(tutorId, {
        first_name: profileData.firstname.trim(),
        last_name: profileData.lastname.trim(),
        email: profileData.email.trim(),
        phone_number: profileData.phone.trim(),
        bio: profileData.bio,
        total_experience_years: Number(profileData.totalYearsExperience),
        tution_type: deriveTuitionType()
      });

      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      setIsEditing(false);
      alert('تم حفظ التغييرات بنجاح! (المواد والأسعار والشهادات لم تُحفظ على السيرفر - راجع الملاحظات بالأسفل)');
      setShowValidation(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = () => {
    setProfileData(JSON.parse(JSON.stringify(originalData)));
    setProfileImagePreview(
      originalData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'
    );
    setErrors({});
    setShowValidation(false);
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm('هل أنت متأكد من تجاهل جميع التغييرات غير المحفوظة؟')) {
      return;
    }
    setProfileData(JSON.parse(JSON.stringify(originalData)));
    setProfileImagePreview(originalData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg');
    setErrors({});
    setShowValidation(false);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeachingMethodChange = (type) => {
    setProfileData(prev => ({
      ...prev,
      teachingMethods: { ...prev.teachingMethods, [type]: !prev.teachingMethods[type] }
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...profileData.subjects];
    updated[index][field] = field === 'years' ? parseInt(value) || 0 : value;
    setProfileData(prev => ({ ...prev, subjects: updated }));
  };

  const addSubject = () => {
    if (!selectedSubject) {
      alert('الرجاء اختيار مادة من القائمة');
      return;
    }
    if (profileData.subjects.some(s => s.name === selectedSubject)) {
      alert('هذه المادة مضافة بالفعل');
      return;
    }
    const newSubject = { name: selectedSubject, years: newSubjectYears || 0 };
    setProfileData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }));
    setSelectedSubject('');
    setNewSubjectYears(0);
  };

  const removeSubject = (index) => {
    const updated = [...profileData.subjects];
    updated.splice(index, 1);
    setProfileData(prev => ({ ...prev, subjects: updated }));
  };

  const addCertificate = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('الملف غير مدعوم. الأنواع المسموحة: PDF فقط');
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert('حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }
    setProfileData(prev => ({
      ...prev,
      certificates: [...prev.certificates, file.name]
    }));
  };

  const removeCertificate = (index) => {
    const updated = [...profileData.certificates];
    updated.splice(index, 1);
    setProfileData(prev => ({ ...prev, certificates: updated }));
  };

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) addCertificate(file);
    e.target.value = '';
  };

  const handleStagePriceChange = (index, price) => {
    const updated = [...profileData.stagesPrices];
    updated[index].price = parseInt(price) || 0;
    setProfileData(prev => ({ ...prev, stagesPrices: updated }));
  };

  const handleProfileImageClick = () => {
    if (isEditing) fileInputRef.current.click();
  };
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // معاينة فورية محلية (نفس السلوك السابق)
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // ✅ رفع فعلي للصورة إلى الباك إند
    setIsUploadingPhoto(true);
    setSaveError('');
    uploadTutorPhoto(tutorId, file)
      .then((response) => {
        const newPhotoUrl = response.data?.tutor_photo;
        if (newPhotoUrl) {
          setProfileImagePreview(newPhotoUrl);
          setProfileData((prev) => ({ ...prev, profileImage: newPhotoUrl }));
          setOriginalData((prev) => ({ ...prev, profileImage: newPhotoUrl }));
        }
      })
      .catch((err) => {
        setSaveError(`فشل رفع الصورة: ${getErrorMessage(err)}`);
      })
      .finally(() => {
        setIsUploadingPhoto(false);
      });
  };

  const teachingMethodsLabel = () => {
    const methods = [];
    if (profileData.teachingMethods.online) methods.push('أونلاين');
    if (profileData.teachingMethods.offline) methods.push('حضوري');
    return methods.length > 0 ? methods.join('، ') : '—';
  };

  if (isLoading) {
    return (
      <div className="page-container2">
        <p>جارِ تحميل الملف الشخصي...</p>
      </div>
    );
  }

  if (loadError || !profileData) {
    return (
      <div className="page-container2">
        <p className="error-text">{loadError || 'تعذّر تحميل البيانات'}</p>
      </div>
    );
  }

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
          <div className="profile-sidebar">
            <div className="profile-avatar-container">
              <img src={profileImagePreview} alt="صورة الأستاذ" className="profile-avatar" />
              {isEditing && (
                <>
                  <button className="upload-photo-btn" onClick={handleProfileImageClick} disabled={isUploadingPhoto}>
                    <FaCamera /> {isUploadingPhoto ? 'جارِ الرفع...' : 'تغيير الصورة'}
                  </button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfileImageChange} />
                </>
              )}
            </div>
            <div className="quick-stats">
              <div className="stat"><FaBook /> {profileData.subjects.length} مواد</div>
              <div className="stat"><FaUserGraduate /> {profileData.totalYearsExperience} سنوات خبرة</div>
              <div className="stat"><FaCheckCircle /> {profileData.certificates.length} شهادات</div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-card">
              <div className="card-title"><FaUser /> المعلومات الشخصية</div>
              <div className="two-columns">
                <div className="input-group">
                  <label><FaUserTag /> الاسم الأول</label>
                  {isEditing ? (
                    <>
                      <input type="text" value={profileData.firstname} onChange={(e) => handleInputChange('firstname', e.target.value)} />
                      {showValidation && errors.firstname && <span className="error-text">{errors.firstname}</span>}
                    </>
                  ) : (
                    <div className="profile-view-value">{profileData.firstname}</div>
                  )}
                </div>
                <div className="input-group">
                  <label><FaUserTag /> الاسم الأخير</label>
                  {isEditing ? (
                    <>
                      <input type="text" value={profileData.lastname} onChange={(e) => handleInputChange('lastname', e.target.value)} />
                      {showValidation && errors.lastname && <span className="error-text">{errors.lastname}</span>}
                    </>
                  ) : (
                    <div className="profile-view-value">{profileData.lastname}</div>
                  )}
                </div>
                <div className="input-group">
                  <label><FaPhone /> رقم الهاتف</label>
                  {isEditing ? (
                    <>
                      <input type="tel" value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                      {showValidation && errors.phone && <span className="error-text">{errors.phone}</span>}
                    </>
                  ) : (
                    <div className="profile-view-value">{profileData.phone}</div>
                  )}
                </div>
                <div className="input-group">
                  <label><FaEnvelope /> البريد الإلكتروني</label>
                  {isEditing ? (
                    <>
                      <input type="email" value={profileData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                      {showValidation && errors.email && <span className="error-text">{errors.email}</span>}
                    </>
                  ) : (
                    <div className="profile-view-value">{profileData.email}</div>
                  )}
                </div>
                <div className="input-group full-width">
                  <label><FaUserGraduate /> سنوات الخبرة الإجمالية</label>
                  {isEditing ? (
                    <>
                      <input type="number" min="0" value={profileData.totalYearsExperience} onChange={(e) => handleInputChange('totalYearsExperience', parseInt(e.target.value) || 0)} />
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
                      <label className="checkbox-label"><input type="checkbox" checked={profileData.teachingMethods.online} onChange={() => handleTeachingMethodChange('online')} /><FaLaptop /> أونلاين</label>
                      <label className="checkbox-label"><input type="checkbox" checked={profileData.teachingMethods.offline} onChange={() => handleTeachingMethodChange('offline')} /><FaUniversity /> حضوري</label>
                    </div>
                  ) : (
                    <div className="profile-view-value">{teachingMethodsLabel()}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-title"><FaChalkboardTeacher /> المواد التي أدرسها</div>
              {isEditing && (
                <p className="hint">⚠️ تعديل المواد هنا لن يُحفظ على السيرفر حالياً — لا يوجد Endpoint بالباك إند لتحديثها بعد التسجيل.</p>
              )}
              {profileData.subjects.length === 0 && (
                <p className="hint">لا توجد مواد مسجّلة بعد.</p>
              )}
              {profileData.subjects.map((subject, idx) => (
                <div key={idx} className="subject-row">
                  <span className="subject-name-display">{subject.name}</span>
                  {isEditing ? (
                    <>
                      <div className="subject-years">
                        <label>سنوات الخبرة:</label>
                        <input type="number" min="0" value={subject.years} onChange={(e) => handleSubjectChange(idx, 'years', e.target.value)} />
                      </div>
                      <button type="button" className="delete-subject-btn" onClick={() => removeSubject(idx)}><FaTrashAlt /></button>
                      {showValidation && errors[`subject_${idx}`] && <span className="error-text">{errors[`subject_${idx}`]}</span>}
                    </>
                  ) : (
                    <span className="profile-view-inline">{subject.years} سنوات خبرة</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="add-subject-row">
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="new-subject-select">
                    <option value="">-- اختر مادة --</option>
                    {availableSubjects.filter(s => !profileData.subjects.some(ex => ex.name === s)).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
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

            <div className="profile-card">
              <div className="card-title"><FaMoneyBillWave /> الأسعار حسب المرحلة</div>
              {isEditing && (
                <p className="hint">⚠️ الباك إند لا يخزّن سعراً موحّداً لكل مرحلة (السعر مرتبط بكل مادة)، لذلك هذا القسم للعرض فقط حالياً ولن يُحفظ.</p>
              )}
              {profileData.stagesPrices.map((stage, idx) => (
                <div key={idx} className="price-row">
                  <span className="stage-name">{stage.stage}</span>
                  {isEditing ? (
                    <div className="price-input">
                      <input type="number" min="0" value={stage.price} onChange={(e) => handleStagePriceChange(idx, e.target.value)} />
                      <span className="currency">ل.س / شهر</span>
                    </div>
                  ) : (
                    <span className="profile-view-inline">
                      {stage.price > 0 ? `${stage.price} ل.س / شهر` : '—'}
                    </span>
                  )}
                  {showValidation && errors[`stage_${idx}`] && <span className="error-text">{errors[`stage_${idx}`]}</span>}
                </div>
              ))}
            </div>

            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> نبذة عنك</div>
              {isEditing ? (
                <textarea rows="4" value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="bio-textarea" />
              ) : (
                <p className="profile-view-bio">{profileData.bio || 'لا توجد نبذة بعد.'}</p>
              )}
            </div>

            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> الشهادات والمستندات (PDF فقط)</div>
              {isEditing && (
                <p className="hint">⚠️ لا يوجد Endpoint بالباك إند لرفع/جلب الشهادات بعد التسجيل، لذلك هذه القائمة محلية فقط حالياً.</p>
              )}
              {profileData.certificates.length === 0 ? (
                <p className="hint">لا توجد شهادات مرفوعة.</p>
              ) : (
                <ul className="certificates-list">
                  {profileData.certificates.map((cert, idx) => (
                    <li key={idx}>
                      {cert}
                      {isEditing && (
                        <button type="button" className="delete-cert-btn" onClick={() => removeCertificate(idx)}><FaTrashAlt /></button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {isEditing && (
                <div className="add-certificate">
                  <input type="file" ref={fileCertificateRef} style={{ display: 'none' }} accept=".pdf" onChange={handleCertificateFileChange} />
                  <button type="button" className="add-cert-btn" onClick={() => fileCertificateRef.current.click()}><FaPlus /> إضافة شهادة (PDF)</button>
                  <p className="hint">الملفات المسموحة: PDF فقط - الحد الأقصى 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}