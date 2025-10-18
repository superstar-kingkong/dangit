import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal, 
  CheckSquare, 
  Square, 
  Clock, 
  Star, 
  Zap, 
  ArrowUpRight,
  Link,
  Image,
  MessageSquare,
  Lightbulb,
  Briefcase,
  Heart,
  ShoppingBag,
  MapPin,
  Activity,
  Utensils
} from 'lucide-react';

interface ContentCardProps {
  content: {
    id: number;
    type: string;
    title: string;
    description: string;
    tags: string[];
    timestamp: string;
    completed: boolean;
    category: string;
    borderColor?: string;
    priority?: 'high' | 'medium' | 'low';
    aiScore?: number;
  };
  onClick: () => void;
  onToggleComplete?: (id: number) => void;
  onMenuClick?: (id: number) => void;
  darkMode?: boolean;
}

export function ContentCard({ content, onClick, onToggleComplete, onMenuClick, darkMode = false }: ContentCardProps) {
  const { id, title, description, tags, timestamp, completed, category, type, priority, aiScore } = content;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // UPDATED: Unified Category configuration (same as HomeScreen)
  const getCategoryConfig = (cat: string) => {
    const categoryConfigs = {
      'Work': { 
        color: '#2563EB', 
        bgColor: darkMode ? '#1E3A8A20' : '#EFF6FF', 
        icon: Briefcase,
        gradient: 'from-blue-500/10 to-indigo-500/5'
      },
      'Personal': { 
        color: '#10B981', 
        bgColor: darkMode ? '#059669' : '#ECFDF5', 
        icon: Heart,
        gradient: 'from-emerald-500/10 to-green-500/5'
      },
      'Ideas': { 
        color: '#8B5CF6', 
        bgColor: darkMode ? '#7C3AED20' : '#F5F3FF', 
        icon: Lightbulb,
        gradient: 'from-purple-500/10 to-violet-500/5'
      },
      'Research': { 
        color: '#F59E0B', 
        bgColor: darkMode ? '#D97706' : '#FFFBEB', 
        icon: Star,
        gradient: 'from-amber-500/10 to-orange-500/5'
      },
      'Learning': { 
        color: '#10B981', 
        bgColor: darkMode ? '#059669' : '#ECFDF5', 
        icon: Star,
        gradient: 'from-emerald-500/10 to-teal-500/5'
      },
      'Shopping': { 
        color: '#EC4899', 
        bgColor: darkMode ? '#DB278720' : '#FDF2F8', 
        icon: ShoppingBag,
        gradient: 'from-pink-500/10 to-rose-500/5'
      },
      'Travel': { 
        color: '#06B6D4', 
        bgColor: darkMode ? '#0891B220' : '#ECFEFF', 
        icon: MapPin,
        gradient: 'from-cyan-500/10 to-blue-500/5'
      },
      'Health': { 
        color: '#EF4444', 
        bgColor: darkMode ? '#DC262620' : '#FEF2F2', 
        icon: Activity,
        gradient: 'from-red-500/10 to-pink-500/5'
      },
      'Food': { 
        color: '#84CC16', 
        bgColor: darkMode ? '#65A30D20' : '#F7FEE7', 
        icon: Utensils,
        gradient: 'from-lime-500/10 to-green-500/5'
      },
      'Entertainment': { 
        color: '#EF4444', 
        bgColor: darkMode ? '#DC262620' : '#FEF2F2', 
        icon: Star,
        gradient: 'from-red-500/10 to-pink-500/5'
      },
      'Finance': { 
        color: '#F59E0B', 
        bgColor: darkMode ? '#D97706' : '#FFFBEB', 
        icon: Star,
        gradient: 'from-amber-500/10 to-orange-500/5'
      },
      'AI Tools': { 
        color: '#6366F1', 
        bgColor: darkMode ? '#4F46E520' : '#EEF2FF', 
        icon: Star,
        gradient: 'from-indigo-500/10 to-purple-500/5'
      },
      'Productivity': { 
        color: '#2563EB', 
        bgColor: darkMode ? '#1E3A8A20' : '#EFF6FF', 
        icon: Briefcase,
        gradient: 'from-blue-500/10 to-indigo-500/5'
      },
      'Health & Fitness': { 
        color: '#EF4444', 
        bgColor: darkMode ? '#DC262620' : '#FEF2F2', 
        icon: Activity,
        gradient: 'from-red-500/10 to-pink-500/5'
      },
      'Food & Dining': { 
        color: '#84CC16', 
        bgColor: darkMode ? '#65A30D20' : '#F7FEE7', 
        icon: Utensils,
        gradient: 'from-lime-500/10 to-green-500/5'
      },
      'Coupons & Deals': { 
        color: '#F59E0B', 
        bgColor: darkMode ? '#D97706' : '#FFFBEB', 
        icon: Star,
        gradient: 'from-amber-500/10 to-orange-500/5'
      },
      'Other': { 
        color: '#6B7280', 
        bgColor: darkMode ? '#37415120' : '#F9FAFB', 
        icon: Star,
        gradient: 'from-gray-500/10 to-slate-500/5'
      }
    };
    return categoryConfigs[cat as keyof typeof categoryConfigs] || categoryConfigs['Other'];
  };

  const getContentTypeIcon = (contentType: string) => {
    const typeIcons = {
      'url': Link,
      'image': Image,
      'voice': MessageSquare,
      'idea': Lightbulb,
      'work': Briefcase,
      'personal': Heart
    };
    return typeIcons[contentType as keyof typeof typeIcons] || Link;
  };

  const categoryConfig = getCategoryConfig(category);
  const ContentTypeIcon = getContentTypeIcon(type);
  const CategoryIcon = categoryConfig.icon;

  const getPriorityColor = (priority?: string) => {
    if (darkMode) {
      switch (priority) {
        case 'high': return 'text-red-400 bg-red-900/30';
        case 'medium': return 'text-amber-400 bg-amber-900/30';
        case 'low': return 'text-green-400 bg-green-900/30';
        default: return 'text-gray-500 bg-gray-800/30';
      }
    } else {
      switch (priority) {
        case 'high': return 'text-red-500 bg-red-50';
        case 'medium': return 'text-amber-500 bg-amber-50';
        case 'low': return 'text-green-500 bg-green-50';
        default: return 'text-gray-400 bg-gray-50';
      }
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
    onToggleComplete?.(id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuClick?.(id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick();
  };

  // FIXED: Short format time calculation
  const getRelativeTime = (timestamp: string) => {
    try {
      const now = new Date();
      let date: Date;
      
      // Handle different timestamp formats
      if (timestamp.includes('T') || timestamp.includes('-')) {
        date = new Date(timestamp);
      } else if (timestamp.includes('ago') || timestamp.includes('now')) {
        return timestamp;
      } else {
        const numTimestamp = parseInt(timestamp);
        date = new Date(isNaN(numTimestamp) ? timestamp : numTimestamp);
      }

      if (isNaN(date.getTime())) {
        return 'Unknown';
      }

      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);

      // Handle future dates
      if (diffInMs < 0) {
        const absDiffInSeconds = Math.abs(diffInSeconds);
        const absDiffInMinutes = Math.floor(absDiffInSeconds / 60);
        const absDiffInHours = Math.floor(absDiffInMinutes / 60);
        const absDiffInDays = Math.floor(absDiffInHours / 24);

        if (absDiffInSeconds < 60) return 'soon';
        if (absDiffInMinutes < 60) return `${absDiffInMinutes}m`;
        if (absDiffInHours < 24) return `${absDiffInHours}h`;
        return `${absDiffInDays}d`;
      }

      // Handle past dates - SHORT FORMAT ONLY
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);

      if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? 'now' : `${diffInSeconds}s`;
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else if (diffInWeeks < 4) {
        return `${diffInWeeks}w`;
      } else if (diffInMonths < 12) {
        return `${diffInMonths}mo`;
      } else {
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears}y`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`
        group relative ${darkMode 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
          : 'bg-white border-slate-100 hover:border-slate-200'
        } rounded-2xl border
        cursor-pointer transition-all duration-300 ease-out
        hover:shadow-xl ${darkMode 
          ? 'hover:shadow-gray-900/50' 
          : 'hover:shadow-slate-200/50'
        } hover:-translate-y-1
        active:scale-[0.98] active:shadow-lg
        ${completed 
          ? darkMode 
            ? 'opacity-70 bg-gradient-to-br from-gray-800 to-gray-700' 
            : 'opacity-70 bg-gradient-to-br from-slate-50 to-gray-50' 
          : darkMode 
            ? 'hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-700/30' 
            : 'hover:bg-gradient-to-br hover:from-white hover:to-slate-50/30'
        }
        ${isPressed ? 'scale-[0.98] shadow-lg' : ''}
        overflow-hidden
      `}
      style={{
        borderLeftColor: categoryConfig.color,
        borderLeftWidth: '4px'
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay for category */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Ripple effect for interactions */}
      {showRipple && (
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${darkMode ? 'via-gray-600/30' : 'via-white/30'} to-transparent animate-ping`} />
      )}

      <div className="relative p-5">
        {/* Enhanced Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Interactive Checkbox */}
            <div 
              className={`
                cursor-pointer p-1.5 rounded-xl transition-all duration-200
                hover:scale-110 active:scale-95
                ${completed 
                  ? darkMode ? 'bg-green-900/30' : 'bg-green-50' 
                  : darkMode 
                    ? 'hover:bg-gray-700 hover:bg-indigo-900/30' 
                    : 'hover:bg-slate-100 hover:bg-indigo-50'
                }
              `}
              onClick={handleCheckboxClick}
            >
              {completed ? (
                <CheckSquare className="w-5 h-5 text-green-600 drop-shadow-sm" />
              ) : (
                <Square className={`w-5 h-5 transition-colors ${darkMode 
                  ? 'text-gray-500 group-hover:text-indigo-400' 
                  : 'text-slate-400 group-hover:text-indigo-500'
                }`} />
              )}
            </div>
            
            {/* Enhanced Category Tag with Icon */}
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              border transition-all duration-200
              ${completed ? 'opacity-60' : 'group-hover:scale-105'}
            `}
            style={{
              backgroundColor: categoryConfig.bgColor,
              color: categoryConfig.color,
              borderColor: `${categoryConfig.color}20`
            }}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {category}
            </div>
            
            {/* Priority Indicator */}
            {priority && priority !== 'low' && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(priority)}`}>
                <Zap className="w-3 h-3" />
                {priority.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Enhanced Right Section */}
          <div className="flex items-center gap-2">
            {/* AI Score Badge */}
            {aiScore && aiScore > 8 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${darkMode 
                ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50' 
                : 'bg-gradient-to-r from-purple-50 to-indigo-50'
              }`}>
                <Star className="w-3 h-3 text-purple-500 fill-current" />
                <span className={`text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{aiScore}</span>
              </div>
            )}
            
            {/* Content Type Indicator */}
            <div className={`p-1.5 rounded-lg transition-colors ${darkMode 
              ? 'bg-gray-700 group-hover:bg-gray-600' 
              : 'bg-slate-50 group-hover:bg-slate-100'
            }`}>
              <ContentTypeIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
            </div>
            
            {/* Enhanced Menu Button */}
            <button 
              className={`
                p-2 rounded-xl transition-all duration-200
                hover:scale-110 active:scale-95
                ${isHovered ? 'opacity-100' : 'opacity-70'}
                ${darkMode 
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }
              `}
              onClick={handleMenuClick}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Title with Better Typography */}
        <h3 className={`
          text-lg font-semibold mb-3 leading-tight tracking-tight
          transition-all duration-200 line-clamp-2
          ${completed 
            ? darkMode 
              ? 'text-gray-500 line-through' 
              : 'text-slate-500 line-through' 
            : darkMode 
              ? 'text-white group-hover:text-gray-100' 
              : 'text-slate-800 group-hover:text-slate-900'
          }
        `}>
          {title}
        </h3>

        {/* Enhanced Description */}
        <p className={`
          text-sm leading-relaxed mb-4 transition-colors duration-200 line-clamp-2
          ${completed 
            ? darkMode ? 'text-gray-600' : 'text-slate-400' 
            : darkMode 
              ? 'text-gray-300 group-hover:text-gray-200' 
              : 'text-slate-600 group-hover:text-slate-700'
          }
        `}>
          {description}
        </p>

        {/* Enhanced Bottom Section */}
        <div className="flex items-center justify-between">
          {/* Enhanced Tags */}
          <div className="flex flex-wrap gap-1.5 flex-1 mr-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`
                  inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-lg
                  border transition-all duration-200 cursor-pointer hover:scale-105
                  ${completed ? 'opacity-50' : ''}
                  ${darkMode 
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500' 
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                  }
                `}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                +{tags.length - 3} more
              </span>
            )}
          </div>
          
          {/* FIXED: Enhanced Timestamp with Icon - SHORT FORMAT */}
          <div className={`flex items-center gap-1.5 transition-colors ${darkMode 
            ? 'text-gray-500 group-hover:text-gray-400' 
            : 'text-slate-500 group-hover:text-slate-600'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {getRelativeTime(timestamp)}
            </span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Completion Success Overlay */}
        {completed && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Hover Indicator Line */}
      <div 
        className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r transition-all duration-300
          ${isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'}
        `}
        style={{
          backgroundImage: `linear-gradient(90deg, ${categoryConfig.color}, ${categoryConfig.color}80)`
        }}
      />
    </div>
  );
}
