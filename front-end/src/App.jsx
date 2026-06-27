import { Routes, Route } from 'react-router-dom';

import LandingPageMainPage from './Pages/teacher/LandingPageMainPage';
import HowItWorksTab from './components/tabs/HowItWorksTab';
import TeachersTab from './components/tabs/TeacherTab';
import LandingTeacherProfile from './components/TeacherProfile.jsx';
import Dashboard from './Pages/teacher/Dashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import AdminLogin from './Pages/Admin/AdminLogin.jsx';
import AdminRequestDetails from './Pages/Admin/AdminRequestDetails.jsx';
import AdminTeacherDetails from './Pages/Admin/AdminTeacherDetails';
import AdminTeacherReport from './Pages/Admin/AdminTeacherReport';
import AdminRouteGuard from './components/AdminRouteGuard';

import HomePage from './Pages/student/HomePage';
import TutorsPage from './Pages/student/TutorsPage';
import Profile from './Pages/student/Profile';
import FavPage from './Pages/student/FavPage';
import Notifications from './Pages/student/notification';
import TeacherProfile from './Pages/student/TeacherProfile';
import SelectionPage from './Pages/student/SelectionPage';
import CreateStudentAccount from './Pages/student/CreateStudentAccount';
import Login from './Pages/student/login';
import ForgotPassword from './Pages/student/ForgotPassword';
import ResetPassword from './Pages/student/ResetPassword';
import OTP from './Pages/student/OTP';
import CreateLeadWizard from './Pages/student/CreateLeadWizard';
import MyLeads from './Pages/student/MyLeads';
import LeadDetailsPage from './Pages/student/LeadDetailsContainer';

import CreateAccountStep1 from './Pages/teacher/CreateAccountStep1';
import CreateAccountStep2 from './Pages/teacher/CreateAccountStep2';
import CreateAccountStep3 from './Pages/teacher/CreateAccountStep3';
import CreateAccountStep4 from './Pages/teacher/CreateAccountStep4';
import SessionExpiryPrompt from './components/SessionExpiryPrompt';

function App() {
  return (
    <>
      <SessionExpiryPrompt />
      <Routes>
        <Route path="/" element={<LandingPageMainPage />} />
        <Route path="/how-it-works" element={<HowItWorksTab />} />
        <Route path="/teachers" element={<TeachersTab />} />
        <Route path="/teacher-profile/:id" element={<LandingTeacherProfile />} />

        <Route path="/selection" element={<SelectionPage />} />
        <Route path="/register" element={<CreateStudentAccount />} />
        <Route path="/teacher/register" element={<CreateAccountStep1 />} />
        <Route path="/create-account/step1" element={<CreateAccountStep1 />} />
        <Route path="/create-account/step2" element={<CreateAccountStep2 />} />
        <Route path="/create-account/step3" element={<CreateAccountStep3 />} />
        <Route path="/create-account/step4" element={<CreateAccountStep4 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp" element={<OTP />} />

        <Route path="/home" element={<HomePage />} />
        <Route path="/tutors" element={<TutorsPage />} />
        <Route path="/tutor/:tutor_id" element={<TeacherProfile />} />
        <Route path="/favorites" element={<FavPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />

        <Route path="/Create/Lead" element={<CreateLeadWizard />} />
        <Route path="/MyLeads" element={<MyLeads />} />
        <Route path="/lead/:id" element={<LeadDetailsPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/request/:id"
          element={
            <AdminRouteGuard>
              <AdminRequestDetails />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/teacher/:id/report"
          element={
            <AdminRouteGuard>
              <AdminTeacherReport />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/teacher/:id"
          element={
            <AdminRouteGuard>
              <AdminTeacherDetails />
            </AdminRouteGuard>
          }
        />
      </Routes>
    </>
  );
}

export default App;
