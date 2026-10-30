import type { BudgetItem, BudgetSummary, CategorySummary, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../schemas/validation';

/**
 * Pure functions for Budget and Financial Calculations
 * Free of side-effects, fully testable.
 */

/**
 * Formats a numerical amount to a currency string
 */
export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  if (isNaN(amount) || !isFinite(amount)) return `${currencySymbol}0.00`;
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
}

/**
 * Calculates a safe percentage between 0 and 100+ with zero-division safeguard
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0 || isNaN(part) || part <= 0) return 0;
  const pct = (part / total) * 100;
  return Number(pct.toFixed(1));
}

/**
 * Returns financial health status for accessible alerts and visual styling
 */
export function getBudgetHealthStatus(
  spent: number,
  total: number
): 'safe' | 'warning' | 'danger' {
  if (total <= 0) return 'danger';
  const ratio = spent / total;
  if (ratio > 1.0) return 'danger';
  if (ratio >= 0.8) return 'warning';
  return 'safe';
}

/**
 * Calculates category-by-category financial aggregates
 */
export function calculateCategoryTotals(
  expenses: BudgetItem[],
  totalBudget: number
): CategorySummary[] {
  const categoryMap = new Map<ExpenseCategory, { allocated: number; spent: number; count: number }>();

  // Initialize all categories to ensure deterministic structure
  for (const cat of EXPENSE_CATEGORIES) {
    categoryMap.set(cat, { allocated: 0, spent: 0, count: 0 });
  }

  // Aggregate items
  for (const expense of expenses) {
    const existing = categoryMap.get(expense.category) ?? { allocated: 0, spent: 0, count: 0 };
    categoryMap.set(expense.category, {
      allocated: existing.allocated + (Number(expense.allocatedAmount) || 0),
      spent: existing.spent + (Number(expense.actualAmount) || 0),
      count: existing.count + 1,
    });
  }

  // Map into summary array, filtering out categories with 0 items or zero allocations unless user has items
  const summaries: CategorySummary[] = [];

  categoryMap.forEach((val, category) => {
    summaries.push({
      category,
      allocated: Number(val.allocated.toFixed(2)),
      spent: Number(val.spent.toFixed(2)),
      itemCount: val.count,
      percentageOfBudget: calculatePercentage(val.spent, totalBudget),
    });
  });

  return summaries;
}

/**
 * Main Pure Budget Aggregation Function
 */
export function calculateBudgetSummary(
  totalBudget: number,
  expenses: BudgetItem[]
): BudgetSummary {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);

  let totalAllocated = 0;
  let totalSpent = 0;

  for (const item of expenses) {
    totalAllocated += Number(item.allocatedAmount) || 0;
    totalSpent += Number(item.actualAmount) || 0;
  }

  totalAllocated = Number(totalAllocated.toFixed(2));
  totalSpent = Number(totalSpent.toFixed(2));

  const remainingBudget = Number((safeTotalBudget - totalSpent).toFixed(2));
  const isOverBudget = remainingBudget < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;

  const percentSpent = calculatePercentage(totalSpent, safeTotalBudget);
  const percentAllocated = calculatePercentage(totalAllocated, safeTotalBudget);

  const categories = calculateCategoryTotals(expenses, safeTotalBudget);

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalSpent,
    remainingBudget,
    percentSpent,
    percentAllocated,
    isOverBudget,
    overBudgetAmount,
    categories,
  };
}
