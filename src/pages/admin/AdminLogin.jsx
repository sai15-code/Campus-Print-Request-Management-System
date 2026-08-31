import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import { DEMO_ADMIN } from '../../data/mockData.js';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = usePrintContext();
  const navigate = useNavigate();

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      setLoading(false);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h2>
          <span className="text-xs uppercase font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
            Staff Access
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Campus Reprographics & Print Queue Control Center
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campus.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Admin Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Demo Admin Credentials
                </span>
                <button
                  id="fill-demo-admin-btn"
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 font-mono">
                <p>
                  Email: <span className="text-slate-900 font-semibold">admin@campus.edu</span>
                </p>
                <p>
                  Password: <span className="text-slate-900 font-semibold">admin123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
