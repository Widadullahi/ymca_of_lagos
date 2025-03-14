// components/UpdatesPage.tsx
import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import thumbnail from '../assets/images/thumbnail-im.jpg'

interface Update {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  postedBy: string;
  postedAt: Date;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

const UpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for filtering
  const categories = ['All', 'Announcements', 'Events', 'Prayer Requests', 'Ministries', 'Sermons'];

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchUpdates = async () => {
      // Simulate API call
      setTimeout(() => {
        setUpdates([
          {
            id: '1',
            title: 'Sunday Service Time Change',
            content: 'Starting next week, our Sunday service will begin at 10:00 AM instead of 9:30 AM. Please make note of this change and plan accordingly.',
            category: 'Announcements',
            postedBy: 'Pastor Johnson',
            postedAt: new Date('2025-03-10T12:00:00'),
            imageUrl: thumbnail,
          },
          {
            id: '2',
            title: 'Youth Group Retreat',
            content: 'Our annual youth retreat is scheduled for April 18-20. Registration is now open! Please register by March 25th to secure your spot.',
            category: 'Events',
            postedBy: 'Youth Ministry Team',
            postedAt: new Date('2025-03-08T09:15:00'),
            attachments: [
              {
                name: 'Retreat Schedule',
                url: '#',
                type: 'pdf'
              },
              {
                name: 'Permission Form',
                url: '#',
                type: 'docx'
              }
            ]
          },
          {
            id: '3',
            title: 'Prayer Request for the Smith Family',
            content: 'Please keep the Smith family in your prayers as they navigate a difficult health situation with their daughter Sarah.',
            category: 'Prayer Requests',
            postedBy: 'Prayer Team',
            postedAt: new Date('2025-03-07T16:30:00'),
          },
          {
            id: '4',
            title: 'Women\'s Bible Study Series',
            content: 'Join us for our new women\'s Bible study series "Walking in Faith" every Wednesday at 7:00 PM starting March 19th.',
            category: 'Ministries',
            postedBy: 'Women\'s Ministry',
            postedAt: new Date('2025-03-06T14:45:00'),
            imageUrl: thumbnail,
          },
          {
            id: '5',
            title: 'Last Week\'s Sermon: "Grace in Action"',
            content: 'Pastor Johnson\'s sermon on "Grace in Action" is now available for streaming and download. Explore how we can demonstrate God\'s grace in our daily lives.',
            category: 'Sermons',
            postedBy: 'Media Team',
            postedAt: new Date('2025-03-04T08:30:00'),
            attachments: [
              {
                name: 'Audio Recording',
                url: '#',
                type: 'mp3'
              },
              {
                name: 'Sermon Notes',
                url: '#',
                type: 'pdf'
              }
            ]
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchUpdates();
  }, []);

  // Filter updates based on category and search term
  const filteredUpdates = updates.filter(update => {
    const matchesCategory = selectedCategory === 'All' || update.category === selectedCategory;
    const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Function to render attachment icon based on file type
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'mp3':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v1.5a.5.5 0 01-1 0V7a4 4 0 00-8 0v4a4 4 0 008 0v-1.5a.5.5 0 011 0V11a5 5 0 01-5 5z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Updates</h1>

      {/* Search and filters */}
      <div className="mb-8 flex  sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
          <p className="mt-1 text-sm text-gray-500">Try changing your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredUpdates.map((update) => (
            <div key={update.id} className="bg-white overflow-hidden shadow rounded-lg">
              {update.imageUrl && (
                <div className="w-full">
                  <img src={update.imageUrl} alt={update.title} className="w-full h-64 object-cover" />
                </div>
              )}
              <div className="px-4 py-5 sm:p-6">
                {/* Category tag */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
                    ${update.category === 'Announcements' ? 'bg-blue-100 text-blue-800' : ''}
                    ${update.category === 'Events' ? 'bg-green-100 text-green-800' : ''}
                    ${update.category === 'Prayer Requests' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${update.category === 'Ministries' ? 'bg-purple-100 text-purple-800' : ''}
                    ${update.category === 'Sermons' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {update.category}
                  </span>
                </div>
                
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">{update.title}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Posted by {update.postedBy} · {formatDistance(update.postedAt, new Date(), { addSuffix: true })}
                </p>
                <p className="text-gray-700 mb-5 whitespace-pre-line">{update.content}</p>
                
                {/* Attachments */}
                {update.attachments && update.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {update.attachments.map((attachment, index) => (
                        <a 
                          key={index}
                          href={attachment.url}
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                        >
                          {getAttachmentIcon(attachment.type)}
                          <span className="ml-2 text-sm font-medium text-gray-700">{attachment.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdatesPage;