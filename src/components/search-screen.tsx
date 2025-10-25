import { API_URL } from '../config';
import { supabase } from '../lib/supabase'; // 🔒 Import your existing supabase client
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, Calendar, Star, Tag, X, RefreshCw } from 'lucide-react';

interface SearchScreenProps {
  onShowContentDetail: (content: any) => void;
  darkMode?: boolean;
  userId?: string;
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
  originalUrl?: string;
  image_url?: string;
  content_type?: string;
  original_content?: string;
  createdAt?: string;
}

type SortOption = 'newest' | 'oldest' | 'title' | 'category' | 'priority';
type FilterOption = 'all' | 'completed' | 'pending';

// Simple UI components
const Badge = ({ children, className, variant = 'default' }: any) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ children, onClick, className, variant = 'default' }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg font-medium transition-all ${className}`}>
    {children}
  </button>
);

// Simple ContentCard component
const ContentCard = ({ content, onClick, onToggleComplete, darkMode }: any) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) onToggleComplete(content.id, !content.completed);
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

export function SearchScreen({ onShowContentDetail, darkMode = false, userId}: SearchScreenProps) {
  // State
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI state
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Category color mapping
  const categoryColors: Record<string, string> = {
    'Work': '#2563EB',
    'Personal': '#10B981',
    'Ideas': '#8B5CF6',
    'Research': '#F59E0B',
    'Shopping': '#EC4899',
    'Travel': '#06B6D4',
    'Health': '#EF4444',
    'Food': '#84CC16',
    'Learning': '#10B981',
    'AI Tools': '#3B82F6',
    'Entertainment': '#F59E0B',
    'Food & Dining': '#EF4444',
    'Coupons & Deals': '#EC4899',
    'Productivity': '#6B7280',
    'Health & Fitness': '#06B6D4',
    'Finance': '#F97316',
    'Other': '#6B7280'
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

  // 🔒 SECURE: Fetch data with authentication
  const loadContentItems = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    try {
      console.log('🔒 Loading search data securely from server...');
      
      // Get auth token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.access_token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      // Use secure API call with authentication
      const response = await fetch(`${API_URL}/api/saved-items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // 🔒 Add auth token
        }
        // Note: Removed userId from query - comes from token now
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🔒 Search data loaded securely:', result.data?.length || 0, 'items');
      
      if (result.data && Array.isArray(result.data)) {
        const transformedItems: ContentItem[] = result.data.map((item: any) => ({
          id: item.id,
          type: item.content_type,
          title: item.title,
          description: item.ai_summary || 'No description',
          tags: Array.isArray(item.ai_tags) ? item.ai_tags : [],
          timestamp: formatTimeAgo(item.created_at),
          completed: item.is_completed,
          category: item.ai_category,
          borderColor: categoryColors[item.ai_category] || categoryColors['Other'],
          priority: determinePriority(item.ai_category, item.created_at),
          aiScore: 8.0,
          originalUrl: item.original_content || null, // URL goes here
          image_url: item.original_image_url || null, // Image URL here
          content_type: item.content_type || 'text', // Type
          original_content: item.original_content || null, // Raw content
          created_at: item.created_at // Full timestamp
        }));
        
        setContentItems(transformedItems);
      } else {
        setContentItems([]);
      }
    } catch (error) {
      console.error('Error loading search data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load content. Please check your connection.';
      setError(errorMessage);
      setContentItems([]);
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContentItems(false);
  };

  // Load data on mount and setup global refresh
  useEffect(() => {
    loadContentItems();
    
    // Listen for global refresh from add screen
    (window as any).refreshSearchScreen = () => {
      console.log('Search screen refresh triggered');
      handleRefresh();
    };
    
    return () => {
      delete (window as any).refreshSearchScreen;
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        loadContentItems(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [loading]);

  // 🔒 SECURE: Handle completion toggle with authentication
  const handleToggleComplete = async (itemId: string, newCompletedState: boolean) => {
    if (!userId) return;

    // Optimistic update for search screen
    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: newCompletedState }
          : item
      )
    );

    try {
      console.log('🔒 Securely toggling completion for item:', itemId, 'to:', newCompletedState);
      
      // Get auth token
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.access_token) {
        throw new Error('Session expired. Please sign in again.');
      }
      
      // Use secure API call for toggle completion
      const response = await fetch(`${API_URL}/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // 🔒 Add auth token
        },
        body: JSON.stringify({
          itemId: itemId,
          completed: newCompletedState
          // Note: Removed userId - comes from token now
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        throw new Error(`HTTP ${response.status}: Failed to update item`);
      }

      const result = await response.json();
      console.log('✅ Successfully toggled completion securely:', result);
      
      // IMPORTANT: Trigger home screen refresh to sync the changes
      if ((window as any).refreshHomeScreen) {
        console.log('Triggering home screen refresh from search');
        (window as any).refreshHomeScreen();
      }
      
      // Refresh search screen data after small delay to ensure backend is updated
      setTimeout(() => loadContentItems(false), 500);
      
    } catch (error) {
      console.error('Error toggling completion:', error);
      
      // Revert optimistic update
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

  // Calculate categories dynamically
  const categories = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    
    contentItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const cats = [
      { name: 'All', color: '#6B7280', count: contentItems.length }
    ];

    Object.entries(categoryCount).forEach(([name, count]) => {
      cats.push({
        name,
        color: categoryColors[name] || '#6B7280',
        count
      });
    });

    return cats;
  }, [contentItems]);

  // Sorting function
  const sortItems = (items: ContentItem[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime();
        case 'oldest':
          return new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        default:
          return 0;
      }
    });
  };

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = contentItems.filter(item => {
      // Category filter
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Completion filter
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'completed' && item.completed) ||
        (filterBy === 'pending' && !item.completed);
      
      return matchesCategory && matchesSearch && matchesFilter;
    });

    return sortItems(items);
  }, [contentItems, activeCategory, searchQuery, filterBy, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Calendar },
    { value: 'oldest', label: 'Oldest First', icon: Calendar },
    { value: 'title', label: 'Title A-Z', icon: SortAsc },
    { value: 'category', label: 'Category', icon: Tag },
    { value: 'priority', label: 'Priority', icon: Star }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Items', count: contentItems.length },
    { value: 'pending', label: 'Pending', count: contentItems.filter(item => !item.completed).length },
    { value: 'completed', label: 'Completed', count: contentItems.filter(item => item.completed).length }
  ];

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setFilterBy('all');
    setSortBy('newest');
  };

  const hasActiveFilters = activeCategory !== 'All' || searchQuery !== '' || filterBy !== 'all' || sortBy !== 'newest';

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>🔒 Loading your content securely...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {error.includes('Authentication') ? 'Authentication Error' : 'Connection Error'}
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{error}</p>
          <button
            onClick={() => loadContentItems()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* REMOVED: Status Bar - No longer needed since phone provides this */}
      
      {/* FIXED: Scrollable Content - Full height now that status bar is removed */}
      <div className="overflow-y-auto h-screen">
        {/* Header Section - FIXED: Removed backdrop blur that caused search icon to blur */}
        <div className={`${darkMode 
          ? 'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-700' 
          : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
        } px-5 pt-6 pb-6`}>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl tracking-tight font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Search & Filter
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  refreshing
                    ? 'opacity-50' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                } shadow-sm hover:shadow-md hover:scale-105`}
                title="Refresh Securely"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${
                  hasActiveFilters || showFilters
                    ? 'bg-indigo-100 text-indigo-700' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FIXED: Search Bar - Removed backdrop blur, solid backgrounds */}
          <div className="relative mb-6">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search your saved content"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${darkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 hover:border-gray-500 focus:border-indigo-400' 
                : 'bg-white text-slate-900 placeholder-slate-500 border-gray-200 hover:border-slate-300 focus:border-indigo-500'
              } rounded-2xl pl-12 pr-4 py-4 border-2 hover:shadow-md focus:shadow-lg transition-all duration-200`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                  darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`mb-4 p-4 rounded-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filters & Sorting</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sort Options */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sort by</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as SortOption)}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-all text-sm ${
                            sortBy === option.value
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : darkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</h4>
                  <div className="space-y-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterBy(option.value as FilterOption)}
                        className={`flex items-center justify-between w-full p-2 rounded-lg text-sm transition-all ${
                          filterBy === option.value
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{option.label}</span>
                        <Badge className={`text-xs ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                          {option.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Filters - FIXED: Removed backdrop blur */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.name
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm scale-105'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}</span>
                <Badge className={`text-xs ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'}`}>
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} px-5 pt-4 pb-32`}>
          {/* Results Summary */}
          <div className="mb-4 flex items-center justify-between">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} 
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Content Cards */}
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  onClick={onShowContentDetail}
                  onToggleComplete={handleToggleComplete}
                  darkMode={darkMode}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Search className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-600'} mb-2`}>
                  No results found
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  Try adjusting your search or filters
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearAllFilters}
                    className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-full`}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
