//@ts-nocheck
import { useState, useEffect } from "react";
import { Member } from "../../../types/types";
import { useAuth } from "../../../context/NewAuthContext";

// New User Form Modal Component
const AddUserModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  churches:any;
  youthGroups:any;
  onAddMember: () => void;
}> = ({ isOpen, closeModal, onAddMember, churches, youthGroups}) => {

  const { fetchWithAuth, displayNotification } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male' as Member['gender'],
    unit: '' as Member['unit'],
    church: '',
    youthCouncilGroup: '',
    status: false,
    category: 'Adult Member' as Member['category'],
    dateOfBirth: '',
    location: '',
    profession: '',
    expiryDate: ''
  });

  const [filePreviews, setFilePreviews] = useState<{
    passportPhoto?: string;
    signature?: string;
  }>({});

  const [uploadedFiles, setUploadedFiles] = useState<{
    passportPhoto?: File;
    signature?: File;
  }>({});

  // Local UI state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const categoryOptions = [
    { value: 'Adult Member', label: 'Adult Member' },
    { value: 'Youth Member', label: 'Youth Member' },
    { value: 'Senior Member', label: 'Senior Member' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' }
  ];



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Only JPEG, JPG, or PNG files are allowed'
        }));
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 10MB'
        }));
        return;
      }

      // Store file and preview
      setUploadedFiles(prev => ({
        ...prev,
        [field]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviews(prev => ({
          ...prev,
          [field]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    
    if (formData.unit === 'Council of Church' && !formData.church) {
      newErrors.church = 'Please select a church';
    }
    
    if (formData.unit === 'Youth Council' && !formData.youthCouncilGroup) {
      newErrors.youthCouncilGroup = 'Please select a youth council group';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsUploading(true);
      
      // Prepare user data
      let userData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        unit: formData.unit,
        church: formData.unit === 'Council of Church' ? formData.church : null,
        youth_council_group: formData.unit === 'Youth Council' ? formData.youthCouncilGroup : null,
        status: formData.status,
        category: formData.category,
        join_date: new Date().toISOString(),
        date_of_birth: formData.dateOfBirth || null,
        location: formData.location || null,
        profession: formData.profession || null,
      };

      // If expiry date is provided, include it
      if (formData.expiryDate) {
        userData.card_expiry_date = formData.expiryDate;
      }

      // Create FormData for file uploads
      const submitFormData = new FormData();
      
      // Add all user data as JSON
      Object.keys(userData).forEach(key => {
        submitFormData.append(key, userData[key] || '');
      });

      // Add file uploads if present
      if (uploadedFiles.passportPhoto) {
        submitFormData.append('image', uploadedFiles.passportPhoto);
      }

      if (uploadedFiles.signature) {
        submitFormData.append('signature', uploadedFiles.signature);
      }

      // Send to API
      if (fetchWithAuth) {
        const response = await fetchWithAuth({
          method: 'POST',
          path: '/admin/members/',
          body: uploadedFiles.passportPhoto || uploadedFiles.signature ? submitFormData : userData,
          isFormData: uploadedFiles.passportPhoto || uploadedFiles.signature ? true : false,
        });

        displayNotification("success", response?.message || "Member created successfully");
      }
      onAddMember();
      closeModal();
    } catch (error) {
      console.error('Error adding new member:', error);
    } finally {
      setIsUploading(false);
    }
  };


  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 sticky top-0 bg-white border-b">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Add New Member</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4">Basic Information</h3>
                </div>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="e.g., Engineer, Teacher"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location/State/LGA
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Lagos, Ikoyi"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
    
                {/* Unit Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Unit Information</h3>
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                </div>
                
                {formData.unit === 'Council of Church' && (
                  <div>
                    <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-1">
                      Church *
                    </label>
                    <select
                      id="church"
                      name="church"
                      value={formData.church}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.church ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Church</option>
                      {churches?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.church && <p className="text-red-500 text-xs mt-1">{errors.church}</p>}
                  </div>
                )}
                
                {formData.unit === 'Youth Council' && (
                  <div>
                    <label htmlFor="youthCouncilGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Youth Council Group *
                    </label>
                    <select
                      id="youthCouncilGroup"
                      name="youthCouncilGroup"
                      value={formData.youthCouncilGroup}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors.youthCouncilGroup ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Youth Group</option>
                      {youthGroups.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.youthCouncilGroup && <p className="text-red-500 text-xs mt-1">{errors.youthCouncilGroup}</p>}
                  </div>
                )}
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Card & Documents */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Card Information</h3>
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-gray-500 text-xs mt-1">Leave empty for default (May 31st of next year)</p>
                </div>

                {/* File Uploads */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Documents (Optional)</h3>
                </div>

                <div>
                  <label htmlFor="passportPhoto" className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Photo
                  </label>
                  <input
                    type="file"
                    id="passportPhoto"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'passportPhoto')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-gray-500 text-xs mt-1">JPEG, JPG, or PNG (max 10MB)</p>
                  {errors.passportPhoto && <p className="text-red-500 text-xs mt-1">{errors.passportPhoto}</p>}
                  {filePreviews.passportPhoto && (
                    <img src={filePreviews.passportPhoto} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                  )}
                </div>

                <div>
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                    Signature
                  </label>
                  <input
                    type="file"
                    id="signature"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'signature')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-gray-500 text-xs mt-1">JPEG, JPG, or PNG (max 10MB)</p>
                  {errors.signature && <p className="text-red-500 text-xs mt-1">{errors.signature}</p>}
                  {filePreviews.signature && (
                    <img src={filePreviews.signature} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                  )}
                </div>

                {/* Password Info */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Account Credentials</h3>
                  <p className="text-gray-600 text-sm">Default Account Password: <span className="font-mono font-bold">YMCA123456789</span></p>
                </div>
              </div>
    
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      {/* <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg> */}
                      Saving...
                    </span>
                  ) : (
                    'Save Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
};



export default AddUserModal;  