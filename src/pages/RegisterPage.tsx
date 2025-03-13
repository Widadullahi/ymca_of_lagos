// pages/RegisterPage.tsx
import React from 'react';
import { AuthState, User } from '../types/types';
import RegisterForm from '../components/Register';


interface RegisterPageProps {
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setAuth }) => {
  const handleRegister = (userData: Omit<User, 'id'>) => {
    // In a real app, this would send data to a backend
    // For demo purposes, we'll just set the user
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    };

    setAuth({
      user: newUser,
      isAuthenticated: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg mb-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 rotate-45"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold">YMCA OF LAGOS</h1>
          <p className="text-gray-600">ID Card Management System</p>
        </div>
      </div>
      
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
};

export default RegisterPage;