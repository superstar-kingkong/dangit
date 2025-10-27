// components/HelpScreen.tsx
import React, { useEffect } from 'react';
import { X, Mail, Camera, MessageCircle, ExternalLink } from 'lucide-react';

interface HelpScreenProps {
  darkMode: boolean;
  onClose: () => void;
}

export function HelpScreen({ darkMode, onClose }: HelpScreenProps) {
  // ✅ CRITICAL: Prevent body scroll when modal opens
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
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
      className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        overflow: 'hidden'
      }}
    >
      <div className="h-screen flex flex-col">
        {/* Header - Fixed */}
        <div className={`flex-shrink-0 px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Help & Support
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Contact Options */}
            <div className="space-y-4 mb-8">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Get Help
              </h2>
              {helpSections.map((section, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${
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
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {section.title}
                      </h3>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {section.description}
                      </p>
                      <button
                        onClick={section.onClick}
                        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                          darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
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

            {/* FAQ */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {faq.q}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className={`mt-8 p-4 rounded-xl border-2 border-dashed ${
              darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="text-center">
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Still need help?
                </h3>
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email us directly and we'll get back to you within 24 hours
                </p>
                <button
                  onClick={handleEmailSupport}
                  className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  dangit.app@gmail.com
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className={`flex-shrink-0 px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-gray-50/80'}`}>
          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Need more help? Email us at <strong>dangit.app@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
