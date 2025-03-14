import { useState } from "react";
import { Member } from "../../../types/types";
import avatar from '../../../assets/images/thumbnail-im.jpg';
import ConfirmationModal from "./ConfirmationModal";



// Member View Modal Component
const MemberViewModal: React.FC<{
    member: Member | null;
    closeModal: () => void;
    onStatusChange: (memberId: string, newStatus: 'Active' | 'Inactive') => void;
    onDeleteMember: (memberId: string) => void;
  }> = ({ member, closeModal, onStatusChange, onDeleteMember }) => {
    const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
    if (!member) return null;
  
    const handleStatusChange = () => {
      const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
      onStatusChange(member.id, newStatus);
      setShowStatusConfirmation(false);
      closeModal();
    };
  
    const handleDeleteMember = () => {
      onDeleteMember(member.id);
      setShowDeleteConfirmation(false);
      closeModal();
    };
  
    const isActive = member.status === 'Active';
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img 
                  src={member.profileImage || avatar} 
                  alt={`${member.firstName} ${member.lastName}`} 
                  className="h-48 w-48 rounded-full mx-auto object-cover" 
                />
                
                <div className="mt-4 text-center">
                  <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full 
                    ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      member.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
  
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Member Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{member.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{member.gender}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{member.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Unit</p>
                    <p className="font-medium">{member.unit}</p>
                  </div>
                  
                  {member.unit === 'Council of Church' && member.churchName && (
                    <div>
                      <p className="text-sm text-gray-500">Church Name</p>
                      <p className="font-medium">{member.churchName}</p>
                    </div>
                  )}
                  
                  {member.unit === 'Youth Council' && member.youthCouncilType && (
                    <div>
                      <p className="text-sm text-gray-500">Youth Council Type</p>
                      <p className="font-medium">{member.youthCouncilType}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Join Date</p>
                    <p className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</p>
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
                  isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
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
            ? `Are you sure you want to disable ${member.firstName} ${member.lastName}'s account? They will no longer be able to access the system.`
            : `Are you sure you want to enable ${member.firstName} ${member.lastName}'s account? They will regain access to the system.`
          }
          confirmText={isActive ? 'Disable Account' : 'Enable Account'}
          cancelText="Cancel"
          confirmButtonClass={isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
          onConfirm={handleStatusChange}
          onCancel={() => setShowStatusConfirmation(false)}
        />
  
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Member Account"
          message={`Are you sure you want to permanently delete ${member.firstName} ${member.lastName}'s account? This action cannot be undone.`}
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