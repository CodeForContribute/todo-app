import { useState } from 'react';

export function TodoItem({ todo, onToggle, onEdit, onDelete, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = () => {
    if (!todo.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 300);
    }
    onToggle(todo.id);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex items-center gap-4 p-4 rounded-2xl
        transition-all duration-300 ease-out
        animate-slide-in opacity-0
        ${todo.completed
          ? 'bg-slate-50/50'
          : 'bg-white hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5'
        }
      `}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`
          relative w-6 h-6 rounded-lg flex items-center justify-center
          transition-all duration-300 flex-shrink-0
          ${todo.completed
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30'
            : 'border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50'
          }
        `}
      >
        <svg
          className={`
            w-3.5 h-3.5 text-white transition-all duration-300
            ${todo.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            ${justCompleted ? 'animate-checkmark' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>

      {/* Text */}
      <span
        className={`
          flex-1 text-[15px] leading-relaxed transition-all duration-300
          ${todo.completed
            ? 'text-slate-400 line-through decoration-slate-300'
            : 'text-slate-700'
          }
        `}
      >
        {todo.text}
      </span>

      {/* Actions */}
      <div
        className={`
          flex items-center gap-1 transition-all duration-200
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}
      >
        <button
          onClick={() => onEdit(todo)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-all duration-200"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Subtle gradient border on hover for pending items */}
      {!todo.completed && (
        <div
          className={`
            absolute inset-0 rounded-2xl pointer-events-none
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
          }}
        />
      )}
    </div>
  );
}
