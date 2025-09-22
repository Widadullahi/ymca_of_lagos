import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ymca from '../../assets/images/image.png';

interface MainNavigationProps {
  openDonationModal: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ openDonationModal }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMembershipDropdownOpen, setIsMembershipDropdownOpen] = useState<boolean>(false);

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

  return (
    <nav className="bg-white">
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
            
            {/* Membership Dropdown */}
            <div className="relative">
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
                        className="w-full px-4 py-2 text-left text-gray-700  hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Membership Login
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
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
                
                {/* Mobile Membership Options */}
                <div className="pl-2">
                  <div className="text-gray-700 font-medium mb-2">Membership</div>
                  <div className="pl-4 space-y-2">
                    <button 
                      onClick={() => {
                        navigate('/membership-request');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-gray-600 hover:text-red-700 transition-colors text-left"
                    >
                      Membership Request
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/membership-login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-gray-600 hover:text-red-700 transition-colors text-left"
                    >
                      Membership Login
                    </button>
                  </div>
                </div>
                
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
  );
};

export default MainNavigation;