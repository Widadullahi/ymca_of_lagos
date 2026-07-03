import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import { createPostsApi } from '../api/postsApi';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  type: 'latest-news' | 'upcoming-event';
  actionButtonLabel?: string;
  actionButtonUrl?: string;
  imageUrl?: string;
  images?: string[];
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
  category?: string;
}

const truncateContent = (content: string, maxWords: number = 30): string => {
  const words = content.split(' ');
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(' ') + '...';
};

interface LatestNewsProps {
  showStats?: boolean;
  showFilters?: boolean;
  showAll?: boolean;
}

export default function LatestNewsAndUpcomingEvents({ 
  showStats: _showStats = true, 
  showFilters: _showFilters = true, 
  showAll = false 
}: LatestNewsProps) {
  const navigate = useNavigate();
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const postsApi = React.useMemo(() => createPostsApi(fetchWithAuth, BACKEND_URL), [fetchWithAuth, BACKEND_URL]);
  
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const createInlinePlaceholder = (width: number, height: number, label: string) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="20">
          ${label}
        </text>
      </svg>`
    )}`;

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const { posts } = await postsApi.getPosts({ page_size: 100 });
      const sorted = [...posts].sort((a: Update, b: Update) => 
        b.postedAt.getTime() - a.postedAt.getTime()
      );
      setUpdates(sorted);
    } catch (error) {
      displayNotification('error', 'Failed to load updates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();

    // Listen for localStorage changes from admin updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'news-events-updated') {
        fetchUpdates();
        // Clear the flag after fetching
        localStorage.removeItem('news-events-updated');
      }
    };

    // Also check for local changes (same tab)
    const checkForUpdates = () => {
      const flag = localStorage.getItem('news-events-updated');
      if (flag) {
        fetchUpdates();
        localStorage.removeItem('news-events-updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for updates every 2 seconds to catch same-tab changes
    const pollInterval = setInterval(checkForUpdates, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [postsApi]);

  const getUpdateImages = (update: Update): string[] => {
    if (update.images?.length) return update.images;
    if (update.imageUrl) return [update.imageUrl];
    return [];
  };

  const getUpdateVideos = (update: Update): Attachment[] => {
    if (!update.attachments) return [];
    return update.attachments.filter(att => 
      ['mp4', 'webm', 'mov', 'ogg'].includes(att.type.toLowerCase())
    );
  };

  const getAllMedia = (update: Update): Array<{ type: 'image' | 'video'; url: string; name?: string }> => {
    const images = getUpdateImages(update).map(url => ({ type: 'image' as const, url }));
    const videos = getUpdateVideos(update).map(att => ({ type: 'video' as const, url: att.url, name: att.name }));
    return [...images, ...videos];
  };

  const openModal = (update: Update) => {
    setSelectedUpdate(update);
    setCurrentMediaIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMediaIndex(0);
    document.body.style.overflow = 'auto';
  };

  const nextMedia = (media: Array<{ type: 'image' | 'video'; url: string; name?: string }>) => {
    setCurrentMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = (media: Array<{ type: 'image' | 'video'; url: string; name?: string }>) => {
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');

  const newsUpdates = updates.filter(u => 
    u.type === 'latest-news'
  ).slice(0, showAll ? undefined : 3);

  const eventUpdates = updates.filter(u => 
    u.type === 'upcoming-event'
  ).slice(0, showAll ? undefined : 3);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Latest News & Upcoming Events
        </h2>
        <p className="text-gray-600 text-lg text-center mb-16 max-w-3xl mx-auto">
          Stay up to date with what's happening in our community from inspiring stories to exciting upcoming events.
        </p>

        {/* Featured News */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 pl-4 border-l-4 border-red-500">
              Latest News
            </h3>
            {!showAll && (
              <motion.button
                onClick={() => navigate('/news')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all"
              >
                View All News
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : newsUpdates.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500 text-lg">No news available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsUpdates.map((update, index) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                  >
                    <div className="relative">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.warn('Failed to load image:', images[0]);
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = createInlinePlaceholder(400, 224, 'No Image');
                          }}
                        />
                      ) : update.attachments?.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type)) ? (
                        <video
                          src={update.attachments.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type))?.url}
                          className="w-full h-56 object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      {images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          +{images.length - 1} more
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">{formatDate(update.postedAt)}</span>
                    </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{update.title}</h3>
                      <p className="text-gray-600 mb-6 line-clamp-4 flex-grow">
                        {truncateContent(update.content, 30)}
                      </p>
                      <div className="mt-auto">
                        <motion.button
                          onClick={() => openModal(update)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                          Read Full Story
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 pl-4 border-l-4 border-green-500">
              Upcoming Events
            </h3>
            {!showAll && (
              <motion.button
                onClick={() => navigate('/news')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-600 hover:text-white transition-all"
              >
                View All Events
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : eventUpdates.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500 text-lg">No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventUpdates.map((update, index) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer"
                    onClick={() => openModal(update)}
                  >
                    <div className="relative">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.warn('Failed to load image:', images[0]);
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = createInlinePlaceholder(400, 224, 'No Image');
                          }}
                        />
                      ) : update.attachments?.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type)) ? (
                        <video
                          src={update.attachments.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type))?.url}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      {images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          +{images.length - 1} more
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">{formatDate(update.postedAt)}</span>
                    </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-4 flex-grow text-sm">
                        {truncateContent(update.content, 20)}
                      </p>
                      <div className="mt-auto">
                        <motion.button
                          onClick={() => openModal(update)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUpdate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

              <div className="p-6 overflow-y-auto">
                <h3 className="text-2xl font-bold mb-2">{selectedUpdate.title}</h3>
                <div className="mb-6">
                  <span className="text-sm text-gray-500">
                    {formatDistance(selectedUpdate.postedAt, new Date(), { addSuffix: true })}
                  </span>
                </div>

                {(() => {
                  const allMedia = getAllMedia(selectedUpdate);
                  if (allMedia.length === 0) return null;

                  const currentMedia = allMedia[currentMediaIndex];
                  return (
                    <div className="mb-6">
                      <div className="relative mb-4">
                        {currentMedia.type === 'image' ? (
                          <img
                            src={currentMedia.url}
                            alt={`Media ${currentMediaIndex + 1}`}
                            className="w-full h-96 object-contain rounded-md"
                            onError={(e) => {
                              console.warn('Failed to load image:', currentMedia.url);
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-96 object-contain rounded-md"
                            onError={(e) => {
                              console.warn('Failed to load video:', currentMedia.url);
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {allMedia.length > 1 && (
                          <>
                            <button
                              onClick={() => prevMedia(allMedia)}
                              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full hover:bg-opacity-70 transition"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() => nextMedia(allMedia)}
                              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full hover:bg-opacity-70 transition"
                            >
                              ›
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
                              {currentMediaIndex + 1} / {allMedia.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnail Previews */}
                      {allMedia.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {allMedia.map((media, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMediaIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                                index === currentMediaIndex 
                                  ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2' 
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.warn('Failed to load thumbnail:', media.url);
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-2xl">🎬</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="prose prose-lg max-w-none mb-6 text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                  <p className="whitespace-pre-line">{selectedUpdate.content}</p>
                </div>

                {(selectedUpdate.actionButtonLabel || selectedUpdate.actionButtonUrl) && (
                  <div className="mb-6">
                    <a
                      href={selectedUpdate.actionButtonUrl || '#'}
                      target={selectedUpdate.actionButtonUrl ? "_blank" : "_self"}
                      rel={selectedUpdate.actionButtonUrl ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center rounded-lg px-6 py-3 font-semibold transition ${
                        selectedUpdate.actionButtonUrl 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedUpdate.actionButtonLabel || 'Learn More'}
                    </a>
                  </div>
                )}

                {selectedUpdate.attachments && selectedUpdate.attachments.filter(a => 
                  !['mp4', 'webm', 'mov', 'ogg'].includes(a.type.toLowerCase())
                ).length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-3 text-lg">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUpdate.attachments.filter(a => 
                        !['mp4', 'webm', 'mov', 'ogg'].includes(a.type.toLowerCase())
                      ).map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-700"
                        >
                          {(() => {
                            switch (att.type.toLowerCase()) {
                              case 'pdf':
                                return <span className="text-red-500 mr-2">📄</span>;
                              case 'docx':
                                return <span className="text-blue-500 mr-2">📄</span>;
                              case 'mp3':
                                return <span className="text-purple-500 mr-2">🎵</span>;
                              default:
                                return <span className="text-gray-500 mr-2">📎</span>;
                            }
                          })()}
                          {att.name}
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
