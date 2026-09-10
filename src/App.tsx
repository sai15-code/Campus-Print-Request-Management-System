import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Student Components & Pages
import StudentLayout from './components/StudentLayout.jsx';
import Login from './pages/student/Login.jsx';
import Register from './pages/student/Register.jsx';
import Dashboard from './pages/student/Dashboard.jsx';
import NewPrintRequest from './pages/student/NewPrintRequest.jsx';
import MyRequests from './pages/student/MyRequests.jsx';
import RequestDetails from './pages/student/RequestDetails.jsx';
import Profile from './pages/student/Profile.jsx';

// Admin Components & Pages
import AdminLayout from './components/AdminLayout.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminRequests from './pages/admin/AdminRequests.jsx';
import AdminRequestDetails from './pages/admin/AdminRequestDetails.jsx';
import AdminShops from './pages/admin/AdminShops.jsx';
import AdminPricing from './pages/admin/AdminPricing.jsx';
import AdminStudents from './pages/admin/AdminStudents.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/student/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Student Panel Routes */}
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student/new-request" element={<NewPrintRequest />} />
            <Route path="/new-request" element={<NewPrintRequest />} />
            <Route path="/student/my-requests" element={<MyRequests />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/student/requests/:id" element={<RequestDetails />} />
            <Route path="/requests/:id" element={<RequestDetails />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Panel Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/requests/:id" element={<AdminRequestDetails />} />
            <Route path="/admin/shops" element={<AdminShops />} />
            <Route path="/admin/print-shops" element={<AdminShops />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
