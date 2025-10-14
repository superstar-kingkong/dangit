import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  User, Settings, HelpCircle, Shield, Bell, Trash2, LogOut, BarChart3, 
  Target, Clock, CheckCircle, TrendingUp, Award, Calendar, Edit,
  ChevronRight, Download, Share2, Eye, Moon, RefreshCw
} from 'lucide-react';

interface ProfileScreenProps {
  darkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
  onEditProfile: () => void;
  onSignOut: () => void; // Add this prop
  userProfile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    joinDate: string;
    level: string;
  };
  currentTime?: Date;
}

// Simple UI components
const Card = ({ children, className }: any) => (
  <div className={`rounded-xl border ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg font-medium transition-all ${className}`}>
    {children}
  </button>
);

const Switch = ({ checked, onCheckedChange }: any) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
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
  userProfile, 
  currentTime 
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

  // Load user stats from server
  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/user-stats?userId=${encodeURIComponent(userProfile.email)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.stats);
        }
      } else {
        console.error('Failed to load user stats:', response.status);
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

  const userData = {
    ...userProfile,
    avatar: null,
    streak: 7 // Could be calculated from actual data
  };

  // Convert category breakdown to array format for display
  const categoryArray = Object.entries(stats.categoryBreakdown || {}).map(([name, count]) => {
    const colors = {
      'Work': '#2563EB',
      'Research': '#F59E0B', 
      'Ideas': '#8B5CF6',
      'Personal': '#10B981',
      'Learning': '#06B6D4',
      'Shopping': '#EC4899',
      'Other': '#6B7280'
    };
    
    const percentage = stats.totalItems > 0 ? Math.round((count as number / stats.totalItems) * 100) : 0;
    
    return {
      name,
      count: count as number,
      color: colors[name as keyof typeof colors] || '#6B7280',
      percentage
    };
  }).sort((a, b) => b.count - a.count).slice(0, 4); // Show top 4 categories

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      // Could implement clear data functionality
      alert('Clear data functionality would be implemented here');
    }
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Edit, label: 'Edit Profile', color: darkMode ? 'text-gray-300' : 'text-gray-700', action: 'edit' },
        { icon: Bell, label: 'Notifications', color: darkMode ? 'text-gray-300' : 'text-gray-700', hasSwitch: true, value: notificationsEnabled, setter: setNotificationsEnabled },
        { icon: Moon, label: 'Dark Mode', color: darkMode ? 'text-gray-300' : 'text-gray-700', hasSwitch: true, value: darkMode, setter: onDarkModeToggle }
      ]
    },
    {
      title: 'Data & Privacy',
      items: [
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
      default:
        console.log('Action:', action);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Status Bar */}
      <div className={`flex justify-between items-center px-6 pt-4 pb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentTime ? currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          }) : '9:41'}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
            <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-800'}`}></div>
          </div>
          <div className={`ml-2 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>100%</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Header with User Info */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={loadUserStats}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Refresh Stats"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={onEditProfile}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Enhanced User Card */}
          <div className={`backdrop-blur-sm rounded-3xl p-6 shadow-xl ${
            darkMode ? 'bg-gray-800/95' : 'bg-white/95'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userData.name}
                </h2>
                <p className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {userData.email}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                    {userData.level}
                  </span>
                  <div className="flex items-center gap-1 text-orange-600">
                    <span className="text-lg">🔥</span>
                    <span className="font-semibold">{userData.streak} day streak</span>
                  </div>
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
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalItems}
                  </div>
                  <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Items Saved
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.completionRate}%
                  </div>
                  <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.pendingItems}
                  </div>
                  <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {!loading && stats.totalItems > 0 && (
          <div className="px-6 py-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Your Analytics
            </h3>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className={`p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm ${
                darkMode ? 'dark:from-blue-900/20 dark:to-blue-800/20' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                </div>
                <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {stats.totalItems}
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Total Saved
                </div>
              </Card>

              <Card className={`p-3 bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm ${
                darkMode ? 'dark:from-green-900/20 dark:to-green-800/20' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <Award className="w-3 h-3 text-green-600" />
                </div>
                <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                  {stats.completedItems}
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Completed
                </div>
              </Card>

              <Card className={`p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm ${
                darkMode ? 'dark:from-purple-900/20 dark:to-purple-800/20' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <Target className="w-3 h-3 text-purple-600" />
                </div>
                <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                  {stats.pendingItems}
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Pending
                </div>
              </Card>

              <Card className={`p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm ${
                darkMode ? 'dark:from-orange-900/20 dark:to-orange-800/20' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <TrendingUp className="w-3 h-3 text-orange-600" />
                </div>
                <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                  {stats.completionRate}%
                </div>
                <div className={`text-sm font-medium ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Success Rate
                </div>
              </Card>
            </div>

            {/* Enhanced Categories Breakdown */}
            {categoryArray.length > 0 && (
              <Card className={`p-6 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Categories Breakdown
                </h4>
                <div className="space-y-4">
                  {categoryArray.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.percentage}%
                          </span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
              </Card>
            )}
          </div>
        )}

        {/* Settings Sections */}
        <div className="px-6 pb-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h3>
              <Card className={`divide-y shadow-sm ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 divide-gray-700' 
                  : 'bg-white border-gray-200 divide-gray-100'
              }`}>
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return item.hasSwitch ? (
                    <div
                      key={index}
                      className={`w-full p-4 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${
                          item.color === 'text-red-500' ? 'bg-red-50' : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className={`font-medium ${item.color}`}>{item.label}</span>
                      </div>
                      <Switch 
                        checked={item.value} 
                        onCheckedChange={item.setter}
                      />
                    </div>
                  ) : (
                    <button
                      key={index}
                      onClick={() => item.action && handleAction(item.action)}
                      className={`w-full p-4 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${
                          item.color === 'text-red-500' ? 'bg-red-50' : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className={`font-medium ${item.color}`}>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 text-center">
          <div className={`rounded-2xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-2xl font-black mb-2">
              <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
            </div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Version 2.0.0</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Made with care for productivity enthusiasts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}