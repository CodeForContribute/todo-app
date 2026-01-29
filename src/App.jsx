import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipLink } from './components/SkipLink';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotFound } from './components/NotFound';
import { useTodos } from './hooks/useFirestore';
import { formatDateKey, formatDisplayDate, generateId } from './utils/dateUtils';
import { validateTodo } from './utils/validation';

// Navigation components (always needed)
import { Sidebar } from './components/Navigation/Sidebar';
import { MobileNav } from './components/Navigation/MobileNav';

// Auth components (needed early)
import { SignIn } from './components/Auth/SignIn';
import { UserMenu } from './components/Auth/UserMenu';

// Core task components (frequently used)
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import { EditTodoModal } from './components/EditTodoModal';
import { DailyQuote } from './components/DailyQuote';

// Lazy loaded components (loaded on demand)
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const AttendanceTracker = lazy(() => import('./components/AttendanceTracker').then(m => ({ default: m.AttendanceTracker })));
const QuickLinks = lazy(() => import('./components/QuickLinks').then(m => ({ default: m.QuickLinks })));
const UpcomingMeetings = lazy(() => import('./components/UpcomingMeetings').then(m => ({ default: m.UpcomingMeetings })));
const TripPlanner = lazy(() => import('./components/TripPlanner').then(m => ({ default: m.TripPlanner })));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer').then(m => ({ default: m.PomodoroTimer })));
const TaxCalculator = lazy(() => import('./components/TaxCalculator').then(m => ({ default: m.TaxCalculator })));
const LeaveTracker = lazy(() => import('./components/LeaveTracker').then(m => ({ default: m.LeaveTracker })));
const ExpenseTracker = lazy(() => import('./components/ExpenseTracker').then(m => ({ default: m.ExpenseTracker })));
const SalaryCalculator = lazy(() => import('./components/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const Notes = lazy(() => import('./components/Notes').then(m => ({ default: m.Notes })));
const ChatBot = lazy(() => import('./components/ChatBot/ChatBot').then(m => ({ default: m.ChatBot })));

// Loading spinner component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function MainContent() {
  const { activeView, navigate } = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useTodos();
  const [editingTodo, setEditingTodo] = useState(null);

  const dateKey = formatDateKey(selectedDate);
  const currentTodos = todos[dateKey] || [];
  const today = new Date();
  const isToday = formatDateKey(today) === dateKey;

  const addTodo = (text) => {
    // Validate todo text
    const validation = validateTodo(text);
    if (!validation.valid) {
      console.warn('Invalid todo:', validation.error);
      return;
    }
    const newTodo = { id: generateId(), text: validation.value, completed: false };
    setTodos({ ...todos, [dateKey]: [...currentTodos, newTodo] });
  };

  const toggleTodo = (id) => {
    setTodos({
      ...todos,
      [dateKey]: currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  };

  const deleteTodo = (id) => {
    const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
    if (updatedTodos.length === 0) {
      const { [dateKey]: _, ...rest } = todos;
      setTodos(rest);
    } else {
      setTodos({ ...todos, [dateKey]: updatedTodos });
    }
  };

  const editTodo = (id, newText) => {
    setTodos({
      ...todos,
      [dateKey]: currentTodos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      ),
    });
  };

  // Get page title based on active view
  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      attendance: 'Attendance',
      tasks: 'Daily Planner',
      focus: 'Focus Timer',
      meetings: 'Meetings',
      leaves: 'Leave Tracker',
      trips: 'Trip Planner',
      salary: 'Salary Calculator',
      expenses: 'Expense Tracker',
      tax: 'Tax Calculator',
      links: 'Quick Links',
      notes: 'Notes',
    };
    return titles[activeView] || 'Dashboard';
  };

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;

      case 'attendance':
        return <AttendanceTracker />;

      case 'tasks':
        return (
          <div className="space-y-6">
            <DailyQuote />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-8 space-y-4">
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    todosData={todos}
                  />
                  <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl bg-violet-50">
                        <div className="text-2xl font-bold text-violet-600">
                          {Object.values(todos).flat().filter((t) => !t.completed).length}
                        </div>
                        <div className="text-xs font-medium text-violet-400 uppercase tracking-wide">
                          Pending
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-emerald-50">
                        <div className="text-2xl font-bold text-emerald-600">
                          {Object.values(todos).flat().filter((t) => t.completed).length}
                        </div>
                        <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                          Done
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
                  <div className="p-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-2xl font-bold text-slate-800">
                            {formatDisplayDate(selectedDate)}
                          </h2>
                          {isToday && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {currentTodos.length === 0
                            ? 'No tasks scheduled'
                            : `${currentTodos.filter((t) => !t.completed).length} tasks remaining`}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isToday
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                        disabled={isToday}
                      >
                        Jump to Today
                      </button>
                    </div>
                  </div>
                  <div className="p-6 pb-2">
                    <AddTodo onAdd={addTodo} />
                  </div>
                  <div className="p-6 pt-4">
                    <TodoList
                      todos={currentTodos}
                      onToggle={toggleTodo}
                      onEdit={setEditingTodo}
                      onDelete={deleteTodo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'focus':
        return <PomodoroTimer />;

      case 'meetings':
        return (
          <div className="max-w-2xl mx-auto">
            <UpcomingMeetings />
          </div>
        );

      case 'leaves':
        return <LeaveTracker />;

      case 'trips':
        return <TripPlanner />;

      case 'salary':
        return <SalaryCalculator />;

      case 'expenses':
        return <ExpenseTracker />;

      case 'tax':
        return <TaxCalculator />;

      case 'links':
        return (
          <div className="max-w-2xl mx-auto">
            <QuickLinks />
          </div>
        );

      case 'notes':
        return <Notes />;

      default:
        // Show 404 page for unknown views
        return <NotFound onNavigate={navigate} />;
    }
  };

  return (
    <>
      {/* Main content area */}
      <main id="main-content" className="app-content" role="main" tabIndex={-1}>
        <div className="min-h-screen py-6 px-4 lg:py-8 lg:px-8">
          {/* Decorative background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
              <UserMenu />
            </header>

            {/* Desktop Header (only for non-dashboard views) */}
            {activeView !== 'dashboard' && (
              <header className="hidden lg:flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{getPageTitle()}</h1>
                  <p className="text-white/60">
                    {activeView === 'tasks' && 'Organize your day, one task at a time'}
                    {activeView === 'attendance' && 'Track your office attendance'}
                    {activeView === 'focus' && 'Stay focused with the Pomodoro technique'}
                    {activeView === 'meetings' && 'Your upcoming calendar events'}
                    {activeView === 'leaves' && 'Manage your leaves and track balance'}
                    {activeView === 'trips' && 'Plan and manage your business trips'}
                    {activeView === 'salary' && 'Calculate and understand your salary'}
                    {activeView === 'expenses' && 'Track and manage your expenses'}
                    {activeView === 'tax' && 'Calculate your income tax for India'}
                    {activeView === 'links' && 'Your frequently used resources'}
                    {activeView === 'notes' && 'Capture ideas and important information'}
                  </p>
                </div>
                <UserMenu />
              </header>
            )}

            {/* Page Content with Suspense */}
            <Suspense fallback={<LoadingSpinner />}>
              <div className="animate-fade-in">{renderContent()}</div>
            </Suspense>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <EditTodoModal
        todo={editingTodo}
        onSave={editTodo}
        onClose={() => setEditingTodo(null)}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading application">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-white/60">Loading Flowly...</p>
        </div>
      </div>
    );
  }

  // Show sign in if not authenticated
  if (!user) {
    return <SignIn />;
  }

  return (
    <NavigationProvider>
      <GamificationProvider>
        <div className="app-layout">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <MainContent />

          {/* ChatBot - Lazy loaded */}
          <Suspense fallback={null}>
            <ChatBot />
          </Suspense>
        </div>
      </GamificationProvider>
    </NavigationProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <OfflineIndicator />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
