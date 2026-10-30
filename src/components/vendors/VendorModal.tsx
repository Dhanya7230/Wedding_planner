import React, { useState } from 'react';
import type { VendorItem, VendorStatus } from '../../types';
import { vendorItemSchema, VENDOR_STATUSES, EXPENSE_CATEGORIES } from '../../schemas/validation';
import { Modal } from '../common/Modal';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: Omit<VendorItem, 'id' | 'createdAt'>) => void;
  initialData?: VendorItem | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Venue & Rentals');
  const [status, setStatus] = useState<VendorStatus>('researching');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number | string>(0);
  const [depositPaid, setDepositPaid] = useState<number | string>(0);
  const [contractSigned, setContractSigned] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevTrigger, setPrevTrigger] = useState<{ isOpen: boolean; initialData?: VendorItem | null }>({
    isOpen,
    initialData,
  });

  if (prevTrigger.isOpen !== isOpen || prevTrigger.initialData !== initialData) {
    setPrevTrigger({ isOpen, initialData });
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setStatus(initialData.status);
      setContactName(initialData.contactName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setWebsite(initialData.website || '');
      setQuotedPrice(initialData.quotedPrice);
      setDepositPaid(initialData.depositPaid);
      setContractSigned(initialData.contractSigned);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCategory('Venue & Rentals');
      setStatus('researching');
      setContactName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setQuotedPrice(0);
      setDepositPaid(0);
      setContractSigned(false);
      setNotes('');
    }
    setErrors({});
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      category,
      status,
      contactName,
      email: email.trim() === '' ? undefined : email.trim(),
      phone: phone.trim() === '' ? undefined : phone.trim(),
      website: website.trim() === '' ? undefined : website.trim(),
      quotedPrice: Number(quotedPrice) || 0,
      depositPaid: Number(depositPaid) || 0,
      contractSigned,
      notes,
    };

    const validation = vendorItemSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    onSave({
      ...validation.data,
      category: validation.data.category,
      rating: initialData?.rating || 5,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Vendor Details' : 'Add New Vendor'}
      description="Record key vendor contact information, contractual status, and pricing quotes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendor-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="vendor-name"
              data-testid="vendor-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grand Florals Studio"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
              required
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="vendor-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Service Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="vendor-category"
              data-testid="vendor-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="vendor-status" className="block text-xs font-semibold text-slate-700 mb-1">
            Current Status <span className="text-rose-500">*</span>
          </label>
          <select
            id="vendor-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as VendorStatus)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none capitalize"
          >
            {VENDOR_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Contact Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Contact Person
            </label>
            <input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., Sarah Parker"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="vendor-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@vendor.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            />
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendor-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              id="vendor-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            />
            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="vendor-web" className="block text-xs font-semibold text-slate-700 mb-1">
              Website / Portfolio URL
            </label>
            <input
              id="vendor-web"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.website ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            />
            {errors.website && <p className="text-xs text-rose-600 mt-1">{errors.website}</p>}
          </div>
        </div>

        {/* Pricing & Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quoted-price" className="block text-xs font-semibold text-slate-700 mb-1">
              Quoted Price ($)
            </label>
            <input
              id="quoted-price"
              data-testid="quoted-price-input"
              type="number"
              min="0"
              step="any"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="deposit-paid" className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Paid ($)
            </label>
            <input
              id="deposit-paid"
              type="number"
              min="0"
              step="any"
              value={depositPaid}
              onChange={(e) => setDepositPaid(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contract Signed Checkbox */}
        <div className="flex items-center space-x-3 pt-1">
          <input
            id="contract-signed"
            type="checkbox"
            checked={contractSigned}
            onChange={(e) => setContractSigned(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
          <label htmlFor="contract-signed" className="text-xs font-medium text-slate-700 cursor-pointer">
            Formal Contract Signed & Countersigned
          </label>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="vendor-notes" className="block text-xs font-semibold text-slate-700 mb-1">
            Notes, Deliverables, & Meeting History
          </label>
          <textarea
            id="vendor-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key discussion points, cancellation policies, package details..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
          >
            {initialData ? 'Update Vendor' : 'Save Vendor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
