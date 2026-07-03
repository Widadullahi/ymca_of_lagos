
// DesktopSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { MdOutlinePeopleAlt ,MdOutlineNewspaper,MdOutlineManageAccounts, MdAdminPanelSettings, MdChurch, MdRequestPage } from "react-icons/md";
import NavItem from './NavItem';
import { useAuth } from '../../context/NewAuthContext';
import ymca from '../../assets/images/image.png'

const DesktopSidebar = () => {

  const { user,logout } = useAuth();
  const navigate = useNavigate();
  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/login');
  };

  return (
    <>
      <style>{`
        /* Force scrollbar visibility for WebKit browsers (Chrome, Safari, Edge) */
        .desktop-sidebar-nav::-webkit-scrollbar {
          width: 8px; /* Make it slightly more visible */
          display: block !important;
        }
        .desktop-sidebar-nav::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        .desktop-sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #000000; /* Black thumb */
          border-radius: 4px;
        }
        .desktop-sidebar-nav::-webkit-scrollbar-thumb:hover {
          background-color: #333333; /* Dark gray on hover */
        }
        /* Ensure scrollbar is always visible */
        .desktop-sidebar-nav {
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #000000 #f3f4f6; /* Firefox */
          scrollbar-gutter: stable;
        }
      `}</style>
      <aside className="hidden md:block h-screen w-60 border-r border-gray-100 bg-white shadow-sm flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-center px-6 py-8 border-b border-gray-100 flex-shrink-0">
          <NavLink to="/" className="text-xl font-bold">
            <img
              src={ymca}
              alt="YMCA of Lagos"
              className="h-24 w-auto object-contain"
            />
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav 
          className="desktop-sidebar-nav mt-6 px-4 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          <ul className="flex flex-col gap-2 pb-8">
            {user?.role == "Member" ? (
              <>
              <NavItem to="/dashboard" icon={<GoHome />} label="Home" />
              </>
            ):(
              <>
              <NavItem to="/admin/dashboard" icon={<GoHome />} label="Dashboard" />
              <NavItem to="/admin/users" icon={<MdOutlinePeopleAlt />} label="Members" />
              <NavItem to="/admin/churches" icon={<MdChurch />} label="Churches" />
              <NavItem to="/admin/membership-request" icon={<MdRequestPage />} label="Requests" />
              <NavItem to="/admin/staff" icon={<MdOutlinePeopleAlt />} label="Staff" />
              <NavItem to="/admin/updates" icon={<MdOutlineNewspaper />} label="Updates" />
              <NavItem to="/admin/admin-access" icon={<MdAdminPanelSettings />} label="Admins" />
              <NavItem to="/admin/signature" icon={<MdOutlineManageAccounts />} label="Signature" />
              <NavItem to="/admin/fee-settings" icon={<MdOutlineManageAccounts />} label="Fee Settings" />
              </>
            )}
            <NavItem to="/account" icon={<MdOutlineManageAccounts />} label="Account" />
            
            {/* Logout button */}
            <li className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 text-sm font-medium duration-300 ease-in-out text-red-600 hover:bg-red-50 rounded-lg w-full"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H15C15.5523 21 16 20.5523 16 20V4C16 3.44772 15.5523 3 15 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 17L15 12L10 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 12H3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Log Out
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default DesktopSidebar;
