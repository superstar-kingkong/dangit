// components/WhatsNewScreen.tsx
import React from 'react';
import { X, Sparkles, CheckCircle, Clock, Zap } from 'lucide-react';

interface WhatsNewScreenProps {
  darkMode: boolean;
  onClose: () => void;
}

export function WhatsNewScreen({ darkMode, onClose }: WhatsNewScreenProps) {
  const recentFeatures = [
    {
      title: '🔒 Secure Authentication',
      description: 'Enhanced security with proper user authentication and data protection',
      status: 'completed',
      date: 'October 2025'
    },
    {
      title: '📱 Instagram Reel Support',
      description: 'Save Instagram reels with custom titles and AI-powered organization',
      status: 'completed',
      date: 'October 2025'
    },
    {
      title: '🎨 Dark Mode',
      description: 'Beautiful dark theme for comfortable viewing in any lighting',
      status: 'completed',
      date: 'October 2025'
    },
    {
      title: '🤖 AI Content Analysis',
      description: 'Smart categorization and tagging of your saved content',
      status: 'completed',
      date: 'October 2025'
    },
    {
      title: '📊 Personal Analytics',
      description: 'Track your saving habits and completion rates with detailed stats',
      status: 'completed',
      date: 'October 2025'
    }
  ];

  const upcomingFeatures = [
    {
      title: '🏆 Achievement System',
      description: 'Unlock badges and achievements as you use DANGIT',
      status: 'planned',
      date: 'November 2025'
    },
    {
      title: '👥 Collections Sharing',
      description: 'Create and share curated collections with friends',
      status: 'planned',
      date: 'December 2025'
    },
    {
      title: '🎯 Smart Reminders',
      description: 'AI-powered reminders for your saved content',
      status: 'planned',
      date: 'December 2025'
    },
    {
      title: '📱 Native Mobile App',
      description: 'Dedicated iOS and Android apps for even better performance',
      status: 'planned',
      date: '2026'
    },
    {
      title: '🎙️ Voice Notes',
      description: 'Record and save voice notes with transcription',
      status: 'planned',
      date: '2026'
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ✨ What's New
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Recent Updates */}
          <div className="mb-8">
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✅ Live
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {feature.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          🚧 Planned
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {feature.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vote for Features */}
          <div className={`mt-8 p-4 rounded-xl border-2 border-dashed ${
            darkMode ? 'border-purple-600 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
          }`}>
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                Have a Feature Idea?
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Share your suggestions and vote on features in the Feedback section!
              </p>
              <button
                onClick={onClose}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                💡 Suggest Feature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
