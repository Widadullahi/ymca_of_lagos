import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import { createStaffApi, StaffMember } from '../../api/staffApi';

type Category = 'principal_officer' | 'management_staff';

const StaffAdminPage: React.FC = () => {
  const { fetchWithAuth, displayNotification } = useAuth();
  const api = createStaffApi(fetchWithAuth);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{ name: string; position: string; category: Category; imageFile: File | null }>({
    name: '',
    position: '',
    category: 'principal_officer',
    imageFile: null,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listAll();
      setStaff(data || []);
    } catch (err: any) {
      console.error('Failed to load staff', err);
      setError(err?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, imageFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const created = await api.create({
        name: formData.name,
        position: formData.position,
        category: formData.category,
        imageFile: formData.imageFile || undefined,
      });
      displayNotification?.('success', 'Staff member added');
      setFormData({ name: '', position: '', category: 'principal_officer', imageFile: null });
      setStaff(prev => [created, ...prev]);
    } catch (err: any) {
      console.error('Failed to add staff', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to add staff');
      displayNotification?.('error', 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.remove(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      displayNotification?.('success', 'Staff member deleted');
    } catch (err: any) {
      console.error('Failed to delete staff', err);
      displayNotification?.('error', 'Failed to delete staff');
    }
  };

  const principal = staff.filter(s => s.category === 'principal_officer');
  const management = staff.filter(s => s.category === 'management_staff');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Management</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="text" name="position" value={formData.position} onChange={handleInputChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded px-3 py-2">
                <option value="principal_officer">Principal Officer</option>
                <option value="management_staff">Management Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 mt-3">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Principal Officers</h3>
            <div className="space-y-3">
              {principal.length === 0 ? (
                <p className="text-gray-500">No principal officers yet.</p>
              ) : (
                principal.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-white border rounded p-3">
                    <div className="flex items-center gap-3">
                      <img src={member.image || ''} alt={member.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.position}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Management Staff</h3>
            <div className="space-y-3">
              {management.length === 0 ? (
                <p className="text-gray-500">No management staff yet.</p>
              ) : (
                management.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-white border rounded p-3">
                    <div className="flex items-center gap-3">
                      <img src={member.image || ''} alt={member.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.position}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      </div>
    </div>
  );
};

export default StaffAdminPage;