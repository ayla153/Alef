
import LandingPageMainPage from './pages/LandingPageMainPage';
import Login from './pages/Login';
import CreateAccountStep1 from './pages/CreateAccountStep1';
import CreateAccountStep2 from './pages/CreateAccountStep2';
import CreateAccountStep3 from './pages/CreateAccountStep3';
import CreateAccountStep4 from './pages/CreateAccountStep4';
import Dashboard from './pages/Dashboard';
import TutorProfile from './pages/TutorProfile';
import HowItWorksTab from './components/tabs/HowItWorksTab';
import AdminTeacherDetails from './pages/Admin/AdminTeacherDetails';
import TeachersTab from './components/tabs/TeacherTab';
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminRequestDetails from './pages/admin/AdminRequestDetails.jsx';
import TeacherProfile from './components/TeacherProfile.jsx';


import { Routes, Route } from "react-router-dom";

import HomePage from "./Pages/student/HomePage";
import TutorsPage from "./Pages/student/TutorsPage";
import Profile from "./Pages/student/Profile";
import FavPage from "./Pages/student/FavPage";
import Notifications from "./Pages/student/notification";
import TeacherProfile from "./Pages/student/TeacherProfile";

import LandingPageMainPage from "./Pages/teacher/LandingPageMainPage";
import SelectionPage from "./Pages/student/SelectionPage";
import CreateStudentAccount from "./Pages/student/CreateStudentAccount";
import CreateAccountStep1 from "./Pages/teacher/CreateAccountStep1";
import CreateAccountStep2 from "./Pages/teacher/CreateAccountStep2";
import CreateAccountStep3 from "./Pages/teacher/CreateAccountStep3";
import CreateAccountStep4 from "./Pages/teacher/CreateAccountStep4";
import Login from "./Pages/student/login";
import OTP from "./Pages/student/OTP";

import Dashboard from "./Pages/teacher/Dashboard";

import CreateLeadWizard from "./Pages/student/CreateLeadWizard";
import MyLeads from "./Pages/student/MyLeads";
import LeadDetailsPage from "./Pages/student/LeadDetailsContainer";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageMainPage />} />
      <Route path="/selection" element={<SelectionPage />} />
      <Route path="/register" element={<CreateStudentAccount />} />
      <Route path="/teacher/register" element={<CreateAccountStep1 />} />
      <Route path="/create-account/step2" element={<CreateAccountStep2 />} />
      <Route path="/create-account/step3" element={<CreateAccountStep3 />} />
      <Route path="/create-account/step4" element={<CreateAccountStep4 />} />
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<OTP />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/tutors" element={<TutorsPage />} />
      <Route path="/favorites" element={<FavPage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/teacher/profile" element={<TeacherProfile />} />

      <Route path="/Dashboard" element={<Dashboard />} />

      <Route path="/Create/Lead" element={<CreateLeadWizard />} />
      <Route path="/MyLeads" element={<MyLeads />} />
     <Route path="/lead/:id" element={<LeadDetailsPage />} />
     <Route path="/" element={<LandingPageMainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account/step1" element={<CreateAccountStep1 />} />
        <Route path="/create-account/step2" element={<CreateAccountStep2 />} />
        <Route path="/create-account/step3" element={<CreateAccountStep3 />} />
        <Route path="/create-account/step4" element={<CreateAccountStep4 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<TutorProfile />} />
        <Route path="/how-it-works" element={<HowItWorksTab />} />
        <Route path="/teachers" element={<TeachersTab />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/request/:id" element={<AdminRequestDetails />} />
        <Route path="/admin/teacher/:id" element={<AdminTeacherDetails />} />
        <Route path="/teacher-profile/:id" element={<TeacherProfile />} />


    </Routes>
  );
}

export default App;
