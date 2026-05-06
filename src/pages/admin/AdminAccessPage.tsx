import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { Member } from '../../types/types';

const AdminAccessPage: React.FC = () => {
  const { fetchWithAuth, displayNotification } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromotingId, setIsPromotingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/admin/members/',
        queryParams: { page_size: 1000, page: 1 },
      });

      setMembers(response?.results || []);
    } catch (error) {
      console.error('Error fetching members for admin access:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return members;

    return members.filter((member) => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim().toLowerCase();
      const email = (member.email || '').toLowerCase();
      const phone = (member.phone_number || '').toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch)
      );
    });
  }, [members, searchTerm]);

  const handlePromote = async (member: Member) => {
    const memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email;
    const confirmed = window.confirm(`Make ${memberName} an admin?`);
    if (!confirmed) return;

    setIsPromotingId(member.id);
    try {
      await fetchWithAuth({
        method: 'POST',
        path: '/admin/members/promote-admin/',
        body: { user_id: member.id },
      });

      displayNotification('success', `${memberName} can now access the admin dashboard`);
      setMembers((prev) => prev.filter((item) => item.id !== member.id));
    } catch (error) {
      console.error('Error promoting member to admin:', error);
    } finally {
      setIsPromotingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Admin</h1>
        <p className="text-gray-600 mt-1">
          Select an existing member and give them access to the admin dashboard.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <label htmlFor="admin-search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Members
        </label>
        <input
          id="admin-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or phone"
          className="w-full md:w-96 p-2 border border-gray-300 rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No eligible members found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term.' : 'All current members may already be admins.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-900">
                      {member.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-900">
                      {member.user_request?.unit || member.unit || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePromote(member)}
                        disabled={isPromotingId === member.id}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isPromotingId === member.id ? 'Promoting...' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessPage;
