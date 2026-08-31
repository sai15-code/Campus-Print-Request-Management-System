import React from 'react';

export const StatCard = ({ id, title, value, icon: Icon, color = 'blue', subtext, onClick }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70 text-blue-600',
      border: 'border-slate-200/80',
      activeBorder: 'hover:border-blue-300',
      badge: 'text-blue-700 bg-blue-50',
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-600',
      border: 'border-slate-200/80',
      activeBorder: 'hover:border-amber-300',
      badge: 'text-amber-700 bg-amber-50',
    },
    indigo: {
      bg: 'bg-indigo-50/80 text-indigo-600',
      border: 'border-slate-200/80',
      activeBorder: 'hover:border-indigo-300',
      badge: 'text-indigo-700 bg-indigo-50',
    },
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-600',
      border: 'border-slate-200/80',
      activeBorder: 'hover:border-emerald-300',
      badge: 'text-emerald-700 bg-emerald-50',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border ${scheme.border} ${scheme.activeBorder} shadow-xs transition-all duration-200 min-w-0 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">{title}</span>
        <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${scheme.bg}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
      </div>
      {subtext && (
        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
