import { describe, it, expect } from 'vitest';
import { formatDateKey, formatDisplayDate, generateId } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDateKey', () => {
    it('formats date as YYYY-MM-DD string', () => {
      const date = new Date('2024-03-15');
      expect(formatDateKey(date)).toBe('2024-03-15');
    });

    it('pads single digit months and days with zeros', () => {
      const date = new Date('2024-01-05');
      expect(formatDateKey(date)).toBe('2024-01-05');
    });
  });

  describe('formatDisplayDate', () => {
    it('returns formatted display date', () => {
      const date = new Date('2024-03-15');
      const result = formatDisplayDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('returns a string', () => {
      expect(typeof generateId()).toBe('string');
    });
  });
});
