<<<<<<< HEAD
import '../styles/HowitWorkSteps.css';
=======
import '../styles/tstyle/HowitWorkSteps.css';
>>>>>>> 8041f6f5 (new name)
import { FaSearch, FaComments, FaChalkboardTeacher, FaUserEdit, FaBook, FaEnvelope } from 'react-icons/fa';

export default function HowitWorkSteps({ title, description }) {
  // اختيار الأيقونة المناسبة حسب العنوان
  const getIcon = () => {
    switch (title) {
      case 'ابحث عن مدرس':
        return <FaSearch className="step-icon" />;
      case 'تواصل واحجز':
        return <FaComments className="step-icon" />;
      case 'ابدأ التعلم':
        return <FaChalkboardTeacher className="step-icon" />;
      case 'ابحث':
        return <FaSearch className="step-icon" />;
      case 'تواصل':
        return <FaComments className="step-icon" />;
      case 'تعلم':
        return <FaChalkboardTeacher className="step-icon" />;
        case 'بناء الملف الشخصي':
        return <FaUserEdit className="step-icon" />;
      case 'المواد والمعايير':
        return <FaBook className="step-icon" />;
      case 'إدارة الطلبات':
        return <FaEnvelope className="step-icon" />;
      case 'تقديم الدروس':
        return <FaChalkboardTeacher className="step-icon" />;
      default:
        return <FaSearch className="step-icon" />;
    }
  };

  return (
    <div className="stepsCard">
      <div className="icon-wrapper">{getIcon()}</div>
      <div className="stepTitle">{title}</div>
      <div className="stepDescription">{description}</div>
    </div>
  );
}