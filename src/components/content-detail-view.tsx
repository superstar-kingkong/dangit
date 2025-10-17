import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Share, Edit3, Trash2, CheckSquare, Square, MoreHorizontal,
  ExternalLink, Copy, Heart, Bookmark, Clock, Eye, PlayCircle, 
  PauseCircle, Volume2, Download, Star, Tag, Calendar, Link as LinkIcon,
  Image, Mic, FileText, Zap, Sparkles, CheckCircle2, AlertCircle, Save, X,
  Bell, BellOff, Clock3, Repeat
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface ContentDetailViewProps {
  content: {
    id: number;
    type: string;
    title: string;
    description: string;
    tags: string[];
    timestamp: string;
    completed: boolean;
    category: string;
    borderColor: string;
    originalUrl?: string;
    aiSummary?: string;
    created_at?: string;
    notifications?: {
      enabled: boolean;
      frequency: 'once' | 'daily' | 'weekly';
      time: string;
      customMessage?: string;
    } | string; // Can be string if stored as JSON string
  };
  onClose: () => void;
  onToggleComplete?: (id: number) => void;
  onContentUpdate?: (updatedContent: any) => void;
  darkMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  userId?: string;
}

export function ContentDetailView({ 
  content, 
  onClose, 
  onToggleComplete,
  onContentUpdate,
  darkMode = false,
  onEdit, 
  onDelete, 
  onShare,
  userId 
}: ContentDetailViewProps) {
  const [isCompleted, setIsCompleted] = useState(content.completed);
  const [isClosing, setIsClosing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  const [editedDescription, setEditedDescription] = useState(content.description);
  const [editedTags, setEditedTags] = useState(content.tags);
  const [newTag, setNewTag] = useState('');
  
  // FIXED: Notification state with proper persistence
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<'once' | 'daily' | 'weekly'>('once');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);
  
  // FIXED: Parse and set notification state properly
  useEffect(() => {
    setIsCompleted(content.completed);  
    setEditedTitle(content.title);
    setEditedDescription(content.description);
    setEditedTags(content.tags);
    
    // Parse notifications properly
    let notifications = null;
    
    if (content.notifications) {
      if (typeof content.notifications === 'string') {
        try {
          notifications = JSON.parse(content.notifications);
          console.log('Parsed notifications from string:', notifications);
        } catch (e) {
          console.warn('Failed to parse notification string:', content.notifications);
          notifications = null;
        }
      } else {
        notifications = content.notifications;
        console.log('Using notifications object:', notifications);
      }
    }
    
    // Set notification state
    if (notifications) {
      setNotificationsEnabled(notifications.enabled || false);
      setNotificationFrequency(notifications.frequency || 'once');
      setNotificationTime(notifications.time || '09:00');
      setCustomMessage(notifications.customMessage || '');
      console.log('Notification settings loaded:', {
        enabled: notifications.enabled,
        frequency: notifications.frequency,
        time: notifications.time
      });
    } else {
      // Reset to defaults if no notifications
      setNotificationsEnabled(false);
      setNotificationFrequency('once');
      setNotificationTime('09:00');  
      setCustomMessage('');
      console.log('No notification settings found, using defaults');
    }
  }, [content]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Content type icons and colors
  const typeConfig = {
    url: { icon: LinkIcon, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    screenshot: { icon: Image, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    voice: { icon: Mic, color: 'from-red-500 to-pink-500', bg: 'bg-red-50' },
    manual: { icon: FileText, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50' }
  };

  const currentType = typeConfig[content.type as keyof typeof typeConfig] || typeConfig.manual;

  // Animate entrance
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Track scroll progress for reading
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(Math.min(progress, 100));
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleClose = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // FIXED: Handle completion toggle with relative URL
  const handleToggleComplete = async () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    try {
      console.log('Toggling completion for item:', content.id, 'to:', newCompletedState, 'userId:', userId);
      
      // FIXED: Use relative URL for Next.js API route
      const response = await fetch(`/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: content.id,
          completed: newCompletedState,
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Toggle completion API error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully toggled completion:', result);

      // Trigger screen refreshes
      if ((window as any).refreshHomeScreen) {
        (window as any).refreshHomeScreen();
      }
      if ((window as any).refreshSearchScreen) {
        (window as any).refreshSearchScreen();
      }

      onToggleComplete?.(content.id);
      
    } catch (error) {
      console.error('Error toggling completion:', error);
      setIsCompleted(!newCompletedState);
      alert(`Failed to update completion status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content.description);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveEdit = () => {
    const updatedContent = {
      ...content,
      title: editedTitle,
      description: editedDescription,
      tags: editedTags
    };
    
    onContentUpdate?.(updatedContent);
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  // FIXED: Handle time display properly
  const formatTimeAgo = (createdAt?: string, fallbackTimestamp?: string) => {
    try {
      const now = new Date();
      const dateString = createdAt || fallbackTimestamp;
      
      if (!dateString) return 'Unknown time';
      
      // Check if dateString is already formatted (like "6h ago")
      if (dateString.includes('ago') || dateString.includes('now')) {
        console.warn('Already formatted time string passed:', dateString);
        return dateString; // Return as-is if already formatted
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds}s ago`;
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return `${diffInDays}d ago`;
      
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) return `${diffInMonths}mo ago`;
      
      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears}y ago`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time error';
    }
  };

  // FIXED: Save notification settings with relative URL and proper persistence
  const handleSaveNotificationSettings = async () => {
    setSavingNotification(true);
    
    try {
      const notificationSettings = {
        enabled: notificationsEnabled,
        frequency: notificationFrequency,
        time: notificationTime,
        customMessage: customMessage
      };

      console.log('Saving notification settings:', notificationSettings);

      // FIXED: Use relative URL for Next.js API route
      const response = await fetch(`/api/notification-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: content.id,
          userId: userId,
          notifications: notificationSettings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notification settings API error:', response.status, errorText);
        throw new Error(`Failed to save notification settings: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification settings saved successfully:', result);
      
      setNotificationSaved(true);
      
      // FIXED: Update the content object so notifications persist when navigating back
      if (onContentUpdate) {
        const updatedContent = {
          ...content,
          notifications: notificationSettings
        };
        onContentUpdate(updatedContent);
        console.log('Updated content with notification settings');
      }
      
      // Schedule the actual notification
      if (notificationsEnabled) {
        await scheduleNotification();
      }
      
      // Auto-hide success message
      setTimeout(() => setNotificationSaved(false), 3000);
      
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert(`Failed to save notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingNotification(false);
    }
  };

  // PWA Notification function
  const scheduleNotification = async () => {
    if (!notificationsEnabled || !('serviceWorker' in navigator) || !('Notification' in window)) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please enable notifications to receive reminders');
        return;
      }

      const now = new Date();
      const [hours, minutes] = notificationTime.split(':').map(Number);
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);

      if (notificationDate <= now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const delay = notificationDate.getTime() - now.getTime();

      setTimeout(() => {
        const message = customMessage || `Time to review: "${content.title}"`;
        const notification = new Notification('DANGIT Reminder', {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: `reminder-${content.id}`,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Schedule recurring notifications
        if (notificationFrequency === 'daily') {
          const dailyInterval = setInterval(() => {
            new Notification('DANGIT Reminder', {
              body: message,
              icon: '/icon-192x192.png',
              tag: `reminder-${content.id}`
            });
          }, 24 * 60 * 60 * 1000);

          localStorage.setItem(`notification-${content.id}`, dailyInterval.toString());
        } else if (notificationFrequency === 'weekly') {
          const weeklyInterval = setInterval(() => {
            new Notification('DANGIT Reminder', {
              body: message,
              icon: '/icon-192x192.png',
              tag: `reminder-${content.id}`
            });
          }, 7 * 24 * 60 * 60 * 1000);

          localStorage.setItem(`notification-${content.id}`, weeklyInterval.toString());
        }
      }, delay);

      console.log(`Notification scheduled for ${notificationDate.toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return (
    <div className={`
      fixed inset-0 z-50 transition-all duration-300 ease-out flex flex-col
      ${darkMode ? 'bg-gray-900' : 'bg-white'}
      ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    `}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .content-detail-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .content-detail-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `
      }} />

      {/* Reading Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 h-1 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Enhanced Header */}
      <div className={`relative overflow-hidden border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${currentType.color} opacity-10`} />
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} 
        />
        
        <div className="relative p-4 pb-6">
          {/* Top action bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleClose}
              className={`p-3 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-800/80 hover:bg-gray-800 text-gray-300' 
                  : 'bg-white/80 hover:bg-white text-gray-700'
              }`}
            >
              {isEditing ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            
            {isEditing ? (
              <Button
                onClick={handleSaveEdit}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm ${
                    isFavorited 
                      ? 'bg-red-100 text-red-600' 
                      : darkMode 
                        ? 'bg-gray-800/80 hover:bg-gray-800 text-gray-300' 
                        : 'bg-white/80 hover:bg-white text-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                
                <button 
                  onClick={onShare}
                  className={`p-3 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 ${
                    darkMode 
                      ? 'bg-gray-800/80 hover:bg-gray-800 text-gray-300' 
                      : 'bg-white/80 hover:bg-white text-gray-700'
                  }`}
                >
                  <Share className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowActions(!showActions)}
                  className={`p-3 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 ${
                    darkMode 
                      ? 'bg-gray-800/80 hover:bg-gray-800 text-gray-300' 
                      : 'bg-white/80 hover:bg-white text-gray-700'
                  }`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Content metadata with time display */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentType.color} shadow-lg`}>
                {React.createElement(currentType.icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <Badge 
                  className="mb-2 shadow-sm border-0"
                  style={{ 
                    backgroundColor: content.borderColor + '20', 
                    color: content.borderColor,
                    fontWeight: '600'
                  }}
                >
                  {content.category}
                </Badge>
                <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(content.created_at, content.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          {showActions && !isEditing && (
            <div className={`absolute right-4 top-20 rounded-2xl shadow-xl border py-2 z-10 min-w-48 animate-in slide-in-from-top-2 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Edit3 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span>Edit Content</span>
              </button>
              <button 
                onClick={handleCopyContent}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Copy className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span>Copy Text</span>
              </button>
              {content.originalUrl && (
                <button className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-900'
                }`}>
                  <ExternalLink className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span>Open Original</span>
                </button>
              )}
              <div className={`h-px my-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <button 
                onClick={onDelete}
                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto pb-32 overscroll-contain content-detail-scroll"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          height: 'calc(100vh - 140px)',
          maxHeight: 'calc(100vh - 140px)'
        }}
      >
        <div className="p-6 space-y-6">
          {/* Title with completion state */}
          <div className="relative">
            {isEditing ? (
              <textarea
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className={`w-full text-2xl font-bold leading-tight resize-none border-2 rounded-lg p-3 transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-400' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-400'
                }`}
                rows={2}
              />
            ) : (
              <h1 className={`text-2xl font-bold leading-tight transition-all duration-300 ${
                isCompleted 
                  ? darkMode ? 'text-gray-500 line-through opacity-60' : 'text-gray-500 line-through opacity-60'
                  : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editedTitle}
              </h1>
            )}
            {isCompleted && !isEditing && (
              <div className="absolute -right-2 -top-2">
                <CheckCircle2 className="w-8 h-8 text-green-500 animate-in zoom-in-50" />
              </div>
            )}
          </div>

          {/* Content Details section */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              Content Details
            </h3>
            
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className={`w-full h-48 resize-none border-2 rounded-lg p-3 transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-indigo-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-indigo-400'
                }`}
                placeholder="Enter content description..."
              />
            ) : (
              <div className={`leading-relaxed transition-all duration-300 ${
                showFullDescription ? '' : 'line-clamp-4'
              } ${
                isCompleted 
                  ? darkMode ? 'text-gray-500 opacity-60' : 'text-gray-500 opacity-60'
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <p>{editedDescription}</p>
              </div>
            )}
            
            {!showFullDescription && !isEditing && (
              <button 
                onClick={() => setShowFullDescription(true)}
                className="mt-3 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                Read more...
              </button>
            )}
          </div>

          {/* Tags Section */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Tag className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              Tags & Keywords
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {editedTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`px-3 py-1 transition-colors cursor-pointer relative group ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                  }`}
                >
                  #{tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className={`px-3 py-1 text-sm border rounded-full ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FIXED: Notification Settings with proper persistence */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {notificationsEnabled ? (
                <Bell className={`w-5 h-5 text-indigo-500`} />
              ) : (
                <BellOff className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
              Reminder Settings
            </h3>
            
            {/* Success message */}
            {notificationSaved && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Notification settings saved and will persist!
                  </p>
                </div>
              </div>
            )}
            
            {/* PWA notification support check */}
            {!('Notification' in window) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Notifications are not supported in this browser. Please use a modern browser or add this app to your home screen.
                </p>
              </div>
            )}
            
            {/* Main notification toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 mb-4 ${
              notificationsEnabled 
                ? 'border-indigo-200 bg-indigo-50' 
                : darkMode 
                  ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notificationsEnabled ? (
                    <Bell className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <BellOff className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                  <div>
                    <div className={`font-medium transition-colors ${
                      notificationsEnabled 
                        ? 'text-indigo-800' 
                        : darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notificationsEnabled ? 'Reminders Enabled' : 'Enable Reminders'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notificationsEnabled ? 'Settings will be saved when you click "Save Reminder Settings"' : 'Get PWA notifications to review this content'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>

            {/* Notification frequency and timing */}
            {notificationsEnabled && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* Frequency Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reminder Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'once', label: 'Once', icon: Clock3 },
                      { value: 'daily', label: 'Daily', icon: Repeat },
                      { value: 'weekly', label: 'Weekly', icon: Calendar }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNotificationFrequency(option.value as any)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                          notificationFrequency === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : darkMode
                              ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notification Time
                  </label>
                  <input
                    type="time"
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className={`w-full p-3 border-2 rounded-lg transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-indigo-400' 
                        : 'bg-white border-gray-200 text-gray-700 focus:border-indigo-400'
                    }`}
                  />
                </div>

                {/* Custom Message */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Custom Reminder Message <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g., 'Don't forget to review this article!'"
                    rows={2}
                    className={`w-full p-3 border-2 rounded-lg resize-none transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-indigo-400 placeholder:text-gray-500' 
                        : 'bg-white border-gray-200 text-gray-700 focus:border-indigo-400 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                {/* Save Notification Settings Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    onClick={handleSaveNotificationSettings}
                    disabled={savingNotification}
                    className={`w-full h-12 rounded-xl font-semibold ${
                      savingNotification
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white transition-all duration-200`}
                  >
                    {savingNotification ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Save Reminder Settings
                      </div>
                    )}
                  </Button>
                </div>

                {/* Preview */}
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preview Reminder:
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {customMessage || `Time to review: "${content.title}"`}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {notificationFrequency === 'once' ? 'One-time reminder' : 
                     notificationFrequency === 'daily' ? 'Daily' : 'Weekly'} at {notificationTime}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Floating Footer */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 backdrop-blur-lg border-t shadow-lg ${
        darkMode 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-100'
      }`}>
        <div className="max-w-lg mx-auto space-y-3">
          {/* Completion Toggle */}
          <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
            isCompleted 
              ? 'border-green-200 bg-green-50' 
              : darkMode 
                ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckSquare className="w-6 h-6 text-green-600" />
                ) : (
                  <Square className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                )}
                <div>
                  <div className={`font-medium transition-colors ${
                    isCompleted 
                      ? 'text-green-800' 
                      : darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {isCompleted ? 'Completed!' : 'Mark as Complete'}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isCompleted ? 'Great job finishing this!' : 'Mark when you\'re done with this item'}
                  </div>
                </div>
              </div>
              <Switch
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>

          {/* Quick Actions */}
          {!isEditing && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 rounded-2xl h-12 backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className={`flex-1 rounded-2xl h-12 backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
                onClick={onShare}
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
