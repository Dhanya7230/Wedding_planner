import React from 'react';

interface LiveAnnouncerProps {
  message: string;
}

/**
 * WCAG 2.1 AA Compliant ARIA Live Region
 * Announces dynamic updates, errors, and changes to assistive technology screen readers.
 */
export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="live-announcer"
    >
      {message}
    </div>
  );
};
