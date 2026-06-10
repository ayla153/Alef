import { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HomeTab from '../components/tabs/HomeTab';
import TeachersTab from '../components/tabs/TeacherTab';
import HowItWorksTab from '../components/tabs/HowItWorksTab';
import TeacherProfile from '../components/TeacherProfile';

export default function LandingPageMainPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setActiveTab('profile');
  };

  return (
    <div className="MainPage page-container2">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="homePageContent">
        {activeTab === 'home' && <HomeTab onViewProfile={handleViewProfile} />}
        {activeTab === 'teachers' && (
          <TeachersTab 
            setSelectedTeacher={setSelectedTeacher}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'howItWorks' && <HowItWorksTab />}
        {activeTab === 'profile' && <TeacherProfile teacherData={selectedTeacher} />}
      </div>
      <Footer />
    </div>
  );
}