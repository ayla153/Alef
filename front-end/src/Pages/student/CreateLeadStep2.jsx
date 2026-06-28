import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styles/CreateAccountStep2.css';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { getSubjects, getLevels, registerTutorStep2 } from '../../api/tutorRegistration';
import { getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';

const SUBJECT_TRANSLATIONS = {
  Mathematics: 'رياضيات',
  Physics: 'فيزياء',
  Chemistry: 'كيمياء',
  Biology: 'أحياء',
  English: 'لغة إنجليزية',
  Arabic: 'لغة عربية',
  History: 'تاريخ',
  Geography: 'جغرافيا',
  ComputerScience: 'معلوماتية',
};

const translateSubject = (title) => SUBJECT_TRANSLATIONS[title] || title;

export default function CreateAccountStep2() {
  const navigate = useNavigate();

  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedYears, setSelectedYears] = useState(0);

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
    setSelectedYears(0);
  };

  const addSubject = () => {
    if (!selectedSubjectId) {
      setError('يرجى اختيار مادة');
      return;
    }
    if (!selectedLevelId) {
      setError('يرجى اختيار مستوى');
      return;
    }
    if (
      addedSubjects.find(
        (s) => s.subject_id === Number(selectedSubjectId) && s.level_id === Number(selectedLevelId)
      )
    ) {
      setError('هذه المادة بهذا المستوى مضافة بالفعل');
      return;
    }

    const subjectInfo = subjectsList.find((s) => s.subject_id === Number(selectedSubjectId));
    const levelInfo = levelsList.find((l) => l.level_id === Number(selectedLevelId));

    setAddedSubjects([
      ...addedSubjects,
      {
        subject_id: Number(selectedSubjectId),
        level_id: Number(selectedLevelId),
        subject_title: translateSubject(subjectInfo?.subject_title || ''),
        level_title: levelInfo?.level_title || '',
        years: Number(selectedYears) || 0,
      }
    ]);

    resetAddSubjectFields();
    setError('');
  };

  const removeSubject = (index) => {
    const newList = [...addedSubjects];
    newList.splice(index, 1);
    setAddedSubjects(newList);
    setError('');
  };

  const updateYears = (index, newYears) => {
    const newList = [...addedSubjects];
    newList[index].years = Number(newYears);
    setAddedSubjects(newList);
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
          experience_years: s.years,
        }))
      };

      const response = await registerTutorStep2(payload);

      if (response?.data?.registration_token) {
        localStorage.setItem('tutor_registration_token', response.data.registration_token);
      } else {
        console.warn('⚠️ لم يتم العثور على registration_token في الرد:', response);
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
          <h2>المواد والصفوف الدراسية</h2>
          <p className="welcom">اختر المواد التي تُدرِّسها وحدد سنوات خبرتك لكل مادة.</p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 2 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="subjects-white-container">
          {isLoadingCatalog && <div className="error-message-subjects">جارِ تحميل قائمة المواد والمستويات...</div>}
          {catalogError && <div className="error-message-subjects">{catalogError}</div>}

          {!isLoadingCatalog && !catalogError && (
            <div className="add-subject-section">
              <div className="add-subject-controls">
                <select
                  className="subject-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">-- اختر المادة --</option>
                  {subjectsList.map((sub) => (
                    <option key={sub.subject_id} value={sub.subject_id}>
                      {translateSubject(sub.subject_title)}
                    </option>
                  ))}
                </select>

                <select
                  className="subject-select"
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                >
                  <option value="">-- اختر المستوى --</option>
                  {levelsList.map((lvl) => (
                    <option key={lvl.level_id} value={lvl.level_id}>
                      {lvl.level_title}
                    </option>
                  ))}
                </select>

                <div className="years-input-group">
                  <input
                    type="number"
                    className="years-input-add"
                    placeholder="سنوات الخبرة"
                    value={selectedYears}
                    onChange={(e) => setSelectedYears(e.target.value)}
                    min="0"
                  />
                  <button className="add-btn" onClick={addSubject} type="button">
                    <FaPlus /> إضافة مادة
                  </button>
                </div>
              </div>

              {error && <div className="error-message-subjects">{error}</div>}
            </div>
          )}

          {addedSubjects.length > 0 && (
            <div className="added-subjects-list">
              <div className="subjects-header">
                <span className="subjects-header-title">المواد المضافة</span>
              </div>
              {addedSubjects.map((subject, index) => (
                <div key={index} className="subject-item-added">
                  <div className="subject-info-added">
                    <span className="subject-name-added">
                      {subject.subject_title} - {subject.level_title}
                    </span>
                    <div className="subject-years-edit">
                      <label className="years-label-small">سنوات الخبرة:</label>
                      <input
                        type="number"
                        className="years-edit-input"
                        value={subject.years}
                        onChange={(e) => updateYears(index, e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <button className="delete-subject-btn" onClick={() => removeSubject(index)} type="button">
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="tutorbuttons">
            <button className="movetostep2" onClick={handleNext} disabled={isSubmitting} type="button">
              <FaArrowRight className="btn-icon" /> {isSubmitting ? 'جارِ الإرسال...' : 'متابعة للخطوة التالية'}
            </button>
            <button
              className="cancele"
              onClick={() => navigate('/create-account/step1')}
              disabled={isSubmitting}
              type="button"
            >
              <FaArrowLeft className="btn-icon" /> رجوع
            </button>
          </div>

          <p className="haveaccount">
            لديك حساب بالفعل ؟{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}