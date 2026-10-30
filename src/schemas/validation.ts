import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'Venue & Rentals',
  'Catering & Bar',
  'Photography & Video',
  'Music & Entertainment',
  'Decor & Florals',
  'Attire & Beauty',
  'Stationery & Invites',
  'Permits & Security',
  'Marketing & Outreach',
  'Favors & Gifts',
  'Miscellaneous',
] as const;

export const TIMELINE_PHASES = [
  '12+ Months Before',
  '6-9 Months Before',
  '3-5 Months Before',
  '1-2 Months Before',
  '2 Weeks Before',
  'Week of Event',
  'Day of Event',
  'Post Event',
] as const;

export const VENDOR_STATUSES = [
  'researching',
  'contacted',
  'quoted',
  'booked',
  'declined',
  'completed',
] as const;

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;

/**
 * Zod Schema for Budget Item validation
 */
export const budgetItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'Expense title must be at least 2 characters.' })
    .max(80, { message: 'Expense title cannot exceed 80 characters.' }),
  category: z.enum(EXPENSE_CATEGORIES, {
    message: 'Please select a valid expense category.',
  }),
  allocatedAmount: z
    .number({ message: 'Allocated budget must be a number.' })
    .min(0, { message: 'Allocated amount cannot be negative.' })
    .max(10_000_000, { message: 'Amount exceeds maximum allowable threshold.' }),
  actualAmount: z
    .number({ message: 'Actual spent amount must be a number.' })
    .min(0, { message: 'Actual amount cannot be negative.' })
    .max(10_000_000, { message: 'Amount exceeds maximum allowable threshold.' }),
  isPaid: z.boolean().default(false),
  notes: z
    .string()
    .max(300, { message: 'Notes cannot exceed 300 characters.' })
    .optional()
    .or(z.literal('')),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

/**
 * Zod Schema for updating total budget
 */
export const totalBudgetSchema = z.object({
  totalBudget: z
    .number({ message: 'Total budget must be a number.' })
    .positive({ message: 'Total budget must be greater than $0.' })
    .max(50_000_000, { message: 'Total budget exceeds maximum allowable threshold.' }),
});

/**
 * Zod Schema for Timeline Item validation
 */
export const timelineItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'Milestone title must be at least 2 characters.' })
    .max(100, { message: 'Milestone title cannot exceed 100 characters.' }),
  phase: z.enum(TIMELINE_PHASES, {
    message: 'Please select a valid timeline phase.',
  }),
  dueDate: z
    .string()
    .min(1, { message: 'Due date is required.' }),
  priority: z.enum(PRIORITY_LEVELS, {
    message: 'Please select a priority level.',
  }),
  category: z
    .string()
    .trim()
    .min(1, { message: 'Category is required.' }),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional()
    .or(z.literal('')),
});

export type TimelineItemFormData = z.infer<typeof timelineItemSchema>;

/**
 * Zod Schema for Vendor Item validation
 */
export const vendorItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Vendor name must be at least 2 characters.' })
    .max(100, { message: 'Vendor name cannot exceed 100 characters.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  status: z.enum(VENDOR_STATUSES, {
    message: 'Please select a vendor status.',
  }),
  contactName: z.string().max(80).optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .email({ message: 'Please provide a valid email address.' })
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^$|^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, {
      message: 'Please provide a valid phone number.',
    })
    .optional()
    .or(z.literal('')),
  website: z.string().url({ message: 'Please provide a valid URL.' }).optional().or(z.literal('')),
  quotedPrice: z
    .number({ message: 'Quoted price must be a number.' })
    .min(0, { message: 'Quoted price cannot be negative.' })
    .max(10_000_000, { message: 'Price exceeds maximum allowable threshold.' }),
  depositPaid: z
    .number({ message: 'Deposit paid must be a number.' })
    .min(0, { message: 'Deposit cannot be negative.' }),
  contractSigned: z.boolean().default(false),
  notes: z
    .string()
    .max(500, { message: 'Notes cannot exceed 500 characters.' })
    .optional()
    .or(z.literal('')),
});

export type VendorItemFormData = z.infer<typeof vendorItemSchema>;

/**
 * Zod Schema for GenAI Prompt validation
 */
export const aiPromptSchema = z.object({
  eventType: z.enum(EVENT_TYPES, {
    message: 'Event type is required.',
  }),
  theme: z
    .string()
    .trim()
    .min(2, { message: 'Theme / concept must be at least 2 characters.' })
    .max(80, { message: 'Theme cannot exceed 80 characters.' }),
  guestCount: z
    .number({ message: 'Guest count must be a number.' })
    .int({ message: 'Guest count must be a whole number.' })
    .min(1, { message: 'Guest count must be at least 1.' })
    .max(100_000, { message: 'Guest count cannot exceed 100,000.' }),
  budget: z
    .number({ message: 'Budget must be a number.' })
    .min(0, { message: 'Budget cannot be negative.' }),
  vibe: z
    .string()
    .trim()
    .min(2, { message: 'Vibe description must be at least 2 characters.' })
    .max(80, { message: 'Vibe cannot exceed 80 characters.' }),
  location: z
    .string()
    .trim()
    .min(2, { message: 'Location must be at least 2 characters.' })
    .max(100, { message: 'Location cannot exceed 100 characters.' }),
  specialRequirements: z
    .string()
    .max(600, { message: 'Special requirements cannot exceed 600 characters.' })
    .optional()
    .or(z.literal('')),
});

export type AiPromptFormData = z.infer<typeof aiPromptSchema>;
