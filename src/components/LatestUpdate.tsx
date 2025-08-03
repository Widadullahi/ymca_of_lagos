import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import { companyUpdates } from '../constants/post.js';

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
  images?: string[]; // Added support for multiple images
  postedBy: string;
  postedAt: Date;
  attachments?: Array<Attachment>;
}

export default function LatestUpdate() {
    const [updates, setUpdates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // Added for image carousel
    const categories = ['All', ...Array.from(new Set(updates.map(update => update.category)))];
  

    useEffect(() => {
    // Simulating API fetch with the provided data
    const fetchUpdates = async () => {
        setTimeout(() => {
        setUpdates(companyUpdates);
        setIsLoading(false);
        }, 1000);
    };

    fetchUpdates();
    }, []);

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

    // Get images array for an update (supports both single imageUrl and multiple images)
    const getUpdateImages = (update: Update): string[] => {
      if (update.images && update.images.length > 0) {
        return update.images;
      }
      if (update.imageUrl) {
        return [update.imageUrl];
      }
      return [];
    };

    const openModal = (update: Update) => {
        setSelectedUpdate(update);
        setCurrentImageIndex(0); // Reset image index when opening modal
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentImageIndex(0); // Reset image index when closing modal
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    // Navigation functions for image carousel
    const nextImage = (images: string[]) => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (images: string[]) => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

      const buttonVariants = {
        hover: { 
          scale: 1.05,
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
          transition: { type: "spring", stiffness: 400 }
        },
        tap: { 
          scale: 0.95 
        }
      };
    
      const modalVariants = {
        hidden: { 
          opacity: 0,
          scale: 0.9
        },
        visible: { 
          opacity: 1,
          scale: 1,
          transition: { 
            type: "spring",
            damping: 25,
            stiffness: 500
          }
        },
        exit: { 
          opacity: 0,
          scale: 0.9,
          transition: { 
            duration: 0.2
          }
        }
      };

    
      const formatDate = (date: Date) => {
        return format(date, 'MMMM do, yyyy');
      };
    
      const getCategoryColor = (category: string) => {
        switch(category) {
          case 'Announcements': return 'bg-blue-100 text-blue-800';
          case 'Events': return 'bg-green-100 text-green-800';
          case 'Prayer Requests': return 'bg-purple-100 text-purple-800';
          case 'Ministries': return 'bg-yellow-100 text-yellow-800';
          case 'Sermons': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };
  const filteredUpdates = selectedCategory === 'All' 
    ? updates 
    : updates.filter(update => update.category === selectedCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

    return (
        <>
            <section className="py-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Latest Updates</h2>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <motion.button
                key={category}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredUpdates.map((update) => {
                const images = getUpdateImages(update);
                return (
                  <motion.div
                    key={update.id}
                    variants={itemVariants}
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
                      <p className="text-gray-600 mb-4 line-clamp-3 ">{update.content}</p>
                      
                      {update.attachments && update.attachments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {update.attachments.map((attachment:any, index:any) => (
                              <a 
                                key={index} 
                                href={attachment.url}
                                className="inline-flex items-center text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700"
                              >
                                {attachment.name}
                                <span className="ml-1 uppercase text-gray-500">({attachment.type})</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center mt-4">
                        <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold">
                            {update.postedBy.split(' ')[0][0]}{update.postedBy.split(' ')[1]?.[0] || ''}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{update.postedBy}</span>
                      </div>
                      
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => openModal(update)}
                        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium"
                      >
                        Read More
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}

            </motion.div>
          )}
        </motion.div>
         {/* Modal */}
              <AnimatePresence>
                {isModalOpen && selectedUpdate && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <motion.div 
                      className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={modalVariants}
                    >
                      {/* Close button */}
                      <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 focus:outline-none bg-white rounded-full p-1"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      
                      {/* Modal header with image carousel if available */}
                      {(() => {
                        const images = getUpdateImages(selectedUpdate);
                        if (images.length > 0) {
                          return (
                            <div className="relative h-56 w-full">
                              <img 
                                src={images[currentImageIndex]} 
                                alt={selectedUpdate.title} 
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                              
                              {/* Image navigation */}
                              {images.length > 1 && (
                                <>
                                  <button
                                    onClick={() => prevImage(images)}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => nextImage(images)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                  </button>
                                  
                                  {/* Image indicators */}
                                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {images.map((_, index) => (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full ${
                                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  
                                  {/* Image counter */}
                                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1} / {images.length}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Modal content */}
                      <div className="px-4 py-5 sm:p-6">
                        {/* Category tag */}
                        <div className="mb-4">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
                            ${selectedUpdate.category === 'Announcements' ? 'bg-blue-100 text-blue-800' : ''}
                            ${selectedUpdate.category === 'Events' ? 'bg-green-100 text-green-800' : ''}
                            ${selectedUpdate.category === 'Prayer Requests' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${selectedUpdate.category === 'Ministries' ? 'bg-purple-100 text-purple-800' : ''}
                            ${selectedUpdate.category === 'Sermons' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {selectedUpdate.category}
                          </span>
                        </div>
                        
                        <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">{selectedUpdate.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Posted by {selectedUpdate.postedBy} · {formatDistance(selectedUpdate.postedAt, new Date(), { addSuffix: true })}
                        </p>
                        <p className="text-gray-700 mb-5 whitespace-pre-line">{selectedUpdate.content}</p>
                        
                        {/* Attachments */}
                        {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
                            <div className="space-y-2">
                              {selectedUpdate.attachments.map((attachment, index) => (
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
                      
                      {/* Modal footer */}
                      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50 rounded-b-lg">
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={closeModal}
                        >
                          Close
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
      </section>
        </>
    )
}