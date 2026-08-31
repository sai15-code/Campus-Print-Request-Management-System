import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Printer,
  PackageCheck,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import { CAMPUS_XEROX_CENTER } from '../../data/mockData.js';
import api from '../../utils/api.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export const Dashboard = () => {
  const { currentUser } = usePrintContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    printingRequests: 0,
    readyRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStudentDashboardStats();
      setStats({
        totalRequests: data?.stats?.totalRequests ?? 0,
        pendingRequests: data?.stats?.pendingRequests ?? 0,
        printingRequests: data?.stats?.printingRequests ?? 0,
        readyRequests: data?.stats?.readyRequests ?? 0,
      });
      setRecentRequests(data?.recentRequests || []);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const studentName = currentUser?.name || 'Student';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-7 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {getGreeting()}, {studentName} 👋
            </h1>
            <p className="mt-1 text-blue-100 text-xs sm:text-sm font-normal">
              Manage your campus print queue and collect from the Central Library Xerox center.
            </p>
          </div>

          <button
            id="dashboard-new-request-btn"
            onClick={() => navigate('/new-request')}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>New Print Request</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner if API Call Fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4 Simple Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          id="stat-total-requests"
          title="Total Requests"
          value={loading ? '...' : stats.totalRequests}
          icon={FileText}
          color="blue"
          subtext="All submissions to date"
          onClick={() => navigate('/my-requests')}
        />
        <StatCard
          id="stat-pending-requests"
          title="Pending"
          value={loading ? '...' : stats.pendingRequests}
          icon={Clock}
          color="amber"
          subtext="Awaiting confirmation"
          onClick={() => navigate('/my-requests?status=PENDING')}
        />
        <StatCard
          id="stat-printing-requests"
          title="Printing"
          value={loading ? '...' : stats.printingRequests}
          icon={Printer}
          color="indigo"
          subtext="Active in printer queue"
          onClick={() => navigate('/my-requests?status=PRINTING')}
        />
        <StatCard
          id="stat-ready-requests"
          title="Ready"
          value={loading ? '...' : stats.readyRequests}
          icon={PackageCheck}
          color="emerald"
          subtext="Awaiting pickup counter"
          onClick={() => navigate('/my-requests?status=READY')}
        />
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Recent Requests</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Your latest 3 campus print submissions</p>
          </div>
          <button
            id="view-all-requests-btn"
            onClick={() => navigate('/my-requests')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer shrink-0"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 sm:p-10 text-center text-slate-400 text-xs">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <span>Loading recent requests...</span>
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No print requests yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Submit your first document for printing at the campus Xerox center.
            </p>
            <button
              onClick={() => navigate('/new-request')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Request
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                id={`recent-request-row-${req.id}`}
                onClick={() => navigate(`/requests/${req.id}`)}
                className="p-4 sm:p-5 sm:px-6 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-400">{req.id}</span>
                      {(req.printType || req.side) && (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {[req.printType, req.side].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate mt-0.5" title={req.documentName}>
                      {req.documentName}
                    </h4>
                    <div className="flex items-center gap-3 sm:gap-4 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{req.printShop}</span>
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {req.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">₹{Number(req.amount || 0).toFixed(2)}</span>
                  </div>
                  <StatusBadge status={req.status} size="small" />
                  <ArrowRight className="hidden sm:block w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Campus Xerox Center Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {CAMPUS_XEROX_CENTER.name}
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Open
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                The single official campus printing & reprographics facility for students & faculty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-medium">
              Rating: ★ {CAMPUS_XEROX_CENTER.rating} / 5.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pickup Location
            </span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{CAMPUS_XEROX_CENTER.location}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Timings & Contact
            </span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{CAMPUS_XEROX_CENTER.timing}</span>
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{CAMPUS_XEROX_CENTER.contact}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Standard Rates
            </span>
            <div className="space-y-0.5 font-medium text-slate-700 text-[11px]">
              <div className="flex justify-between">
                <span>B&W (Single / Double):</span>
                <span className="font-bold text-slate-900">₹2.00 / ₹1.50</span>
              </div>
              <div className="flex justify-between">
                <span>Color HD (Single / Double):</span>
                <span className="font-bold text-slate-900">₹10.00 / ₹8.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
