import React, { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  isVisible?: boolean;
  isLoading?: boolean;
}

export function FloatingAddButton({ 
  onClick, 
  isVisible = true, 
  isLoading = false 
}: FloatingAddButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Pulse animation on mount for user attention
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Pulse rings for attention */}
      {showPulse && isVisible && (
        <>
          <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-20 animate-ping" 
               style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full bg-purple-400 opacity-15 animate-ping" 
               style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </>
      )}
      
      {/* Main button */}
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={isLoading}
        className={`
          relative w-16 h-16 rounded-full shadow-lg backdrop-blur-sm
          transition-all duration-300 ease-out
          flex items-center justify-center group
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
          ${isPressed ? 'scale-90' : 'scale-100 hover:scale-110'}
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
          
          /* Premium gradient background */
          bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500
          hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600
          
          /* Advanced shadow system */
          shadow-[0_8px_32px_rgba(99,102,241,0.3)]
          hover:shadow-[0_16px_48px_rgba(99,102,241,0.4)]
          active:shadow-[0_4px_16px_rgba(99,102,241,0.3)]
          
          /* Subtle border for premium feel */
          border border-white/10
          
          /* Smooth transforms */
          transform-gpu
        `}
        style={{
          background: isPressed 
            ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)'
            : undefined
        }}
      >
        {/* Shine effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Loading state */}
        {isLoading ? (
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        ) : (
          /* Plus icon with micro-animation */
          <Plus 
            className={`
              w-6 h-6 text-white transition-all duration-200
              ${isPressed ? 'rotate-45 scale-90' : 'rotate-0 scale-100'}
              group-hover:rotate-90
            `} 
          />
        )}
        
        {/* Ripple effect on press */}
        {isPressed && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" 
               style={{ animationDuration: '0.6s' }} />
        )}
      </button>
      
      {/* Tooltip - only show on hover */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          Add content
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
      
      {/* Accessibility - Screen reader text */}
      <span className="sr-only">Add new content</span>
    </div>
  );
}
