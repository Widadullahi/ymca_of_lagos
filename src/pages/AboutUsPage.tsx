import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CoreValue from '../components/CoreValue';
import ymca from '../assets/images/image.png'
import { useAuth } from '../context/NewAuthContext';

const AboutUsPage: React.FC = () => {

  const { fetchWithAuth} = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [membersCount, setMembersCount] = useState<number>(0);
    const navigate = useNavigate()
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

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };


  const facilities = [
    {
      title: "Camp Facility",
      description: "A space dedicated to youth camps, retreats, and leadership training.",
      icon: "🏕️"
    },
    {
      title: "Transient Hostel",
      description: "Affordable accommodation services for individuals and groups on transit.",
      icon: "🏨"
    },
    {
      title: "Basketball Court",
      description: "Promoting physical fitness, teamwork, and sportsmanship through recreational activities.",
      icon: "🏀"
    },
    {
      title: "Multi-Purpose Hall",
      description: "A space dedicated to implementing various programmes.",
      icon: "🏛️"
    }
  ];


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetchWithAuth({
          method: 'GET',
          path: `/total-members-count`,
          isAthenticated:false
        });
        // handle response (e.g., set state)
        setMembersCount(response?.data?.count || 0)
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    fetchMembers();
  }, []); // rerun when `page` changes


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
                  {/* <button 
                    onClick={() => {
                      openDonationModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-left w-fit"
                  >
                    Donate
                  </button> */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About YMCA Lagos</h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              Empowering young people for the African Renaissance since 1904
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">📅</span>
                <span>Founded: 1904</span>
              </div>
              <div className="hidden md:block text-yellow-300">•</div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">👥</span>
                <span>2,000+ Annual Beneficiaries</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={slideInLeft} className="space-y-8">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-red-600 text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Empowering young people for the African Renaissance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  YMCA of Lagos is a community-based organization that seeks to empower young people for service to their immediate communities and the nation without any form of discrimination.
                </p>
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-8 rounded-3xl text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Our Impact</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">Members count</span>
                    <span className="text-3xl font-bold">{membersCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <CoreValue />

      {/* Facilities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              State-of-the-art facilities designed to support youth development and community engagement
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                variants={slideInLeft}
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{facility.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{facility.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{facility.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programmes Section */}


      {/* Commitment Section */}
      <section className="py-20 bg-red-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8">Our Commitment</h2>
            <p className="text-xl leading-relaxed mb-8">
              YMCA of Lagos is committed to developing young leaders who will drive positive change in their communities and nation. Guided by Christian principles, we strive to promote equality, respect, and social responsibility in all aspects of our work.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-red-700 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Join Our Mission
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Visit Us</h3>
              <p className="text-gray-400">
                YMCA Lagos<br />
                77Awolowo road, Ikoyi, Lagos, Nigeria
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Our Programs</h3>
              <p className="text-gray-400">
                Leadership Development<br />
                Community Service<br />
                Youth Empowerment
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                Email:  info@ymcaoflagos.org<br />
                Phone: Hostel 08102977099 Admin: 09026802928 Programmes: 09026114628
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2025 YMCA Lagos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUsPage;