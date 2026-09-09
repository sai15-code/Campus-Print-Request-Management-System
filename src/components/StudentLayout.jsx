import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import Toast from './Toast.jsx';
import { usePrintContext } from '../context/PrintContext.jsx';

export const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = usePrintContext();

  // If student is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row w-full overflow-x-hidden">
      {/* Sidebar for Desktop & Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden transition-all duration-200">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Global Toast Notifications */}
        <Toast />
      </div>
    </div>
  );
};

export default StudentLayout;
