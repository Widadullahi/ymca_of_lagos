// App.tsx (continued)
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { AuthState } from './types/types';
// import { AuthState } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  const handleLogout = () => {
    setAuth({
      user: null,
      isAuthenticated: false
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
        <Route path="/register" element={<RegisterPage setAuth={setAuth} />} />
        <Route path="/dashboard" element={<DashboardPage auth={auth} logout={handleLogout} />} />
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;