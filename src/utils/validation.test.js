import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateRequired,
  validateLength,
  validateUrl,
  validateEmail,
  validateNumber,
  validateTodo,
  validateNote,
  MAX_LENGTHS,
} from './validation';

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should limit string length', () => {
    const longString = 'a'.repeat(1000);
    expect(sanitizeString(longString, 100).length).toBe(100);
  });

  it('should return empty string for non-string values', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });
});

describe('validateRequired', () => {
  it('should pass for non-empty strings', () => {
    const result = validateRequired('hello', 'Field');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('hello');
  });

  it('should fail for empty strings', () => {
    const result = validateRequired('', 'Name');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it('should fail for whitespace-only strings', () => {
    const result = validateRequired('   ', 'Field');
    expect(result.valid).toBe(false);
  });
});

describe('validateLength', () => {
  it('should pass for strings within limit', () => {
    const result = validateLength('hello', 10, 'Field');
    expect(result.valid).toBe(true);
  });

  it('should fail for strings exceeding limit', () => {
    const result = validateLength('hello world', 5, 'Title');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Title must be 5 characters or less');
  });
});

describe('validateUrl', () => {
  it('should pass for valid URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('http://test.org/path').valid).toBe(true);
  });

  it('should add https:// to URLs without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('https://example.com/');
  });

  it('should fail for invalid URLs', () => {
    expect(validateUrl('not a url').valid).toBe(false);
    expect(validateUrl('').valid).toBe(false);
  });

  it('should reject non-http protocols', () => {
    const result = validateUrl('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('should pass for valid emails', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('user.name@domain.co.uk').valid).toBe(true);
  });

  it('should fail for invalid emails', () => {
    expect(validateEmail('invalid').valid).toBe(false);
    expect(validateEmail('test@').valid).toBe(false);
    expect(validateEmail('@domain.com').valid).toBe(false);
  });

  it('should normalize email to lowercase', () => {
    const result = validateEmail('Test@Example.COM');
    expect(result.value).toBe('test@example.com');
  });
});

describe('validateNumber', () => {
  it('should pass for numbers within range', () => {
    const result = validateNumber(50, 0, 100);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(50);
  });

  it('should fail for numbers below minimum', () => {
    const result = validateNumber(-5, 0, 100, 'Amount');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Amount must be at least 0');
  });

  it('should fail for numbers above maximum', () => {
    const result = validateNumber(150, 0, 100, 'Value');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Value must be at most 100');
  });

  it('should parse string numbers', () => {
    const result = validateNumber('42', 0, 100);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(42);
  });

  it('should fail for non-numeric strings', () => {
    const result = validateNumber('abc', 0, 100);
    expect(result.valid).toBe(false);
  });
});

describe('validateTodo', () => {
  it('should pass for valid todo text', () => {
    const result = validateTodo('Buy groceries');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('Buy groceries');
  });

  it('should trim whitespace', () => {
    const result = validateTodo('  Clean room  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('Clean room');
  });

  it('should fail for empty text', () => {
    const result = validateTodo('');
    expect(result.valid).toBe(false);
  });

  it('should truncate long text', () => {
    const longText = 'a'.repeat(600);
    const result = validateTodo(longText);
    expect(result.valid).toBe(true);
    expect(result.value.length).toBe(MAX_LENGTHS.todoText);
  });
});

describe('validateNote', () => {
  it('should pass for valid note with title and content', () => {
    const result = validateNote('My Note', 'Some content');
    expect(result.valid).toBe(true);
    expect(result.value.title).toBe('My Note');
    expect(result.value.content).toBe('Some content');
  });

  it('should pass for note with only title', () => {
    const result = validateNote('Just a title', '');
    expect(result.valid).toBe(true);
  });

  it('should pass for note with only content', () => {
    const result = validateNote('', 'Just content');
    expect(result.valid).toBe(true);
  });

  it('should fail for empty note', () => {
    const result = validateNote('', '');
    expect(result.valid).toBe(false);
    expect(result.errors.general).toBeDefined();
  });

  it('should fail for title exceeding max length', () => {
    const longTitle = 'a'.repeat(MAX_LENGTHS.noteTitle + 1);
    const result = validateNote(longTitle, 'content');
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });
});
