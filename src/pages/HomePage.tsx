import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import CoreValue from '../components/CoreValue.js';
import Programme from '../components/Programme.js';
import ymcaHeroImage from '../assets/images/ymca-world.png';
import theirlogo from '../assets/images/logo.png';
import LatestNews from '../components/LatestNews.js';
import HeroSectionS2 from '../components/HeroSectionS2';
import WhoAreWe from '../components/WhoAreWe.js';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';
import vision2030Logo from '../assets/images/Vision-2030-logos-4-1.jpg';

interface Quote {
  id: string;
  text: string;
  author: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchWithAuth, FRONTEND_URL, displayNotification } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [donationForm, setDonationForm] = useState({
    name: '',
    amount: '',
    email: '',
    redirect_url: FRONTEND_URL + '',
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
    setDonationForm({ name: '', amount: '', email: '', redirect_url: FRONTEND_URL + '', });
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
        displayNotification('error', 'Failed to load churches',);
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  // Quick Links data - moved after function definitions
  const [quickLinks] = useState(() => [
    { 
      title: 'About Us', 
      description: 'Learn about our rich history, mission, and the team behind YMCA Lagos', 
      link: '/about-us', 
      icon: '🏛️',
      image: '/images/about-us-preview.jpg'
    },
    { 
    title: 'Vision 2030', 
    description: 'The Four Pillars of Impact: To achieve Vision 2030, YMCA of Lagos will focus on four strategic areas and work toward 12 strategic goals.', 
    link: '/vision-2030', 
    icon: '🌍',
    image: '/images/vision-2030-preview.jpg'
  },
    { 
      title: 'YMCA History', 
      description: 'Explore our journey from 1844 to present day across the globe', 
      link: '/history', 
      icon: '📜',
      image: '/images/history-preview.jpg'
    },
    { 
      title: 'Donate', 
      description: 'Support our mission and make a difference in young lives', 
      link: '#donate', 
      icon: '❤️',
      image: '/images/donate-preview.jpg',
      action: openDonationModal
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Social Media Bar */}
      <SocialMediaBar />
      
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />
      
      {/* Hero Section S2 */}
      <HeroSectionS2 
        title="Welcome to YMCA of Lagos"
        subtitle="We are part of the worldwide YMCA movement and Africa's largest Pan-African youth membership network, committed to empowering young people for the African Renaissance. Through holistic development, leadership training, and community transformation, we nurture the potential of every individual to create lasting impact across Lagos, Nigeria, and beyond."
        primaryButtonText="Membership Application"
        secondaryButtonText="Make Donation"
        primaryButtonLink="/membership-request"
        secondaryButtonAction={openDonationModal}
        imageSrc={ymcaHeroImage}
        imageAlt="Patient with healthcare provider"
      />

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      <LatestNews />

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore YMCA Lagos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our programs, learn about our mission, and find ways to get involved in our vibrant community
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => link.action ? link.action() : navigate(link.link)}
              >
                {/* Image Container */}
                <div className="h-32 bg-gradient-to-br from-red-100 to-red-200 relative overflow-hidden">
                  {link.image ? (
                    <img 
                      src={link.image} 
                      alt={link.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{link.icon}</span>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start mb-3">
                    <span className="text-2xl mr-3">{link.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {link.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {link.description}
                  </p>
                  <div className="flex items-center text-red-600 font-semibold text-sm group-hover:text-red-700 transition-colors">
                    Learn More
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/about-us')}
              className="border-2 border-red-600 text-red-600 font-bold py-3 px-8 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              Explore All Sections
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <WhoAreWe buttonVariants={buttonVariants}/>

      <CoreValue />

      {/* Vision 2030 Preview Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold mb-6">YMCA Vision 2030</h2>
              <p className="text-xl mb-6 opacity-90">
                Join us in the global movement to empower young people and create lasting positive change across Africa and beyond.
              </p>
              <p className="mb-8 opacity-90">
                Discover how YMCA of Lagos is implementing the four pillars of Vision 2030 to drive sustainable development and youth empowerment.
              </p>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/vision-2030')}
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Vision 2030
              </motion.button>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <img 
                src={vision2030Logo} 
                alt="YMCA Vision 2030" 
                className="max-w-md w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

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
      
      <Programme />

      {/* Emergency/Urgent CTA Section */}
      <section className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-4">Urgent Support Needed</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto opacity-90">
              Your donation today can transform a young person's life. Help us continue our vital work in youth empowerment and community development.
            </p>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={openDonationModal}
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              Donate Now
            </motion.button>
          </motion.div>
        </div>
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
              Come and be part of our family. We welcome everyone, regardless of where you are on your journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/membership-request')}
                className="bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-800 transition-colors"
              >
                Become a Member
              </motion.button>
              
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/about-us')}
                className="border-2 border-red-700 text-red-700 font-bold py-3 px-8 rounded-full hover:bg-red-700 hover:text-white transition-colors"
              >
                Learn More About Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-14">
        <div className="container mx-auto px-4">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Column 1 - About */}
            <div>
              <img 
                src={theirlogo}
                alt="YMCA Logo"
                className="h-12 mb-6"
              />
              <p className="text-gray-400 leading-relaxed">
                77 Awolowo Road, Ikoyi, Lagos, Nigeria
              </p>
            </div>

            {/* Column 2 - Jump To */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Jump to...</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Latest News</li>
                <li>Who we are</li>
                <li>Our core values</li>
                <li>Words of wisdom</li>
                <li>Programmes & Committees</li>
              </ul>
            </div>

            {/* Column 3 - Join Us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Join us...</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Membership</li>
                <li>Partnerships</li>
                <li>Volunteer</li>
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get in touch...</h3>
              <p className="flex items-center space-x-3 text-gray-300">
                <span>📞</span>
                <span>Hostel: 08102977099</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300 mt-2">
                <span>📞</span>
                <span>Admin: 09026802928</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300 mt-2">
                <span>📞</span>
                <span>Programmes: 09026114628</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300 mt-2">
                <span>✉️</span>
                <span>info@ymcaoflagos.org</span>
              </p>
            </div>
          </div>

          {/* CTA + Bottom Section */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center">
            {/* Red CTA Button */}
            <button 
              onClick={openDonationModal}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold transition-colors duration-300"
            >
              Donate
            </button>
          </div>

          {/* Bottom line */}
          <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400">
            © 2025 YMCA Lagos. All rights reserved.
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