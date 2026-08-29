import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/NewAuthContext';
import { openRemitaInlinePayment } from '../../api/remitaInline';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { fetchWithAuth, FRONTEND_URL, displayNotification } = useAuth();
  const [donationForm, setDonationForm] = useState({
    name: '',
    amount: '',
    email: '',
    redirect_url: FRONTEND_URL + '',
  });

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

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donationForm.name && donationForm.amount) {
      try {
        const response = await fetchWithAuth({
          method: 'POST',
          path: `/initiate/donation`,
          body: donationForm,
          isAthenticated: false
        });
        // Store RRR in localStorage for verification later
        if (!response?.data?.rrr) {
          throw new Error('Missing Remita RRR');
        }
        localStorage.setItem('remita_rrr', response.data.rrr);
        await openRemitaInlinePayment({
          rrr: response.data.rrr,
          scriptUrl: response.data.payment_url,
          inlineConfig: response.data.inline_config,
        });
      } catch (error: any) {
        console.error('Error processing donation:', error);
        displayNotification('error', error?.message || 'Failed to process donation');
      }
    }
  };

  const handleClose = () => {
    setDonationForm({ name: '', amount: '', email: '', redirect_url: FRONTEND_URL + '' });
    document.body.style.overflow = 'auto';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              onClick={handleClose}
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
                    onClick={handleClose}
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
  );
};

export default DonationModal;
