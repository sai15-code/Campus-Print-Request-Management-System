import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  IndianRupee,
  Clock,
  CheckCircle2,
  Printer,
  PackageCheck,
  CheckCheck,
  XCircle,
  AlertCircle,
  ChevronRight,
  Send,
  MessageSquare,
  ShieldCheck,
  Download,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export const AdminRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAllowedNextStatuses, showToast } = usePrintContext();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [operatorNote, setOperatorNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await api.getAdminRequest(id);
      if (data) {
        setRequest(data);
      } else {
        setFetchError('Request not found.');
      }
    } catch (err) {
      if (err?.status === 404) {
        setFetchError(`No print request found with ID "${id}".`);
      } else {
        setFetchError(err?.message || 'Failed to load request details from server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900">Loading request details...</h3>
        <p className="text-xs text-slate-500">
          Fetching live print job <code className="font-mono font-bold text-slate-700">{id}</code> from database.
        </p>
      </div>
    );
  }

  if (!request || fetchError) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500">
          {fetchError || `No print request exists with ID ${id}.`}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => navigate('/admin/requests')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Queue</span>
          </button>
          <button
            onClick={fetchRequestDetails}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const allowedTransitions = getAllowedNextStatuses(request.status);

  const handleStatusChange = async (nextStatus) => {
    setErrorMessage('');
    setIsUpdating(true);

    try {
      const updated = await api.updateAdminRequestStatus(
        request.id,
        nextStatus,
        operatorNote.trim()
      );
      if (updated) {
        setRequest(updated);
        setOperatorNote('');
        if (showToast) {
          showToast(`Job #${request.id} status updated to ${nextStatus}.`, 'success');
        }
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to update request status on server.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusActionMeta = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          label: 'Accept Request',
          desc: 'Approve file for printing & spool into machine queue',
          color: 'bg-sky-600 hover:bg-sky-700 text-white',
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          label: 'Reject Request',
          desc: 'Decline order (unsupported formatting / paper)',
          color: 'bg-rose-600 hover:bg-rose-700 text-white',
          icon: XCircle,
        };
      case 'PRINTING':
        return {
          label: 'Start Printing',
          desc: 'Begin laser / color production spooling',
          color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          icon: Printer,
        };
      case 'READY':
        return {
          label: 'Mark as Ready for Pickup',
          desc: 'Job is printed, bound & shelved for student collection',
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: PackageCheck,
        };
      case 'COLLECTED':
        return {
          label: 'Mark as Collected',
          desc: 'Student has picked up document at the counter',
          color: 'bg-slate-800 hover:bg-slate-900 text-white',
          icon: CheckCheck,
        };
      default:
        return {
          label: `Move to ${status}`,
          desc: 'Update status',
          color: 'bg-indigo-600 text-white',
          icon: ChevronRight,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            id="back-to-all-requests-btn"
            onClick={() => navigate('/admin/requests')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to All Requests"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Job #{request.id}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {request.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            Payment: <strong className="text-emerald-700">{request.paymentStatus || 'PAID'}</strong> (₹{Number(request.amount).toFixed(2)})
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Details & Right Workflow Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Job Specifications */}
        <div className="lg:col-span-2 space-y-5">
          {/* Document & Print Specs Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Document & Print Specifications</span>
              </h2>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {request.fileSize || '2.0 MB'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Uploaded File</p>
                <p className="text-sm font-bold text-slate-900 truncate" title={request.documentName}>
                  {request.documentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert(`Simulating download of "${request.documentName}" for printing.`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 block text-[11px]">Print Color</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {request.printType}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 block text-[11px]">Side Layout</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {request.side} Sided
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 block text-[11px]">Pages / Doc</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {request.pages} pages
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-slate-500 block text-[11px]">Copies</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {request.copies} {request.copies > 1 ? 'copies' : 'copy'}
                </span>
              </div>
            </div>

            {request.specialInstructions && (
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Special Instructions from Student:</span>
                <p className="text-amber-800 leading-relaxed">{request.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Student & Shop Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Information</span>
              </h2>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="font-bold text-slate-900">{request.studentName || 'Student One'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="font-medium text-slate-800">{request.studentEmail || 'student1@campus.edu'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Roll Number:</span>{' '}
                  <span className="font-mono font-semibold text-slate-900">{request.studentRoll || '21CS042'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>{' '}
                  <span className="font-medium text-slate-700">{request.studentDepartment || 'Computer Science'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-medium text-slate-700">{request.studentPhone || '+91 98765 43210'}</span>
                </div>
              </div>
            </div>

            {/* Print Shop Info */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Print Center</span>
              </h2>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Shop:</span>{' '}
                  <span className="font-bold text-slate-900">{request.printShop}</span>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>{' '}
                  <span className="font-medium text-slate-700">{request.shopLocation || 'Central Library Building'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Rate / Page:</span>{' '}
                  <span className="font-semibold text-slate-900">₹{request.pricePerPage || '2.00'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total Price:</span>{' '}
                  <span className="font-bold text-indigo-700">₹{Number(request.amount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Payment:</span>{' '}
                  <span className="font-semibold text-emerald-700">{request.paymentMethod || 'Campus UPI'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Status History */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Status History & Audit Trail</span>
            </h2>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {request.timeline?.map((step, idx) => {
                const isCurrent = step.status.toUpperCase() === request.status;
                return (
                  <div key={idx} className="relative flex items-start gap-3.5 text-xs">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        step.completed
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`font-bold ${
                            isCurrent ? 'text-indigo-600' : 'text-slate-900'
                          }`}
                        >
                          {step.status}
                        </span>
                        <span className="text-[11px] text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{step.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Status Transition Controller */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border-2 border-indigo-500/30 p-5 shadow-xs space-y-4 sticky top-20">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Workflow Action Controller
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current: <strong className="text-indigo-700">{request.status}</strong>
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>

            {allowedTransitions.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Operator Note <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="operator-note-input"
                    rows={2}
                    value={operatorNote}
                    onChange={(e) => setOperatorNote(e.target.value)}
                    placeholder="e.g. Tray 1 Laser loaded, ready at counter #1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Next Allowed Action:
                  </p>

                  {allowedTransitions.map((nextStatus) => {
                    const meta = getStatusActionMeta(nextStatus);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={nextStatus}
                        id={`btn-transition-to-${nextStatus.toLowerCase()}`}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(nextStatus)}
                        className={`w-full text-left p-3 rounded-xl ${meta.color} transition-all cursor-pointer shadow-xs disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{meta.label}</span>
                        </div>
                        <p className="text-[11px] opacity-90 mt-1 pl-6 leading-tight">
                          {meta.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Terminal Status: {request.status}
                </p>
                <p className="text-[11px] text-slate-500">
                  This print request is completed or closed. No further workflow transitions are allowed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetails;
