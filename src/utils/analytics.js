/**
 * Privacy-Friendly Analytics Utility
 *
 * Supports multiple analytics providers:
 * - Plausible Analytics (privacy-focused, no cookies)
 * - Simple custom analytics endpoint
 * - Console logging (development)
 *
 * To enable Plausible:
 * 1. Set VITE_PLAUSIBLE_DOMAIN in your .env file
 * 2. Add the Plausible script to index.html (optional, for pageviews)
 *
 * To use custom endpoint:
 * 1. Set VITE_ANALYTICS_ENDPOINT in your .env file
 */

const isDevelopment = import.meta.env.DEV;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT;

// Event queue for batching
let eventQueue = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 10000; // 10 seconds

// Standard event names
export const AnalyticsEvents = {
  // Authentication
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  SIGN_UP: 'sign_up',

  // Tasks
  TASK_CREATE: 'task_create',
  TASK_COMPLETE: 'task_complete',
  TASK_DELETE: 'task_delete',

  // Attendance
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',

  // Focus Timer
  POMODORO_START: 'pomodoro_start',
  POMODORO_COMPLETE: 'pomodoro_complete',
  POMODORO_SKIP: 'pomodoro_skip',

  // Navigation
  PAGE_VIEW: 'page_view',
  FEATURE_USE: 'feature_use',

  // Engagement
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  STREAK_MILESTONE: 'streak_milestone',

  // Errors
  ERROR: 'error',
};

/**
 * Check if user has opted out of analytics
 */
function hasOptedOut() {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('flowly-analytics-optout') === 'true';
}

/**
 * Opt out of analytics
 */
export function optOut() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('flowly-analytics-optout', 'true');
  }
}

/**
 * Opt back into analytics
 */
export function optIn() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('flowly-analytics-optout');
  }
}

/**
 * Check opt-out status
 */
export function isOptedOut() {
  return hasOptedOut();
}

/**
 * Send event to Plausible
 */
function sendToPlausible(eventName, props = {}) {
  if (!PLAUSIBLE_DOMAIN) return;

  // Use Plausible's API directly
  try {
    const url = 'https://plausible.io/api/event';
    const data = {
      domain: PLAUSIBLE_DOMAIN,
      name: eventName,
      url: window.location.href,
      props: Object.keys(props).length > 0 ? props : undefined,
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, JSON.stringify(data));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Send events to custom endpoint
 */
async function sendToCustomEndpoint(events) {
  if (!ANALYTICS_ENDPOINT) return;

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Flush event queue
 */
async function flushQueue() {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  // Send to custom endpoint if configured
  if (ANALYTICS_ENDPOINT) {
    await sendToCustomEndpoint(events);
  }
}

// Set up periodic flushing
if (typeof window !== 'undefined' && !isDevelopment) {
  setInterval(flushQueue, FLUSH_INTERVAL);
  window.addEventListener('beforeunload', flushQueue);
  window.addEventListener('pagehide', flushQueue);
}

/**
 * Track an event
 *
 * @param {string} eventName - Name of the event
 * @param {Object} properties - Additional properties
 */
export function trackEvent(eventName, properties = {}) {
  // Respect user opt-out
  if (hasOptedOut()) return;

  const event = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : undefined,
  };

  // Development logging
  if (isDevelopment) {
    console.log(`📊 [Analytics] ${eventName}`, properties);
    return;
  }

  // Send to Plausible immediately (they handle batching)
  if (PLAUSIBLE_DOMAIN) {
    sendToPlausible(eventName, properties);
  }

  // Queue for custom endpoint
  if (ANALYTICS_ENDPOINT) {
    eventQueue.push(event);
    if (eventQueue.length >= BATCH_SIZE) {
      flushQueue();
    }
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName, properties = {}) {
  trackEvent(AnalyticsEvents.PAGE_VIEW, {
    page: pageName,
    ...properties,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(featureName, properties = {}) {
  trackEvent(AnalyticsEvents.FEATURE_USE, {
    feature: featureName,
    ...properties,
  });
}

/**
 * Track timing (for performance monitoring)
 */
export function trackTiming(category, variable, timeMs) {
  trackEvent('timing', {
    category,
    variable,
    time_ms: Math.round(timeMs),
  });
}

/**
 * Create a timer for measuring duration
 */
export function startTimer() {
  const start = performance.now();
  return {
    stop: (category, variable) => {
      const duration = performance.now() - start;
      trackTiming(category, variable, duration);
      return duration;
    },
  };
}

/**
 * Track Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Use web-vitals library if available, otherwise use basic Performance API
  try {
    // Track First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) {
      trackTiming('web_vitals', 'FCP', fcp.startTime);
    }

    // Track page load time
    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        trackTiming('web_vitals', 'page_load', navEntry.loadEventEnd);
        trackTiming('web_vitals', 'DOM_interactive', navEntry.domInteractive);
      }
    });

    // Track Largest Contentful Paint (if supported)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackTiming('web_vitals', 'LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track Cumulative Layout Shift (if supported)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Report CLS on page hide
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          trackEvent('web_vitals', { CLS: clsValue.toFixed(4) });
        }
      });
    }
  } catch {
    // Performance API not fully supported
  }
}

/**
 * Initialize analytics (call once on app start)
 */
export function initAnalytics() {
  if (isDevelopment) {
    console.log('📊 Analytics initialized (development mode - events logged to console)');
    return;
  }

  // Track initial page view
  trackPageView(window.location.pathname);

  // Track Web Vitals
  trackWebVitals();

  // Track subsequent navigation (for SPAs)
  if (typeof window !== 'undefined') {
    let lastPath = window.location.pathname;

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        trackPageView(lastPath);
      }
    });
  }
}

export default {
  trackEvent,
  trackPageView,
  trackFeatureUse,
  trackTiming,
  startTimer,
  initAnalytics,
  optOut,
  optIn,
  isOptedOut,
  AnalyticsEvents,
};
