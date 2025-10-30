import React, { useState } from 'react';
import { Instagram, Loader, X } from 'lucide-react';

interface InstagramSaveModalProps {
  instagramUrl: string;
  onSave: (title: string, url: string) => Promise<void>;
  onCancel: () => void;
  darkMode?: boolean;
}

export default function InstagramSaveModal({ 
  instagramUrl, 
  onSave, 
  onCancel,
  darkMode 
}: InstagramSaveModalProps) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(title || 'Instagram Reel', instagramUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-sm ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } p-6 shadow-2xl`}>
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Save This Reel
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add a quick title
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            placeholder="What's this about? (optional)"
            rows={2}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all text-sm resize-none ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
            }`}
            autoFocus
          />
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {title.length}/80
          </p>
        </div>

        {/* Quick Suggestions */}
        <div className="mb-6">
          <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Recipe', 'Workout', 'Travel', 'Tutorial'].map(tag => (
              <button
                key={tag}
                onClick={() => setTitle(tag)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
