import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import ymcaWorldImg from '../assets/images/ymca-world.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const MetronicLoginPage: React.FC = () => {
  const { fetchWithAuth, displayNotification, setUser, setAuthToken } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e: React.FormEvent) { 
    e.preventDefault();
  
    try {
      setLoading(true);
      const response = await fetchWithAuth({
        method: 'POST',
        path: `/login/`,
        body: formData,
      });
      
      displayNotification('success', response?.message);
      
      localStorage.setItem('tokens', JSON.stringify(response?.data.tokens));
      setAuthToken(response?.data.tokens);
      setUser(response?.data.user);
      
      if (response?.data.user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (response?.data.user.profile_completion_required) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      displayNotification('error', 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen">
      {/* Left side - YMCA background image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img 
          src={ymcaWorldImg} 
          alt="YMCA Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-16">
          <div className="text-white mb-8">
            <h1 className="text-4xl font-bold mb-2">YMCA</h1>
            <p className="text-xl">Young Men's Christian Association</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
          </div>

     
          
          {/* Login form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-blue-500 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Not a Member yet? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
              </p>
            </div>
          </form>
          
          {/* Footer */}
          
        </div>
      </div>
    </div>
  );
};

export default MetronicLoginPage;
