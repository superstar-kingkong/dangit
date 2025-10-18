import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Bookmark, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animate in on mount
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 200);
  }, []);

  const steps = [
    {
      id: 'welcome',
      headline: "Never lose track of anything important",
      description: "The smart way to save, organize, and instantly find everything that matters.",
      icon: Sparkles
    },
    {
      id: 'problem',
      headline: "Sound familiar?",
      description: "You find something useful but can't decide where to save it. Screenshots? Bookmarks? Then wonder if you'll ever find it again.",
      icon: Search
    },
    {
      id: 'solution', 
      headline: "Just save it",
      description: "Screenshot anything, share any link, save any thought. DANGIT organizes it automatically so you can find it instantly.",
      icon: Bookmark
    },
    {
      id: 'ready',
      headline: "Ready to stay organized?",
      description: "Save your first item and experience organized, searchable content. Everything you need, right when you need it.",
      icon: ChevronRight
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 transition-all duration-700 ${
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      
      {/* Clean Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Skip Button */}
      <div className="absolute top-8 right-6 z-20">
        {currentStep < steps.length - 1 && (
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white/90 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 relative z-10">
        <div className={`transition-all duration-500 max-w-lg mx-auto w-full ${
          isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          
          {/* Welcome Screen - CLEAN & ELEGANT */}
          {currentStep === 0 && (
            <div className="text-center mb-12">
              {/* Simple, Elegant DANGIT Title */}
              <h1 className="text-4xl md:text-5xl tracking-tight font-bold mb-8">
                <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
              </h1>
            </div>
          )}

          {/* Step Icon (for non-welcome steps) */}
          {currentStep > 0 && (
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center">
                {React.createElement(currentStepData.icon, { 
                  className: "w-8 h-8 text-white"
                })}
              </div>
            </div>
          )}

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight text-center">
            {currentStepData.headline}
          </h2>

          {/* Description with better spacing */}
          <p className="text-lg text-gray-600 leading-relaxed text-center max-w-md mx-auto mb-8">
            {currentStepData.description}
          </p>

          {/* Simple Feature List (only on solution step) */}
          {currentStep === 2 && (
            <div className="mt-12 space-y-4 max-w-sm mx-auto">
              {[
                "📸 Screenshots organized instantly",
                "🔗 Links with smart previews", 
                "🔍 Find anything in seconds"
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm"
                >
                  <span className="text-2xl">{feature.split(' ')[0]}</span>
                  <span className="font-medium text-gray-800 leading-relaxed">{feature.substring(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 px-6 pb-8 space-y-6 relative z-10">
        
        {/* ELEGANT Progress Indicator */}
        <div className="flex justify-center items-center">
          <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-8 h-1.5 mx-1 rounded-full transition-all duration-500 ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    : index < currentStep
                    ? 'bg-indigo-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <span>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </span>
          <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Secondary Action (welcome step only) */}
        {currentStep === 0 && (
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
            >
              Already organized? <span className="text-indigo-600 font-semibold">Jump right in →</span>
            </button>
          </div>
        )}

        {/* Home Indicator */}
        <div className="flex justify-center pt-2">
          <div className="w-32 h-1 bg-gray-900 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `
      }} />
    </div>
  );
}
