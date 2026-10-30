import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import confetti from 'canvas-confetti';
import { EXPENSE_CATEGORIES } from '../schemas/validation';
import type {
  AiActionItem,
  AiSuggestionResponse,
  BudgetItem,
  EventPlan,
  EventType,
  ExpenseCategory,
  TimelineItem,
  VendorItem,
  VendorStatus,
} from '../types';
import { getDefaultEventPlan } from '../utils/defaultData';
import { calculateBudgetSummary } from '../utils/budgetCalculations';
import { EventContext } from './EventContextState';

const STORAGE_PREFIX = 'celebrationcraft_plan_v2_';

export function EventProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<EventPlan>(() => {
    try {
      const savedType = (localStorage.getItem('celebrationcraft_active_type') as EventType) || 'wedding';
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${savedType}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading initial state from localStorage:', e);
    }
    return getDefaultEventPlan('wedding');
  });

  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Accessible screen reader announcer
  const announce = useCallback((message: string) => {
    setLiveAnnouncement(message);
    const timer = setTimeout(() => setLiveAnnouncement(''), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${plan.eventType}`, JSON.stringify(plan));
      localStorage.setItem('celebrationcraft_active_type', plan.eventType);
    } catch (e) {
      console.error('Failed persisting plan to localStorage:', e);
    }
  }, [plan]);

  // Expensive budget calculation optimized via useMemo
  const budgetSummary = useMemo(() => {
    return calculateBudgetSummary(plan.totalBudget, plan.expenses);
  }, [plan.totalBudget, plan.expenses]);

  // Switch Event Template
  const switchEventType = useCallback((newType: EventType) => {
    try {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${newType}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPlan(parsed);
      } else {
        const fresh = getDefaultEventPlan(newType);
        setPlan(fresh);
      }
      announce(`Switched event type to ${newType}. Loaded relevant timeline, checklist, and budget.`);
    } catch (err) {
      console.error('Error switching event type:', err);
      const fallback = getDefaultEventPlan(newType);
      setPlan(fallback);
    }
  }, [announce]);

  // Update overall event metadata
  const updateEventDetails = useCallback((details: Partial<EventPlan>) => {
    setPlan((prev) => ({
      ...prev,
      ...details,
      updatedAt: new Date().toISOString(),
    }));
    announce('Event details updated successfully.');
  }, [announce]);

  // Update total budget
  const setTotalBudget = useCallback((total: number) => {
    const safeTotal = Math.max(0, Number(total) || 0);
    setPlan((prev) => ({
      ...prev,
      totalBudget: safeTotal,
      updatedAt: new Date().toISOString(),
    }));
    announce(`Total budget updated to $${safeTotal.toLocaleString()}.`);
  }, [announce]);

  // Budget Actions
  const addExpense = useCallback((expense: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: BudgetItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setPlan((prev) => ({
      ...prev,
      expenses: [newItem, ...prev.expenses],
      updatedAt: now,
    }));
    announce(`Added expense item: ${expense.title}`);
  }, [announce]);

  const updateExpense = useCallback((id: string, changes: Partial<BudgetItem>) => {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.map((item) =>
        item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
      ),
      updatedAt: new Date().toISOString(),
    }));
    announce('Expense updated successfully.');
  }, [announce]);

  const deleteExpense = useCallback((id: string) => {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    announce('Expense item removed.');
  }, [announce]);

  const toggleExpensePaid = useCallback((id: string) => {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id ? { ...e, isPaid: !e.isPaid, updatedAt: new Date().toISOString() } : e
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Timeline Actions
  const addTimelineItem = useCallback((item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `time-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setPlan((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newItem],
      updatedAt: new Date().toISOString(),
    }));
    announce(`Added milestone: ${item.title}`);
  }, [announce]);

  const updateTimelineItem = useCallback((id: string, changes: Partial<TimelineItem>) => {
    setPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      ),
      updatedAt: new Date().toISOString(),
    }));
    announce('Milestone updated.');
  }, [announce]);

  const deleteTimelineItem = useCallback((id: string) => {
    setPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    announce('Milestone removed.');
  }, [announce]);

  const toggleTimelineItem = useCallback((id: string) => {
    setPlan((prev) => {
      let isNowCompleted = false;
      const updatedTimeline = prev.timeline.map((item) => {
        if (item.id === id) {
          isNowCompleted = !item.isCompleted;
          return {
            ...item,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return item;
      });

      if (isNowCompleted) {
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#d94c7f', '#dfc699', '#059669', '#3b82f6'],
          });
        } catch {
          // ignore in headless test environments
        }
      }

      return {
        ...prev,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Vendor Actions
  const addVendor = useCallback((vendor: Omit<VendorItem, 'id' | 'createdAt'>) => {
    const newItem: VendorItem = {
      ...vendor,
      id: `ven-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setPlan((prev) => ({
      ...prev,
      vendors: [newItem, ...prev.vendors],
      updatedAt: new Date().toISOString(),
    }));
    announce(`Added vendor: ${vendor.name}`);
  }, [announce]);

  const updateVendor = useCallback((id: string, changes: Partial<VendorItem>) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, ...changes } : v)),
      updatedAt: new Date().toISOString(),
    }));
    announce('Vendor details updated.');
  }, [announce]);

  const deleteVendor = useCallback((id: string) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    announce('Vendor removed.');
  }, [announce]);

  const updateVendorStatus = useCallback((id: string, status: VendorStatus) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
      updatedAt: new Date().toISOString(),
    }));
    announce(`Vendor status changed to ${status}.`);
  }, [announce]);

  // Apply action item generated by GenAI
  const applyAiActionItem = useCallback((action: AiActionItem) => {
    if (action.type === 'budget') {
      const isValidCategory = (cat?: string): cat is ExpenseCategory =>
        typeof cat === 'string' && (EXPENSE_CATEGORIES as readonly string[]).includes(cat);

      const newExpense: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'> = {
        title: action.title,
        category: isValidCategory(action.category) ? action.category : 'Miscellaneous',
        allocatedAmount: action.estimatedCost || 300,
        actualAmount: 0,
        isPaid: false,
        notes: `Suggested by GenAI: ${action.description}`,
      };
      addExpense(newExpense);
    } else if (action.type === 'timeline') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (action.dueDateOffsetDays || 7));
      const newMilestone: Omit<TimelineItem, 'id'> = {
        title: action.title,
        phase: '1-2 Months Before',
        dueDate: targetDate.toISOString().split('T')[0],
        priority: 'medium',
        isCompleted: false,
        category: action.category || 'Planning',
        description: action.description,
      };
      addTimelineItem(newMilestone);
    } else if (action.type === 'vendor') {
      const newVendor: Omit<VendorItem, 'id' | 'createdAt'> = {
        name: action.title,
        category: action.category || 'Vendor',
        status: 'researching',
        quotedPrice: action.estimatedCost || 0,
        depositPaid: 0,
        contractSigned: false,
        notes: action.description,
      };
      addVendor(newVendor);
    }
  }, [addExpense, addTimelineItem, addVendor]);

  const saveAiIdea = useCallback((idea: AiSuggestionResponse) => {
    setPlan((prev) => ({
      ...prev,
      savedAiIdeas: [idea, ...prev.savedAiIdeas],
      updatedAt: new Date().toISOString(),
    }));
    announce('AI inspiration saved to event plan.');
  }, [announce]);

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultEventPlan(plan.eventType);
    setPlan(defaults);
    announce(`Reset ${plan.eventType} to default template.`);
  }, [plan.eventType, announce]);

  const exportPlanAsJson = useCallback(() => {
    return JSON.stringify(plan, null, 2);
  }, [plan]);

  const importPlanFromJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr) as EventPlan;
      if (!parsed.id || !parsed.eventType || !Array.isArray(parsed.expenses)) {
        return false;
      }
      setPlan(parsed);
      announce('Event plan imported successfully.');
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }, [announce]);

  return (
    <EventContext.Provider
      value={{
        plan,
        budgetSummary,
        liveAnnouncement,
        announce,
        switchEventType,
        updateEventDetails,
        setTotalBudget,
        addExpense,
        updateExpense,
        deleteExpense,
        toggleExpensePaid,
        addTimelineItem,
        updateTimelineItem,
        deleteTimelineItem,
        toggleTimelineItem,
        addVendor,
        updateVendor,
        deleteVendor,
        updateVendorStatus,
        applyAiActionItem,
        saveAiIdea,
        resetToDefaults,
        exportPlanAsJson,
        importPlanFromJson,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}
