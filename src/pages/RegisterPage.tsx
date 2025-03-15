// pages/RegisterPage.tsx
import React from 'react';
import RegisterForm from '../components/Register';



const RegisterPage: React.FC= () => {


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
      
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;