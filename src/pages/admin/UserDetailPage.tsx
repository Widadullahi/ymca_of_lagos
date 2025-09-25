import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Member } from "../../types/types";
import avatar from '../../assets/images/thumbnail-im.jpg';
import { useAuth } from "../../context/NewAuthContext";
import ConfirmationModal from "../../components/modals/admin/ConfirmationModal";

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { fetchWithAuth, displayNotification } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});

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
      } catch (error) {
        console.error('Error fetching member details:', error);
        displayNotification('error', 'Failed to load member details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMemberDetails();
    }
  }, [userId, fetchWithAuth, displayNotification]);
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setFormData(member || {});
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member || !formData) return;
    
    try {
      await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/members/${userId}`,
        body: formData
      });
      
      setMember({...member, ...formData});
      setIsEditing(false);
      displayNotification('success', 'Member information updated successfully');
    } catch (error) {
      console.error('Error updating member:', error);
      displayNotification('error', 'Failed to update member information');
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg ">
        <div className="p-6">
          <div className="flex justify-between items-start">
            {isEditing ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className="w-1/2 p-1 text-xl font-bold border rounded"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className="w-1/2 p-1 text-xl font-bold border rounded"
                  placeholder="Last Name"
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold">{member.first_name} {member.last_name}</h2>
            )}
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={() => navigate('/admin/users')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                <img 
                  src={member.image || avatar} 
                  alt={`${member.first_name} ${member.last_name}`} 
                  className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-md" 
                />
                
                <div className="mt-4 text-center">
                  <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full shadow-sm
                    ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-6 flex flex-col w-full space-y-2">
                  <button
                    onClick={() => setShowStatusConfirmation(true)}
                    className={`px-4 py-2 rounded text-white text-sm font-medium
                      ${member.is_active 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {member.is_active ? 'Deactivate Member' : 'Activate Member'}
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                  >
                    Delete Member
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.email}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.phone_number}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm">{member.gender}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm">{member?.category?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <h3 className="text-base font-medium border-b pb-2 mt-6 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className="w-full p-1 text-sm border rounded"
                    />
                  ) : (
                    <p className="text-sm">{member.country || 'N/A'}</p>
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
                    <p className="text-sm">{member.state || 'N/A'}</p>
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
                    <p className="text-sm">{member.lga || 'N/A'}</p>
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
                    <p className="text-sm">{member.address || 'N/A'}</p>
                  )}
                </div>
              </div>
              
              <h3 className="text-base font-medium border-b pb-2 mt-6 mb-4">Membership Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="text-sm">{member.unit || 'N/A'}</p>
                </div>
                
                {member.unit === 'Council of Church' && member.church && (
                  <div>
                    <p className="text-xs text-gray-500">Church Name</p>
                    <p className="text-sm">{member.church?.name}</p>
                  </div>
                )}
                
                {member.unit === 'Youth Council' && member.youth_council_group && (
                  <div>
                    <p className="text-xs text-gray-500">Youth Council Type</p>
                    <p className="text-sm">{member.youth_council_group?.name}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-500">Membership Type</p>
                  <p className="text-sm">{member.membership_category || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Referral</p>
                  <p className="text-sm">{member.referral || 'N/A'}</p>
                </div>
              </div>
              
              <h3 className="text-base font-medium border-b pb-2 mt-6 mb-4">Next of Kin</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm">{member.next_of_kin_name || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Relationship</p>
                  <p className="text-sm">{member.next_of_kin_relationship || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm">{member.next_of_kin_phone || 'N/A'}</p>
                </div>
                
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm">{member.next_of_kin_address || 'N/A'}</p>
                </div>
              </div>

              <h3 className="text-base font-medium border-b pb-2 mt-6 mb-4">Signature</h3>
              <div className="mt-2">
                {member.signature ? (
                  <img 
                    src={member.signature} 
                    alt="Member Signature" 
                    className="max-h-20 border border-gray-200 rounded"
                  />
                ) : (
                  <p className="text-sm text-gray-500">No signature available</p>
                )}
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default UserDetailPage;