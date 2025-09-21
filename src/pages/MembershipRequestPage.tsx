// import React, { useState } from 'react';
// import { useAuth } from '../context/NewAuthContext';
// import FormInput from '../components/forms/FormInput';
// import FormSelect from '../components/forms/FormSelect';
// import { NavLink, useNavigate } from 'react-router-dom';


// const RequestForm: React.FC = () => {
//     const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     phoneNumber: '',
//     address: '',
//     validIdType: '',
//     validIdNumber: '',
//     passportPhoto: null as File | null,
//   });

//   const [loading, setLoading] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
//   const [photoPreview, setPhotoPreview] = useState<string | null>(null);

//   const { fetchWithAuth, displayNotification } = useAuth();

//   const validIdOptions = [
//     { value: 'NIN', label: 'National Identity Number (NIN)' },
//     { value: 'drivers_license', label: 'Driver\'s License' },
//     { value: 'voters_card', label: 'Voter\'s Card' },
//     { value: 'international_passport', label: 'International Passport' },
//     { value: 'bvn', label: 'Bank Verification Number (BVN)' }
//   ];

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Clear field error when user starts typing
//     if (fieldErrors[name]) {
//       setFieldErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
    
//     if (file) {
//       // Validate file type
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//       if (!allowedTypes.includes(file.type)) {
//         setFieldErrors(prev => ({
//           ...prev,
//           passportPhoto: 'Please upload a valid image file (JPEG, JPG, or PNG)'
//         }));
//         return;
//       }

//       // Validate file size (max 2MB)
//       const maxSize = 2 * 1024 * 1024; // 2MB in bytes
//       if (file.size > maxSize) {
//         setFieldErrors(prev => ({
//           ...prev,
//           passportPhoto: 'File size must be less than 2MB'
//         }));
//         return;
//       }

//       setFormData(prev => ({
//         ...prev,
//         passportPhoto: file
//       }));

//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setPhotoPreview(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);

//       // Clear error
//       setFieldErrors(prev => ({
//         ...prev,
//         passportPhoto: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
    
//     if (!formData.firstName.trim()) {
//       errors.firstName = 'First name is required';
//     }

//     if (!formData.lastName.trim()) {
//       errors.lastName = 'Last name is required';
//     }
    
//     if (!formData.phoneNumber.trim()) {
//       errors.phoneNumber = 'Phone number is required';
//     } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber.trim())) {
//       errors.phoneNumber = 'Please enter a valid phone number';
//     }
    
//     if (!formData.address.trim()) {
//       errors.address = 'Address is required';
//     }
    
//     if (!formData.validIdType) {
//       errors.validIdType = 'Please select a valid ID type';
//     }
    
//     if (!formData.validIdNumber.trim()) {
//       errors.validIdNumber = 'Valid ID number is required';
//     }
    
//     if (!formData.passportPhoto) {
//       errors.passportPhoto = 'Passport photo is required';
//     }
    
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create FormData for file upload
//       const requestData = new FormData();
//       requestData.append('first_name', formData.firstName);
//       requestData.append('last_name', formData.lastName);
//       requestData.append('phone_number', formData.phoneNumber);
//       requestData.append('address', formData.address);
//       requestData.append('valid_id_type', formData.validIdType);
//       requestData.append('valid_id_number', formData.validIdNumber);
      
//       if (formData.passportPhoto) {
//         requestData.append('passport_photo', formData.passportPhoto);
//       }

//       await fetchWithAuth({
//         method: 'POST',
//         path: '/requests/',
//         body: requestData,
//         isFormData: true, // Flag to indicate FormData is being sent
//       });

//       displayNotification('Request submitted successfully!', 'success');
      
//       // Reset form
//       setFormData({
//         firstName: '',
//         lastName: '',
//         phoneNumber: '',
//         address: '',
//         validIdType: '',
//         validIdNumber: '',
//         passportPhoto: null,
//       });
//       setPhotoPreview(null);
      
//       // Reset file input
//       const fileInput = document.getElementById('passportPhoto') as HTMLInputElement;
//       if (fileInput) {
//         fileInput.value = '';
//       }

//     } catch (error: any) {
//       console.error('Request submission error:', error);
      
//       if (error.response?.data) {
//         const serverErrors = error.response.data;
//         const fieldErrorMessages: Record<string, string> = {};
        
//         const fieldMapping: Record<string, string> = {
//           'first_name': 'firstName',
//           'last_name': 'lastName',
//           'phone_number': 'phoneNumber',
//           'valid_id_type': 'validIdType',
//           'valid_id_number': 'validIdNumber',
//           'passport_photo': 'passportPhoto',
//         };
        
//         Object.keys(serverErrors).forEach(field => {
//           const frontendField = fieldMapping[field] || field;
//           fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
//             ? serverErrors[field][0] 
//             : String(serverErrors[field]);
//         });
        
//         setFieldErrors(fieldErrorMessages);
//         displayNotification('Please correct the errors in the form', 'error');
//       } else {
//         displayNotification('Request submission failed. Please try again.', 'error');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl mx-auto">
//       <form 
//         onSubmit={handleSubmit} 
//         className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
//       >
//         <div className="flex justify-center mb-4">
//             <NavLink to="/" className="text-xl font-bold text-center">
//               <svg id="Group_5836" data-name="Group 5836" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="102.432" height="40" viewBox="0 0 102.432 40">
//                 <path id="Path_5700" data-name="Path 5700" d="M9.356,1.17,7.093,6.55,6.727,1.17H4.863L2.578,6.55l-.4-5.38H.581l.588,7.388H3.2L5.473,3.089l.344,5.469H7.9L10.986,1.17Z" transform="translate(-0.526 -1.059)" fill="red"></path>
//                 <g id="Group_3969" data-name="Group 3969">
//                   <g id="Group_3968" data-name="Group 3968">
//                     <path id="Path_5701" data-name="Path 5701" d="M103.254,5.647a1.791,1.791,0,0,1,.033-.344l.532-3.051C104.064.876,104.907,0,106.992,0c1.753,0,2.574,1,2.574,2.008a1.787,1.787,0,0,1-.033.333L109,5.358c-.244,1.409-1.076,2.252-3.262,2.252-1.741,0-2.485-.965-2.485-1.964m4.659-3.472c0-.455-.3-.732-1.087-.732-.843,0-1.287.366-1.4.954l-.5,2.818a2.191,2.191,0,0,0-.022.255c0,.444.288.7,1.087.7.843,0,1.287-.322,1.4-.954l.5-2.818a1.624,1.624,0,0,0,.022-.222" transform="translate(-93.47)" fill="red"></path>
//                     <path id="Path_5702" data-name="Path 5702" d="M170.052,6.394h-1.12l-.4,2.307H166.9l1.3-7.388h2.829c1.586,0,2.363.6,2.363,1.686a3.491,3.491,0,0,1-.044.455l-.155.887a2.012,2.012,0,0,1-1.409,1.831l1.4,2.529h-1.831Zm1.642-2.8a2.118,2.118,0,0,0,.033-.311c0-.377-.233-.532-.8-.532h-1.353l-.388,2.23h1.4c.721,0,.91-.266,1.01-.832Z" transform="translate(-151.086 -1.189)" fill="red"></path>
//                     <path id="Path_5703" data-name="Path 5703" d="M238.643,1.026h1.631L239.22,6.972h2.962l-.244,1.442h-4.593Z" transform="translate(-214.856 -0.928)" fill="red"></path>
//                     <path id="Path_5704" data-name="Path 5704" d="M287.629,8.557l1.309-7.388h2.817c1.6,0,2.186.876,2.186,1.808a2.565,2.565,0,0,1-.033.41l-.577,3.261c-.166.976-.566,1.908-2.684,1.908Zm4.648-5.325c0-.4-.233-.621-.932-.621h-1.032l-.8,4.5h1.132c.876,0,1.032-.333,1.132-.921l.466-2.662a1.546,1.546,0,0,0,.033-.3" transform="translate(-260.375 -1.058)" fill="red"></path>
//                     <path id="Path_5705" data-name="Path 5705" d="M10.669,132.191H4.035l1.479-8.607L0,102.336H6.68L10,116.142l7.845-13.807h7.576L12.149,123.584Z" transform="translate(0 -92.639)" fill="red"></path>
//                     <path id="Path_5706" data-name="Path 5706" d="M236.409,115.829l-7.441,12.462h-6.724l-2.51-12.462-3.9,16.362h-6.5l7.083-29.855h6.634l3.721,19.276,10.893-19.276h6.59l-3.5,29.855H234.3Z" transform="translate(-189.497 -92.639)" fill="red"></path>
//                     <path id="Path_5707" data-name="Path 5707" d="M588.25,121.051a9.62,9.62,0,0,1,.179-1.793l2.286-12.91c1.076-6.1,4.8-8.741,12.059-8.741a31.279,31.279,0,0,1,8.607,1.3l-1.479,5.648a42.177,42.177,0,0,0-7.8-.986c-3.183,0-4.483,1.076-5.021,4.214l-1.838,10.4a8.963,8.963,0,0,0-.135,1.39c0,2.062,1.166,2.824,3.676,2.824a38.949,38.949,0,0,0,7.755-.852l.224,5.648a34.906,34.906,0,0,1-9.01,1.165c-6.59,0-9.5-3.138-9.5-7.307" transform="translate(-532.51 -88.357)" fill="red"></path>
//                     <path id="Path_5708" data-name="Path 5708" d="M809.6,126.319H799.421l-2.69,5.872H789.6l14.345-29.855h9.01l4.259,29.855h-6.993Zm-7.755-5.469h7.128l-1.255-13Z" transform="translate(-714.785 -92.639)" fill="red"></path>
//                   </g>
//                 </g>
//               </svg>
//               </NavLink>
//           </div>
//         <h2 className="text-2xl font-bold mb-6 text-center">Submit Request</h2>
        
//         {Object.keys(fieldErrors).length > 0 && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             Please correct the errors in the form.
//           </div>
//         )}
        
//         {/* Personal Information Section */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Personal Information</h3>
          
//           <FormInput
//             label="First Name"
//             name="firstName"
//             type="text"
//             placeholder="Enter your first name"
//             value={formData.firstName}
//             onChange={handleInputChange}
//             error={fieldErrors.fullName}
//             required
//           />

//         <FormInput
//             label="Last Name"
//             name="lastName"
//             type="text"
//             placeholder="Enter your last name"
//             value={formData.lastName}
//             onChange={handleInputChange}
//             error={fieldErrors.lastName}
//             required
//           />

//           <FormInput
//             label="Phone Number"
//             name="phoneNumber"
//             type="tel"
//             placeholder="Enter your phone number"
//             value={formData.phoneNumber}
//             onChange={handleInputChange}
//             error={fieldErrors.phoneNumber}
//             required
//           />

//           <FormInput
//             label="Address"
//             name="address"
//             type="text"
//             placeholder="Enter your full address"
//             value={formData.address}
//             onChange={handleInputChange}
//             error={fieldErrors.address}
//             required
//           />
//         </div>

//         {/* Identification Section */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Identification</h3>
          
//           <FormSelect
//             label="Valid ID Type"
//             name="validIdType"
//             options={validIdOptions}
//             value={formData.validIdType}
//             onChange={handleInputChange}
//             error={fieldErrors.validIdType}
//             required
//           />

//           <FormInput
//             label="ID Number"
//             name="validIdNumber"
//             type="text"
//             placeholder="Enter your ID number"
//             value={formData.validIdNumber}
//             onChange={handleInputChange}
//             error={fieldErrors.validIdNumber}
//             required
//           />
//         </div>

//         {/* Photo Upload Section */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Photo Upload</h3>
          
//           <div className="mb-4">
//             <label 
//               htmlFor="passportPhoto" 
//               className="block text-gray-700 text-sm font-bold mb-2"
//             >
//               Passport Photo *
//             </label>
//             <input
//               type="file"
//               id="passportPhoto"
//               name="passportPhoto"
//               accept="image/jpeg,image/jpg,image/png"
//               onChange={handleFileChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Upload a clear passport-style photo (JPEG, JPG, or PNG format, max 2MB)
//             </p>
//             {fieldErrors.passportPhoto && (
//               <p className="text-red-500 text-sm mt-1">{fieldErrors.passportPhoto}</p>
//             )}
//           </div>

//           {/* Photo Preview */}
//           {photoPreview && (
//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-bold mb-2">
//                 Photo Preview:
//               </label>
//               <div className="flex justify-center">
//                 <img
//                   src={photoPreview}
//                   alt="Passport photo preview"
//                   className="w-32 h-32 object-cover border-2 border-gray-300 rounded"
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div className="mb-6">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {loading ? 'Submitting Request...' : 'Submit Request'}
//           </button>
//         </div>

//         {/* Information Note */}
//         <div className="bg-blue-50 border border-blue-200 rounded p-4">
//           <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
//           <ul className="text-sm text-blue-700 space-y-1">
//             <li>• Ensure all information provided is accurate and up-to-date</li>
//             <li>• Your passport photo should be recent and clearly show your face</li>
//             <li>• Valid ID information will be verified as part of the process</li>
//             <li>• You will receive a confirmation once your request is processed</li>
//           </ul>
//         </div>
//         <a 
//             className="inline-block mt-4 align-baseline font-bold text-sm text-red-600 hover:text-red-800"
//             href="/login"
//             onClick={(e) => {
//               e.preventDefault();
//               navigate('/login');
//             }}
//           >
//             Already have an account? Login
//           </a>
//       </form>
//     </div>
//   );
// };

// export default RequestForm;

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png'
// Mock data for dropdowns - replace with actual API calls or data source
const countries = [
  { value: 'NG', label: 'Nigeria' },
  // Add more countries as needed
];

const states = [
  { value: 'lagos', label: 'Lagos' },
  { value: 'abuja', label: 'Abuja' },
  // Add more states as needed
];

const lgas = {
  lagos: [
    { value: 'ikeja', label: 'Ikeja' },
    { value: 'surulere', label: 'Surulere' },
    // Add more LGAs for Lagos
  ],
  abuja: [
    { value: 'amca', label: 'AMAC' },
    // Add more LGAs for Abuja
  ],
};

const units = [
  { value: 'unit1', label: 'Unit 1' },
  { value: 'unit2', label: 'Unit 2' },
  // Add more units as needed
];

const clubs = [
  { value: 'club1', label: 'Club 1' },
  { value: 'club2', label: 'Club 2' },
  // Add more clubs as needed
];

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    state: '',
    lga: '',
    unit: '',
    club: '',
    validIdType: '',
    validIdFile: null as File | null,
    passportPhoto: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragActive, setDragActive] = useState({ passportPhoto: false, validIdFile: false });

  const passportPhotoRef = useRef<HTMLInputElement>(null);
  const validIdFileRef = useRef<HTMLInputElement>(null);

  const { fetchWithAuth, displayNotification } = useAuth();

  const validIdOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    { value: 'voters_card', label: 'Voter\'s Card' },
    { value: 'nin_slip', label: 'NIN Slip' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '', lga: '' } : {}),
      ...(name === 'state' ? { lga: '' } : {}),
    }));

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
    
    if (!formData.club) {
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
          country: '',
          state: '',
          lga: '',
          unit: '',
          club: '',
          validIdType: '',
          validIdFile: null,
          passportPhoto: null,
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

          <FormSelect
            label="Country"
            name="country"
            options={countries}
            value={formData.country}
            onChange={handleInputChange}
            error={fieldErrors.country}
            required
          />

          <FormSelect
            label="State"
            name="state"
            options={states}
            value={formData.state}
            onChange={handleInputChange}
            error={fieldErrors.state}
            required
            disabled={!formData.country}
          />

          <FormSelect
            label="LGA"
            name="lga"
            options={formData.state ? lgas[formData.state as keyof typeof lgas] || [] : []}
            value={formData.lga}
            onChange={handleInputChange}
            error={fieldErrors.lga}
            required
            disabled={!formData.state}
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

          <FormSelect
            label="Club"
            name="club"
            options={clubs}
            value={formData.club}
            onChange={handleInputChange}
            error={fieldErrors.club}
            required
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