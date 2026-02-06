import { useState, useEffect, useRef } from 'react';
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

// Function to truncate content to a maximum number of words
const truncateContent = (content: string, maxWords: number = 30): string => {
  const words = content.split(' ');
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(' ') + '...';
};

export default function LatestNewsAndUpcomingEvents() {
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalBodyRef.current) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        modalBodyRef.current.scrollBy({ top: 80 * direction, left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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
          const updateType = item.type || (item.category === 'Events' ? 'upcoming-event' : 'latest-news');
          const category = item.category || (updateType === 'upcoming-event' ? 'Events' : 'Announcements');
          const primaryImage =
            item.image || item.image_url || item.imageUrl || item?.image_base64;
          const imageList = item.images || item.image_list || item.imageUrls || [];
          const attachmentImages = (item.attachments || [])
            .map((att: any) => toAbsoluteUrl(att?.file || att?.url))
            .filter(isImageFile);
          const allImages = Array.from(new Set([
            toAbsoluteUrl(primaryImage),
            ...(imageList || []).map((img: any) => toAbsoluteUrl(img)),
            ...attachmentImages
          ])).filter(Boolean) as string[];
          
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            type: updateType,
            category: category,
            imageUrl: allImages[0] || '',
            images: allImages,
            postedAt: new Date(item.created_at),
            postedBy: item.user?.first_name || item.user?.email || 'Anonymous',
            attachments: (item.attachments || []).map((att: any) => {
              const fileType = att.file.split('.').pop()?.toLowerCase() || 'file';
              return {
                name: att.file.split('/').pop() || 'attachment',
                url: toAbsoluteUrl(att.file),
                type: fileType,
              };
            }),
          };
        });

        const sorted = normalized.sort((a: { postedAt: { getTime: () => number; }; }, b: { postedAt: { getTime: () => number; }; }) => b.postedAt.getTime() - a.postedAt.getTime());
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

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <span className="text-red-500 text-2xl">📄</span>;
      case 'doc': case 'docx': return <span className="text-blue-500 text-2xl">📄</span>;
      case 'mp3': case 'wav': return <span className="text-purple-500 text-2xl">🎵</span>;
      default: return <span className="text-gray-500 text-2xl">📎</span>;
    }
  };

  const getUpdateImages = (update: Update): string[] => {
    if (update.images?.length) return update.images;
    if (update.imageUrl) return [update.imageUrl];
    return [];
  };

  const openModal = (update: Update) => {
    setSelectedUpdate(update);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
  };

  const nextImage = (images: string[]) => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = (images: string[]) => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');

  const newsUpdates = updates.filter(u => 
    u.type === 'latest-news' || u.category !== 'Events'
  ).slice(0, 5);

  const eventUpdates = updates.filter(u => 
    u.type === 'upcoming-event' || u.category === 'Events'
  ).slice(0, 5);

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

        {/* Featured News - 3 equal cards in a row */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 pl-4 border-l-4 border-red-500">
              Latest News
            </h3>
            {newsUpdates.length > 0 && (
              <a
                href="/news"
                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2 transition-colors"
              >
                See More News →
              </a>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : newsUpdates.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500 text-lg">No recent news available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsUpdates.slice(0, 3).map((update, index) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                  >
                    <div className="relative">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x256?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-lg">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        {/* Removed category tag from here */}
                        <p className="text-white text-sm opacity-90">{formatDate(update.postedAt)}</p>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{update.title}</h3>
                      {/* FIX: Truncate content in card (max 30 words) */}
                      <p className="text-gray-600 mb-6 line-clamp-4 flex-grow">
                        {truncateContent(update.content, 30)}
                      </p>
                      <div className="mt-auto">
                        {/* Removed posted by section from here */}
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
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 pl-4 border-l-4 border-green-500">
              Upcoming Events
            </h3>
            {eventUpdates.length > 0 && (
              <a
                href="/news"
                className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2 transition-colors"
              >
                See All Events →
              </a>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col"
                    onClick={() => openModal(update)}
                  >
                    <div className="relative">
                      {images.length > 0 ? (
                        <img
                          src={images[0]}
                          alt={update.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x224?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      {/* Removed the event badge from here */}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {update.title}
                      </h3>
                      {/* FIX: Truncate content in card (max 20 words for events) */}
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-grow text-sm">
                        {truncateContent(update.content, 20)}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-sm">
                        <span className="text-gray-500">{formatDate(update.postedAt)}</span> {/* Replaced postedBy with date */}
                        <span className="text-red-600 font-medium">View Details →</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Complete version with full content */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col min-h-0 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    {/* Removed category tag from modal header */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-3">{selectedUpdate.title}</h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  {/* Removed posted by info from modal */}
                  <span>{formatDate(selectedUpdate.postedAt)}</span>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                ref={modalBodyRef}
                className="flex-grow overflow-y-scroll min-h-0 modal-scrollbar"
                style={{ scrollbarGutter: 'stable', maxHeight: '70vh' }}
              >
                <div className="p-6">
                  {/* Image Gallery - Carousel */}
                  {getUpdateImages(selectedUpdate).length > 0 && (
                    <div className="mb-8">
                      <div className="relative">
                        <img
                          src={getUpdateImages(selectedUpdate)[currentImageIndex]}
                          alt={`${selectedUpdate.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-96 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                          }}
                        />
                        
                        {getUpdateImages(selectedUpdate).length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(getUpdateImages(selectedUpdate))}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                              aria-label="Previous image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(getUpdateImages(selectedUpdate))}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                              aria-label="Next image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            
                            {/* Image Indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {getUpdateImages(selectedUpdate).map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                            
                            {/* Image Counter */}
                            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                              {currentImageIndex + 1} / {getUpdateImages(selectedUpdate).length}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Thumbnails */}
                      {getUpdateImages(selectedUpdate).length > 1 && (
                        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                          {getUpdateImages(selectedUpdate).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${idx === currentImageIndex ? 'border-red-500' : 'border-transparent'}`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Thumb';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content - Full content in modal */}
                  <div className="mb-8">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {selectedUpdate.content}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUpdate.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}




