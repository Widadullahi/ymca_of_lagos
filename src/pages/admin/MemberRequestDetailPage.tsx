import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createMemberRequestsApi } from '../../api/memberRequests';
import { useAuth } from '../../context/NewAuthContext';
import ConfirmationModal from '../../components/modals/admin/ConfirmationModal';

interface MemberRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  valid_id_type: string;
  valid_id_number: string;
  passport_photo: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const MemberRequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  
  // Initialize API
  const memberRequestsApi = createMemberRequestsApi(fetchWithAuth);
  
  const [memberRequest, setMemberRequest] = useState<MemberRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showApproveConfirmation, setShowApproveConfirmation] = useState<boolean>(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<boolean>(false);

  useEffect(() => {
    const fetchMemberRequest = async () => {
      try {
        if (!requestId) return;
        
        setLoading(true);
        const response = await memberRequestsApi.getMemberRequestById(requestId);
        setMemberRequest(response.data);
      } catch (error) {
        console.error('Error fetching member request:', error);
        toast.error('Failed to load member request details');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberRequest();
  }, [requestId]);




  const handleApprove = async () => {
    if (!memberRequest) return;
    
    setProcessingAction(true);
    try {
      await memberRequestsApi.approveMemberRequest(memberRequest.id);
      toast.success('Member request approved successfully');
      navigate('/admin/member-requests');
    } catch (error) {
      console.error('Error approving member request:', error);
      toast.error('Failed to approve member request');
    } finally {
      setProcessingAction(false);
      setShowApproveConfirmation(false);
    }
  };

  const handleReject = async () => {
    if (!memberRequest) return;
    
    setProcessingAction(true);
    try {
      await memberRequestsApi.rejectMemberRequest(memberRequest.id);
      toast.success('Member request rejected');
      navigate('/admin/member-requests');
    } catch (error) {
      console.error('Error rejecting member request:', error);
      toast.error('Failed to reject member request');
    } finally {
      setProcessingAction(false);
      setShowRejectConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!memberRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Member Request Not Found</h2>
        <p className="text-gray-600 mb-4">The member request you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/admin/member-requests')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Member Requests
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">{memberRequest.first_name} {memberRequest.last_name}</h2>
            <div className="flex space-x-3">
              {memberRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowApproveConfirmation(true)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    disabled={processingAction}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectConfirmation(true)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    disabled={processingAction}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/admin/member-requests')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-6">
              <span className={`px-2 py-1 text-xs rounded-full ${
                memberRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                memberRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {memberRequest.status.charAt(0).toUpperCase() + memberRequest.status.slice(1)}
              </span>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{memberRequest.email || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm">{memberRequest.phone_number || 'Not Provided'}</p>
                </div>
                
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm">{memberRequest.address || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Identification Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Identification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Valid ID Type</p>
                  <p className="text-sm">{memberRequest.valid_id_type || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Valid ID Number</p>
                  <p className="text-sm">{memberRequest.valid_id_number || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Passport Photo */}
            {memberRequest.passport_photo && (
              <div className="mb-8">
                <h3 className="text-base font-medium border-b pb-2 mb-4">Passport Photo</h3>
                <div className="flex justify-center">
                  <img 
                    src={memberRequest.passport_photo} 
                    alt="Passport Photo"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Request Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Request Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(memberRequest.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm">{new Date(memberRequest.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showApproveConfirmation}
        title="Approve Member Request"
        message="Are you sure you want to approve this member request? This will create a new member account."
        confirmText="Approve"
        cancelText="Cancel"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
        onConfirm={handleApprove}
        onCancel={() => setShowApproveConfirmation(false)}
      />

      <ConfirmationModal
        isOpen={showRejectConfirmation}
        title="Reject Member Request"
        message="Are you sure you want to reject this member request? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleReject}
        onCancel={() => setShowRejectConfirmation(false)}
      />
    </div>
  );
};

export default MemberRequestDetailPage;