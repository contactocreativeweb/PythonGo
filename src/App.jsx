import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import InstallPWA from './components/InstallPWA';
import Home from './pages/Home';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import './index.css';

function AppInner() {
  const { state } = useApp();

  return (
    <div className={state.darkMode ? '' : 'light-mode'}>
      <InstallPWA />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/lesson/:moduleId/:lessonId" element={<LessonPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Navbar />
      </BrowserRouter>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AuthProvider>
  );
}
