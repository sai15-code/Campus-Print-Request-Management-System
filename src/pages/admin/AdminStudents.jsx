import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  Power,
  UserCheck,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  X,
  FileText,
  IndianRupee,
  RotateCcw,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import api from '../../utils/api.js';

export const AdminStudents = () => {
  const { showToast } = usePrintContext();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminStudents();
      setStudents(data?.students || []);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Admin session expired or unauthorized. Please sign in again.');
      } else {
        setError(err?.message || 'Failed to load student directory.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (studentId) => {
    try {
      setTogglingId(studentId);
      const res = await api.toggleAdminStudentStatus(studentId);
      const newStatus = res?.status || (students.find(s => s.id === studentId)?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      
      setStudents((prev) =>
        prev.map((stu) =>
          stu.id === studentId
            ? { ...stu, status: newStatus }
            : stu
        )
      );

      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }

      showToast(`Student status updated to ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to update student status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        stu.name?.toLowerCase().includes(q) ||
        stu.email?.toLowerCase().includes(q) ||
        stu.rollNumber?.toLowerCase().includes(q) ||
        stu.department?.toLowerCase().includes(q) ||
        stu.id?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || stu.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Student Accounts Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View registered student profiles, verify department enrollments, and manage account statuses.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
          {loading ? '...' : students.length} Registered Students
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStudents}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-students-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, email, or department..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="filter-student-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="INACTIVE">INACTIVE Only</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-xs text-slate-500">Loading student directory from database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No student accounts matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department & Roll</th>
                  <th className="py-3 px-4 whitespace-nowrap">Registered On</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((stu) => {
                  const isActive = stu.status === 'ACTIVE';
                  const isToggling = togglingId === stu.id;
                  return (
                    <tr
                      key={stu.id}
                      id={`student-row-${stu.id}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {stu.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                            {stu.name ? stu.name.charAt(0) : 'S'}
                          </div>
                          <span>{stu.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {stu.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {stu.department || 'Engineering'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {stu.rollNumber || 'N/A'} • {stu.semester || 'Current Semester'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {stu.registrationDate || 'Jan 15, 2024'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {stu.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            id={`view-student-${stu.id}`}
                            onClick={() => setSelectedStudent(stu)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Profile</span>
                          </button>

                          <button
                            id={`toggle-student-${stu.id}`}
                            disabled={isToggling}
                            onClick={() => handleToggleStatus(stu.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                              isActive
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isToggling ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200">
                  {selectedStudent.name ? selectedStudent.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudent.id} • {selectedStudent.rollNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Total Print Jobs</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {selectedStudent.totalOrders ?? 0} requests
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-indigo-600 block text-[11px] font-medium">Total Paid Volume</span>
                <span className="text-lg font-bold text-indigo-700 mt-0.5 block">
                  ₹{Number(selectedStudent.totalSpent || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Student info fields */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.email}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.department}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Semester:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.semester || '6th Semester'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.phone || '+91 98765 43210'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Registration Date:</span>
                <span className="font-semibold text-slate-900">{selectedStudent.registrationDate || 'Jan 15, 2024'}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Account Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    selectedStudent.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={togglingId === selectedStudent.id}
                onClick={() => handleToggleStatus(selectedStudent.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                  selectedStudent.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {togglingId === selectedStudent.id ? 'Updating...' : selectedStudent.status === 'ACTIVE' ? 'Deactivate Student' : 'Activate Student'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
