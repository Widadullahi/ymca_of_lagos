import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SocialMediaBar from './navigation/SocialMediaBar';
import MainNavigation from './navigation/MainNavigation';

// You'll need to import your logo
import theirlogo from '../assets/images/logo.png';

const HistoryPage: React.FC = () => {
  const [, setIsDonationModalOpen] = React.useState<boolean>(false);
  
  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
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

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Historical timeline data
  const timelineEvents = [
    {
      year: '1844',
      title: 'Global YMCA Founded',
      description: 'The Young Men\'s Christian Association was founded on June 6, 1844 in London by Sir George Williams and eleven other young men.',
      type: 'global'
    },
    {
      year: '1855',
      title: 'Paris Basis Established',
      description: 'First World Convention held in Paris, France, where the foundational "Paris Basis" was adopted as the movement\'s guiding principle.',
      type: 'global'
    },
    {
      year: '1944',
      title: 'YMCA of Lagos Born',
      description: 'Inaugural meeting held on June 4, 1944 at the Bishop\'s Court, led by Rev. Dugald Davidson and Rt. Rev. L.G. Vining.',
      type: 'local'
    },
    {
      year: '1944-1960s',
      title: 'Early Locations',
      description: 'Moved between multiple locations: Sailors Institute, Baptist Academy, Methodist Boys High School, and Onikan Community Centre.',
      type: 'local'
    },
    {
      year: '1966',
      title: 'Romney Hall Commissioned',
      description: 'First permanent headquarters at Romney Hall on Awolowo Road, Ikoyi, donated by British YMCA.',
      type: 'local'
    },
    {
      year: '1973',
      title: 'Kampala Principles',
      description: 'World conference in Kampala, Uganda adopted principles interpreting the Paris Basis for modern times.',
      type: 'global'
    },
    {
      year: 'Present',
      title: 'Current Headquarters',
      description: 'Permanent home at 77 Awolowo Road, Ikoyi, continuing the legacy of youth empowerment.',
      type: 'local'
    }
  ];

  const globalFounders = [
    'Sir George Williams (Leader)',
    'C.W. Smith',
    'Norton Smith',
    'Edward Valentine',
    'Edward Beaumont',
    'M. Glasson',
    'William Creese',
    'Francis John Cockett',
    'E. Rogers',
    'John Harvey',
    'John C. Symons',
    'James Smith'
  ];

  const lagosFounders = {
    clergy: [
      'Rev. Dugald Davidson (British YMCA Welfare Officer)',
      'Rt. Rev. L.G. Vining (Bishop of Lagos)',
      'Rev. C.P. Hughes',
      'Sir John Verity (Chief Justice of Nigeria)'
    ],
    firstOfficers: [
      'Chairman: Mr. W.Z. Coker Dickens (Roman Catholic)',
      'Secretary: Mr. J.A. Adegbite (Baptist)',
      'Treasurer: Mr. E.K.K. Pecku',
      'Financial Secretary: Mr. J.M. Caulcrick',
      'Welfare Officer: Mr. J.E.T. Pecku (Methodist)'
    ],
    resuscitationCommittee: [
      'Mr. J.M. Caulcrick',
      'Mr. E.A. Odunlami',
      'Engr. E.O. Ogundiya',
      'Chief E. Abayomi Fajobi',
      'Mr. E.B. Bankole',
      'Mr. E.O. Idowu'
    ]
  };

  const earlyActivities = [
    'Sing song on Sunday nights at YWCA Hostel',
    'Nativity Plays at CMS Grammar School Hall',
    'Moonlight Picnics at Tarkwa Bay and Kuramo Waters',
    'Moonlight Dance at Foresters Hall (Last Friday of every month)',
    'Fun fair/Raffle Draw events',
    'Quiz Competitions and Debates',
    'Musical Evenings at British Council'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Social Media Bar */}
      <SocialMediaBar />
      
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-800 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our History</h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              A legacy of faith, service, and youth empowerment since 1844
            </p>
            <div className="flex justify-center">
              <Link 
                to="/about" 
                className="bg-white text-red-700 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors duration-300 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to About
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Global Origins Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Global Origins</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The YMCA movement began with a simple but powerful vision to support young men during the Industrial Revolution
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={slideInLeft}>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">The Founding Vision</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    On <strong>June 6, 1844</strong>, in the city of London, draper <strong>George Williams</strong> 
                    (later Sir George Williams) and eleven other young men established the Young Men's Christian Association. 
                    Their primary aim was to meet the religious and social needs of young men in the growing cities of Great Britain.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Though they didn't anticipate worldwide expansion, the YMCA pattern spontaneously spread through 
                    British migrants and visitors to London, reaching global proportions within just ten years.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={slideInRight}>
                <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold text-yellow-300 mb-6">The Twelve Founders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {globalFounders.map((founder, index) => (
                      <div key={index} className="flex items-center space-x-2 py-1">
                        <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                        <span className="text-sm">{founder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founding Principles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div variants={slideInLeft}>
                <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-600">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">The Paris Basis (1855)</h3>
                  <blockquote className="text-gray-700 italic leading-relaxed mb-4">
                    "The Young Men's Christian Associations seek to unite those young men who, regarding 
                    Jesus Christ as their God and Saviour according to the Holy Scriptures, desire to be 
                    His disciples in their faith and in their life, and to associate their efforts for 
                    the extension of His Kingdom among young men."
                  </blockquote>
                  <p className="text-gray-600 text-sm">
                    Adopted at the first World Convention in Paris, France - 1855
                  </p>
                </div>
              </motion.div>

              <motion.div variants={slideInRight}>
                <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-600">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Kampala Principles (1973)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      Adopted in Kampala, Uganda as modern interpretations of the Paris Basis:
                    </p>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Work for equal opportunity and justice for all
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Maintain relationships characterized by love and understanding
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        Work for conditions that allow honesty, depth and creativity
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* YMCA Lagos History Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">YMCA of Lagos Story</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Born from wartime needs, sustained by visionary leadership
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <motion.div variants={slideInLeft}>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">The Inauguration</h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The YMCA of Lagos was established on <strong>June 4, 1944</strong> during the Second World War. 
                    The British YMCA sent <strong>Rev. Dugald Davidson</strong> as a welfare officer to support Allied 
                    sailors berthing in Lagos and Apapa ports.
                  </p>
                  <p>
                    With the support of <strong>Rt. Rev. L.G. Vining</strong>, then Bishop of Lagos, circulars were 
                    dispatched to heads of various churches in Lagos area. Twelve youth representatives from Baptist, 
                    Methodist, Anglican, and Catholic missions attended the inaugural meeting at the Bishop's Court.
                  </p>
                  <p>
                    The first meetings were held at the "Sailors Institute" on Marina (now PZ Building), which provided 
                    space for meetings, indoor games, and a canteen during the challenging war years.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={slideInRight}>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Early Activities & Challenges</h3>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The early YMCA of Lagos provided much-needed recreation and community during the war, 
                    offering activities that developed spirit, mind, and body:
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {earlyActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-red-50 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Founders Grid */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Founding Leaders</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Clergy & Supporters</h4>
                  <div className="space-y-2">
                    {lagosFounders.clergy.map((person, index) => (
                      <p key={index} className="text-gray-700 text-sm">{person}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">First Elected Officers</h4>
                  <div className="space-y-2">
                    {lagosFounders.firstOfficers.map((officer, index) => (
                      <p key={index} className="text-gray-700 text-sm">{officer}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Resuscitation Committee</h4>
                  <div className="space-y-2">
                    {lagosFounders.resuscitationCommittee.map((member, index) => (
                      <p key={index} className="text-gray-700 text-sm">{member}</p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Historical Timeline */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Historical Timeline</h2>
              <p className="text-xl text-gray-300">Key milestones in our journey</p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-red-600 h-full"></div>
              
              {/* Timeline events */}
              <div className="space-y-12">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className={`bg-white text-gray-900 p-6 rounded-lg shadow-lg ${
                        event.type === 'global' ? 'border-l-4 border-blue-600' : 'border-l-4 border-red-600'
                      }`}>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${
                          event.type === 'global' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.type === 'global' ? 'Global YMCA' : 'YMCA Lagos'}
                        </span>
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-700">{event.description}</p>
                      </div>
                    </div>
                    
                    {/* Year marker */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
                    
                    {/* Year label */}
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8 text-right'}`}>
                      <span className="text-2xl font-bold text-yellow-300">{event.year}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-20 bg-red-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8">Continuing the Legacy</h2>
            <p className="text-xl leading-relaxed mb-8">
              From our humble beginnings at the Sailors Institute to our current home at 77 Awolowo Road, Ikoyi, 
              the YMCA of Lagos continues to honor the vision of our founders. We remain committed to developing 
              young leaders, guided by the Paris Basis and Kampala Principles, serving our community without discrimination.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/about" 
                className="bg-white text-red-700 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                Learn About Our Work Today
              </Link>
              <button className="border-2 border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white hover:text-red-700 transition-colors duration-300">
                Become Part of Our Story
              </button>
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
            <a 
              href="#"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Donate
            </a>

            {/* Language - commented out as per your code */}
            {/* <div className="mt-6 md:mt-0 flex items-center space-x-2">
              🌍 
              <select className="bg-black border border-gray-700 px-3 py-2 text-gray-300">
                <option>EN</option>
                <option>FR</option>
              </select>
            </div> */}
          </div>

          {/* Bottom line */}
          <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400">
            © 2025 YMCA Lagos. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HistoryPage;