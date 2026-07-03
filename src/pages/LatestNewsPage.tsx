import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';
import { useAuth } from '../context/NewAuthContext';
import { createPostsApi } from '../api/postsApi';
import Footer from '../components/Footer';
import theirlogo from '../assets/images/logo.png';

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

const truncateContent = (content: string, maxWords: number = 25): string => {
  const words = content.split(' ');
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(' ') + '...';
};

export default function LatestNewsPage() {
  const { fetchWithAuth, BACKEND_URL, displayNotification } = useAuth();
  const postsApi = React.useMemo(() => createPostsApi(fetchWithAuth, BACKEND_URL), [fetchWithAuth, BACKEND_URL]);
  
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events'>('all');
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
      console.error('Error fetching updates:', error);
      displayNotification('error', 'Failed to load updates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
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

  const filteredUpdates = updates.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'news') return u.type === 'latest-news';
    return u.type === 'upcoming-event';
  });

  const openDonationModal = () => {};

  return (
    <>
      <SocialMediaBar />
      <MainNavigation openDonationModal={openDonationModal} />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest News & Events
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Stay updated with what's happening at YMCA Lagos - from inspiring stories to exciting community events
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              {(['all', 'news', 'events'] as const).map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-red-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'all' && 'All Posts'}
                  {tab === 'news' && 'Latest News'}
                  {tab === 'events' && 'Upcoming Events'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
            </div>
          )}

          {/* Posts Grid */}
          {!isLoading && filteredUpdates.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredUpdates.map((update, index) => {
                  const images = getUpdateImages(update);
                  return (
                    <motion.div
                      key={update.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        {images.length > 0 ? (
                          <img
                            src={images[0]}
                            alt={update.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            onError={(e) => {
                              console.warn('Failed to load image:', images[0]);
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = createInlinePlaceholder(400, 208, 'No Image');
                            }}
                          />
                        ) : update.attachments?.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type)) ? (
                          <video
                            src={update.attachments.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type))?.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            update.type === 'latest-news'
                              ? 'bg-blue-600 text-white'
                              : 'bg-green-600 text-white'
                          }`}>
                            {update.type === 'latest-news' ? 'News' : 'Event'}
                          </span>
                        </div>

                        {/* Image Count */}
                        {images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                            {images.length} Photos
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>{formatDate(update.postedAt)}</span>
                          <span className="mx-2">•</span>
                          <span>by {update.postedBy}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {update.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                          {truncateContent(update.content)}
                        </p>
                        
                        <div className="mt-auto">
                          <motion.button
                            onClick={() => openModal(update)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                          >
                            Read Full Story
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* No Posts State */}
          {!isLoading && filteredUpdates.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500">
                There are no {activeTab === 'news' ? 'news articles' : activeTab === 'events' ? 'events' : 'posts'} available at the moment
              </p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {isModalOpen && selectedUpdate && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-start justify-center p-4 pt-20 pb-10">
              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg text-gray-700 hover:text-red-700 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Media Gallery */}
                {(() => {
                  const allMedia = getAllMedia(selectedUpdate);
                  if (allMedia.length === 0) return null;

                  const currentMedia = allMedia[currentMediaIndex];
                  return (
                    <div className="bg-gray-100">
                      <div className="relative">
                        {currentMedia.type === 'image' ? (
                          <img
                            src={currentMedia.url}
                            alt={`Media ${currentMediaIndex + 1}`}
                            className="w-full max-h-[500px] object-contain"
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
                            className="w-full max-h-[500px] object-contain"
                            onError={(e) => {
                              console.warn('Failed to load video:', currentMedia.url);
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* Navigation Arrows */}
                        {allMedia.length > 1 && (
                          <>
                            <button
                              onClick={() => prevMedia(allMedia)}
                              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextMedia(allMedia)}
                              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                              {currentMediaIndex + 1} / {allMedia.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {allMedia.length > 1 && (
                        <div className="px-6 py-4 flex gap-3 overflow-x-auto">
                          {allMedia.map((media, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMediaIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentMediaIndex 
                                  ? 'border-red-600 ring-2 ring-red-600 ring-offset-2' 
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
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Content */}
                <div className="p-8">
                  <div className="mb-6">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider mb-4 ${
                      selectedUpdate.type === 'latest-news'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedUpdate.type === 'latest-news' ? 'Latest News' : 'Upcoming Event'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedUpdate.title}
                    </h2>
                    <div className="flex items-center text-gray-500">
                      <span className="font-medium">By {selectedUpdate.postedBy}</span>
                      <span className="mx-3">•</span>
                      <span>{formatDistance(selectedUpdate.postedAt, new Date(), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none text-gray-700 mb-8 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    <p className="whitespace-pre-line text-lg">{selectedUpdate.content}</p>
                  </div>

                  {/* Action Button */}
                  {(selectedUpdate.actionButtonLabel || selectedUpdate.actionButtonUrl) && (
                    <div className="mb-8">
                      <a
                        href={selectedUpdate.actionButtonUrl || '#'}
                        target={selectedUpdate.actionButtonUrl ? "_blank" : "_self"}
                        rel={selectedUpdate.actionButtonUrl ? "noopener noreferrer" : undefined}
                        className={`inline-flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold transition-all ${
                          selectedUpdate.actionButtonUrl 
                            ? 'bg-red-700 text-white hover:bg-red-800 shadow-lg hover:shadow-xl' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {selectedUpdate.actionButtonLabel || 'Learn More'}
                        {selectedUpdate.actionButtonUrl && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedUpdate.attachments && selectedUpdate.attachments.filter(a => 
                    !['mp4', 'webm', 'mov', 'ogg'].includes(a.type.toLowerCase())
                  ).length > 0 && (
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Attachments</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedUpdate.attachments.filter(a => 
                          !['mp4', 'webm', 'mov', 'ogg'].includes(a.type.toLowerCase())
                        ).map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-700"
                          >
                            {(() => {
                              switch (att.type.toLowerCase()) {
                                case 'pdf':
                                  return <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9 11h2v6H9v-6zm2 10H9v-2h2v2zm4-4h2v4h-2v-4zm-4 0h2v4h-2v-4z"/></svg>;
                                case 'docx':
                                case 'doc':
                                  return <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9 11h2v6H9v-6zm2 10H9v-2h2v2zm4-4h2v4h-2v-4zm-4 0h2v4h-2v-4z"/></svg>;
                                case 'mp3':
                                  return <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>;
                                default:
                                  return <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
                              }
                            })()}
                            <span className="font-medium">{att.name}</span>
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
      </div>
      <Footer openDonationModal={openDonationModal} logo={theirlogo} />
    </>
  );
}
