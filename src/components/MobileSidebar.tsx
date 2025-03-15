// MobileSidebar.tsx
import { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { MdOutlinePeopleAlt ,MdOutlineNewspaper} from "react-icons/md";
import NavItem from './NavItem';
import { useAuth } from '../context/NewAuthContext';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();

  // Handle logout
  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out...');
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebarRef.current || !triggerRef.current) return;
      if (
        !isOpen ||
        sidebarRef.current.contains(target as Node) ||
        triggerRef.current.contains(target as Node)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [isOpen, setIsOpen]);

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!isOpen || keyCode !== 27) return;
      setIsOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Mobile Toggle Button - Always visible on mobile */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-controls="mobile-sidebar"
        aria-expanded={isOpen}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
      >
        {isOpen ? (
          // X icon when open
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.833 5.346L14.654 4.167L10 8.821L5.346 4.167L4.167 5.346L8.821 10L4.167 14.654L5.346 15.833L10 11.179L14.654 15.833L15.833 14.654L11.179 10L15.833 5.346Z"
              fill=""
            />
          </svg>
        ) : (
          // Hamburger icon when closed
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1H19M1 9H19M1 17H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-0 z-40 lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
        
        {/* Sidebar content */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white overflow-y-auto transform transition-transform duration-300 ease-in-out">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <NavLink to="/" className="text-xl font-bold" onClick={() => setIsOpen(false)}>
              YMCA
            </NavLink>
            <button onClick={() => setIsOpen(false)} className="p-2">
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.833 5.346L14.654 4.167L10 8.821L5.346 4.167L4.167 5.346L8.821 10L4.167 14.654L5.346 15.833L10 11.179L14.654 15.833L15.833 14.654L11.179 10L15.833 5.346Z"
                  fill=""
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6">
            <ul className="flex flex-col gap-1">
              {user?.role == "Member" ? (
                <>
                <NavItem to="/dashboard" icon={<GoHome />} label="Home" />
                <NavItem to="/updates" icon={<MdOutlineNewspaper />} label="Updates" />
                </>
              ): (
                <>
                <NavItem to="/admin/dashboard" icon={<GoHome />} label="Home A" />
                <NavItem to="/admin/users" icon={<MdOutlinePeopleAlt />} label="Members A" />
                <NavItem to="/admin/updates" icon={<MdOutlineNewspaper />} label="Updates A" />
                </>
              )}
              {/* Collapsible menu */}
              {/* <NavItem 
                icon={<MdOutlinePeopleAlt />} 
                label="Members A" 
                subItems={[
                  { to: "/admin/users", label: "Members List" },
                ]}
              /> */}
              
              {/* Logout button */}
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 p-4 text-sm font-medium duration-300 ease-in-out text-red-700 hover:text-red-500 w-full"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
                      fill=""
                    />
                    <path
                      d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
                      fill=""
                    />
                  </svg>
                  Log Out
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default MobileSidebar;