import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, Link, Mic, FileText, Upload, Loader2, X, Eye, EyeOff, 
  Globe, Image, Play, Pause, Square, Sparkles, Zap, Check,
  ArrowRight, Plus, Hash, ChevronDown, Wand2, Brain, Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
}

export function AddContentModal({ isOpen, onClose, onSave }: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'screenshot' | 'voice' | 'manual'>('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [url, setUrl] = useState('');
  const [urlPreview, setUrlPreview] = useState<any>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  const suggestedCategories = [
    { name: 'Work', color: 'work', icon: '💼', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Research', color: 'research', icon: '🔬', gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Ideas', color: 'ideas', icon: '💡', gradient: 'from-yellow-500 to-amber-500' },
    { name: 'Personal', color: 'personal', icon: '👤', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Shopping', color: 'shopping', icon: '🛒', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Travel', color: 'travel', icon: '✈️', gradient: 'from-cyan-500 to-blue-500' },
    { name: 'Health', color: 'health', icon: '🏥', gradient: 'from-red-500 to-red-600' },
    { name: 'Food', color: 'food', icon: '🍔', gradient: 'from-orange-500 to-red-500' }
  ];

  const tabs = [
    { 
      id: 'url', 
      label: 'Save Link', 
      icon: Link, 
      description: 'Save any website or article',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'screenshot', 
      label: 'Screenshot', 
      icon: Camera, 
      description: 'Capture and analyze images',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'voice', 
      label: 'Voice Note', 
      icon: Mic, 
      description: 'Record voice memos',
      gradient: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50'
    },
    { 
      id: 'manual', 
      label: 'Quick Note', 
      icon: FileText, 
      description: 'Write notes manually',
      gradient: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const processingStages = [
    { text: 'Analyzing content...', icon: Brain },
    { text: 'Extracting key information...', icon: Eye },
    { text: 'Generating smart summary...', icon: Sparkles },
    { text: 'Categorizing content...', icon: Hash },
    { text: 'Creating tags...', icon: Wand2 },
    { text: 'Almost done!', icon: Check }
  ];

  // URL preview simulation
  useEffect(() => {
    if (url && url.length > 10) {
      const timer = setTimeout(() => {
        setUrlPreview({
          title: "How to Build Better Apps with AI",
          description: "Discover the latest techniques for integrating AI into your development workflow...",
          domain: new URL(url).hostname,
          favicon: "🌐"
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setUrlPreview(null);
    }
  }, [url]);

  // Modal entrance animation
  useEffect(() => {
    if (isOpen) {
      setIsModalClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      onClose();
      // Reset all states
      setActiveTab('url');
      setUrl('');
      setUrlPreview(null);
      setManualTitle('');
      setManualContent('');
      setSelectedCategories([]);
      setUploadedImage(null);
      setIsRecording(false);
      setRecordingTime(0);
    }, 200);
  };

  const handleSave = useCallback(() => {
    setIsProcessing(true);
    
    // Animate through processing stages
    processingStages.forEach((stage, index) => {
      setTimeout(() => {
        setProcessingStage(stage.text);
        if (index === processingStages.length - 1) {
          setTimeout(() => {
            setIsProcessing(false);
            onSave({
              type: activeTab,
              content: activeTab === 'url' ? url : activeTab === 'manual' ? { title: manualTitle, content: manualContent } : null,
              categories: selectedCategories
            });
            handleClose();
          }, 800);
        }
      }, (index + 1) * 600);
    });
  }, [activeTab, url, manualTitle, manualContent, selectedCategories, onSave]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setUploadedImage(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStageIcon = () => {
    const currentStage = processingStages.find(stage => stage.text === processingStage);
    return currentStage?.icon || Sparkles;
  };

  const isFormValid = () => {
    switch (activeTab) {
      case 'url': return url.length > 0;
      case 'manual': return manualTitle.length > 0 || manualContent.length > 0;
      case 'screenshot': return uploadedImage !== null;
      case 'voice': return recordingTime > 0;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${
      isModalClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Enhanced Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          isModalClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, rgba(0, 0, 0, 0.4) 70%)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className={`
        relative w-full max-w-lg mx-4 mb-4 bg-white rounded-3xl shadow-2xl 
        transform transition-all duration-300 ease-out max-h-[85vh] flex flex-col
        ${isModalClosing ? 'translate-y-full scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'}
      `}>
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Save Content ✨
                </h2>
                <p className="text-white/80 text-sm">
                  AI will organize it perfectly
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      relative p-3 rounded-xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-white/20 backdrop-blur-sm scale-105 shadow-lg' 
                        : 'bg-white/10 hover:bg-white/15'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg transition-all duration-300
                        ${isActive ? 'bg-white text-indigo-600 shadow-md' : 'bg-white/20 text-white'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/90'}`}>
                          {tab.label}
                        </div>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* URL Tab - Enhanced with Live Preview */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-xl shadow-sm">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Website URL</h3>
                    <p className="text-sm text-blue-600">AI will analyze the content</p>
                  </div>
                </div>
                
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-12 text-base border-2 border-blue-200 focus:border-blue-500 transition-colors rounded-xl bg-white/80"
                />
                
                {/* Live Preview */}
                {urlPreview && (
                  <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{urlPreview.favicon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{urlPreview.title}</h4>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{urlPreview.description}</p>
                        <p className="text-blue-600 text-xs mt-2 font-medium">{urlPreview.domain}</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Screenshot Tab - Enhanced with Preview */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-xl shadow-sm">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Image</h3>
                    <p className="text-sm text-green-600">AI will extract text and analyze</p>
                  </div>
                </div>
                
                {uploadedImage ? (
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button 
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
                      ${dragActive 
                        ? 'border-green-400 bg-green-100 scale-102' 
                        : 'border-green-300 hover:border-green-400 hover:bg-green-100/50'
                      }
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragActive ? 'text-green-500' : 'text-green-400'}`} />
                    <p className="text-gray-700 mb-2 font-medium">
                      {dragActive ? 'Drop it here!' : 'Drag & drop or tap to browse'}
                    </p>
                    <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setUploadedImage(e.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Tab - Enhanced with Waveform Visualization */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-xl shadow-sm">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Voice Recording</h3>
                    <p className="text-sm text-red-600">Speak your thoughts aloud</p>
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <div className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-lg
                    ${isRecording 
                      ? 'bg-red-500 animate-pulse shadow-red-200' 
                      : 'bg-red-100 hover:bg-red-200 cursor-pointer'
                    }
                  `}
                  onClick={isRecording ? stopRecording : startRecording}
                  >
                    <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-red-500'}`} />
                    
                    {/* Recording indicator rings */}
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse" />
                      </>
                    )}
                  </div>
                  
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="text-2xl font-mono font-bold text-red-600">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="flex justify-center gap-2 mb-4">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-1 bg-red-400 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">Recording in progress...</p>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50 rounded-full px-6"
                        onClick={stopRecording}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">Ready to record</p>
                      <p className="text-gray-500 text-sm">Tap the microphone to start</p>
                      {recordingTime > 0 && (
                        <div className="text-center">
                          <Clock className="w-4 h-4 inline mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">Last recording: {formatTime(recordingTime)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Tab - Enhanced with Rich Text Features */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-xl shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Note</h3>
                    <p className="text-sm text-purple-600">Jot down your thoughts</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="What's this about? (Title)"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 transition-colors rounded-xl bg-white/80"
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Write your thoughts, ideas, or anything you want to remember..."
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      rows={6}
                      className="text-base leading-relaxed resize-none border-2 border-purple-200 focus:border-purple-500 transition-colors rounded-xl bg-white/80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Processing State */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100 animate-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin flex items-center justify-center">
                    {React.createElement(getCurrentStageIcon(), { className: "w-8 h-8 text-white" })}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-20 animate-ping" />
                </div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">AI Magic in Progress ✨</h3>
                <p className="text-indigo-600 font-medium mb-4">{processingStage}</p>
                <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-700 relative overflow-hidden"
                    style={{ width: `${((processingStages.findIndex(stage => stage.text === processingStage) + 1) / processingStages.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Category Selection */}
          {!isProcessing && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Hash className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Categories</h3>
                    <p className="text-sm text-gray-600">Select or let AI choose</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {suggestedCategories.slice(0, showAdvanced ? undefined : 4).map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`
                      p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden
                      ${selectedCategories.includes(category.name)
                        ? `bg-gradient-to-r ${category.gradient} text-white border-transparent shadow-md scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-sm">{category.name}</span>
                      {selectedCategories.includes(category.name) && (
                        <Check className="w-4 h-4 ml-auto animate-in zoom-in-50" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 bg-white/90 backdrop-blur-sm rounded-b-3xl">
          <Button
            onClick={handleSave}
            disabled={isProcessing || !isFormValid()}
            className={`
              w-full h-14 text-lg font-semibold rounded-2xl shadow-lg transition-all duration-200
              ${isProcessing || !isFormValid()
                ? 'opacity-50 cursor-not-allowed bg-gray-300'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-xl hover:scale-102'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI is working...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Save with AI Magic</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
          
          {!isProcessing && selectedCategories.length > 0 && (
            <div className="mt-3 text-center animate-in slide-in-from-bottom-2">
              <div className="flex flex-wrap gap-1 justify-center">
                {selectedCategories.map(cat => (
                  <span key={cat} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}