import { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HomeTab from '../../components/tabs/HomeTab';
import TeachersTab from '../../components/tabs/TeacherTab';
import HowItWorksTab from '../../components/tabs/HowItWorksTab';

export default function LandingPageMainPage() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="MainPage page-container2">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="homePageContent">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'howItWorks' && <HowItWorksTab />}
      </div>
      <Footer />
    </div>
  );
}