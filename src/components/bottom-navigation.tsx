import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Sparkles,
  Zap,
  FileText,
  Settings 
} from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: 'home' | 'search' | 'add' | 'profile';
  onNavigate: (screen: 'home' | 'search' | 'add' | 'profile') => void;
  darkMode?: boolean;
}

export function BottomNavigation({ currentScreen, onNavigate, darkMode = false }: BottomNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [ripplePosition, setRipplePosition] = useState<{x: number, y: number, show: boolean}>({
    x: 0,
    y: 0,
    show: false
  });

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home',
      activeColor: darkMode ? 'text-blue-400 bg-gray-700/80' : 'text-blue-600 bg-blue-50',
      hoverColor: darkMode ? 'hover:text-blue-400 hover:bg-gray-700/50' : 'hover:text-blue-600 hover:bg-blue-50',
      description: 'Your saved content'
    },
    { 
      id: 'search', 
      icon: Search, 
      label: 'Search',
      activeColor: darkMode ? 'text-purple-400 bg-gray-700/80' : 'text-purple-600 bg-purple-50',
      hoverColor: darkMode ? 'hover:text-purple-400 hover:bg-gray-700/50' : 'hover:text-purple-600 hover:bg-purple-50',
      description: 'Find anything'
    },
    { 
      id: 'add', 
      icon: Plus, 
      label: 'Add',
      activeColor: darkMode ? 'text-emerald-400 bg-gray-700/80' : 'text-emerald-600 bg-emerald-50',
      hoverColor: darkMode ? 'hover:text-emerald-400 hover:bg-gray-700/50' : 'hover:text-emerald-600 hover:bg-emerald-50',
      description: 'Save new content',
      isSpecial: true
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Profile',
      activeColor: darkMode ? 'text-orange-400 bg-gray-700/80' : 'text-orange-600 bg-orange-50',
      hoverColor: darkMode ? 'hover:text-orange-400 hover:bg-gray-700/50' : 'hover:text-orange-600 hover:bg-orange-50',
      description: 'Settings & more'
    }
  ];

  const handleNavClick = (screen: 'home' | 'search' | 'add' | 'profile', event: React.MouseEvent) => {
    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRipplePosition({ x, y, show: true });
    setTimeout(() => setRipplePosition(prev => ({ ...prev, show: false })), 600);

    // Navigate
    onNavigate(screen);
  };

  return (
    <>
      {/* FIXED: Proper sticky positioning with safe area support */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          /* Enhanced safe area support for iOS and Android */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Enhanced background with better blur and transparency */}
        <div className={`
          absolute inset-0 backdrop-blur-xl border-t
          ${darkMode 
            ? 'bg-gray-900/95 border-gray-700/50' 
            : 'bg-white/95 border-slate-200/50'
          }
        `} />
        
        {/* Enhanced gradient overlay for better visual separation */}
        <div className={`
          absolute inset-0 
          ${darkMode 
            ? 'bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent' 
            : 'bg-gradient-to-t from-white/80 via-white/20 to-transparent'
          }
        `} />

        {/* Shadow for better separation from content */}
        <div className={`
          absolute -top-4 left-0 right-0 h-4
          ${darkMode 
            ? 'bg-gradient-to-t from-gray-900/20 to-transparent' 
            : 'bg-gradient-to-t from-black/10 to-transparent'
          }
        `} />

        {/* Main navigation content with improved spacing */}
        <div className="relative px-4 sm:px-6 pt-3 pb-3">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isSpecial = item.isSpecial;
              
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id as any, e)}
                  className={`
                    group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl
                    transition-all duration-300 ease-out transform-gpu
                    ${isActive 
                      ? `${item.activeColor} shadow-lg scale-105` 
                      : `${darkMode ? 'text-gray-400' : 'text-slate-500'} ${item.hoverColor} hover:scale-105 active:scale-95`
                    }
                    ${isSpecial && !isActive ? 'hover:shadow-lg' : ''}
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                    ${darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
                    touch-manipulation
                  `}
                  style={{
                    minWidth: '60px',
                    minHeight: '60px',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Ripple effect container */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    {ripplePosition.show && (
                      <div 
                        className="absolute w-8 h-8 bg-current opacity-20 rounded-full animate-ping"
                        style={{
                          left: ripplePosition.x - 16,
                          top: ripplePosition.y - 16,
                        }}
                      />
                    )}
                  </div>

                  {/* Special styling for Add button */}
                  {isSpecial && !isActive && (
                    <div className={`
                      absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 
                      ${darkMode 
                        ? 'bg-gradient-to-br from-emerald-400/10 to-blue-400/10' 
                        : 'bg-gradient-to-br from-emerald-400/10 to-blue-400/10'
                      }
                    `} />
                  )}

                  {/* Icon with enhanced animations */}
                  <div className={`
                    relative transition-all duration-300 ease-out
                    ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}
                  `}>
                    <Icon className={`
                      w-6 h-6 transition-all duration-300
                      ${isActive ? 'drop-shadow-sm' : ''}
                      ${isSpecial && !isActive ? 'group-hover:rotate-90' : ''}
                    `} />
                    
                    {/* Special glow effect for Add button */}
                    {isSpecial && isActive && (
                      <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-pulse-glow" />
                    )}
                  </div>

                  {/* Enhanced label with better typography */}
                  <span className={`
                    text-xs font-semibold tracking-wide transition-all duration-300
                    ${isActive 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-70 group-hover:opacity-100 translate-y-0.5 group-hover:translate-y-0'
                    }
                  `}>
                    {item.label}
                  </span>

                  {/* Tooltip on hover (enhanced for mobile) */}
                  <div className={`
                    absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                    px-3 py-1.5 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-slate-900 text-white'} 
                    text-xs font-medium rounded-lg shadow-lg
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    pointer-events-none whitespace-nowrap z-10
                    ${isActive ? 'hidden' : ''}
                  `}>
                    {item.description}
                    <div className={`
                      absolute top-full left-1/2 transform -translate-x-1/2 
                      border-4 border-transparent 
                      ${darkMode ? 'border-t-gray-700' : 'border-t-slate-900'}
                    `} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Enhanced bottom accent line with safe area consideration */}
          <div className={`
            absolute bottom-1 left-1/2 transform -translate-x-1/2 
            w-12 h-1 rounded-full transition-all duration-300
            ${darkMode ? 'bg-gray-600' : 'bg-slate-300'}
          `} />
        </div>
      </div>

      {/* CRITICAL: Bottom spacer to prevent content overlap */}
      <div 
        className="bottom-navigation-spacer"
        style={{
          height: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          minHeight: '80px'
        }}
      />
    </>
  );
}
