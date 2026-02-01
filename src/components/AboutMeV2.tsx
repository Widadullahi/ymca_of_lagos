import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SocialMediaBar from '../components/navigation/SocialMediaBar';
import MainNavigation from '../components/navigation/MainNavigation';
import ImpactSection from './ImpactSection';
import vission2030 from '../assets/images/Vision-2030-logos-4-1.jpg'
import about from '../assets/images/new/142B7111.jpg'
import { useAuth } from '../context/NewAuthContext'
import theirlogo from '../assets/images/image.png'; // Make sure to import your logo
import Footer from './Footer';
import DonationModal from './modals/DonationModal';

const AboutMeV2: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  
  const openDonationModal = () => {
    setIsDonationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    document.body.style.overflow = 'auto';
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About YMCA Lagos</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Empowering young people for the African Renaissance since 1944
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">📅</span>
              <span>Founded: 1944</span>
            </div>
            <div className="hidden md:block text-yellow-300">•</div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">👥</span>
              <span>5,000+ Annual Beneficiaries</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Story & Heritage</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">A Legacy of Service</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  The YMCA of Lagos was born from the hardships of the Second World War, 
                  officially established on <strong>June 4, 1944</strong> through the efforts of 
                  Rev. Dugald Davidson and Rt. Rev. L.G. Vining. Our journey began at the 
                  "Sailors Institute" on Marina, providing spiritual and physical well-being 
                  for Allied sailors and local youth.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Through decades of movement and growth, we've maintained our commitment to 
                  developing spirit, mind, and body. Today, we continue this legacy from our 
                  permanent home at <strong>77 Awolowo Road, Ikoyi</strong>, serving as a beacon 
                  of hope and development for young people across Lagos.
                </p>
                <Link 
                  to="/history" 
                  className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors duration-300"
                >
                  Explore Our Full History
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Global Heritage</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white p-2 rounded-full mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Founded in London</h4>
                      <p className="text-gray-700 text-sm">June 6, 1844 by Sir George Williams</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white p-2 rounded-full mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Paris Basis</h4>
                      <p className="text-gray-700 text-sm">Our founding principle since 1855</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white p-2 rounded-full mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Worldwide Movement</h4>
                      <p className="text-gray-700 text-sm">Present in 120+ countries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Continuing Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                The YMCA of Lagos is a non-governmental, young people-based organization committed to 
                empowering youth for personal and community development. Founded in 1944, the YMCA of 
                Lagos has grown into a vibrant community-based organization that promotes leadership, 
                capacity-building, and civic engagement through Christian values.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With a focus on service to communities and the nation, the YMCA of Lagos provides equal 
                opportunities for all without any form of discrimination, making a significant impact 
                on over 5,000 beneficiaries annually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Image Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={about}
              alt="YMCA Lagos Team" 
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
            content: "At YMCA of Lagos, impact is at the heart of everything we do. Our mission extends beyond community programs. it's about transforming lives and creating lasting change.",
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
            content: 'Through our programmes we inspire young people to move from passive observers to active citizens who take ownership of their communities, champion social justice, and drive meaningful transformation.',
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
                <div className="text-6xl font-bold text-gray-800 mb-2">
                  {counters[index]}{stat.suffix}
                </div>
                <div className="text-2xl text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border-l-4 border-blue-600">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                YMCA of Lagos is a community-based organization that seeks to empower 
                young people for service to their immediate communities and the 
                nation without any form of discrimination.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg border-l-4 border-purple-600">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 text-white p-3 rounded-full mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Empowering young people for the African Renaissance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Christian Foundation",
                description: "Guided by the Paris Basis and Christian principles in all our work",
                icon: "⛪"
              },
              {
                title: "Youth Empowerment",
                description: "Developing young leaders for community and national service",
                icon: "🌟"
              },
              {
                title: "Inclusivity",
                description: "Serving all without discrimination based on faith, age, or background",
                icon: "🤝"
              },
              {
                title: "Excellence",
                description: "Committed to quality in program delivery and leadership",
                icon: "⭐"
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YMCA Vision 2030 Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto">
            {/* Left column */}
            <div className="flex flex-col">
              <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/KfGMl7ov2x8"
                  title="YMCA Vision 2030 - Stories from across the Movement"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[300px] object-cover"
                ></iframe>
              </div>
              <Link 
                to="/vision-2030" 
                className="block bg-red-600 text-white text-center py-4 px-6 rounded-lg hover:bg-red-700 transition-colors mt-6 font-semibold text-lg"
              >
                Read more about Vision 2030
              </Link>
            </div>

            {/* Right column */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-start mb-6">
                <img 
                  src={vission2030}
                  alt="YMCA Vision 2030 Logo"
                  className="h-24"
                />
              </div>

              <h2 className="text-4xl font-bold text-red-600 mb-6">YMCA Vision 2030</h2>

              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                In July 2022 the YMCA made history. At the 20th World Council in July 2022, 
                YMCAs across the globe voted to adopt YMCA 2030 - the first-ever shared strategy and plan.
              </p>

              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
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
          {/* <div className="flex justify-center gap-6 mt-12">
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-600 transition-colors duration-300"><FaFacebook /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-600 transition-colors duration-300"><FaInstagram /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-gray-800 transition-colors duration-300"><FaGithub /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-500 transition-colors duration-300"><FaBehance /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-red-600 transition-colors duration-300"><FaPinterest /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-blue-400 transition-colors duration-300"><FaTwitter /></a>
            <a href="#" className="text-2xl text-gray-600 hover:text-pink-500 transition-colors duration-300"><FaDribbble /></a>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <Footer openDonationModal={openDonationModal} logo={theirlogo} />

      {/* Donation Modal */}
      <DonationModal isOpen={isDonationModalOpen} onClose={closeDonationModal} />
    </div>
    </div>
  );
};

export default AboutMeV2;