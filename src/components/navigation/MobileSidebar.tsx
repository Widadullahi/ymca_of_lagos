import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GoHome } from 'react-icons/go';
import {
  MdAdminPanelSettings,
  MdChurch,
  MdOutlineManageAccounts,
  MdOutlineNewspaper,
  MdOutlinePeopleAlt,
  MdRequestPage,
} from 'react-icons/md';
import { useAuth } from '../../context/NewAuthContext';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const closeMenu = () => setIsOpen(false);
  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMenu}
        className={`absolute inset-0 bg-slate-950/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal={isOpen}
        aria-label="Main navigation"
        className={`absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-white shadow-2xl transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <NavLink to="/" onClick={closeMenu} className="font-bold tracking-wide text-red-700">YMCA LAGOS</NavLink>
          <button type="button" onClick={closeMenu} aria-label="Close menu" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {user?.role === 'Member' ? (
              <li><NavLink to="/dashboard" onClick={closeMenu} className={linkClass}><GoHome className="text-xl" />Home</NavLink></li>
            ) : (
              <>
                <li><NavLink to="/admin/dashboard" onClick={closeMenu} className={linkClass}><GoHome className="text-xl" />Dashboard</NavLink></li>
                  <li><NavLink to="/admin/donations" onClick={closeMenu} className={linkClass}><MdOutlineManageAccounts className="text-xl" />Donations</NavLink></li>
                  <li><NavLink to="/admin/users" onClick={closeMenu} className={linkClass}><MdOutlinePeopleAlt className="text-xl" />Members</NavLink></li>
                  <li><NavLink to="/admin/churches" onClick={closeMenu} className={linkClass}><MdChurch className="text-xl" />Churches</NavLink></li>
                  <li><NavLink to="/admin/membership-request" onClick={closeMenu} className={linkClass}><MdRequestPage className="text-xl" />Requests</NavLink></li>
                  <li><NavLink to="/admin/staff" onClick={closeMenu} className={linkClass}><MdOutlinePeopleAlt className="text-xl" />Staff</NavLink></li>
                  <li><NavLink to="/admin/updates" onClick={closeMenu} className={linkClass}><MdOutlineNewspaper className="text-xl" />Updates</NavLink></li>
                  <li><NavLink to="/admin/admin-access" onClick={closeMenu} className={linkClass}><MdAdminPanelSettings className="text-xl" />Admins</NavLink></li>
                  <li><NavLink to="/admin/signature" onClick={closeMenu} className={linkClass}><MdOutlineManageAccounts className="text-xl" />Signature</NavLink></li>
                  <li><NavLink to="/admin/fee-settings" onClick={closeMenu} className={linkClass}><MdOutlineManageAccounts className="text-xl" />Fee settings</NavLink></li>
              </>
            )}
            <li><NavLink to="/account" onClick={closeMenu} className={linkClass}><MdOutlineManageAccounts className="text-xl" />Account</NavLink></li>
          </ul>
        </nav>
        <div className="border-t border-gray-100 p-3">
          <button type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">
            <span aria-hidden="true">↪</span>Log out
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
