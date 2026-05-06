import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { Member } from '../../types/types';

type RoleFilter = 'all' | 'admins' | 'members';

const isAdminUser = (user: Member) => Boolean(user.is_admin || user.role === 'Admin');

const AdminAccessPage: React.FC = () => {
  const { fetchWithAuth, displayNotification } = useAuth();
  const [users, setUsers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/admin/members/promote-admin/',
      });

      setUsers(response?.data || []);
    } catch (error) {
      console.error('Error fetching users for admin access:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone_number || '').toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch);

      const isAdmin = isAdminUser(user);
      const matchesRoleFilter =
        roleFilter === 'all' ||
        (roleFilter === 'admins' && isAdmin) ||
        (roleFilter === 'members' && !isAdmin);

      return matchesSearch && matchesRoleFilter;
    });
  }, [users, searchTerm, roleFilter]);

  const handleToggleAdmin = async (user: Member) => {
    const makeAdmin = !user.is_admin;
    const memberName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    setIsSubmittingId(user.id);
    try {
      await fetchWithAuth({
        method: 'POST',
        path: '/admin/members/promote-admin/',
        body: {
          user_id: user.id,
          make_admin: makeAdmin,
        },
      });

      displayNotification(
        'success',
        makeAdmin
          ? `${memberName} can now access the admin dashboard`
          : `${memberName} has been suspended from admin access`
      );

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_admin: makeAdmin,
                role: makeAdmin ? 'Admin' : 'Member',
              }
            : item
        )
      );
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating admin access:', error);
    } finally {
      setIsSubmittingId(null);
    }
  };

  const adminCount = users.filter((user) => isAdminUser(user)).length;
  const memberCount = users.filter((user) => !isAdminUser(user)).length;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {isAdminUser(selectedUser) ? 'Suspend Admin Access' : 'Confirm Admin Access'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {isAdminUser(selectedUser) ? 'Remove' : 'Give'} admin dashboard access for{' '}
                <span className="font-semibold text-gray-900">
                  {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email}
                </span>
                ?
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {isAdminUser(selectedUser)
                  ? 'This user will remain in the system but will no longer have admin access until restored.'
                  : 'This user will be able to log in and use the admin dashboard.'}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={isSubmittingId === selectedUser.id}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleAdmin(selectedUser)}
                disabled={isSubmittingId === selectedUser.id}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  isAdminUser(selectedUser) ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmittingId === selectedUser.id
                  ? 'Saving...'
                  : isAdminUser(selectedUser)
                    ? 'Suspend Admin'
                    : 'Make Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Access</h1>
        <p className="text-gray-600 mt-1">
          Promote members to admins, suspend admin access, and filter the full access list.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Admins</p>
          <p className="text-2xl font-semibold text-indigo-700 mt-1">{adminCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Members</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{memberCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="admin-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              id="admin-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter List
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Users</option>
              <option value="admins">Admins Only</option>
              <option value="members">Members Only</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting the search or role filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-900">
                      {user.phone_number || user.user_request?.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-900">
                      {user.user_request?.unit || user.unit || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          isAdminUser(user) ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isAdminUser(user) ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        disabled={isSubmittingId === user.id}
                        className={`rounded-md px-4 py-2 text-white disabled:opacity-50 ${
                          isAdminUser(user) ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isSubmittingId === user.id
                          ? 'Saving...'
                          : isAdminUser(user)
                            ? 'Suspend Admin'
                            : 'Make Admin'}
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
