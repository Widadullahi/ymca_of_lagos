// App.tsx (continued)
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MetronicLoginPage from './pages/MetronicLoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import UserListingPage from './pages/admin/UserListingPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import MemberDashboard from './pages/admin/MemberDashboard';
import AdminUpdatesPage from './pages/admin/AdminUpdatesPage';
import RoleBasedRoute from './components/RoleBasedRoute';
import MemberDashboardMember from './pages/MemberDashboardMember';
import { useAuth } from './context/NewAuthContext';
import TransactionValidation from './pages/TransactionValidation';
import DashboardPage from './pages/DashboardPage';
import ProfileManagementPage from './components/ProfileManagementPage';
import HomePage from './pages/HomePage';
import RequestForm from './pages/MembershipRequestPage';
import MetronicMembershipRequestPage from './pages/MetronicMembershipRequestPage';
import MemberRequestListing from './pages/admin/MemberRequestListing';
import MemberRequestDetailPage from './pages/admin/MemberRequestDetailPage';
import QRVerificationPage from './pages/QRVerificationPage';
import AboutUsPage from './pages/AboutUsPage';
import AboutMeV2 from './components/AboutMeV2';
import StaffAdminPage from './pages/admin/StaffAdminPage';
import HistoryPage from './components/HistoryPage';
import Vision2030Page from './components/Vision2030Page';
import LatestNewsPage from './pages/LatestNewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminSignaturePage from './pages/admin/AdminSignaturePage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import AdminAccessPage from './pages/admin/AdminAccessPage';



// import { AuthState } from './types';

const App: React.FC = () => {
  const { user } = useAuth();



  return (
    <>
    <ToastContainer />
    <Router>
      <Routes>
        <Route path="/" element={<HomePage  />} />
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/login-metronic" element={<MetronicLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/membership-request" element={<RequestForm />} />
        <Route path="/membership-request-metronic" element={<MetronicMembershipRequestPage />} />
        <Route path="/verify" element={<QRVerificationPage />} />
        <Route path="/about-" element={<AboutUsPage />} /> 
        <Route path="/about-us" element={<AboutMeV2 />} />
        <Route path="/vision-2030" element={<Vision2030Page />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/news" element={<LatestNewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<MemberDashboardMember />} />} />
        <Route path="/complete-profile" element={<PrivateRoute element={<CompleteProfilePage />} />} />
        <Route path="/account" element={<PrivateRoute element={<ProfileManagementPage />} />} />
        <Route path="/myid" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/payment" element={<PrivateRoute element={<TransactionValidation />} />} />
        <Route path="/admin/dashboard" element={<RoleBasedRoute element={<MemberDashboard />} requiredRole="Admin" />} />
        <Route path="/admin/staff" element={<RoleBasedRoute element={<StaffAdminPage />} requiredRole="Admin" />} />
        <Route path="/admin/admin-access" element={<RoleBasedRoute element={<AdminAccessPage />} requiredRole="Admin" />} />
        <Route path="/admin/users" element={<RoleBasedRoute element={<UserListingPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/users/:userId" element={<RoleBasedRoute element={<UserDetailPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/membership-request" element={<RoleBasedRoute element={<MemberRequestListing />}  requiredRole="Admin"/>} />
        <Route path="/admin/membership-request/:requestId" element={<RoleBasedRoute element={<MemberRequestDetailPage />}  requiredRole="Admin"/>} />
        
        {/* Admin Updates Routes */}
        <Route path="/admin/updates" element={<RoleBasedRoute element={<AdminUpdatesPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/updates/create" element={<RoleBasedRoute element={<AdminUpdatesPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/updates/edit/:id" element={<RoleBasedRoute element={<AdminUpdatesPage />}  requiredRole="Admin"/>} />
        
        <Route path="/admin/account" element={<RoleBasedRoute element={<ProfileManagementPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/signature" element={<RoleBasedRoute element={<AdminSignaturePage />} requiredRole="Admin" />} />
        <Route path="*" element={<Navigate to={user?.role == "Admin" ? "/admin/dashboard" : "/dashboard"} />} />
      </Routes>
    </Router>
    
    </>
  )
};

export default App;
