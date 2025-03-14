
// DesktopSidebar.tsx
import { NavLink } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { MdOutlinePeopleAlt ,MdOutlineNewspaper} from "react-icons/md";
import NavItem from './NavItem';

const DesktopSidebar = () => {
  // Handle logout
  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out...');
  };

  return (
    <aside className="hidden top-4 left-4 md:block h-screen w-56 border-r-[1px] border-gray-200 ">
    {/* <aside className="hidden top-4 left-4 md:block h-screen w-56 border-r-[1px] border-gray-200 "> */}
    {/* <aside className="fixed z-50 top-4 left-4 lg:block h-screen w-56 border-r-[1px] border-gray-200 "> */}
      {/* Sidebar Header */}
      <div className="flex items-center px-6 py-6">
        <NavLink to="/" className="text-xl font-bold">
          YMCA
        </NavLink>
      </div>

      {/* Navigation Items */}
      <nav className="mt-9 px-6 flex-1">
        <ul className="flex flex-col gap-1.5">
          <NavItem to="/dashboard" icon={<GoHome />} label="Home" />
          <NavItem to="/updates" icon={<MdOutlineNewspaper />} label="Updates" />
          <NavItem to="/admin-dashboard" icon={<GoHome />} label="Home A" />
          <NavItem to="/admin/users" icon={<MdOutlinePeopleAlt />} label="Members A" />
          <NavItem to="/admin/updates" icon={<MdOutlineNewspaper />} label="Updates A" />
          
          {/* Collapsible menu */}
          {/* <NavItem 
            icon={<MdOutlinePeopleAlt />} 
            label="Members A" 
            subItems={[
              { to: "/admin/users", label: "Members List" },
            ]}
          />
          <NavItem 
            icon={<MdOutlineNewspaper />} 
            label="Updates A" 
            subItems={[
              { to: "/admin/updates", label: "Updates List" },
            ]}
          /> */}
          
          {/* Logout button */}
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3.5 p-4 text-sm font-medium duration-300 ease-in-out text-red-700 hover:text-red-500 lg:text-base w-full"
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
  );
};

export default DesktopSidebar;
