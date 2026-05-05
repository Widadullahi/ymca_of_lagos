// components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './forms/FormInput';
import { useAuth } from '../context/NewAuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ymca from '../assets/images/image.png'


const LoginForm: React.FC= () => {
  const { fetchWithAuth, displayNotification , setUser , setAuthToken } = useAuth();

  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      email: '',
      password: '',
    });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

  };


  async function handleSubmit(e: React.FormEvent) { 
    e.preventDefault();
  
    try {
      setLoading(true)
      const response = await fetchWithAuth({
        method: 'POST',
        path: `/login/`,
        body: formData,
      });
      
      displayNotification('success',response?.message,);
      
      localStorage.setItem('tokens', JSON.stringify(response?.data.tokens));
      setAuthToken(response?.data.tokens);
      setUser(response?.data.user)
      if (response?.data.user.role == 'Admin') {
        navigate('/admin/dashboard');
      } else if (response?.data.user.profile_completion_required) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching churches:', error);
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white ">
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-6 "
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
        </motion.div>
      <form 
        onSubmit={handleSubmit} 
        className="shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          error={fieldErrors.email}
          required
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          error={fieldErrors.password}
          required
        />
        
        <div className="flex items-center justify-between">
         
          <button
            type="submit"
            disabled={loading}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-700 text-sm">
            Don't have an account?{' '}
            <a 
              href="/membership-request"
              className="font-bold text-red-600 hover:text-red-800"
            >
              Register Now
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
