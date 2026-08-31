import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  RotateCcw,
  Printer,
  FileText,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export const AdminRequests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { shops } = usePrintContext();

  const initialStatusFilter = searchParams.get('status') || 'ALL';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [shopFilter, setShopFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminRequests();
      setRequests(data?.requests || []);
    } catch (err) {
      setError(err?.message || 'Failed to load print requests queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update status filter if query param changes
  useEffect(() => {
    const s = searchParams.get('status');
    if (s) {
      setStatusFilter(s.toUpperCase());
    }
  }, [searchParams]);

  // Filtering & Sorting logic
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // Search query match
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          req.id?.toLowerCase().includes(q) ||
          req.documentName?.toLowerCase().includes(q) ||
          req.studentName?.toLowerCase().includes(q) ||
          req.studentEmail?.toLowerCase().includes(q) ||
          req.studentRoll?.toLowerCase().includes(q) ||
          req.printShop?.toLowerCase().includes(q);

        // Status match
        const matchesStatus =
          statusFilter === 'ALL' || req.status?.toUpperCase() === statusFilter.toUpperCase();

        // Shop match
        const matchesShop =
          shopFilter === 'ALL' || req.shopId === shopFilter || req.printShop === shopFilter;

        return matchesQuery && matchesStatus && matchesShop;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
        if (sortBy === 'oldest') return (a.id || '').localeCompare(b.id || '');
        if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0);
        if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0);
        return 0;
      });
  }, [requests, searchQuery, statusFilter, shopFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setShopFilter('ALL');
    setSortBy('newest');
    setSearchParams({});
  };

  const statusTabs = [
    { label: 'All Jobs', value: 'ALL', count: requests.length },
    {
      label: 'Pending',
      value: 'PENDING',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Accepted',
      value: 'ACCEPTED',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'ACCEPTED').length,
    },
    {
      label: 'Printing',
      value: 'PRINTING',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'PRINTING').length,
    },
    {
      label: 'Ready',
      value: 'READY',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'READY').length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Collected',
      value: 'COLLECTED',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'COLLECTED').length,
    },
    {
      label: 'Rejected',
      value: 'REJECTED',
      count: requests.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Print Requests Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage all student print submissions, review documents, and update spooling workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            Showing {filteredRequests.length} of {requests.length} requests
          </span>
        </div>
      </div>

      {/* Status Quick Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              id={`tab-filter-${tab.value.toLowerCase()}`}
              onClick={() => {
                setStatusFilter(tab.value);
                if (tab.value === 'ALL') {
                  setSearchParams({});
                } else {
                  setSearchParams({ status: tab.value });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor || 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="admin-requests-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, doc, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        {/* Sort By */}
        <div className="relative sm:w-48 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            id="admin-sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>

        {/* Reset Action */}
        <button
          id="admin-reset-filters-btn"
          onClick={handleResetFilters}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Main Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">Loading print queue...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Fetching live print jobs from campus reprographics database.
            </p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs table-auto">
              <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">Request ID</th>
                  <th className="py-3 px-3 whitespace-nowrap">Student</th>
                  <th className="py-3 px-3">Document</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Pages & Copies</th>
                  <th className="py-3 px-3 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-3 whitespace-nowrap">Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    id={`request-row-${req.id}`}
                    className="hover:bg-indigo-50/40 transition-colors group"
                  >
                    {/* Request ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {req.id}
                    </td>

                    {/* Student */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">
                        {req.studentName || 'Student'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {req.studentRoll || 'Student'}
                      </div>
                    </td>

                    {/* Document */}
                    <td className="py-3 px-3 max-w-[180px] lg:max-w-[240px]">
                      <div
                        className="font-semibold text-slate-900 truncate"
                        title={req.documentName}
                      >
                        {req.documentName}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                        <span className="font-medium bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[9px]">
                          {req.printType}
                        </span>
                        <span>•</span>
                        <span>{req.side} Sided</span>
                      </div>
                    </td>

                    {/* Pages & Copies combined */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{req.pages} pgs</span>
                      <span className="text-slate-400 mx-1">×</span>
                      <span className="font-medium text-slate-600">{req.copies} {req.copies > 1 ? 'cps' : 'cp'}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        ₹{Number(req.amount).toFixed(2)}
                      </div>
                      <div className="text-[9px] text-emerald-600 font-semibold uppercase">
                        {req.paymentStatus || 'PAID'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {req.date}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={req.status} size="small" />
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        id={`btn-manage-request-${req.id}`}
                        onClick={() => navigate(`/admin/requests/${req.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
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
        ) : (
          /* Empty State */
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No print requests match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, status tab, or shop selector to find the requests you are looking for.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
