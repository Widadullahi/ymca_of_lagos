import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import UpdateForm from '../../components/modals/admin/news/UpdateForm';
import { createPostsApi } from '../../api/postsApi';
import { useAuth } from '../../context/NewAuthContext';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Update {
  user: any;
  created_at: string | number | Date;
  id: string;
  title: string;
  content: string;
  type: 'Latest News' | 'Upcoming Event'; // Changed to use display names
  category: string;
  imageUrl?: string;
  images?: string[];
  postedAt: Date;
  attachments?: Attachment[];
}

const AdminUpdatesPage = () => {
  const { fetchWithAuth } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<Update | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for filtering (simplified)
  const categories = ['All', 'Ministries', 'Sermons', 'General'];
  
  // Only two types for filtering and display
  const types = [
    { value: 'All', label: 'All Types', icon: '📰', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-300' },
    { value: 'Latest News', label: 'Latest News', icon: '📰', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-300' },
    { value: 'Upcoming Event', label: 'Upcoming Events', icon: '📅', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' }
  ];

  // Initialize API with fetchWithAuth
  const postsApi = createPostsApi(fetchWithAuth);

  // Fetch updates from API
  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let path = `/posts/?page_size=20`;
      
      if (selectedCategory !== 'All') {
        path += `&category=${selectedCategory}`;
      }
      
      if (selectedType !== 'All') {
        path += `&type=${encodeURIComponent(selectedType)}`;
      }
      
      if (searchTerm) {
        path += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetchWithAuth({
        method: 'GET',
        path: path,
      });

      const data = response?.data || [];
      
      // Transform the data to include images array and convert type to display format
      const transformedData = data.map((item: any) => {
        // Convert type from kebab-case to display format if needed
        let type: 'Latest News' | 'Upcoming Event' = 'Latest News';
        if (item.type === 'upcoming-event' || item.type === 'Upcoming Event') {
          type = 'Upcoming Event';
        } else if (item.type === 'latest-news' || item.type === 'Latest News') {
          type = 'Latest News';
        }
        
        return {
          ...item,
          type,
          images: item.images || (item.image ? [item.image] : []),
          imageUrl: item.image,
          postedAt: new Date(item.created_at),
          // Removed postedBy field
        };
      });

      setUpdates(transformedData);
      setTotalCount(transformedData.length);
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch updates');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch updates on component mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  // Fetch updates when filters change
  useEffect(() => {
    fetchUpdates();
  }, [selectedCategory, selectedType]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUpdates();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Open form to add new update
  const handleAddUpdate = () => {
    setIsEditing(false);
    setUpdateToEdit(null);
    setIsFormOpen(true);
  };

  // Open form to edit update
  const handleEditUpdate = (update: Update) => {
    setUpdateToEdit(update);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Delete update
  const handleDeleteUpdate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        setError(null);
        await postsApi.deletePost(id);
        
        // Remove from local state immediately for better UX
        setUpdates(prev => prev.filter(update => update.id !== id));
        setTotalCount(prev => prev - 1);
      } catch (err) {
        console.error('Error deleting update:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete update');
        // Refresh on error to restore accurate state
        await fetchUpdates();
      }
    }
  };

  // Save update (new or edited)
  const handleSaveUpdate = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Ensure type is included in form data
      const dataToSend = {
        ...formData,
        type: formData.type || 'Latest News', // Default to Latest News if not specified
      };

      if (isEditing && updateToEdit) {
        // Update existing update
        const updatedPost = await postsApi.updatePost(updateToEdit.id, dataToSend);
        
        // Update local state
        setUpdates(prev => 
          prev.map(update => 
            update.id === updateToEdit.id ? {
              ...updatedPost,
              images: updatedPost.images || (updatedPost.image ? [updatedPost.image] : []),
              postedAt: new Date(updatedPost.created_at),
              // Removed postedBy field
            } : update
          )
        );
      } else {
        // Create new update
        const newPost = await postsApi.createPost(dataToSend);
        
        // Add to local state at the beginning
        setUpdates(prev => [{
          ...newPost,
          images: newPost.images || (newPost.image ? [newPost.image] : []),
          postedAt: new Date(newPost.created_at),
          // Removed postedBy field
        }, ...prev]);
        setTotalCount(prev => prev + 1);
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving update:', err);
      setError(err instanceof Error ? err.message : 'Failed to save update');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setIsSubmitting(false);
  };

  // Get type label and color
  const getTypeInfo = (type: string) => {
    const typeObj = types.find(t => t.value === type);
    return typeObj || types[0];
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Ministries': 'bg-yellow-100 text-yellow-800',
      'Sermons': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Updates</h1>
          <p className="text-gray-600 mt-2">Create and manage news articles and upcoming events</p>
        </div>
        <button
          onClick={handleAddUpdate}
          disabled={isSubmitting}
          className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Update
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">📰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Updates</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {updates.filter(u => u.type === 'Upcoming Event').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">📢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Latest News</p>
              <p className="text-2xl font-bold text-gray-900">
                {updates.filter(u => u.type === 'Latest News').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
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

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Updates</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or content..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Type filter - Only Latest News and Upcoming Event */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedType === type.value
                      ? `${type.color} ${type.borderColor} shadow-md`
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl mr-2">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {updates.length} of {totalCount} updates
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedType('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchUpdates}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Updates List with scrollbar on top */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading updates...</p>
          </div>
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">📰</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No updates found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'All' || selectedType !== 'All'
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first update.'
            }
          </p>
          <button
            onClick={handleAddUpdate}
            className="inline-flex items-center px-5 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Update
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top scrollbar for horizontal scrolling */}
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto px-6 py-3">
              <div className="min-w-full inline-block align-middle">
                <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="flex space-x-8 text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    <div className="w-80">Update</div>
                    <div className="w-48">Type & Category</div>
                    <div className="w-32">Images</div>
                    <div className="w-48">Posted Date</div>
                    <div className="w-48">Actions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {updates.map((update) => {
                  const typeInfo = getTypeInfo(update.type);
                  const images = update.images || (update.imageUrl ? [update.imageUrl] : []);
                  
                  return (
                    <tr key={update.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 w-80">
                        <div className="flex items-center">
                          {images.length > 0 ? (
                            <div className="flex-shrink-0 h-12 w-12 mr-4 relative">
                              <img 
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200" 
                                src={images[0]} 
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                }}
                              />
                              {images.length > 1 && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  +{images.length - 1}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 mr-4 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400">🖼️</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center">
                              <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                                {update.title}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 truncate max-w-xs mt-1">
                              {update.content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            <span className="mr-1">{typeInfo.icon}</span>
                            {typeInfo.label}
                          </span>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(update.category)}`}>
                            {update.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-32">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">
                            {images.length} {images.length === 1 ? 'image' : 'images'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="text-sm text-gray-900">
                          {formatDistance(new Date(update.created_at), new Date(), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditUpdate(update)}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUpdate(update.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination would go here */}
          {updates.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{updates.length}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updates.length < 20}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Form Modal */}
      {isFormOpen && (
        <UpdateForm
          isOpen={isFormOpen}
          isEditing={isEditing}
          update={updateToEdit}
          onSave={handleSaveUpdate}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AdminUpdatesPage;