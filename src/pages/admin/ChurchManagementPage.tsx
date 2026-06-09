import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';
import ConfirmationModal from '../../components/modals/admin/ConfirmationModal';

type Church = {
  id: string;
  name: string;
};

const ChurchManagementPage: React.FC = () => {
  const { fetchWithAuth, displayNotification } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newChurchName, setNewChurchName] = useState('');
  const [editingChurchId, setEditingChurchId] = useState<string | null>(null);
  const [editingChurchName, setEditingChurchName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [churchToDelete, setChurchToDelete] = useState<Church | null>(null);

  const fetchChurches = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/admin/churches/',
      });
      setChurches(response?.data || []);
    } catch (error) {
      displayNotification('error', 'Unable to load churches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  const handleAddChurch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = newChurchName.trim();
    if (!trimmedName) {
      displayNotification('error', 'Church name is required');
      return;
    }

    try {
      setSubmitting(true);
      await fetchWithAuth({
        method: 'POST',
        path: '/admin/churches/',
        body: { name: trimmedName },
      });
      setNewChurchName('');
      displayNotification('success', 'Church added successfully');
      fetchChurches();
    } catch (error: any) {
      displayNotification('error', error?.message || 'Failed to add church');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (churchId: string) => {
    const trimmedName = editingChurchName.trim();
    if (!trimmedName) {
      displayNotification('error', 'Church name is required');
      return;
    }

    try {
      setSubmitting(true);
      await fetchWithAuth({
        method: 'PATCH',
        path: `/admin/churches/${churchId}/`,
        body: { name: trimmedName },
      });
      setEditingChurchId(null);
      setEditingChurchName('');
      displayNotification('success', 'Church updated successfully');
      fetchChurches();
    } catch (error: any) {
      displayNotification('error', error?.message || 'Failed to update church');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChurch = async () => {
    if (!churchToDelete) return;

    try {
      setSubmitting(true);
      await fetchWithAuth({
        method: 'DELETE',
        path: `/admin/churches/${churchToDelete.id}/`,
      });
      displayNotification('success', 'Church deleted successfully');
      fetchChurches();
    } catch (error: any) {
      displayNotification('error', error?.message || 'Failed to delete church');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
      setChurchToDelete(null);
    }
  };

  const confirmDeleteChurch = (church: Church) => {
    setChurchToDelete(church);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setChurchToDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Churches</h1>
        <p className="mt-1 text-gray-600">Manage the Council of Church dropdown list.</p>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Add Church</h2>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleAddChurch}>
          <input
            type="text"
            value={newChurchName}
            onChange={(e) => setNewChurchName(e.target.value)}
            placeholder="Enter church name"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Add Church
          </button>
        </form>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Church List</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading churches...</div>
        ) : churches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No churches added yet.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {churches.map((church) => (
              <div key={church.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  {editingChurchId === church.id ? (
                    <input
                      type="text"
                      value={editingChurchName}
                      onChange={(e) => setEditingChurchName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-4 py-2"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{church.name}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  {editingChurchId === church.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(church.id)}
                        disabled={submitting}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChurchId(null);
                          setEditingChurchName('');
                        }}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChurchId(church.id);
                          setEditingChurchName(church.name);
                        }}
                        className="rounded-md border border-indigo-300 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteChurch(church)}
                        disabled={submitting}
                        className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete church"
        message={`Delete ${churchToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDeleteChurch}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default ChurchManagementPage;
