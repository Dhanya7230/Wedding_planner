import { useState } from 'react';
import type { BudgetItem, ExpenseCategory } from '../../types';
import { budgetItemSchema, EXPENSE_CATEGORIES } from '../../schemas/validation';
import { Modal } from '../common/Modal';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: BudgetItem | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Venue & Rentals');
  const [allocatedAmount, setAllocatedAmount] = useState<number | string>(0);
  const [actualAmount, setActualAmount] = useState<number | string>(0);
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevTrigger, setPrevTrigger] = useState<{ isOpen: boolean; initialData?: BudgetItem | null }>({
    isOpen,
    initialData,
  });

  if (prevTrigger.isOpen !== isOpen || prevTrigger.initialData !== initialData) {
    setPrevTrigger({ isOpen, initialData });
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setAllocatedAmount(initialData.allocatedAmount);
      setActualAmount(initialData.actualAmount);
      setIsPaid(initialData.isPaid);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setCategory('Venue & Rentals');
      setAllocatedAmount(0);
      setActualAmount(0);
      setIsPaid(false);
      setNotes('');
    }
    setErrors({});
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      title,
      category,
      allocatedAmount: Number(allocatedAmount) || 0,
      actualAmount: Number(actualAmount) || 0,
      isPaid,
      notes,
    };

    const validation = budgetItemSchema.safeParse(formData);

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

    onSave(validation.data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense Item' : 'Add New Expense Item'}
      description="Track planned allocation and actual spend for accurate budget monitoring."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="expense-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Name / Description <span className="text-rose-500">*</span>
          </label>
          <input
            id="expense-title"
            data-testid="expense-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Main Reception Catering, Bridal Bouquet"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            required
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-700 mb-1">
            Budget Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="expense-category"
            data-testid="expense-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
        </div>

        {/* Allocated & Actual Amount in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="allocated-amount" className="block text-xs font-semibold text-slate-700 mb-1">
              Allocated / Planned ($)
            </label>
            <input
              id="allocated-amount"
              data-testid="expense-allocated-input"
              type="number"
              min="0"
              step="any"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.allocatedAmount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            />
            {errors.allocatedAmount && <p className="text-xs text-rose-600 mt-1">{errors.allocatedAmount}</p>}
          </div>

          <div>
            <label htmlFor="actual-amount" className="block text-xs font-semibold text-slate-700 mb-1">
              Actual Spent ($)
            </label>
            <input
              id="actual-amount"
              data-testid="expense-amount-input"
              type="number"
              min="0"
              step="any"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.actualAmount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            />
            {errors.actualAmount && <p className="text-xs text-rose-600 mt-1">{errors.actualAmount}</p>}
          </div>
        </div>

        {/* Paid Status Toggle */}
        <div className="flex items-center space-x-3 pt-1">
          <input
            id="expense-paid"
            data-testid="expense-paid-checkbox"
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
          <label htmlFor="expense-paid" className="text-xs font-medium text-slate-700 cursor-pointer">
            Mark as Paid in Full / Deposit Settled
          </label>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="expense-notes" className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Vendor References (Optional)
          </label>
          <textarea
            id="expense-notes"
            data-testid="expense-notes-input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contract details, deposit dates, invoice numbers..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
        </div>

        {/* Form Actions */}
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
            data-testid="save-expense-btn"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
          >
            {initialData ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
