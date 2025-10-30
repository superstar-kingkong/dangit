import { API_URL } from '../config';
import { supabase } from '../lib/supabase';
import React, { useState, useRef } from 'react';
import { Camera, Link, Mic, FileText, Upload, Loader2, X, Check, Sparkles, Instagram, Globe, Image as ImageIcon } from 'lucide-react';
import InstagramSaveModal from './InstagramSaveModal';

interface AddContentScreenProps {
  userId: string;
  onClose: () => void;
  darkMode?: boolean;
}

export function AddContentScreen({ 
  userId,
  onClose,
  darkMode = false
}: AddContentScreenProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'screenshot' | 'voice' | 'manual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [url, setUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Clipboard hint state
  const [clipboardHint, setClipboardHint] = useState(false);
  
  // ✅ NEW: Instagram modal state
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { 
      id: 'url', 
      label: 'Link', 
      icon: Link,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      description: 'Save websites & articles'
    },
    { 
      id: 'screenshot', 
      label: 'Image', 
      icon: Camera,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'Upload screenshots'
    },
    { 
      id: 'manual', 
      label: 'Note', 
      icon: FileText,
      gradient: 'from-rose-500 via-orange-500 to-amber-500',
      description: 'Write quick notes'
    },
    { 
      id: 'voice', 
      label: 'Voice', 
      icon: Mic,
      gradient: 'from-amber-500 via-yellow-500 to-lime-500',
      description: 'Record audio (soon)'
    }
  ];

  // URL validation helper
  const isValidURL = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      try {
        new URL('https://' + string);
        return true;
      } catch {
        return false;
      }
    }
  };

  // Auto-detect clipboard when URL tab is clicked
  const handleUrlTabClick = async () => {
    setActiveTab('url');
    setErrorMessage('');
    setAnalysisResult(null);
    
    try {
      const text = await navigator.clipboard.readText();
      
      if (text && isValidURL(text)) {
        setUrl(text);
        setClipboardHint(true);
        
        setTimeout(() => setClipboardHint(false), 3000);
      }
    } catch (err) {
      console.log('Clipboard access denied or unavailable');
    }
  };

  // Auto-open file picker when screenshot tab is clicked
  const handleScreenshotTabClick = () => {
    setActiveTab('screenshot');
    setErrorMessage('');
    setAnalysisResult(null);
    
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setErrorMessage('');
      setAnalysisResult(null);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setErrorMessage('Please select an image file');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setErrorMessage('Authentication error. Please sign in again.');
        return null;
      }
      
      if (!session?.access_token) {
        setErrorMessage('Please sign in to save content.');
        return null;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      setErrorMessage('Authentication failed. Please try again.');
      return null;
    }
  };

  const isInstagramUrl = (url: string): boolean => {
    return url.includes('instagram.com') || url.includes('instagr.am');
  };

  const handleSave = async (customInstagramTitle?: string) => {
    if (isProcessing || !hasContent() || analysisResult !== null) {
      return;
    }

    // Check for Instagram and show modal
    if (activeTab === 'url' && url.trim() && isInstagramUrl(url.trim()) && !customInstagramTitle) {
      setInstagramUrl(url.trim());
      setShowInstagramModal(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        setIsProcessing(false);
        return;
      }

      let content = '';
      let contentType = '';

      switch (activeTab) {
        case 'url':
          const urlToSave = url.trim();
          if (!urlToSave) {
            setErrorMessage('Please enter a URL');
            setIsProcessing(false);
            return;
          }
          content = urlToSave;
          contentType = 'url';
          break;

        case 'screenshot':
          if (!selectedFile) {
            setErrorMessage('Please select an image');
            setIsProcessing(false);
            return;
          }
          content = await fileToBase64(selectedFile);
          contentType = 'image';
          break;

        case 'manual':
          if (!manualTitle.trim() && !manualContent.trim()) {
            setErrorMessage('Please enter some content');
            setIsProcessing(false);
            return;
          }
          content = (manualTitle.trim() ? manualTitle.trim() + '\n\n' : '') + manualContent.trim();
          contentType = 'text';
          break;

        case 'voice':
          setErrorMessage('Voice recording coming soon');
          setIsProcessing(false);
          return;
      }

      const response = await fetch(`${API_URL}/api/process-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          content,
          contentType
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        setErrorMessage('Session expired. Please sign in again.');
        setIsProcessing(false);
        return;
      }

      if (response.ok && result.success) {
        // Update title for Instagram if custom title provided
        if (customInstagramTitle && isInstagramUrl(url)) {
          try {
            const updateResponse = await fetch(`${API_URL}/api/update-title`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                itemId: result.data.id,
                title: customInstagramTitle
              })
            });

            if (updateResponse.ok) {
              console.log('✅ Instagram title updated successfully');
            }
          } catch (error) {
            console.warn('Error updating Instagram title:', error);
          }
        }

        setAnalysisResult({
          title: customInstagramTitle || result.data.title,
          summary: result.data.ai_summary,
          category: result.data.ai_category,
          tags: result.data.ai_tags,
        });
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save content');
      }

    } catch (error) {
      console.error('Error saving:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setErrorMessage('Network error. Please check your connection and try again.');
        } else if (error.message.includes('Authentication') || error.message.includes('auth')) {
          setErrorMessage('Authentication failed. Please sign in again.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to save content. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const hasContent = () => {
    switch (activeTab) {
      case 'url': return url.trim().length > 0;
      case 'screenshot': return selectedFile !== null;
      case 'manual': return manualTitle.trim().length > 0 || manualContent.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>

      {/* ✅ Instagram Save Modal */}
      {showInstagramModal && (
        <InstagramSaveModal
          instagramUrl={instagramUrl}
          onSave={async (title, url) => {
            setShowInstagramModal(false);
            await handleSave(title);
          }}
          onCancel={() => setShowInstagramModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-red-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Content
            </h1>
            <p className={`mt-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Save anything, organized automatically
            </p>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-colors active:scale-95 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
{!activeTab ? (
  <div className="grid grid-cols-2 gap-3">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      
      return (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.id === 'url') handleUrlTabClick();
            else if (tab.id === 'screenshot') handleScreenshotTabClick();
            else if (tab.id === 'manual') {
              setActiveTab('manual');
              setErrorMessage('');
              setAnalysisResult(null);
            } else if (tab.id === 'voice') {
              setActiveTab('voice');
              setErrorMessage('');
              setAnalysisResult(null);
            }
          }}
          className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:scale-105 ${
            darkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg hover:shadow-xl`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {tab.label}
            </h3>
            <p className="text-xs text-white/80 font-medium">
              {tab.description}
            </p>
          </div>
        </button>
      );
    })}
  </div>
) : (
  <button
    onClick={() => {
      setActiveTab(null);
      setUrl('');
      setManualTitle('');
      setManualContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrorMessage('');
      setAnalysisResult(null);
      setClipboardHint(false);
      setShowInstagramModal(false);
      setInstagramUrl('');
    }}
    className={`text-sm font-bold flex items-center gap-1 transition-colors ${
      darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    ← Back to options
  </button>
)}

      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6" style={{ paddingBottom: '140px' }}>
        
        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            {/* Clipboard hint */}
            {clipboardHint && (
              <div className={`border-2 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
                darkMode 
                  ? 'bg-green-900/20 border-green-700 text-green-300' 
                  : 'bg-green-50 border-green-300 text-green-800'
              }`}>
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Found a link in your clipboard!</span>
              </div>
            )}

            <div className={`rounded-2xl p-5 ${
              darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Paste Website URL
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                    Articles, videos, or any webpage
                  </p>
                </div>
              </div>
              
              <input
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none transition-all text-base ${
                  darkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                    : 'bg-white border-blue-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                }`}
                autoFocus
              />
              
              <div className="flex items-center justify-between mt-3">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI will analyze and categorize it
                </p>
                {url.trim() && isInstagramUrl(url.trim()) && (
                  <div className="flex items-center gap-1.5 text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full">
                    <Instagram className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Instagram</span>
                  </div>
                )}
              </div>

              {url.trim() && !isValidURL(url.trim()) && (
                <p className={`text-xs mt-3 px-3 py-2 rounded-lg ${
                  darkMode ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                }`}>
                  ⚠️ This doesn't look like a valid URL. Add https:// if missing.
                </p>
              )}
            </div>

            {analysisResult && (
              <div className={`border-2 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <span className={`font-black text-xl ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                    <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Content analyzed & organized</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Title</span>
                    <p className={`font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysisResult.title}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</span>
                    <p className={`font-bold mt-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{analysisResult.category}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshot Tab */}
        {activeTab === 'screenshot' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className={`rounded-2xl p-5 ${
                  darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Image Preview
                      </h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                        AI will extract & analyze text
                      </p>
                    </div>
                  </div>

                  <div className={`relative rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900/50' : 'bg-white'} border-2 ${darkMode ? 'border-gray-700' : 'border-purple-200'}`}>
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-56 object-cover"
                      />
                    )}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setAnalysisResult(null);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className={`rounded-xl p-4 mt-4 ${darkMode ? 'bg-gray-900/50' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                      }`}>
                        <Camera className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFile.name}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  </div>
                </div>

                {analysisResult && (
                  <div className={`border-2 rounded-2xl p-5 space-y-3 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <Check className="w-7 h-7 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <span className={`font-black text-xl ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                        <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Image analyzed successfully</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-2xl p-5 ${
                darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload Image
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
                      Screenshots or photos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all group ${
                    darkMode
                      ? 'border-gray-700 hover:border-purple-500 hover:bg-gray-900/50'
                      : 'border-purple-300 hover:border-purple-500 hover:bg-purple-100/50'
                  }`}
                >
                  <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                    darkMode ? 'text-gray-600 group-hover:text-purple-400' : 'text-purple-400 group-hover:text-purple-500'
                  }`} />
                  <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Choose an image
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    PNG, JPG up to 10MB
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 ${
              darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-rose-50 to-orange-50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Quick Note
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                    Jot down ideas & thoughts
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block mb-2 font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Title (Optional)
                  </label>
                  <input
                    placeholder="Give it a catchy title..."
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all text-base ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500'
                        : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                    }`}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className={`block mb-2 font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Your Note
                  </label>
                  <textarea
                    placeholder="Write anything... ideas, thoughts, reminders, todos..."
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    rows={8}
                    className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none resize-none transition-all text-base leading-relaxed ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500'
                        : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ✨ AI will organize & categorize this
                    </p>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {manualContent.length} chars
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysisResult && (
              <div className={`border-2 rounded-2xl p-5 space-y-3 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <span className={`font-black text-xl ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                    <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Note saved & organized</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className={`rounded-2xl p-8 text-center ${
            darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-amber-50 to-yellow-50'
          }`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/30' : 'bg-gradient-to-br from-amber-100 to-yellow-100'
            }`}>
              <Mic className={`w-12 h-12 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h3 className={`font-black mb-2 text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Voice Notes
            </h3>
            <p className={`text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coming Soon! 🎙️
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Record voice memos and let AI transcribe & organize them automatically
            </p>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM BUTTON */}
      {activeTab && (
        <div className={`absolute bottom-20 left-0 right-0 px-6 pb-4 z-50 ${
          darkMode 
            ? 'bg-gradient-to-t from-gray-900 via-gray-900 to-transparent' 
            : 'bg-gradient-to-t from-white via-white to-transparent'
        } pt-8`}>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isProcessing || !hasContent() || analysisResult !== null}
            className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
              isProcessing || !hasContent() || analysisResult !== null
                ? darkMode 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                <span>🔒 Saving securely...</span>
              </>
            ) : analysisResult ? (
              <>
                <Check className="w-6 h-6" strokeWidth={3} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" strokeWidth={2.5} />
                <span>
                  {url.trim() && isInstagramUrl(url.trim()) ? 'Save Instagram Post' : 'Save with AI Magic'}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
