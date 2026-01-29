import { getIcon } from './Sidebar';

export function SidebarGroup({
  section,
  sectionKey: _sectionKey,
  collapsed,
  expanded,
  onToggle,
  activeView,
  onNavigate,
}) {
  const isActive = section.items?.some((item) => item.id === activeView);

  if (collapsed) {
    // In collapsed mode, show only the section icon that opens a tooltip/popover
    return (
      <div className="relative group mb-2">
        <button
          className={`
            w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200
            ${isActive
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
            }
          `}
          title={section.label}
        >
          {getIcon(section.icon)}
        </button>

        {/* Hover popover for collapsed state */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-slate-800 rounded-xl shadow-xl p-2 min-w-40">
            <p className="text-white font-medium text-sm px-2 py-1 mb-1">{section.label}</p>
            {section.items?.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors
                  ${activeView === item.id
                    ? 'bg-violet-500 text-white'
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
          ${isActive
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {getIcon(section.icon)}
          <span className="font-medium">{section.label}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Section Items */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="ml-4 mt-1 space-y-0.5">
          {section.items?.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                ${activeView === item.id
                  ? 'bg-white text-slate-800 shadow-md font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
