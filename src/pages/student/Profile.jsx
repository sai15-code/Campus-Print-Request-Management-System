import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Building2,
  Phone,
  Edit2,
  Check,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';

export const Profile = () => {
  const { currentUser, updateProfile, requests } = usePrintContext();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Student One',
    email: currentUser?.email || 'student1@campus.edu',
    rollNumber: currentUser?.rollNumber || '21CS042',
    department: currentUser?.department || 'Computer Science & Engineering',
    semester: currentUser?.semester || '6th Semester',
    phone: currentUser?.phone || '+91 98765 43210',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || 'Student One',
      email: currentUser?.email || 'student1@campus.edu',
      rollNumber: currentUser?.rollNumber || '21CS042',
      department: currentUser?.department || 'Computer Science & Engineering',
      semester: currentUser?.semester || '6th Semester',
      phone: currentUser?.phone || '+91 98765 43210',
    });
    setIsEditing(false);
  };

  const totalSpent = requests
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your verified academic identity and campus printing statistics.
          </p>
        </div>

        {!isEditing && (
          <button
            id="edit-profile-btn"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Profile Header Cover / Avatar */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {currentUser?.name || 'Student One'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {currentUser?.role || 'Student'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentUser?.email || 'student1@campus.edu'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200/80 text-slate-700 font-semibold">
                  Roll: {currentUser?.rollNumber || '21CS042'}
                </span>
                <span>{currentUser?.department || 'Computer Science & Engineering'}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60 text-xs text-slate-500">
            <span>Account Created:</span>
            <span className="font-semibold text-slate-800 sm:mt-0.5">
              {currentUser?.accountCreated || 'January 15, 2024'}
            </span>
          </div>
        </div>

        {/* Profile Content / Edit Form */}
        <div className="p-6 sm:p-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  id="cancel-edit-profile-btn"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Full Name</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {currentUser?.name || 'Student One'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Campus Email</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {currentUser?.email || 'student1@campus.edu'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Role</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      Student (Campus Reprographics Authorized)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Academic Roll & Dept</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {currentUser?.rollNumber || '21CS042'} • {currentUser?.department || 'Computer Science'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Registration Date</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {currentUser?.accountCreated || 'January 15, 2024'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-blue-900 font-semibold block">Total Print Orders</span>
                    <span className="text-xs text-blue-800 mt-0.5 block">
                      {requests.length} Requests • ₹{totalSpent.toFixed(2)} Total Spent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
