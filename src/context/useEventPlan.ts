import { useContext } from 'react';
import { EventContext } from './EventContextState';

export function useEventPlan() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventPlan must be used within an EventProvider');
  }
  return context;
}

