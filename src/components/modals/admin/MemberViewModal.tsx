import { useState } from "react";
import { Member } from "../../../types/types";
import avatar from '../../../assets/images/thumbnail-im.jpg';
import ConfirmationModal from "./ConfirmationModal";
import { useAuth } from "../../../context/NewAuthContext";



// Member View Modal Component
const MemberViewModal: React.FC<{
    member: Member | null;
    closeModal: () => void;
    onStatusChange: (memberId: string) => void;
    onDeleteMember: (memberId: string) => void;
  }> = ({ member, closeModal, onStatusChange, onDeleteMember }) => {

    const { fetchWithAuth, displayNotification } = useAuth();
    const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
    if (!member) return null;
  
    const handleStatusChange = async () => {
      const payload = {
        is_active : !member.is_active
      }
      try {
        const response = await fetchWithAuth({
          method: 'PATCH',
          path: `/admin/members/${member?.id}`,
          body:payload
        });
        console.log(response)
        displayNotification('success', 'Member status updated successfully');
        onStatusChange(member.id);
        setShowStatusConfirmation(false);
        closeModal();
      } catch (error) {
        console.error('Error fetching churches:', error);
      }

      
    };
  
    const handleDeleteMember = async() => {
      try {
        const response = await fetchWithAuth({
          method: 'DELETE',
          path: `/admin/members/${member?.id}`,
        });
        console.log(response)
        displayNotification('success', response?.message || 'Member status updated successfully');
        onDeleteMember(member.id);
        setShowDeleteConfirmation(false);
        closeModal();
      } catch (error) {
        console.error('Error fetching churches:', error);
      }
      
    };
  
    const isActive = member.is_active;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
        <div className="bg-white rounded-lg max-w-5xl w-full my-8 max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{member.first_name} {member.last_name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <img 
                  src={member.image || avatar} 
                  alt={`${member.first_name} ${member.last_name}`} 
                  className="h-56 w-56 rounded-full mx-auto object-cover border-4 border-indigo-100" 
                />
                
                <div className="mt-4 text-center">
                  <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full 
                    ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {member.is_active ? "Active" : "In Active"}
                  </span>
                </div>
              </div>
  
              <div className="md:col-span-3">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{member.phone_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{member.gender}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{member?.category?.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="font-medium">{new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <h3 className="text-lg font-medium border-b pb-2 mt-6 mb-4">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{member.country || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{member.state || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">LGA</p>
                    <p className="font-medium">{member.lga || 'N/A'}</p>
                  </div>
                  
                  <div className="md:col-span-3">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{member.address || 'N/A'}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium border-b pb-2 mt-6 mb-4">Membership Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Unit</p>
                    <p className="font-medium">{member.unit || 'N/A'}</p>
                  </div>
                  
                  {member.unit === 'Council of Church' && member.church && (
                    <div>
                      <p className="text-sm text-gray-500">Church Name</p>
                      <p className="font-medium">{member.church?.name}</p>
                    </div>
                  )}
                  
                  {member.unit === 'Youth Council' && member.youth_council_group && (
                    <div>
                      <p className="text-sm text-gray-500">Youth Council Type</p>
                      <p className="font-medium">{member.youth_council_group?.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Membership Type</p>
                    <p className="font-medium">{member.membership_category || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Referral</p>
                    <p className="font-medium">{member.referral || 'N/A'}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium border-b pb-2 mt-6 mb-4">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{member.next_of_kin_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="font-medium">{member.next_of_kin_relationship || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{member.next_of_kin_phone || 'N/A'}</p>
                  </div>
                  
                  <div className="md:col-span-3">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{member.next_of_kin_address || 'N/A'}</p>
                  </div>
                </div>
  
                <h3 className="text-lg font-medium border-b pb-2 mt-6 mb-4">Signature</h3>
                <div className="mt-2">
                  {member.signature ? (
                    <img 
                      src={member.signature} 
                      alt="Member Signature" 
                      className="max-h-20 border border-gray-200 p-2 rounded"
                    />
                  ) : (
                    <p className="text-gray-500 italic">No signature uploaded</p>
                  )}
                </div>
              </div>
            </div>
  
            <div className="mt-8 flex flex-wrap justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => setShowStatusConfirmation(true)}
                className={`px-4 py-2 text-white rounded-md ${
                  isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isActive ? 'Disable Account' : 'Enable Account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
  
        {/* Status Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showStatusConfirmation}
          title={isActive ? 'Disable Member Account' : 'Enable Member Account'}
          message={isActive 
            ? `Are you sure you want to disable ${member.first_name} ${member.last_name}'s account? They will no longer be able to access the system.`
            : `Are you sure you want to enable ${member.first_name} ${member.last_name}'s account? They will regain access to the system.`
          }
          confirmText={isActive ? 'Disable Account' : 'Enable Account'}
          cancelText="Cancel"
          confirmButtonClass={isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
          onConfirm={handleStatusChange}
          onCancel={() => setShowStatusConfirmation(false)}
        />
  
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Member Account"
          message={`Are you sure you want to permanently delete ${member.first_name} ${member.last_name}'s account? This action cannot be undone.`}
          confirmText="Delete Account"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDeleteMember}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      </div>
    );
  };
  
export default MemberViewModal;