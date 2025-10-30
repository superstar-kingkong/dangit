import React, { useState, useEffect } from 'react';
import { Instagram, Loader, Edit3, Save } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [embedHtml, setEmbedHtml] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Try to get oEmbed data for preview
    fetchInstagramPreview();
  }, [instagramUrl]);

  const fetchInstagramPreview = async () => {
    setIsLoading(true);
    
    try {
      // Try Instagram oEmbed API
      const oembedUrl = `https://graph.instagram.com/oembed?url=${encodeURIComponent(instagramUrl)}&omitscript=true`;
      
      const response = await fetch(oembedUrl);
      const data = await response.json();
      
      if (data.html) {
        setEmbedHtml(data.html);
        
        // Try to extract a title from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        const captionText = tempDiv.textContent?.substring(0, 100) || '';
        
        if (captionText) {
          setTitle(captionText);
        } else {
          setTitle('Instagram Reel'); // Default
        }
      } else {
        // No preview available, just show default
        setTitle('Instagram Reel');
      }
    } catch (error) {
      console.log('Could not fetch Instagram preview (this is normal)');
      // Just use default title
      setTitle('Instagram Reel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      await onSave(title, instagramUrl);
    } finally {
      setSaving(false);
    }
  };

  // Extract reel ID for thumbnail (Instagram pattern)
  const getReelId = () => {
    const match = instagramUrl.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const reelId = getReelId();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 p-4 border-b ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Save Instagram Reel
              </h2>
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Add a title to remember this later
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Instagram Preview */}
          {isLoading ? (
            <div className={`h-48 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Loader className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : embedHtml ? (
            <div 
              className="instagram-embed rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          ) : reelId ? (
            // Fallback: Show Instagram logo with reel ID
            <div className={`h-48 rounded-xl flex flex-col items-center justify-center gap-3 ${
              darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-pink-50'
            }`}>
              <Instagram className="w-16 h-16 text-purple-500" />
              <p className={`text-sm font-mono ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Reel ID: {reelId}
              </p>
            </div>
          ) : (
            // Ultimate fallback
            <div className={`h-48 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Instagram className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* URL Display */}
          <div className={`p-3 rounded-lg text-xs font-mono break-all ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            {instagramUrl}
          </div>

          {/* Title Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Edit3 className="w-4 h-4" />
              What's this reel about?
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Avocado toast recipe, Gym workout routine, Funny cat video..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              autoFocus
            />
          </div>

          {/* Smart Suggestions */}
          <div className="flex flex-wrap gap-2">
            <p className={`text-xs w-full ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Quick suggestions:
            </p>
            {[
              'Recipe to try',
              'Workout routine',
              'Travel destination',
              'Product recommendation',
              'Funny video',
              'Tutorial'
            ].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setTitle(suggestion)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Why Manual Title */}
          <div className={`p-3 rounded-lg text-xs ${
            darkMode 
              ? 'bg-purple-900/20 border border-purple-800 text-purple-300' 
              : 'bg-purple-50 border border-purple-200 text-purple-700'
          }`}>
            <strong>💡 Why add a title?</strong>
            <p className="mt-1 opacity-80">
              Instagram doesn't let us automatically read captions, so adding your own title helps you find this reel later!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={`sticky bottom-0 p-4 border-t flex gap-3 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all transform active:scale-95 ${
              title.trim() && !saving
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save to DANGIT
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}