import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Mail,
  Phone,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Server,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';

export const AdminProfile = () => {
  const { currentAdmin, updateAdminProfile, showToast } = usePrintContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [adminData, setAdminData] = useState(currentAdmin || null);

  const [formData, setFormData] = useState({
    name: currentAdmin?.name || 'Administrator',
    email: currentAdmin?.email || 'admin@campus.edu',
    phone: currentAdmin?.phone || '+91 98765 00000',
    department: currentAdmin?.department || 'Campus Reprographics & IT Center',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminProfile();
      if (data) {
        setAdminData(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
        });
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Admin session expired or unauthorized. Please sign in again.');
      } else {
        setError(err?.message || 'Failed to load admin profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSavingProfile(true);
      const result = await updateAdminProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
      });
      if (result && result.success) {
        setProfileSaved(true);
        setAdminData((prev) => ({ ...prev, ...(result.admin || {}) }));
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to save admin profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordStatus({ error: 'Please enter all password fields.', success: '' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({
        error: 'New password must be at least 6 characters.',
        success: '',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({
        error: 'New password and confirmation do not match.',
        success: '',
      });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.updateAdminPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordStatus({
        error: '',
        success: res?.message || 'Admin password updated successfully.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Admin password changed successfully.', 'success');
    } catch (err) {
      setPasswordStatus({
        error: err?.message || 'Failed to update admin password.',
        success: '',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const displayAdmin = adminData || currentAdmin;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Admin Profile & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your administrative credentials, contact information, and queue privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{displayAdmin?.role || 'Super Admin'}</span>
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Admin Identity Badge */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20 border-2 border-indigo-100">
              {displayAdmin?.name ? displayAdmin.name.charAt(0) : 'A'}
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {loading ? 'Loading profile...' : displayAdmin?.name || 'Administrator'}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {displayAdmin?.email || 'admin@campus.edu'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  System Role
                </span>
                <span className="font-semibold text-slate-900">
                  {displayAdmin?.role || 'Super Admin'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Assigned Unit
                </span>
                <span className="font-medium text-slate-800">
                  {displayAdmin?.department || 'Campus Reprographics Unit'}
                </span>
              </div>
              {displayAdmin?.office && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Office Location
                  </span>
                  <span className="font-medium text-slate-800">
                    {displayAdmin.office}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* System & Architecture Info Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>System & Database Status</span>
            </h3>
            <div className="space-y-2 text-slate-600 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Database:</span>
                <span className="font-semibold text-slate-800">MySQL 8.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Backend API:</span>
                <span className="font-semibold text-slate-800">Express / REST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Auth Mechanism:</span>
                <span className="font-semibold text-slate-800">JWT (Role-scoped)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Print Engine:</span>
                <span className="font-bold text-emerald-600">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Profile & Change Password Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Edit Form */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Account Information</span>
              </h2>
              {profileSaved && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="btn-save-admin-profile"
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Change Admin Password</span>
            </h2>

            {passwordStatus.error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="btn-update-admin-password"
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

