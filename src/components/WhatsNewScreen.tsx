// components/WhatsNewScreen.tsx - FULL SCREEN VERSION
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
    },
    {
      title: 'Native Mobile App',
      description: 'Dedicated iOS and Android apps for even better performance'
    },
    {
      title: 'Voice Notes',
      description: 'Record and save voice notes with transcription'
    }
  ];

  return (
    // FULL SCREEN - No centering, no padding, takes entire viewport
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      {/* Fixed Header */}
      <div className={`flex-shrink-0 px-6 py-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
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
              darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Content - Takes remaining space */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-8">
          {/* Recent Updates */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CheckCircle className="w-6 h-6 text-green-500" />
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
                  <h3 className={`font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    ✨ Live Now
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-6 h-6 text-blue-500" />
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
                  <h3 className={`font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    🚀 Planned
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback CTA */}
          <div className={`p-6 rounded-xl border-2 border-dashed ${
            darkMode ? 'border-purple-600 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
          }`}>
            <div className="text-center">
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className={`text-lg font-bold mb-2 ${
                darkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Have a Feature Idea?
              </h3>
              <p className={`text-sm mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Share your suggestions and vote on features in the Feedback section!
              </p>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onOpenFeedback?.(), 100);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                💡 Suggest Feature
              </button>
            </div>
          </div>

          {/* Bottom spacing for mobile */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
