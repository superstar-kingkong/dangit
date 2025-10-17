import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Share, Edit3, Trash2, CheckSquare, Square, MoreHorizontal,
  ExternalLink, Copy, Heart, Bookmark, Clock, Eye, PlayCircle, 
  PauseCircle, Volume2, Download, Star, Tag, Calendar, Link as LinkIcon,
  Image, Mic, FileText, Zap, Sparkles, CheckCircle2, AlertCircle, Save, X,
  Bell, BellOff, Clock3, Repeat, Smartphone
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { API_URL } from '../config';

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
    } | string;
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
  
  // SIMPLE Notification state (NO SERVICE WORKER)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<'once' | 'daily' | 'weekly'>('once');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  // Check PWA installation (NO SERVICE WORKER CHECK)
  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');
    
    setIsPWAInstalled(isPWA);
  }, []);
  
  // Parse notification state on mount
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
        } catch (e) {
          notifications = null;
        }
      } else {
        notifications = content.notifications;
      }
    }
    
    if (notifications && notifications.enabled) {
      setNotificationsEnabled(true);
      setNotificationFrequency(notifications.frequency || 'once');
      setNotificationTime(notifications.time || '09:00');
      setCustomMessage(notifications.customMessage || '');
      setShowNotificationSettings(false);
    } else {
      setNotificationsEnabled(false);
      setNotificationFrequency('once');
      setNotificationTime('09:00');  
      setCustomMessage('');
      setShowNotificationSettings(false);
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

  // Track scroll progress
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

  // Handle completion toggle
  const handleToggleComplete = async () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    try {
      const response = await fetch(`${API_URL}/api/toggle-completion`, {
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
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

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

  // Format time display
  const formatTimeAgo = (createdAt?: string, fallbackTimestamp?: string) => {
    try {
      const now = new Date();
      const dateString = createdAt || fallbackTimestamp;
      
      if (!dateString) return 'Unknown time';
      
      if (dateString.includes('ago') || dateString.includes('now')) {
        return dateString;
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
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
      return 'Time error';
    }
  };

  // UPDATED: Simple notification system WITHOUT service worker
  const scheduleSimpleNotification = async () => {
    try {
      console.log('Setting up simple notification system...');

      // Request permission
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings:\n\n1. Tap the 🔒 icon next to the URL\n2. Turn ON Notifications\n3. Try again');
        return false;
      }

      // Show immediate test notification
      const testNotif = new Notification('DANGIT - Reminder Set! 📱', {
        body: `You'll be reminded about "${editedTitle || content.title}" at ${notificationTime}`,
        icon: '/icons/web-app-manifest-192x192.png',
        tag: `test-${content.id}`,
      });

      // Auto-close test notification
      setTimeout(() => testNotif.close(), 3000);

      // Calculate delay for scheduled notification
      const now = new Date();
      const [hours, minutes] = notificationTime.split(':').map(Number);
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);

      if (notificationDate <= now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const delay = notificationDate.getTime() - now.getTime();

      // Clear existing timer
      const existingTimer = localStorage.getItem(`timer-${content.id}`);
      if (existingTimer) {
        clearTimeout(parseInt(existingTimer));
      }

      // Schedule notification using setTimeout
      const message = customMessage || `Time to review: "${editedTitle || content.title}"`;
      const reminderTitle = `DANGIT ${notificationFrequency === 'once' ? 'Reminder' : 
                            notificationFrequency === 'daily' ? 'Daily Reminder' : 'Weekly Reminder'} 🔔`;

      const timerId = setTimeout(() => {
        try {
          const notification = new Notification(reminderTitle, {
            body: message,
            icon: '/icons/web-app-manifest-192x192.png',
            tag: `reminder-${content.id}`,
          });
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
          
          console.log('📱 Reminder notification shown!');
          localStorage.removeItem(`timer-${content.id}`);
        } catch (error) {
          console.error('Notification error:', error);
          // Fallback to alert
          alert(`${reminderTitle}\n\n${message}`);
        }
      }, delay);

      localStorage.setItem(`timer-${content.id}`, timerId.toString());

      // Handle recurring notifications
      if (notificationFrequency !== 'once') {
        const interval = notificationFrequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        
        const recurringTimer = setInterval(() => {
          try {
            new Notification(`DANGIT ${notificationFrequency.charAt(0).toUpperCase() + notificationFrequency.slice(1)} Reminder`, {
              body: message,
              icon: '/icons/web-app-manifest-192x192.png',
              tag: `${notificationFrequency}-${content.id}`,
            });
          } catch (e) {
            console.error('Recurring notification error:', e);
            alert(`${reminderTitle}\n\n${message}`);
          }
        }, interval);

        localStorage.setItem(`${notificationFrequency}-${content.id}`, recurringTimer.toString());
      }

      console.log(`Notification scheduled for ${notificationDate.toLocaleString()}, delay: ${Math.floor(delay/60000)} minutes`);
      return true;

    } catch (error) {
      console.error('Notification setup error:', error);
      return false;
    }
  };

  // Save notification settings with simple approach
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

      // Try backend, fallback to local
      try {
        const response = await fetch(`${API_URL}/api/notification-settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: content.id,
            userId: userId,
            notifications: notificationSettings
          })
        });
        if (!response.ok) throw new Error('Backend unavailable');
        console.log('Notification settings saved to backend');
      } catch (e) {
        console.log('Using local storage for notifications');
      }
      
      // Update content locally
      if (onContentUpdate) {
        const updatedContent = {
          ...content,
          notifications: notificationSettings
        };
        onContentUpdate(updatedContent);
        console.log('Updated content locally with notification settings');
      }
      
      // Set up simple notifications
      if (notificationsEnabled) {
        await scheduleSimpleNotification();
        setNotificationSaved(true);
      } else {
        // Clear existing notifications
        const timerId = localStorage.getItem(`timer-${content.id}`);
        if (timerId) {
          clearTimeout(parseInt(timerId));
          localStorage.removeItem(`timer-${content.id}`);
        }
        
        // Clear recurring timers
        const dailyTimer = localStorage.getItem(`daily-${content.id}`);
        const weeklyTimer = localStorage.getItem(`weekly-${content.id}`);
        if (dailyTimer) {
          clearInterval(parseInt(dailyTimer));
          localStorage.removeItem(`daily-${content.id}`);
        }
        if (weeklyTimer) {
          clearInterval(parseInt(weeklyTimer));
          localStorage.removeItem(`weekly-${content.id}`);
        }
      }
      
      setShowNotificationSettings(false);
      setTimeout(() => setNotificationSaved(false), 5000);
      
    } catch (error) {
      console.error('Error saving notification settings:', error);
      
      // Show user-friendly error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('permission')) {
        alert('Please allow notifications in your browser settings:\n\n1. Tap the 🔒 icon next to the URL\n2. Turn ON Notifications\n3. Try again');
      } else {
        alert('Error setting up notifications. Make sure notifications are enabled in your browser settings.');
      }
    } finally {
      setSavingNotification(false);
    }
  };

  // Handle notification toggle
  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      setShowNotificationSettings(true);
    } else {
      setShowNotificationSettings(false);
      // Clear notifications
      const timerId = localStorage.getItem(`timer-${content.id}`);
      if (timerId) {
        clearTimeout(parseInt(timerId));
        localStorage.removeItem(`timer-${content.id}`);
      }
      
      if (onContentUpdate) {
        const updatedContent = {
          ...content,
          notifications: { enabled: false, frequency: 'once', time: '09:00', customMessage: '' }
        };
        onContentUpdate(updatedContent);
      }
    }
  };

  // Get notification summary
  const getNotificationSummary = () => {
    if (!notificationsEnabled) return null;
    
    const freqText = notificationFrequency === 'once' ? 'Once' : 
                    notificationFrequency === 'daily' ? 'Daily' : 'Weekly';
    
    const timeFormat = new Date(`2000-01-01T${notificationTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${freqText} at ${timeFormat}`;
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

          {/* Content metadata */}
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

          {/* UPDATED: Simple Notifications (NO SERVICE WORKER) */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-indigo-500" />
              ) : (
                <BellOff className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
              📱 Simple Reminders
            </h3>
            
            {/* Success message */}
            {notificationSaved && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl animate-in fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      📱 Reminder set successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      You'll get notified {getNotificationSummary()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show notification status when enabled, toggle when disabled */}
            {notificationsEnabled && !showNotificationSettings ? (
              <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-indigo-800 text-base">
                        📱 Reminder Active
                      </div>
                      <div className="text-sm text-indigo-700">
                        {getNotificationSummary()}
                        {customMessage && <div className="text-xs mt-1 italic">"{customMessage}"</div>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setShowNotificationSettings(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleToggleNotifications(false)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                      Turn Off
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 mb-4 ${notificationsEnabled ? 'border-indigo-200 bg-indigo-50' : darkMode ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? (
                      <Bell className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <BellOff className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    )}
                    <div>
                      <div className={`font-medium text-base transition-colors ${notificationsEnabled ? 'text-indigo-800' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {notificationsEnabled ? 'Setting Up Reminder...' : '📱 Set Reminder'}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {notificationsEnabled ? 'Configure your reminder settings below' : 'Get browser notifications'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleToggleNotifications}
                    className="data-[state=checked]:bg-indigo-600 scale-125"
                  />
                </div>
              </div>
            )}

            {/* Notification Settings Panel */}
            {notificationsEnabled && showNotificationSettings && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                {/* Frequency */}
                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📅 How Often?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'once', label: 'Once', icon: Clock3 },
                      { value: 'daily', label: 'Daily', icon: Repeat },
                      { value: 'weekly', label: 'Weekly', icon: Calendar }
                    ].map((option) => (
                      <button key={option.value} onClick={() => setNotificationFrequency(option.value as any)} className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 touch-manipulation ${notificationFrequency === option.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 scale-105' : darkMode ? 'border-gray-600 hover:border-gray-500 text-gray-300' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                        <option.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ⏰ What Time?
                  </label>
                  <input type="time" value={notificationTime} onChange={(e) => setNotificationTime(e.target.value)} className={`w-full p-4 border-2 rounded-xl text-lg transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-indigo-400' : 'bg-white border-gray-200 text-gray-700 focus:border-indigo-400'}`} />
                </div>

                {/* Custom Message */}
                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    💬 Custom Message <span className="text-sm font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="e.g., 'Don't forget to review this!'" rows={3} className={`w-full p-4 border-2 rounded-xl resize-none transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-indigo-400 placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-700 focus:border-indigo-400 placeholder:text-gray-400'}`} />
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-600">
                  <button onClick={handleSaveNotificationSettings} disabled={savingNotification} className={`w-full h-16 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 touch-manipulation shadow-lg ${savingNotification ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'} text-white`}>
                    {savingNotification ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Setting Up Reminder...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Bell className="w-6 h-6" />
                        <span>📱 Set Browser Notification</span>
                      </div>
                    )}
                  </button>
                  
                  <button onClick={() => setShowNotificationSettings(false)} className={`w-full mt-3 h-12 rounded-xl text-base font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    Cancel
                  </button>
                </div>

                {/* Preview */}
                <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📱 Preview Notification:
                  </div>
                  <div className="bg-white rounded-lg border p-3 text-black text-sm">
                    <div className="font-semibold">DANGIT Reminder 🔔</div>
                    <div className="text-gray-700 mt-1">{customMessage || `Time to review: "${content.title}"`}</div>
                    <div className="text-xs text-gray-500 mt-2">{getNotificationSummary()} • Tap to open</div>
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
                    {isCompleted ? 'Great job!' : 'Mark when done'}
                  </div>
                </div>
              </div>
              <Switch
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="data-[state=checked]:bg-green-600 scale-125"
              />
            </div>
          </div>

          {!isEditing && (
            <div className="flex gap-3">
              <Button variant="outline" className={`flex-1 rounded-2xl h-12 backdrop-blur-sm text-base font-medium ${darkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'}`} onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />Edit
              </Button>
              <Button variant="outline" className={`flex-1 rounded-2xl h-12 backdrop-blur-sm text-base font-medium ${darkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'}`} onClick={onShare}>
                <Share className="w-4 h-4 mr-2" />Share
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
