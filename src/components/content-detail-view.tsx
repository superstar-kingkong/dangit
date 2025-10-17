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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
    readingTime?: string;
    viewCount?: number;
    createdAt?: string; // Add this for actual time calculation
    notifications?: {
      enabled: boolean;
      frequency: 'once' | 'daily' | 'weekly';
      time: string;
      customMessage?: string;
    };
  };
  onClose: () => void;
  onToggleComplete?: (id: number) => void;
  onContentUpdate?: (updatedContent: any) => void;
  darkMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  userId?: string; // Add userId for notifications
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
  
  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(content.notifications?.enabled || false);
  const [notificationFrequency, setNotificationFrequency] = useState(content.notifications?.frequency || 'once');
  const [notificationTime, setNotificationTime] = useState(content.notifications?.time || '09:00');
  const [customMessage, setCustomMessage] = useState(content.notifications?.customMessage || '');
  
  // Update edited state when content changes
  useEffect(() => {
    setEditedTitle(content.title);
    setEditedDescription(content.description);
    setEditedTags(content.tags);
    setNotificationsEnabled(content.notifications?.enabled || false);
    setNotificationFrequency(content.notifications?.frequency || 'once');
    setNotificationTime(content.notifications?.time || '09:00');
    setCustomMessage(content.notifications?.customMessage || '');
  }, [content.title, content.description, content.tags, content.notifications]);
  
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

  // FIXED: Handle completion toggle with backend sync and home screen refresh
  const handleToggleComplete = async () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    try {
      // Update backend
      const response = await fetch(`${API_URL}/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: content.id.toString(),
          completed: newCompletedState,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update completion status');
      }

      // Trigger home screen refresh to show/hide the item
      if ((window as any).refreshHomeScreen) {
        console.log('Triggering home screen refresh from content detail');
        (window as any).refreshHomeScreen();
      }

      // Also trigger search screen refresh
      if ((window as any).refreshSearchScreen) {
        console.log('Triggering search screen refresh from content detail');
        (window as any).refreshSearchScreen();
      }

      // Call the parent toggle handler
      onToggleComplete?.(content.id);
      
    } catch (error) {
      console.error('Error toggling completion:', error);
      // Revert the state if backend update failed
      setIsCompleted(!newCompletedState);
      alert('Failed to update completion status. Please try again.');
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content.description);
    // Show toast notification
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSaveEdit = () => {
    // Create updated content object
    const updatedContent = {
      ...content,
      title: editedTitle,
      description: editedDescription,
      tags: editedTags,
      notifications: {
        enabled: notificationsEnabled,
        frequency: notificationFrequency,
        time: notificationTime,
        customMessage: customMessage
      }
    };
    
    // Call the update function passed from parent
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

  // FIXED: Calculate actual time since creation
  const formatTimeAgo = (timestamp: string, createdAt?: string) => {
    const now = new Date();
    const date = new Date(createdAt || timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    const diffInDays = Math.floor(diffInMinutes / 1440);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  };

  // FIXED: PWA Notification function
  const scheduleNotification = async () => {
    if (!notificationsEnabled || !('serviceWorker' in navigator) || !('Notification' in window)) {
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please enable notifications to receive reminders');
        return;
      }

      // Calculate notification time
      const now = new Date();
      const [hours, minutes] = notificationTime.split(':').map(Number);
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (notificationDate <= now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const delay = notificationDate.getTime() - now.getTime();

      // Schedule the notification
      setTimeout(() => {
        const message = customMessage || `Time to review: "${content.title}"`;
        new Notification('DANGIT Reminder', {
          body: message,
          icon: '/icon-192x192.png', // Your PWA icon
          badge: '/icon-192x192.png',
          tag: `reminder-${content.id}`,
          requireInteraction: true,
          actions: [
            { action: 'open', title: 'Open Item' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        });

        // Schedule recurring notifications
        if (notificationFrequency === 'daily') {
          const dailyInterval = setInterval(() => {
            new Notification('DANGIT Reminder', {
              body: message,
              icon: '/icon-192x192.png',
              tag: `reminder-${content.id}`
            });
          }, 24 * 60 * 60 * 1000); // 24 hours

          // Store interval ID to clear later if needed
          localStorage.setItem(`notification-${content.id}`, dailyInterval.toString());
        } else if (notificationFrequency === 'weekly') {
          const weeklyInterval = setInterval(() => {
            new Notification('DANGIT Reminder', {
              body: message,
              icon: '/icon-192x192.png',
              tag: `reminder-${content.id}`
            });
          }, 7 * 24 * 60 * 60 * 1000); // 7 days

          localStorage.setItem(`notification-${content.id}`, weeklyInterval.toString());
        }
      }, delay);

      console.log(`Notification scheduled for ${notificationDate.toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Schedule notification when settings change
  useEffect(() => {
    if (notificationsEnabled) {
      scheduleNotification();
    } else {
      // Clear existing notifications
      const intervalId = localStorage.getItem(`notification-${content.id}`);
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        localStorage.removeItem(`notification-${content.id}`);
      }
    }
  }, [notificationsEnabled, notificationFrequency, notificationTime, customMessage]);

  return (
    <div className={`
      fixed inset-0 z-50 transition-all duration-300 ease-out flex flex-col
      ${darkMode ? 'bg-gray-900' : 'bg-white'}
      ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    `}>
      {/* FIXED: Custom CSS without JSX syntax error */}
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
        {/* Dynamic gradient background based on content type */}
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
                    {formatTimeAgo(content.timestamp, content.createdAt)}
                  </div>
                  {content.readingTime && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.readingTime} read
                    </div>
                  )}
                  {/* REMOVED: View count - using actual time instead */}
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
          {/* FIXED: Title with completion state - crosses out when completed */}
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

          {/* REMOVED: AI Summary Section - keeping only one content section */}

          {/* Original Content Preview */}
          {content.type === 'url' && (
            <div className={`rounded-2xl border p-5 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Original Article</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>example.com</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </Button>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <LinkIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <span className="text-blue-600 font-medium">Website Preview</span>
                </div>
              </div>
            </div>
          )}

          {content.type === 'voice' && (
            <div className={`rounded-2xl border p-5 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Voice Recording</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2:34 duration • 45 KB</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <PauseCircle className="w-4 h-4 mr-1" /> : <PlayCircle className="w-4 h-4 mr-1" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                <div className="flex justify-center items-center gap-1 h-16 mb-3">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className={`bg-red-400 rounded-full transition-all duration-200 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        width: '3px',
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">0:00</span>
                  <Volume2 className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">2:34</span>
                </div>
              </div>
            </div>
          )}

          {content.type === 'screenshot' && (
            <div className={`rounded-2xl border p-5 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Screenshot Analysis</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI extracted text and context</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full">
                  <Download className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <span className="text-green-600 font-medium">Screenshot Preview</span>
                </div>
              </div>
            </div>
          )}

          {/* MODIFIED: Single Content Details section (removed duplicate) */}
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

          {/* Enhanced Tags Section */}
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
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`px-3 py-1 border-2 border-dashed rounded-full text-sm transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                  }`}
                >
                  + Add tag
                </button>
              )}
            </div>
          </div>

          {/* ENHANCED: PWA Notification Settings Section */}
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
                      {notificationsEnabled ? 'You\'ll get reminded about this content' : 'Get PWA notifications to review this content'}
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

            {/* Notification frequency and timing (only show when enabled) */}
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

      {/* FIXED: Enhanced Floating Footer with completion state visual feedback */}
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
