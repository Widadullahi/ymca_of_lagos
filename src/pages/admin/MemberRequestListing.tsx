import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { Member } from '../../types/types';

const MemberRequestListing: React.FC = () => {
  // State
  const { fetchWithAuth} = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [membershipCategoryFilter, setMembershipCategoryFilter] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  
  // Modal states
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  async function fetchMembers(page = 1, append = false) {
    setIsLoadingMore(append);
    if (!append) setIsLoading(true);
    
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/requests/?page_size=10&page=${page}`,
      });

      if (append) {
        setMembers(prev => [...prev, ...response?.results]);
      } else {
        setMembers(response?.results);
      }
      setIsLoading(false)
      setHasNextPage(!!response.metadata.next);
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching members:', error);
    }finally{
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  const loadMoreMembers = () => {
    if (hasNextPage && !isLoadingMore) {
      fetchMembers(currentPage + 1, true);
    }
  };

  // Handle approve request
  const handleApproveRequest = async () => {
    if (!selectedMember) return;
    
    setIsProcessing(true);
    try {
      await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/requests/${selectedMember.id}/status/`,
        body: {
          status: 'approved',
          review_notes: reviewNotes
        }
      });
      
      // Update the member in the local state
      setMembers(prev => prev.map(member => 
        member.id === selectedMember.id 
          ? { ...member, status: 'approved' }
          : member
      ));
      
      setShowApproveModal(false);
      setSelectedMember(null);
      setReviewNotes('');
      
      // Show success message (you can implement toast notification here)
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async () => {
    if (!selectedMember) return;
    
    setIsProcessing(true);
    try {
      await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/requests/${selectedMember.id}/status/`,
        body: {
          status: 'rejected',
          review_notes: reviewNotes
        }
      });
      
      // Remove the member from local state or update status
      setMembers(prev => prev.filter(member => member.id !== selectedMember.id));
      
      setShowDeleteModal(false);
      setSelectedMember(null);
      setReviewNotes('');
      
      alert('Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal handlers
  const openViewModal = (member: Member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const openApproveModal = (member: Member) => {
    setSelectedMember(member);
    setShowApproveModal(true);
  };

  const openDeleteModal = (member: Member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowApproveModal(false);
    setShowDeleteModal(false);
    setSelectedMember(null);
    setReviewNotes('');
  };

  useEffect(()=>{
    fetchMembers();
  },[])

  // Apply filters
  useEffect(() => {
    let result = members;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(member => 
        member?.first_name.toLowerCase().includes(term) || 
        member?.last_name.toLowerCase().includes(term) || 
        member?.email?.toLowerCase().includes(term) ||
        member?.phone_number.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(member => member.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(member => {
        if (statusFilter === 'Active') {
          return member.is_active;
          } else if (statusFilter === 'Inactive') {
            return !member.is_active;
          }
      });
    }

    // Apply unit filter
    if (unitFilter) {
      result = result.filter(member => member.unit === unitFilter);
    }

    // Apply gender filter
    if (genderFilter) {
      result = result.filter(member => member.gender === genderFilter);
    }

    // Apply membership category filter
    if (membershipCategoryFilter) {
      result = result.filter(member => member.membership_category === membershipCategoryFilter);
    }

    setFilteredMembers(result);
  }, [members, searchTerm, categoryFilter, statusFilter, unitFilter, genderFilter, membershipCategoryFilter]);

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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setUnitFilter('');
    setGenderFilter('');
    setMembershipCategoryFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Membership Requests</h1>
          <p className="text-gray-600 mt-1">Browse and filter records</p>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Members listing */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No members found</h3>
          <p className="text-gray-500">Try adjusting your filter criteria or add a new member.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.email || 'Not Provided'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{member.phone_number || 'Not Provided'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {member?.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(member?.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openViewModal(member)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      {member?.status !== 'approved' && (
                        <button
                          onClick={() => openApproveModal(member)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(member)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMembers.length > 0 && hasNextPage && (
        <button 
          onClick={loadMoreMembers}
          disabled={isLoadingMore}
          className="w-full mt-4 text-indigo-600 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-indigo-600 rounded-full"></span>
              Loading...
            </span>
          ) : (
            "Load More Members"
          )}
        </button>
      )}

      {/* View Modal */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Member Request Details</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.email || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.phone_number || 'Not Provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.address || 'Not Provided'}</p>
                  </div>
                </div>
              </div>

              {/* Identification Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid ID Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.valid_id_type || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid ID Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMember.valid_id_number || 'Not Provided'}</p>
                  </div>
                </div>
              </div>

              {/* Passport Photo */}
              {selectedMember.passport_photo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Passport Photo</h4>
                  <div className="flex justify-center">
                    <img 
                      src={selectedMember.passport_photo} 
                      alt="Passport Photo"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Request Status */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Request Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                      ${selectedMember?.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedMember?.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'}`}>
                      {selectedMember?.status_display || selectedMember?.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedMember?.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Approve Request</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to approve the membership request for{' '}
                <span className="font-semibold">{selectedMember.first_name} {selectedMember.last_name}</span>?
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveRequest}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Approving...' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Request</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the membership request for{' '}
                <span className="font-semibold">{selectedMember.first_name} {selectedMember.last_name}</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Add reason for deleting this request..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRequest}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberRequestListing;