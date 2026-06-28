import '../../styles/Dashboard.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/common/DashboardHeader';
import MainPage from '../../components/tabs/MainPage';
import Requests from '../../components/tabs/Requests';
import PrivateRequests from '../../components/tabs/PrivateRequests';
import MyOffers from '../../components/tabs/MyOffers';
import MyContacts from '../../components/tabs/MyContacts';
import Footer from '../../components/common/Footer';
import TeachersTab from '../../components/tabs/TeacherTab';
import TutorProfile from './TutorProfile';
import Notifications from './Notifications';
import {
  useDashboardHomeBackGuard,
  useDashboardInternalBackGuard,
} from '../../hooks/useDashboardHomeBackGuard';
import useNotificationSocket from '../../hooks/useNotificationSocket';
import useUnreadNotifications from '../../hooks/useUnreadNotifications';
import NotificationToast from '../../components/NotificationToast';
import { consumeTutorFreshLogin, seedDashboardAsCurrentEntry } from '../../utils/dashboardHistory';

const TAB_PATHS = {
  home: '/dashboard/home',
  publicRequests: '/dashboard/requests',
  privateRequests: '/dashboard/private-requests',
  myOffers: '/dashboard/offers',
  teachers: '/dashboard/teachers',
  profile: '/dashboard/profile',
  Notifications: '/dashboard/notifications',
};

function tabFromPath(pathname) {
  if (pathname.includes('/private-requests')) return 'privateRequests';
  if (pathname.includes('/offers')) return 'myOffers';
  if (pathname.includes('/requests')) return 'publicRequests';
  if (pathname.includes('/teachers')) return 'teachers';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/notifications')) return 'Notifications';
  return 'home';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabFromPath(location.pathname);
  const [profileIntent, setProfileIntent] = useState(null);
  const { unreadCount, refreshUnread } = useUnreadNotifications();

  useNotificationSocket(true);

  useDashboardHomeBackGuard();
  useDashboardInternalBackGuard();

  useEffect(() => {
    if (consumeTutorFreshLogin()) {
      seedDashboardAsCurrentEntry('/dashboard/home');
    }
  }, []);

  const setActiveTab = (tab) => {
    navigate(TAB_PATHS[tab] || TAB_PATHS.home);
  };

  const goToRequests = (filter = 'all') => {
    if (filter === 'private') {
      navigate('/dashboard/private-requests');
      return;
    }
    navigate('/dashboard/requests');
  };

  const goToMyOffers = () => {
    navigate('/dashboard/offers');
  };

  const goToContacts = () => {
    navigate('/dashboard/private-requests/contacts');
  };

  const goToProfile = (intent = null) => {
    if (intent) setProfileIntent(intent);
    navigate('/dashboard/profile');
  };

  const goToLeadDetail = (leadId, isPublic = true) => {
    navigate(
      isPublic
        ? `/dashboard/requests/${leadId}`
        : `/dashboard/private-requests/${leadId}`
    );
  };

  return (
    <div className="page-container2">
      <NotificationToast onViewNotifications={() => navigate('/dashboard/notifications')} />
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        onOpenNotifications={() => setActiveTab('Notifications')}
      />
      <div className="homePageContent">
        <Routes>
          <Route index element={<Navigate to="home" replace />} />
          <Route
            path="home"
            element={
              <MainPage
                onGoToRequests={goToRequests}
                onGoToMyOffers={goToMyOffers}
                onGoToContacts={goToContacts}
                onGoToProfile={goToProfile}
                onGoToLeadDetail={goToLeadDetail}
              />
            }
          />
          <Route path="requests/:leadId" element={<Requests />} />
          <Route path="requests" element={<Requests />} />
          <Route path="private-requests/contacts/:leadId?" element={<MyContacts />} />
          <Route path="private-requests/:leadId" element={<PrivateRequests />} />
          <Route path="private-requests" element={<PrivateRequests />} />
          <Route path="offers" element={<MyOffers />} />
          <Route path="teachers" element={<TeachersTab />} />
          <Route
            path="profile"
            element={
              <TutorProfile
                profileIntent={profileIntent}
                onIntentConsumed={() => setProfileIntent(null)}
              />
            }
          />
          <Route path="notifications" element={<Notifications onRead={refreshUnread} />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
