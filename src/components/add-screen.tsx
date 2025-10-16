import { API_URL } from '../config';
import React, { useState, useRef } from 'react';
import { Camera, Link, Mic, FileText, Upload, Loader2, X, Check, Sparkles } from 'lucide-react';

interface AddContentScreenProps {
  userId: string;
  onClose: () => void;
}

export function AddContentScreen({ 
  userId,
  onClose
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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing || !hasContent() || analysisResult !== null) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
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

      console.log('Saving content...', { contentType, userId });

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
        });
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save');
      }

    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save content');
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

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute top-16 left-4 right-4 z-50 animate-in slide-in-from-top-2">
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
      <div className="px-6 pt-4 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Add Content
            </h1>
            <p className="text-gray-600 mt-1 font-medium">
              Save anything, organized automatically
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-gray-100 rounded-2xl p-1.5">
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
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Properly Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        
        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-6 pb-32">
            <div>
              <label className="block text-gray-900 mb-2 font-bold text-sm">
                Paste any link
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-all text-base"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Save articles, videos, tweets, or any webpage
              </p>
            </div>

            {analysisResult && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-black text-green-900 text-lg">Saved!</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</span>
                    <p className="text-gray-900 font-semibold mt-1">{analysisResult.title}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</span>
                    <p className="text-indigo-600 font-bold mt-1">{analysisResult.category}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Summary</span>
                    <p className="text-gray-700 mt-1 leading-relaxed">{analysisResult.summary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshot Tab */}
        {activeTab === 'screenshot' && (
          <div className="space-y-6 pb-32">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full max-h-80 object-contain bg-gray-50"
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
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{selectedFile.name}</div>
                      <div className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                </div>

                {analysisResult && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-black text-green-900 text-lg">Saved!</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="bg-white/60 rounded-lg p-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">What we found</span>
                        <p className="text-gray-900 font-semibold mt-1">{analysisResult.title}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</span>
                        <p className="text-indigo-600 font-bold mt-1">{analysisResult.category}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl p-16 text-center transition-all group"
                >
                  <Upload className="w-20 h-20 text-gray-400 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
                  <p className="text-gray-900 font-bold text-xl mb-2">
                    Choose an image
                  </p>
                  <p className="text-gray-500">
                    Screenshots, photos, or any image
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6 pb-32">
            <div>
              <label className="block text-gray-900 mb-2 font-bold text-sm">
                Title (Optional)
              </label>
              <input
                placeholder="Give it a title..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-all text-base"
              />
            </div>
            
            <div>
              <label className="block text-gray-900 mb-2 font-bold text-sm">
                Your note
              </label>
              <textarea
                placeholder="Write anything... ideas, thoughts, reminders"
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none resize-y text-gray-900 placeholder-gray-400 transition-all text-base leading-relaxed min-h-[150px] max-h-[400px]"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  AI will organize this for you
                </p>
                <span className="text-sm text-gray-500 font-medium">
                  {manualContent.length} characters
                </span>
              </div>
            </div>

            {analysisResult && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-black text-green-900 text-lg">Saved!</span>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Organized as</span>
                    <p className="text-gray-900 font-semibold mt-1">{analysisResult.title}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</span>
                    <p className="text-indigo-600 font-bold mt-1">{analysisResult.category}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-gray-900 font-black mb-2 text-2xl">
              Voice Notes
            </h3>
            <p className="text-gray-600 text-lg">
              Coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button - Above Navigation */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={isProcessing || !hasContent() || analysisResult !== null}
          className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 ${
            isProcessing || !hasContent() || analysisResult !== null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              <span>Saving with AI...</span>
            </>
          ) : analysisResult ? (
            <>
              <Check className="w-5 h-5" strokeWidth={3} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              <span>Save to DANGIT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}