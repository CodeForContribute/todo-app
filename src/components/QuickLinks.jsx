import { useState } from 'react';
import { useUserData } from '../hooks/useFirestore';

export function QuickLinks() {
  const [links, setLinks, loading] = useUserData('quickLinks', { items: [] });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    let url = formData.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (editingId) {
      // Update existing link
      const updatedItems = links.items.map(link =>
        link.id === editingId ? { ...link, name: formData.name.trim(), url } : link
      );
      setLinks({ items: updatedItems });
      setEditingId(null);
    } else {
      // Add new link
      const newLink = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        url,
        createdAt: new Date().toISOString()
      };
      setLinks({ items: [...(links?.items || []), newLink] });
    }

    setFormData({ name: '', url: '' });
    setIsAdding(false);
  };

  const handleEdit = (link) => {
    setFormData({ name: link.name, url: link.url });
    setEditingId(link.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    const updatedItems = links.items.filter(link => link.id !== id);
    setLinks({ items: updatedItems });
  };

  const handleCancel = () => {
    setFormData({ name: '', url: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  // Extract domain for display
  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  // Get favicon URL
  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const linkItems = links?.items || [];

  return (
    <div className="glass rounded-2xl shadow-xl shadow-purple-900/10 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">Quick Links</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title="Add link"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Link name"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              autoFocus
            />
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="URL (e.g., google.com)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all"
              >
                {editingId ? 'Update' : 'Add Link'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Links List */}
      <div className="p-3">
        {linkItems.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No quick links yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-sm text-violet-500 hover:text-violet-600 font-medium"
            >
              Add your first link
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {linkItems.map((link) => (
              <div
                key={link.id}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 min-w-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img
                      src={getFavicon(link.url)}
                      alt=""
                      className="w-4 h-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <svg
                      className="w-4 h-4 text-slate-300 hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate group-hover:text-violet-600 transition-colors">
                      {link.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {getDomain(link.url)}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(link);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(link.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
