import React, { useState } from 'react';
import { Instagram, Loader, Edit3, Save, X } from 'lucide-react';

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
  const [title, setTitle] = useState('Instagram Reel');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      await onSave(title, instagramUrl);
    } finally {
      setSaving(false);
    }
  };

  const getReelId = () => {
    const match = instagramUrl.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const reelId = getReelId();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className={`rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } shadow-2xl animate-in slide-in-from-bottom-4 duration-300`}>
        
        {/* Header */}
        <div className={`sticky top-0 p-5 border-b ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Instagram Reel
                </h2>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Give it a title
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Instagram Preview */}
          {reelId ? (
            <div className={`h-40 rounded-2xl flex flex-col items-center justify-center gap-3 ${
              darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'
            }`}>
              <Instagram className="w-12 h-12 text-purple-500" />
              <p className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {reelId}
              </p>
            </div>
          ) : (
            <div className={`h-40 rounded-2xl flex items-center justify-center ${
              darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <Instagram className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>
              <Edit3 className="w-4 h-4" />
              What's this about?
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe this reel..."
              rows={3}
              maxLength={80}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all resize-none text-sm ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              }`}
              autoFocus
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {title.length}/80 characters
            </p>
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Quick tags:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Recipe',
                'Workout',
                'Travel',
                'Product',
                'Funny',
                'Tutorial',
                'Fashion',
                'DIY'
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => setTitle(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
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
        </div>

        {/* Actions */}
        <div className={`sticky bottom-0 p-5 border-t flex gap-3 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              title.trim() && !saving
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
