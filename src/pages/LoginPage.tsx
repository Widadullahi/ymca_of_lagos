// pages/LoginPage.tsx
import React from 'react';
import { AuthState, User } from '../types/types';
import LoginForm from '../components/Login';


interface LoginPageProps {
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setAuth }) => {
  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate against a backend
    // For demo purposes, we'll just set a mock user
    console.log(password)
    const mockUser: User = {
      id: '1',
      firstName: 'Adefemi',
      lastName: 'Adedugbe',
      email: email,
      registrationNumber: 'LYA 697',
      category: 'ADULT MEMBER',
      registrationEndDate: '31/05/24',
      photo: 'https://via.placeholder.com/150',
      signature: '',
    };

    setAuth({
      user: mockUser,
      isAuthenticated: true
    });
  };

  

  return (
    <div className="min-h-screen  bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md mb-8">
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
      
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;