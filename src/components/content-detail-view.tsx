import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Share, Edit3, Trash2, CheckSquare, Square, MoreHorizontal,
  ExternalLink, Copy, Heart, Bookmark, Clock, Eye, PlayCircle, 
  PauseCircle, Volume2, Download, Star, Tag, Calendar, Link as LinkIcon,
  Image, Mic, FileText, Zap, Sparkles, CheckCircle2, AlertCircle, Save, X,
  Bell, BellOff, Clock3, Repeat, Smartphone, Globe, Edit2, Check, Instagram
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { API_URL } from '../config';
import { supabase } from '../lib/supabase';

interface ContentDetailViewProps {
  content: {
    id: string;
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
    image_url?: string;
    content_type?: string;
    preview_data?: { // ✅ KEEP THIS - efficient metadata
      url?: string;
      title?: string;
      description?: string;
      domain?: string;
      favicon?: string;
    };
    notifications?: {
      enabled: boolean;
      frequency: 'once' | 'daily' | 'weekly';
      time: string;
      customMessage?: string;
    } | string;
  };
  onClose: () => void;
  onToggleComplete?: (id: string) => void;
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
  
  // ✅ NEW: Instagram-specific editing state
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  const [instagramTitle, setInstagramTitle] = useState(content.title);
  
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

  // ✅ NEW: Check if content is Instagram
  const isInstagramContent = content.preview_data?.url?.includes('instagram.com') ||

                            content.originalUrl?.includes('instagram.com') ||
                            content.preview_data?.url?.includes('instagram.com');

  // ✅ NEW: Extract Instagram post ID
  const getInstagramPostId = () => {
    const url = content.preview_data?.url || content.originalUrl || null
    if (!url) return null;
    
    const postMatch = url.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
    return postMatch ? postMatch[2] : null;
  };

  // ✅ FIXED: Handle Instagram title update using the correct endpoint
const handleInstagramTitleSave = async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.access_token) {
      throw new Error('Session expired. Please sign in again.');
    }

    console.log('🔒 Updating Instagram title via API endpoint');

    // ✅ Use the correct /api/update-title endpoint
    const response = await fetch(`${API_URL}/api/update-title`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        itemId: content.id, 
        title: instagramTitle 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update title');
    }

    const result = await response.json();
    console.log('✅ Instagram title updated successfully:', result);

    // Update local state
    setEditedTitle(instagramTitle);
    setIsEditingInstagram(false);
    
    // Notify parent component
    if (onContentUpdate) {
      onContentUpdate({
        ...content,
        title: instagramTitle
      });
    }

    // Refresh screens
    if ((window as any).refreshHomeScreen) {
      (window as any).refreshHomeScreen();
    }
    if ((window as any).refreshSearchScreen) {
      (window as any).refreshSearchScreen();
    }

    // Success feedback
    console.log('✅ Instagram title updated successfully');
    
  } catch (error) {
    console.error('Error updating Instagram title:', error);
    alert(`Failed to update title: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  // 🔒 FIXED: Fetch URL preview for URL type content with proper authentication
  useEffect(() => {
    // Check multiple ways a URL might be stored
    const urlToFetch = content.originalUrl || content.preview_data?.url; // ✅
    const isUrlContent = content.content_type === 'url' || content.type === 'url';
    
    if (isUrlContent && urlToFetch && !isInstagramContent) { // Don't fetch preview for Instagram
      console.log('🔗 Fetching URL preview for:', urlToFetch);
      fetchUrlPreview(urlToFetch);
    }
  }, [content.preview_data?.url, content.content_type, content.type]);;

  // 🔒 FIXED: Function to fetch URL preview with proper authentication
  const fetchUrlPreview = async (url: string) => {
    setUrlPreviewLoading(true);
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.access_token) {
        console.warn('No auth session for URL preview');
        setUrlPreviewLoading(false);
        return;
      }

      console.log('🔒 Fetching URL preview securely');
      const response = await fetch(`${API_URL}/api/url-preview?url=${encodeURIComponent(url)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ URL preview fetched:', data);
        setUrlPreview(data.preview);
      } else {
        console.warn('URL preview fetch failed:', response.status);
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
    setInstagramTitle(content.title); // ✅ Initialize Instagram title
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
    if (isEditing || isEditingInstagram) { // ✅ Also check Instagram editing
      setIsEditing(false);
      setIsEditingInstagram(false);
      return;
    }
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // 🔒 FIXED: Handle completion toggle with proper data validation
  const handleToggleComplete = async () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    
    try {
      // 🔍 Validate data before sending
      if (!content.id) {
        throw new Error('No item ID available');
      }
      
      if (typeof newCompletedState !== 'boolean') {
        throw new Error('Invalid completion state');
      }
      
      console.log('🔒 Securely toggling completion for item:', content.id, 'to:', newCompletedState);
      console.log('🔍 Item ID type:', typeof content.id, 'Length:', content.id?.length);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.access_token) {
        throw new Error('Session expired. Please sign in again.');
      }

      // ✅ Create request body explicitly
      const requestBody = {
        itemId: content.id,
        completed: newCompletedState
      };
      
      console.log('📤 Sending request body:', requestBody);

      const response = await fetch(`${API_URL}/api/toggle-completion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        
        if (response.status === 401) {
          throw new Error('Session expired. Please sign in again.');
        }
        if (response.status === 404) {
          throw new Error('Item not found or access denied');
        }
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Successfully toggled completion:', result);

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

  // 🔒 Get the URL for display
  const displayUrl = content.originalUrl || content.preview_data?.url; // ✅
  const isUrlType = content.content_type === 'url' || content.type === 'url';

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
              {(isEditing || isEditingInstagram) ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            
            {(isEditing || isEditingInstagram) ? (
              <Button
                onClick={isEditingInstagram ? handleInstagramTitleSave : handleSaveEdit}
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
          {showActions && !isEditing && !isEditingInstagram && (
            <div className={`absolute right-4 top-20 rounded-2xl shadow-xl border py-2 z-10 min-w-48 animate-in slide-in-from-top-2 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
            }`}>
              <button 
                onClick={() => {
                  if (isInstagramContent) {
                    setIsEditingInstagram(true);
                  } else {
                    setIsEditing(true);
                  }
                  setShowActions(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Edit3 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span>{isInstagramContent ? 'Edit Title' : 'Edit Content'}</span>
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
              {displayUrl && (
                <a 
                  href={displayUrl}
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
          
          {/* ✅ NEW: Instagram Content Section */}
          {isInstagramContent && (
            <div className="space-y-4">
              {/* Editable Instagram Title */}
              <div className={`flex items-center gap-3 bg-gradient-to-r ${
                darkMode 
                  ? 'from-purple-900/20 to-pink-900/20 border border-purple-800/30' 
                  : 'from-purple-50 to-pink-50'
              } p-4 rounded-xl`}>
                <Instagram className="text-pink-500" size={24} />
                {isEditingInstagram ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={instagramTitle}
                      onChange={(e) => setInstagramTitle(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Describe this reel..."
                      autoFocus
                    />
                    <button
                      onClick={handleInstagramTitleSave}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {instagramTitle}
                    </h3>
                    <button
                      onClick={() => setIsEditingInstagram(true)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-800/50' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <Edit2 size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                  </div>
                )}
              </div>

              {/* Instagram Embed */}
              {(() => {
                const postId = getInstagramPostId();
                return postId ? (
                  <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <iframe
                      src={`https://www.instagram.com/p/${postId}/embed`}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      scrolling="no"
                      className="rounded-lg"
                      title="Instagram post"
                    />
                  </div>
                ) : null;
              })()}

              {/* Open in Instagram Button */}
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Open in Instagram <ExternalLink size={18} />
              </a>

              {/* Tip */}
              <div className={`border rounded-lg p-3 text-sm ${
                darkMode 
                  ? 'bg-blue-900/20 border-blue-800/30 text-blue-300' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                💡 <strong>Tip:</strong> Click the edit button to add your own description for this reel!
              </div>
            </div>
          )}

          {/* 🆕 Screenshot Preview Section - IMPROVED */}
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
    <div className={`p-4 ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
      <div className="relative w-full">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {imageError ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Failed to load image
            </p>
          </div>
        ) : (
          <img
            src={content.image_url}
            alt={content.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg shadow-md"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </div>
    </div>
  </div>
)}

          {/* 🔒 FIXED: URL Preview Section - Only for non-Instagram URLs */}
          {isUrlType && displayUrl && !isInstagramContent && (
            <div className={`rounded-2xl border overflow-hidden shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`px-5 py-3 border-b flex items-center justify-between ${
                darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Globe className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    🔒 Link Preview
                  </h3>
                </div>
                <a
                  href={displayUrl}
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
                  <p className={`ml-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading preview...
                  </p>
                </div>
              ) : urlPreview ? (
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {urlPreview.image && (
                    <img
                      src={urlPreview.image}
                      alt={urlPreview.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
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
                    <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Globe className="w-3 h-3" />
                      {urlPreview.siteName || (() => {
                        try {
                          return new URL(displayUrl).hostname;
                        } catch {
                          return displayUrl;
                        }
                      })()}
                    </p>
                  </div>
                </a>
              ) : (
                <a
                  href={displayUrl}
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
                        {displayUrl}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Click to open link
                      </p>
                    </div>
                    <ExternalLink className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Title with completion state - Skip for Instagram (shown above) */}
          {!isInstagramContent && (
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
          )}

          {/* Content Details section - Skip for Instagram */}
          {!isInstagramContent && (
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
              
              {!showFullDescription && !isEditing && editedDescription.length > 200 && (
                <button 
                  onClick={() => setShowFullDescription(true)}
                  className="mt-3 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  Read more...
                </button>
              )}
            </div>
          )}

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

          {!isEditing && !isEditingInstagram && (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className={`flex-1 rounded-2xl h-12 backdrop-blur-sm text-base font-medium ${
                  darkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'
                }`} 
                onClick={() => isInstagramContent ? setIsEditingInstagram(true) : setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isInstagramContent ? 'Edit Title' : 'Edit'}
              </Button>
              <Button 
                variant="outline" 
                className={`flex-1 rounded-2xl h-12 backdrop-blur-sm text-base font-medium ${
                  darkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-50'
                }`} 
                onClick={onShare}
              >
                <Share className="w-4 h-4 mr-2" />Share
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
