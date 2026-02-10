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
  valid_id_number: string;
  passport_photo: string;
  valid_id_file: string;
  signature?: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Location Information
  citizen: string;
  country: string;
  state: string;
  lga: string;
  
  // YMCA Information
  unit: string;
  club: string;
  
  // Additional Personal Information
  age: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  home_address: string;
  office_address: string;
  profession: string;
  religion: string;
  church_name: string;
  occupation: string;
  marital_status: string;
  
  // Referral Information
  next_of_kin: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  referral_source: string;
  referral_name: string;
  referred_by: string;
  valid_id_type?: string;
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
  const normalize = (value?: string | null) => (value ?? '').toString().trim().toLowerCase();
  const formatValidIdType = (value?: string | null) => {
    const key = normalize(value);
    const labels: Record<string, string> = {
      national_id: 'National ID',
      international_passport: 'International Passport',
      voters_card: 'Voters Card',
      drivers_license: "Driver's License",
      others: 'Others',
    };
    return labels[key] || value || 'Not Provided';
  };
  // Helper to read multiple possible keys from the memberRequest object (and nested user_request if present)
  const getField = (keys: string[]) => {
    const containers = [
      memberRequest,
      (memberRequest as any)?.user_request,
      (memberRequest as any)?.user,
      (memberRequest as any)?.member_request,
    ];
    for (const container of containers) {
      if (!container) continue;
      for (const k of keys) {
        const v = (container as any)?.[k];
        if (v !== undefined && v !== null && `${v}`.toString().trim() !== '') return v;
        if (v && typeof v === 'object') {
          if ((v as any).name && `${(v as any).name}`.toString().trim() !== '') return (v as any).name;
          if ((v as any).phone && `${(v as any).phone}`.toString().trim() !== '') return (v as any).phone;
        }
      }
    }
    return undefined;
  };

  useEffect(() => {
    const fetchMemberRequest = async () => {
      try {
        if (!requestId) return;
        
        setLoading(true);
        const response = await memberRequestsApi.getMemberRequestById(requestId);
        // API may return the member request directly or wrapped in a `data` property.
        const payload = response?.data ?? response;
        // Some responses embed the request under `user_request`.
        const finalPayload = {
          ...(payload || {}),
          ...((payload as any)?.user_request || {}),
        };
        console.log('Full API response:', response);
        console.log('Extracted payload:', payload);
        console.log('Nested user_request payload:', payload?.user_request);
        console.log('next_of_kin_name:', finalPayload?.next_of_kin_name || finalPayload?.next_of_kin);
        console.log('next_of_kin_phone:', finalPayload?.next_of_kin_phone);
        console.log('valid_id_type:', finalPayload?.valid_id_type || finalPayload?.validIdType);
        setMemberRequest(finalPayload);
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
      const response = await memberRequestsApi.approveMemberRequest(memberRequest.id);
      
      // Check if user was created as part of approval
      if (response?.data?.user_created) {
        toast.success(
          `Member request approved successfully! User profile created for ${response.data.user_email} with default password 'member12345'`,
          { autoClose: 8000 }
        );
      } else {
        toast.success('Member request approved successfully');
      }
      
      navigate('/admin/membership-request');
    } catch (error: any) {
      console.error('Error approving member request:', error);
      
      // Handle specific error messages from backend
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to approve member request');
      }
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
      navigate('/admin/membership-request');
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
          onClick={() => navigate('/admin/membership-request')}
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
                
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm">{memberRequest.age || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm">{memberRequest.gender || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm">{memberRequest.date_of_birth ? new Date(memberRequest.date_of_birth).toLocaleDateString() : 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Marital Status</p>
                  <p className="text-sm">{memberRequest.marital_status || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Profession</p>
                  <p className="text-sm">{memberRequest.profession || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Occupation</p>
                  <p className="text-sm">{memberRequest.occupation || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Religion</p>
                  <p className="text-sm">{memberRequest.religion || 'Other'}</p>
                </div>
                
                {normalize(memberRequest.religion) === 'christian' && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Church Name</p>
                    <p className="text-sm">{memberRequest.church_name || 'Not Provided'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Location Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Citizenship</p>
                  <p className="text-sm">{memberRequest.citizen || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm">{memberRequest.country || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  <p className="text-sm">{memberRequest.state || 'Not Provided'}</p>
                </div>
                
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500">LGA</p>
                  <p className="text-sm">{memberRequest.lga || 'Not Provided'}</p>
                </div>
                
                <div className="md:col-span-3">
                  <p className="text-xs text-gray-500">Home Address</p>
                  <p className="text-sm">{memberRequest.home_address || memberRequest.address || 'Not Provided'}</p>
                </div>
                
              </div>
            </div>

            {/* YMCA Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">YMCA Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="text-sm">{memberRequest.unit || 'Not Provided'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Club / Church</p>
                  {normalize(memberRequest.unit).includes('council') ? (
                    <p className="text-sm">{memberRequest.club || memberRequest.church_name || 'Not Provided'}</p>
                  ) : (
                    <p className="text-sm">{memberRequest.club || 'Not Provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Identification Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Identification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Valid ID Type</p>
                  <p className="text-sm">{formatValidIdType(getField([
                    'valid_id_type',
                    'validIdType',
                    'valid_id_type_name',
                    'valid_id_type_display',
                    'valid_id_type_id',
                    'id_type',
                    'id_type_name',
                    'valid_id',
                  ]))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid ID Document</p>
                  {memberRequest.valid_id_file ? (
                    <img 
                      src={memberRequest.valid_id_file} 
                      alt="Valid ID Document"
                      className="mt-2 w-32 h-20 object-contain rounded-lg border border-gray-300 shadow-sm"
                    />
                  ) : (
                    <p className="text-sm">Not Provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Referral Information */}
            <div className="mb-8">
              <h3 className="text-base font-medium border-b pb-2 mb-4">Referral Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Referred By</p>
                  <p className="text-sm">{normalize(memberRequest.referred_by) === 'yes' ? 'Yes' : 'No'}</p>
                </div>

                {normalize(memberRequest.referred_by) === 'yes' && (
                  <div>
                    <p className="text-xs text-gray-500">Referral Name</p>
                    <p className="text-sm">{memberRequest.referral_name || 'Not Provided'}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-500">Next of Kin Name</p>
                  <p className="text-sm">{getField([
                    'next_of_kin_name',
                    'nextOfKinName',
                    'next_of_kin',
                    'nextOfKin',
                    'next_of_kin_full_name',
                    'nok_name',
                  ]) || 'Not Provided'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Next of Kin Phone Number</p>
                  <p className="text-sm">{getField([
                    'next_of_kin_phone',
                    'nextOfKinNumber',
                    'next_of_kin_phone_number',
                    'next_of_kin_number',
                    'next_of_kin_contact',
                    'nok_phone',
                  ]) || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Passport Photo */}
            {memberRequest.passport_photo && (
              <div className="mb-8">
                <h3 className="text-base font-medium border-b pb-2 mb-4">Passport Photo</h3>
                <div className="flex justify-start">
                  <img 
                    src={memberRequest.passport_photo} 
                    alt="Passport Photo"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Signature */}
            {memberRequest.signature && (
              <div className="mb-8">
                <h3 className="text-base font-medium border-b pb-2 mb-4">Signature</h3>
                <div className="flex justify-start">
                  <img 
                    src={memberRequest.signature} 
                    alt="Signature"
                    className="w-32 h-20 object-contain rounded-lg border border-gray-300 shadow-sm"
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
