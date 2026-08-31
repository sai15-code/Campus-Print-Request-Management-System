import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building2,
  CreditCard,
  Clock,
  CheckCircle2,
  Printer,
  PackageCheck,
  CheckCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  Download,
  Info,
  Phone,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = usePrintContext();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getStudentRequest(id);
        if (isMounted) {
          setRequest(data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Request not found');
          setRequest(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchRequest();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Loading request details...</h2>
        <p className="text-xs text-slate-500 mt-1">Retrieving tracking info for "{id}" from campus server.</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {error || `The print request with ID "${id}" could not be located in your records.`}
        </p>
        <button
          onClick={() => navigate('/my-requests')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </button>
      </div>
    );
  }

  // Standard steps for the campus timeline
  const standardSteps = [
    { key: 'Submitted', label: 'Submitted', desc: 'Request submitted online' },
    { key: 'Accepted', label: 'Accepted', desc: 'Verified by operator' },
    { key: 'Printing', label: 'Printing', desc: 'Printer spooling active' },
    { key: 'Ready', label: 'Ready', desc: 'Shelved for pickup' },
    { key: 'Collected', label: 'Collected', desc: 'Handed to student' },
  ];

  // Helper to determine step completion status based on request.status or request.timeline
  const getStepStatus = (stepKey, index) => {
    const timelineEntry = request.timeline?.find(
      (t) => t.status.toLowerCase() === stepKey.toLowerCase()
    );

    if (timelineEntry) {
      return {
        completed: timelineEntry.completed,
        timestamp: timelineEntry.timestamp,
        note: timelineEntry.note,
      };
    }

    // Fallback logic based on current status index
    const statusOrder = ['PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED'];
    const currentIndex = statusOrder.indexOf(request.status.toUpperCase());

    return {
      completed: index <= currentIndex,
      timestamp: index <= currentIndex ? request.date : 'Pending',
      note: index <= currentIndex ? 'Step completed.' : 'Awaiting previous stage completion.',
    };
  };

  const handleDownloadReceipt = () => {
    showToast(`Print receipt for ${request.id} downloaded!`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <button
          id="back-to-requests-btn"
          onClick={() => navigate('/my-requests')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to My Requests</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            id="download-slip-btn"
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Slip</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {request.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{request.date}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
              {request.documentName}
            </h1>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <span className="text-xs text-slate-400 font-medium mb-1">Current Status</span>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Status History & Progress Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Status Timeline</h3>
            <p className="text-xs text-slate-500">Live operational progression across campus reprographics</p>
          </div>
        </div>

        {/* Responsive Timeline: Vertical list with clean connectors */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {standardSteps.map((step, index) => {
            const stepInfo = getStepStatus(step.key, index);
            const isDone = stepInfo.completed;
            const isCurrent =
              request.status.toUpperCase() === step.key.toUpperCase() ||
              (step.key === 'Printing' && request.status === 'ACCEPTED');

            return (
              <div key={step.key} className="relative group">
                {/* Step Marker Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isDone ? 'text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isDone && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          Completed
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {stepInfo.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {stepInfo.note || step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Columns Grid: Document Info, Print Shop, Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Document Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Document Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">File Name:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[150px]" title={request.documentName}>
                {request.documentName}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Pages:</span>
              <span className="font-semibold text-slate-900">{request.pages}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Copies:</span>
              <span className="font-semibold text-slate-900">{request.copies}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Print Type:</span>
              <span className="font-semibold text-slate-900">{request.printType}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Side Type:</span>
              <span className="font-semibold text-slate-900">{request.side} Side</span>
            </div>

            {request.specialInstructions && (
              <div className="pt-2">
                <span className="text-slate-500 block mb-1 font-medium">Instructions:</span>
                <p className="p-2 rounded-lg bg-slate-50 text-slate-700 text-[11px] border border-slate-200/60">
                  {request.specialInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Print Shop Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Print Shop Location</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="py-1 border-b border-slate-100/60">
              <span className="text-slate-500 block">Shop Name:</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {request.printShop}
              </span>
            </div>

            <div className="py-1 border-b border-slate-100/60">
              <span className="text-slate-500 block">Location:</span>
              <span className="font-semibold text-slate-800 mt-0.5 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{request.shopLocation || 'Central Campus Reprographics Desk'}</span>
              </span>
            </div>

            <div className="py-1 border-b border-slate-100/60">
              <span className="text-slate-500 block">Collection Hours:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                8:00 AM – 8:00 PM (Mon-Sat)
              </span>
            </div>

            <div className="py-1">
              <span className="text-slate-500 block">Pickup Requirement:</span>
              <span className="font-medium text-slate-700 mt-0.5 block">
                Present Student ID or Request ID at counter
              </span>
            </div>
          </div>
        </div>

        {/* 3. Payment & Billing Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Payment & Billing</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Rate per Page:</span>
              <span className="font-semibold text-slate-900">₹{Number(request.pricePerPage || 2).toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Billing Formula:</span>
              <span className="font-medium text-slate-700">
                {request.pages} × {request.copies} × ₹{Number(request.pricePerPage || 2).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold text-slate-900">{request.paymentMethod || 'Campus UPI'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100/60 items-center">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                request.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {request.paymentStatus || 'PAID'}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-700">Total Amount:</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ₹{Number(request.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
