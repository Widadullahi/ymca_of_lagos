// MobileSidebar.tsx
import { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { MdOutlinePeopleAlt ,MdOutlineNewspaper, MdOutlineManageAccounts} from "react-icons/md";
import NavItem from './NavItem';
import { useAuth } from '../../context/NewAuthContext';

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
            <svg id="Group_5836" data-name="Group 5836" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="102.432" height="40" viewBox="0 0 102.432 40">
              <path id="Path_5700" data-name="Path 5700" d="M9.356,1.17,7.093,6.55,6.727,1.17H4.863L2.578,6.55l-.4-5.38H.581l.588,7.388H3.2L5.473,3.089l.344,5.469H7.9L10.986,1.17Z" transform="translate(-0.526 -1.059)" fill="red"></path>
              <g id="Group_3969" data-name="Group 3969">
                <g id="Group_3968" data-name="Group 3968">
                  <path id="Path_5701" data-name="Path 5701" d="M103.254,5.647a1.791,1.791,0,0,1,.033-.344l.532-3.051C104.064.876,104.907,0,106.992,0c1.753,0,2.574,1,2.574,2.008a1.787,1.787,0,0,1-.033.333L109,5.358c-.244,1.409-1.076,2.252-3.262,2.252-1.741,0-2.485-.965-2.485-1.964m4.659-3.472c0-.455-.3-.732-1.087-.732-.843,0-1.287.366-1.4.954l-.5,2.818a2.191,2.191,0,0,0-.022.255c0,.444.288.7,1.087.7.843,0,1.287-.322,1.4-.954l.5-2.818a1.624,1.624,0,0,0,.022-.222" transform="translate(-93.47)" fill="red"></path>
                  <path id="Path_5702" data-name="Path 5702" d="M170.052,6.394h-1.12l-.4,2.307H166.9l1.3-7.388h2.829c1.586,0,2.363.6,2.363,1.686a3.491,3.491,0,0,1-.044.455l-.155.887a2.012,2.012,0,0,1-1.409,1.831l1.4,2.529h-1.831Zm1.642-2.8a2.118,2.118,0,0,0,.033-.311c0-.377-.233-.532-.8-.532h-1.353l-.388,2.23h1.4c.721,0,.91-.266,1.01-.832Z" transform="translate(-151.086 -1.189)" fill="red"></path>
                  <path id="Path_5703" data-name="Path 5703" d="M238.643,1.026h1.631L239.22,6.972h2.962l-.244,1.442h-4.593Z" transform="translate(-214.856 -0.928)" fill="red"></path>
                  <path id="Path_5704" data-name="Path 5704" d="M287.629,8.557l1.309-7.388h2.817c1.6,0,2.186.876,2.186,1.808a2.565,2.565,0,0,1-.033.41l-.577,3.261c-.166.976-.566,1.908-2.684,1.908Zm4.648-5.325c0-.4-.233-.621-.932-.621h-1.032l-.8,4.5h1.132c.876,0,1.032-.333,1.132-.921l.466-2.662a1.546,1.546,0,0,0,.033-.3" transform="translate(-260.375 -1.058)" fill="red"></path>
                  <path id="Path_5705" data-name="Path 5705" d="M10.669,132.191H4.035l1.479-8.607L0,102.336H6.68L10,116.142l7.845-13.807h7.576L12.149,123.584Z" transform="translate(0 -92.639)" fill="red"></path>
                  <path id="Path_5706" data-name="Path 5706" d="M236.409,115.829l-7.441,12.462h-6.724l-2.51-12.462-3.9,16.362h-6.5l7.083-29.855h6.634l3.721,19.276,10.893-19.276h6.59l-3.5,29.855H234.3Z" transform="translate(-189.497 -92.639)" fill="red"></path>
                  <path id="Path_5707" data-name="Path 5707" d="M588.25,121.051a9.62,9.62,0,0,1,.179-1.793l2.286-12.91c1.076-6.1,4.8-8.741,12.059-8.741a31.279,31.279,0,0,1,8.607,1.3l-1.479,5.648a42.177,42.177,0,0,0-7.8-.986c-3.183,0-4.483,1.076-5.021,4.214l-1.838,10.4a8.963,8.963,0,0,0-.135,1.39c0,2.062,1.166,2.824,3.676,2.824a38.949,38.949,0,0,0,7.755-.852l.224,5.648a34.906,34.906,0,0,1-9.01,1.165c-6.59,0-9.5-3.138-9.5-7.307" transform="translate(-532.51 -88.357)" fill="red"></path>
                  <path id="Path_5708" data-name="Path 5708" d="M809.6,126.319H799.421l-2.69,5.872H789.6l14.345-29.855h9.01l4.259,29.855h-6.993Zm-7.755-5.469h7.128l-1.255-13Z" transform="translate(-714.785 -92.639)" fill="red"></path>
                </g>
              </g>
            </svg>
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
                <NavItem to="/admin/dashboard" icon={<GoHome />} label="Home" />
                <NavItem to="/admin/users" icon={<MdOutlinePeopleAlt />} label="Members" />
                <NavItem to="/admin/updates" icon={<MdOutlineNewspaper />} label="Updates" />
                </>
              )}
              <NavItem to="/account" icon={<MdOutlineManageAccounts />} label="Account" />
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