import React, { useState, useEffect, useRef } from 'react';
import { FaFacebook, FaInstagram, FaGithub, FaBehance, FaPinterest, FaTwitter, FaDribbble } from 'react-icons/fa';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';
import ImpactSection from './ImpactSection';
import vission2030 from '../assets/images/Vision-2030-logos-4-1.jpg'
import about from '../assets/images/aboutus.jpg'
import { useAuth } from '../context/NewAuthContext'




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

  type StaffMember = {
    id: string;
    name: string;
    position: string;
    image: string | null;
  };

  const { fetchWithAuth } = useAuth();

  const [principalOfficers, setPrincipalOfficers] = useState<StaffMember[]>([]);
  const [managementStaff, setManagementStaff] = useState<StaffMember[]>([]);
  const [, setLoadingStaff] = useState<boolean>(false);
  const [, setStaffError] = useState<string | null>(null);

  // Color palettes: ensure Tailwind sees these class strings
  const principalColorClasses = [
    { border: 'border-green-200', text: 'text-green-600' },
    { border: 'border-blue-200', text: 'text-blue-600' },
    { border: 'border-teal-200', text: 'text-teal-600' },
    { border: 'border-indigo-200', text: 'text-indigo-600' },
    { border: 'border-emerald-200', text: 'text-emerald-600' },
    { border: 'border-cyan-200', text: 'text-cyan-600' },
    { border: 'border-sky-200', text: 'text-sky-600' },
    { border: 'border-lime-200', text: 'text-lime-600' },
    { border: 'border-amber-200', text: 'text-amber-600' },
    { border: 'border-orange-200', text: 'text-orange-600' },
  ];

  const managementColorClasses = [
    { border: 'border-purple-200', text: 'text-purple-600' },
    { border: 'border-pink-200', text: 'text-pink-600' },
    { border: 'border-violet-200', text: 'text-violet-600' },
    { border: 'border-fuchsia-200', text: 'text-fuchsia-600' },
    { border: 'border-rose-200', text: 'text-rose-600' },
    { border: 'border-orange-200', text: 'text-orange-600' },
    { border: 'border-amber-200', text: 'text-amber-600' },
  ];

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      setStaffError(null);
      let principal: any[] = [];
      let management: any[] = [];

      // Try dedicated endpoints first
      try {
        const principalRes = await fetchWithAuth({ method: 'GET', path: '/staff/principal-officers/', isAthenticated: false });
        principal = principalRes?.data || [];
      } catch (e) {
        // Fallback to viewset with category filter
        const principalRes = await fetchWithAuth({ method: 'GET', path: '/staff/', queryParams: { category: 'principal_officer' }, isAthenticated: false });
        principal = principalRes?.data || principalRes?.results || principalRes || [];
      }

      try {
        const managementRes = await fetchWithAuth({ method: 'GET', path: '/staff/management-staff/', isAthenticated: false });
        management = managementRes?.data || [];
      } catch (e) {
        const managementRes = await fetchWithAuth({ method: 'GET', path: '/staff/', queryParams: { category: 'management_staff' }, isAthenticated: false });
        management = managementRes?.data || managementRes?.results || managementRes || [];
      }

      setPrincipalOfficers(principal);
      setManagementStaff(management);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffError('Failed to load staff');
    } finally {
      setLoadingStaff(false);
    }
  };
  
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

  useEffect(() => {
    fetchStaff();
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
            The YMCA of Lagos is a non-governmental, young people-based organization committed to empowering youth for personal and community development. Founded in 1904, the YMCA of Lagos has grown into a vibrant community-based organization that promotes leadership, capacity-building, and civic engagement through Christian values. With a focus on service to communities and the nation, the YMCA of Lagos provides equal opportunities for all without any form of discrimination, making a significant impact on over 2,000 beneficiaries annually.
          </p>
          {/* <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Rooted in over a century of global YMCA tradition, we embody values of youth empowerment, community service, inclusivity, and social responsibility. Our programs are designed to meet the diverse needs of today’s youth — providing a platform where young people can learn, grow, and become agents of positive change in their communities.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            We work through a variety of initiatives that promote education, health, civic engagement, entrepreneurship, and spiritual growth. By focusing on holistic development — mind, body, and spirit — the YMCA of Lagos continues to shape individuals who contribute meaningfully to society and uphold strong ethical and moral standards.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            As part of the African Alliance of YMCAs (AAYMCA), our movement connects with 17 national YMCA bodies across the continent, with more emerging every year. Together, we share a bold vision: “Empowering young people for the African Renaissance.”
          </p> */}
        </div>
      </section>



      {/* Team Image Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={about}
              alt="Team Meeting" 
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px', maxWidth:'1500px' }}
            />
          </div>
        </div>
      </section>


      {/* Our Impact Section */}
      <ImpactSection 
        title="Our Impact"
        paragraphs={[
          {
            content: "At YMCA of Lagos, impact is at the heart of everything we do. Our mission extends beyond community programs — it’s about transforming lives and creating lasting change.",
            highlightedText: [
              { text: "YMCA of Lagos", className: "font-semibold" }
            ]
          },
          {
            content: 'Through leadership training, skill development workshops, youth advocacy, and outreach initiatives, we equip young people with the confidence and tools to lead in their communities and beyond.',
            highlightedText: [
              { text: 'leadership training, skill development workshops, youth advocacy, and outreach initiatives', className: "font-semibold" }
            ]
          },
          {
            content: 'The YMCA of Lagos Secretariat is powered by a passionate, multi-disciplinary team dedicated to sustaining excellence in program design, implementation, and governance. With a strong commitment to accountability and innovation, we continuously expand our reach and deepen our impact across Lagos and Nigeria.',
            highlightedText: [
              { text: "YMCA of Lagos Secretariat", className: " font-semibold" }
            ]
          },
          {
            content: 'Through our guiding philosophy, “Subject to Citizen,” we inspire young people to move from passive observers to active citizens — individuals who take ownership of their communities, champion social justice, and drive meaningful transformation.',
            highlightedText: [
              { text: "Subject to Citizen,", className: " font-semibold" }
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
      {/* <section className="py-16">
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
      </section> */}

      {/* YMCA Vision 2030 Section */}
          <section className="py-8 bg-white">
          <div className="container mx-auto px-4">

            {/* Equal height columns */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch">

              {/* Left column */}
              <div className="flex flex-col">
                <div className="flex-1">
                  <iframe
                    src="https://www.youtube.com/embed/KfGMl7ov2x8"
                    title="YMCA Vision 2030 - Stories from across the Movement"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full object-cover"
                  ></iframe>
                </div>

                <a 
                  href="#" 
                  className="block bg-red-600 text-white text-center py-3 rounded-none hover:bg-red-700 transition-colors mt-4"
                >
                  Read more about vision 2030
                </a>
              </div>

              {/* Right column */}
              <div>
                <div className="flex justify-start mb-4">
                  <img 
                    src={vission2030}
                    alt="YMCA Vision 2030 Logo"
                    className="h-20"
                  />
                </div>

                <h2 className="text-4xl font-bold text-red-600 mb-4">YMCA Vision 2030</h2>

                <p className="text-gray-700 mb-4 text-base">
                  In July 2022 the YMCA made history. At the 20th World Council in July 2022, 
                  YMCAs across the globe voted to adopt YMCA 2030 - the first-ever shared strategy and plan.
                </p>

                <p className="text-gray-700 mb-6 text-base">
                  In 2024, we made a series of films showcasing real impact across the four Pillars 
                  of YMCA Vision 2030. We screened them at the Accelerator Summit in Mombasa, 
                  and you can see them all on the Pillar pages of this website.
                </p>
              </div>

            </div>

          </div>
        </section>



      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Our Great Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Meet the dedicated leaders and professionals who drive our mission forward at YMCA of Lagos.

          </p>
          

          {/* Principal Officers */}
          {principalOfficers.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-center mb-8 text-green-800">Principal Officers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {principalOfficers.map((member, idx) => {
                  const color = principalColorClasses[idx % principalColorClasses.length];
                  return (
                  <div key={member.id} className="text-center bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-4 relative">
                      <div className={`w-40 h-40 mx-auto rounded-full overflow-hidden bg-gray-200 border-4 ${color.border} shadow-lg`}>
                        <img 
                          src={member?.image || ''} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{member.name}</h4>
                    <p className={`${color.text} font-medium`}>{member.position}</p>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Management Staff */}
          {managementStaff.length > 0 && (
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-center mb-8 text-purple-800">Management Staff</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {managementStaff.map((member, idx) => {
                  const color = managementColorClasses[idx % managementColorClasses.length];
                  return (
                  <div key={member.id} className="text-center bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-3 relative">
                      <div className={`w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 border-3 ${color.border} shadow-md`}>
                        <img 
                          src={member?.image || ''} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h4 className="font-bold text-base mb-1">{member.name}</h4>
                    <p className={`${color.text} text-sm font-medium`}>{member.position}</p>
                  </div>
                )})}
              </div>
            </div>
          )}
          
          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mt-12">
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-600 transition-colors duration-300"><FaFacebook /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-600 transition-colors duration-300"><FaInstagram /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-gray-800 transition-colors duration-300"><FaGithub /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-500 transition-colors duration-300"><FaBehance /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-red-600 transition-colors duration-300"><FaPinterest /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-400 transition-colors duration-300"><FaTwitter /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-500 transition-colors duration-300"><FaDribbble /></a>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default AboutMeV2;