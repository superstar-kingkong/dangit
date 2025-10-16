import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  User, Settings, HelpCircle, Shield, Bell, Trash2, LogOut, BarChart3, 
  Target, Clock, CheckCircle, TrendingUp, Award, Edit,
  ChevronRight, Download, Share2, Eye, Moon, RefreshCw
} from 'lucide-react';

interface ProfileScreenProps {
  darkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
  onEditProfile: () => void;
  onSignOut: () => void;
  userProfile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    joinDate: string;
    level: string;
  };
}

// Better Switch Component
const Switch = ({ checked, onCheckedChange, darkMode }: any) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
      checked 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
        : darkMode ? 'bg-gray-700' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export function ProfileScreen({ 
  darkMode, 
  onDarkModeToggle, 
  onEditProfile, 
  onSignOut,
  userProfile
}: ProfileScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    completedItems: 0,
    pendingItems: 0,
    completionRate: 0,
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  // Calculate real streak from user activity
  const calculateStreak = (items: any[]) => {
    if (!items || items.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Sort items by date
    const sortedItems = items
      .map(item => new Date(item.created_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Check consecutive days
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const hasActivity = sortedItems.some(date => {
        const itemDate = new Date(date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === checkDate.getTime();
      });
      
      if (hasActivity) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  // Load user stats from server
  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Get stats
      const statsResponse = await fetch(`${API_URL}/api/user-stats?userId=${encodeURIComponent(userProfile.email)}`);
      
      if (statsResponse.ok) {
        const result = await statsResponse.json();
        if (result.success) {
          setStats(result.stats);
        }
      }
      
      // Get all items to calculate streak
      const itemsResponse = await fetch(`${API_URL}/api/saved-items?userId=${encodeURIComponent(userProfile.email)}`);
      
      if (itemsResponse.ok) {
        const itemsResult = await itemsResponse.json();
        if (itemsResult.data) {
          const calculatedStreak = calculateStreak(itemsResult.data);
          setStreak(calculatedStreak);
        }
      }
      
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, [userProfile.email]);

  // Convert category breakdown to array
  const categoryArray = Object.entries(stats.categoryBreakdown || {}).map(([name, count]) => {
    const colors = {
      'Work': '#2563EB',
      'Research': '#F59E0B', 
      'Ideas': '#8B5CF6',
      'Personal': '#10B981',
      'Learning': '#06B6D4',
      'Shopping': '#EC4899',
      'AI Tools': '#6366F1',
      'Entertainment': '#EF4444',
      'Finance': '#F59E0B',
      'Other': '#6B7280'
    };
    
    const percentage = stats.totalItems > 0 ? Math.round((count as number / stats.totalItems) * 100) : 0;
    
    return {
      name,
      count: count as number,
      color: colors[name as keyof typeof colors] || '#6B7280',
      percentage
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  const handleClearData = () => {
    if (confirm('⚠️ This will permanently delete ALL your saved content. This action cannot be undone. Are you absolutely sure?')) {
      alert('Clear data functionality would be implemented here');
    }
  };

  const menuSections = [
    {
      title: 'Preferences',
      items: [
        { 
          icon: Moon, 
          label: 'Dark Mode', 
          color: darkMode ? 'text-indigo-400' : 'text-indigo-600', 
          hasSwitch: true, 
          value: darkMode, 
          setter: onDarkModeToggle,
          description: 'Easier on your eyes'
        },
        { 
          icon: Bell, 
          label: 'Notifications', 
          color: darkMode ? 'text-purple-400' : 'text-purple-600', 
          hasSwitch: true, 
          value: notificationsEnabled, 
          setter: setNotificationsEnabled,
          description: 'Get reminders'
        }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: Edit, label: 'Edit Profile', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'edit' },
        { icon: Shield, label: 'Privacy & Security', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'privacy' },
        { icon: Download, label: 'Export Data', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'export' },
        { icon: Share2, label: 'Share App', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'share' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'help' },
        { icon: Eye, label: 'What\'s New', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'updates' }
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { icon: Trash2, label: 'Clear All Data', color: 'text-red-500', action: 'clear' },
        { icon: LogOut, label: 'Sign Out', color: 'text-red-500', action: 'logout' }
      ]
    }
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        onEditProfile();
        break;
      case 'logout':
        handleSignOut();
        break;
      case 'clear':
        handleClearData();
        break;
      case 'privacy':
        alert('Privacy settings would open here');
        break;
      case 'export':
        alert('Data export would start here');
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'DANGIT - Smart Content Organizer',
            text: 'Check out this amazing app for organizing your content!',
            url: window.location.href
          });
        } else {
          alert('Share functionality would open here');
        }
        break;
      case 'help':
        alert('Help center would open here');
        break;
      case 'updates':
        alert('What\'s new would open here');
        break;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6" style={{ paddingBottom: '140px' }}>
      
        
        {/* Header with User Info */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 px-6 pt-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white">Profile</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={loadUserStats}
                disabled={loading}
                className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors active:scale-95 disabled:opacity-50"
                title="Refresh Stats"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onEditProfile}
                className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors active:scale-95"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* User Card */}
          <div className={`backdrop-blur-sm rounded-3xl p-6 shadow-xl ${
            darkMode ? 'bg-gray-800/95' : 'bg-white/95'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                {stats.totalItems > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile.name}
                </h2>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {userProfile.email}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  {stats.totalItems > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                      {userProfile.level}
                    </span>
                  )}
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                      <span className="text-base">🔥</span>
                      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading your stats...
                </p>
              </div>
            ) : (
              <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalItems}
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Items Saved
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-600">
                    {stats.completionRate}%
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-600">
                    {stats.pendingItems}
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section - Only show if user has content */}
        {!loading && stats.totalItems > 0 && (
          <div className="px-6 py-6">
            <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Your Analytics
            </h3>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-4 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className={`text-2xl font-black mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                  {stats.totalItems}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                  Total Saved
                </div>
              </div>

              <div className={`p-4 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div className={`text-2xl font-black mb-1 ${darkMode ? 'text-green-400' : 'text-green-900'}`}>
                  {stats.completedItems}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-green-600'}`}>
                  Completed
                </div>
              </div>

              <div className={`p-4 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div className={`text-2xl font-black mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-900'}`}>
                  {stats.pendingItems}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                  Pending
                </div>
              </div>

              <div className={`p-4 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <div className={`text-2xl font-black mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-900'}`}>
                  {stats.completionRate}%
                </div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                  Success Rate
                </div>
              </div>
            </div>

            {/* Categories */}
            {categoryArray.length > 0 && (
              <div className={`p-5 rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h4 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Top Categories
                </h4>
                <div className="space-y-4">
                  {categoryArray.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.percentage}%
                          </span>
                          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.count}
                          </span>
                        </div>
                      </div>
                      <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Sections */}
        <div className="px-6 pb-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className={`text-sm font-black uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                {section.title}
              </h3>
              <div className={`divide-y rounded-2xl shadow-sm overflow-hidden ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700 divide-gray-700' 
                  : 'bg-white border border-gray-200 divide-gray-100'
              }`}>
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return item.hasSwitch ? (
                    <div
                      key={index}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2.5 rounded-xl ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.label}
                          </div>
                          {item.description && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Switch 
                        checked={item.value} 
                        onCheckedChange={item.setter}
                        darkMode={darkMode}
                      />
                    </div>
                  ) : (
                    <button
                      key={index}
                      onClick={() => item.action && handleAction(item.action)}
                      className={`w-full p-4 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${
                          item.color === 'text-red-500' 
                            ? 'bg-red-50' 
                            : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className={`font-semibold ${item.color}`}>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 text-center">
          <div className={`rounded-2xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-3xl font-black mb-2">
              <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
            </div>
            <p className={`text-sm mb-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Version 1.0.0
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Made with ❤️ for productivity enthusiasts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}