import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/CreateAccountStep2.css';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrashAlt } from 'react-icons/fa';
import logo from '../assets/Alef-logo.jpg';

export default function CreateAccountStep2() {
  const navigate = useNavigate();

  const allSubjects = [
    'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
    'العلوم', 'الفيزياء', 'الكيمياء', 'ديانة',
    'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية'
  ];

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYears, setSelectedYears] = useState(0);
  const [addedSubjects, setAddedSubjects] = useState([]);
  const [error, setError] = useState('');

  const addSubject = () => {
    if (!selectedSubject) {
      setError('يرجى اختيار مادة');
      return;
    }
    if (addedSubjects.find(s => s.name === selectedSubject)) {
      setError('هذه المادة مضافة بالفعل');
      return;
    }
    setAddedSubjects([...addedSubjects, { name: selectedSubject, years: selectedYears }]);
    setSelectedSubject('');
    setSelectedYears(0);
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

  const handleNext = () => {
    if (addedSubjects.length === 0) {
      setError('يجب إضافة مادة واحدة على الأقل للمتابعة');
      return;
    }
    navigate('/create-account/step3');
  };

  return (
    <div className="page-container2 fade-in">
      <header className="steponeheader">
        <div className="logoAndtitle">
          <img className="Alef-logo" src={logo} alt="logo" />
          إنشاء حساب مُعلّم - منصَّة ألِف
        </div>
      </header>
      <div className="content">
        <div className="titleforstep1">
          <h2>المواد والصفوف الدراسية</h2>
          <p className="welcom">اختر المواد التي تُدرِّسها وحدد سنوات خبرتك لكل مادة.</p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 2 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="subjects-white-container">
          <div className="add-subject-section">
            <div className="add-subject-controls">
              <select
                className="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">-- اختر المادة --</option>
                {allSubjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
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
                <button className="add-btn" onClick={addSubject}>
                  <FaPlus /> إضافة مادة
                </button>
              </div>
            </div>
            {error && <div className="error-message-subjects">{error}</div>}
          </div>

          {addedSubjects.length > 0 && (
            <div className="added-subjects-list">
              <div className="subjects-header">
                <span className="subjects-header-title">المواد المضافة</span>
              </div>
              {addedSubjects.map((subject, index) => (
                <div key={index} className="subject-item-added">
                  <div className="subject-info-added">
                    <span className="subject-name-added">{subject.name}</span>
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
                  <button className="delete-subject-btn" onClick={() => removeSubject(index)}>
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>
          )}
            <div className="tutorbuttons">
            <button className="movetostep2" onClick={handleNext}>
              <FaArrowRight className="btn-icon" /> متابعة للخطوة التالية
            </button>
            <button className="cancele" onClick={() => navigate('/create-account/step1')}>
              <FaArrowLeft className="btn-icon" /> رجوع
            </button>
          </div>
          <p className="haveaccount">
            لديك حساب بالفعل ؟ <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>تسجيل الدخول</a>
          </p>
        </div>
        
      </div>
    </div>
  );
}