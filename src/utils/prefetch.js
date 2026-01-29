/**
 * Prefetching utilities for improved navigation performance
 *
 * Preloads components and data before user navigates to reduce perceived load time
 */

// Cache for preloaded modules
const preloadedModules = new Set();

// Component import map - matches the lazy imports in App.jsx
const componentImports = {
  dashboard: () => import('../components/Dashboard/Dashboard'),
  attendance: () => import('../components/AttendanceTracker'),
  tasks: null, // Already loaded (not lazy)
  focus: () => import('../components/PomodoroTimer'),
  meetings: () => import('../components/UpcomingMeetings'),
  leaves: () => import('../components/LeaveTracker'),
  trips: () => import('../components/TripPlanner'),
  salary: () => import('../components/SalaryCalculator'),
  expenses: () => import('../components/ExpenseTracker'),
  tax: () => import('../components/TaxCalculator'),
  links: () => import('../components/QuickLinks'),
  notes: () => import('../components/Notes'),
};

/**
 * Preload a component by view ID
 */
export function preloadComponent(viewId) {
  if (preloadedModules.has(viewId)) return;

  const importFn = componentImports[viewId];
  if (importFn) {
    preloadedModules.add(viewId);
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      setTimeout(() => importFn(), 100);
    }
  }
}

/**
 * Preload multiple components
 */
export function preloadComponents(viewIds) {
  viewIds.forEach(preloadComponent);
}

/**
 * Preload components likely to be visited based on current view
 */
export function preloadRelatedComponents(currentView) {
  const relatedViews = {
    dashboard: ['tasks', 'attendance', 'focus'],
    attendance: ['dashboard', 'leaves'],
    tasks: ['dashboard', 'focus', 'notes'],
    focus: ['tasks', 'dashboard'],
    meetings: ['leaves', 'trips'],
    leaves: ['meetings', 'trips', 'attendance'],
    trips: ['leaves', 'expenses'],
    salary: ['tax', 'expenses'],
    expenses: ['salary', 'tax'],
    tax: ['salary', 'expenses'],
    links: ['notes', 'dashboard'],
    notes: ['links', 'tasks'],
  };

  const related = relatedViews[currentView] || [];
  preloadComponents(related);
}

/**
 * Preload on hover - call this when user hovers over navigation item
 */
export function preloadOnHover(viewId) {
  preloadComponent(viewId);
}

/**
 * Preload all components during idle time
 * Call this after initial render to warm up the cache
 */
export function preloadAllWhenIdle() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Object.keys(componentImports).forEach((viewId) => {
        if (!preloadedModules.has(viewId)) {
          preloadComponent(viewId);
        }
      });
    }, { timeout: 5000 });
  }
}

/**
 * Prefetch data for a view (can be extended to prefetch Firestore data)
 */
export function prefetchData(viewId) {
  // This can be extended to prefetch Firestore data
  // For now, just preload the component
  preloadComponent(viewId);
}

/**
 * Link prefetch - add to navigation links
 * Usage: <button onMouseEnter={() => prefetchLink('dashboard')} />
 */
export function prefetchLink(viewId) {
  preloadComponent(viewId);
}

export default {
  preloadComponent,
  preloadComponents,
  preloadRelatedComponents,
  preloadOnHover,
  preloadAllWhenIdle,
  prefetchData,
  prefetchLink,
};
