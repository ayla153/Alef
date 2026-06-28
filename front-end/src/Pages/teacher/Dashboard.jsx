import '../../styles/Dashboard.css'
import { useState } from 'react';
import DashboardHeader from '../../components/common/DashboardHeader';
import MainPage from '../../components/tabs/MainPage'
import Requests from '../../components/tabs/Requests'
import Footer from '../../components/common/Footer'
import TeachersTab from '../../components/tabs/TeacherTab';
import TutorProfile from './TutorProfile';
import Notifications from './Notifications';

export default function Dashboard(){
    const [activeTab, setActiveTab] = useState('home');
    const [requestsFilter, setRequestsFilter] = useState(null);
    const [profileIntent, setProfileIntent] = useState(null);

    const goToRequests = (filter = 'all') => {
        setRequestsFilter(filter);
        setActiveTab('requets');
    };

    const goToProfile = (intent = null) => {
        setProfileIntent(intent);
        setActiveTab('profile');
    };

    return(
        <div className="page-container2">
            <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="homePageContent">
                    {activeTab === 'home' && (
                        <MainPage onGoToRequests={goToRequests} onGoToProfile={goToProfile} />
                    )}
                    {activeTab === 'requets' && (
                        <Requests
                            initialFilter={requestsFilter}
                            onFilterApplied={() => setRequestsFilter(null)}
                        />
                    )}
                    {activeTab === 'teachers' && <TeachersTab/>}
                    {activeTab === 'profile' && (
                        <TutorProfile
                            profileIntent={profileIntent}
                            onIntentConsumed={() => setProfileIntent(null)}
                        />
                    )}
                    {activeTab === 'Notifications' && <Notifications/>}
                </div>
            <Footer />
        </div>
    )
}
