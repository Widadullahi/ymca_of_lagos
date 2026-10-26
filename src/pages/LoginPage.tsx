// @ts-nocheck
import React from 'react';
// import { useAuth } from '../context/AuthContext'; // import useAuth hook
import LoginForm from '../components/Login';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ymcaWorldImg from '../assets/images/image2.jpg';
import ymca from '../assets/images/image.png'
const LoginPage: React.FC = () => {
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
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
