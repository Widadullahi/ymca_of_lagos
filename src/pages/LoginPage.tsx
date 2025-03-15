// @ts-nocheck
import React from 'react';
// import { useAuth } from '../context/AuthContext'; // import useAuth hook
import LoginForm from '../components/Login';
import { User } from '../types/types';

const LoginPage: React.FC = () => {

  const handleLogin = (email: string, password: string) => {
    console.log(password);

    // Set user role based on email
    const userRole = email === 'olakay@gmail.com' ? 'admin' : 'member';

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
      role: userRole, // Set the role here based on the email
    };

    // Store the user in localStorage
    localStorage.setItem('tokn', '098765WSDCGVHBVFGHJKLKJHGFDGHJIMKNJBHVGFTFHVHJN');
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">YMCA OF LAGOS</h1>
          <p className="text-gray-600">ID Card Management System</p>
        </div>
      </div>

      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
