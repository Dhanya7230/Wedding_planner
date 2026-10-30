import React, { useState, useMemo, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Search,
  Filter,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import type { BudgetItem } from '../../types';
import { formatCurrency, getBudgetHealthStatus } from '../../utils/budgetCalculations';
import { EXPENSE_CATEGORIES, totalBudgetSchema } from '../../schemas/validation';
import { ProgressBar } from '../common/ProgressBar';
import { ExpenseModal } from './ExpenseModal';

export const BudgetWidget: React.FC = () => {
  const {
    plan,
    budgetSummary,
    setTotalBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpensePaid,
  } = useEventPlan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingBudgetLimit, setEditingBudgetLimit] = useState(false);
  const [budgetLimitInput, setBudgetLimitInput] = useState(plan.totalBudget.toString());
  const [budgetLimitError, setBudgetLimitError] = useState<string | null>(null);

  // Handle total budget update with Zod validation
  const handleBudgetLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetLimitError(null);
    const parsed = Number(budgetLimitInput);
    const result = totalBudgetSchema.safeParse({ totalBudget: parsed });

    if (!result.success) {
      setBudgetLimitError(result.error.issues[0]?.message || 'Invalid budget limit.');
      return;
    }

    setTotalBudget(result.data.totalBudget);
    setEditingBudgetLimit(false);
  };

  // Filtered expense list using useMemo to avoid recalculating on un-related renders
  const filteredExpenses = useMemo(() => {
    return plan.expenses.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [plan.expenses, searchTerm, selectedCategory]);

  // Memoized categories that actually have allocated or spent funds for the breakdown view
  const activeCategories = useMemo(() => {
    return budgetSummary.categories.filter((c) => c.allocated > 0 || c.spent > 0 || c.itemCount > 0);
  }, [budgetSummary.categories]);

  // Financial health indicator
  const healthStatus = useMemo(() => {
    return getBudgetHealthStatus(budgetSummary.totalSpent, budgetSummary.totalBudget);
  }, [budgetSummary.totalSpent, budgetSummary.totalBudget]);

  // Callbacks for modal and actions
  const handleOpenAddModal = useCallback(() => {
    setEditingExpense(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((expense: BudgetItem) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }, []);

  const handleSaveExpense = useCallback(
    (expenseData: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingExpense) {
        updateExpense(editingExpense.id, expenseData);
      } else {
        addExpense(expenseData);
      }
    },
    [editingExpense, updateExpense, addExpense]
  );

  return (
    <section aria-labelledby="budget-section-heading" className="space-y-8 animate-fade-in">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            id="budget-section-heading"
            className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight"
          >
            Dynamic Budget Tracker
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time financial breakdown, category allocations, and expense verification.
          </p>
        </div>

        <button
          type="button"
          data-testid="add-expense-btn"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Overbudget Warning Alert if applicable */}
      {budgetSummary.isOverBudget && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="overbudget-alert"
          className="flex items-start space-x-3 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-800 shadow-sm animate-pulse-subtle"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Budget Limit Exceeded!</h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Current expenses exceed your total budget cap by{' '}
              <span className="font-bold underline">
                {formatCurrency(budgetSummary.overBudgetAmount)}
              </span>
              . Consider optimizing non-essential categories or adjusting your overall budget.
            </p>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card (Editable) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Budget</span>
            <DollarSign className="w-4 h-4 text-brand-500" />
          </div>

          {editingBudgetLimit ? (
            <form onSubmit={handleBudgetLimitSubmit} className="space-y-2 mt-1">
              <input
                type="number"
                data-testid="budget-total-input"
                value={budgetLimitInput}
                onChange={(e) => setBudgetLimitInput(e.target.value)}
                className="w-full text-lg font-bold px-2 py-1 border border-brand-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200"
                min="100"
                autoFocus
              />
              {budgetLimitError && (
                <p className="text-[11px] text-rose-600">{budgetLimitError}</p>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-semibold bg-brand-600 text-white rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBudgetLimit(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(budgetSummary.totalBudget)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setBudgetLimitInput(plan.totalBudget.toString());
                  setBudgetLimitError(null);
                  setEditingBudgetLimit(true);
                }}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium opacity-80 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </button>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Planned ceiling for entire event</p>
        </div>

        {/* Total Spent Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Actual Spent</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(budgetSummary.totalSpent)}
          </span>
          <div className="mt-2">
            <ProgressBar
              value={budgetSummary.totalSpent}
              max={budgetSummary.totalBudget}
              size="sm"
              variant="auto"
              showPercentage={false}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              {budgetSummary.percentSpent}% of total budget consumed
            </span>
          </div>
        </div>

        {/* Remaining Funds Card */}
        <div
          className={`p-5 rounded-2xl border shadow-sm ${
            budgetSummary.isOverBudget
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining Funds</span>
            {budgetSummary.isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <span
            data-testid="remaining-budget-display"
            className={`text-2xl font-bold tracking-tight ${
              budgetSummary.isOverBudget ? 'text-rose-700' : 'text-emerald-800'
            }`}
          >
            {formatCurrency(budgetSummary.remainingBudget)}
          </span>
          <p
            className={`text-[11px] mt-2 ${
              budgetSummary.isOverBudget ? 'text-rose-600 font-semibold' : 'text-emerald-700'
            }`}
          >
            {budgetSummary.isOverBudget
              ? 'Requires spending adjustments'
              : 'Available for remaining bookings'}
          </p>
        </div>

        {/* Total Allocated Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Allocated</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(budgetSummary.totalAllocated)}
          </span>
          <p className="text-[11px] text-slate-500 mt-2">
            {budgetSummary.percentAllocated}% committed across categories
          </p>
        </div>
      </div>

      {/* Visual Progress Bar Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Total Budget Utilization</h3>
            <p className="text-xs text-slate-500">
              Visual indicator of spent funds vs. configured financial cap.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              healthStatus === 'danger'
                ? 'bg-rose-100 text-rose-800'
                : healthStatus === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {healthStatus === 'danger'
              ? 'Critical Over-Budget'
              : healthStatus === 'warning'
              ? 'Approaching Limit'
              : 'Healthy Balance'}
          </span>
        </div>

        <ProgressBar
          value={budgetSummary.totalSpent}
          max={budgetSummary.totalBudget}
          size="lg"
          variant="auto"
          label="Budget Consumed"
        />
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span>Expense Categories Breakdown</span>
          <span className="text-xs font-normal text-slate-500">
            ({activeCategories.length} active categories)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCategories.map((cat) => (
            <div
              key={cat.category}
              className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat.category}</h4>
                  <span className="text-[11px] text-slate-400">{cat.itemCount} item(s)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(cat.spent)}
                </span>
              </div>
              <ProgressBar
                value={cat.spent}
                max={budgetSummary.totalBudget}
                size="sm"
                variant="primary"
                showPercentage={false}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                <span>Allocated: {formatCurrency(cat.allocated)}</span>
                <span>{cat.percentageOfBudget}% of budget</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Expense Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detailed Expense Items</h3>
            <p className="text-xs text-slate-500">
              Manage itemized line items, contract commitments, and payment status.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search expenses..."
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

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">Expense Title</th>
                <th scope="col" className="py-3 px-4">Category</th>
                <th scope="col" className="py-3 px-4">Allocated</th>
                <th scope="col" className="py-3 px-4">Actual Spend</th>
                <th scope="col" className="py-3 px-4 text-center">Payment Status</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No expense items match your criteria. Click "Add Expense Item" to create one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    data-testid="expense-item"
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{expense.title}</div>
                      {expense.notes && (
                        <div className="text-xs text-slate-400 truncate max-w-xs">{expense.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {formatCurrency(expense.allocatedAmount)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(expense.actualAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleExpensePaid(expense.id)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          expense.isPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        aria-label={`Toggle paid status for ${expense.title}. Currently ${
                          expense.isPaid ? 'Paid' : 'Pending'
                        }`}
                      >
                        {expense.isPaid ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          data-testid="expense-edit-btn"
                          onClick={() => handleOpenEditModal(expense)}
                          aria-label={`Edit ${expense.title}`}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          data-testid="expense-delete-btn"
                          onClick={() => deleteExpense(expense.id)}
                          aria-label={`Delete ${expense.title}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />
    </section>
  );
};
