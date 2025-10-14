import { API_URL } from '../config';
import React, { useState, useRef } from 'react';
import { Camera, Link, Mic, FileText, Upload, Loader2, X, Check } from 'lucide-react';

interface AddScreenProps {
  darkMode?: boolean;
  currentTime?: Date;
  onContentSaved?: () => void;
  userId?: string;
  onClose?: () => void;
}

// Simple UI components
const Button = ({ children, onClick, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }: any) => (
  <input
    {...props}
    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${className}`}
  />
);

const Textarea = ({ className, ...props }: any) => (
  <textarea
    {...props}
    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all ${className}`}
  />
);

export function AddScreen({ 
  darkMode = false, 
  currentTime, 
  onContentSaved, 
  userId = 'user-123',
  onClose 
}: AddScreenProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'screenshot' | 'voice' | 'manual'>('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [url, setUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'url', label: 'Save URL', icon: Link },
    { id: 'screenshot', label: 'Screenshot', icon: Camera },
    { id: 'voice', label: 'Voice Note', icon: Mic },
    { id: 'manual', label: 'Quick Note', icon: FileText }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setErrorMessage('');
      setAnalysisResult(null);
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

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    clearMessages();

    try {
      let content = '';
      let contentType = '';

      // Prepare content for analysis
      switch (activeTab) {
        case 'url':
          if (!url.trim()) {
            setErrorMessage('Please enter a URL');
            setIsAnalyzing(false);
            return;
          }
          content = url.trim();
          contentType = 'url';
          break;

        case 'screenshot':
          if (!selectedFile) {
            setErrorMessage('Please select an image file');
            setIsAnalyzing(false);
            return;
          }
          content = await fileToBase64(selectedFile);
          contentType = 'image';
          break;

        case 'manual':
          if (!manualTitle.trim() && !manualContent.trim()) {
            setErrorMessage('Please enter a title or content');
            setIsAnalyzing(false);
            return;
          }
          content = (manualTitle.trim() ? manualTitle.trim() + '\n\n' : '') + manualContent.trim();
          contentType = 'text';
          break;

        case 'voice':
          setErrorMessage('Voice recording not implemented yet');
          setIsAnalyzing(false);
          return;

        default:
          setIsAnalyzing(false);
          return;
      }

      console.log('Analyzing content...', { contentType, userId });

      // Call backend for analysis only (you may need to create this endpoint)
      const response = await fetch('${API_URL}/api/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          userId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAnalysisResult({
          title: result.data.title,
          summary: result.data.ai_summary,
          category: result.data.ai_category,
          tags: result.data.ai_tags,
          content,
          contentType
        });
      } else {
        throw new Error(result.error || 'Failed to analyze content');
      }

    } catch (error) {
      console.error('Error analyzing content:', error);
      setErrorMessage(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) {
      setErrorMessage('Please analyze the content first');
      return;
    }

    setIsProcessing(true);
    clearMessages();

    try {
      console.log('Saving analyzed content...', { analysisResult });

      // Since the content is already processed, just confirm the save
      setSuccessMessage('Content saved successfully!');
      
      // Reset form
      setUrl('');
      setManualTitle('');
      setManualContent('');
      setSelectedFile(null);
      setAnalysisResult(null);
      
      // Trigger home screen refresh
      if (onContentSaved) {
        console.log('Calling onContentSaved callback');
        setTimeout(() => onContentSaved(), 100);
      }

      // Also trigger global refresh
      if ((window as any).refreshHomeScreen) {
        console.log('Calling global refresh');
        setTimeout(() => (window as any).refreshHomeScreen(), 100);
      }

      // Auto close after success
      setTimeout(() => {
        setSuccessMessage('');
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error saving content:', error);
      setErrorMessage(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if form has content to enable analyze button
  const hasContent = () => {
    switch (activeTab) {
      case 'url': return url.trim().length > 0;
      case 'screenshot': return selectedFile !== null;
      case 'manual': return manualTitle.trim().length > 0 || manualContent.trim().length > 0;
      case 'voice': return false; // Not implemented
      default: return false;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {/* Status Bar */}
      <div className={`flex justify-between items-center px-5 pt-4 pb-2 ${darkMode 
        ? 'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-700' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}>
        <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {currentTime ? currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          }) : new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className={`w-1 h-1 ${darkMode ? 'bg-white' : 'bg-slate-900'} rounded-full`}></div>
            <div className={`w-1 h-1 ${darkMode ? 'bg-white' : 'bg-slate-900'} rounded-full`}></div>
            <div className={`w-1 h-1 ${darkMode ? 'bg-white' : 'bg-slate-900'} rounded-full`}></div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <div className={`w-6 h-3 border ${darkMode ? 'border-white' : 'border-slate-900'} rounded-sm relative`}>
              <div className="absolute inset-0.5 bg-green-500 rounded-sm"></div>
            </div>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>100%</span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <X className="w-5 h-5" />
            {errorMessage}
            <button onClick={clearMessages} className="ml-2 hover:bg-red-600 rounded p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className={`${darkMode 
        ? 'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-700' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      } px-5 pt-4 pb-6`}>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 
              className={`text-3xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`} 
              style={{ 
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontWeight: '700'
              }}
            >
              Add Content
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-slate-600'} mt-1 font-medium`}>
              Save and organize anything
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${darkMode 
                ? 'bg-gray-600/60 text-gray-300 hover:bg-gray-600' 
                : 'bg-white/60 text-gray-600 hover:bg-white'
              } backdrop-blur-sm transition-all duration-200 hover:scale-105`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className={`grid grid-cols-2 gap-2 ${darkMode 
          ? 'bg-gray-700/60 backdrop-blur-sm' 
          : 'bg-white/60 backdrop-blur-sm'
        } rounded-2xl p-2`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  clearMessages();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? darkMode 
                      ? 'bg-gray-600 shadow-sm text-indigo-400 scale-105' 
                      : 'bg-white shadow-sm text-indigo-600 scale-105'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-600/50' 
                      : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} px-5 pt-6 pb-6`}>
          
          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-semibold`}>
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com or paste any link..."
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                  className={`${darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  }`}
                />
                {url && !analysisResult && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full mt-4 ${isAnalyzing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    } text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analyzing URL...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Analyze URL
                      </>
                    )}
                  </Button>
                )}
                {url && analysisResult && (
                  <div className={`mt-4 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-green-50 border-green-200'} border rounded-2xl p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Analysis Complete
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Title: </span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysisResult.title}</span>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category: </span>
                        <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>{analysisResult.category}</span>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Summary: </span>
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{analysisResult.summary}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                  <div className={`border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'} rounded-2xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-semibold`}>
                        Selected Image
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setAnalysisResult(null);
                          clearMessages();
                        }}
                        className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {selectedFile.name}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  {!analysisResult && (
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`w-full ${isAnalyzing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                      } text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200`}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  )}

                  {analysisResult && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-green-50 border-green-200'} border rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Analysis Complete
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Title: </span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysisResult.title}</span>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category: </span>
                          <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>{analysisResult.category}</span>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Summary: </span>
                          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{analysisResult.summary}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className={`border-2 border-dashed ${darkMode 
                    ? 'border-gray-600 bg-gray-800/30' 
                    : 'border-gray-200 bg-gray-50'
                  } rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-400 transition-all duration-200`}
                  onClick={() => fileInputRef.current?.click()}>
                    <Upload className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 font-semibold text-lg`}>
                      Drop an image here or click to browse
                    </p>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`${darkMode 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                      } px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      <Camera className="w-6 h-6 mr-3" />
                      Choose Image File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="text-center py-16">
              <div className={`w-24 h-24 rounded-full ${darkMode 
                ? 'bg-orange-900/30' 
                : 'bg-orange-100'
              } flex items-center justify-center mx-auto mb-6`}>
                <Mic className={`w-12 h-12 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
              </div>
              <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold mb-3 text-xl`}>
                Voice Recording
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 text-lg`}>
                Voice recording feature coming soon!
              </p>
              <Button 
                disabled
                className={`${darkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-500'
                } rounded-2xl px-8 py-3 cursor-not-allowed font-semibold`}
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div>
                <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-semibold`}>
                  Title (Optional)
                </label>
                <Input
                  placeholder="Enter a title for your note..."
                  value={manualTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualTitle(e.target.value)}
                  className={`${darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-semibold`}>
                  Content
                </label>
                <Textarea
                  placeholder="Write your note, idea, or paste any text content here..."
                  value={manualContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualContent(e.target.value)}
                  rows={8}
                  className={`${darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                  }`}
                />
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-right`}>
                  {manualContent.length} characters
                </div>
              </div>

              {(manualTitle.trim() || manualContent.trim()) && !analysisResult && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full ${isAnalyzing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  } text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Analyzing Text...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Analyze Text
                    </>
                  )}
                </Button>
              )}

              {analysisResult && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-green-50 border-green-200'} border rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Analysis Complete
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Title: </span>
                      <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{analysisResult.title}</span>
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category: </span>
                      <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>{analysisResult.category}</span>
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Summary: </span>
                      <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{analysisResult.summary}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Status */}
          {(isAnalyzing || isProcessing) && (
            <div className={`flex items-center justify-center gap-3 py-8 ${darkMode 
              ? 'bg-gray-800 text-indigo-400' 
              : 'bg-indigo-50 text-indigo-600'
            } rounded-2xl mt-6`}>
              <Loader2 className="w-6 h-6 animate-spin" />
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {isAnalyzing ? 'Analyzing your content...' : 'Saving your content...'}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-indigo-500'} mt-1`}>
                  This usually takes a few seconds
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Area */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t px-5 py-4 space-y-3`}>
        {!analysisResult ? (
          // Show Analyze button when no analysis yet
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !hasContent()}
            className={`w-full h-14 ${
              isAnalyzing || !hasContent()
                ? darkMode 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
            } py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              !isAnalyzing && hasContent() ? 'hover:shadow-lg active:scale-95' : ''
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        ) : (
          // Show Save button after analysis
          <Button
            onClick={handleSave}
            disabled={isProcessing}
            className={`w-full h-14 ${
              isProcessing
                ? darkMode 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : darkMode 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            } py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              !isProcessing ? 'hover:shadow-lg active:scale-95' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save to DANGIT
              </>
            )}
          </Button>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            disabled={isProcessing || isAnalyzing}
            className={`w-full ${darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } py-3 rounded-2xl font-semibold transition-all duration-200`}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
