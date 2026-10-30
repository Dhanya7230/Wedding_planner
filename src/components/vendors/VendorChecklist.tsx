import React, { useState, useMemo, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import type { VendorItem } from '../../types';
import { EXPENSE_CATEGORIES } from '../../schemas/validation';
import { formatCurrency } from '../../utils/budgetCalculations';
import { VendorCard } from './VendorCard';
import { VendorModal } from './VendorModal';

export const VendorChecklist: React.FC = () => {
  const { plan, addVendor, updateVendor, deleteVendor, updateVendorStatus } = useEventPlan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Performance optimization: memoized filtered list
  const filteredVendors = useMemo(() => {
    return plan.vendors.filter((v) => {
      const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.contactName && v.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [plan.vendors, selectedStatus, selectedCategory, searchTerm]);

  // Aggregate statistics
  const metrics = useMemo(() => {
    let bookedCount = 0;
    let totalQuoted = 0;
    let totalDeposits = 0;

    for (const v of plan.vendors) {
      if (v.status === 'booked' || v.status === 'completed') {
        bookedCount++;
      }
      totalQuoted += Number(v.quotedPrice) || 0;
      totalDeposits += Number(v.depositPaid) || 0;
    }

    return {
      total: plan.vendors.length,
      booked: bookedCount,
      quoted: totalQuoted,
      deposits: totalDeposits,
    };
  }, [plan.vendors]);

  // Callbacks
  const handleOpenAdd = useCallback(() => {
    setEditingVendor(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((vendor: VendorItem) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  }, []);

  const handleSaveVendor = useCallback(
    (vendorData: Omit<VendorItem, 'id' | 'createdAt'>) => {
      if (editingVendor) {
        updateVendor(editingVendor.id, vendorData);
      } else {
        addVendor(vendorData);
      }
    },
    [editingVendor, updateVendor, addVendor]
  );

  return (
    <section aria-labelledby="vendor-heading" className="space-y-8 animate-fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            id="vendor-heading"
            className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight"
          >
            Vendor Management & Checklist
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track inquiries, quotes, contracts, and payment obligations across all event partners.
          </p>
        </div>

        <button
          type="button"
          data-testid="add-vendor-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vendors</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
          <p className="text-[11px] text-slate-400 mt-1">Active partners across all categories</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contracts Booked</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-700">
            {metrics.booked} / {metrics.total}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Confirmed with signed agreements</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Quoted</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.quoted)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Combined vendor estimate cost</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deposits Paid</span>
            <FileCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.deposits)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Initial commitments delivered</p>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Status Filters */}
        <div
          role="group"
          aria-label="Filter vendors by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          {['all', 'booked', 'quoted', 'contacted', 'researching'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-medium">No vendors match your search criteria.</p>
          <p className="text-xs text-slate-400">
            Click "Add New Vendor" to register a caterer, venue, or entertainer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onStatusChange={updateVendorStatus}
              onEdit={handleOpenEdit}
              onDelete={deleteVendor}
            />
          ))}
        </div>
      )}

      {/* Vendor Add/Edit Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVendor}
        initialData={editingVendor}
      />
    </section>
  );
};
