import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { EventProvider } from '../context/EventContext';
import { TimelineView } from '../components/timeline/TimelineView';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<EventProvider>{ui}</EventProvider>);
};

describe('TimelineView Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders interactive timeline header and filter controls', () => {
    renderWithProvider(<TimelineView />);

    expect(screen.getByText('Interactive Event Timeline')).toBeInTheDocument();
    expect(screen.getByTestId('add-milestone-btn')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search milestones...')).toBeInTheDocument();
  });

  it('opens milestone creation modal when Add Milestone is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TimelineView />);

    const addBtn = screen.getByTestId('add-milestone-btn');
    await user.click(addBtn);

    expect(screen.getByText('Add New Timeline Milestone')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-title-input')).toBeInTheDocument();
  });

  it('filters milestones when searching', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TimelineView />);

    const searchInput = screen.getByPlaceholderText('Search milestones...');
    await user.type(searchInput, 'NonExistentMilestoneTermXYZ');

    expect(screen.getByText('No milestones match your current filters.')).toBeInTheDocument();
  });
});

