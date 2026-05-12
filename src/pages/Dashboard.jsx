import '../styles/Dashboard.css'
import { useState } from 'react';
import DashboardHeader from '../components/common/DashboardHeader';
import MainPage from '../components/tabs/MainPage'
import Tutors from '../components/tabs/Tutors'
import Requests from '../components/tabs/Requests'
import Footer from '../components/common/Footer'

export default function Dashboard(){
    const [activeTab, setActiveTab] = useState('home');
    
    return(
        <div className="page-container2">
            <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="homePageContent">
            {activeTab === 'home' && <MainPage />}
            {activeTab === 'teachers' && <Requests />}
            </div>
            <Footer />
        </div>
    )
}