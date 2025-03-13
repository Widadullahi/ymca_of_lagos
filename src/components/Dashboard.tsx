// File: src/components/Dashboard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Digital ID System</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {currentUser?.firstName}!</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Your Information</h3>
            <p><strong>Name:</strong> {currentUser?.firstName} {currentUser?.lastName}</p>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>Registration Number:</strong> {currentUser?.registrationNumber}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <Link
              to="/generate-id"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
            >
              Generate ID Card
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;