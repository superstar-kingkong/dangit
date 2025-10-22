import { API_URL } from '../config';
import { createClient } from '@supabase/supabase-js'; // Add this import
import React, { useState, useRef } from 'react';
import { Camera, Link, Mic, FileText, Upload, Loader2, X, Check, Sparkles } from 'lucide-react';

// Add Supabase client setup at the top
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [activeTab, setActiveTab] = useState<'url' | 'screenshot' | 'voice' | 'manual'>('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [url, setUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'url', label: 'Link', icon: Link },
    { id: 'screenshot', label: 'Image', icon: Camera },
    { id: 'manual', label: 'Note', icon: FileText },
    { id: 'voice', label: 'Voice', icon: Mic }
  ];

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

  // 🔒 NEW: Function to get auth token
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

  const handleSave = async () => {
    if (isProcessing || !hasContent() || analysisResult !== null) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 🔒 Get authentication token
      const authToken = await getAuthToken();
      if (!authToken) {
        setIsProcessing(false);
        return; // Error message already set in getAuthToken
      }

      let content = '';
      let contentType = '';

      switch (activeTab) {
        case 'url':
          if (!url.trim()) {
            setErrorMessage('Please enter a URL');
            setIsProcessing(false);
            return;
          }
          content = url.trim();
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

      // 🔒 UPDATED: Send request with authentication token
      const response = await fetch(`${API_URL}/api/process-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // 🔒 Add auth token
        },
        body: JSON.stringify({
          content,
          contentType
          // 🔒 Removed userId - now comes from authenticated token
        })
      });

      const result = await response.json();

      // 🔒 Handle authentication errors
      if (response.status === 401) {
        setErrorMessage('Session expired. Please sign in again.');
        setIsProcessing(false);
        return;
      }

      if (response.ok && result.success) {
        setAnalysisResult({
          title: result.data.title,
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
      
      // 🔒 Better error handling for different scenarios
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

        {/* Tabs - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrorMessage('');
                  setAnalysisResult(null);
                }}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-sm font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6" style={{ paddingBottom: '140px' }}>
        
        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            <div>
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Paste any link
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none transition-all text-base ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                }`}
                autoFocus
              />
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Save articles, videos, tweets, or any webpage
              </p>
            </div>

            {analysisResult && (
              <div className={`border-2 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className={`font-black text-lg ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                </div>
                <div className="space-y-2.5">
                  <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Title</span>
                    <p className={`font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysisResult.title}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800/60' : 'bg-white/60'}`}>
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
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className={`relative rounded-2xl overflow-hidden border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
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
                
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                    }`}>
                      <Camera className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFile.name}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                </div>

                {analysisResult && (
                  <div className={`border-2 rounded-2xl p-5 space-y-3 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                      <span className={`font-black text-lg ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all group ${
                    darkMode
                      ? 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                  }`}
                >
                  <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                    darkMode ? 'text-gray-600 group-hover:text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
                  }`} />
                  <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Choose an image
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Screenshots, photos, or any image
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div>
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Title (Optional)
              </label>
              <input
                placeholder="Give it a title..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none transition-all text-base ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                }`}
              />
            </div>
            
            <div>
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Your note
              </label>
              <textarea
                placeholder="Write anything... ideas, thoughts, reminders"
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={8}
                className={`w-full px-4 py-4 rounded-xl border-2 focus:outline-none resize-none transition-all text-base leading-relaxed ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI will organize this for you
                </p>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {manualContent.length} characters
                </span>
              </div>
            </div>

            {analysisResult && (
              <div className={`border-2 rounded-2xl p-5 space-y-3 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className={`font-black text-lg ${darkMode ? 'text-green-400' : 'text-green-900'}`}>Saved!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="text-center py-16">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode ? 'bg-orange-900/30' : 'bg-orange-100'
            }`}>
              <Mic className={`w-12 h-12 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            </div>
            <h3 className={`font-black mb-2 text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Voice Notes
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coming soon!
            </p>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM BUTTON - Complete gradient fix */}
      <div className={`absolute bottom-20 left-0 right-0 px-6 pb-4 z-50 ${
        darkMode 
          ? 'bg-gradient-to-t from-gray-900 via-gray-900 to-transparent' 
          : 'bg-gradient-to-t from-white via-white to-transparent'
      } pt-8`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isProcessing || !hasContent() || analysisResult !== null}
          className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
            isProcessing || !hasContent() || analysisResult !== null
              ? darkMode 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white active:scale-[0.98]'
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
              <span>Save to DANGIT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
