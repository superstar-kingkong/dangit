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
      description: 'Enhanced security with proper user authentication and data protection',
      emoji: '🔒'
    },
    {
      title: 'Instagram Reel Support',
      description: 'Save Instagram reels with custom titles and AI-powered organization',
      emoji: '📸'
    },
    {
      title: 'Dark Mode',
      description: 'Beautiful dark theme for comfortable viewing in any lighting',
      emoji: '🌙'
    },
    {
      title: 'AI Content Analysis',
      description: 'Smart categorization and tagging of your saved content',
      emoji: '🤖'
    },
    {
      title: 'Personal Analytics',
      description: 'Track your saving habits and completion rates with detailed stats',
      emoji: '📊'
    },
    {
      title: 'Quick Image Save',
      description: 'Screenshot capturing with secure cloud storage',
      emoji: '⚡'
    }
  ];

  const upcomingFeatures = [
    {
      title: 'Smart Reminders',
      description: 'AI-powered reminders for time-sensitive saved content',
      emoji: '⏰'
    },
    {
      title: 'Collections & Tags',
      description: 'Organize content into custom collections with smart tags',
      emoji: '🏷️'
    },
    {
      title: 'Share Collections',
      description: 'Share curated collections with friends and teams',
      emoji: '🤝'
    },
    {
      title: 'Achievement System',
      description: 'Unlock badges and achievements as you use DANGIT',
      emoji: '🏆'
    },
    {
      title: 'Native Mobile App',
      description: 'Dedicated iOS and Android apps with offline support',
      emoji: '📱'
    },
    {
      title: 'Voice Notes',
      description: 'Record and save voice notes with AI transcription',
      emoji: '🎤'
    },
    {
      title: 'Browser Extension',
      description: 'Save content from any website with one click',
      emoji: '🔌'
    },
    {
      title: 'Export & Backup',
      description: 'Export your data to PDF, Notion, or other formats',
      emoji: '💾'
    }
  ];

  return (
    // FULL SCREEN container
    <div 
      className={`fixed inset-0 z-[99999] ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Header - Fixed at top */}
      <div className={`sticky top-0 z-10 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What's New in DANGIT
            </h1>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Latest features and upcoming updates
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
          
          {/* Recent Updates Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Recently Added
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  These features are live now!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`group p-5 rounded-2xl border-l-4 border-green-500 transition-all hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-750' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{feature.emoji}</span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Now
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Coming Soon
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Features we're working on
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`group p-5 rounded-2xl border-l-4 border-blue-500 transition-all hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-750' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{feature.emoji}</span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Clock className="w-3 h-3" />
                    In Development
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback CTA Section */}
          <div className={`relative overflow-hidden p-8 rounded-3xl ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900 to-pink-900' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            <div className="relative z-10 text-center">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Have a Feature Idea?
              </h3>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Your feedback shapes DANGIT's future. Share suggestions, vote on features, and help us build the perfect content organizer!
              </p>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onOpenFeedback?.(), 100);
                }}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
              >
                Share Your Ideas
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          </div>

          {/* Version Info */}
          <div className={`text-center py-8 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <p className="text-sm font-medium mb-1">DANGIT Version 1.0.0</p>
            <p className="text-xs">Made with ❤️ for productivity enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
