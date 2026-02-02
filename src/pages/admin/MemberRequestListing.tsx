import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { useNavigate } from 'react-router-dom';
import { Member } from '../../types/types';

const MemberRequestListing: React.FC = () => {
  // State
  const { fetchWithAuth} = useAuth();
  const navigate = useNavigate();
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
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // View modal replaced with dedicated page

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
      const response = await fetchWithAuth({
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
      
      // Show success message with user creation info if applicable
      if (response?.data?.user_created) {
        alert(`Request approved successfully! User profile created for ${response.data.user_email} with default password 'member12345'`);
      } else {
        alert('Request approved successfully!');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      
      // Handle specific error messages from backend
      if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to approve request. Please try again.');
      }
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

  // Navigation handler
  const navigateToMemberDetail = (member: Member) => {
    navigate(`/admin/membership-request/${member.id}`);
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
      result = result.filter(member => member.status === statusFilter);
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members.filter(m => m.status === 'pending' || !m.status).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members.filter(m => m.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {members.filter(m => m.status === 'rejected').length}
              </p>
            </div>
          </div>
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
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="unit"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Units</option>
              <option value="Coundil of church">Council of Church</option>
              <option value="Youth Council">Youth Council</option>
              <option value="Y's Men">Y's Men</option>
              <option value="Central club">Central Club</option>
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
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
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Age
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Gender
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Unit
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Profession
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Marital Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Religion
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Referral
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Submitted
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500 lg:hidden">
                            {member.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{member.email || 'Not Provided'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{member.phone_number || 'Not Provided'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{member.age || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 
                          member.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}>
                        {member.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{member.unit || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">
                        {member.state ? `${member.state}${member.country ? `, ${member.country}` : ''}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{member.profession || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{member.marital_status || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{member.religion || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900">
                        {member.referral_source ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member?.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          member?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {member?.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(member?.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigateToMemberDetail(member)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      {member?.status !== 'approved' && (
                        <button
                          onClick={() => openApproveModal(member)}
                          className="text-green-600 hover:text-green-900 mr-3"
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

      {/* Member request details now handled by MemberRequestDetailPage */}

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