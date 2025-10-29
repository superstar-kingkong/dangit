import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Search } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  darkMode?: boolean;
}

export function Onboarding({ onComplete, darkMode = false }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentStep < 2) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? "bg-gray-900" 
        : "bg-white"
    } flex flex-col relative`}>

      {/* Main Content - Fixed Height for Consistent Button Position */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 min-h-[calc(100vh-140px)]">
        
        {/* STEP 0: HERO WITH LOGO */}
        {currentStep === 0 && (
          <div className={`text-center transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            
            {/* Logo from public folder */}
            <div className="mb-8">
              <img 
                src="/android-chrome-192x192.png" 
                alt="DANGIT Logo" 
                className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-lg"
                onError={(e) => {
                  // Fallback to gradient box if logo doesn't exist
                  const fallback = document.createElement('div');
                  fallback.className = `w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                    darkMode 
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-700' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`;
                  fallback.innerHTML = '<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>';
                  e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
                }}
              />
            </div>

            {/* DANGIT Logo Text */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
                <span className={`${
                  darkMode 
                    ? "text-indigo-300 drop-shadow-sm" 
                    : "text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
                }`}>DANG</span>
                <span className={`${
                  darkMode 
                    ? "text-pink-300 drop-shadow-sm" 
                    : "text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text"
                }`}>IT</span>
              </h1>
            </div>

            {/* Main Message */}
            <h2 className={`text-3xl md:text-4xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            } leading-tight mb-6`}>
              Save anything.
              <br />
              Find everything.
            </h2>

            <p className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } max-w-lg mx-auto leading-relaxed font-medium`}>
              Screenshots, links, notes — organized automatically so you never lose anything important.
            </p>
          </div>
        )}

        {/* STEP 1: FEATURES */}
        {currentStep === 1 && (
          <div className={`transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } leading-tight`}>
                Stop losing stuff
              </h2>
            </div>

            {/* Feature Cards */}
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className={`flex items-center gap-4 p-6 rounded-2xl ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-1`}>
                    Organizes automatically
                  </h3>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } font-medium`}>
                    Screenshots, links, notes get sorted into smart categories
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-6 rounded-2xl ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-1`}>
                    Find anything instantly
                  </h3>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } font-medium`}>
                    Search by content, category, or describe what you need
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-6 rounded-2xl ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-1`}>
                    Actually use what you save
                  </h3>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } font-medium`}>
                    Track completion so nothing gets forgotten
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: READY - CONSISTENT FONT SIZES, NO EXTRA TEXT */}
        {currentStep === 2 && (
          <div className={`text-center transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            
            <h2 className={`text-4xl md:text-5xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            } leading-tight mb-6`}>
              You're all set
            </h2>

            <p className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } max-w-lg mx-auto leading-relaxed font-medium`}>
              Start saving your first item and experience organized, findable content.
            </p>
          </div>
        )}

      </div>

      {/* Bottom Section - Fixed Position */}
      <div className="flex-shrink-0 p-6 pt-4">
        
        {/* Progress dots */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-indigo-600 w-6'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main CTA - Always Same Position */}
        <button
          onClick={handleNext}
          className="w-full h-14 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <span>
            {currentStep === 0 && "Let's go"}
            {currentStep === 1 && "I'm ready"}
            {currentStep === 2 && "Start saving"}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Secondary action only on first screen */}
        {currentStep === 0 && (
          <button
            onClick={onComplete}
            className={`w-full mt-4 h-12 ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-800'
            } font-medium text-base transition-colors`}
          >
            I'm already organized →
          </button>
        )}

      </div>
    </div>
  );
}
