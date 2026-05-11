import { Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import TutorsPage from "./Pages/TutorsPage"
import Profile from "./Pages/Profile";
import FavPage from "./Pages/FavPage";
import Notifications from "./Pages/notification";


import SelectionPage from "./Pages/SelectionPage";
import CreateStudentAccount from "./Pages/CreateStudentAccount";
import OTP from "./Pages/OTP";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SelectionPage />} />
      <Route path="/register" element={<CreateStudentAccount />} />
      <Route path="/otp" element={<OTP />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/tutors" element={<TutorsPage />} />
      <Route path="/favorites" element={<FavPage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
