import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import CoreValue from '../components/CoreValue.js';
import LatestUpdate from '../components/LatestUpdate.js';
import Programme from '../components/Programme.js';
import ymca from '../assets/images/image.png'



interface Quote {
  id: string;
  text: string;
  author: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { fetchWithAuth ,FRONTEND_URL, displayNotification} = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [donationForm, setDonationForm] = useState({
    name: '',
    amount: '',
    email: '',
    redirect_url : FRONTEND_URL + '',
  });


  // Quotes data
  const [quotes] = useState<Quote[]>([
    {
      id: '1',
      text: 'You will never know the fullness of Christ until you know the emptiness of everything else but Christ',
      author: 'Charles Spurgeon'
    },
    {
      id: '2',
      text: 'Until the lions have their own historians, the history of the hunt will always glorify the hunter.',
      author: 'Chinua Achebe'
    },
    {
      id: '3',
      text: 'To accomplish great things, we must not only act, but also dream, not only plan, but also believe.',
      author: 'Anatole France'
    },
    {
      id: '4',
      text: 'Good things come to people who wait, but better things come to those who go out and get them.',
      author: 'Anonymous'
    }
  ]);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);



  // Auto-advance quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds

    return () => clearInterval(timer);
  }, [quotes.length]);

  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setDonationForm({ name: '', amount: '', email: '',redirect_url : FRONTEND_URL + '', });
    document.body.style.overflow = 'auto';
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donationForm.name && donationForm.amount) {
      try {
        const response = await fetchWithAuth({
          method: 'POST',
          path: `/initiate/donation`,
          body: donationForm
        });
        window.location = response?.data?.payment_url
      } catch (error) {
        console.error('Error fetching churches:', error);
        displayNotification('error','Failed to load churches', );
      }
    }
  };



  // Quote navigation functions
  const goToQuote = (index: number) => {
    setCurrentQuoteIndex(index);
  };

  useEffect(() => {
    // Simulating API fetch with the provided data
    const fetchUpdates = async () => {
      setTimeout(() => {
      }, 1000);
    };

    fetchUpdates();
  }, []);

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

  const quoteVariants = {
    enter: {
      opacity: 0,
      y: 20,
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
            <img 
              src={ymca} 
              alt="YMCA Lagos Logo" 
              className="h-10 w-auto object-contain" 
            />
          </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-red-700 font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/about-us')}
                className="text-gray-700 hover:text-red-700 font-medium transition-colors"
              >
                About Us
              </button>
              <button 
                onClick={() => navigate('/membership-request')}
                className="text-gray-700 hover:text-red-700 font-medium transition-colors"
              >
                Membership
              </button>
              <button 
                onClick={openDonationModal}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                Donate
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-red-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-700 font-medium transition-colors text-left"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/about-us');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-700 font-medium transition-colors text-left"
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/membership-request');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-700 font-medium transition-colors text-left"
                  >
                    Membership
                  </button>
                  <button 
                    onClick={() => {
                      openDonationModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-left w-fit"
                  >
                    Donate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      
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
                onClick={()=> {navigate('/membership-request')}}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-white text-red-700 font-bold py-3 px-6 rounded-full shadow-lg"
              >
                Membership Request
              </motion.button>
              
              <motion.button
                onClick={openDonationModal}
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

      <CoreValue />

      {/* Inspirational Quotes Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Words of Wisdom</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Inspiring thoughts and reflections to guide our journey
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Quote Display */}
            <div className="relative h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuoteIndex}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="text-center px-8"
                >
                  <div className="relative">
                    {/* Quote Mark */}
                    <div className="absolute -top-6 -left-4 text-6xl text-red-300 font-serif">"</div>
                    
                    <blockquote className="text-lg md:text-xl text-gray-700 italic mb-6 leading-relaxed">
                      {quotes[currentQuoteIndex].text}
                    </blockquote>
                    
                    <div className="flex items-center justify-center">
                      <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent w-16 mr-4"></div>
                      <cite className="text-red-600 font-semibold text-sm tracking-wide uppercase">
                        {quotes[currentQuoteIndex].author}
                      </cite>
                      <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-transparent w-16 ml-4"></div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quote Navigation Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {quotes.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToQuote(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentQuoteIndex 
                      ? 'bg-red-600 scale-125' 
                      : 'bg-red-300 hover:bg-red-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <motion.button
                onClick={() => setCurrentQuoteIndex(prev => prev === 0 ? quotes.length - 1 : prev - 1)}
                className="p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              <motion.button
                onClick={() => setCurrentQuoteIndex(prev => (prev + 1) % quotes.length)}
                className="p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <LatestUpdate />

      <Programme />

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
              onClick={() => navigate('/about-us')}
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
              <h3 className="text-xl font-bold mb-4"></h3>
              <p className="text-gray-400">77Awolowo road, Ikoyi, Lagos, Nigeria</p>
            </div>
            <div>
              {/* <h3 className="text-xl font-bold mb-4">Service Times</h3>
              <p className="text-gray-400">Sunday: 10:00 AM<br />Wednesday: 7:00 PM</p> */}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">Email: info@ymcaoflagos.org<br />Phone: Hostel 08102977099 Admin: 09026802928 Programmes: 09026114628</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2025 Worldwide YMCA Movement. All rights reserved.</p>
          </div>
        </div>
      </footer>

     

      {/* Donation Modal */}
      <AnimatePresence>
        {isDonationModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div 
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Close button */}
              <button
                onClick={closeDonationModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              {/* Modal content */}
              <div className="px-6 py-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Make a Donation</h3>
                  <p className="text-gray-600">Your generosity helps us serve our community better</p>
                </div>
                
                <form onSubmit={handleDonationSubmit}>
                  <div className="mb-4">
                    <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      value={donationForm.name}
                      onChange={(e) => setDonationForm({ ...donationForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      value={donationForm.email}
                      onChange={(e) => setDonationForm({ ...donationForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Amount (₦)
                    </label>
                    <input
                      type="number"
                      id="donationAmount"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={closeDonationModal}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      Donate
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;