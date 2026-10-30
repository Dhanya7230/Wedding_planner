import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { EventProvider } from '../context/EventContext';
import { VendorChecklist } from '../components/vendors/VendorChecklist';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<EventProvider>{ui}</EventProvider>);
};

describe('VendorChecklist Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders vendor checklist header and financial metrics', () => {
    renderWithProvider(<VendorChecklist />);

    expect(screen.getByText('Vendor Management & Checklist')).toBeInTheDocument();
    expect(screen.getByTestId('add-vendor-btn')).toBeInTheDocument();
    expect(screen.getByText('Contracts Booked')).toBeInTheDocument();
  });

  it('opens vendor modal when Add Vendor button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<VendorChecklist />);

    const addBtn = screen.getByTestId('add-vendor-btn');
    await user.click(addBtn);

    expect(screen.getByRole('heading', { name: 'Add New Vendor' })).toBeInTheDocument();
    expect(screen.getByTestId('vendor-name-input')).toBeInTheDocument();
  });
});

