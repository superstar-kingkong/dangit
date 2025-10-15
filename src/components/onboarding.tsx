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
      title: "DANGIT",
      headline: "Never lose track of anything",
      description: "The smart way to save, organize, and find everything that matters.",
    },
    {
      id: 'problem',
      headline: "Sound familiar?",
      description: "You find something useful but can't decide where to save it. Screenshot? Bookmark? Then wonder if you'll ever find it again.",
    },
    {
      id: 'solution', 
      headline: "Just save it",
      description: "Screenshot anything, share any link, save any thought. AI organizes it automatically so you can find it instantly.",
    },
    {
      id: 'ready',
      headline: "Ready to start?",
      description: "Save your first item and experience organized, searchable content. Everything you need, right when you need it.",
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
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2 flex-shrink-0">
        <div className="text-sm font-semibold text-gray-900">9:41</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-1 h-1 bg-gray-900 rounded-full"></div>
            ))}
          </div>
          <div className="w-6 h-3 border-2 border-gray-900 rounded-sm relative">
            <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]"></div>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      {currentStep < steps.length - 1 && (
        <div className="absolute top-14 right-6 z-20">
          <button
            onClick={onComplete}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors duration-200"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Content - Centered Vertically */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className={`transition-all duration-500 max-w-lg mx-auto w-full ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          
          {/* Logo or Step Number */}
          <div className="mb-8">
            {currentStep === 0 ? (
              <div className="text-center mb-6">
                <h1 className="text-6xl font-black tracking-tight mb-3">
                  <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                    DANGIT
                  </span>
                </h1>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{currentStep}</span>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              </div>
            )}
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            {currentStepData.headline}
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-normal">
            {currentStepData.description}
          </p>
        </div>
      </div>

      {/* Bottom Fixed Section */}
      <div className="flex-shrink-0 px-6 pb-8 space-y-6">
        
        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentStep
                  ? 'w-8 bg-gradient-to-r from-indigo-600 to-purple-600'
                  : index < currentStep
                  ? 'w-1.5 bg-indigo-400'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <span>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </span>
          <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Secondary Action */}
        {currentStep === 0 && (
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
            >
              Already have an account? <span className="text-indigo-600 font-semibold">Sign in</span>
            </button>
          </div>
        )}

        {/* Home Indicator */}
        <div className="flex justify-center pt-2">
          <div className="w-32 h-1 bg-gray-900 rounded-full opacity-40"></div>
        </div>
      </div>
    </div>
  );
}