import { TodoItem } from './TodoItem';

export function TodoList({ todos, onToggle, onEdit, onDelete }) {
  const pendingTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const completionPercentage = todos.length > 0
    ? Math.round((completedTodos.length / todos.length) * 100)
    : 0;

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-violet-400"
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
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No tasks yet</h3>
        <p className="text-slate-400 text-center max-w-[240px]">
          Add your first task to start organizing your day
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {todos.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Progress</span>
            <span className="text-sm font-semibold text-slate-700">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>{completedTodos.length} completed</span>
            <span>{pendingTodos.length} remaining</span>
          </div>
        </div>
      )}

      {/* Pending todos */}
      {pendingTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              To Do
            </h3>
            <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {pendingTodos.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingTodos.map((todo, idx) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                index={idx}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </h3>
            <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {completedTodos.length}
            </span>
          </div>
          <div className="space-y-2">
            {completedTodos.map((todo, idx) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                index={idx}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* All done celebration */}
      {pendingTodos.length === 0 && completedTodos.length > 0 && (
        <div className="text-center py-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700">All tasks completed!</span>
          </div>
        </div>
      )}
    </div>
  );
}
