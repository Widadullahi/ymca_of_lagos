import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import FormInput from './forms/FormInput';
import FormSelect from './forms/FormSelect';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    otherNames: '',
    dateOfBirth: '',
    age: '',
    homeAddress: '',
    officeAddress: '',
    maritalStatus: '',
    stateOfOrigin: '',
    nationality: '',
    profession: '',
    religion: '',
    denomination: '',
    academicQualification: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    wasReferred: '',
    referrerName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    unit: '',
    church: '',
    youthCouncilGroup: '',
    password: '',
    confirmPassword: '',
    declaration: false,
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
  ];

  const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
  ];

  const referralOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  const nigerianStates = [
    { value: 'Abia', label: 'Abia' },
    { value: 'Adamawa', label: 'Adamawa' },
    { value: 'Akwa Ibom', label: 'Akwa Ibom' },
    { value: 'Anambra', label: 'Anambra' },
    { value: 'Bauchi', label: 'Bauchi' },
    { value: 'Bayelsa', label: 'Bayelsa' },
    { value: 'Benue', label: 'Benue' },
    { value: 'Borno', label: 'Borno' },
    { value: 'Cross River', label: 'Cross River' },
    { value: 'Delta', label: 'Delta' },
    { value: 'Ebonyi', label: 'Ebonyi' },
    { value: 'Edo', label: 'Edo' },
    { value: 'Ekiti', label: 'Ekiti' },
    { value: 'Enugu', label: 'Enugu' },
    { value: 'Gombe', label: 'Gombe' },
    { value: 'Imo', label: 'Imo' },
    { value: 'Jigawa', label: 'Jigawa' },
    { value: 'Kaduna', label: 'Kaduna' },
    { value: 'Kano', label: 'Kano' },
    { value: 'Katsina', label: 'Katsina' },
    { value: 'Kebbi', label: 'Kebbi' },
    { value: 'Kogi', label: 'Kogi' },
    { value: 'Kwara', label: 'Kwara' },
    { value: 'Lagos', label: 'Lagos' },
    { value: 'Nasarawa', label: 'Nasarawa' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Ogun', label: 'Ogun' },
    { value: 'Ondo', label: 'Ondo' },
    { value: 'Osun', label: 'Osun' },
    { value: 'Oyo', label: 'Oyo' },
    { value: 'Plateau', label: 'Plateau' },
    { value: 'Rivers', label: 'Rivers' },
    { value: 'Sokoto', label: 'Sokoto' },
    { value: 'Taraba', label: 'Taraba' },
    { value: 'Yobe', label: 'Yobe' },
    { value: 'Zamfara', label: 'Zamfara' },
    { value: 'FCT', label: 'FCT (Abuja)' }
  ];
  
  const { fetchWithAuth, displayNotification, setUser, setAuthToken } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchYouthGroups();
    fetchChurches();
  }, []);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

    // Clear referrer name when "No" is selected for referral
    if (name === 'wasReferred' && value === 'No') {
      setFormData(prev => ({
        ...prev,
        referrerName: ''
      }));
    }
  };

  async function fetchChurches() {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/churches`,
      });
      
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
    
    // Existing validations
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    
    // New validations
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.homeAddress.trim()) errors.homeAddress = 'Home address is required';
    if (!formData.maritalStatus) errors.maritalStatus = 'Marital status is required';
    if (!formData.stateOfOrigin) errors.stateOfOrigin = 'State of origin is required';
    if (!formData.nationality.trim()) errors.nationality = 'Nationality is required';
    if (!formData.profession.trim()) errors.profession = 'Profession is required';
    if (!formData.religion.trim()) errors.religion = 'Religion is required';
    if (!formData.academicQualification.trim()) errors.academicQualification = 'Academic qualification is required';
    if (!formData.nextOfKinName.trim()) errors.nextOfKinName = 'Next of kin name is required';
    if (!formData.nextOfKinPhone.trim()) errors.nextOfKinPhone = 'Next of kin phone is required';
    if (!formData.wasReferred) errors.wasReferred = 'Please specify if you were referred';
    
    if (formData.unit === 'Council of Church' && !formData.church) {
      errors.church = 'Please select a church';
    }
    
    if (formData.unit === 'Youth Council' && !formData.youthCouncilGroup) {
      errors.youthCouncilGroup = 'Please select a youth council group';
    }

    if (formData.wasReferred === 'Yes' && !formData.referrerName.trim()) {
      errors.referrerName = 'Please provide referrer name';
    }
    
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.declaration) {
      errors.declaration = 'You must accept the declaration';
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
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        other_names: formData.otherNames,
        date_of_birth: formData.dateOfBirth,
        age: parseInt(formData.age),
        home_address: formData.homeAddress,
        office_address: formData.officeAddress,
        marital_status: formData.maritalStatus,
        state_of_origin: formData.stateOfOrigin,
        nationality: formData.nationality,
        profession: formData.profession,
        religion: formData.religion,
        denomination: formData.denomination,
        academic_qualification: formData.academicQualification,
        next_of_kin_name: formData.nextOfKinName,
        next_of_kin_phone: formData.nextOfKinPhone,
        was_referred: formData.wasReferred === 'Yes',
        referrer_name: formData.wasReferred === 'Yes' ? formData.referrerName : null,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        unit: formData.unit,
        church: formData.unit === 'Council of Church' ? formData.church : null,
        youth_council_group: formData.unit === 'Youth Council' ? formData.youthCouncilGroup : null,
        declaration_accepted: formData.declaration,
      };

      const response = await fetchWithAuth({
        method: 'POST',
        path: '/register/',
        body: userData,
      });

      displayNotification('success', 'Registration successful!');
      
      localStorage.setItem('tokens', JSON.stringify(response?.data.tokens));
      setAuthToken(response?.data.tokens);
      setUser(response?.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const fieldErrorMessages: Record<string, string> = {};
        
        const fieldMapping: Record<string, string> = {
          'first_name': 'firstName',
          'last_name': 'lastName',
          'other_names': 'otherNames',
          'date_of_birth': 'dateOfBirth',
          'home_address': 'homeAddress',
          'office_address': 'officeAddress',
          'marital_status': 'maritalStatus',
          'state_of_origin': 'stateOfOrigin',
          'academic_qualification': 'academicQualification',
          'next_of_kin_name': 'nextOfKinName',
          'next_of_kin_phone': 'nextOfKinPhone',
          'was_referred': 'wasReferred',
          'referrer_name': 'referrerName',
          'phone_number': 'phoneNumber',
          'youth_council_group': 'youthCouncilGroup',
          'declaration_accepted': 'declaration',
        };
        
        Object.keys(serverErrors).forEach(field => {
          const frontendField = fieldMapping[field] || field;
          fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
            ? serverErrors[field][0] 
            : String(serverErrors[field]);
        });
        
        setFieldErrors(fieldErrorMessages);
        displayNotification('error', 'Please correct the errors in the form');
      } else {
        displayNotification('error', 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">YMCA Registration Form</h2>
        
        {Object.keys(fieldErrors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Please correct the errors in the form.
          </div>
        )}
        
        {/* Personal Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={fieldErrors.firstName}
              required
            />
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={fieldErrors.lastName}
              required
            />
          </div>

          <FormInput
            label="Other Names"
            name="otherNames"
            type="text"
            placeholder="Other Names (Optional)"
            value={formData.otherNames}
            onChange={handleInputChange}
            error={fieldErrors.otherNames}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={fieldErrors.dateOfBirth}
              required
            />
            <FormInput
              label="Age"
              name="age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={handleInputChange}
              error={fieldErrors.age}
              disabled
            />
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

          <FormSelect
            label="Marital Status"
            name="maritalStatus"
            options={maritalStatusOptions}
            value={formData.maritalStatus}
            onChange={handleInputChange}
            error={fieldErrors.maritalStatus}
            required
          />
        </div>

        {/* Contact Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Contact Information</h3>
          
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

          <FormInput
            label="Home Address"
            name="homeAddress"
            type="text"
            placeholder="Home Address"
            value={formData.homeAddress}
            onChange={handleInputChange}
            error={fieldErrors.homeAddress}
            required
          />

          <FormInput
            label="Office Address"
            name="officeAddress"
            type="text"
            placeholder="Office Address (Optional)"
            value={formData.officeAddress}
            onChange={handleInputChange}
            error={fieldErrors.officeAddress}
          />
        </div>

        {/* Background Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Background Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormSelect
              label="State of Origin"
              name="stateOfOrigin"
              options={nigerianStates}
              value={formData.stateOfOrigin}
              onChange={handleInputChange}
              error={fieldErrors.stateOfOrigin}
              required
            />
            <FormInput
              label="Nationality"
              name="nationality"
              type="text"
              placeholder="Nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              error={fieldErrors.nationality}
              required
            />
          </div>

          <FormInput
            label="Profession"
            name="profession"
            type="text"
            placeholder="Profession"
            value={formData.profession}
            onChange={handleInputChange}
            error={fieldErrors.profession}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Religion"
              name="religion"
              type="text"
              placeholder="Religion"
              value={formData.religion}
              onChange={handleInputChange}
              error={fieldErrors.religion}
              required
            />
            <FormInput
              label="Denomination"
              name="denomination"
              type="text"
              placeholder="Denomination (Optional)"
              value={formData.denomination}
              onChange={handleInputChange}
              error={fieldErrors.denomination}
            />
          </div>

          <FormInput
            label="Academic Qualification"
            name="academicQualification"
            type="text"
            placeholder="Academic Qualification"
            value={formData.academicQualification}
            onChange={handleInputChange}
            error={fieldErrors.academicQualification}
            required
          />
        </div>

        {/* Next of Kin Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Next of Kin Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Name of Next of Kin"
              name="nextOfKinName"
              type="text"
              placeholder="Next of Kin Name"
              value={formData.nextOfKinName}
              onChange={handleInputChange}
              error={fieldErrors.nextOfKinName}
              required
            />
            <FormInput
              label="Phone Number of Next of Kin"
              name="nextOfKinPhone"
              type="tel"
              placeholder="Next of Kin Phone"
              value={formData.nextOfKinPhone}
              onChange={handleInputChange}
              error={fieldErrors.nextOfKinPhone}
              required
            />
          </div>
        </div>

        {/* YMCA Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">YMCA Information</h3>
          
          <FormSelect
            label="Unit"
            name="unit"
            options={unitOptions}
            value={formData.unit}
            onChange={handleInputChange}
            error={fieldErrors.unit}
            required
          />

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
        </div>

        {/* Referral Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Referral Information</h3>
          
          <FormSelect
            label="Were you referred to YMCA by someone?"
            name="wasReferred"
            options={referralOptions}
            value={formData.wasReferred}
            onChange={handleInputChange}
            error={fieldErrors.wasReferred}
            required
          />

          {formData.wasReferred === 'Yes' && (
            <FormInput
              label="Name of Referrer"
              name="referrerName"
              type="text"
              placeholder="Referrer Name"
              value={formData.referrerName}
              onChange={handleInputChange}
              error={fieldErrors.referrerName}
              required
            />
          )}
        </div>

        {/* Account Security Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Account Security</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>
        </div>

        {/* Declaration Section */}
        <div className="mb-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="declaration"
              name="declaration"
              checked={formData.declaration}
              onChange={handleInputChange}
              className="mt-1 mr-3"
            />
            <label htmlFor="declaration" className="text-sm text-gray-700">
              <strong>Declaration:</strong> I hereby affirm that the information contained in this form is true and correct.
            </label>
          </div>
          {fieldErrors.declaration && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.declaration}</p>
          )}
        </div>

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