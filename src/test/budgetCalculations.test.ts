import {
  calculateBudgetSummary,
  calculateCategoryTotals,
  formatCurrency,
  getBudgetHealthStatus,
} from '../utils/budgetCalculations';
import type { BudgetItem } from '../types';

describe('Budget Calculations Pure Functions', () => {
  const mockExpenses: BudgetItem[] = [
    {
      id: '1',
      title: 'Venue Deposit',
      category: 'Venue & Rentals',
      allocatedAmount: 5000,
      actualAmount: 5200,
      isPaid: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      title: 'DJ Booking',
      category: 'Music & Entertainment',
      allocatedAmount: 1500,
      actualAmount: 1400,
      isPaid: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '3',
      title: 'Floral Centerpieces',
      category: 'Decor & Florals',
      allocatedAmount: 1000,
      actualAmount: 900,
      isPaid: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  it('correctly calculates remaining funds and totals within budget', () => {
    const totalBudget = 10000;
    const summary = calculateBudgetSummary(totalBudget, mockExpenses);

    // 5200 + 1400 + 900 = 7500
    expect(summary.totalSpent).toBe(7500);
    // 5000 + 1500 + 1000 = 7500
    expect(summary.totalAllocated).toBe(7500);
    // 10000 - 7500 = 2500
    expect(summary.remainingBudget).toBe(2500);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overBudgetAmount).toBe(0);
    expect(summary.percentSpent).toBe(75);
  });

  it('correctly flags overbudget status and computes excess amount', () => {
    const totalBudget = 7000; // Spent is 7500
    const summary = calculateBudgetSummary(totalBudget, mockExpenses);

    expect(summary.remainingBudget).toBe(-500);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(500);
    expect(summary.percentSpent).toBe(107.1);
  });

  it('handles edge case of zero budget safely without NaN or division by zero', () => {
    const summary = calculateBudgetSummary(0, mockExpenses);

    expect(summary.totalBudget).toBe(0);
    expect(summary.percentSpent).toBe(0);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.remainingBudget).toBe(-7500);
  });

  it('handles empty expense array cleanly', () => {
    const summary = calculateBudgetSummary(15000, []);

    expect(summary.totalSpent).toBe(0);
    expect(summary.totalAllocated).toBe(0);
    expect(summary.remainingBudget).toBe(15000);
    expect(summary.percentSpent).toBe(0);
    expect(summary.isOverBudget).toBe(false);
  });

  it('formats currency correctly with positive, negative, and zero values', () => {
    expect(formatCurrency(2500)).toBe('$2,500.00');
    expect(formatCurrency(-450.5)).toBe('-$450.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('returns proper financial health statuses', () => {
    expect(getBudgetHealthStatus(5000, 10000)).toBe('safe'); // 50%
    expect(getBudgetHealthStatus(8500, 10000)).toBe('warning'); // 85%
    expect(getBudgetHealthStatus(10500, 10000)).toBe('danger'); // 105%
    expect(getBudgetHealthStatus(500, 0)).toBe('danger'); // 0 total
  });

  it('aggregates category totals with correct item counts and allocation', () => {
    const categories = calculateCategoryTotals(mockExpenses, 10000);
    const venueCat = categories.find((c) => c.category === 'Venue & Rentals');

    expect(venueCat).toBeDefined();
    expect(venueCat?.spent).toBe(5200);
    expect(venueCat?.allocated).toBe(5000);
    expect(venueCat?.itemCount).toBe(1);
    expect(venueCat?.percentageOfBudget).toBe(52);
  });
});
