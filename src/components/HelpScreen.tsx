// components/HelpScreen.tsx - FIXED VERSION
import React, { useEffect } from 'react';
import { X, Mail, Camera, MessageCircle, ExternalLink } from 'lucide-react';

interface HelpScreenProps {
  darkMode: boolean;
  onClose: () => void;
}

export function HelpScreen({ darkMode, onClose }: HelpScreenProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, []);

  const handleEmailSupport = () => {
    window.open('mailto:dangit.app@gmail.com?subject=DANGIT Support Request', '_blank');
  };

  const helpSections = [
    {
      title: 'Email Support',
      description: 'Get direct help from our team',
      action: 'Email Us',
      onClick: handleEmailSupport,
      icon: Mail,
      color: 'bg-blue-500'
    },
    {
      title: 'Report Issue with Screenshot',
      description: 'Take a screenshot and email it to us for faster resolution',
      action: 'dangit.app@gmail.com',
      onClick: handleEmailSupport,
      icon: Camera,
      color: 'bg-green-500'
    },
    {
      title: 'General Questions',
      description: 'Ask us anything about DANGIT features',
      action: 'Ask Question',
      onClick: handleEmailSupport,
      icon: MessageCircle,
      color: 'bg-purple-500'
    }
  ];

  const faqData = [
    {
      q: 'How do I save Instagram reels?',
      a: 'Copy the reel link and paste it in the Add Content screen. DANGIT will automatically detect and save it with AI analysis.'
    },
    {
      q: 'Can I edit titles after saving?',
      a: 'Yes! Tap on any saved item to open details, then use the edit button to change the title.'
    },
    {
      q: 'How does the AI categorization work?',
      a: 'Our AI analyzes your content and automatically assigns categories like Learning, Entertainment, Productivity, etc.'
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely! All data is encrypted and stored securely. We never share your personal information.'
    },
    {
      q: 'Can I export my data?',
      a: 'Yes, you can export all your saved content from the Profile screen > Export Data option.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
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
              Help & Support
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
            {/* Contact Options */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Get Help
              </h2>
              <div className="space-y-4">
                {helpSections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${section.color} flex-shrink-0`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {section.title}
                        </h3>
                        <p className={`text-sm mb-3 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {section.description}
                        </p>
                        <button
                          onClick={section.onClick}
                          className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                            darkMode 
                              ? 'text-indigo-400 hover:text-indigo-300' 
                              : 'text-indigo-600 hover:text-indigo-700'
                          }`}
                        >
                          {section.action}
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      darkMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {faq.q}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className={`p-6 rounded-xl border-2 border-dashed ${
              darkMode 
                ? 'border-gray-600 bg-gray-800/50' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="text-center">
                <h3 className={`font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Still need help?
                </h3>
                <p className={`text-sm mb-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Email us directly and we'll get back to you within 24 hours
                </p>
                <button
                  onClick={handleEmailSupport}
                  className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  dangit.app@gmail.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
