import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import UpdateForm from '../../components/modals/admin/news/UpdateForm';
import ConfirmationModal from '../../components/modals/admin/ConfirmationModal';
import { createPostsApi } from '../../api/postsApi';
import { useAuth } from '../../context/NewAuthContext';

// Define types that match UpdateForm's expectations
interface Attachment {
  name: string;
  url: string;
  type: string;
  // Add these fields to match UpdateForm
  file?: File;
  base64?: string;
}

// Make sure this matches UpdateForm's Update interface
export interface Update {
  id: string;
  title: string;
  content: string;
  category: string;
  actionButtonLabel?: string;
  actionButtonUrl?: string;
  imageUrl?: string;
  created_at: string | number | Date;
  postedAt: Date;
  attachments?: Attachment[];
  // Remove optional from type - make it required
  type: 'latest-news' | 'upcoming-event';
  // Add the missing images property
  images?: string[];
}



const AdminUpdatesPage = () => {
  const { fetchWithAuth, BACKEND_URL, displayNotification } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUpdateIds, setSelectedUpdateIds] = useState<string[]>([]);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<Update | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState<Update | null>(null);

  // Initialize API with fetchWithAuth
  const postsApi = createPostsApi(fetchWithAuth, BACKEND_URL);

  // Fetch updates from API
  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { posts, count } = await postsApi.getPosts({ page_size: 100 });
      setUpdates(posts);
      setTotalCount(count);
      setSelectedUpdateIds([]);
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch updates');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch updates on component mount and when search/filter changes
  useEffect(() => {
    fetchUpdates();
  }, []);

  // Open form to add new update
  const handleAddUpdate = () => {
    setIsSubmitting(false);
    setError(null);
    setIsEditing(false);
    setUpdateToEdit(null);
    setIsFormOpen(true);
  };

  // Save update (new or edited)
  const handleSaveUpdate = async (formData: any) => {
    let success = false;
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Form data received in parent:', formData);

      // Prepare data for API using FormData for file uploads
      const apiData = new FormData();
      apiData.append('title', formData.title);
      apiData.append('content', formData.content);
      apiData.append('post_type', formData.type);
      apiData.append('action_button_label', formData.actionButtonLabel || '');
      apiData.append('action_button_url', formData.actionButtonUrl || '');
      apiData.append('category', formData.type === 'upcoming-event' ? 'Events' : 'Announcements');

      // Handle main image
      if (formData.primaryImageFile) {
        apiData.append('image', formData.primaryImageFile);
      } else if (!formData.primaryImageFile && !formData.primaryImageUrl && isEditing) {
        apiData.append('remove_image', 'true');
      }

      // Handle gallery images and video files as attachments
      if (formData.otherImageFiles && Array.isArray(formData.otherImageFiles)) {
        formData.otherImageFiles.forEach((file: File) => {
          apiData.append('attachments', file);
        });
      }

      if (formData.videoFiles && Array.isArray(formData.videoFiles)) {
        formData.videoFiles.forEach((file: File) => {
          apiData.append('attachments', file);
        });
        console.log('Video attachments prepared:', formData.videoFiles.length, 'videos');
      }

      console.log('Form data received:', formData);
      console.log('PrimaryImage:', formData.primaryImageFile);
      console.log('OtherImages:', formData.otherImageFiles);
      
      // Log all FormData entries
      console.log('Sending to API (FormData entries):');
      for (const [key, value] of apiData.entries()) {
        const valueStr = typeof value === 'object' && value !== null && 'name' in value ? value.name : String(value);
        console.log('  ' + key + ': ' + valueStr + ' (type: ' + typeof value + ')');
      }

      if (isEditing && updateToEdit) {
        // Update existing update
        await postsApi.updatePost(updateToEdit.id, apiData);
        
        // Refresh the full list to ensure we get the complete image URLs from the server
        await fetchUpdates();
        displayNotification('success', 'Update updated successfully!');
        success = true;
      } else {
        // Create new update
        await postsApi.createPost(apiData);
        
        // Refresh the full list to ensure we get the complete image URLs from the server
        await fetchUpdates();
        displayNotification('success', 'Update created successfully!');
        success = true;
      }
      
    } catch (err: any) {
      console.error('Error saving update:', err);
      // Show detailed error if available
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to save update. Please check the console for details.';
      setError(errorMessage);
      
      // Keep form open so user can fix errors
    } finally {
      setIsSubmitting(false);
      if (success) {
        setIsFormOpen(false);
        setIsEditing(false);
        setUpdateToEdit(null);
      }
    }
  };

  // Delete update
  const confirmDeleteUpdate = (update: Update) => {
    setUpdateToDelete(update);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUpdate = async () => {
    if (!updateToDelete) return;

    try {
      setError(null);
      await postsApi.deletePost(updateToDelete.id);
      setUpdates(prev => prev.filter(update => update.id !== updateToDelete.id));
      setTotalCount(prev => prev - 1);
      displayNotification('success', 'Update deleted successfully!');
    } catch (err) {
      console.error('Error deleting update:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete update');
      await fetchUpdates();
    } finally {
      setIsDeleteModalOpen(false);
      setUpdateToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUpdateToDelete(null);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUpdateIds(filteredUpdates.map(u => u.id));
    } else {
      setSelectedUpdateIds([]);
    }
  };

  const toggleSelectUpdate = (id: string) => {
    setSelectedUpdateIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedUpdateIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsSubmitting(true);
      await Promise.all(selectedUpdateIds.map(id => postsApi.deletePost(id)));
      setUpdates(prev => prev.filter(u => !selectedUpdateIds.includes(u.id)));
      setTotalCount(prev => Math.max(0, prev - selectedUpdateIds.length));
      setSelectedUpdateIds([]);
      displayNotification('success', 'Updates deleted successfully!');
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete updates');
      await fetchUpdates();
    } finally {
      setIsSubmitting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setIsSubmitting(false);
    setError(null);
  };

  // Edit update
  const handleEditUpdate = (update: Update) => {
    setIsEditing(true);
    setUpdateToEdit(update);
    setIsFormOpen(true);
  };

  // Categories for filtering - simplified
  const categories = ['All', 'latest-news', 'upcoming-event'];

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredUpdates = updates.filter((update) => {
    if (selectedCategory !== 'All' && update.type !== selectedCategory) {
      return false;
    }
    if (!normalizedSearchTerm) return true;
    return (
      update.title?.toLowerCase().includes(normalizedSearchTerm) ||
      update.content?.toLowerCase().includes(normalizedSearchTerm)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manage Updates
        </h1>
        <p className="text-gray-600">Create, edit, and manage your latest news and upcoming events</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* All Posts Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{totalCount}</p>
              <p className="text-gray-500 text-xs mt-2">All news and events combined</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg ml-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Latest News Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Latest News</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{updates.filter(u => u.type === 'latest-news').length}</p>
              <p className="text-gray-500 text-xs mt-2">Active news articles</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg ml-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m2 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{updates.filter(u => u.type === 'upcoming-event').length}</p>
              <p className="text-gray-500 text-xs mt-2">Scheduled events</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg ml-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          All Updates
        </h2>
        <div className="flex items-center gap-3">
          {selectedUpdateIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Selected ({selectedUpdateIds.length})
            </button>
          )}
          <button
            onClick={handleAddUpdate}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Update
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search box */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search updates by title or content..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Types' : 
                 category === 'latest-news' ? 'Latest News' : 
                 'Upcoming Events'}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <div className="flex-shrink-0">
          <button
            onClick={fetchUpdates}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="ml-1 hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Updates List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No updates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try changing your search or filter criteria.' 
              : 'Get started by creating your first update.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={filteredUpdates.length > 0 && selectedUpdateIds.length === filteredUpdates.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Select all updates"
                    className="rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Type</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Title</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Posted</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUpdates.map((update, index) => (
                <tr key={update.id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUpdateIds.includes(update.id)}
                      onChange={() => toggleSelectUpdate(update.id)}
                      aria-label={`Select update ${update.title}`}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      update.type === 'upcoming-event' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {update.type === 'upcoming-event' ? '📅 Event' : '📰 News'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {update.imageUrl && (
                        <div className="flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded border border-gray-200 object-cover" 
                            src={update.imageUrl} 
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="truncate" title={update.title}>
                        <p className="text-sm font-medium text-gray-900">{update.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDistance(update.postedAt, new Date(), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                    <button 
                      onClick={() => handleEditUpdate(update)}
                      disabled={isSubmitting}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => confirmDeleteUpdate(update)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete update"
        message={`Delete "${updateToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDeleteUpdate}
        onCancel={closeDeleteModal}
      />
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        title="Delete selected updates"
        message={`Delete ${selectedUpdateIds.length} update(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      {/* Update Form Modal */}
      {isFormOpen && (
        <UpdateForm
          isOpen={isFormOpen}
          isEditing={isEditing}
          update={updateToEdit}
          onSave={handleSaveUpdate}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default AdminUpdatesPage;
