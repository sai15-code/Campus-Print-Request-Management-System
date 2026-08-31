import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  PackageCheck,
  CheckCheck,
  XCircle,
  IndianRupee,
  ArrowRight,
  Building2,
  Users,
  Tag,
  Eye,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { shops, currentAdmin } = usePrintContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    pendingCount: 0,
    acceptedCount: 0,
    printingCount: 0,
    readyCount: 0,
    collectedCount: 0,
    rejectedCount: 0,
    totalRevenue: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminDashboardStats();
      setMetrics(
        data?.metrics || {
          totalRequests: 0,
          pendingCount: 0,
          acceptedCount: 0,
          printingCount: 0,
          readyCount: 0,
          collectedCount: 0,
          rejectedCount: 0,
          totalRevenue: 0,
        }
      );
      setRecentRequests(data?.recentRequests || []);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Admin session expired or access denied. Please sign in to the Admin Portal.');
      } else {
        setError(err?.message || 'Failed to load dashboard statistics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Metrics computation from real database
  const totalRequests = metrics.totalRequests ?? 0;
  const pendingCount = metrics.pendingCount ?? 0;
  const acceptedCount = metrics.acceptedCount ?? 0;
  const printingCount = metrics.printingCount ?? 0;
  const readyCount = metrics.readyCount ?? 0;
  const collectedCount = metrics.collectedCount ?? 0;
  const rejectedCount = metrics.rejectedCount ?? 0;
  const totalRevenue = Number(metrics.totalRevenue || 0);

  // Stat card definition
  const statCards = [
    {
      title: 'Total Requests',
      value: loading ? '...' : totalRequests,
      icon: FileText,
      color: 'text-slate-900',
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      filterStatus: null,
    },
    {
      title: 'Pending Review',
      value: loading ? '...' : pendingCount,
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-white',
      border: 'border-amber-200/80',
      iconBg: 'bg-amber-50 text-amber-600',
      filterStatus: 'PENDING',
      highlight: pendingCount > 0,
    },
    {
      title: 'Accepted',
      value: loading ? '...' : acceptedCount,
      icon: CheckCircle2,
      color: 'text-sky-700',
      bg: 'bg-white',
      border: 'border-sky-200/80',
      iconBg: 'bg-sky-50 text-sky-600',
      filterStatus: 'ACCEPTED',
    },
    {
      title: 'Printing Active',
      value: loading ? '...' : printingCount,
      icon: Printer,
      color: 'text-indigo-700',
      bg: 'bg-white',
      border: 'border-indigo-200/80',
      iconBg: 'bg-indigo-50 text-indigo-600',
      filterStatus: 'PRINTING',
    },
    {
      title: 'Ready for Pickup',
      value: loading ? '...' : readyCount,
      icon: PackageCheck,
      color: 'text-emerald-700',
      bg: 'bg-white',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600',
      filterStatus: 'READY',
    },
    {
      title: 'Completed (Collected)',
      value: loading ? '...' : collectedCount,
      icon: CheckCheck,
      color: 'text-slate-700',
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-600',
      filterStatus: 'COLLECTED',
    },
    {
      title: 'Rejected',
      value: loading ? '...' : rejectedCount,
      icon: XCircle,
      color: 'text-rose-700',
      bg: 'bg-white',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600',
      filterStatus: 'REJECTED',
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₹${totalRevenue.toFixed(2)}`,
      icon: IndianRupee,
      color: 'text-indigo-700 font-bold',
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      filterStatus: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Admin Overview
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Live Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, {currentAdmin?.name || 'Administrator'}. Monitor queue workflow and campus print operations.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="admin-dash-view-queue"
            onClick={() => navigate('/admin/requests')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Process Queue ({loading ? '...' : pendingCount})</span>
          </button>
          <button
            id="admin-dash-pricing-btn"
            onClick={() => navigate('/admin/pricing')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </button>
          <button
            id="admin-dash-shops-btn"
            onClick={() => navigate('/admin/shops')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Print Shops</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
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

      {/* Metric Stat Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Queue Statistics
          </h2>
          <span className="text-xs text-slate-400">Click any card to filter requests</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                id={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  if (card.filterStatus) {
                    navigate(`/admin/requests?status=${card.filterStatus}`);
                  } else {
                    navigate('/admin/requests');
                  }
                }}
                className={`${card.bg} border ${card.border} rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative overflow-hidden`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {card.title}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className={`text-xl sm:text-2xl font-bold tracking-tight ${card.color}`}>
                    {card.value}
                  </span>
                  {card.highlight && (
                    <span className="text-[10px] font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">
                      Action Needed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Requests & Status/Shop Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recent Print Requests (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Print Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest student print jobs submitted to the campus system
              </p>
            </div>
            <button
              id="dash-view-all-requests"
              onClick={() => navigate('/admin/requests')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({loading ? '...' : totalRequests})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-slate-500">Loading recent print queue jobs...</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-slate-400">
              No print requests found in queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {req.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 whitespace-nowrap">
                          {req.studentName || 'Student'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {req.studentRoll || req.studentEmail || '21CS042'}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-medium text-slate-800 truncate" title={req.documentName}>
                          {req.documentName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {req.pages} pgs • {req.copies} {req.copies > 1 ? 'copies' : 'copy'} • {req.printType}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        ₹{Number(req.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} size="small" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`btn-view-req-${req.id}`}
                          onClick={() => navigate(`/admin/requests/${req.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Status & Operational Summary (1 col) */}
        <div className="space-y-6">
          {/* Status Breakdown Box */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Queue Status Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Pending Acceptance</span>
                  <span className="font-bold text-amber-700">{pendingCount} jobs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${totalRequests > 0 ? (pendingCount / totalRequests) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Printing / In Production</span>
                  <span className="font-bold text-indigo-700">{printingCount + acceptedCount} jobs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalRequests > 0
                          ? ((printingCount + acceptedCount) / totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Ready for Pickup</span>
                  <span className="font-bold text-emerald-700">{readyCount} jobs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${totalRequests > 0 ? (readyCount / totalRequests) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Completed (Collected)</span>
                  <span className="font-bold text-slate-700">{collectedCount} jobs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-500 h-full rounded-full transition-all"
                    style={{
                      width: `${totalRequests > 0 ? (collectedCount / totalRequests) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shop Operational Status */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Campus Print Centers</h2>
              <button
                onClick={() => navigate('/admin/shops')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 truncate">{shop.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{shop.location}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                      shop.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {shop.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
