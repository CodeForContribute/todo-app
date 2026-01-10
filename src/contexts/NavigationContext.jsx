import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

// Navigation structure
export const NAV_SECTIONS = {
  home: {
    id: 'home',
    label: 'Home',
    icon: 'home',
    path: 'dashboard',
  },
  work: {
    id: 'work',
    label: 'Work',
    icon: 'briefcase',
    items: [
      { id: 'attendance', label: 'Attendance', icon: 'check-circle' },
      { id: 'tasks', label: 'Tasks', icon: 'clipboard' },
      { id: 'focus', label: 'Focus', icon: 'clock' },
      { id: 'meetings', label: 'Meetings', icon: 'calendar' },
    ],
  },
  timeOff: {
    id: 'timeOff',
    label: 'Time Off',
    icon: 'palm',
    items: [
      { id: 'leaves', label: 'Leaves', icon: 'calendar-days' },
      { id: 'trips', label: 'Trips', icon: 'globe' },
    ],
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    icon: 'currency',
    items: [
      { id: 'salary', label: 'Salary', icon: 'banknotes' },
      { id: 'expenses', label: 'Expenses', icon: 'receipt' },
      { id: 'tax', label: 'Tax', icon: 'calculator' },
    ],
  },
  tools: {
    id: 'tools',
    label: 'Tools',
    icon: 'wrench',
    items: [
      { id: 'links', label: 'Links', icon: 'link' },
      { id: 'notes', label: 'Notes', icon: 'pencil' },
    ],
  },
};

export function NavigationProvider({ children }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState(['work']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSheetSection, setMobileSheetSection] = useState(null);

  const navigate = useCallback((viewId) => {
    setActiveView(viewId);
    setMobileNavOpen(false);
    setMobileSheetSection(null);
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileSheet = useCallback((sectionId) => {
    setMobileSheetSection(sectionId);
  }, []);

  const closeMobileSheet = useCallback(() => {
    setMobileSheetSection(null);
  }, []);

  // Get current section from active view
  const getCurrentSection = useCallback(() => {
    if (activeView === 'dashboard') return 'home';
    for (const [key, section] of Object.entries(NAV_SECTIONS)) {
      if (section.items?.some((item) => item.id === activeView)) {
        return key;
      }
    }
    return 'home';
  }, [activeView]);

  const value = {
    activeView,
    navigate,
    expandedSections,
    toggleSection,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    mobileSheetSection,
    openMobileSheet,
    closeMobileSheet,
    getCurrentSection,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
