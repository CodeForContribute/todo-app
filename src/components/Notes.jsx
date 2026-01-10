import { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useFirestore';

const COLOR_OPTIONS = [
  { id: 'default', name: 'Default', bg: 'bg-white', border: 'border-slate-200', ring: 'ring-slate-300' },
  { id: 'yellow', name: 'Yellow', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-300' },
  { id: 'green', name: 'Green', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-300' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-300' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-50', border: 'border-pink-200', ring: 'ring-pink-300' },
  { id: 'purple', name: 'Purple', bg: 'bg-violet-50', border: 'border-violet-200', ring: 'ring-violet-300' },
];

const SORT_OPTIONS = [
  { id: 'updatedAt', name: 'Last Modified' },
  { id: 'createdAt', name: 'Date Created' },
  { id: 'title', name: 'Title' },
];

export function Notes() {
  const [notesData, setNotesData, loading] = useUserData('notes', { items: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default',
    pinned: false,
  });

  const notes = notesData?.items || [];

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Sort notes
    result.sort((a, b) => {
      // Pinned notes always first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then sort by selected criteria
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return result;
  }, [notes, searchQuery, sortBy]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      color: 'default',
      pinned: false,
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingNote(null);
    setIsCreating(true);
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      pinned: note.pinned,
    });
    setEditingNote(note);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      // Don't save empty notes
      handleCancel();
      return;
    }

    const now = new Date().toISOString();

    if (editingNote) {
      // Update existing note
      const updatedItems = notes.map((note) =>
        note.id === editingNote.id
          ? {
              ...note,
              title: formData.title.trim(),
              content: formData.content,
              color: formData.color,
              pinned: formData.pinned,
              updatedAt: now,
            }
          : note
      );
      setNotesData({ items: updatedItems });
    } else {
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        title: formData.title.trim() || 'Untitled',
        content: formData.content,
        color: formData.color,
        pinned: formData.pinned,
        createdAt: now,
        updatedAt: now,
      };
      setNotesData({ items: [...notes, newNote] });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
    resetForm();
  };

  const handleDelete = (noteId) => {
    const updatedItems = notes.filter((note) => note.id !== noteId);
    setNotesData({ items: updatedItems });
    if (editingNote?.id === noteId) {
      handleCancel();
    }
  };

  const handleTogglePin = (noteId) => {
    const updatedItems = notes.map((note) =>
      note.id === noteId
        ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() }
        : note
    );
    setNotesData({ items: updatedItems });
  };

  const getColorConfig = (colorId) => {
    return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Simple text formatting helpers
  const applyFormatting = (format) => {
    const textarea = document.getElementById('note-content-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'bullet':
        newText = `\n- ${selectedText}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      default:
        return;
    }

    const newContent =
      formData.content.substring(0, start) +
      newText +
      formData.content.substring(end);

    setFormData({ ...formData, content: newContent });

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + newText.length - cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Render formatted content (basic markdown-like rendering)
  const renderContent = (content) => {
    if (!content) return null;

    // Convert markdown-like syntax to simple formatting
    let formatted = content
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bullet points: - text
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> items in <ul>
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1">$&</ul>')
      // Line breaks
      .replace(/\n/g, '<br/>');

    return (
      <div
        className="text-sm text-slate-600 whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 mb-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-100 rounded-xl flex-1"></div>
            <div className="h-10 w-24 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 shadow-lg h-48">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Notes</h2>
              <p className="text-sm text-slate-400">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {SORT_OPTIONS.find((o) => o.id === sortBy)?.name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        sortBy === option.id
                          ? 'bg-violet-50 text-violet-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Note Editor Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto">
              {/* Title Input */}
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title..."
                className="w-full text-xl font-semibold text-slate-800 placeholder-slate-300 border-none outline-none mb-4"
                autoFocus
              />

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 mb-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => applyFormatting('bold')}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Bold (Ctrl+B)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('italic')}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Italic (Ctrl+I)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="19" y1="4" x2="10" y2="4" />
                    <line x1="14" y1="20" x2="5" y2="20" />
                    <line x1="15" y1="4" x2="9" y2="20" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('bullet')}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Bullet point"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" />
                    <circle cx="4" cy="12" r="1" fill="currentColor" />
                    <circle cx="4" cy="18" r="1" fill="currentColor" />
                  </svg>
                </button>
                <span className="text-xs text-slate-400 ml-2">
                  Use **bold**, *italic*, - bullet
                </span>
              </div>

              {/* Content Textarea */}
              <textarea
                id="note-content-input"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note here..."
                className="w-full h-48 text-slate-600 placeholder-slate-300 border-none outline-none resize-none"
              />

              {/* Color Picker */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Note Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.id })}
                      className={`w-10 h-10 rounded-xl ${color.bg} border-2 ${
                        formData.color === color.id
                          ? `${color.border} ring-2 ${color.ring}`
                          : 'border-transparent'
                      } transition-all hover:scale-110`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Pin Toggle */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pinned: !formData.pinned })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    formData.pinned
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={formData.pinned ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {formData.pinned ? 'Pinned' : 'Pin note'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
              {editingNote && (
                <button
                  onClick={() => handleDelete(editingNote.id)}
                  className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
              <div className={`flex gap-3 ${editingNote ? '' : 'ml-auto'}`}>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid/List */}
      {filteredAndSortedNotes.length === 0 ? (
        <div className="glass rounded-2xl p-12 shadow-xl shadow-purple-900/10 text-center">
          {searchQuery ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No notes found</h3>
              <p className="text-slate-400 mb-4">
                No notes match your search "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-violet-500 hover:text-violet-600 font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No notes yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Start capturing your ideas, meeting notes, and reminders. Quick notes help you stay organized and never forget important things.
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create your first note
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {filteredAndSortedNotes.map((note) => {
            const colorConfig = getColorConfig(note.color);

            return (
              <div
                key={note.id}
                onClick={() => handleEdit(note)}
                className={`group relative cursor-pointer rounded-2xl border ${colorConfig.border} ${colorConfig.bg} shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-start gap-4 p-4' : 'p-5'
                }`}
              >
                {/* Pin Indicator */}
                {note.pinned && (
                  <div className="absolute top-3 right-3">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(note.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      note.pinned
                        ? 'text-amber-500 hover:bg-amber-100'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={note.pinned ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Note Content */}
                <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                  <h4 className="font-semibold text-slate-800 mb-2 pr-8 line-clamp-2">
                    {note.title || 'Untitled'}
                  </h4>
                  <div
                    className={`text-slate-600 text-sm mb-3 ${
                      viewMode === 'grid' ? 'line-clamp-4' : 'line-clamp-2'
                    }`}
                  >
                    {renderContent(note.content)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
