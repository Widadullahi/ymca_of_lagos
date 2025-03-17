import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistance } from 'date-fns';
import thumbnail from '../assets/images/thumbnail-im.jpg'
import { useNavigate } from 'react-router-dom';

// Type definitions
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
  postedBy: string;
  postedAt: Date;
  attachments?: Array<Attachment>;
}

const HomePage: React.FC = () => {


  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate()

  useEffect(() => {
    // Simulating API fetch with the provided data
    const fetchUpdates = async () => {
      // In a real app, you would fetch from an API
      setTimeout(() => {
        // Note: In a real implementation, we'd use actual images
        const thumbnailPlaceholder = thumbnail;
        
        setUpdates([
          {
            id: '1',
            title: 'Sunday Service Time Change',
            content: 'Starting next week, our Sunday service will begin at 10:00 AM instead of 9:30 AM. Please make note of this change and plan accordingly.',
            category: 'Announcements',
            postedBy: 'Pastor Johnson',
            postedAt: new Date('2025-03-10T12:00:00'),
            imageUrl: thumbnailPlaceholder,
          },
          {
            id: '2',
            title: 'Youth Group Retreat',
            content: 'Our annual youth retreat is scheduled for April 18-20. Registration is now open! Please register by March 25th to secure your spot.',
            category: 'Events',
            postedBy: 'Youth Ministry Team',
            postedAt: new Date('2025-03-08T09:15:00'),
            attachments: [
              {
                name: 'Retreat Schedule',
                url: '#',
                type: 'pdf'
              },
              {
                name: 'Permission Form',
                url: '#',
                type: 'docx'
              }
            ]
          },
          {
            id: '3',
            title: 'Prayer Request for the Smith Family',
            content: 'Please keep the Smith family in your prayers as they navigate a difficult health situation with their daughter Sarah.',
            category: 'Prayer Requests',
            postedBy: 'Prayer Team',
            postedAt: new Date('2025-03-07T16:30:00'),
          },
          {
            id: '4',
            title: 'Women\'s Bible Study Series',
            content: 'Join us for our new women\'s Bible study series "Walking in Faith" every Wednesday at 7:00 PM starting March 19th.',
            category: 'Ministries',
            postedBy: 'Women\'s Ministry',
            postedAt: new Date('2025-03-06T14:45:00'),
            imageUrl: thumbnailPlaceholder,
          },
          {
            id: '5',
            title: 'Last Week\'s Sermon: "Grace in Action"',
            content: 'Pastor Johnson\'s sermon on "Grace in Action" is now available for streaming and download. Explore how we can demonstrate God\'s grace in our daily lives.',
            category: 'Sermons',
            postedBy: 'Media Team',
            postedAt: new Date('2025-03-04T08:30:00'),
            attachments: [
              {
                name: 'Audio Recording',
                url: '#',
                type: 'mp3'
              },
              {
                name: 'Sermon Notes',
                url: '#',
                type: 'pdf'
              }
            ]
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchUpdates();
  }, []);

  const categories = ['All', ...Array.from(new Set(updates.map(update => update.category)))];
  
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

  const openModal = (update: Update) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-red-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Welcome to Worldwide YMCA Movement</h1>
            <p className="text-xl mb-8">Growing in faith, serving in love, living in hope</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={()=> {navigate('/login')}}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-white text-red-700 font-bold py-3 px-6 rounded-full shadow-lg"
              >
                Digital ID Management
              </motion.button>
              
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-full shadow-lg"
              >
                Make a Donation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Updates Section */}
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
              {filteredUpdates.map((update) => (
                <motion.div
                  key={update.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {update.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={update.imageUrl} 
                        alt={update.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
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
                          {update.attachments.map((attachment, index) => (
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
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Come and be part of our church family. We welcome everyone, regardless of where you are on your spiritual journey.
            </p>
            
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg"
            >
              Learn More About Us
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Chemin de Mouille-Galand 1</h3>
              <p className="text-gray-400">1214 Vernier<br />Geneva - Switzerland</p>
            </div>
            <div>

              {/* <h3 className="text-xl font-bold mb-4">Service Times</h3>
              <p className="text-gray-400">Sunday: 10:00 AM<br />Wednesday: 7:00 PM</p> */}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">Email: office@ymca.int<br />Phone: +41228495100</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2025 Worldwide YMCA Movement. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              {/* Modal header with image if available */}
              {selectedUpdate.imageUrl && (
                <div className="relative h-56 w-full">
                  <img 
                    src={selectedUpdate.imageUrl} 
                    alt={selectedUpdate.title} 
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
              )}
              
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
                {/* {selectedUpdate.category === 'Events' && (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Register
                  </motion.button>
                )}
                {selectedUpdate.category === 'Prayer Requests' && (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Submit Prayer
                  </motion.button>
                )} */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;