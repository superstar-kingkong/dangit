import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

export function FloatingAddButton({ 
  onClick, 
  isVisible = true
}: FloatingAddButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    setTimeout(() => setIsPressed(false), 200);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-24 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-indigo-600 to-purple-600
        hover:from-indigo-700 hover:to-purple-700
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
        ${isPressed ? 'scale-95' : 'scale-100'}
      `}
      aria-label="Add new content"
    >
      <Plus 
        className="w-6 h-6 text-white transition-transform duration-200"
        strokeWidth={2.5}
      />
    </button>
  );
}