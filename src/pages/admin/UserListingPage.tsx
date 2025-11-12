import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import avatar from '../../assets/images/default.jpg';
import BulkUploadModal from '../../components/modals/admin/BulkUploadModal';
import AddUserModal from '../../components/modals/admin/AddUserModal';
import EditMemberModal from '../../components/modals/admin/EditMemberModal';
import { useAuth } from '../../context/NewAuthContext';
import { Member } from '../../types/types';

const UserListingPage: React.FC = () => {
  // State
  const navigate = useNavigate();
  const { fetchWithAuth} = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [membershipCategoryFilter, setMembershipCategoryFilter] = useState<string>('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [churches, setChurches] = useState<{value: string, label: string}[]>([]);
  const [youthGroups, setYouthGroups] = useState<{value: string, label: string}[]>([]);

  // New state for modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  async function fetchMembers(page = 1, append = false) {
    setIsLoadingMore(append);
    if (!append) setIsLoading(true);
    
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/members/?page_size=100&page=${page}`,
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

  async function fetchChurches() {
    if (!fetchWithAuth) return;
    
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/churches`,
      });
      
      // Transform the API response to our form format
      const formattedChurches = data?.data?.map((church: any) => ({
        value: church.id,
        label: church.name
      }));
      
      setChurches(formattedChurches);
    } catch (error) {
      console.error('Error fetching churches:', error);
    }
  }

  async function fetchYouthGroups() {
    if (!fetchWithAuth) return;
    
    try {
      const data = await fetchWithAuth({
        method: 'GET',
        path: `/youth-groups`,
      });
      
      // Transform the API response to our form format
      const formattedGroups = data?.data?.map((group: any) => ({
        value: group.id,
        label: group.name
      }));
      
      setYouthGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching youth groups:', error);
    }
  }

  useEffect(() => {
      fetchMembers()
      fetchYouthGroups();
      fetchChurches();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = members;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(member => 
        member?.first_name.toLowerCase().includes(term) || 
        member?.last_name.toLowerCase().includes(term) || 
        member?.email.toLowerCase().includes(term) ||
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
      result = result.filter(member => member?.user_request?.unit === unitFilter);
    }

    // Apply gender filter
    if (genderFilter) {
      result = result.filter(member => member?.user_request?.gender === genderFilter);
    }

    // Apply membership category filter
    if (membershipCategoryFilter) {
      result = result.filter(member => member.membership_category === membershipCategoryFilter);
    }

    // Apply state filter
    if (stateFilter) {
      result = result.filter(member => member?.user_request?.state === stateFilter);
    }

    setFilteredMembers(result);
  }, [members, searchTerm, categoryFilter, statusFilter, unitFilter, genderFilter, membershipCategoryFilter, stateFilter]);

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
    setStateFilter('');
  };

  const AddUserButtonSection = () => (
    <div className="flex space-x-3">
      <button
        onClick={() => setShowAddUserModal(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Add Member
      </button>
      <button
        onClick={() => setShowBulkUploadModal(true)}
        className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
      >
        Bulk Upload
      </button>
    </div>
  );


  // Close member edit modal
  const closeMemberEdit = () => {
    setEditingMember(null);
  };


  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-600 mt-1">Browse and filter member records</p>
        </div>
        <div className="mt-4 md:mt-0">
          <AddUserButtonSection />
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              <option value="Adult Member">Adult Member</option>
              <option value="Youth Member">Youth Member</option>
              <option value="Senior Member">Senior Member</option>
            </select>
          </div>

          <div>
            <label htmlFor="membershipCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Membership Type
            </label>
            <select
              id="membershipCategory"
              value={membershipCategoryFilter}
              onChange={(e) => setMembershipCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Membership Types</option>
              <option value="Full Membership">Full Membership</option>
              <option value="Associate Membership">Associate Membership</option>
              <option value="Honorary Membership">Honorary Membership</option>
              <option value="Student Membership">Student Membership</option>
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
              <option value="Council of Church">Council of Church</option>
              <option value="Youth Council">Youth Council</option>
              <option value="Y's Men">Y's Men</option>
              <option value="Central Club">Central Club</option>
            </select>
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All States</option>
              <option value="Abia">Abia</option>
              <option value="Adamawa">Adamawa</option>
              <option value="Akwa Ibom">Akwa Ibom</option>
              <option value="Anambra">Anambra</option>
              <option value="Bauchi">Bauchi</option>
              <option value="Bayelsa">Bayelsa</option>
              <option value="Benue">Benue</option>
              <option value="Borno">Borno</option>
              <option value="Cross River">Cross River</option>
              <option value="Delta">Delta</option>
              <option value="Ebonyi">Ebonyi</option>
              <option value="Edo">Edo</option>
              <option value="Ekiti">Ekiti</option>
              <option value="Enugu">Enugu</option>
              <option value="FCT">FCT</option>
              <option value="Gombe">Gombe</option>
              <option value="Imo">Imo</option>
              <option value="Jigawa">Jigawa</option>
              <option value="Kaduna">Kaduna</option>
              <option value="Kano">Kano</option>
              <option value="Katsina">Katsina</option>
              <option value="Kebbi">Kebbi</option>
              <option value="Kogi">Kogi</option>
              <option value="Kwara">Kwara</option>
              <option value="Lagos">Lagos</option>
              <option value="Nasarawa">Nasarawa</option>
              <option value="Niger">Niger</option>
              <option value="Ogun">Ogun</option>
              <option value="Ondo">Ondo</option>
              <option value="Osun">Osun</option>
              <option value="Oyo">Oyo</option>
              <option value="Plateau">Plateau</option>
              <option value="Rivers">Rivers</option>
              <option value="Sokoto">Sokoto</option>
              <option value="Taraba">Taraba</option>
              <option value="Yobe">Yobe</option>
              <option value="Zamfara">Zamfara</option>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Membership Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Category/Unit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Membership Expiry Date
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
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={member?.image || avatar} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-sm text-gray-500 md:hidden">{member.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.membership_category || 'Full Membership'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{member?.user_request?.unit}</div>
                      {member.unit === 'Council of Church' && member?.church && (
                        <div className="text-xs text-gray-500">{member?.church?.name}</div>
                      )}
                      {member.unit === 'Youth Council' && member?.youth_council_group && (
                        <div className="text-xs text-gray-500">{member.youth_council_group?.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{member?.user_request?.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {member.is_active ? "Active" : "In Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(member?.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(member?.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/users/${member.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
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

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          isOpen={!!editingMember}
          closeModal={closeMemberEdit}
          member={editingMember}
          onUpdateMember={fetchMembers}
          churches={churches}
          youthGroups={youthGroups}
        />
      )}

      {/* Member View now handled by UserDetailPage */}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        closeModal={() => setShowAddUserModal(false)}
        onAddMember={fetchMembers}
        churches={churches}
        youthGroups={youthGroups}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        closeModal={() => setShowBulkUploadModal(false)}
        onUploadMembers={fetchMembers}
      />
    </div>
  );
};

export default UserListingPage;