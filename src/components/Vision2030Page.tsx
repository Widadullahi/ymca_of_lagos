import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';

// Import your assets
import theirlogo from '../assets/images/image.png';
import vision2030Logo from '../assets/images/Vision-2030-logos-4-1.jpg';
import vision2030Pdf from '../assets/pdf/YMCA_Vision2030_Endorsed.pdf';
import practicalGuidePdf from '../assets/pdf/Practical-Guide-for-YMCAs.pdf';
import Footer from './Footer';

const Vision2030Page: React.FC = () => {
  const [, setIsDonationModalOpen] = useState<boolean>(false);
  
  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleDownloadPdf = (pdfUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pillars = [
    {
      icon: '💙',
      title: 'Community Wellbeing',
      description: 'We nurture young people in body, mind and spirit through comprehensive programs that promote holistic development.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '💼',
      title: 'Meaningful Work',
      description: 'Supporting worthwhile jobs and sustainable livelihoods through skills development and entrepreneurship programs.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🌍',
      title: 'Sustainable Planet',
      description: 'We advocate for environmental awareness and support sustainable solutions in Lagos communities.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '⚖️',
      title: 'Just World',
      description: 'Amplifying youth voices and actions in communities through advocacy and civic engagement initiatives.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const testimonials = [
    {
      name: 'Rafika Malunga',
      role: 'Zambia YMCA',
      content: 'The capacity-building trainings boosted my skills as a youth leader, helping me apply models like S2C and human-centered design to drive change. I\'m committed to being a Change Agent who uplifts youth voices and advocates for a just world.'
    },
    {
      name: 'Chinedu Okoro',
      role: 'Lagos YMCA Youth Leader',
      content: 'Vision 2030 has transformed our approach to community service. The four pillars provide a clear framework for creating sustainable impact in Lagos communities.'
    },
    {
      name: 'Amina Yusuf',
      role: 'YMCA Lagos Volunteer',
      content: 'Through the Sustainable Planet initiatives, we\'ve engaged over 500 young people in climate action projects across Lagos, creating real environmental change.'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Social Media Bar */}
      <SocialMediaBar />
      
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Vision 2030</h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Empowering Young People for the African Renaissance
              </p>
              <p className="text-lg opacity-90 max-w-2xl">
                YMCA of Lagos is proud to be part of the global YMCA Vision 2030 - 
                the first-ever shared strategy uniting YMCAs worldwide to create 
                lasting positive change.
              </p>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 flex justify-center"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <img 
                src={vision2030Logo}
                alt="YMCA Vision 2030"
                className="max-w-md w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is Vision 2030 Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">What is Vision 2030?</h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                In July 2022, the YMCA made history. At the 20th World Council, YMCAs across the globe 
                voted to adopt YMCA Vision 2030 - the first-ever shared strategy and plan that unites 
                our global movement around common goals and impact areas.
              </p>
              <p>
                For YMCA of Lagos, Vision 2030 represents our commitment to scaling impact and 
                empowering young people across Lagos State to drive the African Renaissance forward.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Global Impact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center mb-4">Witness Our Global Impact</h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Experience the inspiring stories of YMCAs worldwide—from supporting refugees and 
              empowering youth to fostering mental health and sustainability.
            </p>

            <div className="bg-gray-100 rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Stories, Real Impact</h3>
                  <p className="text-gray-700 mb-6">
                    These powerful films showcase real impact across the four pillars of Vision 2030, 
                    as screened at the Accelerator Summit in Mombasa, October 2024.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleDownloadPdf(vision2030Pdf, 'YMCA_Vision2030_Endorsed.pdf')}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Read Vision 2030
                    </button>
                    <button 
                      onClick={() => handleDownloadPdf(practicalGuidePdf, 'Practical-Guide-for-YMCAs.pdf')}
                      className="w-full border-2 border-red-600 text-red-600 py-3 px-6 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-semibold"
                    >
                      Download the Practical Guide on Implementing Vision 2030
                    </button>
                  </div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/KfGMl7ov2x8"
                    title="YMCA Vision 2030 Impact Stories"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 md:h-80"
                  ></iframe>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Four Pillars of Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To achieve Vision 2030, YMCA of Lagos will focus on four strategic areas and work toward 12 strategic goals.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={slideInLeft}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`bg-gradient-to-r ${pillar.color} p-6 text-white text-center`}>
                  {/* <div className="text-4xl mb-4">{pillar.icon}</div> */}
                  <h3 className="text-xl font-bold">{pillar.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-6">{pillar.description}</p>
                  <button className="flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors">
                    
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">YOUTH TESTIMONIALS</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={slideInLeft}
                className="bg-gray-50 p-6 rounded-xl shadow-md"
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-red-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="mt-4 text-right">
                  <span className="text-red-600 text-2xl">›</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Africa Renaissance Hub Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Africa Renaissance Hub</h2>
            <p className="text-xl mb-8 opacity-90">
              Join us in building the future of Africa through youth empowerment and sustainable development
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Learn More About Africa Renaissance
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
                Get Involved
              </button>
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer openDonationModal={openDonationModal} logo={theirlogo} />
    </div>
  );
};

export default Vision2030Page;