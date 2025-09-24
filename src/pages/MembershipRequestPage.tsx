import React, { useState, useRef } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png'
import { nigerianStates,ymcaUnits } from '../constants/utils';
import Select from 'react-select';
// Mock data for dropdowns - replace with actual API calls or data source
const countries = [
  { value: 'NG', label: 'Nigeria' },
  // Add more countries as needed
];

const units = ymcaUnits

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    citizen: 'Nigerian',
    country: '',
    state: '',
    lga: '',
    unit: '',
    club: '',
    age: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    home_address: '',
    office_address: '',
    profession: '',
    religion: '',
    churchName: '',
    occupation: '',
    marital_status: '',
    validIdType: '',
    validIdFile: null as File | null,
    passportPhoto: null as File | null,
    nextOfKin: '',
    referralSource: '',
    referralName: '',
    referredBy: 'no',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragActive, setDragActive] = useState({ passportPhoto: false, validIdFile: false });
  const [availableClubs, setAvailableClubs] = useState<{value: string, label: string}[]>([]);

  const passportPhotoRef = useRef<HTMLInputElement>(null);
  const validIdFileRef = useRef<HTMLInputElement>(null);

  const { fetchWithAuth, displayNotification } = useAuth();
  

  const validIdOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    // { value: 'voters_card', label: 'Voter\'s Card' },
    { value: 'nin_slip', label: 'NIN Slip' },
  ];





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '', lga: '' } : {}),
      ...(name === 'state' ? { lga: '' } : {}),
      ...(name === 'unit' ? { club: '' } : {}),
    }));

    // Update available clubs when unit changes
    if (name === 'unit') {
      const selectedUnit = units.find(unit => unit.value === value);
      if (selectedUnit && selectedUnit.dropDown) {
        const clubOptions = selectedUnit.dropDown.map(club => {
          const key = Object.keys(club)[0];
          return { value: club[key as keyof typeof club], label: club[key as keyof typeof club] };
        });
        setAvailableClubs(clubOptions);
      } else {
        setAvailableClubs([]);
      }
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (file: File, field: 'passportPhoto' | 'validIdFile') => {
    if (file) {
      const allowedTypes = field === 'passportPhoto' 
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: `Please upload a valid ${field === 'passportPhoto' ? 'image' : 'file'} (${allowedTypes.join(', ')})`
        }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 2MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (field === 'passportPhoto') {
            setPhotoPreview(e.target?.result as string);
          } else {
            setIdPreview(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        if (field === 'validIdFile') {
          setIdPreview(null);
        }
      }

      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDrag = (e: React.DragEvent, field: 'passportPhoto' | 'validIdFile') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, field: 'passportPhoto' | 'validIdFile') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file, field);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    
    if (!formData.state) {
      errors.state = 'State is required';
    }
    
    if (!formData.lga) {
      errors.lga = 'LGA is required';
    }
    
    if (!formData.unit) {
      errors.unit = 'Unit is required';
    }
    
    if (availableClubs.length > 0 && !formData.club) {
      errors.club = 'Club is required';
    }
    
    if (!formData.validIdType) {
      errors.validIdType = 'Please select a valid ID type';
    }
    
    if (!formData.validIdFile) {
      errors.validIdFile = 'ID document is required';
    }
    
    if (!formData.passportPhoto) {
      errors.passportPhoto = 'Passport photo is required';
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
      const requestData = new FormData();
      requestData.append('first_name', formData.firstName);
      requestData.append('last_name', formData.lastName);
      requestData.append('phone_number', formData.phoneNumber);
      requestData.append('country', formData.country);
      requestData.append('state', formData.state);
      requestData.append('lga', formData.lga);
      requestData.append('unit', formData.unit);
      requestData.append('club', formData.club);
      requestData.append('valid_id_type', formData.validIdType);
      
      if (formData.validIdFile) {
        requestData.append('valid_id_file', formData.validIdFile);
      }
      if (formData.passportPhoto) {
        requestData.append('passport_photo', formData.passportPhoto);
      }

      await fetchWithAuth({
        method: 'POST',
        path: '/requests/',
        body: requestData,
        isFormData: true,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          citizen: 'Nigerian',
          country: '',
          age: '',
          gender: '',
          date_of_birth: '',
          place_of_birth: '',
          home_address: '',
          office_address: '',
          profession: '',
          religion: '',
          occupation: '',
          marital_status: '',
          state: '',
          lga: '',
          unit: '',
          club: '',
          validIdType: '',
          validIdFile: null,
          passportPhoto: null,
          nextOfKin: '',
          referralSource: '',
          referralName: '',
          referredBy: 'no',
          churchName: '',
        });
        setPhotoPreview(null);
        setIdPreview(null);
        
        const fileInputs = ['passportPhoto', 'validIdFile'].map(id => 
          document.getElementById(id) as HTMLInputElement
        );
        fileInputs.forEach(input => {
          if (input) input.value = '';
        });
      }, 3000);

    } catch (error: any) {
      console.error('Application submission error:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const fieldErrorMessages: Record<string, string> = {};
        
        const fieldMapping: Record<string, string> = {
          'first_name': 'firstName',
          'last_name': 'lastName',
          'phone_number': 'phoneNumber',
          'valid_id_type': 'validIdType',
          'valid_id_file': 'validIdFile',
          'passport_photo': 'passportPhoto',
        };
        
        Object.keys(serverErrors).forEach(field => {
          const frontendField = fieldMapping[field] || field;
          fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
            ? serverErrors[field][0] 
            : String(serverErrors[field]);
        });
        
        setFieldErrors(fieldErrorMessages);
        displayNotification('Please correct the errors in the form', 'error');
      } else {
        displayNotification('Application submission failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-green-600">Application Submitted Successfully!</h2>
          </div>
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="flex justify-center mb-4">
          <Link to={'/'} >
            <img 
                src={ymca} 
                alt="YMCA Lagos Logo" 
                className="h-10 w-auto object-contain" 
              />
          </Link>
          
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Submit Application</h2>
        
        {Object.keys(fieldErrors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Please correct the errors in the form.
          </div>
        )}
        
        {/* Personal Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={fieldErrors.firstName}
              required
            />

            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={fieldErrors.lastName}
              required
            />

            <FormInput
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={fieldErrors.phoneNumber}
              required
            />
          
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2">
                Citizenship Status <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="citizen"
                    value="Nigerian"
                    checked={formData.citizen === 'Nigerian'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Nigerian</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="citizen"
                    value="Foreigner"
                    checked={formData.citizen === 'Foreigner'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Foreigner</span>
                </label>
              </div>
              {fieldErrors.citizen && (
                <p className="text-red-500 text-xs italic mt-1">{fieldErrors.citizen}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Country"
              name="country"
              options={countries}
              value={formData.country}
              onChange={handleInputChange}
              error={fieldErrors.country}
              required
            />

            {formData.citizen === 'Nigerian' ? (

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <Select
                options={nigerianStates}
                value={nigerianStates.find(option => option.value === formData.state) || null}
                onChange={(selectedOption) => setFormData({ ...formData, state: selectedOption ? selectedOption.value : '' })}
                placeholder="Select State"
                isSearchable
                noOptionsMessage={() => "No state found"}
              />
            </div>
            ) : (
              <FormInput
                label="State/Province"
                name="state"
                type="text"
                placeholder="Enter your state or province"
                value={formData.state}
                onChange={handleInputChange}
                error={fieldErrors.state}
                required
              />
            )}

            {formData.citizen === 'Nigerian' && (
              <FormInput
                label="LGA"
                name="lga"
                type="text"
                placeholder="Enter your LGA"
                value={formData.lga}
                onChange={handleInputChange}
                error={fieldErrors.lga}
                required
              />
            )}
          
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Religion <span className="text-red-500">*</span></label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Religion</option>
                <option value="Christian">Christian</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.religion && (
                <p className="text-red-500 text-xs italic mt-1">{fieldErrors.religion}</p>
              )}
            </div> */}
            <FormSelect
              label="Religion"
              name="religion"
              options={[
                { value: 'Christian', label: 'Christian' },
                { value: 'Other', label: 'Other' },
              ]}
              value={formData.religion}
              onChange={handleInputChange}
              error={fieldErrors.religion}
              required
            />
            
            {formData.religion === 'Christian' && (
              <FormInput
                label="Church Name"
                name="churchName"
                type="text"
                placeholder="Enter your church name"
                value={formData.churchName}
                onChange={handleInputChange}
                error={fieldErrors.churchName}
                required
              />
            )}
            
            <FormInput
                label="Profession"
                name="profession"
                type="text"
                placeholder="Enter your state or province"
                value={formData.profession}
                onChange={handleInputChange}
                error={fieldErrors.profession}
                required
              />

            <FormSelect
              label="Unit"
              name="unit"
              options={units}
              value={formData.unit}
              onChange={handleInputChange}
              error={fieldErrors.unit}
              required
            />

            {availableClubs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
              <Select
                options={availableClubs}
                value={availableClubs.find(option => option.value === formData.club) || null}
                onChange={(selectedOption) => setFormData({ ...formData, club: selectedOption ? selectedOption.value : '' })}
                placeholder="Select club"
                isSearchable
                noOptionsMessage={() => "No club found"}
              />
            </div>
            )}
          </div>


          {/* add next of kin field */}
          <FormInput
            label="Next of Kin"
            name="nextOfKin"
            type="text"
            placeholder="Enter your next of kin"
            value={formData.nextOfKin}
            onChange={handleInputChange}
            error={fieldErrors.nextOfKin}
            required
          />

          {/* add were you refered by something this should be a yes or no */}
          <FormSelect
            label="Were you referred by someone?"
            name="referredBy"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            value={formData.referredBy}
            onChange={handleInputChange}
            error={fieldErrors.referredBy}
            required
          />

          {/* add referela nmae optional */}
          <FormInput
            label="Referral Name (Optional)"
            name="referralName"
            type="text"
            placeholder="Enter your referral name"
            value={formData.referralName}
            onChange={handleInputChange}
            error={fieldErrors.referralName}
          />

        </div>

        {/* Identification Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Identification</h3>
          
          <FormSelect
            label="Valid ID Type"
            name="validIdType"
            options={validIdOptions}
            value={formData.validIdType}
            onChange={handleInputChange}
            error={fieldErrors.validIdType}
            required
          />

          <div className="mb-4">
            <label 
              htmlFor="validIdFile" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              ID Document *
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive.validIdFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${fieldErrors.validIdFile ? 'border-red-500' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'validIdFile')}
              onDragLeave={(e) => handleDrag(e, 'validIdFile')}
              onDragOver={(e) => handleDrag(e, 'validIdFile')}
              onDrop={(e) => handleDrop(e, 'validIdFile')}
            >
              <input
                type="file"
                id="validIdFile"
                name="validIdFile"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'validIdFile')}
                className="hidden"
                ref={validIdFileRef}
              />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {formData.validIdFile ? formData.validIdFile.name : 'Drag and drop your ID document here or'}
                </p>
                <button
                  type="button"
                  onClick={() => validIdFileRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Choose File
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a clear image of your ID document (JPEG, JPG, PNG, max 2MB)
              </p>
              {fieldErrors.validIdFile && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.validIdFile}</p>
              )}
            </div>
          </div>

          {idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ID Preview:
              </label>
              <div className="flex justify-center">
                <img
                  src={idPreview}
                  alt="ID document preview"
                  className="w-48 h-32 object-cover border-2 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
          {formData.validIdFile && !idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Uploaded File:
              </label>
              <p className="text-gray-600">{formData.validIdFile.name}</p>
            </div>
          )}
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Photo Upload</h3>
          
          <div className="mb-4">
            <label 
              htmlFor="passportPhoto" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Passport Photo *
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive.passportPhoto ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${fieldErrors.passportPhoto ? 'border-red-500' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'passportPhoto')}
              onDragLeave={(e) => handleDrag(e, 'passportPhoto')}
              onDragOver={(e) => handleDrag(e, 'passportPhoto')}
              onDrop={(e) => handleDrop(e, 'passportPhoto')}
            >
              <input
                type="file"
                id="passportPhoto"
                name="passportPhoto"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'passportPhoto')}
                className="hidden"
                ref={passportPhotoRef}
              />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {formData.passportPhoto ? formData.passportPhoto.name : 'Drag and drop your passport photo here or'}
                </p>
                <button
                  type="button"
                  onClick={() => passportPhotoRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Choose Photo
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a clear passport picture of yourself (JPEG, JPG, or PNG, max 2MB)
              </p>
              {fieldErrors.passportPhoto && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.passportPhoto}</p>
              )}
            </div>
          </div>

          {photoPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Photo Preview:
              </label>
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Passport photo preview"
                  className="w-32 h-32 object-cover border-2 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure all information provided is accurate and up-to-date</li>
            <li>• Your passport photo should be recent and clearly show your face</li>
            <li>• Valid ID document will be verified as part of the process</li>
            <li>• You will receive a confirmation once your application is processed</li>
          </ul>
        </div>
        <a 
          className="inline-block mt-4 align-baseline font-bold text-sm text-red-600 hover:text-red-800"
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
        >
          Already have an account? Login
        </a>
      </form>
    </div>
  );
};

export default RequestForm;