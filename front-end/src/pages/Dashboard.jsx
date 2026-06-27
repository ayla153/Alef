import '../styles/Dashboard.css'
import { useState } from 'react';
import DashboardHeader from '../components/common/DashboardHeader';
import MainPage from '../components/tabs/MainPage'
import Tutors from '../components/tabs/TeacherTab'
import Requests from '../components/tabs/Requests'
import Footer from '../components/common/Footer'
import TeachersTab from '../components/tabs/TeacherTab';
import TutorProfile from './TutorProfile';
import Notifications from './Notifications';

export default function Dashboard(){
    const [activeTab, setActiveTab] = useState('home');
    
    return(
        <div className="page-container2">
            <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="homePageContent">
                    {activeTab === 'home' && <MainPage />}
                    {activeTab === 'requets' && <Requests />}
                    {activeTab === 'teachers' && <TeachersTab/>}
                    {activeTab === 'profile' && <TutorProfile/>}
                    {activeTab === 'Notifications' && <Notifications/>}
                </div>
            <Footer />
        </div>
    )
}