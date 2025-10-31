// components/PrivacyScreen.tsx - SCROLLING FIXED
import React, { useEffect } from 'react';
import { X, Shield, Lock, Eye, Server, Trash2, ArrowLeft } from 'lucide-react';

interface PrivacyScreenProps {
  darkMode: boolean;
  onClose: () => void;
}

export function PrivacyScreen({ darkMode, onClose }: PrivacyScreenProps) {
  useEffect(() => {
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

  const privacySections = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All your data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'We use secure JWT tokens and never store your passwords. All authentication is handled by Supabase.',
      color: 'bg-blue-500'
    },
    {
      icon: Eye,
      title: 'Privacy by Design',
      description: 'We only collect data necessary for the app to function. No tracking, no analytics, no ads.',
      color: 'bg-purple-500'
    },
    {
      icon: Server,
      title: 'Data Storage',
      description: 'Your data is stored securely on Supabase servers with regular backups and security audits.',
      color: 'bg-indigo-500'
    },
    {
      icon: Trash2,
      title: 'Data Control',
      description: 'You own your data. Export it anytime or delete your account and all data will be permanently removed.',
      color: 'bg-red-500'
    }
  ];

  const dataWeCollect = [
    'Email address (for account creation)',
    'Content you choose to save (links, images, notes)',
    'Usage statistics (to improve the app)',
    'Device information (for compatibility)'
  ];

  const dataWeNeverCollect = [
    'Browsing history outside DANGIT',
    'Location data',
    'Contacts or personal files',
    'Passwords or sensitive credentials',
    'Data from other apps'
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
            Privacy & Security
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
          {/* Security Features */}
          <div>
            <h2 className={`text-lg font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              How We Protect You
            </h2>
            <div className="space-y-4">
              {privacySections.map((section, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${section.color} flex-shrink-0`}>
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {section.title}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Collection */}
          <div className="space-y-4">
            {/* What We Collect */}
            <div className={`p-4 rounded-xl ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <h3 className={`font-bold mb-3 ${
                darkMode ? 'text-orange-400' : 'text-orange-700'
              }`}>
                What We Collect
              </h3>
              <ul className="space-y-2">
                {dataWeCollect.map((item, index) => (
                  <li key={index} className={`text-sm flex items-start gap-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="text-orange-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Never Collect */}
            <div className={`p-4 rounded-xl ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <h3 className={`font-bold mb-3 ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                What We Never Collect
              </h3>
              <ul className="space-y-2">
                {dataWeNeverCollect.map((item, index) => (
                  <li key={index} className={`text-sm flex items-start gap-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="text-green-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className={`p-6 rounded-xl border-2 border-dashed ${
            darkMode 
              ? 'border-blue-600 bg-blue-900/20' 
              : 'border-blue-300 bg-blue-50'
          }`}>
            <div className="text-center">
              <Shield className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className={`font-bold mb-2 ${
                darkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Questions About Privacy?
              </h3>
              <p className={`text-sm mb-3 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                We're committed to transparency. Reach out with any privacy concerns.
              </p>
              <button
                onClick={() => window.open('mailto:dangit.app@gmail.com?subject=Privacy Question', '_blank')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Privacy Team
              </button>
            </div>
          </div>

          <div style={{ height: '40px' }}></div>
        </div>
      </div>
    </div>
  );
}
