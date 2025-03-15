import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import FormInput from './forms/FormInput';
import FormSelect from './forms/FormSelect';


const RegisterForm: React.FC= () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    unit: '',
    church: '',
    youthCouncilGroup: '',
    password: '',
    confirmPassword: '',
  });

  const [churches, setChurches] = useState<{value: string, label: string}[]>([]);
  const [youthGroups, setYouthGroups] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const unitOptions = [
    { value: 'Council of Church', label: 'Council of Church' },
    { value: 'Youth Council', label: 'Youth Council' },
    { value: 'Y\'s Men', label: 'Y\'s Men' },
    { value: 'Central Club', label: 'Central Club' }
  ];
  
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];
  
  const { fetchWithAuth, displayNotification , setUser , setAuthToken } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch youth groups when component mounts
    fetchYouthGroups();
    fetchChurches();
  }, []);


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

    // Reset dependent fields when unit changes
    if (name === 'unit') {
      setFormData(prev => ({
        ...prev,
        church: '',
        youthCouncilGroup: ''
      }));
    }
  };

  async function fetchChurches() {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/churches`,
      });
      
      // Transform the API response to our form format
      const formattedChurches = data?.data?.map((church: any) => ({
        value: church.id,
        label: church.name
      }));
      
      setChurches(formattedChurches);
    } catch (error) {
      console.error('Error fetching churches:', error);
      displayNotification('Failed to load churches', 'error');
    }
  }

  async function fetchYouthGroups() {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/youth-groups`,
      });
      
      console.log(data)
      console.log(data)
      // Transform the API response to our form format
      const formattedGroups = data?.data?.map((group: any) => ({
        value: group.id,
        label: group.name
      }));
      
      setYouthGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching youth groups:', error);
      displayNotification('Failed to load youth groups', 'error');
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    
    if (formData.unit === 'Council of Church' && !formData.church) {
      errors.church = 'Please select a church';
    }
    
    if (formData.unit === 'Youth Council' && !formData.youthCouncilGroup) {
      errors.youthCouncilGroup = 'Please select a youth council group';
    }
    
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare user data for API request based on the serializer fields
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        unit: formData.unit,
        church: formData.unit === 'Council of Church' ? formData.church : null,
        youth_council_group: formData.unit === 'Youth Council' ? formData.youthCouncilGroup : null,
      };

      // Make API call to register the user
      const response = await fetchWithAuth({
        method: 'POST',
        path: '/register/',
        body: userData,
      });

      // Handle successful registration
      displayNotification('success','Registration successful!',);
      
      localStorage.setItem('tokens', JSON.stringify(response?.data.tokens));
      setAuthToken(response?.data.tokens);
      setUser(response?.data.user)
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle field-specific errors from the backend
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const fieldErrorMessages: Record<string, string> = {};
        
        // Map backend field names to frontend field names
        const fieldMapping: Record<string, string> = {
          'first_name': 'firstName',
          'last_name': 'lastName',
          'phone_number': 'phoneNumber',
          'youth_council_group': 'youthCouncilGroup',
          // Add other fields as needed
        };
        
        // Process each error from the server
        Object.keys(serverErrors).forEach(field => {
          const frontendField = fieldMapping[field] || field;
          fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
            ? serverErrors[field][0] 
            : String(serverErrors[field]);
        });
        
        setFieldErrors(fieldErrorMessages);
        displayNotification('error','Please correct the errors in the form' );
      } else {
        displayNotification('error','Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        
        {Object.keys(fieldErrors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Please correct the errors in the form.
          </div>
        )}
        
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={fieldErrors.firstName}
              required
              wrapperClass=""
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={fieldErrors.lastName}
              required
              wrapperClass=""
            />
          </div>
        </div>

        <FormSelect
          label="Gender"
          name="gender"
          options={genderOptions}
          value={formData.gender}
          onChange={handleInputChange}
          error={fieldErrors.gender}
          required
        />
        
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
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          error={fieldErrors.phoneNumber}
          required
        />

        <FormSelect
          label="Unit"
          name="unit"
          options={unitOptions}
          value={formData.unit}
          onChange={handleInputChange}
          error={fieldErrors.unit}
          required
        />

        {/* Conditional rendering based on unit selection */}
        {formData.unit === 'Council of Church' && (
          <FormSelect
            label="Name of Church"
            name="church"
            options={churches}
            value={formData.church}
            onChange={handleInputChange}
            error={fieldErrors.church}
            required
          />
        )}

        {formData.unit === 'Youth Council' && (
          <FormSelect
            label="Youth Council Group"
            name="youthCouncilGroup"
            options={youthGroups}
            value={formData.youthCouncilGroup}
            onChange={handleInputChange}
            error={fieldErrors.youthCouncilGroup}
            required
          />
        )}

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

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={fieldErrors.confirmPassword}
          required
        />

        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;