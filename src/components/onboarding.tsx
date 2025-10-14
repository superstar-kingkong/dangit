import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: null,
      subtitle: "Never lose track again",
      description: "Your smart content organizer",
      showLogo: true
    },
    {
      id: 'problem',
      title: "Sound Familiar?",
      subtitle: "",
      description: "You find something useful online but can't decide where to save it. Screenshot? Bookmark? Share to yourself? Then wonder if you'll ever find it again...",
      showLogo: false
    },
    {
      id: 'solution', 
      title: "Just Say DANGIT!",
      subtitle: "",
      description: "Screenshot anything, share any link, or save any thought. We'll organize it perfectly so you can actually find it when you need it.",
      showLogo: false
    },
    {
      id: 'features',
      title: "Save From Anywhere",
      subtitle: "",
      description: "Screenshots, web links, voice notes, quick text - capture everything in one place. No more scattered saves across different apps.",
      showLogo: false
    },
    {
      id: 'ready',
      title: "Ready to Get Organized?",
      subtitle: "",
      description: "Stop losing track of important stuff. Everything you save gets organized automatically so you can focus on what matters.",
      showLogo: false
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
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-200 to-orange-200 rounded-full opacity-15 animate-bounce" style={{animationDuration: '6s'}} />
        <div className="absolute top-1/2 left-8 w-16 h-16 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-10 animate-pulse" style={{animationDuration: '5s'}} />
      </div>
      
      {/* Status Bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-4 pb-2">
        <div className="text-sm font-medium text-gray-900">9:41</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
          </div>
          <div className="w-6 h-3 border border-gray-900 rounded-sm relative">
            <div className="absolute inset-0.5 bg-green-500 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Skip Button - More prominent */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="absolute top-16 right-6 z-20">
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-gray-900 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className={`transition-all duration-500 max-w-sm ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'} ${currentStepData.showLogo ? 'text-center mx-auto' : 'text-left'}`}>
          
          {/* Logo or Title */}
          {currentStepData.showLogo ? (
            <div className="mb-12">
              <h1 className="text-6xl font-black tracking-tighter mb-6" 
                  style={{ 
                    fontFamily: 'Space Grotesk, system-ui, sans-serif',
                    fontWeight: '1200',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
              </h1>
              {currentStepData.subtitle && (
                <p className="text-gray-600 text-lg font-medium mb-4">
                  {currentStepData.subtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight"
                  style={{ 
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '1200',
                    textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                {currentStepData.title}
              </h1>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-gray-700 text-xl leading-relaxed font-normal"
               style={{ 
                 fontFamily: 'Inter, system-ui, sans-serif',
                 fontWeight: '600',
                 lineHeight: '1.6'
               }}>
              {currentStepData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="relative z-10 px-8 pb-8">
        {/* Progress Dots - Enhanced */}
        <div className="flex justify-center items-center gap-3 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentStep
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md'
                  : index < currentStep
                  ? 'w-2 bg-green-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* CTA Button - Enhanced */}
        <button
          onClick={handleNext}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <span>
            {currentStep === steps.length - 1 ? 'Start Organizing!' : 'Continue'}
          </span>
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Secondary Action */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {currentStep === 0 ? 'Already have an account? Sign in' : 'Skip and try now'}
          </button>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center mt-6">
          <div className="w-32 h-1 bg-gray-900 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
}