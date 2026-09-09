import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Plus, Printer, Bell } from 'lucide-react';
import { usePrintContext } from '../context/PrintContext.jsx';

export const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = usePrintContext();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return { section: 'Overview', title: 'Dashboard' };
    if (path === '/new-request') return { section: 'Printing', title: 'New Print Request' };
    if (path === '/my-requests') return { section: 'Printing', title: 'My Requests' };
    if (path.startsWith('/requests/')) return { section: 'My Requests', title: 'Order Details' };
    if (path === '/profile') return { section: 'Account', title: 'Student Profile' };
    return { section: 'Portal', title: 'CampusPrint' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 h-[4.5rem] w-full">
      <div className="h-full px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile menu toggle + Sleek Breadcrumb / Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            id="navbar-mobile-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="hidden sm:inline">CampusPrint</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="truncate">{breadcrumb.section}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {breadcrumb.title}
            </h2>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick "+ New Print Request" button (hidden when already on new-request page) */}
          {location.pathname !== '/new-request' && (
            <button
              id="navbar-new-request-btn"
              onClick={() => navigate('/new-request')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">New Request</span>
              <span className="md:hidden">New</span>
            </button>
          )}

          {/* User Profile Avatar Link */}
          <button
            id="navbar-profile-avatar-btn"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-0.5 sm:p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer shrink-0"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
