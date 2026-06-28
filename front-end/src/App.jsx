import { Routes, Route } from 'react-router-dom';

import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPageMainPage from './Pages/teacher/LandingPageMainPage';
import HowItWorksTab from './components/tabs/HowItWorksTab';
import PublicTeachersPage from './Pages/PublicTeachersPage';
import PublicTeacherProfilePage from './Pages/PublicTeacherProfilePage';
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
import TutorLogin from './Pages/teacher/Login.jsx';
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
        {/* صفحات عامة */}
        <Route path="/" element={<LandingPageMainPage />} />
        <Route path="/how-it-works" element={<HowItWorksTab />} />
        <Route path="/teachers" element={<PublicTeachersPage />} />
        <Route path="/teacher-profile/:id" element={<PublicTeacherProfilePage />} />

        {/* صفحات الـ auth - بس للزوار */}
        <Route path="/selection" element={<GuestRoute><SelectionPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><CreateStudentAccount /></GuestRoute>} />
        <Route path="/teacher/register" element={<GuestRoute><CreateAccountStep1 /></GuestRoute>} />
        <Route path="/create-account/step1" element={<GuestRoute><CreateAccountStep1 /></GuestRoute>} />
        <Route path="/create-account/step2" element={<GuestRoute><CreateAccountStep2 /></GuestRoute>} />
        <Route path="/create-account/step3" element={<GuestRoute><CreateAccountStep3 /></GuestRoute>} />
        <Route path="/create-account/step4" element={<GuestRoute><CreateAccountStep4 /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/tutor/login" element={<GuestRoute><TutorLogin /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/otp" element={<GuestRoute><OTP /></GuestRoute>} />

        {/* صفحات الطالب - بس للمسجلين */}
        <Route path="/home" element={<ProtectedRoute role="student"><HomePage /></ProtectedRoute>} />
        <Route path="/tutors" element={<ProtectedRoute role="student"><TutorsPage /></ProtectedRoute>} />
        <Route path="/tutor/:tutor_id" element={<ProtectedRoute role="student"><TeacherProfile /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute role="student"><FavPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
        <Route path="/Create/Lead" element={<ProtectedRoute role="student"><CreateLeadWizard /></ProtectedRoute>} />
        <Route path="/MyLeads" element={<ProtectedRoute role="student"><MyLeads /></ProtectedRoute>} />
        <Route path="/lead/:id" element={<ProtectedRoute role="student"><LeadDetailsPage /></ProtectedRoute>} />

        {/* صفحات الأستاذ - بس للمسجلين */}
        <Route path="/dashboard/*" element={<ProtectedRoute role="tutor"><Dashboard /></ProtectedRoute>} />

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