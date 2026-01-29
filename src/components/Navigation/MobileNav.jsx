import { useNavigation, NAV_SECTIONS } from '../../contexts/NavigationContext';
import { getIcon } from './Sidebar';
import { prefetchLink } from '../../utils/prefetch';

export function MobileNav() {
  const {
    activeView,
    navigate,
    mobileSheetSection,
    openMobileSheet,
    closeMobileSheet,
    getCurrentSection,
  } = useNavigation();

  const currentSection = getCurrentSection();

  const bottomNavItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'work', icon: 'briefcase', label: 'Work' },
    { id: 'timeOff', icon: 'palm', label: 'Time' },
    { id: 'finance', icon: 'currency', label: 'Money' },
    { id: 'tools', icon: 'wrench', label: 'More' },
  ];

  const handleNavClick = (itemId) => {
    if (itemId === 'home') {
      navigate('dashboard');
      closeMobileSheet();
    } else {
      if (mobileSheetSection === itemId) {
        closeMobileSheet();
      } else {
        openMobileSheet(itemId);
      }
    }
  };

  const sheetSection = mobileSheetSection ? NAV_SECTIONS[mobileSheetSection] : null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-1">
          {bottomNavItems.map((item) => {
            const isActive = item.id === 'home'
              ? activeView === 'dashboard'
              : currentSection === item.id;
            const isSheetOpen = mobileSheetSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[60px]
                  transition-all duration-200
                  ${isActive || isSheetOpen
                    ? 'text-violet-600'
                    : 'text-slate-500'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-xl transition-all duration-200
                  ${isActive || isSheetOpen ? 'bg-violet-100' : ''}
                `}>
                  {getIcon(item.icon)}
                </div>
                <span className="text-xs font-medium mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sheet Backdrop */}
      {mobileSheetSection && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 animate-fade-in"
          onClick={closeMobileSheet}
        />
      )}

      {/* Sub-navigation Sheet */}
      {sheetSection && (
        <div
          className={`
            lg:hidden fixed bottom-[72px] left-0 right-0 z-35
            bg-white rounded-t-3xl shadow-2xl
            transform transition-transform duration-300 ease-out
            animate-slide-up
          `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Sheet Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Sheet Header */}
          <div className="px-6 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">{sheetSection.label}</h3>
          </div>

          {/* Sheet Items */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {sheetSection.items?.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                }}
                onTouchStart={() => prefetchLink(item.id)}
                className={`
                  flex items-center gap-3 p-4 rounded-2xl transition-all duration-200
                  ${activeView === item.id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-xl
                  ${activeView === item.id ? 'bg-white/20' : 'bg-white'}
                `}>
                  {getIcon(item.icon)}
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
