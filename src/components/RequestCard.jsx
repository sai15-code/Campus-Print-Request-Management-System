import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MapPin, Calendar, Layers, ChevronRight, IndianRupee } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export const RequestCard = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div
      id={`request-card-${request.id}`}
      onClick={() => navigate(`/requests/${request.id}`)}
      className="group bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{request.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {request.printType} • {request.side}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-900 truncate mt-0.5 group-hover:text-blue-600 transition-colors">
              {request.documentName}
            </h4>
          </div>
        </div>
        <StatusBadge status={request.status} size="small" />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{request.printShop}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{request.pages} pgs × {request.copies} {request.copies > 1 ? 'copies' : 'copy'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{request.date}</span>
        </div>

        <div className="flex items-center justify-end gap-1 font-semibold text-slate-900 text-sm">
          <span>₹{Number(request.amount).toFixed(2)}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
