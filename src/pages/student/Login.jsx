import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import { DEMO_STUDENT, DEMO_ADMIN } from '../../data/mockData.js';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = usePrintContext();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      setLoading(false);
      if (result && result.success) {
        if (result.role === 'ADMIN') {
          // Target fixed window name 'campus_admin_portal' to reuse tab and prevent duplicates
          navigate('/admin/dashboard', { replace: true });
        } else if (result.role === 'STUDENT') {
          // Target fixed window name 'campus_student_portal' to reuse tab and prevent duplicates
          navigate('/student/dashboard', { replace: true });
        } else {
          setError('We could not determine your portal. Please check your demo credentials.');
        }
      } else {
        setError(result?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleFillDemo = () => {
    setEmail(DEMO_STUDENT.email);
    setPassword(DEMO_STUDENT.password);
    setError('');
  };

  const handleFillAdminDemo = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(30,41,90,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-[620px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.45),transparent_38%),radial-gradient(circle_at_90%_85%,rgba(59,130,246,.28),transparent_35%)]" />
        <div className="relative">
          <div className="mb-14 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500"><Printer className="size-5" /></div><span className="text-lg font-semibold tracking-tight">CampusPrint</span></div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">Campus operations, simplified</p>
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">Print smarter. Pick up sooner.</h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">A single, reliable workflow for students and the campus print team—from upload to ready-for-pickup.</p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300"><Sparkles className="size-5" /></div><div><p className="text-sm font-semibold">Built for campus pace</p><p className="mt-1 text-xs text-slate-300">Track every request with confidence.</p></div></div></div>
      </section>

      <section className="flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-14">
      {/* Brand Header */}
      <div className="mx-auto w-full max-w-md text-center lg:text-left">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-4">
          <Printer className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          CampusPrint
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Campus Print Request Management System
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@campus.edu"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-11 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-indigo-600">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            {/* Demo Student Credentials */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Student
                </span>
                <button
                  id="fill-demo-credentials-btn"
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 font-mono">
                <p>Email: <span className="text-slate-900 font-semibold">{DEMO_STUDENT.email}</span></p>
                <p>Password: <span className="text-slate-900 font-semibold">{DEMO_STUDENT.password}</span></p>
              </div>
            </div>

            {/* Demo Admin Credentials */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Admin
                </span>
                <button
                  id="fill-admin-demo-credentials-btn"
                  type="button"
                  onClick={handleFillAdminDemo}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 font-mono">
                <p>Email: <span className="text-slate-900 font-semibold">{DEMO_ADMIN.email}</span></p>
                <p>Password: <span className="text-slate-900 font-semibold">{DEMO_ADMIN.password}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
      </div>
    </div>
  );
};

export default Login;
