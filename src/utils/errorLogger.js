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

// Sentry instance (lazy loaded)
let sentryInstance = null;

/**
 * Initialize Sentry if DSN is provided
 */
async function initSentry() {
  if (sentryInstance || !SENTRY_DSN || isDevelopment) return null;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Don't send events in development
        if (isDevelopment) return null;

        // Scrub sensitive data
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }

        return event;
      },
    });
    sentryInstance = Sentry;
    return Sentry;
  } catch {
    // Sentry not installed, continue without it
    return null;
  }
}

// Initialize on module load (non-blocking)
initSentry();

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
  ErrorSeverity,
  ErrorCategory,
};
