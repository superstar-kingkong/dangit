// components/PWAInstallBanner.tsx
import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  darkMode?: boolean;
}

export function PWAInstallBanner({ darkMode = false }: PWAInstallBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // ✅ Detect if already running as PWA
  useEffect(() => {
    const checkPWAStatus = () => {
      // Method 1: Check display mode
      const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
      
      // Method 2: Check if launched from home screen (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      // Method 3: Check if URL has utm_source=web_app_manifest (Android)
      const urlParams = new URLSearchParams(window.location.search);
      const isLaunchedFromManifest = urlParams.get('utm_source') === 'web_app_manifest';
      
      const isPWA = isStandalonePWA || isIOSStandalone || isLaunchedFromManifest;
      
      console.log('PWA Status Check:', {
        isStandalonePWA,
        isIOSStandalone,
        isLaunchedFromManifest,
        isPWA
      });
      
      setIsStandalone(isPWA);
      
      // Don't show banner if already PWA
      if (isPWA) {
        setShowBanner(false);
        return;
      }
      
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissed = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Show again after 7 days
        if (daysSinceDismissed < 1) {
          setIsDismissed(true);
          return;
        }
      }
    };

    checkPWAStatus();
  }, []);

  // ✅ Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired');
      e.preventDefault(); // Prevent default browser install prompt
      setDeferredPrompt(e);
      
      // Show banner only if not already PWA and not dismissed
      if (!isStandalone && !isDismissed) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed'); // Clear dismissal
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, isDismissed]);

  // ✅ Handle install click
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (error) {
      console.error('Error during PWA install:', error);
    }
  };

  // ✅ Handle dismiss
  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    console.log('PWA install banner dismissed');
  };

  // ✅ Don't render if conditions not met
  if (!showBanner || isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className={`mb-4 rounded-2xl border-2 border-dashed transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-800/50' 
        : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              darkMode 
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-500'
            }`}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📱 Install DANGIT App
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get the native app experience! Works offline and loads faster.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={`p-1.5 rounded-lg transition-colors ml-2 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Add to Home Screen
          </button>
          <button
            onClick={handleDismiss}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
