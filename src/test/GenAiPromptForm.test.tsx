import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GenAiPromptForm } from '../components/ai/GenAiPromptForm';

describe('GenAiPromptForm Component', () => {
  const initialValues = {
    eventType: 'wedding' as const,
    theme: 'Romantic Sunset',
    guestCount: 100,
    budget: 20000,
    vibe: 'Warm, candlelight, elegant',
    location: 'Austin Garden Conservatory',
    specialRequirements: 'Vegetarian and gluten free options',
  };

  it('renders all critical inputs with proper data-testid and accessible labels', () => {
    render(
      <GenAiPromptForm
        initialValues={initialValues}
        isLoading={false}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByTestId('ai-theme-input')).toHaveValue('Romantic Sunset');
    expect(screen.getByTestId('ai-guests-input')).toHaveValue(100);
    expect(screen.getByTestId('ai-budget-input')).toHaveValue(20000);
    expect(screen.getByTestId('ai-location-input')).toHaveValue('Austin Garden Conservatory');
    expect(screen.getByTestId('ai-vibe-input')).toHaveValue('Warm, candlelight, elegant');
    expect(screen.getByTestId('generate-ideas-btn')).toBeInTheDocument();
  });

  it('submits valid data when generate button is clicked', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <GenAiPromptForm
        initialValues={initialValues}
        isLoading={false}
        onSubmit={handleSubmit}
      />
    );

    const submitBtn = screen.getByTestId('generate-ideas-btn');
    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'wedding',
        theme: 'Romantic Sunset',
        guestCount: 100,
        budget: 20000,
      })
    );
  });

  it('disables submit button and shows loading indicator while generating', () => {
    render(
      <GenAiPromptForm
        initialValues={initialValues}
        isLoading={true}
        onSubmit={vi.fn()}
      />
    );

    const submitBtn = screen.getByTestId('generate-ideas-btn');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('Synthesizing creative concepts...')).toBeInTheDocument();
  });
});
