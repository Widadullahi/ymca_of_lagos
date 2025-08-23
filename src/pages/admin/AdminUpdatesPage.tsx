// import React, { useState, useEffect } from 'react';
// import { formatDistance } from 'date-fns';
// import UpdateForm from '../../components/modals/admin/news/UpdateForm';
// import avatar from '../../assets/images/thumbnail-im.jpg'
// interface Attachment {
//   name: string;
//   url: string;
//   type: string;
// }

// export interface Update {
//   id: string;
//   title: string;
//   content: string;
//   category: string;
//   imageUrl?: string;
//   postedBy: string;
//   postedAt: Date;
//   attachments?: Attachment[];
// }

// const AdminUpdatesPage: React.FC = () => {
//   const [updates, setUpdates] = useState<Update[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Form state
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [updateToEdit, setUpdateToEdit] = useState<Update | null>(null);

//   // Categories for filtering
//   const categories = ['All', 'Announcements', 'Events', 'Prayer Requests', 'Ministries', 'Sermons'];

//   // Fetch updates (mock data)
//   useEffect(() => {
//     const fetchUpdates = async () => {
//       // Simulate API call
//       setTimeout(() => {
//         setUpdates([
//           {
//             id: '1',
//             title: 'Sunday Service Time Change',
//             content: 'Starting next week, our Sunday service will begin at 10:00 AM instead of 9:30 AM. Please make note of this change and plan accordingly.',
//             category: 'Announcements',
//             postedBy: 'Pastor Johnson',
//             postedAt: new Date('2025-03-10T12:00:00'),
//             imageUrl: avatar,
//           },
//           {
//             id: '2',
//             title: 'Youth Group Retreat',
//             content: 'Our annual youth retreat is scheduled for April 18-20. Registration is now open! Please register by March 25th to secure your spot.',
//             category: 'Events',
//             postedBy: 'Youth Ministry Team',
//             postedAt: new Date('2025-03-08T09:15:00'),
//             attachments: [
//               {
//                 name: 'Retreat Schedule',
//                 url: '#',
//                 type: 'pdf'
//               },
//               {
//                 name: 'Permission Form',
//                 url: '#',
//                 type: 'docx'
//               }
//             ]
//           },
//           {
//             id: '3',
//             title: 'Prayer Request for the Smith Family',
//             content: 'Please keep the Smith family in your prayers as they navigate a difficult health situation with their daughter Sarah.',
//             category: 'Prayer Requests',
//             postedBy: 'Prayer Team',
//             postedAt: new Date('2025-03-07T16:30:00'),
//           },
//           {
//             id: '4',
//             title: 'Women\'s Bible Study Series',
//             content: 'Join us for our new women\'s Bible study series "Walking in Faith" every Wednesday at 7:00 PM starting March 19th.',
//             category: 'Ministries',
//             postedBy: 'Women\'s Ministry',
//             postedAt: new Date('2025-03-06T14:45:00'),
//             imageUrl: avatar,
//           },
//           {
//             id: '5',
//             title: 'Last Week\'s Sermon: "Grace in Action"',
//             content: 'Pastor Johnson\'s sermon on "Grace in Action" is now available for streaming and download. Explore how we can demonstrate God\'s grace in our daily lives.',
//             category: 'Sermons',
//             postedBy: 'Media Team',
//             postedAt: new Date('2025-03-04T08:30:00'),
//             attachments: [
//               {
//                 name: 'Audio Recording',
//                 url: '#',
//                 type: 'mp3'
//               },
//               {
//                 name: 'Sermon Notes',
//                 url: '#',
//                 type: 'pdf'
//               }
//             ]
//           }
//         ]);
//         setIsLoading(false);
//       }, 1000);
//     };

//     fetchUpdates();
//   }, []);

//   // Filter updates based on category and search term
//   const filteredUpdates = updates.filter(update => {
//     const matchesCategory = selectedCategory === 'All' || update.category === selectedCategory;
//     const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          update.content.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });


//   // Open form to add new update
//   const handleAddUpdate = () => {
//     setIsEditing(false);
//     setUpdateToEdit(null);
//     setIsFormOpen(true);
//   };

//   // Open form to edit update
//   const handleEditUpdate = (update: Update) => {
//     setUpdateToEdit(update);
//     setIsEditing(true);
//     setIsFormOpen(true);
//   };

//   // Delete update
//   const handleDeleteUpdate = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this update?')) {
//       setUpdates(updates.filter(update => update.id !== id));
//     }
//   };

//   // Save update (new or edited)
//   const handleSaveUpdate = (update: Update) => {
//     if (isEditing) {
//       // Update existing update
//       setUpdates(updates.map(u => u.id === update.id ? update : u));
//     } else {
//       // Add new update with generated ID
//       const newUpdate = {
//         ...update,
//         id: Date.now().toString(),
//         postedAt: new Date()
//       };
//       setUpdates([newUpdate, ...updates]);
//     }
//     setIsFormOpen(false);
//   };

//   // Get category color classes
//   const getCategoryClasses = (category: string) => {
//     switch (category) {
//       case 'Announcements': return 'bg-blue-100 text-blue-800';
//       case 'Events': return 'bg-green-100 text-green-800';
//       case 'Prayer Requests': return 'bg-yellow-100 text-yellow-800';
//       case 'Ministries': return 'bg-purple-100 text-purple-800';
//       case 'Sermons': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Manage Updates</h1>
//         <button
//           onClick={handleAddUpdate}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//           </svg>
//           Add New Update
//         </button>
//       </div>

//       {/* Search and filters */}
//       <div className="mb-8 flex sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//         {/* Search box */}
//         <div className="relative flex-grow">
//           <input
//             type="text"
//             placeholder="Search updates..."
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Category filter */}
//         <div className="flex-shrink-0">
//           <select
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             {categories.map(category => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Updates List */}
//       {isLoading ? (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : filteredUpdates.length === 0 ? (
//         <div className="text-center py-12">
//           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <h3 className="mt-2 text-lg font-medium text-gray-900">No updates found</h3>
//           <p className="mt-1 text-sm text-gray-500">Try changing your search or filter criteria.</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted By</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUpdates.map((update) => (
//                 <tr key={update.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     <div className="flex items-center">
//                       {update.imageUrl && (
//                         <div className="flex-shrink-0 h-10 w-10 mr-3">
//                           <img className="h-10 w-10 rounded-md object-cover" src={update.imageUrl} alt="" />
//                         </div>
//                       )}
//                       <div className="truncate max-w-xs">{update.title}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryClasses(update.category)}`}>
//                       {update.category}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{update.postedBy}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {formatDistance(update.postedAt, new Date(), { addSuffix: true })}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">

//                     <button 
//                       onClick={() => handleEditUpdate(update)}
//                       className="text-blue-600 hover:text-blue-900 font-medium"
//                     >
//                       Edit
//                     </button>
//                     <button 
//                       onClick={() => handleDeleteUpdate(update.id)}
//                       className="text-red-600 hover:text-red-900 font-medium"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}


//       {/* Update Form */}
//       {isFormOpen && (
//         <UpdateForm
//           isOpen={isFormOpen}
//           isEditing={isEditing}
//           update={updateToEdit}
//           categories={categories.filter(c => c !== 'All')}
//           onSave={handleSaveUpdate}
//           onCancel={() => setIsFormOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminUpdatesPage;


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

// Define the form data interface that UpdateForm will use
interface UpdateFormData {
  title: string;
  content: string;
  category: string;
  image?: File;
  attachments?: File[];
  removeImage?: boolean;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
}

// Props interface to receive fetchWithAuth from parent component
const AdminUpdatesPage = () => {

  const { fetchWithAuth} = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<Update | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for filtering
  const categories = ['All', 'Announcements', 'Events', 'Prayer Requests', 'Ministries', 'Sermons'];

  // Initialize API with fetchWithAuth
  const postsApi = createPostsApi(fetchWithAuth);

  // Fetch updates from API
  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuth({
        method: 'GET',
        path: `/posts/?page_size=10`,
      });

      setUpdates(response?.data);
      setTotalCount(0);
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
  }, [selectedCategory]); // Removed searchTerm from dependencies to handle it separately

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
        
        // Optional: Refresh from server to ensure sync
        // await fetchUpdates();
      } catch (err) {
        console.error('Error deleting update:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete update');
        // Refresh on error to restore accurate state
        await fetchUpdates();
      }
    }
  };

  // Save update (new or edited)
  const handleSaveUpdate = async (formData: UpdateFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEditing && updateToEdit) {
        // Update existing update
        const updatedPost = await postsApi.updatePost(updateToEdit.id, formData);
        
        // Update local state
        setUpdates(prev => 
          prev.map(update => 
            update.id === updateToEdit.id ? updatedPost : update
          )
        );
      } else {
        // Create new update
        const newPost = await postsApi.createPost(formData);
        
        // Add to local state at the beginning
        setUpdates(prev => [newPost, ...prev]);
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

  // Get category color classes
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'Announcements': return 'bg-blue-100 text-blue-800';
      case 'Events': return 'bg-green-100 text-green-800';
      case 'Prayer Requests': return 'bg-yellow-100 text-yellow-800';
      case 'Ministries': return 'bg-purple-100 text-purple-800';
      case 'Sermons': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Updates
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalCount} total)
            </span>
          )}
        </h1>
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
            placeholder="Search updates..."
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
        <div className="flex-shrink-0">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      ) : updates.length === 0 ? (
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachments</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {updates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {update.imageUrl && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={update.imageUrl} 
                            alt=""
                            onError={(e) => {
                              // Hide image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="truncate max-w-xs" title={update.title}>
                        {update.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryClasses(update.category)}`}>
                      {update.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{update.postedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistance(update.postedAt, new Date(), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {update.attachments && update.attachments.length > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {update.attachments.length} file{update.attachments.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUpdate(update)}
                        disabled={isSubmitting}
                        className="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUpdate(update.id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Form Modal */}
      {isFormOpen && (
        <UpdateForm
          isOpen={isFormOpen}
          isEditing={isEditing}
          // isSubmitting={isSubmitting}
          update={updateToEdit}
          categories={categories.filter(c => c !== 'All')}
          onSave={handleSaveUpdate}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AdminUpdatesPage;