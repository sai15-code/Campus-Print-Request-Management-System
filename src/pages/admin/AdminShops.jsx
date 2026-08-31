import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Power,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';

export const AdminShops = () => {
  const { shops, addShop, updateShop, toggleShopStatus } = usePrintContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    location: '',
    timing: '8:00 AM - 8:00 PM (Mon - Sat)',
    contact: '+91 98765 00000',
    email: 'print@campus.edu',
    status: 'ACTIVE',
    services: 'High-Speed B&W Laser, Color HD Printing, Spiral Binding',
  });

  const [confirmToggleShop, setConfirmToggleShop] = useState(null);

  const openAddModal = () => {
    setEditingShop(null);
    setFormData({
      name: '',
      shortName: '',
      location: '',
      timing: '8:00 AM - 8:00 PM (Mon - Sat)',
      contact: '+91 98765 00000',
      email: 'print@campus.edu',
      status: 'ACTIVE',
      services: 'High-Speed B&W Laser, Color HD Printing, Spiral Binding',
    });
    setModalOpen(true);
  };

  const openEditModal = (shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name || '',
      shortName: shop.shortName || '',
      location: shop.location || '',
      timing: shop.timing || '8:00 AM - 8:00 PM (Mon - Sat)',
      contact: shop.contact || '',
      email: shop.email || '',
      status: shop.status || 'ACTIVE',
      services: Array.isArray(shop.services) ? shop.services.join(', ') : shop.services || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      return;
    }

    const servicesArray = formData.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingShop) {
      updateShop(editingShop.id, {
        name: formData.name,
        shortName: formData.shortName || formData.name,
        location: formData.location,
        timing: formData.timing,
        contact: formData.contact,
        email: formData.email,
        status: formData.status,
        services: servicesArray,
      });
    } else {
      addShop({
        name: formData.name,
        shortName: formData.shortName || formData.name,
        location: formData.location,
        timing: formData.timing,
        contact: formData.contact,
        email: formData.email,
        status: formData.status,
        services: servicesArray,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Manage Print Shops
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure campus printing facilities, locations, hours of operation, and service availability.
          </p>
        </div>

        <button
          id="btn-add-new-shop"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Print Center</span>
        </button>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shops.map((shop) => {
          const isActive = shop.status === 'ACTIVE';
          return (
            <div
              key={shop.id}
              id={`shop-card-${shop.id}`}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                {/* Top Status & ID */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {shop.id}
                  </span>
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
                    {shop.status}
                  </span>
                </div>

                {/* Name & Location */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{shop.location}</span>
                  </p>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shop.timing || '8:00 AM - 8:00 PM'}</span>
                  </div>
                  {shop.contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{shop.contact}</span>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.email}</span>
                    </div>
                  )}
                </div>

                {/* Services Tags */}
                {shop.services && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(shop.services) ? shop.services : []).map((srv, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Bottom Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`edit-shop-${shop.id}`}
                  onClick={() => openEditModal(shop)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  id={`toggle-shop-${shop.id}`}
                  onClick={() => setConfirmToggleShop(shop)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Shop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingShop ? 'Edit Print Center' : 'Add New Print Center'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Center Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. South Campus Engineering Xerox Hub"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Display Name
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g. South Xerox Hub"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location on Campus *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Block 2, Ground Floor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    placeholder="8:00 AM - 8:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="reprographics@campus.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Services Offered <span className="text-slate-400 font-normal">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="High-Speed Laser, Color HD, Spiral Binding"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                >
                  {editingShop ? 'Save Changes' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Activate/Deactivate */}
      {confirmToggleShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmToggleShop.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmToggleShop.status === 'ACTIVE'
                    ? 'Deactivate Print Center?'
                    : 'Activate Print Center?'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {confirmToggleShop.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmToggleShop.status === 'ACTIVE'
                ? 'Deactivating will mark this center as inactive for student print submissions.'
                : 'Activating will enable students to submit print jobs to this location.'}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setConfirmToggleShop(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleShopStatus(confirmToggleShop.id);
                  setConfirmToggleShop(null);
                }}
                className={`px-3.5 py-2 rounded-lg text-white cursor-pointer ${
                  confirmToggleShop.status === 'ACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {confirmToggleShop.status === 'ACTIVE' ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShops;
