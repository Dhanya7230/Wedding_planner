import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { EventProvider } from '../context/EventContext';
import { BudgetWidget } from '../components/budget/BudgetWidget';

// Helper wrapper
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<EventProvider>{ui}</EventProvider>);
};

describe('BudgetWidget Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Dynamic Budget Tracker title and displays remaining funds', () => {
    renderWithProvider(<BudgetWidget />);

    expect(screen.getByText('Dynamic Budget Tracker')).toBeInTheDocument();
    expect(screen.getByTestId('remaining-budget-display')).toBeInTheDocument();
    expect(screen.getByTestId('add-expense-btn')).toBeInTheDocument();
  });

  it('opens expense modal when Add Expense button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<BudgetWidget />);

    const addBtn = screen.getByTestId('add-expense-btn');
    await user.click(addBtn);

    expect(screen.getByText('Add New Expense Item')).toBeInTheDocument();
    expect(screen.getByTestId('expense-title-input')).toBeInTheDocument();
  });

  it('validates required fields using Zod and prevents empty submission', async () => {
    const user = userEvent.setup();
    renderWithProvider(<BudgetWidget />);

    // Open modal
    await user.click(screen.getByTestId('add-expense-btn'));

    // Try submitting with empty title
    const saveBtn = screen.getByTestId('save-expense-btn');
    await user.click(saveBtn);

    // Modal remains open because required title is missing
    expect(screen.getByText('Add New Expense Item')).toBeInTheDocument();
  });

  it('successfully creates an expense and recalculates budget metrics', async () => {
    const user = userEvent.setup();
    renderWithProvider(<BudgetWidget />);

    const initialRemaining = screen.getByTestId('remaining-budget-display').textContent;

    // Open add modal
    await user.click(screen.getByTestId('add-expense-btn'));

    // Fill form
    const titleInput = screen.getByTestId('expense-title-input');
    await user.type(titleInput, 'Custom Handcrafted Signage');

    const allocatedInput = screen.getByTestId('expense-allocated-input');
    await user.clear(allocatedInput);
    await user.type(allocatedInput, '500');

    const amountInput = screen.getByTestId('expense-amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '450');

    // Submit form
    await user.click(screen.getByTestId('save-expense-btn'));

    // Wait for modal to close and new item to appear
    await waitFor(() => {
      expect(screen.queryByText('Add New Expense Item')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Handcrafted Signage')).toBeInTheDocument();
    });

    // Check that remaining funds changed
    const newRemaining = screen.getByTestId('remaining-budget-display').textContent;
    expect(newRemaining).not.toBe(initialRemaining);
  });
});
