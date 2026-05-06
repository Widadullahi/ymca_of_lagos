import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Member } from "../../types/types";
import avatar from '../../assets/images/thumbnail-im.jpg';
import { useAuth } from "../../context/NewAuthContext";
import ConfirmationModal from "../../components/modals/admin/ConfirmationModal";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Modern gradient background wrapper
const PageWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-2">
    {children}
  </div>
);

// Define subscription history interface
interface SubscriptionHistory {
  id: string;
  plan_name: string;
  plan_description?: string;
  plan_price: number;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  days_until_expiry?: number;
}

const UserDetailPage: React.FC = () => {
  // Password modal state and logic
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'newPassword' | 'confirmPassword') => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      displayNotification('error', 'Please fill in both password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      displayNotification('error', 'Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await fetchWithAuth({
        method: 'POST',
        path: `/admin/members/${userId}/set_password/`,
        body: { password: passwordData.newPassword },
      });
      displayNotification('success', 'Password updated successfully');
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      displayNotification('error', 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const toAbsoluteUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const prefix = (BACKEND_URL || '').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    const suffix = url.startsWith('/') ? url : `/${url}`;
    return `${prefix}${suffix}`;
  };
  const openImagePreview = (url?: string | null, alt = 'Preview image') => {
    const resolved = toAbsoluteUrl(url);
    if (!resolved) return;
    setPreviewImage({ src: resolved, alt });
  };
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, ] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'user_request'>('profile');

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth({
          method: 'GET',
          path: `/admin/members/${userId}`,
        });

        setMember(response);
        setFormData(response);
        console.log(response)
      } catch (error) {
        console.error('Error fetching member details:', error);
        displayNotification('error', 'Failed to load member details');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubscriptionHistory = async () => {
      try {
        setLoadingSubscriptions(true);
        const response = await fetchWithAuth({
          method: 'GET',
          path: `/subscriptions/user/${userId}/history/`,
        });

        if (response && response.success && response.data) {
          setSubscriptionHistory(response.data);
        } else {
          // If no subscriptions found, set empty array
          setSubscriptionHistory([]);
        }
      } catch (error) {
        console.error('Error fetching subscription history:', error);
        displayNotification('error', 'Failed to load subscription history');
        setSubscriptionHistory([]);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    if (userId) {
      fetchMemberDetails();
      fetchSubscriptionHistory();
    }
  }, [userId, fetchWithAuth, displayNotification]);
  

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  

  const handleStatusChange = async () => {
    if (!member) return;
    
    const payload = {
      is_active: !member.is_active
    };
    
    try {
       await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/members/${userId}`,
        body: payload
      });
      
      displayNotification('success', 'Member status updated successfully');
      setMember(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      setShowStatusConfirmation(false);
    } catch (error) {
      console.error('Error updating member status:', error);
      displayNotification('error', 'Failed to update member status');
    }
  };

  const handleDeleteMember = async () => {
    try {
      const response = await fetchWithAuth({
        method: 'DELETE',
        path: `/admin/members/${userId}`,
      });
      
      displayNotification('success', response?.message || 'Member deleted successfully');
      setShowDeleteConfirmation(false);
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting member:', error);
      displayNotification('error', 'Failed to delete member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Member not found</h2>
        <button 
          onClick={() => navigate('/admin/users')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Modern pill-style tab navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white rounded-full shadow p-1 gap-2">
          <button
            className={`px-6 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-6 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none ${
              activeTab === 'subscription'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('subscription')}
          >
            Subscription
          </button>
          <button
            className={`px-6 py-2 rounded-full text-base font-semibold transition-colors duration-200 focus:outline-none ${
              activeTab === 'user_request'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('user_request')}
          >
            User Request
          </button>
        </div>
      </div>

      {/* Card container for tab content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            {/* Avatar and status */}
            <div className="flex flex-col items-center gap-4 md:gap-6 md:w-1/4">
              <img 
                src={toAbsoluteUrl(member.image) || avatar} 
                alt={`${member.first_name} ${member.last_name}`} 
                className="h-36 w-36 md:h-44 md:w-44 cursor-zoom-in rounded-full object-cover border-4 border-blue-100 shadow-lg transition-transform duration-300 hover:scale-105" 
                onClick={() => openImagePreview(member.image || avatar, `${member.first_name} ${member.last_name}`)}
              />
              <span className={`px-4 py-1 rounded-full text-xs font-semibold shadow ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{member.is_active ? 'Active' : 'Inactive'}</span>
              <div className="flex flex-col w-full gap-2 mt-2">
                <button
                  onClick={() => setShowStatusConfirmation(true)}
                  className={`w-full px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors duration-200 shadow ${member.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {member.is_active ? 'Deactivate Member' : 'Activate Member'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold shadow hover:bg-red-100 border border-red-200 text-sm transition-colors duration-200"
                >
                  Delete Member
                </button>
              </div>
            </div>

            {/* Main info and edit */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {isEditing ? (
                  <div className="flex flex-col md:flex-row gap-2 w-full">
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full md:w-1/2 p-2 text-xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      className="w-full md:w-1/2 p-2 text-xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">{member.first_name} {member.last_name}</h2>
                )}
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors duration-200 shadow"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Back
                </button>
              </div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-blue-700">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-sm">{member.email}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">First Name </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-sm">{member.first_name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Name </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-sm">{member.last_name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm">{member.user_request?.phone_number || member.phone_number || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm">{member.user_request?.gender}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Additional Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm">{member.user_request?.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm">{member.user_request?.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Marital Status</p>
                  <p className="text-sm">{member.user_request?.marital_status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profession</p>
                  <p className="text-sm">{member.user_request?.profession || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Occupation</p>
                  <p className="text-sm">{member.user_request?.occupation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Religion</p>
                  <p className="text-sm">{member.user_request?.religion || 'N/A'}</p>
                </div>
                {(member.user_request?.religion || '').toLowerCase() !== 'other' && (
                  <div>
                    <p className="text-xs text-gray-500">Church Name</p>
                    <p className="text-sm">{member.user_request?.church_name || 'N/A'}</p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Citizen</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.user_request?.citizen || 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.user_request?.state || 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">LGA</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lga"
                      value={formData.lga || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.user_request?.lga || 'N/A'}</p>
                  )}
                </div>
                
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500">Address</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.user_request?.address || member.address || 'N/A'}</p>
                  )}
                </div>
              </div>
              

              
              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Next of Kin</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm">{member.user_request?.next_of_kin || member.user_request?.next_of_kin_name || member.user_request?.nextOfKinName || member.next_of_kin_name || member.next_of_kin || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm">{member.user_request?.next_of_kin_phone || member.user_request?.nextOfKinNumber || member.next_of_kin_phone || member.nextOfKinNumber || 'N/A'}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Valid ID Type</p>
                  <p className="text-sm">{member.user_request?.valid_id_type || member.user_request?.validIdType || member.valid_id_type || member.validIdType || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Valid ID Document</p>
                  {(member.user_request?.valid_id_file || member.valid_id_file) ? (
                    <div className="space-y-2">
                      <img
                        src={toAbsoluteUrl(member.user_request?.valid_id_file || member.valid_id_file)}
                        alt="Valid ID Document"
                        className="h-24 w-auto max-w-full object-contain rounded border"
                      />
                      <a
                        href={toAbsoluteUrl(member.user_request?.valid_id_file || member.valid_id_file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Open Full Size
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm">No ID file uploaded</p>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Signature</h3>
              <div className="mt-2">
                {member.card?.signature || member.user_request?.signature ? (
                  <img 
                    src={toAbsoluteUrl(member.card?.signature || member.user_request?.signature)} 
                    alt="Member Signature" 
                    className="max-h-20 cursor-zoom-in border border-gray-200 rounded"
                    onClick={() => openImagePreview(member.card?.signature || member.user_request?.signature, 'Member Signature')}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No signature available</p>
                )}
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Card Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Card ID Number</p>
                  <p className="text-sm font-mono font-semibold">{member.card?.id_number || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Card Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${member.card?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {member.card?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Card Expiry Date</p>
                  {isEditing ? (
                    <input
                      type="date"
                      name="card_expiry_date"
                      value={formData.card_expiry_date || (member.card?.expired_at ? member.card.expired_at.split('T')[0] : '')}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-sm">{member.card?.expired_at ? new Date(member.card.expired_at).toLocaleDateString() : 'Not set'}</p>
                  )}
                </div>
              </div>

              {/* Password Update Section */}
              <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-blue-700">Change Password</h3>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Update Password
                </button>
              </div>

              {/* Password Modal */}
              {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative max-h-screen overflow-y-auto">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"
                      onClick={() => setShowPasswordModal(false)}
                      aria-label="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h4 className="text-xl font-bold mb-4 text-blue-700">Update Password</h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswordFields.newPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            className="w-full p-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('newPassword')}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
                            aria-label={showPasswordFields.newPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPasswordFields.newPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showPasswordFields.confirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className="w-full p-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
                            aria-label={showPasswordFields.confirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPasswordFields.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        )}

        {/* Subscription History Tab Content */}
        {activeTab === 'subscription' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-10">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-blue-700">Subscription History</h3>

            {loadingSubscriptions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : subscriptionHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No subscription history found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionHistory.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{subscription.plan_name}</div>
                            {subscription.plan_description && (
                              <div className="text-xs text-gray-500">{subscription.plan_description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                            subscription.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                            subscription.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            subscription.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subscription.payment_status.charAt(0).toUpperCase() + subscription.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(subscription.start_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(subscription.end_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">₦{subscription.plan_price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.is_active && subscription.days_until_expiry !== undefined ? (
                            <span className={`${subscription.days_until_expiry <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                              {subscription.days_until_expiry} days
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Request Details Tab Content */}
      {activeTab === 'user_request' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-10">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-blue-700">User Request Details</h3>

            {member.user_request ? (
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm">{member.user_request.first_name} {member.user_request.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm">{member.user_request.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-sm">{member.user_request.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm">{member.user_request.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="text-sm">{member.user_request.age}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm">{member.user_request.date_of_birth ? new Date(member.user_request.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Place of Birth</p>
                      <p className="text-sm">{member.user_request.place_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Marital Status</p>
                      <p className="text-sm">{member.user_request.marital_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Profession</p>
                      <p className="text-sm">{member.user_request.profession || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Occupation</p>
                      <p className="text-sm">{member.user_request.occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Religion</p>
                      <p className="text-sm">{member.user_request.religion || 'N/A'}</p>
                    </div>
                    {member.user_request?.religion?.toLowerCase() === 'christian' && (
                      <div>
                        <p className="text-xs text-gray-500">Church Name</p>
                        <p className="text-sm">{member.user_request.church_name || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Information Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Citizenship</p>
                      <p className="text-sm">{member.user_request.citizen || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-sm">{member.user_request.country || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm">{member.user_request.state || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">LGA</p>
                      <p className="text-sm">{member.user_request.lga || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Home Address</p>
                      <p className="text-sm">{member.user_request.home_address || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs text-gray-500">Office Address</p>
                      <p className="text-sm">{member.user_request.office_address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* YMCA Information Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">YMCA Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Unit</p>
                      <p className="text-sm">{member.user_request.unit || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Club / Church</p>
                      {member.user_request?.unit?.toLowerCase().includes('council') ? (
                        <p className="text-sm">{member.user_request.club || member.user_request.church_name || 'N/A'}</p>
                      ) : (
                        <p className="text-sm">{member.user_request.club || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Identification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Valid ID Type</p>
                      <p className="text-sm">{member.user_request?.valid_id_type || member.user_request?.validIdType || member.valid_id_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Passport Photo</p>
                      {member.user_request?.passport_photo ? (
                        <img 
                          src={toAbsoluteUrl(member.user_request?.passport_photo)} 
                          alt="Passport" 
                          className="h-20 w-20 cursor-zoom-in object-cover rounded border"
                          onClick={() => openImagePreview(member.user_request?.passport_photo || '', 'Passport Photo')}
                        />
                      ) : (
                        <p className="text-sm">No photo uploaded</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valid ID Document</p>
                      {(member.user_request?.valid_id_file || member.user_request?.validIdFile || member.valid_id_file) ? (
                        <div className="space-y-2">
                          <img
                            src={toAbsoluteUrl(member.user_request?.valid_id_file || member.user_request?.validIdFile || member.valid_id_file)}
                            alt="Valid ID Document"
                            className="h-24 w-auto max-w-full cursor-zoom-in object-contain rounded border"
                            onClick={() =>
                              openImagePreview(
                                member.user_request?.valid_id_file || member.user_request?.validIdFile || member.valid_id_file,
                                'Valid ID Document'
                              )
                            }
                          />
                          <a
                            href={toAbsoluteUrl(member.user_request?.valid_id_file || member.user_request?.validIdFile || member.valid_id_file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Open Full Size
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm">No ID file uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Referral Information Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Referral Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Next of Kin</p>
                      <p className="text-sm">{member.user_request?.next_of_kin || member.user_request?.next_of_kin_name || member.user_request?.nextOfKinName || member.next_of_kin_name || member.next_of_kin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Referral Source</p>
                      <p className="text-sm">{member.user_request.referral_source || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Referral Name</p>
                      <p className="text-sm">{member.user_request.referral_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Referred By</p>
                      <p className="text-sm">{member.user_request.referred_by || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Request Status Section */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">Request Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                        member.user_request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        member.user_request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.user_request.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm">{new Date(member.user_request.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Updated At</p>
                      <p className="text-sm">{new Date(member.user_request.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No user request information available</p>
                <p className="text-sm text-gray-400 mt-2">This user may have been created directly by an admin</p>
              </div>
            )}
          </div>
        </div>
      )}


        {/* Close main content container */}
      </div>

      {showStatusConfirmation && (
        <ConfirmationModal
          isOpen={showStatusConfirmation}
          title={`${member.is_active ? 'Deactivate' : 'Activate'} Member`}
          message={`Are you sure you want to ${member.is_active ? 'deactivate' : 'activate'} this member?`}
          confirmText={member.is_active ? 'Deactivate' : 'Activate'}
          cancelText="Cancel"
          confirmButtonClass={member.is_active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
          onConfirm={handleStatusChange}
          onCancel={() => setShowStatusConfirmation(false)}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Member"
          message="Are you sure you want to delete this member? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDeleteMember}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setPreviewImage(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white object-contain p-2 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </PageWrapper>
  );
};

export default UserDetailPage;
