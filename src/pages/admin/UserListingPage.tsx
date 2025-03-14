import React, { useState, useEffect } from 'react';
import avatar from '../../assets/images/thumbnail-im.jpg';
import BulkUploadModal from '../../components/modals/admin/BulkUploadModal';
import AddUserModal from '../../components/modals/admin/AddUserModal';
import MemberViewModal from '../../components/modals/admin/MemberViewModal';

// Updated Types
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  signature: string;
  gender: 'Male' | 'Female' | 'Other';
  unit: 'Council of Church' | 'Youth Council' | "Y's Men" | 'Central Club';
  churchName?: string; // Only when unit is 'Council of Church'
  youthCouncilType?: 'Hi-Y' | 'Y-Elite'; // Only when unit is 'Youth Council'
  email: string;
  phoneNumber: string;
  category: 'Adult Member' | 'Youth Member' | 'Senior Member';
  status: 'Active' | 'Inactive' | 'On Leave';
  joinDate: string;
}






const UserListingPage: React.FC = () => {
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [viewingMember, setViewingMember] = useState<Member | null>(null);


  // New state for modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Mock data - In a real application, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockMembers: Member[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          profileImage: avatar,
          signature: '',
          gender: 'Male',
          unit: 'Council of Church',
          churchName: 'St. Mary\'s Church',
          email: 'john.smith@example.com',
          phoneNumber: '123-456-7890',
          category: 'Adult Member',
          status: 'Active',
          joinDate: '2023-09-01T00:00:00Z',
        },
        {
          id: '2',
          firstName: 'Maria',
          lastName: 'Rodriguez',
          profileImage: avatar,
          signature: '',
          gender: 'Female',
          unit: 'Youth Council',
          youthCouncilType: 'Y-Elite',
          email: 'maria.rodriguez@example.com',
          phoneNumber: '234-567-8901',
          category: 'Youth Member',
          status: 'Active',
          joinDate: '2024-01-15T00:00:00Z',
        },
        {
          id: '3',
          firstName: 'David',
          lastName: 'Johnson',
          profileImage: avatar,
          signature: '',
          gender: 'Male',
          unit: "Y's Men",
          email: 'david.johnson@example.com',
          phoneNumber: '345-678-9012',
          category: 'Senior Member',
          status: 'On Leave',
          joinDate: '2022-07-22T00:00:00Z',
        },
        {
          id: '4',
          firstName: 'Priya',
          lastName: 'Patel',
          profileImage: avatar,
          signature: '',
          gender: 'Female',
          unit: 'Central Club',
          email: 'priya.patel@example.com',
          phoneNumber: '456-789-0123',
          category: 'Adult Member',
          status: 'Active',
          joinDate: '2023-11-10T00:00:00Z',
        },
        {
          id: '5',
          firstName: 'Thomas',
          lastName: 'Lee',
          profileImage: avatar,
          signature: '',
          gender: 'Male',
          unit: 'Youth Council',
          youthCouncilType: 'Hi-Y',
          email: 'thomas.lee@example.com',
          phoneNumber: '567-890-1234',
          category: 'Youth Member',
          status: 'Active',
          joinDate: '2024-02-05T00:00:00Z',
        },
      ];

      setMembers(mockMembers);
      setFilteredMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = members;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(member => 
        member.firstName.toLowerCase().includes(term) || 
        member.lastName.toLowerCase().includes(term) || 
        member.email.toLowerCase().includes(term) ||
        member.phoneNumber.toLowerCase().includes(term)
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

    setFilteredMembers(result);
  }, [members, searchTerm, categoryFilter, statusFilter, unitFilter, genderFilter]);

  // Format date
// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
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

// Handle member status change
const handleStatusChange = (memberId: string, newStatus: 'Active' | 'Inactive') => {
  const updatedMembers = members.map(member => 
    member.id === memberId 
      ? { ...member, status: newStatus } 
      : member
  );
  
  setMembers(updatedMembers);
  // In a real app, you would make an API call here to update the member's status
  console.log(`Member ${memberId} status changed to ${newStatus}`);
};

// Handle member deletion
const handleDeleteMember = (memberId: string) => {
  const updatedMembers = members.filter(member => member.id !== memberId);
  
  setMembers(updatedMembers);
  // In a real app, you would make an API call here to delete the member
  console.log(`Member ${memberId} deleted`);
};

// Open member view modal
const openMemberView = (member: Member) => {
  setViewingMember(member);
};

// Close member view modal
const closeMemberView = () => {
  setViewingMember(null);
};

const handleAddMember = (newMember: Omit<Member, 'id'>) => {
  const memberWithId = {
    ...newMember,
    id: `${members.length + 1}`, // In a real app, this would be generated by the server
  };
  
  setMembers([...members, memberWithId]);
  // In a real app, you would make an API call to save the new member
  console.log('New member added:', memberWithId);
};

// Handle bulk upload
const handleBulkUpload = (newMembers: Omit<Member, 'id'>[]) => {
  const membersWithIds = newMembers.map((member, index) => ({
    ...member,
    id: `${members.length + index + 1}`, // In a real app, IDs would be generated by the server
  }));
  
  setMembers([...members, ...membersWithIds]);
  // In a real app, you would make an API call to save the new members
  console.log(`${membersWithIds.length} new members added`);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <option value="On Leave">On Leave</option>
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
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Unit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
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
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={member.profileImage || avatar} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-sm text-gray-500 md:hidden">{member.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{member.unit}</div>
                    {member.unit === 'Council of Church' && member.churchName && (
                      <div className="text-xs text-gray-500">{member.churchName}</div>
                    )}
                    {member.unit === 'Youth Council' && member.youthCouncilType && (
                      <div className="text-xs text-gray-500">{member.youthCouncilType}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900">{member.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        member.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {formatDate(member.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openMemberView(member)}
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

    {/* Member View Modal with Account Management */}
    {viewingMember && (
      <MemberViewModal 
        member={viewingMember} 
        closeModal={closeMemberView}
        onStatusChange={handleStatusChange}
        onDeleteMember={handleDeleteMember}
      />
    )}

    {/* Add User Modal */}
    <AddUserModal
        isOpen={showAddUserModal}
        closeModal={() => setShowAddUserModal(false)}
        onAddMember={handleAddMember}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        closeModal={() => setShowBulkUploadModal(false)}
        onUploadMembers={handleBulkUpload}
      />
  </div>
);
};

export default UserListingPage;