import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { useAuth } from '../context/NewAuthContext';

interface Update {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  postedBy: string;
  postedAt: Date;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

const UpdatesPage: React.FC = () => {
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  const categories = ['All', 'Announcements', 'Events', 'Prayer Requests', 'Ministries', 'Sermons'];

  const mediaBaseUrl = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
  const getImageValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value.url || value.file || value.path || value.image || value.image_url || value.imageUrl || '';
    }
    return '';
  };
  const isImageFile = (url?: string | null): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].some(ext => lower.includes(ext));
  };
  const toAbsoluteUrl = (value?: any): string => {
    const url = getImageValue(value);
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `${window.location.protocol}${url}`;
    if (url.startsWith('/')) return `${mediaBaseUrl}${url}`;
    return `${mediaBaseUrl}/${url.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetchWithAuth({ method: 'GET', path: `/posts` });

        const normalized = (response?.data || [])
          .filter(Boolean)
          .map((item: any) => {
          const mainImage = toAbsoluteUrl(item.image || item.image_url || item.imageUrl || item?.image_base64);
          const otherImages = (item.images || item.image_list || item.imageUrls || []).map((img: any) => toAbsoluteUrl(img));
          const attachmentImages = (item.attachments || [])
            .map((att: any) => toAbsoluteUrl(att?.file || att?.url))
            .filter(isImageFile);
          const allImages = [mainImage, ...otherImages, ...attachmentImages].filter(Boolean);

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            category: item.category,
            imageUrl: allImages[0] || '',
            images: allImages,
            postedAt: new Date(item.created_at),
            postedBy: item.user?.first_name || item.user?.email || 'Anonymous',
            attachments: (item.attachments || []).map((att: any) => {
              const fileType = att.file.split('.').pop()?.toLowerCase();
              return {
                name: att.file.split('/').pop(),
                url: toAbsoluteUrl(att.file),
                type: fileType,
              };
            }),
          };
        });

        setUpdates(normalized);
      } catch (error) {
        console.error('Error fetching updates:', error);
        displayNotification('error', 'Failed to load updates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const filteredUpdates = updates.filter(update => {
    const matchesCategory = selectedCategory === 'All' || update.category === selectedCategory;
    const matchesSearch =
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'mp3': return '🎵';
      default: return '📎';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Updates</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 px-3 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading updates...</p>
      ) : filteredUpdates.length === 0 ? (
        <p>No updates found.</p>
      ) : (
        <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {filteredUpdates.map(update => (
            <div key={update.id} className="border rounded shadow-sm overflow-hidden">
              {update.imageUrl && (
                <img src={update.imageUrl} alt={update.title} className="w-full h-64 object-cover" />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{update.title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {update.category} · {formatDistance(update.postedAt, new Date(), { addSuffix: true })}
                </p>
                <p className="line-clamp-3">{update.content}</p>
                <button
                  className="mt-3 text-blue-600 hover:underline"
                  onClick={() => setSelectedUpdate(update)}
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read More Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-2xl w-full rounded-lg overflow-y-auto max-h-[90vh] relative p-6">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedUpdate(null)}
            >
              ✖
            </button>
            {selectedUpdate.imageUrl && (
              <img src={selectedUpdate.imageUrl} alt={selectedUpdate.title} className="w-full h-64 object-cover rounded mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">{selectedUpdate.title}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Posted by {selectedUpdate.postedBy} · {formatDistance(selectedUpdate.postedAt, new Date(), { addSuffix: true })}
            </p>
            <p className="whitespace-pre-line mb-4">{selectedUpdate.content}</p>

            {selectedUpdate?.attachments?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Attachments:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedUpdate?.attachments.map((att:any, i:any) => (
                    <li key={i}>
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {getAttachmentIcon(att.type)} {att.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatesPage;

