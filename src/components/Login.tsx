// components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './forms/FormInput';
import { useAuth } from '../context/NewAuthContext';



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
      if (response?.data.user.role === 'Admin') {
        navigate('/admin/dashboard');
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
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
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
          <a 
            className="inline-block align-baseline font-bold text-sm text-red-600 hover:text-red-800"
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
          >
            Register
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;