/**
 * Error Logging Utility
 *
 * Centralized error logging that can be configured to send errors to:
 * - Console (development)
 * - Sentry (production)
 * - Custom endpoint (production)
 *
 * To enable Sentry:
 * 1. Install: npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN in your .env file
 * 3. Errors will automatically be sent to Sentry in production
 */

const isDevelopment = import.meta.env.DEV;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Error severity levels
export const ErrorSeverity = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
};

// Error categories for better organization
export const ErrorCategory = {
  AUTH: 'authentication',
  NETWORK: 'network',
  FIREBASE: 'firebase',
  VALIDATION: 'validation',
  UI: 'ui',
  UNKNOWN: 'unknown',
};

// In-memory error buffer for batching
let errorBuffer = [];
const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

// Sentry instance (set externally if needed)
let sentryInstance = null;

/**
 * Set Sentry instance manually (call this from your app if Sentry is installed)
 *
 * Usage:
 * import * as Sentry from '@sentry/react';
 * import { setSentryInstance } from './utils/errorLogger';
 * Sentry.init({ dsn: '...' });
 * setSentryInstance(Sentry);
 */
export function setSentryInstance(sentry) {
  sentryInstance = sentry;
}

/**
 * Format error for logging
 */
function formatError(error, context = {}) {
  const timestamp = new Date().toISOString();

  return {
    timestamp,
    message: error?.message || String(error),
    stack: error?.stack,
    code: error?.code,
    name: error?.name || 'Error',
    category: context.category || ErrorCategory.UNKNOWN,
    severity: context.severity || ErrorSeverity.ERROR,
    userId: context.userId,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    extra: context.extra || {},
  };
}

/**
 * Send error to remote service
 */
async function sendToRemote(errorData) {
  // Try Sentry first
  if (sentryInstance) {
    sentryInstance.captureException(new Error(errorData.message), {
      level: errorData.severity,
      tags: {
        category: errorData.category,
      },
      extra: errorData.extra,
    });
    return;
  }

  // Custom endpoint fallback (if configured)
  const endpoint = import.meta.env.VITE_ERROR_ENDPOINT;
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
        keepalive: true, // Ensure request completes even if page unloads
      });
    } catch {
      // Silently fail - we don't want error logging to cause more errors
    }
  }
}

/**
 * Flush error buffer to remote
 */
async function flushBuffer() {
  if (errorBuffer.length === 0) return;

  const errors = [...errorBuffer];
  errorBuffer = [];

  for (const error of errors) {
    await sendToRemote(error);
  }
}

// Set up periodic flushing
if (typeof window !== 'undefined' && !isDevelopment) {
  setInterval(flushBuffer, FLUSH_INTERVAL);

  // Flush on page unload
  window.addEventListener('beforeunload', flushBuffer);
  window.addEventListener('pagehide', flushBuffer);
}

/**
 * Log an error
 *
 * @param {Error|string} error - The error to log
 * @param {Object} context - Additional context
 * @param {string} context.category - Error category (auth, network, etc.)
 * @param {string} context.severity - Error severity level
 * @param {string} context.userId - User ID if available
 * @param {Object} context.extra - Additional data to include
 */
export function logError(error, context = {}) {
  const errorData = formatError(error, context);

  // Always log to console in development
  if (isDevelopment) {
    console.group(`🔴 [${errorData.severity.toUpperCase()}] ${errorData.category}`);
    console.error(errorData.message);
    if (errorData.stack) console.error(errorData.stack);
    if (Object.keys(errorData.extra).length > 0) {
      console.log('Extra:', errorData.extra);
    }
    console.groupEnd();
    return;
  }

  // Buffer errors for production
  errorBuffer.push(errorData);

  // Flush immediately for fatal errors
  if (context.severity === ErrorSeverity.FATAL) {
    flushBuffer();
  } else if (errorBuffer.length >= BUFFER_SIZE) {
    flushBuffer();
  }
}

/**
 * Log a warning
 */
export function logWarning(message, context = {}) {
  logError(new Error(message), {
    ...context,
    severity: ErrorSeverity.WARNING,
  });
}

/**
 * Log an info message
 */
export function logInfo(message, context = {}) {
  if (isDevelopment) {
    console.info(`ℹ️ [INFO] ${context.category || 'general'}:`, message);
  }
}

/**
 * Create a scoped logger for a specific category
 */
export function createLogger(category) {
  return {
    error: (error, context = {}) => logError(error, { ...context, category }),
    warning: (message, context = {}) => logWarning(message, { ...context, category }),
    info: (message, context = {}) => logInfo(message, { ...context, category }),
  };
}

// Pre-configured loggers for common categories
export const authLogger = createLogger(ErrorCategory.AUTH);
export const networkLogger = createLogger(ErrorCategory.NETWORK);
export const firebaseLogger = createLogger(ErrorCategory.FIREBASE);
export const uiLogger = createLogger(ErrorCategory.UI);

/**
 * Error boundary helper - use in React Error Boundaries
 */
export function logComponentError(error, errorInfo) {
  logError(error, {
    category: ErrorCategory.UI,
    severity: ErrorSeverity.ERROR,
    extra: {
      componentStack: errorInfo?.componentStack,
    },
  });
}

/**
 * Wrap async functions with error logging
 */
export function withErrorLogging(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
}

export default {
  logError,
  logWarning,
  logInfo,
  createLogger,
  logComponentError,
  withErrorLogging,
  setSentryInstance,
  ErrorSeverity,
  ErrorCategory,
};
