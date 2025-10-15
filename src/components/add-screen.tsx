import { API_URL } from '../config';
import React, { useState, useRef } from 'react';
import { Camera, Link, Mic, FileText, Upload, Loader2, X, Check, Sparkles } from 'lucide-react';

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
    { id: 'url', label: 'Link', icon: Link },
    { id: 'screenshot', label: 'Image', icon: Camera },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'manual', label: 'Note', icon: FileText }
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

      const response = await fetch(`${API_URL}/api/process-content`, {
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
        setSuccessMessage('Content saved successfully!');
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to analyze content');
      }

    } catch (error) {
      console.error('Error analyzing content:', error);
      setErrorMessage(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasContent = () => {
    switch (activeTab) {
      case 'url': return url.trim().length > 0;
      case 'screenshot': return selectedFile !== null;
      case 'manual': return manualTitle.trim().length > 0 || manualContent.trim().length > 0;
      case 'voice': return false;
      default: return false;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">9:41</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-1 h-1 bg-gray-900 rounded-full"></div>
            ))}
          </div>
          <div className="w-6 h-3 border-2 border-gray-900 rounded-sm relative">
            <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]"></div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <X className="w-5 h-5" />
            <span className="font-semibold">{errorMessage}</span>
            <button onClick={clearMessages} className="ml-2 hover:bg-red-600 rounded p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-4 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Add Content
            </h1>
            <p className="text-gray-600 mt-1 font-medium">
              Save anything, find it instantly
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  clearMessages();
                }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-indigo-600 scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        
        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>

            {analysisResult && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-green-900">Saved Successfully!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Title: </span>
                    <span className="text-gray-900">{analysisResult.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Category: </span>
                    <span className="text-indigo-600 font-semibold">{analysisResult.category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Summary: </span>
                    <span className="text-gray-700">{analysisResult.summary}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {analysisResult.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
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
                <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedFile.name}</div>
                        <div className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setAnalysisResult(null);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {analysisResult && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-green-900">Saved Successfully!</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Title: </span>
                        <span className="text-gray-900">{analysisResult.title}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Category: </span>
                        <span className="text-indigo-600 font-semibold">{analysisResult.category}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Summary: </span>
                        <span className="text-gray-700">{analysisResult.summary}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-12 text-center transition-colors"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold text-lg mb-2">
                    Choose an image
                  </p>
                  <p className="text-gray-500 text-sm">
                    or drag and drop here
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2 text-xl">
              Voice Recording
            </h3>
            <p className="text-gray-600 mb-8">
              Coming soon!
            </p>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                Title (Optional)
              </label>
              <input
                placeholder="Give it a title..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-semibold text-sm">
                Content
              </label>
              <textarea
                placeholder="Write your note, idea, or paste any text..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none resize-none text-gray-900 placeholder-gray-400 transition-colors"
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {manualContent.length} characters
              </div>
            </div>

            {analysisResult && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-green-900">Saved Successfully!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Title: </span>
                    <span className="text-gray-900">{analysisResult.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Category: </span>
                    <span className="text-indigo-600 font-semibold">{analysisResult.category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Summary: </span>
                    <span className="text-gray-700">{analysisResult.summary}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button - Above Navigation */}
      <div className="absolute bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-6">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !hasContent() || analysisResult !== null}
          className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
            isAnalyzing || !hasContent() || analysisResult !== null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing & Saving...</span>
            </>
          ) : analysisResult ? (
            <>
              <Check className="w-5 h-5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyze & Save</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}