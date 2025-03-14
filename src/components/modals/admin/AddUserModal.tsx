import { useState } from "react";
import { Member } from "../../../types/types";



// New User Form Modal Component
const AddUserModal: React.FC<{
    isOpen: boolean;
    closeModal: () => void;
    onAddMember: (member: Omit<Member, 'id'>) => void;
  }> = ({ isOpen, closeModal, onAddMember }) => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      profileImage: '',
      signature: '',
      gender: 'Male' as Member['gender'],
      unit: 'Central Club' as Member['unit'],
      churchName: '',
      youthCouncilType: 'Hi-Y' as Member['youthCouncilType'],
      email: '',
      phoneNumber: '',
      category: 'Adult Member' as Member['category'],
      status: 'Active' as Member['status'],
    });
    
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    if (!isOpen) return null;
  
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
    };
  
    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setProfileImageFile(e.target.files[0]);
        console.log(profileImageFile)
        console.log(signatureFile)
        // In a real app, you would handle the file upload
        // For now, we'll just use a placeholder URL
        setFormData(prev => ({ ...prev, profileImage: URL.createObjectURL(e.target.files![0]) }));
      }
    };
  
    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSignatureFile(e.target.files[0]);
        // In a real app, you would handle the file upload
        // For now, we'll just use a placeholder URL
        setFormData(prev => ({ ...prev, signature: URL.createObjectURL(e.target.files![0]) }));
      }
    };
  
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      try {
        setIsUploading(true);
        
        // In a real app, this is where you would upload the files to a server
        // and get back URLs to use in your member object
        
        // For demonstration, we'll simulate a delay
        await new Promise(r => setTimeout(r, 1000));
        
        const newMember = {
          ...formData,
          joinDate: new Date().toISOString()
        };
        
        onAddMember(newMember);
        closeModal();
      } catch (error) {
        console.error('Error adding new member:', error);
        // Handle error appropriately
      } finally {
        setIsUploading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
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
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                    <option value="Adult Member">Adult Member</option>
                    <option value="Youth Member">Youth Member</option>
                    <option value="Senior Member">Senior Member</option>
                  </select>
                </div>
  
                {/* Unit Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Unit Information</h3>
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Council of Church">Council of Church</option>
                    <option value="Youth Council">Youth Council</option>
                    <option value="Y's Men">Y's Men</option>
                    <option value="Central Club">Central Club</option>
                  </select>
                </div>
                
                {formData.unit === 'Council of Church' && (
                  <div>
                    <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                      Church Name
                    </label>
                    <input
                      type="text"
                      id="churchName"
                      name="churchName"
                      value={formData.churchName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                
                {formData.unit === 'Youth Council' && (
                  <div>
                    <label htmlFor="youthCouncilType" className="block text-sm font-medium text-gray-700 mb-1">
                      Youth Council Type
                    </label>
                    <select
                      id="youthCouncilType"
                      name="youthCouncilType"
                      value={formData.youthCouncilType}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Hi-Y">Hi-Y</option>
                      <option value="Y-Elite">Y-Elite</option>
                    </select>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
  
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 mb-4 mt-4">Profile Image & Signature</h3>
                </div>
                
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formData.profileImage && (
                    <div className="mt-2">
                      <img 
                        src={formData.profileImage} 
                        alt="Profile Preview" 
                        className="h-20 w-20 object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                    Signature
                  </label>
                  <input
                    type="file"
                    id="signature"
                    name="signature"
                    accept="image/*"
                    onChange={handleSignatureChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formData.signature && (
                    <div className="mt-2">
                      <img 
                        src={formData.signature} 
                        alt="Signature Preview" 
                        className="max-h-20 border border-gray-200 p-2 rounded"
                      />
                    </div>
                  )}
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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