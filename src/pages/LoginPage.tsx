// @ts-nocheck
import React from 'react';
// import { useAuth } from '../context/AuthContext'; // import useAuth hook
import LoginForm from '../components/Login';
import { User } from '../types/types';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ymcaWorldImg from '../assets/images/ymca-world.png';
import ymca from '../assets/images/image.png'
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
      role: 'admin', // Set the role here based on the email
    };

    // Store the user in localStorage
    localStorage.setItem('tokn', '098765WSDCGVHBVFGHJKLKJHGFDGHJIMKNJBHVGFTFHVHJN');
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={ymcaWorldImg} 
          alt="YMCA Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/75"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 py-12">
        {/* <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mb-8 backdrop-blur-sm bg-white/10 p-6 rounded-lg shadow-xl"
        >
          <div className="text-center">
            <div className="flex justify-center">
            <Link to={'/'} >
                <img 
                    src={ymca} 
                    alt="YMCA Lagos Logo" 
                    className="h-10 w-auto object-contain" 
                  />
              </Link>
            </div>
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-md backdrop-blur-sm bg-white/10 p-8 rounded-lg shadow-xl"
        >
          <LoginForm onLogin={handleLogin} />
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
