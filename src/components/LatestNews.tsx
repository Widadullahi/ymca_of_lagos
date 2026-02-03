import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
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
  type: 'latest-news' | 'upcoming-event';
  category: string;
  imageUrl?: string;
  images?: string[];
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
}

const truncateContent = (content: string, maxWords: number = 30): string => {
  const words = content.split(' ');
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(' ') + '...';
};

export default function LatestNewsAndUpcomingEvents() {
  const { fetchWithAuth, displayNotification } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  // Fetch updates
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetchWithAuth({ method: 'GET', path: `/posts` });
        const normalized = (response?.data || []).map((item: any) => {
          const updateType = item.type || (item.category === 'Events' ? 'upcoming-event' : 'latest-news');
          const category = item.category || getCategoryFromType(updateType);

          // Fix image duplication issue
          const allImages = Array.from(new Set([
            item.image,
            ...(item.images || [])
          ])).filter(Boolean) as string[];

          return {
            id: item.id,
            title: item.title,
            content: item.content,
            type: updateType,
            category: category,
            imageUrl: item.image,
            images: allImages,
            postedAt: new Date(item.created_at),
            postedBy: item.user?.first_name || item.user?.email || 'Anonymous',
            attachments: (item.attachments || []).map((att: any) => {
              const fileType = att.file.split('.').pop()?.toLowerCase() || 'file';
              return {
                name: att.file.split('/').pop() || 'attachment',
                url: att.file,
                type: fileType,
              };
            }),
          };
        });

        const sorted = normalized.sort((a: { postedAt: { getTime: () => number; }; }, b: { postedAt: { getTime: () => number; }; }) => 
          b.postedAt.getTime() - a.postedAt.getTime()
        );
        setUpdates(sorted);
      } catch (error) {
        console.error('Error fetching updates:', error);
        displayNotification('error', 'Failed to load updates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, [fetchWithAuth, displayNotification]);

  // Helper functions
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <span className="text-red-500 text-2xl">📄</span>;
      case 'doc': case 'docx': return <span className="text-blue-500 text-2xl">📄</span>;
      case 'mp3': case 'wav': return <span className="text-purple-500 text-2xl">🎵</span>;
      default: return <span className="text-gray-500 text-2xl">📎</span>;
    }
  };

  const getUpdateImages = (update: Update): string[] => 
    update.images?.length ? update.images : [];

  const openModal = (update: Update) => {
    setSelectedUpdate(update);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
  };

  const nextImage = (images: string[]) => 
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  
  const prevImage = (images: string[]) => 
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');

  const newsUpdates = updates.filter(u =>
    u.type === 'latest-news' || u.category !== 'Events'
  ).slice(0, 6); // Increased to 6 to show 2 rows if needed

  const eventUpdates = updates.filter(u =>
    u.type === 'upcoming-event' || u.category === 'Events'
  ).slice(0, 6); // Increased to 6 to show 2 rows if needed

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest News & Upcoming Events
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Stay informed about our latest announcements and mark your calendar for exciting upcoming events
          </p>
        </div>

        {/* Latest News Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <span className="w-3 h-8 bg-red-600 mr-3 rounded-full"></span>
                Latest News
              </h3>
              <p className="text-gray-500 mt-2">Recent announcements and updates from our community</p>
            </div>
            {newsUpdates.length > 0 && (
              <a
                href="/news?category=news"
                className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold group transition-colors"
              >
                View All News
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : newsUpdates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <p className="text-gray-500 text-lg">No news updates available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsUpdates.slice(0, 3).map((update, index) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                  >
                    <div className="relative overflow-hidden">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-center">
                          <span className="text-gray-400 text-5xl">📰</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                          News
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-sm text-gray-500 mb-2">
                        {formatDate(update.postedAt)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                        {truncateContent(update.content, 25)}
                      </p>
                      <div className="mt-auto">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          {/* <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-semibold text-sm">
                              {update.postedBy[0]?.toUpperCase() || '?'}
                            </span>
                          </div> */}
                          {/* <span>By {update.postedBy}</span> */}
                        </div>
                        <motion.button
                          onClick={() => openModal(update)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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

        {/* Upcoming Events Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <span className="w-3 h-8 bg-green-600 mr-3 rounded-full"></span>
                Upcoming Events
              </h3>
              <p className="text-gray-500 mt-2">Mark your calendar for these exciting events</p>
            </div>
            {eventUpdates.length > 0 && (
              <a
                href="/news"
                className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2 transition-colors"
              >
                View All Events
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : eventUpdates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-400 text-6xl mb-4">🎉</div>
              <p className="text-gray-500 text-lg">No upcoming events scheduled. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventUpdates.slice(0, 3).map((update, index) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
                    onClick={() => openModal(update)}
                  >
                    <div className="relative overflow-hidden">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-r from-green-50 to-teal-50 flex items-center justify-center">
                          <span className="text-gray-400 text-5xl">🎯</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Event
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="text-white font-bold">
                          <div className="text-2xl">{format(update.postedAt, 'dd')}</div>
                          <div className="text-sm">{format(update.postedAt, 'MMM yyyy')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                        {truncateContent(update.content, 20)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {format(update.postedAt, 'h:mm a')}
                        </div>
                        <span className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-800 transition-colors">
                          View Details
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal - View Full Update */}
      <AnimatePresence mode="wait">
        {isModalOpen && selectedUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                      selectedUpdate.type === 'upcoming-event' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUpdate.type === 'upcoming-event' ? 'Event' : 'News'}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUpdate.title}</h2>
                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(selectedUpdate.postedAt)}
                      {selectedUpdate.type === 'upcoming-event' && (
                        <>
                          <span className="mx-2">•</span>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {format(selectedUpdate.postedAt, 'h:mm a')}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="ml-4 text-gray-500 hover:text-gray-700 text-2xl leading-none p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-grow overflow-y-auto">
                <div className="p-6">
                  {/* Image Gallery */}
                  {selectedUpdate.images && selectedUpdate.images.length > 0 && (
                    <div className="mb-8">
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={selectedUpdate.images[currentImageIndex]}
                          alt={`${selectedUpdate.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-80 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = selectedUpdate.type === 'upcoming-event' 
                              ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
                              : 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        
                        {selectedUpdate.images.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(selectedUpdate.images!)}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                              aria-label="Previous image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(selectedUpdate.images!)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                              aria-label="Next image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {selectedUpdate.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-8">
                    <div className="relative">
                      <img
                        src={selectedUpdate.images[currentImageIndex]}
                        alt={`${selectedUpdate.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-96 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                        }}
                      />

                      {selectedUpdate.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(selectedUpdate.images!)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            aria-label="Previous image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => nextImage(selectedUpdate.images!)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            aria-label="Next image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {selectedUpdate.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                aria-label={`Go to image ${idx + 1}`}
                              />
                            ))}
                          </div>

                          {/* Image Counter */}
                          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {selectedUpdate.images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {selectedUpdate.images.length > 1 && (
                      <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                        {selectedUpdate.images.map((img, idx) => (
                          <button
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                          >
                            <div className="flex-shrink-0 mr-4">
                              {getAttachmentIcon(attachment.type)}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
                              <p className="text-sm text-gray-500 uppercase">{attachment.type}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                  <div className="text-sm text-gray-500">
                    Posted {formatDate(selectedUpdate.postedAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}