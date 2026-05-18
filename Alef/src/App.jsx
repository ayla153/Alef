import { Routes, Route } from "react-router-dom";

import HomePage from "./Pages/student/HomePage";
import TutorsPage from "./Pages/student/TutorsPage";
import Profile from "./Pages/student/Profile";
import FavPage from "./Pages/student/FavPage";
import Notifications from "./Pages/student/notification";
import TeacherProfile from "./Pages/student/TeacherProfile";

import LandingPageMainPage from "./Pages/teacher/LandingPageMainPage"
import SelectionPage from "./Pages/student/SelectionPage";
import CreateStudentAccount from "./Pages/student/CreateStudentAccount";
import CreateAccountStep1 from "./Pages/teacher/CreateAccountStep1";
import CreateAccountStep2 from "./Pages/teacher/CreateAccountStep2";
import CreateAccountStep3 from "./Pages/teacher/CreateAccountStep3";
import CreateAccountStep4 from "./Pages/teacher/CreateAccountStep4";
import Login from "./Pages/student/login";
import OTP from "./Pages/student/OTP";

import Dashboard from "./Pages/teacher/Dashboard"

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
    </Routes>
  );
}

export default App;
