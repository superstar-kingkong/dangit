import { API_URL } from '../config';
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Settings,
  User,
  X,
  Filter,
  Clock,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from "lucide-react";


interface HomeScreenProps {
  onShowContentDetail: (content: any) => void;
  darkMode?: boolean;
  currentTime?: Date;
  userId?: string; // Add userId prop
}

interface ContentItem {
  id: string;
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
}

// Simple ContentCard component
const ContentCard = ({ content, onClick, onToggleComplete, darkMode }: any) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(content.id);
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
            onChange={() => {}} // Handled by onClick
            onClick={handleCheckboxClick}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" 
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
  userId // Accept userId prop
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

  // Category color mapping
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Work': '#2563EB',
      'Learning': '#10B981',
      'Ideas': '#8B5CF6',
      'Personal': '#10B981',
      'Shopping': '#EC4899',
      'Food & Dining': '#84CC16',
      'Travel': '#06B6D4',
      'Finance': '#F59E0B',
      'AI Tools': '#6366F1',
      'Entertainment': '#EF4444',
      'Productivity': '#2563EB',
      'Health & Fitness': '#EF4444',
      'Coupons & Deals': '#F59E0B',
      'Other': '#6B7280'
    };
    return colorMap[category] || '#6B7280';
  };

  // Format timestamp
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Determine priority based on category and recency
  const determinePriority = (category: string, createdAt: string): 'high' | 'medium' | 'low' => {
    const highPriorityCategories = ['Work', 'Finance', 'Coupons & Deals'];
    const isRecent = new Date().getTime() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
    
    if (highPriorityCategories.includes(category) && isRecent) return 'high';
    if (highPriorityCategories.includes(category)) return 'medium';
    if (isRecent) return 'medium';
    return 'low';
  };

  // Load content from server with real user ID
  const loadContentItems = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    // Don't make API calls if no userId
    if (!userId) {
      console.warn('No userId provided, skipping content load');
      setContentItems([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading content items for user:', userId);
      
      // Use real user ID instead of hardcoded 'user-123'
      const response = await fetch(`${API_URL}/api/saved-items?userId=${encodeURIComponent(userId || 'anonymous-user')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.data && Array.isArray(result.data)) {
        const transformedItems: ContentItem[] = result.data.map((item: any) => ({
          id: item.id.toString(),
          type: item.content_type || 'text',
          title: item.title || 'Untitled',
          description: item.ai_summary || 'No description available',
          tags: Array.isArray(item.ai_tags) ? item.ai_tags : [],
          timestamp: formatTimeAgo(item.created_at),
          completed: Boolean(item.is_completed),
          category: item.ai_category || 'Other',
          borderColor: getCategoryColor(item.ai_category || 'Other'),
          priority: determinePriority(item.ai_category || 'Other', item.created_at),
          aiScore: 8.0
        }));
        
        console.log(`Successfully loaded ${transformedItems.length} items for user:`, userId);
        setContentItems(transformedItems);
      } else if (result.data && Array.isArray(result.data) && result.data.length === 0) {
        console.log('No saved items found for user:', userId);
        setContentItems([]);
      } else {
        console.warn('Unexpected response format:', result);
        setContentItems([]);
      }
    } catch (error) {
      console.error('Error loading content for user:', userId, error);
      
      let errorMessage = 'Failed to load content.';
      if (error instanceof Error) {
        if (error.message.includes('HTTP 400')) {
          errorMessage = 'Invalid user ID or request format.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'API endpoint not found. Check if your server is running.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Check if your backend is running on port 3001.';
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
    if (!userId) {
      console.warn('Cannot refresh: no userId provided');
      return;
    }
    setRefreshing(true);
    await loadContentItems(false);
  };

  // Load data on component mount and when userId changes
  useEffect(() => {
    if (userId) {
      console.log('HomeScreen mounting/updating with userId:', userId);
      loadContentItems();
    } else {
      console.warn('HomeScreen: No userId provided');
      setLoading(false);
      setError('No user logged in');
    }
  }, [userId]);

  // Auto-refresh every 30 seconds when not loading and user is authenticated
  useEffect(() => {
    if (!loading && userId) {
      const interval = setInterval(() => {
        loadContentItems(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [loading, userId]);

  // Expose refresh function globally for add screen
  useEffect(() => {
    (window as any).refreshHomeScreen = () => {
      console.log('External refresh triggered for user:', userId);
      handleRefresh();
    };
    
    return () => {
      delete (window as any).refreshHomeScreen;
    };
  }, [userId]);

  // Handle completion toggle with real API
  const handleToggleComplete = async (itemId: string) => {
    const item = contentItems.find(item => item.id === itemId);
    if (!item || !userId) return;

    // Optimistic update
    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );

    try {
      console.log('Toggling completion for item:', itemId, 'user:', userId);
      
      // Use your existing API endpoint for toggling completion
      const response = await fetch(`${API_URL}/api/saved-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_completed: !item.completed,
          userId: userId // Include userId for security
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to update item`);
      }

      console.log('Successfully toggled completion for item:', itemId);
    } catch (error) {
      console.error('Error toggling completion:', error);
      
      // Revert optimistic update
      setContentItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, completed: !item.completed }
            : item
        )
      );
    }
  };

  // Smart filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = contentItems.filter((item) => {
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
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority!] || 0) - (priorityOrder[a.priority!] || 0);
      }
      return (b.aiScore || 0) - (a.aiScore || 0);
    });
  }, [contentItems, searchQuery, selectedFilter]);

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
            Loading your content{userId ? ` for ${userId}` : ''}...
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
            Connection Error
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>
            {error}
          </p>
          {userId ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-4`}>
              User: {userId}
            </p>
          ) : null}
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
      {/* Status Bar */}
      <div className={`flex justify-between items-center px-5 pt-4 pb-2 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 via-slate-800 to-gray-700"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}>
        <span className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>
          {currentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className={`w-1 h-1 ${darkMode ? "bg-white" : "bg-slate-900"} rounded-full`}></div>
            <div className={`w-1 h-1 ${darkMode ? "bg-white" : "bg-slate-900"} rounded-full`}></div>
            <div className={`w-1 h-1 ${darkMode ? "bg-white" : "bg-slate-900"} rounded-full`}></div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <div className={`w-6 h-3 border ${darkMode ? "border-white" : "border-slate-900"} rounded-sm relative`}>
              <div className="absolute inset-0.5 bg-green-500 rounded-sm"></div>
            </div>
            <span className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>100%</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 60px)" }}>
        {/* Header */}
        <div className={`relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-slate-800 to-gray-700"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        }`}>
          {/* Background elements */}
          <div className={`absolute top-0 left-1/4 w-32 h-32 ${
            darkMode ? "bg-gradient-to-r from-blue-800 to-purple-800" : "bg-gradient-to-r from-blue-200 to-purple-200"
          } rounded-full opacity-20 animate-pulse`}></div>
          <div className={`absolute top-8 right-1/4 w-24 h-24 ${
            darkMode ? "bg-gradient-to-r from-pink-800 to-orange-800" : "bg-gradient-to-r from-pink-200 to-orange-200"
          } rounded-full opacity-15 animate-bounce`} style={{ animationDuration: "3s" }}></div>

          <div className="relative px-5 pt-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl tracking-tight font-bold">
                  <span className={`text-transparent ${
                    darkMode ? "bg-gradient-to-r from-indigo-400 to-purple-400" : "bg-gradient-to-r from-indigo-600 to-purple-600"
                  } bg-clip-text`}>DANG</span>
                  <span className={`text-transparent ${
                    darkMode ? "bg-gradient-to-r from-purple-400 to-pink-400" : "bg-gradient-to-r from-purple-600 to-pink-600"
                  } bg-clip-text`}>IT</span>
                </h1>
                <p className={`${darkMode ? "text-gray-300" : "text-slate-600"} mt-1 font-medium`}>
                  {getGreeting()}, ready to organize?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing || !userId}
                  className={`p-2 rounded-xl ${
                    darkMode ? 'bg-gray-700/60 hover:bg-gray-600' : 'bg-white/60 hover:bg-white'
                  } backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                  title={userId ? "Refresh" : "No user logged in"}
                >
                  <RefreshCw className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-700'} ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className={`p-2 rounded-xl ${
                  darkMode ? 'bg-gray-700/60 hover:bg-gray-600' : 'bg-white/60 hover:bg-white'
                } backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
                  <User className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`} />
                </button>
                <button className={`p-2 rounded-xl ${
                  darkMode ? 'bg-gray-700/60 hover:bg-gray-600' : 'bg-white/60 hover:bg-white'
                } backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
                  <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                isSearchFocused ? 'text-indigo-500 scale-110' : darkMode ? 'text-gray-400' : 'text-slate-400'
              }`}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search your saved content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full ${
                  darkMode
                    ? "bg-gray-700/90 text-white placeholder-gray-400"
                    : "bg-white/90 text-slate-900 placeholder-slate-500"
                } backdrop-blur-sm rounded-2xl pl-12 pr-4 py-4 border-2 transition-all duration-200 shadow-sm ${
                  isSearchFocused
                    ? "border-indigo-200 shadow-lg shadow-indigo-100/50"
                    : darkMode
                      ? "border-transparent hover:border-gray-600 hover:shadow-md"
                      : "border-transparent hover:border-slate-200 hover:shadow-md"
                }`}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-2">
              {[
                { key: "all", label: "All", icon: null },
                { key: "recent", label: "Recent", icon: Clock },
                { key: "important", label: `Priority (${stats.highPriority})`, icon: TrendingUp },
                { key: "pending", label: `Pending (${stats.pending})`, icon: Sparkles },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedFilter === key
                      ? "bg-indigo-100 text-indigo-700 shadow-sm scale-105"
                      : darkMode
                        ? "bg-gray-700/60 text-gray-300 hover:bg-gray-600/80 hover:shadow-sm"
                        : "bg-white/60 text-slate-600 hover:bg-white/80 hover:shadow-sm"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${darkMode ? "bg-gray-900" : "bg-white"} px-5 pt-4 pb-32`}>
          {/* Notification Banner */}
          {showNotificationBanner && (
            <div className={`${
              darkMode
                ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
            } rounded-2xl p-4 mb-6 relative shadow-sm`}>
              <button
                onClick={() => setShowNotificationBanner(false)}
                className={`absolute top-3 right-3 ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-800/50"
                    : "text-blue-400 hover:text-blue-600 hover:bg-blue-100"
                } transition-colors p-1 rounded-lg`}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3 pr-8">
                <div className={`p-2 ${darkMode ? "bg-blue-800" : "bg-blue-100"} rounded-xl`}>
                  <Sparkles className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div>
                  <h4 className={`${darkMode ? "text-blue-300" : "text-blue-900"} font-semibold mb-1`}>
                    Quick Save Tip
                  </h4>
                  <p className={`${darkMode ? "text-blue-200" : "text-blue-800"} text-sm leading-relaxed`}>
                    Add our widget to your notification panel for one-tap saving from anywhere on your device
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Card */}
          {selectedFilter === "all" && stats.total > 0 && (
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

          {/* Content Cards */}
          <div className="space-y-4">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Search className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <h3 className={`${darkMode ? 'text-white' : 'text-slate-900'} font-semibold mb-2`}>
                  {searchQuery ? "No items found" : contentItems.length === 0 ? "No content yet" : "No items match filter"}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-slate-500'} text-sm`}>
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : contentItems.length === 0 
                      ? userId 
                        ? 'Add some content to get started'
                        : 'Please log in to see your content'
                      : 'Try changing your filter'
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
                    key={item.id}
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