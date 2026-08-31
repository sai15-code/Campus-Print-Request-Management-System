import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  IndianRupee,
  Building2,
  Calendar,
  X,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';

export const AdminPricing = () => {
  const { pricingList, shops, addPricing, updatePricing, deletePricing, pricingRates } =
    usePrintContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [formData, setFormData] = useState({
    shopId: 'shop-main',
    printType: 'B&W',
    side: 'Single',
    pricePerPage: 2.0,
  });

  const openAddModal = () => {
    setEditingPricing(null);
    setFormData({
      shopId: shops[0]?.id || 'shop-main',
      printType: 'B&W',
      side: 'Single',
      pricePerPage: 2.0,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPricing(item);
    setFormData({
      shopId: item.shopId || shops[0]?.id || 'shop-main',
      printType: item.printType,
      side: item.side,
      pricePerPage: item.pricePerPage,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedShop = shops.find((s) => s.id === formData.shopId) || shops[0];

    if (editingPricing) {
      updatePricing(editingPricing.id, {
        shopId: formData.shopId,
        shopName: selectedShop?.name || 'Campus Central Xerox',
        printType: formData.printType,
        side: formData.side,
        pricePerPage: Number(formData.pricePerPage),
      });
    } else {
      addPricing({
        shopId: formData.shopId,
        shopName: selectedShop?.name || 'Campus Central Xerox',
        printType: formData.printType,
        side: formData.side,
        pricePerPage: Number(formData.pricePerPage),
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Manage Per-Page Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure campus printing rates for black & white and color prints. Live updates sync with student checkout.
          </p>
        </div>

        <button
          id="btn-add-pricing-rule"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pricing Rule</span>
        </button>
      </div>

      {/* Live Campus Rate Matrix Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Active Official Campus Rates Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">B&W • Single Sided</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                1 Side
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
              <span>₹{pricingRates['B&W']?.Single?.toFixed(2) || '2.00'}</span>
              <span className="text-xs font-normal text-slate-400">/ page</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">B&W • Double Sided</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Duplex
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
              <span>₹{pricingRates['B&W']?.Double?.toFixed(2) || '1.50'}</span>
              <span className="text-xs font-normal text-slate-400">/ page</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Color • Single Sided</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                HD Color
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-700 flex items-baseline gap-1">
              <span>₹{pricingRates['Color']?.Single?.toFixed(2) || '10.00'}</span>
              <span className="text-xs font-normal text-slate-400">/ page</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Color • Double Sided</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                HD Duplex
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-700 flex items-baseline gap-1">
              <span>₹{pricingRates['Color']?.Double?.toFixed(2) || '8.00'}</span>
              <span className="text-xs font-normal text-slate-400">/ page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            All Pricing Configuration Rules ({pricingList.length})
          </h2>
          <span className="text-xs text-slate-500">
            Rates auto-recalculate total amounts on print orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Print Shop</th>
                <th className="py-3 px-4">Print Type</th>
                <th className="py-3 px-4">Side Layout</th>
                <th className="py-3 px-4">Price Per Page</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pricingList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 whitespace-nowrap">
                      {item.shopName || 'Campus Central Xerox'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.printType === 'Color'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.printType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{item.side} Sided</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-sm text-slate-900">
                      ₹{Number(item.pricePerPage).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">/ pg</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {item.lastUpdated || 'Aug 01, 2026'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        id={`edit-pricing-${item.id}`}
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-pricing-${item.id}`}
                        onClick={() => {
                          if (confirm(`Remove pricing rule ${item.id}?`)) {
                            deletePricing(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingPricing ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
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
                  Target Print Center
                </label>
                <select
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Print Type
                  </label>
                  <select
                    value={formData.printType}
                    onChange={(e) => setFormData({ ...formData, printType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="B&W">B&W (Black & White)</option>
                    <option value="Color">Color HD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Side Layout
                  </label>
                  <select
                    value={formData.side}
                    onChange={(e) => setFormData({ ...formData, side: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Single">Single Sided</option>
                    <option value="Double">Double Sided (Duplex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rate Per Page (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    max="100"
                    required
                    value={formData.pricePerPage}
                    onChange={(e) => setFormData({ ...formData, pricePerPage: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Applies instantly to student quote calculations.
                </p>
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
                  {editingPricing ? 'Save Price' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
