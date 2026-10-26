// Navigation.tsx - Parent component to handle both navigations
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

interface NavigationProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (isOpen: boolean) => void;
}

const Navigation = ({ mobileNavOpen, setMobileNavOpen }: NavigationProps) => {
  const location = useLocation();

  // Close mobile nav when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Navigation - always rendered but hidden on mobile */}
      <DesktopSidebar />
      
      {/* Mobile drawer controlled by the header button */}
      <MobileSidebar 
        isOpen={mobileNavOpen} 
        setIsOpen={setMobileNavOpen} 
      />
    </>
  );
};


export default Navigation;
