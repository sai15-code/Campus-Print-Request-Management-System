import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  FileText,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import RequestCard from '../../components/RequestCard.jsx';

export const MyRequests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setStudentRequestCount } = usePrintContext();
  const initialStatusFilter = searchParams.get('status') || 'ALL';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStudentRequests();
      const list = data?.requests || [];
      setRequests(list);
      if (setStudentRequestCount) {
        setStudentRequestCount(list.length);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load your print requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusOptions = [
    { value: 'ALL', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PRINTING', label: 'Printing' },
    { value: 'READY', label: 'Ready' },
    { value: 'COLLECTED', label: 'Collected' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  // Filter requests based on search query and status
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter !== 'ALL' && req.status.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(query);
        const matchDoc = req.documentName.toLowerCase().includes(query);
        const matchShop = req.printShop.toLowerCase().includes(query);
        const matchType = req.printType.toLowerCase().includes(query);
        return matchId || matchDoc || matchShop || matchType;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    if (status === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 sm:space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Print Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Track real-time queue status, specifications, and pickup readiness.
          </p>
        </div>

        <button
          id="my-requests-new-btn"
          onClick={() => navigate('/new-request')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Print Request</span>
        </button>
      </div>

      {/* Filter and Search Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-requests-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document name, shop, or request ID..."
              className="block w-full pl-10 pr-9 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown on very small screens */}
          <div className="sm:hidden">
            <select
              id="status-filter-select-mobile"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
            Status:
          </span>
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            const count =
              opt.value === 'ALL'
                ? requests.length
                : requests.filter((r) => r.status.toUpperCase() === opt.value).length;

            return (
              <button
                key={opt.value}
                id={`filter-status-${opt.value.toLowerCase()}`}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
            onClick={fetchRequests}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Requests Content: Loading / Empty / Desktop Table & Mobile Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">Loading your print requests...</h3>
          <p className="text-xs text-slate-500 mt-1">Retrieving latest status from campus print queue.</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No requests match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or status filter.
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                handleStatusChange('ALL');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile view: Cards list */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* Desktop/Tablet view: Sleek Responsive Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-5">Request ID</th>
                    <th className="py-3.5 px-4 sm:px-5">Document Name</th>
                    <th className="py-3.5 px-4 sm:px-5">Print Shop</th>
                    <th className="py-3.5 px-4 sm:px-5">Specs</th>
                    <th className="py-3.5 px-4 sm:px-5">Date</th>
                    <th className="py-3.5 px-4 sm:px-5 text-right">Amount</th>
                    <th className="py-3.5 px-4 sm:px-5 text-center">Status</th>
                    <th className="py-3.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      id={`requests-table-row-${req.id}`}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 sm:px-5 font-mono font-semibold text-blue-600 whitespace-nowrap">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-900 max-w-[200px]">
                        <div className="flex items-center gap-2 truncate" title={req.documentName}>
                          <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                          <span className="truncate">{req.documentName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]" title={req.printShop}>{req.printShop}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {req.pages}p • {req.printType} • {req.side}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-slate-500 whitespace-nowrap">
                        {req.date}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(req.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                        <StatusBadge status={req.status} size="small" />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary */}
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredRequests.length} of {requests.length} print requests</span>
              <span className="hidden md:inline">Click any row to inspect status history & receipt</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyRequests;
