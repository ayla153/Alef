import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "../../styles/tstyle/CreateAccountStep2.css";
import logo from "../../assets/logo_noBG.png";
import { Link } from "react-router-dom";

export default function CreateAccountStep2() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([
    { id: 1, name: "الرياضيات", selected: false, years: 0 },
    { id: 2, name: "اللغة العربية", selected: false, years: 0 },
    { id: 3, name: "اللغة الانكليزية", selected: false, years: 0 },
    { id: 4, name: "اللغة الفرنسية", selected: false, years: 0 },
    { id: 5, name: "العلوم", selected: false, years: 0 },
    { id: 6, name: "الفيزياء", selected: false, years: 0 },
    { id: 7, name: "الكيمياء", selected: false, years: 0 },
    { id: 8, name: "التربية الاسلامية", selected: false, years: 0 },
    { id: 9, name: "التاريخ", selected: false, years: 0 },
    { id: 10, name: "الجغرافية", selected: false, years: 0 },
    { id: 11, name: "الوطنية", selected: false, years: 0 },
    { id: 12, name: "معلوماتية", selected: false, years: 0 },
  ]);

  const [levels, setLevels] = useState([
    {
      id: 1,
      name: "المرحلة الابتدائية",
      description: "من الصف الأول إلى الصف السادس",
      selected: false,
    },
    {
      id: 2,
      name: "المرحلة الإعدادية",
      description: "من الصف السابع إلى الصف التاسع",
      selected: false,
    },
    {
      id: 3,
      name: "المرحلة الثانوية",
      description: "من الصف العاشر إلى البكالوريا",
      selected: false,
    },
    { id: 4, name: "تأسيس", description: "", selected: false },
  ]);

  const toggleSubject = (id) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === id
          ? { ...subject, selected: !subject.selected }
          : subject,
      ),
    );
  };

  const handleYearsChange = (id, value) => {
    const numericValue = Number(value);
    setSubjects(
      subjects.map((subject) =>
        subject.id === id ? { ...subject, years: numericValue } : subject,
      ),
    );
  };

  const toggleLevels = (id) => {
    setLevels(
      levels.map((level) =>
        level.id === id ? { ...level, selected: !level.selected } : level,
      ),
    );
  };

  return (
    <div className="page-container2 fade-in">
      <img className="create-student-account__logo" src={logo} alt="logo" />

      <div className="content">
        <div className="titleforstep1">
          <h2>المواد و الصفوف الدراسية</h2>
          <p className="welcom">
            يرجى اختيار المواد و المراحل الدراسية التي تُدرِّسُها .
          </p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 2 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "50%" }}></div>
            </div>
          </div>
        </div>
        <div className="subjectsandlevels">
          <div className="subjectssection">
            <div className="levelsandsubjects">المواد الدّراسيّة</div>
            <div className="subjects">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`subject-card ${subject.selected ? "subject-cardselected" : ""}`}
                >
                  <div className="subject-card__info">
                    <input
                      type="checkbox"
                      checked={subject.selected}
                      onChange={() => toggleSubject(subject.id)}
                      id={`subject-${subject.id}`}
                      className="subject-checkbox"
                    />
                    <label
                      htmlFor={`subject-${subject.id}`}
                      className="subject-label"
                    >
                      {subject.name}
                    </label>
                  </div>
                  <div className="subject-years">
                    <span className="subject-years__text">سنوات الخبرة:</span>
                    <input
                      type="number"
                      min="0"
                      value={subject.years}
                      onChange={(e) =>
                        handleYearsChange(subject.id, e.target.value)
                      }
                      disabled={!subject.selected}
                      className="subject-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="levelsandsubjects">المراحل الدّراسيّة</div>
            <div className="levels">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className={`levelCard ${level.selected ? "levelCardselected" : ""}`}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={level.selected}
                      onChange={() => toggleLevels(level.id)}
                      id={`level-${level.id}`}
                      className="level-checkbox"
                    />
                    <label
                      htmlFor={`level-${level.id}`}
                      className="level-label"
                    >
                      {level.name}
                    </label>
                  </div>
                  <div className="description">{level.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="tutorbuttons">
            <button
              className="movetostep2"
              onClick={() => {
                navigate("/create-account/step3");
              }}
            >
              <FaArrowRight className="btn-icon" />
              متابعة للخطوة التالية
            </button>
            <button
              className="cancele"
              onClick={() => {
                navigate("/teacher/register");
              }}
            >
              {" "}
              <FaArrowLeft className="btn-icon" />{" "}
            </button>
          </div>
          <p className="haveaccount">
            لديك حساب بالفعل ؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
