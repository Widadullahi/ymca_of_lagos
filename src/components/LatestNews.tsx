import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  category: string;
  imageUrl?: string;
  images?: string[]; // Reserved for future use
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
}

interface LatestNewsProps {
  showAll?: boolean;
}

export default function LatestNews({ showAll = false }: LatestNewsProps) {
  const { fetchWithAuth, displayNotification } = useAuth();

  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Modal state removed, navigation used instead
  const navigate = useNavigate();


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


  // Navigate to details page
  const goToDetails = (update: Update) => {
    navigate(`/news/${update.id}`);
  };


  const formatDate = (date: Date) => format(date, 'MMMM do, yyyy');

  
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400 }
    }
  };

  // Helper to truncate text
  const truncate = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  };

  // Determine which updates to show
  const visibleUpdates = showAll ? updates : updates.slice(0, 3);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 pl-4">LATEST NEWS</h2>

        {!showAll && (
          <motion.a
          variants={buttonVariants}
              href="/news"
              className="text-red-700 font-medium flex items-center"
            >
              Read more
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
        </motion.a>
        )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">Loading latest news...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">No news available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleUpdates.map((update) => (
              <div key={update.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative">
                  <img
                    src={update.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={update.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs bg-gray-900 bg-opacity-70 text-white">
                    <span>{formatDate(update.postedAt)}</span>
                  </div>
            
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-2">{update.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{truncate(update.content, 120)}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <motion.button
                      onClick={() => goToDetails(update)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="text-red-700 font-medium flex items-center"
                    >
                      Read more
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* News Detail Modal removed; navigation now used for details */}
      </div>
    </section>
  );
}
