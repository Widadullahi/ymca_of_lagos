// components/Register.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/types';
import { useAuth } from '../context/NewAuthContext';

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

  
  const { fetchWithAuth, displayNotification, setUser, setAuthToken} = useAuth(); 

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


  async function fetchChurches() {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/churches`,
      });
      
      // Transform the API response to our form format
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      throw error;
    }
  }

  async function fetchYouthCouncil() {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/churches`,
      });
      
      // Transform the API response to our form format
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      throw error;
    }
  }



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
            Category
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Member">Member</option>
            <option value="Non-Member">Non-Member</option>
          </select>
        </div>
        
        {/* File Uploads */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
            Upload Photo
          </label>
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <div
            className="w-full border-dashed border-2 p-4 text-center"
            onDragOver={(e) => handleDragOver(e, 'photo')}
            onDragLeave={(e) => handleDragLeave(e, 'photo')}
            onDrop={(e) => handleDrop(e, 'photo')}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-full" />
            ) : (
              <p className="text-gray-500">{dragActive.photo ? 'Release to upload' : 'Drag and drop or click to upload your photo'}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signature">
            Upload Signature
          </label>
          <input
            type="file"
            ref={signatureInputRef}
            accept="image/*"
            onChange={handleSignatureChange}
            className="hidden"
          />
          <div
            className="w-full border-dashed border-2 p-4 text-center"
            onDragOver={(e) => handleDragOver(e, 'signature')}
            onDragLeave={(e) => handleDragLeave(e, 'signature')}
            onDrop={(e) => handleDrop(e, 'signature')}
          >
            {signaturePreview ? (
              <img src={signaturePreview} alt="Signature Preview" className="w-32 h-32 object-cover mx-auto" />
            ) : (
              <p className="text-gray-500">{dragActive.signature ? 'Release to upload' : 'Drag and drop or click to upload your signature'}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
