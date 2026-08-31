import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePrintContext } from '../context/PrintContext.jsx';

export const Toast = () => {
  const { toast } = usePrintContext();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600" />,
    info: <Info className="w-4 h-4 text-blue-600" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-slate-900 shadow-md',
    error: 'bg-white border-rose-200 text-slate-900 shadow-md',
    info: 'bg-white border-blue-200 text-slate-900 shadow-md',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium ${
          bgStyles[toast.type] || bgStyles.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
