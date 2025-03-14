// App.tsx (continued)
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { AuthState } from './types/types';
import PrivateRoute from './components/PrivateRoute';
import UserListingPage from './pages/admin/UserListingPage';
import MemberDashboard from './pages/admin/MemberDashboard';
import UpdatesPage from './pages/UpdatesPage';
import AdminUpdatesPage from './pages/admin/AdminUpdatesPage';
// import { AuthState } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });



  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/register" element={<RegisterPage setAuth={setAuth} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/updates" element={<PrivateRoute element={<UpdatesPage />} />} />
        <Route path="/admin-dashboard" element={<PrivateRoute element={<MemberDashboard />} />} />
        <Route path="/admin/users" element={<PrivateRoute element={<UserListingPage />} />} />
        <Route path="/admin/updates" element={<PrivateRoute element={<AdminUpdatesPage />} />} />
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/admin-dashboard"} />} />
      </Routes>
    </Router>
  );
};

export default App;