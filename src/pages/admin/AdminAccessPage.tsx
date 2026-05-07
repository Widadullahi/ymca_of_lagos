import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { Member } from '../../types/types';

const AdminAccessPage: React.FC = () => {
  const { fetchWithAuth, displayNotification } = useAuth();
  const [admins, setAdmins] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function fetchAdmins() {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/admin/members/promote-admin/',
      });
      setAdmins(response?.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    });
    setErrors({});
  };

  const handleExportAdmins = async () => {
    try {
      displayNotification('info', 'Preparing admin export...');
      // Use the dedicated admin export endpoint
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/admins/export/`,
        isAthenticated: true,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'admins_list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      displayNotification('success', 'Admin export downloaded successfully');
    } catch (error: any) {
      console.error('Error exporting admins:', error);
      displayNotification('error', error?.message || 'Failed to export admins');
    }
  };

  const handleBulkUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.csv';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setIsSubmitting(true);
        displayNotification('info', 'Uploading admin bulk file...');
        
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetchWithAuth({
          method: 'POST',
          path: '/admin/members/upload',
          body: formData,
          isFormData: true,
        });

        displayNotification('success', response?.message || 'Admins uploaded successfully');
        fetchAdmins();
      } catch (error: any) {
        console.error('Error uploading admins:', error);
        displayNotification('error', error?.message || 'Failed to upload admins');
      } finally {
        setIsSubmitting(false);
      }
    };
    fileInput.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth({
        method: 'POST',
        path: '/admin/members/promote-admin/',
        body: formData,
      });

      displayNotification(
        'success',
        response?.message || 'Admin created successfully. Default password is admin12345'
      );
      setShowAddModal(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      displayNotification('error', error?.message || 'Unable to create admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Add Admin</h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill the new admin’s basic information below. Default password: <span className="font-semibold">admin12345</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} />
              </div>
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
              <InputField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Admin</h1>
          <p className="text-gray-600 mt-1">
            Create a separate admin account directly. Admins are no longer created from the members list.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAdmins}
            className="rounded-md bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Admins
          </button>
          <button
            onClick={handleBulkUpload}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700"
          >
            Add Admin
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Current Admins</p>
          <p className="mt-1 text-3xl font-semibold text-indigo-700">{admins.length}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Default Password</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">admin12345</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Admin Accounts</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No admin accounts found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {admins.map((admin) => (
              <div key={admin.id} className="rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {admin.first_name} {admin.last_name}
                  </h3>
                  <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    Admin
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{admin.email}</p>
                <p className="mt-1 text-sm text-gray-500">{admin.phone_number || admin.user_request?.phone_number || 'No phone number'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default AdminAccessPage;
