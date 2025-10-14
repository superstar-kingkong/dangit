import React from 'react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-1 hover:shadow-md transition-shadow"
      >
        <div className="text-indigo-500">
          {icon}
        </div>
      </button>
      <span className="text-xs text-gray-600 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}