import { PWAInstallBanner } from './PWAInstallBanner';
import { API_URL } from '../config';
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from '../lib/supabase';
import {
  Search,
  X,
  Filter,
  Clock,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Download,
  Share,
  MoreVertical,
} from "lucide-react";

interface HomeScreenProps {
  onShowContentDetail: (content: any) => void;
  darkMode?: boolean;
  currentTime?: Date;
  userId?: string;
}

interface ContentItem {
  id: string; // ✅ Changed to string for UUID
  type: string;
  title: string;
  description: string;
  tags: string[];
  timestamp: string;
  completed: boolean;
  category: string;
  borderColor: string;
  priority?: "high" | "medium" | "low";
  aiScore?: number;
  originalUrl?: string;
  image_url?: string;
  content_type?: string;
  original_content?: string;
  created_at?: string;
}

// ContentCard component
const ContentCard = ({ content, onClick, onToggleComplete, darkMode }: any) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(content.id, !content.completed);
    }
  };

  return (
    <div 
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-4 mb-3 shadow-sm border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        content.completed ? 'opacity-60' : ''
      }`} 
      style={{borderLeftColor: content.borderColor}}
      onClick={() => onClick && onClick(content)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={content.completed}
            onChange={() => {}}
            onClick={handleCheckboxClick}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" 
          />
          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {content.category}
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {content.timestamp}
          </span>
        </div>
        <button className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} hover:text-gray-600`}>⋯</button>
      </div>
      
      <h3 className={`font-semibold mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {content.title}
      </h3>
      <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {content.description}
      </p>
      
      <div className="flex flex-wrap gap-1">
        {content.tags?.map((tag: string) => (
          <span key={tag} className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export function HomeScreen({
  onShowContentDetail,
  darkMode = false,
  currentTime: externalCurrentTime,
  userId
}: HomeScreenProps) {
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "recent" | "important" | "pending">("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentTime = externalCurrentTime || new Date();

  // UPDATED: Unified Category color mapping (consistent across all screens)
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Work': '#2563EB',
      'Personal': '#10B981',
      'Ideas': '#8B5CF6',
      'Research': '#F59E0B',
      'Learning': '#10B981',
      'Shopping': '#EC4899',
      'Travel': '#06B6D4',
      'Health': '#EF4444',
      'Food': '#84CC16',
      'Entertainment': '#EF4444',
      'Finance': '#F59E0B',
      'AI Tools': '#6366F1',
      'Productivity': '#2563EB',
      'Health & Fitness': '#EF4444',
      'Food & Dining': '#84CC16',
      'Coupons & Deals': '#F59E0B',
      'Other': '#6B7280'
    };
    return colorMap[category] || '#6B7280';
  };

  // UPDATED: Format timestamp to short format
  const formatTimeAgo = (dateString: string): string => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);

      if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? 'now' : `${diffInSeconds}s`;
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks}w`;
      
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) return `${diffInMonths}mo`;
      
      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears}y`;
    } catch (error) {
      return 'Unknown';
    }
  };

  // Determine priority
  const determinePriority = (category: string, createdAt: string): 'high' | 'medium' | 'low' => {
    const highPriorityCategories = ['Work', 'Finance', 'Coupons & Deals'];
    const isRecent = new Date().getTime() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
    
    if (highPriorityCategories.includes(category) && isRecent) return 'high';
    if (highPriorityCategories.includes(category)) return 'medium';
    if (isRecent) return 'medium';
    return 'low';
  };

  // Load content from server
  const loadContentItems = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    if (!userId) {
      console.warn('No userId provided, skipping content load');
      setContentItems([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔒 Loading content items securely for user:', userId);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      const response = await fetch(`${API_URL}/api/saved-items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        const transformedItems: ContentItem[] = result.data.map((item: any) => ({
          id: String(item.id), // ✅ Convert to string (handles both UUID and numbers)
          type: item.content_type || 'text',
          title: item.title || 'Untitled',
          description: item.ai_summary || 'No description available',
          tags: Array.isArray(item.ai_tags) ? item.ai_tags : [],
          timestamp: formatTimeAgo(item.created_at),  
          completed: Boolean(item.is_completed),
          category: item.ai_category || 'Other',
          borderColor: getCategoryColor(item.ai_category || 'Other'),
          priority: determinePriority(item.ai_category || 'Other', item.created_at),
          aiScore: 8.0,
          originalUrl: item.original_content || null,
          image_url: item.original_image_url || null,
          content_type: item.content_type || 'text',
          original_content: item.original_content || null,
          created_at: item.created_at
        }));
        
        console.log(`Successfully loaded ${transformedItems.length} items for user:`, userId);
        setContentItems(transformedItems);
      } else {
        console.log('No saved items found for user:', userId);
        setContentItems([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      
      let errorMessage = 'Failed to load content.';
      if (error instanceof Error) {
        if (error.message.includes('HTTP 400')) {
          errorMessage = 'Invalid user ID or request format.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'API endpoint not found.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setContentItems([]);
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await loadContentItems(false);
  };

  // Load data on component mount
  useEffect(() => {
    if (userId) {
      loadContentItems();
    } else {
      setLoading(false);
      setError('No user logged in');
    }
  }, [userId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!loading && userId) {
      const interval = setInterval(() => {
        loadContentItems(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [loading, userId]);

  // Expose refresh function globally
  useEffect(() => {
    (window as any).refreshHomeScreen = () => {
      console.log('External refresh triggered for user:', userId);
      handleRefresh();
    };
    
    return () => {
      delete (window as any).refreshHomeScreen;
    };
  }, [userId]);

  // ✅ FIXED: Handle completion toggle - accepts string UUID
  const handleToggleComplete = async (itemId: string, newCompletedState: boolean) => {
    if (!userId) return;

    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: newCompletedState }
          : item
      )
    );

    try {
      console.log('🔒 Securely toggling completion for item:', itemId, 'to:', newCompletedState);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.access_token) {
        throw new Error('Session expired. Please sign in again.');
      }
      
      const response = await fetch(`${API_URL}/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          itemId: itemId, // ✅ Send as string (UUID)
          completed: newCompletedState
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update item`);
      }

      const result = await response.json();
      console.log('✅ Successfully toggled completion securely:', result);
      
      if ((window as any).refreshSearchScreen) {
        console.log('Triggering search screen refresh from home');
        (window as any).refreshSearchScreen();
      }
      
      setTimeout(() => loadContentItems(false), 500);
      
    } catch (error) {
      console.error('Error toggling completion:', error);
      
      setContentItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, completed: !newCompletedState }
            : item
        )
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item. Please try again.';
      alert(errorMessage);
    }
  };

  // Filter to show only UNCOMPLETED items on home screen
  const uncompletedItems = useMemo(() => {
    return contentItems.filter(item => !item.completed);
  }, [contentItems]);

  // Smart filtering and sorting (only on uncompleted items)
  const filteredAndSortedItems = useMemo(() => {
    let filtered = uncompletedItems.filter((item) => {
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = selectedFilter === "all" ||
        (selectedFilter === "recent" && ['Just now', 'm ago', 'h ago'].some(unit => item.timestamp.includes(unit))) ||
        (selectedFilter === "important" && item.priority === "high") ||
        (selectedFilter === "pending" && !item.completed);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority!] || 0) - (priorityOrder[a.priority!] || 0);
      }
      return (b.aiScore || 0) - (a.aiScore || 0);
    });
  }, [uncompletedItems, searchQuery, selectedFilter]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getQuickStats = () => {
    const total = contentItems.length;
    const completed = contentItems.filter((item) => item.completed).length;
    const pending = total - completed;
    const highPriority = contentItems.filter((item) => item.priority === "high" && !item.completed).length;

    return { total, completed, pending, highPriority };
  };

  const stats = getQuickStats();

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your content...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>
            {error.includes('Authentication') ? 'Authentication Error' : 'Connection Error'}
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
            {error}
          </p>
          <button 
            onClick={() => loadContentItems()}
            disabled={!userId}
            className={`${
              userId 
                ? 'bg-indigo-500 hover:bg-indigo-600' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-4 py-2 rounded-lg transition-colors`}
          >
            {userId ? 'Retry' : 'No User'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* REST OF YOUR UI CODE - KEEPING EXACTLY AS IS */}
      <div className="overflow-y-auto h-screen">
        <div className={`relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        }`}>
          <div className="relative px-5 pt-6 pb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl tracking-tight font-bold">
                  <span className={`${
                    darkMode 
                      ? "text-indigo-300 drop-shadow-sm" 
                      : "text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
                  }`}>DANG</span>
                  <span className={`${
                    darkMode 
                      ? "text-pink-300 drop-shadow-sm" 
                      : "text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text"
                  }`}>IT</span>
                </h1>
                <p className={`${darkMode ? "text-indigo-200" : "text-slate-600"} mt-1 font-medium`}>
                  {getGreeting()}, ready to organize?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing || !userId}
                  className={`p-2 rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm' 
                      : 'bg-white/80 hover:bg-white backdrop-blur-sm'
                  } shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                  title="Refresh Securely"
                >
                  <RefreshCw className={`w-5 h-5 ${
                    darkMode ? 'text-indigo-300' : 'text-slate-700'
                  } ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="relative mb-4">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                isSearchFocused ? 'text-indigo-500 scale-110' : darkMode ? 'text-gray-400' : 'text-slate-400'
              }`}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search your undone content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full ${
                  darkMode
                    ? "bg-gray-800/80 text-white placeholder-gray-400 backdrop-blur-sm"
                    : "bg-white/90 text-slate-900 placeholder-slate-500 backdrop-blur-sm"
                } rounded-2xl pl-12 pr-4 py-4 border-2 transition-all duration-200 shadow-sm ${
                  isSearchFocused
                    ? "border-indigo-500 shadow-lg"
                    : darkMode
                      ? "border-gray-600 hover:border-gray-500 hover:shadow-md"
                      : "border-gray-200 hover:border-slate-300 hover:shadow-md"
                }`}
              />
            </div>

            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {[
                { key: "all", label: "All", icon: null },
                { key: "recent", label: "Recent", icon: Clock },
                { key: "important", label: `Priority (${stats.highPriority})`, icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedFilter === key
                      ? darkMode
                        ? "bg-indigo-800/80 text-indigo-200 shadow-sm scale-105 backdrop-blur-sm"
                        : "bg-indigo-100 text-indigo-700 shadow-sm scale-105"
                      : darkMode
                        ? "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:shadow-sm backdrop-blur-sm"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-sm backdrop-blur-sm"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`${darkMode ? "bg-gray-900" : "bg-white"} px-5 pt-4 pb-32`}>
          {/* ✅ ADD: Smart PWA Install Banner */}
          <PWAInstallBanner darkMode={darkMode} />

          {stats.total > 0 && (
            <div className={`${
              darkMode
                ? "bg-gradient-to-r from-gray-800 to-slate-800 border border-gray-700"
                : "bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-100"
            } rounded-2xl p-4 mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`${darkMode ? "text-white" : "text-slate-900"} font-semibold mb-1`}>
                    Your Progress
                  </h3>
                  <p className={`${darkMode ? "text-gray-300" : "text-slate-600"} text-sm`}>
                    {stats.completed} of {stats.total} items completed
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </div>
                  <div className={`w-16 h-2 ${darkMode ? "bg-gray-700" : "bg-slate-200"} rounded-full mt-1 overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Sparkles className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h3 className={`${darkMode ? 'text-white' : 'text-slate-900'} font-semibold mb-2`}>
                  {searchQuery ? "No items found" : stats.pending === 0 ? "All done! 🎉" : "No pending items"}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-slate-500'} text-sm`}>
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : stats.pending === 0
                      ? 'Great job! All your items are completed'
                      : 'Add some content to get started'
                  }
                </p>
              </div>
            ) : (
              filteredAndSortedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in slide-in-from-bottom-4 fade-in-0"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '400ms',
                    animationFillMode: 'both'
                  }}
                >
                  <ContentCard
                    content={item}
                    onClick={onShowContentDetail}
                    onToggleComplete={handleToggleComplete}
                    darkMode={darkMode}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
