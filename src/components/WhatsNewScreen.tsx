// components/WhatsNewScreen.tsx - FIXED VERSION
import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle, Clock } from 'lucide-react';

interface WhatsNewScreenProps {
  darkMode: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export function WhatsNewScreen({ darkMode, onClose, onOpenFeedback }: WhatsNewScreenProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    
    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, []);

  const recentFeatures = [
    {
      title: 'Secure Authentication',
      description: 'Enhanced security with proper user authentication and data protection',
      status: 'completed'
    },
    {
      title: 'Instagram Reel Support',
      description: 'Save Instagram reels with custom titles and AI-powered organization',
      status: 'completed'
    },
    {
      title: 'Dark Mode',
      description: 'Beautiful dark theme for comfortable viewing in any lighting',
      status: 'completed'
    },
    {
      title: 'AI Content Analysis',
      description: 'Smart categorization and tagging of your saved content',
      status: 'completed'
    },
    {
      title: 'Personal Analytics',
      description: 'Track your saving habits and completion rates with detailed stats',
      status: 'completed'
    }
  ];

  const upcomingFeatures = [
    {
      title: 'Smart Reminders',
      description: 'AI-powered reminders for your saved content',
      status: 'planned'
    },
    {
      title: 'Collections Sharing',
      description: 'Create and share curated collections with friends',
      status: 'planned'
    },
    {
      title: 'Achievement System',
      description: 'Unlock badges and achievements as you use DANGIT',
      status: 'planned'
    },
    {
      title: 'Native Mobile App',
      description: 'Dedicated iOS and Android apps for even better performance',
      status: 'planned'
    },
    {
      title: 'Voice Notes',
      description: 'Record and save voice notes with transcription',
      status: 'planned'
    }
  ];

  const handleSuggestFeature = () => {
    onClose();
    setTimeout(() => {
      if (onOpenFeedback) {
        onOpenFeedback();
      }
    }, 100);
  };

  return (
    // Fixed overlay - covers entire viewport
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      {/* Modal content - prevent click propagation */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What's New
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-800 text-white' 
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="p-6 space-y-8">
            {/* Recent Updates */}
            <div>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Recent Updates
              </h2>
              <div className="space-y-4">
                {recentFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 border-green-500 ${
                      darkMode ? 'bg-gray-800' : 'bg-green-50'
                    }`}
                  >
                    <h3 className={`font-semibold mb-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Live
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon */}
            <div>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Clock className="w-5 h-5 text-blue-500" />
                Coming Soon
              </h2>
              <div className="space-y-4">
                {upcomingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 border-blue-500 ${
                      darkMode ? 'bg-gray-800' : 'bg-blue-50'
                    }`}
                  >
                    <h3 className={`font-semibold mb-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Planned
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vote for Features */}
            <div className={`p-6 rounded-xl border-2 border-dashed ${
              darkMode 
                ? 'border-purple-600 bg-purple-900/20' 
                : 'border-purple-300 bg-purple-50'
            }`}>
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className={`font-bold mb-2 ${
                  darkMode ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Have a Feature Idea?
                </h3>
                <p className={`text-sm mb-3 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Share your suggestions and vote on features in the Feedback section!
                </p>
                <button
                  onClick={handleSuggestFeature}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Suggest Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}