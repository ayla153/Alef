import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TeachersTab from '../components/tabs/TeacherTab';

/** /teachers — قائمة عامة مع هيدر وفوتر */
export default function PublicTeachersPage() {
  const navigate = useNavigate();

  const handleViewProfile = (teacher) => {
    navigate(`/teacher-profile/${teacher.id}`);
  };

  return (
    <div className="MainPage page-container2">
      <Header activeTab="teachers" />
      <div className="homePageContent">
        <TeachersTab onViewProfile={handleViewProfile} />
      </div>
      <Footer />
    </div>
  );
}
