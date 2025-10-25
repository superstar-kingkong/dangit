import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Share, Edit3, Trash2, CheckSquare, Square, MoreHorizontal,
  ExternalLink, Copy, Heart, Bookmark, Clock, Eye, PlayCircle, 
  PauseCircle, Volume2, Download, Star, Tag, Calendar, Link as LinkIcon,
  Image, Mic, FileText, Zap, Sparkles, CheckCircle2, AlertCircle, Save, X,
  Bell, BellOff, Clock3, Repeat, Smartphone, Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { API_URL } from '../config';
import { supabase } from '../lib/supabase'; // Import your supabase client

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
    image_url?: string; // 🆕 Add this for screenshot URLs
    content_type?: string; // 🆕 Add this to distinguish URL/image/text
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
  
  // 🆕 New state for media loading
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [urlPreview, setUrlPreview] = useState<any>(null);
  const [urlPreviewLoading, setUrlPreviewLoading] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  const [editedDescription, setEditedDescription] = useState(content.description);
  const [editedTags, setEditedTags] = useState(content.tags);
  const [newTag, setNewTag] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Content type icons and colors
  const typeConfig = {
    url: { icon: LinkIcon, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    screenshot: { icon: Image, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    voice: { icon: Mic, color: 'from-red-500 to-pink-500', bg: 'bg-red-50' },
    manual: { icon: FileText, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50' },
    image: { icon: Image, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    text: { icon: FileText, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50' }
  };

  const currentType = typeConfig[content.type as keyof typeof typeConfig] || typeConfig.manual;

  // 🆕 Fetch URL preview for URL type content
  useEffect(() => {
    if (content.content_type === 'url' && content.originalUrl) {
      fetchUrlPreview(content.originalUrl);
    }
  }, [content.originalUrl, content.content_type]);

  // 🆕 Function to fetch URL preview
  const fetchUrlPreview = async (url: string) => {
    setUrlPreviewLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${API_URL}/api/url-preview?url=${encodeURIComponent(url)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUrlPreview(data.preview);
      }
    } catch (error) {
      console.error('Error fetching URL preview:', error);
    } finally {
      setUrlPreviewLoading(false);
    }
  };

  // Parse content state on mount
  useEffect(() => {
    setIsCompleted(content.completed);  
    setEditedTitle(content.title);
    setEditedDescription(content.description);
    setEditedTags(content.tags);
  }, [content]);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          itemId: content.id,
          completed: newCompletedState
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

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
      const dateString = createdAt || fallbackTimestamp;
      
      if (!dateString) return 'Unknown time';
      
      if (dateString.includes('ago') || dateString.includes('now') || 
          /\d+[smhdwy](\s|$)/.test(dateString) ||
          dateString.includes('Just now')) {
        return dateString;
      }
      
      const now = new Date();
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      
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
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInMonths = Math.floor(diffInDays / 30);
      
      if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? 'now' : `${diffInSeconds}s`;
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else if (diffInDays < 30) {
        return `${diffInDays}d`;
      } else if (diffInMonths < 12) {
        return `${diffInMonths}mo`;
      } else {
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears}y`;
      }
    } catch (error) {
      return 'Time error';
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
                <a 
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <ExternalLink className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span>Open Original</span>
                </a>
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
          {/* 🆕 Screenshot Preview Section */}
          {content.image_url && content.content_type === 'image' && (
            <div className={`rounded-2xl border overflow-hidden shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`px-5 py-3 border-b flex items-center gap-2 ${
                darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <Image className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Screenshot
                </h3>
              </div>
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                {imageError ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Failed to load image
                    </p>
                  </div>
                ) : (
                  <img
                    src={content.image_url}
                    alt={content.title}
                    className="w-full h-auto"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* 🆕 URL Preview Section */}
          {content.content_type === 'url' && content.originalUrl && (
            <div className={`rounded-2xl border overflow-hidden shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`px-5 py-3 border-b flex items-center justify-between ${
                darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Globe className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Link Preview
                  </h3>
                </div>
                <a
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
              </div>
              
              {urlPreviewLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : urlPreview ? (
                <a
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {urlPreview.image && (
                    <img
                      src={urlPreview.image}
                      alt={urlPreview.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {urlPreview.title || 'No title'}
                    </h4>
                    {urlPreview.description && (
                      <p className={`text-sm line-clamp-2 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {urlPreview.description}
                      </p>
                    )}
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new URL(content.originalUrl).hostname}
                    </p>
                  </div>
                </a>
              ) : (
                <a
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <LinkIcon className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {content.originalUrl}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Click to open
                      </p>
                    </div>
                    <ExternalLink className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                </a>
              )}
            </div>
          )}

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

          {/* Notifications Section */}
          <div className={`rounded-2xl border p-5 shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <BellOff className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              📱 Reminders
            </h3>
            
            <div className={`p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
              darkMode 
                ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500' 
                : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
            }`}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${
                    darkMode 
                      ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50' 
                      : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                  }`}>
                    <Clock className={`w-8 h-8 ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                </div>
                <h4 className={`text-lg font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  🚀 Coming Soon!
                </h4>
                <p className={`text-sm leading-relaxed mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Smart reminders and notifications will be available in the next update. 
                  Get notified when it's ready!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-400' 
                      : 'bg-white text-gray-500'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">In Development</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`mt-4 p-4 rounded-xl ${
              darkMode ? 'bg-gray-700/20' : 'bg-slate-50'
            }`}>
              <p className={`text-xs text-center ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ✨ Coming features: Custom reminders, Smart scheduling, Push notifications
              </p>
            </div>
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
