import { useState, useEffect, useRef, useCallback } from 'react';

export function EditTodoModal({ todo, onSave, onClose }) {
  const [text, setText] = useState(todo?.text || '');
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [todo]);

  // Restore focus when modal closes
  useEffect(() => {
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Focus trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (todo) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [todo, handleKeyDown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(todo.id, text.trim());
      onClose();
    }
  };

  if (!todo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center" aria-hidden="true">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-slate-800">Edit Task</h2>
              <p id="modal-description" className="text-sm text-slate-400">Update your task details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="task-input" className="block text-sm font-medium text-slate-600 mb-2">
              Task description
            </label>
            <input
              id="task-input"
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-300 focus:bg-white transition-all duration-200"
              placeholder="What needs to be done?"
              aria-describedby="task-hint"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || text.trim() === todo.text}
              className={`
                flex-1 px-5 py-3 rounded-xl font-medium transition-all duration-300
                ${text.trim() && text.trim() !== todo.text
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
              aria-disabled={!text.trim() || text.trim() === todo.text}
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Keyboard hint */}
        <div id="task-hint" className="px-6 pb-4 text-center text-xs text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
}
