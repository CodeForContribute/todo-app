import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { useTodos } from './hooks/useFirestore';
import { formatDateKey, formatDisplayDate, generateId } from './utils/dateUtils';

// Navigation components
import { Sidebar } from './components/Navigation/Sidebar';
import { MobileNav } from './components/Navigation/MobileNav';

// Dashboard
import { Dashboard } from './components/Dashboard/Dashboard';

// Feature components
import { Calendar } from './components/Calendar';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import { EditTodoModal } from './components/EditTodoModal';
import { AttendanceTracker } from './components/AttendanceTracker';
import { SignIn } from './components/Auth/SignIn';
import { UserMenu } from './components/Auth/UserMenu';
import { DailyQuote } from './components/DailyQuote';
import { QuickLinks } from './components/QuickLinks';
import { UpcomingMeetings } from './components/UpcomingMeetings';
import { TripPlanner } from './components/TripPlanner';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TaxCalculator } from './components/TaxCalculator';
import { LeaveTracker } from './components/LeaveTracker';
import { ExpenseTracker } from './components/ExpenseTracker';
import { SalaryCalculator } from './components/SalaryCalculator';
import { Notes } from './components/Notes';

// Gamification
import { LevelProgress } from './components/Gamification/LevelProgress';

// ChatBot
import { ChatBot } from './components/ChatBot/ChatBot';

function MainContent() {
  const { activeView, navigate, sidebarCollapsed } = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos, todosLoading] = useTodos();
  const [editingTodo, setEditingTodo] = useState(null);

  const dateKey = formatDateKey(selectedDate);
  const currentTodos = todos[dateKey] || [];
  const today = new Date();
  const isToday = formatDateKey(today) === dateKey;

  const addTodo = (text) => {
    const newTodo = { id: generateId(), text, completed: false };
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
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <>
      {/* Main content area */}
      <main className="app-content">
        <div className="min-h-screen py-6 px-4 lg:py-8 lg:px-8">
          {/* Decorative background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

            {/* Page Content */}
            <div className="animate-fade-in">{renderContent()}</div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-white/60">Loading...</p>
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

          {/* ChatBot */}
          <ChatBot />
        </div>
      </GamificationProvider>
    </NavigationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
