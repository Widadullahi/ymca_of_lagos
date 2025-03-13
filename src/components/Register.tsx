import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/types';

interface RegisterFormProps {
  onRegister: (user: Omit<User, 'id'>) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState({ photo: false, signature: false });
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (type: 'photo' | 'signature', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'photo') {
        setPhotoPreview(reader.result as string);
      } else {
        setSignaturePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange('photo', file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange('signature', file);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'photo' | 'signature') => {
    e.preventDefault();
    setDragActive({ ...dragActive, [type]: true });
  };

  const handleDragLeave = (e: React.DragEvent, type: 'photo' | 'signature') => {
    e.preventDefault();
    setDragActive({ ...dragActive, [type]: false });
  };

  const handleDrop = (e: React.DragEvent, type: 'photo' | 'signature') => {
    e.preventDefault();
    setDragActive({ ...dragActive, [type]: false });
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(type, file);
    }
  };

  const handleRemoveFile = (type: 'photo' | 'signature') => {
    if (type === 'photo') {
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    } else {
      setSignaturePreview(null);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!photoPreview) {
      setError('Please upload a photo');
      return;
    }

    // Generate registration number (in a real app this would come from the backend)
    const regNumber = `LYA ${Math.floor(100 + Math.random() * 900)}`;
    
    // Calculate registration end date (6 months from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    const formattedEndDate = `${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getFullYear().toString().slice(2)}`;

    const newUser: Omit<User, 'id'> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      registrationNumber: regNumber,
      category: formData.category,
      registrationEndDate: formattedEndDate,
      photo: photoPreview,
      signature: signaturePreview || '',
    };

    onRegister(newUser);
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-lg">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Membership Category
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="ADULT MEMBER">Adult Member</option>
            <option value="YOUTH MEMBER">Youth Member</option>
            <option value="SENIOR MEMBER">Senior Member</option>
          </select>
        </div>
        
        {/* Fancy Photo Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Photo Upload
          </label>
          <div 
            className={`w-full border-2 ${dragActive.photo ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-lg p-4 transition-all duration-200 bg-gray-50 hover:bg-gray-100`}
            onDragOver={(e) => handleDragOver(e, 'photo')}
            onDragLeave={(e) => handleDragLeave(e, 'photo')}
            onDrop={(e) => handleDrop(e, 'photo')}
          >
            <div className="flex flex-col items-center">
              {!photoPreview ? (
                <>
                  <div className="mb-3 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, or GIF (MAX. 800x800px)</p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-4 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Select Photo
                  </button>
                </>
              ) : (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-32 h-40 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('photo')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={photoInputRef}
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        </div>
        
        {/* Fancy Signature Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Signature Upload
          </label>
          <div 
            className={`w-full border-2 ${dragActive.signature ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-lg p-4 transition-all duration-200 bg-gray-50 hover:bg-gray-100`}
            onDragOver={(e) => handleDragOver(e, 'signature')}
            onDragLeave={(e) => handleDragLeave(e, 'signature')}
            onDrop={(e) => handleDrop(e, 'signature')}
          >
            <div className="flex flex-col items-center">
              {!signaturePreview ? (
                <>
                  <div className="mb-3 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, or GIF (Recommended: black signature on white background)</p>
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    className="mt-4 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Select Signature
                  </button>
                </>
              ) : (
                <div className="relative">
                  <img 
                    src={signaturePreview} 
                    alt="Signature" 
                    className="h-20 object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('signature')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={signatureInputRef}
                onChange={handleSignatureChange}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="submit"
          >
            Register
          </button>
          <a 
            className="inline-block align-baseline font-bold text-sm text-red-600 hover:text-red-800 transition duration-200"
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;