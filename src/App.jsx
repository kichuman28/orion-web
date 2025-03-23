import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import CommitteeDashboard from './pages/CommitteeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitPaper from './pages/SubmitPaper';
import MyPapers from './pages/MyPapers';
import Profile from './pages/Profile';
import WalletConnection from './pages/WalletConnection';
import PaperApprovals from './pages/PaperApprovals';
import MyReviews from './pages/MyReviews';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import CommitteePage from './pages/CommitteePage';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="relative min-h-screen">
          {showSplash && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes that require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/submit-paper" element={<SubmitPaper />} />
              <Route path="/papers" element={<MyPapers />} />
              <Route path="/papers/:paperId" element={<MyPapers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet-connection" element={<WalletConnection />} />
              
              {/* Committee routes */}
              <Route element={<RoleBasedRoute allowedRoles={['committee', 'admin']} />}>
                <Route path="/committee-dashboard" element={<CommitteeDashboard />} />
                <Route path="/paper-approvals" element={<PaperApprovals />} />
                <Route path="/my-reviews" element={<MyReviews />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/committee" element={<CommitteePage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
