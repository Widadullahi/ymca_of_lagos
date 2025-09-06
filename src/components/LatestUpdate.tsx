import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import { useAuth } from '../context/NewAuthContext.js';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[]; // Reserved for future use
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
}

export default function LatestUpdate() {
  const { fetchWithAuth, displayNotification } = useAuth();

  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = ['All', ...Array.from(new Set(updates.map(u => u.category)))];

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetchWithAuth({ method: 'GET', path: `/posts` });

        const normalized = (response?.data || []).map((item: any) => {
          const mainImage = item.image;
          const otherImages = item.images || []; // If your API has other images

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            category: item.category,
            imageUrl: mainImage,
            images: otherImages.length > 0 ? [mainImage, ...otherImages] : [mainImage], // ✅ FIXED
            postedAt: new Date(item.created_at),
            postedBy: item.user?.first_name || item.user?.email || 'Anonymous',
            attachments: (item.attachments || []).map((att: any) => {
              const fileType = att.file.split('.').pop()?.toLowerCase();
              return {
                name: att.file.split('/').pop(),
                url: att.file,
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

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="text-red-500">📄</span>;
      case 'docx':
        return <span className="text-blue-500">📄</span>;
      case 'mp3':
        return <span className="text-purple-500">🎵</span>;
      default:
        return <span className="text-gray-500">📎</span>;
    }
  };

  const getUpdateImages = (update: Update): string[] => {
    if (update.images && update.images.length > 0) return update.images;
    if (update.imageUrl) return [update.imageUrl];
    return [];
  };

  const openModal = (update: Update) => {
    setSelectedUpdate(update);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (images: string[]) => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (images: string[]) => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Announcements':
        return 'bg-blue-100 text-blue-800';
      case 'Events':
        return 'bg-green-100 text-green-800';
      case 'Prayer Requests':
        return 'bg-purple-100 text-purple-800';
      case 'Ministries':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sermons':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUpdates =
    selectedCategory === 'All'
      ? updates
      : updates.filter((u) => u.category === selectedCategory);

  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Latest Updates</h2>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === category
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUpdates.map((update) => {
            const images = getUpdateImages(update);

            return (
              <div
                key={update.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 max-h-[500px]"
              >
                {images.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={images[0]}
                      alt={update.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{images.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(update.category)}`}>
                      {update.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(update.postedAt)}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{update.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{update.content}</p>

                  {update.attachments && update.attachments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {update.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700"
                          >
                            {getAttachmentIcon(att.type)}
                            <span className="ml-1">{att.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mt-4">
                    <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                      <span className="text-xs font-bold">
                        {update.postedBy[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{update.postedBy}</span>
                  </div>

                  <button
                    onClick={() => openModal(update)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Read More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUpdate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{selectedUpdate.title}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Posted by {selectedUpdate.postedBy} -{' '}
                  {formatDistance(selectedUpdate.postedAt, new Date(), { addSuffix: true })}
                </p>

                {selectedUpdate.images && selectedUpdate.images.length > 0 && (
                  <div className="relative mb-4">
                    <img
                      src={selectedUpdate.images[currentImageIndex]}
                      alt={`Slide ${currentImageIndex + 1}`}
                      className="w-full h-64 object-cover rounded-md"
                    />
                    {selectedUpdate.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(selectedUpdate.images!)}
                          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => nextImage(selectedUpdate.images!)}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="prose max-w-none mb-4">
                  <p>{selectedUpdate.content}</p>
                </div>

                {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUpdate.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700"
                        >
                          {getAttachmentIcon(att.type)}
                          <span className="ml-1">{att.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
