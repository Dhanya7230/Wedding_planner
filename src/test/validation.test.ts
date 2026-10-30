import { describe, it, expect } from 'vitest';
import {
  budgetItemSchema,
  totalBudgetSchema,
  timelineItemSchema,
  vendorItemSchema,
  aiPromptSchema,
} from '../schemas/validation';

describe('Zod Validation Schemas', () => {
  describe('budgetItemSchema', () => {
    it('accepts valid budget item payload', () => {
      const valid = {
        title: 'Floral Arrangements',
        category: 'Decor & Florals',
        allocatedAmount: 1500,
        actualAmount: 1400,
        isPaid: true,
        notes: 'Rose centerpieces',
      };
      const result = budgetItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects empty or too short title', () => {
      const invalid = {
        title: 'F',
        category: 'Decor & Florals',
        allocatedAmount: 500,
        actualAmount: 500,
      };
      const result = budgetItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('rejects negative allocated amount', () => {
      const invalid = {
        title: 'Catering Deposit',
        category: 'Catering & Bar',
        allocatedAmount: -100,
        actualAmount: 0,
      };
      const result = budgetItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be negative');
      }
    });

    it('rejects invalid category', () => {
      const invalid = {
        title: 'Fireworks',
        category: 'NonExistentCategory',
        allocatedAmount: 1000,
        actualAmount: 0,
      };
      const result = budgetItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('totalBudgetSchema', () => {
    it('accepts valid positive total budget', () => {
      const result = totalBudgetSchema.safeParse({ totalBudget: 25000 });
      expect(result.success).toBe(true);
    });

    it('rejects 0 or negative total budget', () => {
      const result = totalBudgetSchema.safeParse({ totalBudget: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('timelineItemSchema', () => {
    it('accepts valid timeline milestone', () => {
      const valid = {
        title: 'Book Photographer',
        phase: '6-9 Months Before',
        dueDate: '2026-12-01',
        priority: 'high',
        category: 'Photography',
        description: 'Review portfolios and sign contract',
      };
      const result = timelineItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid phase or missing title', () => {
      const invalid = {
        title: '',
        phase: 'Invalid Phase',
        dueDate: '2026-12-01',
        priority: 'high',
        category: 'Photography',
      };
      const result = timelineItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('vendorItemSchema', () => {
    it('accepts valid vendor item', () => {
      const valid = {
        name: 'The Glasshouse Pavilion',
        category: 'Venue & Rentals',
        status: 'booked',
        quotedPrice: 9500,
        depositPaid: 3000,
        contractSigned: true,
        email: 'events@glasshouse.com',
        phone: '+1 555-019-2834',
        website: 'https://glasshouseaustin.example.com',
      };
      const result = vendorItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects malformed email and negative prices', () => {
      const invalid = {
        name: 'DJ Beats',
        category: 'Music & Entertainment',
        status: 'quoted',
        quotedPrice: -500,
        depositPaid: 0,
        email: 'invalid-email-address',
      };
      const result = vendorItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('aiPromptSchema', () => {
    it('validates comprehensive event prompt data', () => {
      const valid = {
        eventType: 'wedding',
        theme: 'Modern Romance',
        guestCount: 150,
        budget: 45000,
        vibe: 'Warm, candlelight, elegant',
        location: 'Napa Valley, CA',
        specialRequirements: 'Locally sourced organic wines and vegan options',
      };
      const result = aiPromptSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid guest count or empty theme', () => {
      const invalid = {
        eventType: 'wedding',
        theme: '',
        guestCount: 0,
        budget: 5000,
        vibe: 'Fun',
        location: 'Austin',
      };
      const result = aiPromptSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

