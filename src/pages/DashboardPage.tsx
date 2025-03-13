// pages/DashboardPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import IDCardGenerator from '../components/IDCardGenerator';
import { AuthState } from '../types/types';
// import { AuthState } from '../types';

interface DashboardPageProps {
  auth: AuthState;
  logout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ auth, logout }) => {
  if (!auth.isAuthenticated || !auth.user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 ">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2">
              <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                <div className="w-6 h-6 bg-white flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-600 rotate-45"></div>
                </div>
              </div>
            </div>
            <h1 className="text-xl font-bold">YMCA OF LAGOS</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {auth.user.firstName}</span>
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IDCardGenerator user={auth.user} />
      </main>
    </div>
  );
};

export default DashboardPage;