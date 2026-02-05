//@ts-nocheck
import React, { useState, useEffect } from 'react';
import thumbnail from '../assets/images/default.jpg'
import { useAuth } from '../context/NewAuthContext';
import FileUpload from './forms/FileUpload';
import PasswordChange from './PasswordChange';
import AccountDeleteModal from './modals/admin/AccountDeleteModal';

// Types
interface Card {
  id: string;
  id_number: string;
  is_active: boolean;
  expired: boolean;
  expired_at: string;
  days_remaining: number;
  signature: string | null;
  first_time: boolean;
}

interface YouthCouncilGroup {
  id: string;
  name: string;
}

interface UserRequest {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  citizen: string;
  country: string;
  state: string;
  lga: string;
  unit: string;
  club: string;
  age: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string | null;
  home_address: string | null;
  office_address: string | null;
  profession: string;
  religion: string;
  church_name: string | null;
  occupation: string;
  marital_status: string;
  valid_id_number: string | null;
  valid_id_type?: string | null;
  passport_photo: string;
  valid_id_file: string | null;
  signature: string | null;
  next_of_kin: string | null;
  next_of_kin_phone?: string | null;
  referral_source: string | null;
  referral_name: string | null;
  referred_by: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  image: string;
  signature?: string | null;
  unit: string;
  church: string | null;
  card: Card;
  role: string;
  youth_council_group: YouthCouncilGroup;
  user_request: UserRequest | null;
  created_at: string;
}

// Modal types for confirmation
type ModalType = 'deleteAccount' | 'passwordUpdate' | 'dataDownload' | null;

const ProfileManagementPage: React.FC = () => {
  const { fetchWithAuth, displayNotification, user, setUser, setAuthToken, setGlobalLoading, setGlobalLoadingText, BACKEND_URL } = useAuth(); 
  
  // Initial profile state with the correct structure
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    image: thumbnail,
    signature: null,
    unit: '',
    church: null,
    card: {
      id: '',
      id_number: '',
      is_active: false,
      expired: false,
      expired_at: '',
      days_remaining: 0,
      signature: null,
      first_time: false
    },
    role: '',
    youth_council_group: {
      id: '',
      name: ''
    },
    user_request: null,
    created_at: ''
  });

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const isAdmin = profile?.role && profile.role !== 'Member';
  const membershipType = (profile?.membership_type || profile?.card?.membership_type || 'full').toString().toLowerCase();
  const isHonoraryOrLife = membershipType === 'honorary' || membershipType === 'life';
  const toAbsoluteUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const prefix = BACKEND_URL?.replace(/\/+$/, '') || '';
    const suffix = url.startsWith('/') ? url : `/${url}`;
    return `${prefix}${suffix}`;
  };

  const pickValue = (obj: any, keys: string[]) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== null && value !== undefined && value !== '') return value;
    }
    return null;
  };
  const getExpiryDate = () => {
    const now = new Date();
    return new Date(now.getFullYear() + 1, 4, 31);
  };

  const calculateDaysRemaining = (expiry: Date) => {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const computedDaysRemaining = !isHonoraryOrLife ? calculateDaysRemaining(getExpiryDate()) : 0;
  
  // Signature file state
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // Profile Image file state
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Fetch user profile after the token is available or on token update
  const fetchUserProfile = async () => {
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/account/`,
      });
      
      if (data?.data) {
        setProfile(data.data);
        setUser(data.data);
        
        // Set initial profile form data
        setProfileForm({
          first_name: data.data.first_name,
          last_name: data.data.last_name,
          email: data.data.email,
          phone_number: data.data.phone_number,
          gender: data.data.gender
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      displayNotification?.('error', 'Failed to load profile data');
    }
  };

  // Reset forms when canceling edit modes or on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!isEditingProfile) {
      setProfileForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone_number: profile.phone_number,
        gender: profile.gender
      });
      setSignatureFile(null);
    }
  }, [isEditingProfile, profile]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle signature file selection
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSignatureFile(files[0]);
    }
  };

  // Handle signature file selection
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setProfileFile(files[0]);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProfileUpdating(true)
      // Update basic profile information
      const response = await fetchWithAuth({
        method: 'PUT',
        path: '/account/',
        body: profileForm
      });
      
      if (response?.data) {
        setProfile(response.data);
        setUser(response.data);
        
        if (profileFile) {
          await handleProfileImageUpload();
        }
        // Upload signature if a file was selected
        if (signatureFile) {
          await handleSignatureUpload();
        } else {
          setIsEditingProfile(false);
          displayNotification?.('success', 'Profile updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      displayNotification?.('error', 'Failed to update profile');
    }finally{
      setIsProfileUpdating(false)
    }
  };

  // Handle signature upload
  const handleSignatureUpload = async () => {
    try {
      setGlobalLoading?.(true);
      setGlobalLoadingText?.('Uploading signature...');
      
      const formData = new FormData();
      formData.append('signature', signatureFile);
      
      const response = await fetchWithAuth({
        method: 'POST',
        path: `/account/signature/`,
        body: formData,
        isFormData: true
      });
      
      if (response?.data) {
        // Refresh user profile to get updated signature
        await fetchUserProfile();
        setIsEditingProfile(false);
        displayNotification?.('success', 'Profile and signature updated successfully');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      displayNotification?.('error', 'Failed to upload signature');
    } finally {
      setGlobalLoading?.(false);
    }
  };

  // Handle signature upload
  const handleProfileImageUpload = async () => {
    try {
      setGlobalLoading?.(true);
      setGlobalLoadingText?.('Uploading profile picture...');
      
      const formData = new FormData();
      formData.append('picture', profileFile);
      
      const response = await fetchWithAuth({
        method: 'POST',
        path: `/account/picture/`,
        body: formData,
        isFormData: true
      });
      
      if (response?.data) {
        // Refresh user profile to get updated signature
        await fetchUserProfile();
        setIsEditingProfile(false);
        displayNotification?.('success', 'Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      displayNotification?.('error', 'Failed to upload signature');
    } finally {
      setGlobalLoading?.(false);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get full name
  const getFullName = (): string => {
    return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText === 'DELETE') {
      try {
        await fetchWithAuth({
          method: 'DELETE',
          path: '/account/'
        });
        
        setModalOpen(null);
        setDeleteConfirmText('');
        displayNotification?.('success', 'Account deleted successfully');
        setAuthToken?.(null); // Log out user
      } catch (error) {
        console.error('Error deleting account:', error);
        displayNotification?.('error', 'Failed to delete account');
      }
    }
  };

  return (
    <>
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
    
    {/* Tabs */}
    <div className="flex border-b mb-6">
      <button
        className={`py-2 px-4 font-medium ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => setActiveTab('profile')}
      >
        Profile Information
      </button>
      <button
        className={`py-2 px-4 font-medium ${activeTab === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => setActiveTab('password')}
      >
        Change Password
      </button>
    </div>
    
    {/* Profile Tab */}
    {activeTab === 'profile' && (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <button
            className={`px-4 py-2 rounded ${isEditingProfile ? 'bg-gray-200 text-gray-800' : 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 '}`}
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileForm?.first_name || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileForm?.last_name || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={profileForm?.phone_number || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={profileForm?.gender || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {!isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Signature
                  </label>
                  <input
                    type="file"
                    name="signature"
                    accept="image/*"
                    onChange={handleSignatureChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your signature for your membership card.
                  </p>
                </div>
              )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  name="profile-image"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload your new picture for your membership card</p>
              </div>
            
          
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="px-4 py-2 mr-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProfileUpdating}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700`}
              >{isProfileUpdating ? "Updating..." : 'Save Changes' }
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <img
                src={profile?.image || thumbnail}
                alt={getFullName()}
                className="w-32 h-32 rounded-full object-cover"
              />
              <div className="mt-4 text-sm text-gray-500">
                Member since {formatDate(profile?.created_at)}
              </div>
              
              {!isAdmin && profile?.card?.signature && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Signature</h3>
                  <img 
                    src={profile.card.signature} 
                    alt="Signature" 
                    className="mt-2 h-16 border border-gray-200 p-1 rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="md:w-2/3">
              {profile?.role === 'Member' && profile?.user_request ? (
                /* Show detailed user_request data for Members */
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                        <p className="mt-1">{profile.user_request.first_name} {profile.user_request.last_name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="mt-1">{profile.user_request.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                        <p className="mt-1">{profile.user_request.phone_number}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                        <p className="mt-1 capitalize">{profile.user_request.gender}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                        <p className="mt-1">{profile.user_request.date_of_birth ? formatDate(profile.user_request.date_of_birth) : 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Age</h4>
                        <p className="mt-1">{profile.user_request.age} years</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Marital Status</h4>
                        <p className="mt-1 capitalize">{profile.user_request.marital_status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Citizenship</h4>
                        <p className="mt-1">{profile.user_request.citizen}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Country</h4>
                        <p className="mt-1">{profile.user_request.country}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">State</h4>
                        <p className="mt-1">{profile.user_request.state}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">LGA</h4>
                        <p className="mt-1">{profile.user_request.lga}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Address</h4>
                        <p className="mt-1">{profile.user_request.address}</p>
                      </div>
                      {/* <div>
                        <h4 className="text-sm font-medium text-gray-500">Home Address</h4>
                        <p className="mt-1">{profile.user_request.home_address || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Office Address</h4>
                        <p className="mt-1">{profile.user_request.office_address || 'Not provided'}</p>
                      </div> */}
                    </div>
                  </div>

                  {/* YMCA Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">YMCA Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Unit</h4>
                        <p className="mt-1">{profile.user_request.unit}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Club</h4>
                        <p className="mt-1">{profile.user_request.club}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Card ID</h4>
                        <p className="mt-1">{profile?.card?.id_number || 'No ID issued'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Card Status</h4>
                        <p className="mt-1">
                          {profile?.card?.is_active ? 
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span> : 
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                          }
                          {profile?.card?.expired && 
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Expired</span>
                          }
                      {!isHonoraryOrLife && !profile?.card?.expired && computedDaysRemaining > 0 &&
                        <span className="ml-2 text-xs text-gray-500">({computedDaysRemaining} days remaining)</span>
                      }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Profession</h4>
                        <p className="mt-1">{profile.user_request.profession}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Occupation</h4>
                        <p className="mt-1">{profile.user_request.occupation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Religious Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Religious Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Religion</h4>
                        <p className="mt-1">{profile.user_request.religion}</p>
                      </div>
                      {(profile.user_request.religion || '').toLowerCase() !== 'other' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Church Name</h4>
                          <p className="mt-1">{profile.user_request.church_name || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identification Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Valid ID Type</h4>
                      <p className="mt-1">
                        {pickValue(profile.user_request, ['valid_id_type', 'validIdType', 'valid_id_number', 'validIdNumber']) ||
                          pickValue(profile, ['valid_id_type', 'validIdType', 'valid_id_number', 'validIdNumber']) ||
                          'Not provided'}
                      </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Valid ID Document</h4>
                        {pickValue(profile.user_request, ['valid_id_file', 'validIdFile']) ||
                        pickValue(profile, ['valid_id_file', 'validIdFile']) ? (
                          <img
                            src={toAbsoluteUrl(
                              pickValue(profile.user_request, ['valid_id_file', 'validIdFile']) ||
                                pickValue(profile, ['valid_id_file', 'validIdFile'])
                            )}
                            alt="Valid ID Document"
                            className="mt-2 h-28 w-auto max-w-full object-contain rounded border"
                          />
                        ) : (
                          <p className="mt-1">No ID document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Referral Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Referral Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Next of Kin</h4>
                        <p className="mt-1">
                          {pickValue(profile.user_request, ['next_of_kin', 'nextOfKinName', 'next_of_kin_name']) ||
                            pickValue(profile, ['next_of_kin', 'nextOfKinName', 'next_of_kin_name', 'next_of_kin_name']) ||
                            'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Next of Kin Phone</h4>
                        <p className="mt-1">
                          {pickValue(profile.user_request, ['next_of_kin_phone', 'nextOfKinNumber']) ||
                            pickValue(profile, ['next_of_kin_phone', 'nextOfKinNumber']) ||
                            'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Referred By</h4>
                        <p className="mt-1 capitalize">{profile.user_request.referred_by}</p>
                      </div>
                      {profile.user_request.referred_by === 'yes' && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Referral Source</h4>
                            <p className="mt-1">{profile.user_request.referral_source || 'Not provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Referral Name</h4>
                            <p className="mt-1">{profile.user_request.referral_name || 'Not provided'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Request Status Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Request Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <p className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                            profile.user_request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            profile.user_request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            profile.user_request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.user_request.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Request Date</h4>
                        <p className="mt-1">{formatDate(profile.user_request.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Show basic profile data for non-Members or without user_request */
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1">{getFullName()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{profile?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1">{profile?.phone_number || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                    <p className="mt-1">{profile?.gender || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="mt-1">{profile?.role || 'Member'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Unit</h3>
                    <p className="mt-1">{profile?.unit || 'Not assigned'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Youth Council Group</h3>
                    <p className="mt-1">{profile?.youth_council_group?.name || 'Not assigned'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Card ID</h3>
                    <p className="mt-1">{profile?.card?.id_number || 'No ID issued'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Card Status</h3>
                    <p className="mt-1">
                      {profile?.card?.is_active ? 
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span> : 
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
                      }
                      {profile?.card?.expired && 
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Expired</span>
                      }
                      {!isHonoraryOrLife && !profile?.card?.expired && computedDaysRemaining > 0 &&
                        <span className="ml-2 text-xs text-gray-500">({computedDaysRemaining} days remaining)</span>
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}
    
    {/* Password Tab */}
    {activeTab === 'password' && (
      <PasswordChange />
    )}

    {/* Account Danger Zone */}
    <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
      <p className="text-gray-600 mb-4">
        Actions in this section can permanently affect your account. Please proceed with caution.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
          <div>
            <h3 className="font-medium">Delete Account</h3>
            <p className="text-sm text-gray-500">
              This will permanently delete your account and all associated data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen('deleteAccount')}
            className="px-4 py-2 bg-white border border-red-500 text-red-600 rounded-md hover:bg-red-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>

    {/* Delete Account Confirmation Modal */}
    {modalOpen === 'deleteAccount' && (
      <AccountDeleteModal 
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        setModalOpen={setModalOpen}
        handleDeleteAccount={handleDeleteAccount}
      />
    )}
  </div>
    </>
  )
};

export default ProfileManagementPage;
