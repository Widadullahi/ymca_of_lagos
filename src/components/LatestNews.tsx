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
  category: string;
  imageUrl?: string;
  images?: string[]; // Reserved for future use
  postedBy: string;
  postedAt: Date;
  attachments?: Attachment[];
}

export default function LatestNews() {
  const { fetchWithAuth, displayNotification } = useAuth();

  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


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

  return (
    <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 pl-4">LATEST NEWS</h2>
          
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
              {/* Main News Item - First item from backend */}
              {updates.length > 0 && (
                <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img 
                      src={updates[0].imageUrl || "https://via.placeholder.com/800x400?text=No+Image"} 
                      alt={updates[0].title} 
                      className="w-full h-64 object-cover" 
                    />
                    <div className="absolute bottom-0 left-0 bg-gray-900 bg-opacity-70 text-white px-4 py-2">
                      <span className="text-sm">{formatDate(updates[0].postedAt)}</span>
                    </div>
                    {updates[0].category && (
                      <div className={`absolute top-0 right-0 px-3 py-1 text-xs ${getCategoryColor(updates[0].category)}`}>
                        {updates[0].category}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{updates[0].title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{updates[0].content}</p>
                    <div className="flex justify-between items-center mt-4">
                      <motion.button
                        onClick={() => openModal(updates[0])}
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
              )}
              
              {/* News Column - Next 2-3 items from backend */}
              <div className="flex flex-col space-y-6">
                {/* News Items from backend */}
                {updates.slice(1, 3).map((update, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex flex-col h-full">
                      <div className="relative">
                        <img 
                          src={update.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
                          alt={update.title} 
                          className="w-full h-32 object-cover" 
                        />
                        <div className="absolute top-0 right-0 bg-gray-900 bg-opacity-70 text-white px-3 py-1">
                          <span className="text-xs">{formatDate(update.postedAt)}</span>
                        </div>
                        {update.category && (
                          <div className={`absolute bottom-0 left-0 px-3 py-1 text-xs ${getCategoryColor(update.category)}`}>
                            {update.category}
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="text-lg font-bold mb-2">{update.title}</h3>
                        <motion.button
                          onClick={() => openModal(update)}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          className="text-red-700 font-medium flex items-center mt-2"
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
                
                {/* Read More News Button */}
                {/* <div className="bg-red-700 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 text-center">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="text-white font-bold flex items-center justify-center w-full"
                    >
                      Read more news
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.button>
                  </div>
                </div> */}
              </div>
            </div>
          )}
          
          {/* News Detail Modal */}
          <AnimatePresence>
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
                  className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold">{selectedUpdate.title}</h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mb-4 flex items-center text-sm text-gray-600">
                      <span className="mr-4">Posted by: {selectedUpdate.postedBy}</span>
                      <span>{formatDate(selectedUpdate.postedAt)}</span>
                    </div>
                    
                    {getUpdateImages(selectedUpdate).length > 0 && (
                      <div className="relative mb-6">
                        <img
                          src={getUpdateImages(selectedUpdate)[currentImageIndex]}
                          alt={`Image ${currentImageIndex + 1}`}
                          className="w-full h-auto rounded-lg"
                        />
                        
                        {getUpdateImages(selectedUpdate).length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(getUpdateImages(selectedUpdate))}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(getUpdateImages(selectedUpdate))}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="prose max-w-none mb-6">
                      <p className="whitespace-pre-line">{selectedUpdate.content}</p>
                    </div>
                    
                    {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Attachments:</h4>
                        <div className="space-y-2">
                          {selectedUpdate.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 border rounded hover:bg-gray-50"
                            >
                              {getAttachmentIcon(attachment.type)}
                              <span className="ml-2">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
  );
}
