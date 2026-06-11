import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FaUser, FaUserTag, FaPhone, FaEnvelope, FaSave, FaUndo,
  FaChalkboardTeacher, FaUserGraduate, FaMoneyBillWave, FaFileAlt,
  FaLaptop, FaUniversity, FaCamera, FaPlus, FaTrashAlt,
  FaBook, FaCheckCircle
} from 'react-icons/fa';
import '../styles/TutorProfile.css';

const availableSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'التربية الاسلامية',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية'
];

const initialTeacherData = {
  profileImage: null,
  firstname: 'أحمد',
  lastname: 'محمد',
  phone: '+963988888888',
  email: 'ahmed@example.com',
  totalYearsExperience: 5,
  teachingMethods: { online: true, offline: true },
  subjects: [
    { name: 'الرياضيات', years: 5 },
    { name: 'الفيزياء', years: 3 }
  ],
  stagesPrices: [
    { stage: 'المرحلة الابتدائية', price: 300000 },
    { stage: 'المرحلة المتوسطة', price: 400000 },
    { stage: 'المرحلة الثانوية', price: 500000 }
  ],
  bio: 'أنا مدرس متخصص في الرياضيات والفيزياء، لدي خبرة 5 سنوات في تدريس المراحل الثانوية والجامعية.',
  certificates: ['شهادة التعليم العالي.pdf', 'دورة تدريبية.pdf']
};

export default function TutorProfile() {
  const [profileData, setProfileData] = useState(initialTeacherData);
  const [originalData, setOriginalData] = useState(initialTeacherData);
  const [profileImagePreview, setProfileImagePreview] = useState(
    initialTeacherData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'
  );
  const [errors, setErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef(null);
  const fileCertificateRef = useRef(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectYears, setNewSubjectYears] = useState(0);

  // حساب وجود تغييرات باستخدام useMemo (لا يسبب تحذيرات ESLint)
  const hasChanges = useMemo(() => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  }, [profileData, originalData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

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

  const handleSave = () => {
    setShowValidation(true);
    if (runValidation()) {
      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      alert('تم حفظ التغييرات بنجاح!');
      setShowValidation(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && window.confirm('هل أنت متأكد من تجاهل جميع التغييرات غير المحفوظة؟')) {
      setProfileData(JSON.parse(JSON.stringify(originalData)));
      setProfileImagePreview(originalData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg');
      setErrors({});
      setShowValidation(false);
    }
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

  const handleProfileImageClick = () => fileInputRef.current.click();
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setProfileData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page-container2">
      <div className="profile-full-wrapper">
        <div className="profile-header">
          <h1>الملف الشخصي</h1>
          <p>عرض وتعديل بياناتك المسجلة في المنصة</p>
        </div>

        <div className="action-buttons top-buttons">
          <button className="save-btn" onClick={handleSave} disabled={!hasChanges}>
            <FaSave /> حفظ التغييرات
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            <FaUndo /> إلغاء التغييرات
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="profile-avatar-container">
              <img src={profileImagePreview} alt="صورة الأستاذ" className="profile-avatar" />
              <button className="upload-photo-btn" onClick={handleProfileImageClick}>
                <FaCamera /> تغيير الصورة
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleProfileImageChange} />
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
                  <input type="text" value={profileData.firstname} onChange={(e) => handleInputChange('firstname', e.target.value)} />
                  {showValidation && errors.firstname && <span className="error-text">{errors.firstname}</span>}
                </div>
                <div className="input-group">
                  <label><FaUserTag /> الاسم الأخير</label>
                  <input type="text" value={profileData.lastname} onChange={(e) => handleInputChange('lastname', e.target.value)} />
                  {showValidation && errors.lastname && <span className="error-text">{errors.lastname}</span>}
                </div>
                <div className="input-group">
                  <label><FaPhone /> رقم الهاتف</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                  {showValidation && errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                <div className="input-group">
                  <label><FaEnvelope /> البريد الإلكتروني</label>
                  <input type="email" value={profileData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  {showValidation && errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="input-group full-width">
                  <label><FaUserGraduate /> سنوات الخبرة الإجمالية</label>
                  <input type="number" min="0" value={profileData.totalYearsExperience} onChange={(e) => handleInputChange('totalYearsExperience', parseInt(e.target.value) || 0)} />
                  {showValidation && errors.totalYearsExperience && <span className="error-text">{errors.totalYearsExperience}</span>}
                </div>
                <div className="input-group full-width checkbox-group">
                  <label>طرق التدريس:</label>
                  <div className="checkbox-options">
                    <label className="checkbox-label"><input type="checkbox" checked={profileData.teachingMethods.online} onChange={() => handleTeachingMethodChange('online')} /><FaLaptop /> أونلاين</label>
                    <label className="checkbox-label"><input type="checkbox" checked={profileData.teachingMethods.offline} onChange={() => handleTeachingMethodChange('offline')} /><FaUniversity /> حضوري</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-title"><FaChalkboardTeacher /> المواد التي أدرسها</div>
              {profileData.subjects.map((subject, idx) => (
                <div key={idx} className="subject-row">
                  <span className="subject-name-display">{subject.name}</span>
                  <div className="subject-years">
                    <label>سنوات الخبرة:</label>
                    <input type="number" min="0" value={subject.years} onChange={(e) => handleSubjectChange(idx, 'years', e.target.value)} />
                  </div>
                  <button className="delete-subject-btn" onClick={() => removeSubject(idx)}><FaTrashAlt /></button>
                  {showValidation && errors[`subject_${idx}`] && <span className="error-text">{errors[`subject_${idx}`]}</span>}
                </div>
              ))}
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
                <button className="add-subject-btn" onClick={addSubject}><FaPlus /> إضافة مادة</button>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-title"><FaMoneyBillWave /> الأسعار حسب المرحلة</div>
              {profileData.stagesPrices.map((stage, idx) => (
                <div key={idx} className="price-row">
                  <span className="stage-name">{stage.stage}</span>
                  <div className="price-input">
                    <input type="number" min="0" value={stage.price} onChange={(e) => handleStagePriceChange(idx, e.target.value)} />
                    <span className="currency">ل.س / شهر</span>
                  </div>
                  {showValidation && errors[`stage_${idx}`] && <span className="error-text">{errors[`stage_${idx}`]}</span>}
                </div>
              ))}
            </div>

            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> نبذة عنك</div>
              <textarea rows="4" value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="bio-textarea" />
            </div>

            <div className="profile-card">
              <div className="card-title"><FaFileAlt /> الشهادات والمستندات (PDF فقط)</div>
              <ul className="certificates-list">
                {profileData.certificates.map((cert, idx) => (
                  <li key={idx}>
                    {cert}
                    <button className="delete-cert-btn" onClick={() => removeCertificate(idx)}><FaTrashAlt /></button>
                  </li>
                ))}
              </ul>
              <div className="add-certificate">
                <input type="file" ref={fileCertificateRef} style={{ display: 'none' }} accept=".pdf" onChange={handleCertificateFileChange} />
                <button className="add-cert-btn" onClick={() => fileCertificateRef.current.click()}><FaPlus /> إضافة شهادة (PDF)</button>
                <p className="hint">الملفات المسموحة: PDF فقط - الحد الأقصى 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}