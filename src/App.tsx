// App.tsx (continued)
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import UserListingPage from './pages/admin/UserListingPage';
import MemberDashboard from './pages/admin/MemberDashboard';
import UpdatesPage from './pages/UpdatesPage';
import AdminUpdatesPage from './pages/admin/AdminUpdatesPage';
import RoleBasedRoute from './components/RoleBasedRoute';
import MemberDashboardMember from './pages/MemberDashboardMember';
import { useAuth } from './context/NewAuthContext';
import TransactionValidation from './pages/TransactionValidation';
import DashboardPage from './pages/DashboardPage';
// import { AuthState } from './types';

const App: React.FC = () => {
  const { user } = useAuth();



  return (
    <>
    <ToastContainer />
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage  />} />
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute element={<MemberDashboardMember />} />} />
        <Route path="/myid" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/payment" element={<PrivateRoute element={<TransactionValidation />} />} />
        <Route path="/updates" element={<PrivateRoute element={<UpdatesPage />} />} />
        <Route path="/admin/dashboard" element={<RoleBasedRoute element={<MemberDashboard />} requiredRole="Admin" />} />
        <Route path="/admin/users" element={<RoleBasedRoute element={<UserListingPage />}  requiredRole="Admin"/>} />
        <Route path="/admin/updates" element={<RoleBasedRoute element={<AdminUpdatesPage />}  requiredRole="Admin"/>} />
        <Route path="*" element={<Navigate to={user?.role == "Admin" ? "/admin/dashboard" : "/dashboard"} />} />
      </Routes>
    </Router>
    
    </>
    
  );
};

export default App;