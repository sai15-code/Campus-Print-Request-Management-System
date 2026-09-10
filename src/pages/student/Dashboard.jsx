import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import { CAMPUS_XEROX_CENTER } from '../../data/mockData.js';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

const WORKFLOW = [
  { key: 'PENDING', label: 'Submitted', icon: FileText },
  { key: 'ACCEPTED', label: 'Accepted', icon: Check },
  { key: 'PRINTING', label: 'Printing', icon: Printer },
  { key: 'READY', label: 'Ready', icon: PackageCheck },
  { key: 'COLLECTED', label: 'Collected', icon: ShieldCheck },
];

const STATUS_METRICS = [
  { key: 'total', label: 'Total requests', description: 'All submissions', icon: FileText, tone: 'blue', path: '/my-requests' },
  { key: 'pending', label: 'Pending', description: 'Awaiting review', icon: Clock3, tone: 'amber', path: '/my-requests?status=PENDING' },
  { key: 'printing', label: 'Printing', description: 'In the queue', icon: Printer, tone: 'indigo', path: '/my-requests?status=PRINTING' },
  { key: 'ready', label: 'Ready', description: 'Pickup available', icon: PackageCheck, tone: 'emerald', path: '/my-requests?status=READY' },
];

const toneStyles = {
  blue: { icon: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500', value: 'text-blue-700' },
  amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', value: 'text-amber-700' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500', value: 'text-indigo-700' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', value: 'text-emerald-700' },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getWorkflowIndex = (status) => {
  if (status === 'REJECTED') return 0;
  const index = WORKFLOW.findIndex((step) => step.key === status);
  return index < 0 ? 0 : index;
};

export const Dashboard = () => {
  const { currentUser } = usePrintContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRequests: 0, pendingRequests: 0, printingRequests: 0, readyRequests: 0 });
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

  const latestRequest = recentRequests[0];
  const workflowIndex = getWorkflowIndex(latestRequest?.status);
  const workflowProgress = latestRequest ? Math.round(((workflowIndex + 1) / WORKFLOW.length) * 100) : 0;
  const studentName = currentUser?.name || 'Student';
  const statusValues = {
    total: stats.totalRequests,
    pending: stats.pendingRequests,
    printing: stats.printingRequests,
    ready: stats.readyRequests,
  };
  const activeCount = useMemo(() => stats.pendingRequests + stats.printingRequests + stats.readyRequests, [stats]);

  return (
    <div className="dashboard-page mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-6">
      <section className="dashboard-reveal relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(30,41,90,0.08)] sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 sm:flex"><Sparkles className="size-5" /></div>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">Student workspace</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{getGreeting()}, {studentName}</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">Keep your campus printing moving. Submit a document, track its progress, and collect when it&apos;s ready.</p>
            </div>
          </div>
          <button id="dashboard-new-request-btn" onClick={() => navigate('/new-request')} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 lg:shrink-0"><Plus className="size-4 transition-transform group-hover:rotate-90" />New print request<ArrowRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5" /></button>
        </div>
      </section>

      {error && <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700"><span>{error}</span><button onClick={fetchDashboardStats} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white transition-colors hover:bg-rose-700"><RefreshCw className="size-3.5" />Retry</button></div>}

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="dashboard-reveal rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_rgba(30,41,90,0.05)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Latest request</p><h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{latestRequest?.documentName || 'Your workflow at a glance'}</h2></div>{latestRequest && <StatusBadge status={latestRequest.status} size="small" />}</div>
          {latestRequest ? <>
            <div className="mt-5 flex items-center justify-between text-xs"><span className="font-medium text-slate-500">Request {latestRequest.id}</span><span className="font-semibold text-indigo-600">{workflowProgress}% complete</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${workflowProgress}%` }} /></div>
            <div className="mt-5 grid grid-cols-5 gap-1">{WORKFLOW.map((step, index) => { const StepIcon = step.icon; const complete = index <= workflowIndex; return <div key={step.key} className={`flex flex-col items-center gap-2 text-center text-[10px] font-semibold ${complete ? 'text-indigo-700' : 'text-slate-400'}`}><span className={`flex size-8 items-center justify-center rounded-xl ${complete ? 'bg-indigo-50' : 'bg-slate-50'}`}><StepIcon className="size-3.5" /></span><span>{step.label}</span></div>; })}</div>
            <button onClick={() => navigate(`/requests/${latestRequest.id}`)} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700">View request details<ArrowRight className="size-3.5" /></button>
          </> : <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Submit your first document to see its progress here.</div>}
        </div>

        <div className="dashboard-reveal rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-[0_14px_40px_rgba(30,41,90,0.12)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300">At a glance</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Your print queue</h2></div><div className="flex size-10 items-center justify-center rounded-xl bg-white/10"><Printer className="size-5 text-indigo-200" /></div></div><div className="mt-7 flex items-end gap-3"><span className="text-5xl font-semibold tracking-tight">{loading ? '—' : activeCount}</span><span className="pb-2 text-xs text-slate-400">active requests</span></div><p className="mt-3 text-xs leading-5 text-slate-400">Requests move from review to printing, then to the pickup counter.</p><button onClick={() => navigate('/my-requests')} className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10">Open request history<ArrowRight className="size-3.5" /></button></div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{STATUS_METRICS.map((metric) => { const styles = toneStyles[metric.tone]; const value = statusValues[metric.key]; const ratio = stats.totalRequests ? Math.min(100, Math.round((value / stats.totalRequests) * 100)) : 0; const Icon = metric.icon; return <button key={metric.key} id={`stat-${metric.key === 'total' ? 'total-requests' : `${metric.key}-requests`}`} onClick={() => navigate(metric.path)} className="dashboard-reveal group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_10px_30px_rgba(30,41,90,0.04)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-5"><div className="flex items-start justify-between gap-2"><span className={`flex size-9 items-center justify-center rounded-xl ${styles.icon}`}><Icon className="size-4" /></span><ArrowRight className="size-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5" /></div><p className={`mt-4 text-2xl font-semibold tracking-tight ${styles.value}`}>{loading ? '—' : value}</p><p className="mt-1 text-xs font-semibold text-slate-800">{metric.label}</p><p className="mt-0.5 text-[11px] text-slate-400">{metric.description}</p><div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${loading ? 0 : ratio || (metric.key === 'total' ? 100 : 0)}%` }} /></div></button>; })}</section>

      <section className="dashboard-reveal overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(30,41,90,0.05)]"><div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Activity</p><h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Recent requests</h2></div><button id="view-all-requests-btn" onClick={() => navigate('/my-requests')} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700">View all<ArrowRight className="size-3.5" /></button></div>
        {loading ? <div className="p-10 text-center text-xs text-slate-400"><div className="mx-auto mb-3 size-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />Loading recent requests...</div> : recentRequests.length === 0 ? <div className="p-10 text-center"><div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileText className="size-6" /></div><h3 className="text-sm font-semibold text-slate-950">No print requests yet</h3><p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">Submit your first document for printing at the campus Xerox center.</p><button onClick={() => navigate('/new-request')} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"><Plus className="size-3.5" />Create request</button></div> : <div className="divide-y divide-slate-100">{recentRequests.map((req) => <button key={req.id} id={`recent-request-row-${req.id}`} onClick={() => navigate(`/requests/${req.id}`)} className="group flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-indigo-50/35 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="flex min-w-0 items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white"><FileText className="size-5" /></span><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] font-semibold text-slate-400">{req.id}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{[req.printType, req.side].filter(Boolean).join(' • ')}</span></span><span className="mt-1 block truncate text-sm font-semibold text-slate-950">{req.documentName}</span><span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-slate-400" />{req.printShop}</span><span className="inline-flex items-center gap-1"><Calendar className="size-3.5 text-slate-400" />{req.date}</span></span></span></span><span className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0"><span className="text-right"><span className="block text-[10px] font-medium text-slate-400">Total</span><span className="text-sm font-bold text-slate-950">₹{Number(req.amount || 0).toFixed(2)}</span></span><StatusBadge status={req.status} size="small" /><ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-1" /></span></button>)}</div>}
      </section>

      <section className="dashboard-reveal rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_rgba(30,41,90,0.05)] sm:p-6"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="size-5" /></div><div><h2 className="text-base font-semibold tracking-tight text-slate-950">{CAMPUS_XEROX_CENTER.name}</h2><p className="mt-0.5 text-xs text-slate-500">Official campus printing and reprographics facility</p></div></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Open today</span></div><div className="grid gap-3 pt-5 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup location</p><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800"><MapPin className="size-4 text-indigo-600" />{CAMPUS_XEROX_CENTER.location}</p></div><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours and contact</p><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800"><Clock3 className="size-4 text-indigo-600" />{CAMPUS_XEROX_CENTER.timing}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Phone className="size-3.5 text-slate-400" />{CAMPUS_XEROX_CENTER.contact}</p></div><div className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standard rates</p><div className="mt-2 flex flex-col gap-1 text-[11px] font-medium text-slate-700"><span className="flex justify-between gap-3"><span>B&W single / double</span><strong className="text-slate-950">₹2 / ₹1.5</strong></span><span className="flex justify-between gap-3"><span>Color single / double</span><strong className="text-slate-950">₹10 / ₹8</strong></span></div></div></div></section>
    </div>
  );
};

export default Dashboard;
