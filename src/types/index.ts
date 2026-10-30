/**
 * TypeScript Type Definitions for GenAI-Powered Event Planning Assistant
 * Strictly typed with zero 'any' definitions.
 */

export type EventType = 'wedding' | 'birthday' | 'community';

export type ExpenseCategory =
  | 'Venue & Rentals'
  | 'Catering & Bar'
  | 'Photography & Video'
  | 'Music & Entertainment'
  | 'Decor & Florals'
  | 'Attire & Beauty'
  | 'Stationery & Invites'
  | 'Permits & Security'
  | 'Marketing & Outreach'
  | 'Favors & Gifts'
  | 'Miscellaneous';

export interface BudgetItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  allocated: number;
  spent: number;
  itemCount: number;
  percentageOfBudget: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  percentSpent: number;
  percentAllocated: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  categories: CategorySummary[];
}

export type TimelinePhase =
  | '12+ Months Before'
  | '6-9 Months Before'
  | '3-5 Months Before'
  | '1-2 Months Before'
  | '2 Weeks Before'
  | 'Week of Event'
  | 'Day of Event'
  | 'Post Event';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  phase: TimelinePhase;
  priority: PriorityLevel;
  isCompleted: boolean;
  completedAt?: string;
  category: string;
}

export type VendorStatus =
  | 'researching'
  | 'contacted'
  | 'quoted'
  | 'booked'
  | 'declined'
  | 'completed';

export interface VendorItem {
  id: string;
  name: string;
  category: ExpenseCategory | string;
  status: VendorStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  quotedPrice: number;
  depositPaid: number;
  notes?: string;
  rating?: number;
  contractSigned: boolean;
  createdAt: string;
}

export interface AiPromptInput {
  eventType: EventType;
  theme: string;
  guestCount: number;
  budget: number;
  vibe: string;
  location: string;
  specialRequirements?: string;
}

export interface AiActionItem {
  id: string;
  title: string;
  type: 'timeline' | 'budget' | 'vendor';
  description: string;
  estimatedCost?: number;
  category?: ExpenseCategory | string;
  dueDateOffsetDays?: number;
}

export interface AiGeneratedActivity {
  time: string;
  activity: string;
  description: string;
}

export interface AiSuggestionResponse {
  summary: string;
  conceptTitle: string;
  palette: string[];
  themeDetails: string;
  signatureTouches: string[];
  scheduleSuggestions: AiGeneratedActivity[];
  budgetOptimizationTips: string[];
  actionableAdditions: AiActionItem[];
  rawMarkdown?: string;
  generatedAt: string;
}

export interface EventPlan {
  id: string;
  eventType: EventType;
  name: string;
  hostName: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  theme: string;
  vibe: string;
  notes: string;
  expenses: BudgetItem[];
  timeline: TimelineItem[];
  vendors: VendorItem[];
  savedAiIdeas: AiSuggestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'overview' | 'budget' | 'timeline' | 'vendors' | 'genai';
