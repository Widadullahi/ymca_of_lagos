// Navigation.tsx - Parent component to handle both navigations
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Navigation = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Navigation - always rendered but hidden on mobile */}
      <DesktopSidebar />
      
      {/* Mobile Navigation with toggle button */}
      <MobileSidebar 
        isOpen={mobileNavOpen} 
        setIsOpen={setMobileNavOpen} 
      />
    </>
  );
};


export default Navigation;