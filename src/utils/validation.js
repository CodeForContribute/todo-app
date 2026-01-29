/**
 * Input validation utilities for form data
 */

// Maximum lengths for different field types
export const MAX_LENGTHS = {
  todoText: 500,
  noteTitle: 200,
  noteContent: 10000,
  linkTitle: 100,
  linkUrl: 2000,
  tripName: 100,
  tripDescription: 1000,
  expenseDescription: 200,
  meetingTitle: 200,
  generic: 500,
};

/**
 * Sanitize a string by trimming and limiting length
 */
export function sanitizeString(value, maxLength = MAX_LENGTHS.generic) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/**
 * Validate a required string field
 */
export function validateRequired(value, fieldName = 'Field') {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, value: trimmed };
}

/**
 * Validate string length
 */
export function validateLength(value, maxLength, fieldName = 'Field') {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be text` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must be ${maxLength} characters or less` };
  }
  return { valid: true, value };
}

/**
 * Validate URL format
 */
export function validateUrl(value) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = value.trim();

  // Basic URL validation
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    return { valid: true, value: url.href };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate email format
 */
export function validateEmail(value) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate a number within range
 */
export function validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER, fieldName = 'Value') {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, value: num };
}

/**
 * Validate date string
 */
export function validateDate(value, fieldName = 'Date') {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` };
  }

  return { valid: true, value: date.toISOString() };
}

/**
 * Validate IP address format (supports wildcards)
 */
export function validateIPAddress(value) {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'IP address is required' };
  }

  const trimmed = value.trim();

  // Support wildcards (e.g., 192.168.1.*)
  const ipRegex = /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/;

  if (!ipRegex.test(trimmed)) {
    // Check for CIDR notation (e.g., 192.168.1.0/24)
    const cidrRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;
    if (!cidrRegex.test(trimmed)) {
      return { valid: false, error: 'Invalid IP address format' };
    }
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate todo item (truncates long text instead of rejecting)
 */
export function validateTodo(text) {
  const required = validateRequired(text, 'Task');
  if (!required.valid) return required;

  // Truncate to max length instead of rejecting
  return { valid: true, value: sanitizeString(required.value, MAX_LENGTHS.todoText) };
}

/**
 * Validate note
 */
export function validateNote(title, content) {
  const errors = {};

  // Title is optional but has max length
  if (title && title.length > MAX_LENGTHS.noteTitle) {
    errors.title = `Title must be ${MAX_LENGTHS.noteTitle} characters or less`;
  }

  // Content has max length
  if (content && content.length > MAX_LENGTHS.noteContent) {
    errors.content = `Content must be ${MAX_LENGTHS.noteContent} characters or less`;
  }

  // At least one must be provided
  if (!title?.trim() && !content?.trim()) {
    errors.general = 'Please enter a title or content';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      title: sanitizeString(title || '', MAX_LENGTHS.noteTitle),
      content: sanitizeString(content || '', MAX_LENGTHS.noteContent),
    },
  };
}

/**
 * Validate expense
 */
export function validateExpense(amount, description, category) {
  const errors = {};

  const amountResult = validateNumber(amount, 0.01, 100000000, 'Amount');
  if (!amountResult.valid) {
    errors.amount = amountResult.error;
  }

  if (description && description.length > MAX_LENGTHS.expenseDescription) {
    errors.description = `Description must be ${MAX_LENGTHS.expenseDescription} characters or less`;
  }

  if (!category) {
    errors.category = 'Category is required';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      amount: amountResult.value,
      description: sanitizeString(description || '', MAX_LENGTHS.expenseDescription),
      category,
    },
  };
}
