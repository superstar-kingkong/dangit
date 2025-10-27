// components/WhatsNewScreen.tsx - FIXED VERSION
import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle, Clock } from 'lucide-react';

interface WhatsNewScreenProps {
  darkMode: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export function WhatsNewScreen({ darkMode, onClose, onOpenFeedback }: WhatsNewScreenProps) {
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const recentFeatures = [
    {
      title: 'Secure Authentication',
      description: 'Enhanced security with proper user authentication and data protection'
    },
    {
      title: 'Instagram Reel Support',
      description: 'Save Instagram reels with custom titles and AI-powered organization'
    },
    {
      title: 'Dark Mode',
      description: 'Beautiful dark theme for comfortable viewing'
    },
    {
      title: 'AI Content Analysis',
      description: 'Smart categorization and tagging of your saved content'
    },
    {
      title: 'Personal Analytics',
      description: 'Track your saving habits with detailed stats'
    }
  ];

  const upcomingFeatures = [
    {
      title: 'Smart Reminders',
      description: 'AI-powered reminders for your saved content'
    },
    {
      title: 'Collections Sharing',
      description: 'Create and share curated collections with friends'
    },
    {
      title: 'Achievement System',
      description: 'Unlock badges and achievements as you use DANGIT'
    }
  ];

  return (
    // Full-screen overlay
    <div 
      className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            What's New
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Recent Updates */}
          <div className="mb-6">
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Updates
            </h3>
            <div className="space-y-3">
              {recentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 border-green-500 ${
                    darkMode ? 'bg-gray-800' : 'bg-green-50'
                  }`}
                >
                  <h4 className={`font-semibold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                  <span className="inline-block mt-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mb-6">
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-5 h-5 text-blue-500" />
              Coming Soon
            </h3>
            <div className="space-y-3">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 border-blue-500 ${
                    darkMode ? 'bg-gray-800' : 'bg-blue-50'
                  }`}
                >
                  <h4 className={`font-semibold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                  <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Planned
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback CTA */}
          <div className={`p-4 rounded-lg border-2 border-dashed ${
            darkMode ? 'border-purple-600 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
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
                Share your suggestions in Feedback!
              </p>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onOpenFeedback?.(), 100);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Suggest Feature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}