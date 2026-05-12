import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPageMainPage from './pages/LandingPageMainPage';
import Login from './pages/Login';
import CreateAccountStep1 from './pages/CreateAccountStep1';
import CreateAccountStep2 from './pages/CreateAccountStep2';
import CreateAccountStep3 from './pages/CreateAccountStep3';
import CreateAccountStep4 from './pages/CreateAccountStep4';
import Dashboard from './pages/Dashboard';

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
      </Routes>
    </BrowserRouter>
  );
}