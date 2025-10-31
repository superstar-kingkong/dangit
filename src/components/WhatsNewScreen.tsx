// components/WhatsNewScreen.tsx - SCROLLING FIXED
import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface WhatsNewScreenProps {
  darkMode: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export function WhatsNewScreen({ darkMode, onClose, onOpenFeedback }: WhatsNewScreenProps) {
  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
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
    <div 
      className={`fixed inset-0 z-[99999] ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* FIXED Header */}
      <div 
        className={`px-4 py-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: darkMode ? '#111827' : '#ffffff'
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <h1 className={`text-xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            What's New
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* SCROLLABLE Content */}
      <div 
        className="flex-1"
        style={{
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl md:mx-auto">
          {/* Recent Updates */}
          <div>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Updates
            </h2>
            <div className="space-y-3">
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
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-5 h-5 text-blue-500" />
              Coming Soon
            </h2>
            <div className="space-y-3">
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
                Share your suggestions and vote on features!
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

          {/* Bottom padding for mobile */}
          <div style={{ height: '40px' }}></div>
        </div>
      </div>
    </div>
  );
}
