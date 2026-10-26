
// NavItem.tsx - Shared component for navigation items
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SubItem {
to: string;
label: string;
}

interface NavItemProps {
to?: string;
icon: React.ReactNode;
label: string;
subItems?: SubItem[];
}

const NavItem = ({ to, icon, label, subItems }: NavItemProps) => {
const [open, setOpen] = useState(false);

// If it's a regular link
if (to && !subItems) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => 
          `flex items-center gap-3.5 p-4 text-sm font-medium duration-300 ease-in-out ${
            isActive 
              ? 'text-red-700 bg-red-50 rounded-md'
              : 'text-gray-700 hover:bg-gray-100 rounded-md'
          }`
        }
      >
        <span className="text-xl">{icon}</span>
        {label}
      </NavLink>
    </li>
  );
}

// If it's a dropdown
return (
  <li>
    <button
      onClick={() => setOpen(!open)}
      className="flex items-center justify-between w-full gap-3.5 p-4 text-sm font-medium duration-300 ease-in-out text-gray-700 hover:bg-gray-100 rounded-md"
    >
      <div className="flex items-center gap-3.5">
        <span className="text-xl">{icon}</span>
        {label}
      </div>
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </button>
    
    {/* Dropdown Items */}
    {open && subItems && (
      <ul className="pl-10 my-1">
        {subItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.to}
              className={({ isActive }) => 
                `block p-2 text-sm font-medium duration-300 ease-in-out ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    )}
  </li>
);
};

export default NavItem;
