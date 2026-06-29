import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styles/CreateAccountStep2.css';
import { FaPlus, FaTrashAlt, FaBook, FaGraduationCap } from 'react-icons/fa';
import { getSubjects, getLevels, registerTutorStep2 } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';
import TutorRegistrationActions from '../../components/TutorRegistrationActions';

const LEVEL_TRANSLATIONS = {
  Grade1: 'الصف الأول',
  Grade2: 'الصف الثاني',
  Grade3: 'الصف الثالث',
  Grade4: 'الصف الرابع',
  Grade5: 'الصف الخامس',
  Grade6: 'الصف السادس',
  Grade7: 'الصف السابع',
  Grade8: 'الصف الثامن',
  Grade9: 'الصف التاسع',
  Grade10: 'الصف العاشر',
  Grade11: 'الصف الحادي عشر',
  Grade12: 'الصف الثاني عشر',
};

const translateLevel = (title) => LEVEL_TRANSLATIONS[title] || title;

function deriveStageFlagsFromLevel(levelTitle) {
  const gradeMatch = (levelTitle || '').match(/^Grade(\d{1,2})$/i);
  if (gradeMatch) {
    const grade = Number(gradeMatch[1]);
    return {
      primary_stage: grade >= 1 && grade <= 6,
      elementary_stage: grade >= 7 && grade <= 9,
      high_school_stage: grade >= 10 && grade <= 12,
    };
  }

  const title = levelTitle || '';
  if (/ابتد|primary/i.test(title)) {
    return { primary_stage: true, elementary_stage: false, high_school_stage: false };
  }
  if (/متوس|mid|prep|إعد/i.test(title)) {
    return { primary_stage: false, elementary_stage: true, high_school_stage: false };
  }
  if (/ثان|high|secondary/i.test(title)) {
    return { primary_stage: false, elementary_stage: false, high_school_stage: true };
  }

  return { primary_stage: false, elementary_stage: false, high_school_stage: false };
}

export default function CreateAccountStep2() {
  const navigate = useNavigate();

  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedYears, setSelectedYears] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedFoundation, setSelectedFoundation] = useState(false);

  const [addedSubjects, setAddedSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tutor_registration_token');
    if (!token) {
      navigate('/create-account/step1');
      return;
    }

    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      setCatalogError('');
      try {
        const [subjectsRes, levelsRes] = await Promise.all([getSubjects(), getLevels()]);
        setSubjectsList(subjectsRes.data);
        setLevelsList(levelsRes.data);
      } catch (err) {
        setCatalogError(getErrorMessage(err));
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, [navigate]);

  const resetAddSubjectFields = () => {
    setSelectedSubjectId('');
    setSelectedLevelId('');
    setSelectedYears('');
    setSelectedPrice('');
    setSelectedFoundation(false);
  };

  const addSubject = () => {
    if (!selectedSubjectId) {
      setError('يرجى اختيار المادة');
      return;
    }
    if (!selectedLevelId) {
      setError('يرجى اختيار الصف أو المرحلة');
      return;
    }
    if (
      addedSubjects.find(
        (s) => s.subject_id === Number(selectedSubjectId) && s.level_id === Number(selectedLevelId)
      )
    ) {
      setError('هذه المادة بهذا الصف مضافة بالفعل');
      return;
    }
    if (selectedYears === '' || Number(selectedYears) < 0) {
      setError('يرجى إدخال سنوات خبرة صحيحة');
      return;
    }
    if (selectedPrice === '' || Number(selectedPrice) < 0) {
      setError('يرجى إدخال سعر صحيح لهذه المادة');
      return;
    }

    const subjectInfo = subjectsList.find((s) => s.subject_id === Number(selectedSubjectId));
    const levelInfo = levelsList.find((l) => l.level_id === Number(selectedLevelId));
    const levelTitle = levelInfo?.level_title || '';
    const stageFlags = deriveStageFlagsFromLevel(levelTitle);

    setAddedSubjects([
      ...addedSubjects,
      {
        subject_id: Number(selectedSubjectId),
        level_id: Number(selectedLevelId),
        subject_title: subjectInfo?.subject_title || '',
        level_title: levelTitle,
        years: Number(selectedYears),
        price: Number(selectedPrice),
        foundation: selectedFoundation,
        ...stageFlags,
      },
    ]);

    resetAddSubjectFields();
    setError('');
  };

  const removeSubject = (index) => {
    setAddedSubjects((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const updateSubjectField = (index, field, value) => {
    setAddedSubjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleNext = async () => {
    if (addedSubjects.length === 0) {
      setError('يجب إضافة مادة واحدة على الأقل للمتابعة');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        subjects: addedSubjects.map((s) => ({
          subject_id: s.subject_id,
          level_id: s.level_id,
          foundation: s.foundation,
          experience_years: s.years,
          primary_stage: s.primary_stage,
          elementary_stage: s.elementary_stage,
          high_school_stage: s.high_school_stage,
          price_per_hour: s.price,
        })),
      };

      const response = await registerTutorStep2(payload);

      if (response?.data?.registration_token) {
        localStorage.setItem('tutor_registration_token', response.data.registration_token);
      } else if (response?.registration_token) {
        localStorage.setItem('tutor_registration_token', response.registration_token);
      }

      navigate('/create-account/step3');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container2 fade-in">
      <header className="steponeheader">
        <Header />
      </header>

      <div className="content">
        <div className="titleforstep1">
          <h2>موادك وأسعارك</h2>
          <p className="welcom">
            أضف كل مادة تُدرّسها مع الصف وسعر الساعة وسنوات خبرتك — المرحلة تُحدَّد تلقائياً من الصف.
          </p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 2 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '50%' }} />
            </div>
          </div>
        </div>

        <div className="step2-panel">
          {isLoadingCatalog && (
            <div className="step2-message step2-message--loading">جارِ تحميل المواد والصفوف...</div>
          )}
          {catalogError && <div className="step2-message step2-message--error">{catalogError}</div>}

          {!isLoadingCatalog && !catalogError && (
            <>
              <section className="step2-form-card">
                <div className="step2-section-head">
                  <FaBook className="step2-section-icon" />
                  <div>
                    <h3>إضافة مادة</h3>
                    <p>املأ التفاصيل ثم اضغط «إضافة للقائمة»</p>
                  </div>
                </div>

                <div className="step2-form-grid">
                  <div className="step2-field">
                    <label htmlFor="step2-subject">المادة</label>
                    <select
                      id="step2-subject"
                      className="step2-input"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      <option value="">اختر المادة</option>
                      {subjectsList.map((sub) => (
                        <option key={sub.subject_id} value={sub.subject_id}>
                          {sub.subject_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="step2-field">
                    <label htmlFor="step2-level">الصف / المرحلة</label>
                    <select
                      id="step2-level"
                      className="step2-input"
                      value={selectedLevelId}
                      onChange={(e) => setSelectedLevelId(e.target.value)}
                    >
                      <option value="">اختر الصف</option>
                      {levelsList.map((lvl) => (
                        <option key={lvl.level_id} value={lvl.level_id}>
                          {translateLevel(lvl.level_title)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="step2-field">
                    <label htmlFor="step2-years">سنوات الخبرة</label>
                    <input
                      id="step2-years"
                      type="number"
                      className="step2-input"
                      placeholder="مثال: 3"
                      value={selectedYears}
                      onChange={(e) => setSelectedYears(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="step2-field">
                    <label htmlFor="step2-price">السعر بالساعة (ل.س)</label>
                    <input
                      id="step2-price"
                      type="number"
                      className="step2-input"
                      placeholder="مثال: 150000"
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <label className="step2-foundation-toggle">
                  <input
                    type="checkbox"
                    checked={selectedFoundation}
                    onChange={(e) => setSelectedFoundation(e.target.checked)}
                  />
                  <span>أُقدّم دروس تأسيس لهذه المادة</span>
                </label>

                <button className="step2-add-btn" onClick={addSubject} type="button">
                  <FaPlus /> إضافة للقائمة
                </button>

                {error && <div className="step2-message step2-message--error">{error}</div>}
              </section>

              <section className="step2-list-card">
                <div className="step2-section-head">
                  <FaGraduationCap className="step2-section-icon" />
                  <div>
                    <h3>موادك ({addedSubjects.length})</h3>
                    <p>يمكنك تعديل السعر أو سنوات الخبرة قبل المتابعة</p>
                  </div>
                </div>

                {addedSubjects.length === 0 ? (
                  <div className="step2-empty">
                    <FaBook />
                    <p>لم تُضف أي مادة بعد</p>
                    <span>استخدم النموذج أعلاه لإضافة أول مادة</span>
                  </div>
                ) : (
                  <ul className="step2-subjects-list">
                    {addedSubjects.map((subject, index) => (
                      <li key={`${subject.subject_id}-${subject.level_id}-${index}`} className="step2-subject-row">
                        <div className="step2-subject-main">
                          <strong>{subject.subject_title}</strong>
                          <span className="step2-subject-level">{translateLevel(subject.level_title)}</span>
                          {subject.foundation && <span className="step2-badge step2-badge--foundation">تأسيس</span>}
                        </div>

                        <div className="step2-subject-meta">
                          <label className="step2-inline-field">
                            <span>سنوات</span>
                            <input
                              type="number"
                              value={subject.years}
                              onChange={(e) => updateSubjectField(index, 'years', Number(e.target.value))}
                              min="0"
                            />
                          </label>
                          <label className="step2-inline-field">
                            <span>ل.س/ساعة</span>
                            <input
                              type="number"
                              value={subject.price}
                              onChange={(e) => updateSubjectField(index, 'price', Number(e.target.value))}
                              min="0"
                            />
                          </label>
                        </div>

                        <button
                          className="step2-remove-btn"
                          onClick={() => removeSubject(index)}
                          type="button"
                          aria-label="حذف المادة"
                        >
                          <FaTrashAlt />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          <TutorRegistrationActions
            onPrimary={handleNext}
            isSubmitting={isSubmitting}
            backTo="/create-account/step1"
          />

          <p className="haveaccount">
            لديك حساب بالفعل ؟{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/tutor/login');
              }}
            >
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
