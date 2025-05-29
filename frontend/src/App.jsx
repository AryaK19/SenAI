import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from './layouts/MainLayout';
import LoginPage from './modules/Login/LoginPage';
import CompanyDashboardPage from './modules/Dashboard/Company/DashboardPage'; 
import CandidateDashboardPage from './modules/Dashboard/Candidate/DashboardPage';
import CandidateProfilePage from './modules/Profile/CandidateProfile/ProfilePage';
import CompanyProfilePage from './modules/Profile/CompanyProfile/ProfilePage';
import BulkResumeUpload from './modules/ResumeUpload/BulkResumeUpload';
import { isAuthenticated, getUserType } from './services/authService';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [userType, setUserType] = useState(getUserType());

  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      const currentUserType = getUserType();
      setAuthenticated(authStatus);
      setUserType(currentUserType);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Component to render appropriate dashboard based on user type
  const DashboardComponent = () => {
    if (userType === 'company') {
      return <CompanyDashboardPage />;
    } else if (userType === 'candidate') {
      return <CandidateDashboardPage />;
    }
    return <Navigate to="/login" replace />;
  };

  // Component to render appropriate profile based on user type
  const ProfileComponent = () => {
    if (userType === 'company') {
      return <CompanyProfilePage />;
    } else if (userType === 'candidate') {
      return <CandidateProfilePage />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route path="/" element={
          authenticated ? <MainLayout /> : <Navigate to="/login" replace />
        }>
          <Route index element={<DashboardComponent />} />
          <Route path="profile" element={<ProfileComponent />} />
          
          {/* Resume upload route - only for company users */}
          <Route 
            path="resume-upload" 
            element={
              authenticated && userType === 'company' 
                ? <BulkResumeUpload /> 
                : <Navigate to="/" replace />
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;