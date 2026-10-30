import { createContext } from 'react';
import type {
  AiActionItem,
  AiSuggestionResponse,
  BudgetItem,
  BudgetSummary,
  EventPlan,
  EventType,
  TimelineItem,
  VendorItem,
  VendorStatus,
} from '../types';

export interface EventContextType {
  plan: EventPlan;
  budgetSummary: BudgetSummary;
  liveAnnouncement: string;
  announce: (message: string) => void;
  switchEventType: (type: EventType) => void;
  updateEventDetails: (details: Partial<EventPlan>) => void;
  setTotalBudget: (total: number) => void;
  addExpense: (expense: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<BudgetItem>) => void;
  deleteExpense: (id: string) => void;
  toggleExpensePaid: (id: string) => void;
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, item: Partial<TimelineItem>) => void;
  deleteTimelineItem: (id: string) => void;
  toggleTimelineItem: (id: string) => void;
  addVendor: (vendor: Omit<VendorItem, 'id' | 'createdAt'>) => void;
  updateVendor: (id: string, vendor: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;
  updateVendorStatus: (id: string, status: VendorStatus) => void;
  applyAiActionItem: (item: AiActionItem) => void;
  saveAiIdea: (idea: AiSuggestionResponse) => void;
  resetToDefaults: () => void;
  exportPlanAsJson: () => string;
  importPlanFromJson: (jsonStr: string) => boolean;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

