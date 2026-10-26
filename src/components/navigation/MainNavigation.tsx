import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ymca from '../../assets/images/image.png';
import { useAuth } from '../../context/NewAuthContext';
import { startPaymentCheckout } from '../../api/paymentCheckout';

interface MainNavigationProps {
  openDonationModal: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMembershipDropdownOpen, setIsMembershipDropdownOpen] = useState<boolean>(false);
  const { fetchWithAuth, FRONTEND_URL, displayNotification } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [donationForm, setDonationForm] = useState({
    name: '',
    amount: '',
    email: '',
    redirect_url: FRONTEND_URL + '',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setIsMembershipDropdownOpen(false);
      }
    };

    if (isMembershipDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMembershipDropdownOpen]);

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donationForm.name && donationForm.amount) {
      try {
        const response = await fetchWithAuth({
          method: 'POST',
          path: `/initiate/donation`,
          body: donationForm,
          isAthenticated: false,
        });
        await startPaymentCheckout(response.data, message => displayNotification('error', message));
      } catch (error: any) {
        console.error('Error processing donation:', error);
        displayNotification('error', error?.message || 'Failed to process donation');
      }
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

  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setDonationForm({ name: '', amount: '', email: '', redirect_url: FRONTEND_URL + '', });
    document.body.style.overflow = 'auto';
  };

  const navigateFromMobileMenu = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-[68px] items-center justify-between sm:h-20">
          <div className="flex items-center">
            <img 
              src={ymca} 
              alt="YMCA Lagos Logo" 
              className="h-10 w-auto object-contain sm:h-12"
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
              onClick={() => {
                // Test with window.location instead of navigate
                window.location.href = '/history';
              }}
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              YMCA History
            </button>
            <button 
              onClick={() => navigate('/vision-2030')}
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              Vision 2030
            </button>
            
            
            {/* Membership Dropdown - COMMENTED OUT */}
            {/* <div className="relative">
              <button 
                onClick={() => setIsMembershipDropdownOpen(!isMembershipDropdownOpen)}
                className="text-gray-700 hover:text-red-700 font-medium transition-colors flex items-center space-x-1"
              >
                <span>Membership</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {isMembershipDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/membership-request');
                          setIsMembershipDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Membership Application
                      </button>
                      <button
                        onClick={() => {
                          navigate('/membership-login');
                          setIsMembershipDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Membership Login
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}
            
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-red-700 font-medium transition-colors border border-gray-300 px-4 py-2 rounded-lg hover:border-red-700"
            >
              Login
            </button>
            
            <button 
              onClick={() => navigate('/membership-request')}
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              Register
            </button>
            
            {/* <button 
              onClick={openDonationModal}
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              Donate
            </button> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-primary-navigation"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 6 12 12M18 6 6 18" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              id="mobile-primary-navigation"
              className="absolute inset-x-4 top-full z-50 overflow-hidden md:hidden sm:inset-x-6"
            >
              <div className="rounded-b-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-900/10 sm:p-5">
                <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Explore YMCA Lagos</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Home', '/'],
                    ['About Us', '/about-us'],
                    ['YMCA History', '/history'],
                    ['Vision 2030', '/vision-2030'],
                  ].map(([label, path]) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => navigateFromMobileMenu(path)}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-red-100 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openDonationModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                >
                  Make a Donation <span className="ml-2" aria-hidden="true">→</span>
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigateFromMobileMenu('/login')}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateFromMobileMenu('/membership-request')}
                    className="rounded-xl border border-red-700 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
    </nav>
  );
};

export default MainNavigation;
