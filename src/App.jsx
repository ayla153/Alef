import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminRequestDetails from './pages/admin/AdminRequestDetails.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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

      </Routes>
    </BrowserRouter>
  );
}