import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/NewAuthContext';
import { createPostsApi } from '../api/postsApi';
import { useNavigate } from 'react-router-dom';

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
  actionButtonLabel?: string;
  actionButtonUrl?: string;
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

interface LatestNewsProps {
  showStats?: boolean;
  showFilters?: boolean;
  showAll?: boolean;
}

export default function LatestNewsAndUpcomingEvents({ showStats = true, showFilters = true, showAll = false }: LatestNewsProps) {
  const { fetchWithAuth, displayNotification, BACKEND_URL } = useAuth();
  const navigate = useNavigate();
  // Create postsApi only once by memoizing it
  const postsApi = React.useMemo(() => createPostsApi(fetchWithAuth, BACKEND_URL), [fetchWithAuth, BACKEND_URL]);
  
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const createInlinePlaceholder = (width: number, height: number, label: string) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="20">
          ${label}
        </text>
      </svg>`
    )}`;

  useEffect(() => {
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

    fetchUpdates();
  }, [postsApi]); // Removed displayNotification from dependency array since it's stable from context

  const getUpdateImages = (update: Update): string[] => {
    if (update.images?.length) return update.images;
    if (update.imageUrl) return [update.imageUrl];
    return [];
  };

  const openModal = (update: Update) => {
    navigate(`/news/${update.id}`);
  };

  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');
  const showStatusLabel = showStats ? 'stats-enabled' : 'stats-disabled';
  const showFilterLabel = showFilters ? 'filters-enabled' : 'filters-disabled';

  const newsUpdates = updates.filter(u => 
    u.type === 'latest-news' || u.category !== 'Events'
  ).slice(0, showAll ? undefined : 5);

  const eventUpdates = updates.filter(u => 
    u.type === 'upcoming-event' || u.category === 'Events'
  ).slice(0, showAll ? undefined : 5);

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
        <div className="sr-only" aria-hidden="true">{showStatusLabel} {showFilterLabel}</div>
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
              {newsUpdates.map((update, index) => {
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
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = createInlinePlaceholder(400, 256, 'No Image');
                          }}
                        />
                      ) : update.attachments?.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type)) ? (
                        <video
                          src={update.attachments.find(a => ['mp4', 'webm', 'mov', 'ogg'].includes(a.type))?.url}
                          className="w-full h-64 object-cover"
                          muted
                          playsInline
                          preload="metadata"
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
    </section>
  );
}
