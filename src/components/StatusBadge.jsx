import React from 'react';
import { Clock, CheckCircle2, Printer, PackageCheck, CheckCheck, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'normal' }) => {
  const normalizedStatus = (status || '').toUpperCase();

  const configs = {
    PENDING: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotBg: 'bg-amber-500',
      icon: Clock,
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dotBg: 'bg-sky-500',
      icon: CheckCircle2,
    },
    PRINTING: {
      label: 'Printing',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dotBg: 'bg-indigo-500 animate-pulse',
      icon: Printer,
    },
    READY: {
      label: 'Ready for Pickup',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotBg: 'bg-emerald-500',
      icon: PackageCheck,
    },
    COLLECTED: {
      label: 'Collected',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dotBg: 'bg-slate-500',
      icon: CheckCheck,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotBg: 'bg-rose-500',
      icon: XCircle,
    },
  };

  const config = configs[normalizedStatus] || configs.PENDING;
  const Icon = config.icon;

  const isSmall = size === 'small';

  return (
    <span
      id={`status-badge-${normalizedStatus.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${
        isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      } whitespace-nowrap tracking-tight`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
