import React, { useState, useEffect, useRef } from 'react';
import { FaFacebook, FaInstagram, FaGithub, FaBehance, FaPinterest, FaTwitter, FaDribbble } from 'react-icons/fa';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';
import ImpactSection from './ImpactSection';

const AboutMeV2: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [, setIsDonationModalOpen] = useState<boolean>(false);
  
  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  

  const stats2 = [
    { icon: '📊', value: 5000, label: 'Annual Beneficiaries', suffix: ' +' },
  ];

  const publications = [
    {
      id: 1,
      title: 'Admin Panel - How To Started the Dashboard Tutorial',
      description: 'We\'ve been focused on making the from also not been afraid to and step away been focused',
      author: 'Jane Miller',
      date: 'Mar 21 2021',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      title: 'Admin Panel - How To Started the Dashboard Tutorial',
      description: 'We\'ve been focused on making the from v4 to v5 but we have also not been afraid to step away been focused',
      author: 'Cris Morgan',
      date: 'Apr 14 2021',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      title: 'Admin Panel - How To Started the Dashboard Tutorial',
      description: 'We\'ve been focused on making the from v4 to v5 but we\'ve also not been afraid to step away been focused',
      author: 'Carles Nilson',
      date: 'May 14 2021',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Anne Clarc',
      position: 'Project Manager',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80'
    },
    {
      id: 2,
      name: 'Ricky Hunt',
      position: 'Art Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80'
    },
    {
      id: 3,
      name: 'Alice Wayde',
      position: 'Marketing Manager',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80'
    }
  ];
  
  // Counter animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          stats2.forEach((stat, index) => {
            const targetValue = stat.value;
            const duration = 2000; // 2 seconds
            const steps = 50;
            const stepTime = duration / steps;
            
            let current = 0;
            const increment = targetValue / steps;
            
            const timer = setInterval(() => {
              current += increment;
              if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
              }
              
              setCounters(prev => {
                const newCounters = [...prev];
                newCounters[index] = Math.floor(current);
                return newCounters;
              });
            }, stepTime);
          });
        }
      },
      { threshold: 0.1 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const [counters, setCounters] = useState(stats2.map(() => 0));

  return (
    <div className="bg-white">
      <div className="min-h-screen bg-gray-50">
      {/* Social Media Bar */}
      <SocialMediaBar />
      
      {/* Main Navigation */}
      <MainNavigation openDonationModal={openDonationModal} />
      {/* About Us Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">About Us</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            The Africa Alliance of YMCAs (AAYMCAs) stands as the continent's largest Pan-African youth membership movement, 
            uniting 17 national YMCA movements across Africa with several more in development.
          </p>

        </div>
      </section>

      {/* Team Image Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80" 
              alt="Team Meeting" 
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      </section>


      {/* Our Impact Section */}
      <ImpactSection 
        title="Our Impact"
        paragraphs={[
          {
            content: "The Africa Alliance of YMCAs (AAYMCAs) is the umbrella organization of all YMCAs in Africa, bringing together 17 YMCA National Movements across the continent with several more in formation. As the largest Pan-African youth membership Movement in Africa, our reach and impact continue to grow each year.",
            highlightedText: [
              { text: "largest Pan-African youth membership Movement", className: "text-blue-500" }
            ]
          },
          {
            content: 'Our vision is clear and powerful: "to empower young people for the African Renaissance." Guided by Christian values, we develop youth who can transform their communities, nations, and ultimately, the entire continent through holistic approaches that address the complete person.',
            highlightedText: [
              { text: '"to empower young people for the African Renaissance."', className: "font-semibold" }
            ]
          },
          {
            content: 'The AAYMCA Secretariat consists of an experienced, multi-disciplinary team providing institutional and technical support to National Movements. We focus on programme innovation and capacity development for good governance, ensuring that our impact is both sustainable and transformative. Through our "Subject to Citizen" philosophy, we\'re creating a generation of active participants who drive positive change throughout Africa.',
            highlightedText: [
              { text: "programme innovation", className: "text-blue-500 font-semibold" }
            ]
          }
        ]}
      />


      {/* Stats Section */}
      <section className="py-16 bg-gray-50" ref={statsRef}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats2.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {/* <div className="text-5xl">{stat.icon}</div> */}
                </div>
                <div className="text-6xl font-bold text-gray-800">
                  {counters[index]}{stat.suffix}
                </div>
                <div className="text-2xl text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
          

        </div>
      </section>



      {/* Mission and Vision Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
              </div>
              <p className="text-gray-600">
                YMCA of Lagos is a community-based organization that seeks to empower 
                young people for service to their immediate communities and the 
                nation without any form of discrimination.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
              </div>
              <p className="text-gray-600">
                Empowering young people for the African Renaissance.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Publications Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Publications</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Our goal is to provide a complete and robust theme solution
            to boost all of our customer's project deployments
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publications.map(pub => (
              <div key={pub.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={pub.image} 
                  alt={pub.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{pub.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pub.description}</p>
                  <div className="text-sm text-gray-500">
                    {pub.author} on {pub.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Our Great Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            It's no doubt that when a development takes longer to complete, additional costs to
            integrate and test each extra feature creeps up and haunts most of us.
          </p>
          
          <div className="relative">
            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
              <span className="text-2xl">&lt;</span>
            </button>
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
              <span className="text-2xl">&gt;</span>
            </button>
            
            {/* Team Members */}
            <div className="flex justify-center gap-8 overflow-hidden">
              {teamMembers.map(member => (
                <div key={member.id} className="text-center w-64">
                  <div className="mb-4 relative">
                    <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">{member.name}</h3>
                  <p className="text-gray-500">{member.position}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mt-12">
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-600"><FaFacebook /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-600"><FaInstagram /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-gray-800"><FaGithub /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-500"><FaBehance /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-red-600"><FaPinterest /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-400"><FaTwitter /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-500"><FaDribbble /></a>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default AboutMeV2;