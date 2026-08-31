import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Printer,
  Building2,
  Tag,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { usePrintContext } from '../context/PrintContext.jsx';
import Toast from './Toast.jsx';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentAdmin, adminLogout, requests } = usePrintContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Protection: If admin is not logged in, redirect to /login
  if (!currentAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
    setSidebarOpen(false);
  };

  const pendingCount = requests?.filter((r) => r.status === 'PENDING').length || 0;
  const inProgressCount =
    requests?.filter((r) => r.status === 'ACCEPTED' || r.status === 'PRINTING').length || 0;

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard')
      return { section: 'Analytics', title: 'Dashboard' };
    if (path === '/admin/requests') return { section: 'Queue', title: 'Print Requests' };
    if (path.startsWith('/admin/requests/'))
      return { section: 'Queue', title: 'Request Management' };
    if (path === '/admin/shops') return { section: 'Facilities', title: 'Print Centers' };
    if (path === '/admin/pricing') return { section: 'Configuration', title: 'Pricing Matrix' };
    if (path === '/admin/students') return { section: 'Directory', title: 'Registered Students' };
    if (path === '/admin/profile') return { section: 'System', title: 'Admin Settings' };
    return { section: 'Console', title: 'Reprographics Center' };
  };

  const breadcrumb = getBreadcrumb();

  const navItems = [
    {
      name: 'Admin Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Print Requests',
      path: '/admin/requests',
      icon: Printer,
      badge: requests?.filter((r) => r.status === 'PENDING').length || null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      name: 'Print Centers',
      path: '/admin/shops',
      icon: Building2,
      badge: null,
    },
    {
      name: 'Pricing Matrix',
      path: '/admin/pricing',
      icon: Tag,
      badge: null,
    },
    {
      name: 'Students Directory',
      path: '/admin/students',
      icon: Users,
      badge: null,
    },
    {
      name: 'Admin Profile',
      path: '/admin/profile',
      icon: UserCheck,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased font-sans">
      <Toast />

      {/* Mobile Header Bar */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm tracking-tight block">
              CampusPrint
            </span>
            <span className="text-[10px] text-indigo-600 font-medium block">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section: Brand + Navigation */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Admin Portal Header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
                  CampusPrint
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Reprographics Control</p>
            </div>
          </div>

          {/* Nav List */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Admin Menu
            </p>
            <nav className="space-y-1 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive: active }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                        active
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                          item.badgeColor || 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Admin Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {/* Admin User Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
              {currentAdmin?.name ? currentAdmin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentAdmin?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentAdmin?.email || 'admin@campus.edu'}
              </p>
            </div>
          </div>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="font-semibold text-indigo-600">Admin Portal</span>
              <span className="text-slate-300">/</span>
              <span>{breadcrumb.section}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {breadcrumb.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <Printer className="w-3.5 h-3.5" />
                <span>{inProgressCount} In Queue</span>
              </span>
            </div>

            {/* View All Requests shortcut */}
            <button
              id="admin-top-requests-btn"
              onClick={() => navigate('/admin/requests')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Manage Queue</span>
              <span className="sm:hidden">Queue</span>
            </button>

            {/* Profile Avatar Button */}
            <button
              id="admin-navbar-profile-btn"
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-200 transition-all cursor-pointer shrink-0"
              title="Admin Profile"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-2xs border border-indigo-200">
                {currentAdmin?.name ? currentAdmin.name.charAt(0) : 'A'}
              </div>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        <Toast />
      </div>
    </div>
  );
};

export default AdminLayout;
