import {
  Phone,
  Mail,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  User,
} from 'lucide-react';
import type { VendorItem, VendorStatus } from '../../types';
import { VENDOR_STATUSES } from '../../schemas/validation';
import { formatCurrency } from '../../utils/budgetCalculations';

interface VendorCardProps {
  vendor: VendorItem;
  onStatusChange: (id: string, status: VendorStatus) => void;
  onEdit: (vendor: VendorItem) => void;
  onDelete: (id: string) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const statusColors: Record<VendorStatus, { bg: string; text: string; dot: string }> = {
    booked: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'Booked', dot: 'bg-emerald-500' },
    quoted: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'Quoted', dot: 'bg-amber-500' },
    contacted: { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'Contacted', dot: 'bg-blue-500' },
    researching: { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'Researching', dot: 'bg-slate-400' },
    completed: { bg: 'bg-purple-50 text-purple-800 border-purple-200', text: 'Completed', dot: 'bg-purple-500' },
    declined: { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'Declined', dot: 'bg-rose-500' },
  };

  const statusBadge = statusColors[vendor.status] || statusColors.researching;

  return (
    <article
      data-testid="vendor-card"
      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
    >
      <div>
        {/* Top Header: Name, Category, Status dropdown */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {vendor.category}
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">{vendor.name}</h4>
          </div>

          {/* Status selector toggle */}
          <div className="relative">
            <select
              data-testid="vendor-status-toggle"
              aria-label={`Change status for vendor ${vendor.name}`}
              value={vendor.status}
              onChange={(e) => onStatusChange(vendor.id, e.target.value as VendorStatus)}
              className={`text-xs font-bold py-1 px-3 rounded-full border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize ${statusBadge.bg}`}
            >
              {VENDOR_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact info list */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
          {vendor.contactName && (
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{vendor.contactName}</span>
            </div>
          )}

          {vendor.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={`mailto:${vendor.email}`}
                className="hover:text-brand-600 underline-offset-2 hover:underline truncate"
                aria-label={`Send email to ${vendor.email}`}
              >
                {vendor.email}
              </a>
            </div>
          )}

          {vendor.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={`tel:${vendor.phone}`}
                className="hover:text-brand-600 truncate"
                aria-label={`Call ${vendor.phone}`}
              >
                {vendor.phone}
              </a>
            </div>
          )}

          {vendor.website && (
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 underline-offset-2 hover:underline truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Notes preview if present */}
        {vendor.notes && (
          <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic line-clamp-2">
            "{vendor.notes}"
          </p>
        )}
      </div>

      {/* Footer: Financial & Contractual Status */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Quoted Cost</span>
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(vendor.quotedPrice)}
          </span>
          {vendor.depositPaid > 0 && (
            <span className="text-[10px] text-emerald-700 block font-medium">
              Deposit: {formatCurrency(vendor.depositPaid)}
            </span>
          )}
        </div>

        {vendor.contractSigned ? (
          <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contract Signed</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>No Contract</span>
          </span>
        )}

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onEdit(vendor)}
            aria-label={`Edit ${vendor.name}`}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(vendor.id)}
            aria-label={`Delete ${vendor.name}`}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
