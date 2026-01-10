import { useState, useRef } from 'react';

export function AddTodo({ onAdd }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`
          relative flex items-center gap-3 p-2 pl-4 rounded-2xl
          bg-white border-2 transition-all duration-300
          ${isFocused
            ? 'border-violet-300 shadow-lg shadow-violet-500/10'
            : 'border-slate-100 hover:border-slate-200'
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-6 h-6 rounded-lg flex items-center justify-center
            transition-all duration-300
            ${isFocused || text
              ? 'bg-violet-100 text-violet-500'
              : 'bg-slate-100 text-slate-400'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent text-slate-700 placeholder-slate-400 text-[15px] focus:outline-none"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className={`
            px-5 py-2.5 rounded-xl font-medium text-sm
            transition-all duration-300
            ${text.trim()
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          Add Task
        </button>
      </div>

      {/* Keyboard hint */}
      {isFocused && text.trim() && (
        <div className="absolute -bottom-6 left-4 text-xs text-slate-400 animate-fade-in">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> to add
        </div>
      )}
    </form>
  );
}
